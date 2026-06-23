import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('estoques')
    .select('*')
    .order('local')
  if (error) return NextResponse.json({ error }, { status: 500 })
  return NextResponse.json(data)
}
