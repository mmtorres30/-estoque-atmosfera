import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('usuarios')
    .select('id, username, nome, perfil, bloqueado, nome_completo, created_at')
    .order('created_at')
  if (error) return NextResponse.json({ error }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { data, error } = await supabaseAdmin
    .from('usuarios')
    .insert([{ username: body.username, senha: body.senha, nome: body.nome, perfil: body.perfil, nome_completo: body.nome_completo, bloqueado: false }])
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function PUT(req: NextRequest) {
  const body = await req.json()
  const updates: any = { bloqueado: body.bloqueado }
  if (body.senha) updates.senha = body.senha
  if (body.nome) updates.nome = body.nome
  if (body.nome_completo) updates.nome_completo = body.nome_completo
  if (body.perfil) updates.perfil = body.perfil
  const { data, error } = await supabaseAdmin
    .from('usuarios')
    .update(updates)
    .eq('id', body.id)
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json()
  const { error } = await supabaseAdmin.from('usuarios').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
