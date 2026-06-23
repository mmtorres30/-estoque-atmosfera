'use client'
import { useState, useEffect } from 'react'

const LOC_NAMES: Record<string, string> = {
  central: 'Estoque Central', frisa: 'Estoque 1° Andar Frisa',
  terceiro: 'Estoque 3° Andar', barfrisa: 'Bar Frisa',
  barboate: 'Bar Boate', barterceiro: 'Bar 3° Andar', empresa: 'Empresa Fornecedora'
}
const PRODUTOS = ['Água mineral 500ml','Água mineral 1,5L','Refrigerante lata','Refrigerante 600ml','Refrigerante 2L','Barril de chopp 30L','Barril de chopp 50L','Whisky 750ml','Vodka 750ml','Gin 750ml','Energético lata','Suco caixinha','Cerveja lata','Cerveja long neck','Vinho tinto 750ml','Vinho branco 750ml','Espumante 750ml']
const UNIDADES = ['unidade(s)','caixa(s)','fardo(s)','barril(is)','garrafa(s)','lata(s)']

export default function Home() {
  const [usuario, setUsuario] = useState<any>(null)
  const [lgUser, setLgUser] = useState('')
  const [lgPass, setLgPass] = useState('')
  const [aba, setAba] = useState('dashboard')
  const [movimentos, setMovimentos] = useState<any[]>([])
  const [estoques, setEstoques] = useState<any[]>([])
  const [empresas, setEmpresas] = useState<any[]>([])
  const [toast, setToast] = useState('')
  const [toastErr, setToastErr] = useState(false)
  const [form, setForm] = useState<any>({})

  const showToast = (msg: string, err = false) => { setToast(msg); setToastErr(err); setTimeout(() => setToast(''), 3000) }

  const carregar = async () => {
    const [m, e, emp] = await Promise.all([
      fetch('/api/movimentos').then(r => r.json()),
      fetch('/api/estoques').then(r => r.json()),
      fetch('/api/empresas').then(r => r.json()),
    ])
    setMovimentos(Array.isArray(m) ? m : [])
    setEstoques(Array.isArray(e) ? e : [])
    setEmpresas(Array.isArray(emp) ? emp : [])
  }

  useEffect(() => { if (usuario) carregar() }, [usuario])

  const login = async () => {
    const r = await fetch('/api/auth', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: lgUser, senha: lgPass }) })
    const d = await r.json()
    if (!r.ok) { showToast(d.error, true); return }
    setUsuario(d.usuario)
  }

  const canEdit = (scope: string) => usuario?.perfil === 'admin' || usuario?.perfil === scope

  const estLocal = (local: string) => {
    const items: Record<string, number> = {}
    estoques.filter(e => e.local === local).forEach(e => { items[e.produto] = e.quantidade })
    return items
  }

  const totalLocal = (local: string) => estoques.filter(e => e.local === local).reduce((a, e) => a + e.quantidade, 0)

  const registrar = async (tipo: string, dados: any) => {
    const r = await fetch('/api/movimentos', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ tipo, ...dados }) })
    const d = await r.json()
    if (!r.ok) { showToast(d.error || 'Erro ao registrar', true); return false }
    showToast('Registrado com sucesso!')
    carregar()
    setForm({})
    return true
  }

  const cadastrarEmpresa = async () => {
    if (!form.cod_produto || !form.documento || !form.nome) { showToast('Preencha código, documento e nome', true); return }
    const r = await fetch('/api/empresas', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    if (!r.ok) { showToast('Erro ao cadastrar', true); return }
    showToast('Empresa cadastrada!')
    carregar(); setForm({})
  }

  const excluirEmpresa = async (id: string) => {
    await fetch('/api/empresas', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    showToast('Empresa removida'); carregar()
  }

  const f = (k: string, v: any) => setForm((p: any) => ({ ...p, [k]: v }))
  const fmtDt = (dt: string) => new Date(dt).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })

  const navTabs = () => {
    const p = usuario?.perfil
    const tabs = [{ id: 'dashboard', label: '📊 Painel' }]
    if (p === 'admin' || p === 'central') { tabs.push({ id: 'entrada-central', label: '📥 Entrada Central' }); tabs.push({ id: 'saida-central', label: '📤 Saída Central' }) }
    if (p === 'admin' || p === 'frisa') tabs.push({ id: 'est-frisa', label: '📦 1° Frisa' })
    if (p === 'admin' || p === 'terceiro') tabs.push({ id: 'est-terceiro', label: '📦 3° Andar' })
    if (p === 'admin' || p === 'barfrisa') tabs.push({ id: 'bar-barfrisa', label: '🍺 Bar Frisa' })
    if (p === 'admin' || p === 'barboate') tabs.push({ id: 'bar-barboate', label: '🍺 Bar Boate' })
    if (p === 'admin' || p === 'barterceiro') tabs.push({ id: 'bar-barterceiro', label: '🍺 Bar 3° Andar' })
    if (p === 'admin' || p === 'central') tabs.push({ id: 'empresas', label: '🏢 Empresas' })
    tabs.push({ id: 'historico', label: '📋 Histórico' })
    return tabs
  }

  if (!usuario) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f4' }}>
      <div style={{ background: '#fff', borderRadius: 12, padding: 32, width: 360, border: '1px solid #e7e5e4' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ width: 48, height: 48, background: '#1D9E75', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, margin: '0 auto 12px' }}>🏪</div>
          <h1 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>Camarote Atmosfera</h1>
          <p style={{ color: '#78716c', fontSize: 13, margin: '4px 0 0' }}>Sistema de Controle de Estoque</p>
        </div>
        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 12, color: '#78716c', display: 'block', marginBottom: 4 }}>Usuário</label>
          <input value={lgUser} onChange={e => setLgUser(e.target.value)} style={{ width: '100%', height: 36, border: '1px solid #d6d3d1', borderRadius: 8, padding: '0 10px', fontSize: 13 }} placeholder="Digite seu usuário" />
        </div>
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 12, color: '#78716c', display: 'block', marginBottom: 4 }}>Senha</label>
          <input type="password" value={lgPass} onChange={e => setLgPass(e.target.value)} onKeyDown={e => e.key === 'Enter' && login()} style={{ width: '100%', height: 36, border: '1px solid #d6d3d1', borderRadius: 8, padding: '0 10px', fontSize: 13 }} placeholder="Digite sua senha" />
        </div>
        <button onClick={login} style={{ width: '100%', height: 38, background: '#1D9E75', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>Entrar</button>
        <div style={{ marginTop: 20, borderTop: '1px solid #e7e5e4', paddingTop: 14 }}>
          <p style={{ fontSize: 11, color: '#a8a29e', marginBottom: 8 }}>Usuários de demonstração:</p>
          {[['admin','admin123'],['central','central123'],['frisa','frisa123'],['terceiro','terceiro123'],['barfrisa','bar123'],['barboate','bar456'],['barterceiro','bar789']].map(([u,p]) => (
            <span key={u} onClick={() => { setLgUser(u); setLgPass(p) }} style={{ display: 'inline-block', background: '#f0fdf4', color: '#166534', borderRadius: 20, padding: '2px 8px', fontSize: 11, margin: '2px', cursor: 'pointer', border: '1px solid #bbf7d0' }}>{u}</span>
          ))}
        </div>
      </div>
    </div>
  )

  const sInp: any = { width: '100%', height: 36, border: '1px solid #d6d3d1', borderRadius: 8, padding: '0 10px', fontSize: 13, background: '#fff' }
  const sCard: any = { background: '#fff', borderRadius: 12, border: '1px solid #e7e5e4', padding: '16px 20px', marginBottom: 14 }
  const sBtn: any = { height: 36, padding: '0 16px', borderRadius: 8, border: '1px solid #d6d3d1', cursor: 'pointer', fontSize: 13, fontWeight: 500, background: '#fff' }
  const sBtnP: any = { ...sBtn, background: '#1D9E75', color: '#fff', border: 'none' }

  const Badge = ({ tipo }: { tipo: string }) => {
    const cfg: any = { entrada: ['#dcfce7','#166534'], saida: ['#fef9c3','#854d0e'], devolucao: ['#fee2e2','#991b1b'] }
    const [bg, color] = cfg[tipo] || ['#f3f4f6','#374151']
    return <span style={{ background: bg, color, borderRadius: 20, padding: '2px 8px', fontSize: 11, fontWeight: 500 }}>{tipo === 'devolucao' ? 'devolução' : tipo}</span>
  }

  const LocBadge = ({ local }: { local: string }) => (
    <span style={{ background: '#eff6ff', color: '#1d4ed8', borderRadius: 20, padding: '2px 8px', fontSize: 11 }}>{LOC_NAMES[local] || local}</span>
  )

  const TabelaEst = ({ local }: { local: string }) => {
    const items = Object.entries(estLocal(local)).filter(([, v]) => v > 0)
    if (!items.length) return <p style={{ color: '#a8a29e', fontSize: 13, textAlign: 'center', padding: 20 }}>Nenhum produto em estoque</p>
    return <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
      <thead><tr>{['Produto','Quantidade'].map(h => <th key={h} style={{ textAlign: 'left', padding: '6px 8px', fontSize: 11, color: '#78716c', borderBottom: '1px solid #e7e5e4', textTransform: 'uppercase' }}>{h}</th>)}</tr></thead>
      <tbody>{items.map(([p, q]) => <tr key={p}><td style={{ padding: '8px' }}>{p}</td><td style={{ padding: '8px', fontWeight: 600 }}>{q} un.</td></tr>)}</tbody>
    </table>
  }

  const FormEntrada = ({ destino }: { destino: string }) => {
    const ro = !canEdit(destino === 'central' ? 'central' : destino)
    return <div style={sCard}>
      <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 14 }}>📥 Registrar entrada</h3>
      {ro && <div style={{ background: '#fef9c3', border: '1px solid #fde047', borderRadius: 8, padding: '8px 12px', fontSize: 12, color: '#854d0e', marginBottom: 12 }}>Acesso somente leitura</div>}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {destino === 'central' && <>
          <div><label style={{ fontSize: 12, color: '#78716c' }}>Empresa</label><select style={sInp} value={form.empresa_id || ''} onChange={e => f('empresa_id', e.target.value)} disabled={ro}><option value="">Selecione</option>{empresas.map(e => <option key={e.id} value={e.id}>{e.nome}</option>)}</select></div>
          <div><label style={{ fontSize: 12, color: '#78716c' }}>Nº Nota Fiscal</label><input style={sInp} value={form.nf_numero || ''} onChange={e => f('nf_numero', e.target.value)} placeholder="Ex: 123456" disabled={ro} /></div>
          <div><label style={{ fontSize: 12, color: '#78716c' }}>Valor unitário (R$)</label><input type="number" style={sInp} value={form.valor_unitario || ''} onChange={e => { f('valor_unitario', e.target.value); f('valor_total', ((parseFloat(e.target.value)||0)*(parseInt(form.quantidade)||0)).toFixed(2)) }} disabled={ro} /></div>
          <div><label style={{ fontSize: 12, color: '#78716c' }}>Valor total (R$)</label><input type="number" style={sInp} value={form.valor_total || ''} disabled /></div>
        </>}
        <div><label style={{ fontSize: 12, color: '#78716c' }}>Código do produto</label><input style={sInp} value={form.cod_produto || ''} onChange={e => f('cod_produto', e.target.value)} disabled={ro} /></div>
        <div><label style={{ fontSize: 12, color: '#78716c' }}>Produto</label><select style={sInp} value={form.produto || ''} onChange={e => f('produto', e.target.value)} disabled={ro}><option value="">Selecione</option>{PRODUTOS.map(p => <option key={p}>{p}</option>)}</select></div>
        <div><label style={{ fontSize: 12, color: '#78716c' }}>Quantidade</label><input type="number" style={sInp} value={form.quantidade || ''} onChange={e => { f('quantidade', parseInt(e.target.value)); f('valor_total', ((form.valor_unitario||0)*(parseInt(e.target.value)||0)).toFixed(2)) }} disabled={ro} /></div>
        <div><label style={{ fontSize: 12, color: '#78716c' }}>Unidade</label><select style={sInp} value={form.unidade || 'unidade(s)'} onChange={e => f('unidade', e.target.value)} disabled={ro}>{UNIDADES.map(u => <option key={u}>{u}</option>)}</select></div>
        {destino !== 'central' && <div><label style={{ fontSize: 12, color: '#78716c' }}>De qual depósito recebeu</label><select style={sInp} value={form.origem || ''} onChange={e => f('origem', e.target.value)} disabled={ro}><option value="frisa">Estoque 1° Andar Frisa</option><option value="terceiro">Estoque 3° Andar</option></select></div>}
        <div style={{ gridColumn: '1/-1' }}><label style={{ fontSize: 12, color: '#78716c' }}>Observação</label><input style={sInp} value={form.observacao || ''} onChange={e => f('observacao', e.target.value)} disabled={ro} /></div>
      </div>
      {!ro && <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 14, gap: 8 }}>
        <button style={sBtn} onClick={() => setForm({})}>Limpar</button>
        <button style={sBtnP} onClick={() => registrar('entrada', { ...form, origem: destino === 'central' ? 'empresa' : (form.origem || 'frisa'), destino, data: new Date().toISOString() })}>✓ Registrar entrada</button>
      </div>}
    </div>
  }

  const FormSaida = ({ origem, destinos }: { origem: string, destinos: {value:string,label:string}[] }) => {
    const ro = !canEdit(origem)
    return <div style={sCard}>
      <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 14 }}>📤 Registrar saída</h3>
      {ro && <div style={{ background: '#fef9c3', border: '1px solid #fde047', borderRadius: 8, padding: '8px 12px', fontSize: 12, color: '#854d0e', marginBottom: 12 }}>Acesso somente leitura</div>}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div><label style={{ fontSize: 12, color: '#78716c' }}>Código do produto</label><input style={sInp} value={form.cod_produto || ''} onChange={e => f('cod_produto', e.target.value)} disabled={ro} /></div>
        <div><label style={{ fontSize: 12, color: '#78716c' }}>Produto</label><select style={sInp} value={form.produto || ''} onChange={e => f('produto', e.target.value)} disabled={ro}><option value="">Selecione</option>{PRODUTOS.map(p => <option key={p}>{p}</option>)}</select></div>
        <div><label style={{ fontSize: 12, color: '#78716c' }}>Quantidade</label><input type="number" style={sInp} value={form.quantidade || ''} onChange={e => f('quantidade', parseInt(e.target.value))} disabled={ro} /></div>
        <div><label style={{ fontSize: 12, color: '#78716c' }}>Unidade</label><select style={sInp} value={form.unidade || 'unidade(s)'} onChange={e => f('unidade', e.target.value)} disabled={ro}>{UNIDADES.map(u => <option key={u}>{u}</option>)}</select></div>
        <div><label style={{ fontSize: 12, color: '#78716c' }}>Destino</label><select style={sInp} value={form.destino || ''} onChange={e => f('destino', e.target.value)} disabled={ro}><option value="">Selecione</option>{destinos.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}</select></div>
        <div><label style={{ fontSize: 12, color: '#78716c' }}>Responsável</label><input style={sInp} value={form.responsavel || ''} onChange={e => f('responsavel', e.target.value)} disabled={ro} /></div>
        <div style={{ gridColumn: '1/-1' }}><label style={{ fontSize: 12, color: '#78716c' }}>Observação</label><input style={sInp} value={form.observacao || ''} onChange={e => f('observacao', e.target.value)} disabled={ro} /></div>
      </div>
      {!ro && <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 14, gap: 8 }}>
        <button style={sBtn} onClick={() => setForm({})}>Limpar</button>
        <button style={sBtnP} onClick={() => registrar('saida', { ...form, origem, data: new Date().toISOString() })}>✓ Registrar saída</button>
      </div>}
    </div>
  }

  const FormDevolucao = ({ origem }: { origem: string }) => {
    const ro = !canEdit(origem)
    return <div style={{ ...sCard, borderColor: '#fecaca' }}>
      <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 14, color: '#dc2626' }}>🔄 Devolução / Contagem final</h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div><label style={{ fontSize: 12, color: '#78716c' }}>Produto</label><select style={sInp} value={form.dev_produto || ''} onChange={e => f('dev_produto', e.target.value)} disabled={ro}><option value="">Selecione</option>{PRODUTOS.map(p => <option key={p}>{p}</option>)}</select></div>
        <div><label style={{ fontSize: 12, color: '#78716c' }}>Quantidade</label><input type="number" style={sInp} value={form.dev_quantidade || ''} onChange={e => f('dev_quantidade', parseInt(e.target.value))} disabled={ro} /></div>
        <div><label style={{ fontSize: 12, color: '#78716c' }}>Unidade</label><select style={sInp} value={form.dev_unidade || 'unidade(s)'} onChange={e => f('dev_unidade', e.target.value)} disabled={ro}>{UNIDADES.map(u => <option key={u}>{u}</option>)}</select></div>
        <div><label style={{ fontSize: 12, color: '#78716c' }}>Devolver para</label><select style={sInp} value={form.dev_destino || ''} onChange={e => f('dev_destino', e.target.value)} disabled={ro}><option value="">Selecione</option><option value="frisa">Estoque 1° Andar Frisa</option><option value="terceiro">Estoque 3° Andar</option><option value="central">Estoque Central</option></select></div>
        <div style={{ gridColumn: '1/-1' }}><label style={{ fontSize: 12, color: '#78716c' }}>Observação</label><input style={sInp} value={form.dev_obs || ''} onChange={e => f('dev_obs', e.target.value)} disabled={ro} /></div>
      </div>
      {!ro && <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 14 }}>
        <button style={{ ...sBtnP, background: '#dc2626' }} onClick={() => registrar('devolucao', { produto: form.dev_produto, quantidade: form.dev_quantidade, unidade: form.dev_unidade || 'unidade(s)', origem, destino: form.dev_destino, observacao: form.dev_obs, data: new Date().toISOString() })}>🔄 Registrar devolução</button>
      </div>}
    </div>
  }

  const renderAba = () => {
    if (aba === 'dashboard') return <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(130px,1fr))', gap: 10, marginBottom: 14 }}>
        {Object.entries(LOC_NAMES).filter(([k]) => k !== 'empresa').map(([k, nome]) => (
          <div key={k} style={{ background: '#f0fdf4', borderRadius: 10, padding: 12 }}>
            <div style={{ fontSize: 10, color: '#78716c', textTransform: 'uppercase', marginBottom: 3 }}>{nome}</div>
            <div style={{ fontSize: 22, fontWeight: 600 }}>{totalLocal(k)}</div>
            <div style={{ fontSize: 10, color: '#a8a29e' }}>unidades</div>
          </div>
        ))}
      </div>
      <div style={sCard}>
        <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Últimas movimentações</h3>
        {movimentos.length === 0 ? <p style={{ color: '#a8a29e', fontSize: 13, textAlign: 'center', padding: 20 }}>Nenhuma movimentação ainda</p> :
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead><tr>{['Tipo','Data','Produto','Qtd','Origem','Destino'].map(h => <th key={h} style={{ textAlign: 'left', padding: '6px 8px', fontSize: 10, color: '#78716c', borderBottom: '1px solid #e7e5e4', textTransform: 'uppercase' }}>{h}</th>)}</tr></thead>
            <tbody>{movimentos.slice(0, 8).map(m => <tr key={m.id}>
              <td style={{ padding: '7px 8px' }}><Badge tipo={m.tipo} /></td>
              <td style={{ padding: '7px 8px', whiteSpace: 'nowrap' }}>{fmtDt(m.data)}</td>
              <td style={{ padding: '7px 8px' }}>{m.produto}</td>
              <td style={{ padding: '7px 8px' }}>{m.quantidade} {m.unidade}</td>
              <td style={{ padding: '7px 8px' }}><LocBadge local={m.origem} /></td>
              <td style={{ padding: '7px 8px' }}><LocBadge local={m.destino} /></td>
            </tr>)}</tbody>
          </table>}
      </div>
    </>

    if (aba === 'entrada-central') return <><FormEntrada destino="central" /><div style={sCard}><h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Saldo — Estoque Central</h3><TabelaEst local="central" /></div></>
    if (aba === 'saida-central') return <FormSaida origem="central" destinos={[{value:'frisa',label:'Estoque 1° Andar Frisa'},{value:'terceiro',label:'Estoque 3° Andar'}]} />
    if (aba === 'est-frisa') return <><div style={sCard}><h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Saldo — 1° Andar Frisa</h3><TabelaEst local="frisa" /></div><FormSaida origem="frisa" destinos={[{value:'barfrisa',label:'Bar Frisa'},{value:'barboate',label:'Bar Boate'},{value:'barterceiro',label:'Bar 3° Andar'}]} /></>
    if (aba === 'est-terceiro') return <><div style={sCard}><h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Saldo — 3° Andar</h3><TabelaEst local="terceiro" /></div><FormSaida origem="terceiro" destinos={[{value:'barfrisa',label:'Bar Frisa'},{value:'barboate',label:'Bar Boate'},{value:'barterceiro',label:'Bar 3° Andar'}]} /></>

    if (aba.startsWith('bar-')) {
      const key = aba.replace('bar-', '')
      return <><div style={sCard}><h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Saldo — {LOC_NAMES[key]}</h3><TabelaEst local={key} /></div><FormEntrada destino={key} /><FormDevolucao origem={key} /></>
    }

    if (aba === 'empresas') return <>
      {canEdit('central') && <div style={sCard}>
        <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 14 }}>🏢 Cadastrar empresa</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
          {[['cod_produto','Código do produto','Ex: AGU-500'],['documento','CNPJ ou CPF','00.000.000/0000-00'],['nome','Nome da empresa','Razão social'],['telefone','Telefone','(21) 99999-9999'],['email','E-mail','contato@empresa.com'],['produto','Produto fornecido','Ex: Água mineral']].map(([k,l,p]) => (
            <div key={k}><label style={{ fontSize: 12, color: '#78716c' }}>{l}</label><input style={sInp} value={form[k] || ''} onChange={e => f(k, e.target.value)} placeholder={p} /></div>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 14 }}><button style={sBtnP} onClick={cadastrarEmpresa}>✓ Cadastrar</button></div>
      </div>}
      <div style={sCard}>
        <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Empresas cadastradas</h3>
        {empresas.length === 0 ? <p style={{ color: '#a8a29e', fontSize: 13, textAlign: 'center', padding: 20 }}>Nenhuma empresa cadastrada</p> :
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead><tr>{['Cód.','CNPJ/CPF','Nome','Produto','Telefone','E-mail',''].map((h,i) => <th key={i} style={{ textAlign: 'left', padding: '6px 8px', fontSize: 10, color: '#78716c', borderBottom: '1px solid #e7e5e4', textTransform: 'uppercase' }}>{h}</th>)}</tr></thead>
            <tbody>{empresas.map(e => <tr key={e.id}>
              <td style={{ padding: '7px 8px' }}>{e.cod_produto}</td>
              <td style={{ padding: '7px 8px' }}>{e.documento}</td>
              <td style={{ padding: '7px 8px' }}>{e.nome}</td>
              <td style={{ padding: '7px 8px' }}>{e.produto || '—'}</td>
              <td style={{ padding: '7px 8px' }}>{e.telefone || '—'}</td>
              <td style={{ padding: '7px 8px' }}>{e.email || '—'}</td>
              <td style={{ padding: '7px 8px' }}>{canEdit('central') && <button onClick={() => excluirEmpresa(e.id)} style={{ ...sBtn, background: '#fee2e2', color: '#991b1b', border: 'none', padding: '0 10px', height: 28, fontSize: 12 }}>Excluir</button>}</td>
            </tr>)}</tbody>
          </table>}
      </div>
    </>

    if (aba === 'historico') return <div style={sCard}>
      <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>📋 Histórico completo</h3>
      {movimentos.length === 0 ? <p style={{ color: '#a8a29e', fontSize: 13, textAlign: 'center', padding: 20 }}>Nenhuma movimentação</p> :
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead><tr>{['Tipo','Data','Produto','Qtd','Origem','Destino','NF','Obs'].map(h => <th key={h} style={{ textAlign: 'left', padding: '6px 8px', fontSize: 10, color: '#78716c', borderBottom: '1px solid #e7e5e4', textTransform: 'uppercase' }}>{h}</th>)}</tr></thead>
          <tbody>{movimentos.map(m => <tr key={m.id}>
            <td style={{ padding: '7px 8px' }}><Badge tipo={m.tipo} /></td>
            <td style={{ padding: '7px 8px', whiteSpace: 'nowrap' }}>{fmtDt(m.data)}</td>
            <td style={{ padding: '7px 8px' }}>{m.produto}</td>
            <td style={{ padding: '7px 8px' }}>{m.quantidade} {m.unidade}</td>
            <td style={{ padding: '7px 8px' }}><LocBadge local={m.origem} /></td>
            <td style={{ padding: '7px 8px' }}><LocBadge local={m.destino} /></td>
            <td style={{ padding: '7px 8px' }}>{m.nf_numero || '—'}</td>
            <td style={{ padding: '7px 8px', color: '#78716c' }}>{m.observacao || '—'}</td>
          </tr>)}</tbody>
        </table>}
    </div>
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f4', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ background: '#fff', borderBottom: '1px solid #e7e5e4', padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, background: '#1D9E75', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🏪</div>
          <span style={{ fontSize: 15, fontWeight: 600 }}>Camarote Atmosfera</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 12, color: '#78716c', background: '#f5f5f4', padding: '4px 12px', borderRadius: 20 }}>👤 {usuario.nome}</span>
          <button onClick={() => setUsuario(null)} style={{ ...sBtn, fontSize: 12, height: 30, padding: '0 10px' }}>Sair</button>
        </div>
      </div>
      <div style={{ background: '#fff', borderBottom: '1px solid #e7e5e4', padding: '8px 20px', display: 'flex', gap: 4, overflowX: 'auto' }}>
        {navTabs().map(t => <button key={t.id} onClick={() => { setAba(t.id); setForm({}) }} style={{ padding: '6px 12px', fontSize: 12, border: 'none', borderRadius: 8, cursor: 'pointer', whiteSpace: 'nowrap', background: aba === t.id ? '#dcfce7' : 'transparent', color: aba === t.id ? '#166534' : '#78716c', fontWeight: aba === t.id ? 600 : 400 }}>{t.label}</button>)}
      </div>
      <div style={{ padding: '16px 20px', maxWidth: 1100, margin: '0 auto' }}>{renderAba()}</div>
      {toast && <div style={{ position: 'fixed', bottom: 20, right: 20, background: toastErr ? '#dc2626' : '#1D9E75', color: '#fff', padding: '10px 16px', borderRadius: 10, fontSize: 13, zIndex: 999 }}>{toast}</div>}
    </div>
  )
}
