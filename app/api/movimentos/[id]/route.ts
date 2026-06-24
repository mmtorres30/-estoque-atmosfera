import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

async function ajustarEstoque(local: string, produto: string, delta: number) {
  if (!local || !produto || local === 'empresa') return
  const { data } = await supabaseAdmin.from('estoques').select('quantidade').eq('local', local).eq('produto', produto).single()
  const atual = data?.quantidade || 0
  const nova = Math.max(0, atual + delta)
  await supabaseAdmin.from('estoques').upsert({ local, produto, quantidade: nova, updated_at: new Date().toISOString() }, { onConflict: 'local,produto' })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  // Buscar o movimento antes de deletar para reverter estoque
  const { data: mov } = await supabaseAdmin.from('movimentos').select('*').eq('id', id).single()

  if (mov) {
    if (mov.tipo === 'entrada') {
      // Reverter entrada: tirar do destino
      await ajustarEstoque(mov.destino, mov.produto, -mov.quantidade)
    } else if (mov.tipo === 'saida') {
      // Reverter saída: devolver à origem
      await ajustarEstoque(mov.origem, mov.produto, mov.quantidade)
    } else if (mov.tipo === 'transferencia') {
      // Reverter transferência: devolver à origem e tirar do destino
      await ajustarEstoque(mov.origem, mov.produto, mov.quantidade)
      await ajustarEstoque(mov.destino, mov.produto, -mov.quantidade)
    } else if (mov.tipo === 'devolucao') {
      // Reverter devolução: tirar do destino
      await ajustarEstoque(mov.destino, mov.produto, -mov.quantidade)
    }
  }

  const { error } = await supabaseAdmin.from('movimentos').delete().eq('id', id)
  if (error) return NextResponse.json({ error }, { status: 500 })
  return NextResponse.json({ success: true })
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const { data, error } = await supabaseAdmin
    .from('movimentos')
    .update({
      tipo: body.tipo,
      data: body.data,
      produto: body.produto,
      quantidade: body.quantidade,
      unidade: body.unidade,
      origem: body.origem,
      destino: body.destino,
      nf_numero: body.nf_numero,
      observacao: body.observacao,
    })
    .eq('id', id)
    .select()
    .single()
  if (error) return NextResponse.json({ error }, { status: 500 })
  return NextResponse.json(data)
}
