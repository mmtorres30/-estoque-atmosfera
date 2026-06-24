import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  const { data, error } = await supabaseAdmin.from('estoques').select('*').order('local').order('produto')
  if (error) return NextResponse.json({ error }, { status: 500 })
  return NextResponse.json(data)
}

export async function PUT(req: NextRequest) {
  const body = await req.json()
  const { local, produto, quantidade } = body
  if (!local || !produto || quantidade === undefined) return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 })
  const { data, error } = await supabaseAdmin
    .from('estoques')
    .update({ quantidade, updated_at: new Date().toISOString() })
    .eq('local', local)
    .eq('produto', produto)
    .select()
    .single()
  if (error) return NextResponse.json({ error }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(req: NextRequest) {
  const { local, produto } = await req.json()
  if (!local || !produto) return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 })

  // Excluir todos os movimentos relacionados ao produto neste local
  await supabaseAdmin
    .from('movimentos')
    .delete()
    .eq('produto', produto)
    .or(`origem.eq.${local},destino.eq.${local}`)

  // Excluir o registro do estoque
  const { error } = await supabaseAdmin
    .from('estoques')
    .delete()
    .eq('local', local)
    .eq('produto', produto)

  if (error) return NextResponse.json({ error }, { status: 500 })
  return NextResponse.json({ success: true })
}
