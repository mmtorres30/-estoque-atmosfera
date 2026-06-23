import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('movimentos')
    .select('*, empresas(nome)')
    .order('created_at', { ascending: false })
    .limit(200)
  if (error) return NextResponse.json({ error }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { produto, quantidade, origem, destino } = body

  if (origem !== 'empresa') {
    const { data: orig } = await supabaseAdmin
      .from('estoques')
      .select('quantidade')
      .eq('local', origem)
      .eq('produto', produto)
      .single()
    if (!orig || orig.quantidade < quantidade)
      return NextResponse.json({ error: 'Estoque insuficiente' }, { status: 400 })
    await supabaseAdmin.from('estoques')
      .upsert({ local: origem, produto, quantidade: orig.quantidade - quantidade }, { onConflict: 'local,produto' })
  }

  const { data: dest } = await supabaseAdmin
    .from('estoques')
    .select('quantidade')
    .eq('local', destino)
    .eq('produto', produto)
    .single()
  const qtdAtual = dest?.quantidade || 0
  await supabaseAdmin.from('estoques')
    .upsert({ local: destino, produto, quantidade: qtdAtual + quantidade }, { onConflict: 'local,produto' })

  const { data, error } = await supabaseAdmin.from('movimentos').insert([body]).select().single()
  if (error) return NextResponse.json({ error }, { status: 500 })
  return NextResponse.json(data)
}
