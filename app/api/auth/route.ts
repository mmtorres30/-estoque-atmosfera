import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const { username, senha } = await req.json()
  const { data, error } = await supabaseAdmin
    .from('usuarios')
    .select('*')
    .eq('username', username)
    .eq('senha', senha)
    .single()
  if (error || !data) return NextResponse.json({ error: 'Usuário ou senha incorretos' }, { status: 401 })
  if (data.bloqueado) return NextResponse.json({ error: 'Usuário bloqueado. Entre em contato com o administrador.' }, { status: 403 })
  return NextResponse.json({ usuario: data })
}
