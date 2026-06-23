'use client'
import { useState, useEffect } from 'react'
const LOC:Record<string,string>={central:'Estoque Central',frisa:'1° Andar Frisa',terceiro:'3° Andar',barfrisa:'Bar Frisa',barboate:'Bar Boate',barterceiro:'Bar 3° Andar',empresa:'Fornecedora'}
const PRODS=['Água mineral 500ml','Água mineral 1,5L','Refrigerante lata','Refrigerante 600ml','Refrigerante 2L','Barril de chopp 30L','Barril de chopp 50L','Whisky 750ml','Vodka 750ml','Gin 750ml','Energético lata','Suco caixinha','Cerveja lata','Cerveja long neck','Vinho tinto 750ml','Vinho branco 750ml','Espumante 750ml']
const UNIDS=['unidade(s)','caixa(s)','fardo(s)','barril(is)','garrafa(s)','lata(s)']
const G="#C9A84C",G2="#F0D080",G3="#8B6914",BG="#0a0800",BG2="#110e02",BG3="#1a1608",BOR="#2e2810"
export default function App(){
const [user,setUser]=useState<any>(null)
const [lu,setLu]=useState(''),[lp,setLp]=useState('')
const [aba,setAba]=useState('dashboard')
const [movs,setMovs]=useState<any[]>([])
const [ests,setEsts]=useState<any[]>([])
const [emps,setEmps]=useState<any[]>([])
const [toast,setToast]=useState(''),[toastE,setToastE]=useState(false)
const [form,setForm]=useState<any>({})
const showT=(m:string,e=false)=>{setToast(m);setToastE(e);setTimeout(()=>setToast(''),3000)}
const load=async()=>{
const[m,e,em]=await Promise.all([fetch('/api/movimentos').then(r=>r.json()),fetch('/api/estoques').then(r=>r.json()),fetch('/api/empresas').then(r=>r.json())])
setMovs(Array.isArray(m)?m:[]);setEsts(Array.isArray(e)?e:[]);setEmps(Array.isArray(em)?em:[])
}
useEffect(()=>{if(user)load()},[user])
const login=async()=>{
const r=await fetch('/api/auth',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:lu,senha:lp})})
const d=await r.json();if(!r.ok){showT(d.error,true);return};setUser(d.usuario)
}
const canEdit=(s:string)=>user?.perfil==='admin'||user?.perfil===s
const estLoc=(loc:string)=>{const o:Record<string,number>={};ests.filter(e=>e.local===loc).forEach(e=>{o[e.produto]=e.quantidade});return o}
const totLoc=(loc:string)=>ests.filter(e=>e.local===loc).reduce((a,e)=>a+e.quantidade,0)
const reg=async(tipo:string,dados:any)=>{
const r=await fetch('/api/movimentos',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({tipo,...dados})})
const d=await r.json();if(!r.ok){showT(d.error||'Erro',true);return false}
showT('Registrado!');load();setForm({});return true
}
const cadEmp=async()=>{
if(!form.cod_produto||!form.documento||!form.nome){showT('Preencha os campos obrigatórios',true);return}
const r=await fetch('/api/empresas',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(form)})
if(!r.ok){showT('Erro',true);return};showT('Empresa cadastrada!');load();setForm({})
}
const delEmp=async(id:string)=>{await fetch('/api/empresas',{method:'DELETE',headers:{'Content-Type':'application/json'},body:JSON.stringify({id})});showT('Removida');load()}
const f=(k:string,v:any)=>setForm((p:any)=>({...p,[k]:v}))
const fdt=(dt:string)=>new Date(dt).toLocaleString('pt-BR',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'})
const sI:any={width:'100%',height:38,border:`1px solid ${BOR}`,borderRadius:6,padding:'0 12px',fontSize:13,background:BG2,color:G2,outline:'none'}
const sC:any={background:BG3,borderRadius:10,border:`1px solid ${BOR}`,padding:'20px 24px',marginBottom:16}
const sB:any={height:36,padding:'0 18px',borderRadius:6,border:`1px solid #3a3010`,cursor:'pointer',fontSize:12,fontWeight:600,background:BG2,color:G,letterSpacing:1}
const sBP:any={...sB,background:`linear-gradient(135deg,${G3},${G})`,color:'#0a0800',border:'none'}
const Bdg=({tipo}:{tipo:string})=>{
const c=tipo==='entrada'?['#0d2010','#4ade80']:tipo==='saida'?['#1a1200',G]:['#1a1200','#a0a0a0']
return <span style={{background:c[0],color:c[1],border:`1px solid ${c[1]}33`,borderRadius:20,padding:'2px 10px',fontSize:11,fontWeight:600}}>{tipo==='devolucao'?'devolução':tipo}</span>
}
const LBdg=({local}:{local:string})=><span style={{background:'#1a1200',color:G,border:`1px solid ${BOR}`,borderRadius:20,padding:'2px 10px',fontSize:11}}>{LOC[local]||local}</span>
const TH=(h:string)=><th style={{textAlign:'left',padding:'8px 12px',fontSize:10,color:G,borderBottom:`1px solid ${BOR}`,textTransform:'uppercase',letterSpacing:1.2}}>{h}</th>
const TD=({v,style}:{v:any,style?:any})=><td style={{padding:'9px 12px',color:G2,borderBottom:`1px solid #1a1600`,fontSize:13,...style}}>{v}</td>
const TblEst=({loc}:{loc:string})=>{
const items=Object.entries(estLoc(loc)).filter(([,v])=>v>0)
if(!items.length)return <p style={{color:'#5a4a20',fontSize:13,textAlign:'center',padding:24}}>Nenhum produto em estoque</p>
return <table style={{width:'100%',borderCollapse:'collapse'}}><thead><tr>{['Produto','Quantidade'].map(h=><th key={h} style={{textAlign:"left",padding:"8px 12px",fontSize:10,color:"#C9A84C",borderBottom:"1px solid #2e2810",textTransform:"uppercase",letterSpacing:1.2}}>{h}</th>)}</tr></thead><tbody>{items.map(([p,q])=><tr key={p}><TD v={p}/><TD v={<strong style={{color:G2}}>{q} un.</strong>}/></tr>)}</tbody></table>
}
const navItems=[
{id:'dashboard',icon:'⊞',label:'Painel'},
...(user?.perfil==='admin'||user?.perfil==='central'?[{id:'entrada-central',icon:'↓',label:'Entrada Central'},{id:'saida-central',icon:'↑',label:'Saída Central'}]:[]),
...(user?.perfil==='admin'||user?.perfil==='frisa'?[{id:'est-frisa',icon:'▣',label:'1° Frisa'}]:[]),
...(user?.perfil==='admin'||user?.perfil==='terceiro'?[{id:'est-terceiro',icon:'▣',label:'3° Andar'}]:[]),
...(user?.perfil==='admin'||user?.perfil==='barfrisa'?[{id:'bar-barfrisa',icon:'◈',label:'Bar Frisa'}]:[]),
...(user?.perfil==='admin'||user?.perfil==='barboate'?[{id:'bar-barboate',icon:'◈',label:'Bar Boate'}]:[]),
...(user?.perfil==='admin'||user?.perfil==='barterceiro'?[{id:'bar-barterceiro',icon:'◈',label:'Bar 3° Andar'}]:[]),
...(user?.perfil==='admin'||user?.perfil==='central'?[{id:'empresas',icon:'◉',label:'Empresas'}]:[]),
{id:'historico',icon:'≡',label:'Histórico'},
]
const FE=({dest}:{dest:string})=>{
const ro=!canEdit(dest==='central'?'central':dest)
return <div style={sC}>
<p style={{fontSize:12,fontWeight:700,color:G,letterSpacing:1.5,marginBottom:16}}>↓ REGISTRAR ENTRADA</p>
{ro&&<div style={{background:'#1a1200',border:`1px solid ${BOR}`,borderRadius:6,padding:'8px 12px',fontSize:12,color:G,marginBottom:12}}>Acesso somente leitura</div>}
<div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
{dest==='central'&&<><div><label style={{fontSize:10,color:G,display:'block',marginBottom:4,letterSpacing:1}}>EMPRESA</label><select style={sI} value={form.empresa_id||''} onChange={e=>f('empresa_id',e.target.value)} disabled={ro}><option value="">Selecione</option>{emps.map(e=><option key={e.id} value={e.id}>{e.nome}</option>)}</select></div>
<div><label style={{fontSize:10,color:G,display:'block',marginBottom:4,letterSpacing:1}}>Nº NOTA FISCAL</label><input style={sI} value={form.nf_numero||''} onChange={e=>f('nf_numero',e.target.value)} placeholder="Ex: 123456" disabled={ro}/></div>
<div><label style={{fontSize:10,color:G,display:'block',marginBottom:4,letterSpacing:1}}>VALOR UNITÁRIO (R$)</label><input type="number" style={sI} value={form.valor_unitario||''} onChange={e=>{f('valor_unitario',e.target.value);f('valor_total',((parseFloat(e.target.value)||0)*(parseInt(form.quantidade)||0)).toFixed(2))}} disabled={ro}/></div>
<div><label style={{fontSize:10,color:G,display:'block',marginBottom:4,letterSpacing:1}}>VALOR TOTAL (R$)</label><input type="number" style={sI} value={form.valor_total||''} disabled/></div></>}
<div><label style={{fontSize:10,color:G,display:'block',marginBottom:4,letterSpacing:1}}>CÓDIGO</label><input style={sI} value={form.cod_produto||''} onChange={e=>f('cod_produto',e.target.value)} disabled={ro}/></div>
<div><label style={{fontSize:10,color:G,display:'block',marginBottom:4,letterSpacing:1}}>PRODUTO</label><select style={sI} value={form.produto||''} onChange={e=>f('produto',e.target.value)} disabled={ro}><option value="">Selecione</option>{PRODS.map(p=><option key={p}>{p}</option>)}</select></div>
<div><label style={{fontSize:10,color:G,display:'block',marginBottom:4,letterSpacing:1}}>QUANTIDADE</label><input type="number" style={sI} value={form.quantidade||''} onChange={e=>{f('quantidade',parseInt(e.target.value));f('valor_total',((form.valor_unitario||0)*(parseInt(e.target.value)||0)).toFixed(2))}} disabled={ro}/></div>
<div><label style={{fontSize:10,color:G,display:'block',marginBottom:4,letterSpacing:1}}>UNIDADE</label><select style={sI} value={form.unidade||'unidade(s)'} onChange={e=>f('unidade',e.target.value)} disabled={ro}>{UNIDS.map(u=><option key={u}>{u}</option>)}</select></div>
{dest!=='central'&&<div><label style={{fontSize:10,color:G,display:'block',marginBottom:4,letterSpacing:1}}>DE QUAL DEPÓSITO</label><select style={sI} value={form.origem||'frisa'} onChange={e=>f('origem',e.target.value)} disabled={ro}><option value="frisa">1° Andar Frisa</option><option value="terceiro">3° Andar</option></select></div>}
<div style={{gridColumn:'1/-1'}}><label style={{fontSize:10,color:G,display:'block',marginBottom:4,letterSpacing:1}}>OBSERVAÇÃO</label><input style={sI} value={form.observacao||''} onChange={e=>f('observacao',e.target.value)} disabled={ro}/></div>
</div>
{!ro&&<div style={{display:'flex',justifyContent:'flex-end',marginTop:16,gap:10}}>
<button style={sB} onClick={()=>setForm({})}>Limpar</button>
<button style={sBP} onClick={()=>reg('entrada',{...form,origem:dest==='central'?'empresa':(form.origem||'frisa'),destino:dest,data:new Date().toISOString()})}>✓ Registrar Entrada</button>
</div>}
</div>
}
const FS=({orig,dests}:{orig:string,dests:{value:string,label:string}[]})=>{
const ro=!canEdit(orig)
return <div style={sC}>
<p style={{fontSize:12,fontWeight:700,color:G,letterSpacing:1.5,marginBottom:16}}>↑ REGISTRAR SAÍDA</p>
{ro&&<div style={{background:'#1a1200',border:`1px solid ${BOR}`,borderRadius:6,padding:'8px 12px',fontSize:12,color:G,marginBottom:12}}>Acesso somente leitura</div>}
<div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
<div><label style={{fontSize:10,color:G,display:'block',marginBottom:4,letterSpacing:1}}>CÓDIGO</label><input style={sI} value={form.cod_produto||''} onChange={e=>f('cod_produto',e.target.value)} disabled={ro}/></div>
<div><label style={{fontSize:10,color:G,display:'block',marginBottom:4,letterSpacing:1}}>PRODUTO</label><select style={sI} value={form.produto||''} onChange={e=>f('produto',e.target.value)} disabled={ro}><option value="">Selecione</option>{PRODS.map(p=><option key={p}>{p}</option>)}</select></div>
<div><label style={{fontSize:10,color:G,display:'block',marginBottom:4,letterSpacing:1}}>QUANTIDADE</label><input type="number" style={sI} value={form.quantidade||''} onChange={e=>f('quantidade',parseInt(e.target.value))} disabled={ro}/></div>
<div><label style={{fontSize:10,color:G,display:'block',marginBottom:4,letterSpacing:1}}>UNIDADE</label><select style={sI} value={form.unidade||'unidade(s)'} onChange={e=>f('unidade',e.target.value)} disabled={ro}>{UNIDS.map(u=><option key={u}>{u}</option>)}</select></div>
<div><label style={{fontSize:10,color:G,display:'block',marginBottom:4,letterSpacing:1}}>DESTINO</label><select style={sI} value={form.destino||''} onChange={e=>f('destino',e.target.value)} disabled={ro}><option value="">Selecione</option>{dests.map(d=><option key={d.value} value={d.value}>{d.label}</option>)}</select></div>
<div><label style={{fontSize:10,color:G,display:'block',marginBottom:4,letterSpacing:1}}>RESPONSÁVEL</label><input style={sI} value={form.responsavel||''} onChange={e=>f('responsavel',e.target.value)} disabled={ro}/></div>
<div style={{gridColumn:'1/-1'}}><label style={{fontSize:10,color:G,display:'block',marginBottom:4,letterSpacing:1}}>OBSERVAÇÃO</label><input style={sI} value={form.observacao||''} onChange={e=>f('observacao',e.target.value)} disabled={ro}/></div>
</div>
{!ro&&<div style={{display:'flex',justifyContent:'flex-end',marginTop:16,gap:10}}>
<button style={sB} onClick={()=>setForm({})}>Limpar</button>
<button style={sBP} onClick={()=>reg('saida',{...form,origem:orig,data:new Date().toISOString()})}>✓ Registrar Saída</button>
</div>}
</div>
}
const FD=({orig}:{orig:string})=>{
const ro=!canEdit(orig)
return <div style={{...sC,border:`1px solid #2a2a20`}}>
<p style={{fontSize:12,fontWeight:700,color:G,letterSpacing:1.5,marginBottom:16}}>↺ DEVOLUÇÃO / CONTAGEM FINAL</p>
<div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
<div><label style={{fontSize:10,color:G,display:'block',marginBottom:4,letterSpacing:1}}>PRODUTO</label><select style={sI} value={form.dev_produto||''} onChange={e=>f('dev_produto',e.target.value)} disabled={ro}><option value="">Selecione</option>{PRODS.map(p=><option key={p}>{p}</option>)}</select></div>
<div><label style={{fontSize:10,color:G,display:'block',marginBottom:4,letterSpacing:1}}>QUANTIDADE</label><input type="number" style={sI} value={form.dev_quantidade||''} onChange={e=>f('dev_quantidade',parseInt(e.target.value))} disabled={ro}/></div>
<div><label style={{fontSize:10,color:G,display:'block',marginBottom:4,letterSpacing:1}}>UNIDADE</label><select style={sI} value={form.dev_unidade||'unidade(s)'} onChange={e=>f('dev_unidade',e.target.value)} disabled={ro}>{UNIDS.map(u=><option key={u}>{u}</option>)}</select></div>
<div><label style={{fontSize:10,color:G,display:'block',marginBottom:4,letterSpacing:1}}>DEVOLVER PARA</label><select style={sI} value={form.dev_destino||''} onChange={e=>f('dev_destino',e.target.value)} disabled={ro}><option value="">Selecione</option><option value="frisa">1° Andar Frisa</option><option value="terceiro">3° Andar</option><option value="central">Estoque Central</option></select></div>
<div style={{gridColumn:'1/-1'}}><label style={{fontSize:10,color:G,display:'block',marginBottom:4,letterSpacing:1}}>OBSERVAÇÃO</label><input style={sI} value={form.dev_obs||''} onChange={e=>f('dev_obs',e.target.value)} disabled={ro}/></div>
</div>
{!ro&&<div style={{display:'flex',justifyContent:'flex-end',marginTop:16}}>
<button style={sBP} onClick={()=>reg('devolucao',{produto:form.dev_produto,quantidade:form.dev_quantidade,unidade:form.dev_unidade||'unidade(s)',origem:orig,destino:form.dev_destino,observacao:form.dev_obs,data:new Date().toISOString()})}>↺ Registrar Devolução</button>
</div>}
</div>
}
const renderAba=()=>{
if(aba==='dashboard')return <>
<div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))',gap:12,marginBottom:16}}>
{Object.entries(LOC).filter(([k])=>k!=='empresa').map(([k,nome])=>(
<div key={k} style={{background:BG3,border:`1px solid ${BOR}`,borderRadius:10,padding:'18px 16px'}}>
<div style={{fontSize:10,color:'#6a5a30',textTransform:'uppercase',letterSpacing:1,marginBottom:8}}>{nome}</div>
<div style={{fontSize:32,fontWeight:700,color:G2,letterSpacing:-1}}>{totLoc(k)}</div>
<div style={{fontSize:10,color:'#4a3a18',marginTop:2}}>unidades em estoque</div>
</div>
))}
</div>
<div style={sC}>
<p style={{fontSize:11,fontWeight:700,color:G,letterSpacing:1.5,marginBottom:14}}>ÚLTIMAS MOVIMENTAÇÕES</p>
{movs.length===0?<p style={{color:'#5a4a20',fontSize:13,textAlign:'center',padding:24}}>Nenhuma movimentação ainda</p>:
<div style={{overflowX:'auto'}}><table style={{width:'100%',borderCollapse:'collapse'}}>
<thead><tr>{['Tipo','Data','Produto','Qtd','Origem','Destino'].map(h=><th key={h} style={{textAlign:"left",padding:"8px 12px",fontSize:10,color:"#C9A84C",borderBottom:"1px solid #2e2810",textTransform:"uppercase",letterSpacing:1.2}}>{h}</th>)}</tr></thead>
<tbody>{movs.slice(0,8).map(m=><tr key={m.id}>
<TD v={<Bdg tipo={m.tipo}/>}/>
<TD v={fdt(m.data)} style={{whiteSpace:'nowrap',fontSize:11}}/>
<TD v={m.produto}/><TD v={`${m.quantidade} ${m.unidade}`}/>
<TD v={<LBdg local={m.origem}/>}/><TD v={<LBdg local={m.destino}/>}/>
</tr>)}</tbody>
</table></div>}
</div>
</>
if(aba==='entrada-central')return <><FE dest="central"/><div style={sC}><p style={{fontSize:11,fontWeight:700,color:G,letterSpacing:1.5,marginBottom:14}}>SALDO — ESTOQUE CENTRAL</p><TblEst loc="central"/></div></>
if(aba==='saida-central')return <FS orig="central" dests={[{value:'frisa',label:'1° Andar Frisa'},{value:'terceiro',label:'3° Andar'}]}/>
if(aba==='est-frisa')return <><div style={sC}><p style={{fontSize:11,fontWeight:700,color:G,letterSpacing:1.5,marginBottom:14}}>SALDO — 1° ANDAR FRISA</p><TblEst loc="frisa"/></div><FS orig="frisa" dests={[{value:'barfrisa',label:'Bar Frisa'},{value:'barboate',label:'Bar Boate'},{value:'barterceiro',label:'Bar 3° Andar'}]}/></>
if(aba==='est-terceiro')return <><div style={sC}><p style={{fontSize:11,fontWeight:700,color:G,letterSpacing:1.5,marginBottom:14}}>SALDO — 3° ANDAR</p><TblEst loc="terceiro"/></div><FS orig="terceiro" dests={[{value:'barfrisa',label:'Bar Frisa'},{value:'barboate',label:'Bar Boate'},{value:'barterceiro',label:'Bar 3° Andar'}]}/></>
if(aba.startsWith('bar-')){const k=aba.replace('bar-','');return <><div style={sC}><p style={{fontSize:11,fontWeight:700,color:G,letterSpacing:1.5,marginBottom:14}}>SALDO — {LOC[k]?.toUpperCase()}</p><TblEst loc={k}/></div><FE dest={k}/><FD orig={k}/></>}
if(aba==='empresas')return <>
{canEdit('central')&&<div style={sC}>
<p style={{fontSize:11,fontWeight:700,color:G,letterSpacing:1.5,marginBottom:16}}>CADASTRAR EMPRESA</p>
<div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:14}}>
{[['cod_produto','CÓDIGO','Ex: AGU-500'],['documento','CNPJ/CPF','00.000.000/0000-00'],['nome','NOME','Razão social'],['telefone','TELEFONE','(21) 99999-9999'],['email','E-MAIL','email@empresa.com'],['produto','PRODUTO','Ex: Água mineral']].map(([k,l,p])=>(
<div key={k}><label style={{fontSize:10,color:G,display:'block',marginBottom:4,letterSpacing:1}}>{l}</label><input style={sI} value={form[k]||''} onChange={e=>f(k,e.target.value)} placeholder={p}/></div>
))}
</div>
<div style={{display:'flex',justifyContent:'flex-end',marginTop:16}}><button style={sBP} onClick={cadEmp}>✓ Cadastrar</button></div>
</div>}
<div style={sC}>
<p style={{fontSize:11,fontWeight:700,color:G,letterSpacing:1.5,marginBottom:14}}>EMPRESAS CADASTRADAS</p>
{emps.length===0?<p style={{color:'#5a4a20',fontSize:13,textAlign:'center',padding:24}}>Nenhuma empresa</p>:
<table style={{width:'100%',borderCollapse:'collapse'}}>
<thead><tr>{['Cód.','CNPJ/CPF','Nome','Produto','Telefone','E-mail',''].map((h,i)=><th key={i} style={{textAlign:"left",padding:"8px 12px",fontSize:10,color:"#C9A84C",borderBottom:"1px solid #2e2810",textTransform:"uppercase",letterSpacing:1.2}}>{h}</th>)}</tr></thead>
<tbody>{emps.map(e=><tr key={e.id}>
{[e.cod_produto,e.documento,e.nome,e.produto||'—',e.telefone||'—',e.email||'—'].map((v,i)=><TD key={i} v={v}/>)}
<TD v={canEdit('central')&&<button onClick={()=>delEmp(e.id)} style={{...sB,height:26,padding:'0 10px',fontSize:11}}>Excluir</button>}/>
</tr>)}</tbody>
</table>}
</div>
</>
if(aba==='historico')return <div style={sC}>
<p style={{fontSize:11,fontWeight:700,color:G,letterSpacing:1.5,marginBottom:14}}>HISTÓRICO COMPLETO</p>
{movs.length===0?<p style={{color:'#5a4a20',fontSize:13,textAlign:'center',padding:24}}>Nenhuma movimentação</p>:
<div style={{overflowX:'auto'}}><table style={{width:'100%',borderCollapse:'collapse'}}>
<thead><tr>{['Tipo','Data','Produto','Qtd','Origem','Destino','NF','Obs'].map(h=><th key={h} style={{textAlign:"left",padding:"8px 12px",fontSize:10,color:"#C9A84C",borderBottom:"1px solid #2e2810",textTransform:"uppercase",letterSpacing:1.2}}>{h}</th>)}</tr></thead>
<tbody>{movs.map(m=><tr key={m.id}>
<TD v={<Bdg tipo={m.tipo}/>}/><TD v={fdt(m.data)} style={{whiteSpace:'nowrap',fontSize:11}}/>
<TD v={m.produto}/><TD v={`${m.quantidade} ${m.unidade}`}/>
<TD v={<LBdg local={m.origem}/>}/><TD v={<LBdg local={m.destino}/>}/>
<TD v={m.nf_numero||'—'}/><TD v={m.observacao||'—'} style={{color:'#6a5a30',fontSize:11}}/>
</tr>)}</tbody>
</table></div>}
</div>
}
if(!user)return(
<div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:`radial-gradient(ellipse at center,#1a1200 0%,${BG} 70%)`}}>
<div style={{width:400,padding:'44px 40px',background:`linear-gradient(160deg,${BG3},${BG2})`,border:`1px solid ${BOR}`,borderRadius:16,boxShadow:`0 0 80px #C9A84C10`}}>
<div style={{textAlign:'center',marginBottom:36}}>
<img src="/logo.png" alt="Camarote Atmosfera" style={{width:240,marginBottom:12}}/>
<div style={{width:80,height:1,background:`linear-gradient(90deg,transparent,${G},transparent)`,margin:'0 auto 14px'}}/>
<p style={{color:'#6a5a30',fontSize:11,letterSpacing:3,textTransform:'uppercase'}}>Controle de Estoque</p>
</div>
<div style={{marginBottom:14}}>
<label style={{fontSize:10,color:G,display:'block',marginBottom:5,letterSpacing:2}}>USUÁRIO</label>
<input value={lu} onChange={e=>setLu(e.target.value)} style={{...sI,height:42}} placeholder="Digite seu usuário"/>
</div>
<div style={{marginBottom:28}}>
<label style={{fontSize:10,color:G,display:'block',marginBottom:5,letterSpacing:2}}>SENHA</label>
<input type="password" value={lp} onChange={e=>setLp(e.target.value)} onKeyDown={e=>e.key==='Enter'&&login()} style={{...sI,height:42}} placeholder="Digite sua senha"/>
</div>
<button onClick={login} style={{width:'100%',height:46,background:`linear-gradient(135deg,${G3},${G},${G3})`,color:'#0a0800',border:'none',borderRadius:8,fontSize:13,fontWeight:800,cursor:'pointer',letterSpacing:3,textTransform:'uppercase'}}>ENTRAR</button>
<div style={{marginTop:24,borderTop:`1px solid ${BOR}`,paddingTop:16}}>
<p style={{fontSize:10,color:'#4a3a18',marginBottom:8,letterSpacing:1}}>ACESSO RÁPIDO:</p>
<div style={{display:'flex',flexWrap:'wrap',gap:5}}>
{[['admin','admin123'],['central','central123'],['frisa','frisa123'],['terceiro','terceiro123'],['barfrisa','bar123'],['barboate','bar456'],['barterceiro','bar789']].map(([u,p])=>(
<span key={u} onClick={()=>{setLu(u);setLp(p)}} style={{background:BG2,color:G,border:`1px solid ${BOR}`,borderRadius:20,padding:'3px 12px',fontSize:11,cursor:'pointer'}}>{u}</span>
))}
</div>
</div>
</div>
</div>
)
return(
<div style={{display:'flex',minHeight:'100vh',background:BG,fontFamily:'system-ui,sans-serif'}}>
<div style={{width:220,background:BG2,borderRight:`1px solid ${BOR}`,display:'flex',flexDirection:'column',flexShrink:0}}>
<div style={{padding:'24px 16px 20px',borderBottom:`1px solid ${BOR}`,textAlign:'center'}}>
<img src="/logo.png" alt="Atmosfera" style={{width:220,marginBottom:4,display:"block",margin:"0 auto 4px",paddingLeft:"12%"}}/>
</div>
<div style={{flex:1,padding:'12px 8px',overflowY:'auto'}}>
{navItems.map(n=>(
<button key={n.id} onClick={()=>{setAba(n.id);setForm({})}} style={{width:'100%',display:'flex',alignItems:'center',gap:10,padding:'10px 12px',marginBottom:2,border:'none',borderRadius:8,cursor:'pointer',background:aba===n.id?`linear-gradient(135deg,${G3}33,${G}22)`:'transparent',color:aba===n.id?G2:'#5a4a20',fontWeight:aba===n.id?700:400,fontSize:13,textAlign:'left',borderLeft:aba===n.id?`2px solid ${G}`:'2px solid transparent',transition:'all 0.15s'}}>
<span style={{fontSize:16,width:20,textAlign:'center'}}>{n.icon}</span>{n.label}
</button>
))}
</div>
<div style={{padding:'16px',borderTop:`1px solid ${BOR}`}}>
<div style={{fontSize:11,color:'#5a4a20',marginBottom:8,letterSpacing:1}}>{user.nome.toUpperCase()}</div>
<button onClick={()=>setUser(null)} style={{...sB,width:'100%',justifyContent:'center',fontSize:11,letterSpacing:1}}>SAIR</button>
</div>
</div>
<div style={{flex:1,overflow:'auto'}}>
<div style={{padding:'24px',maxWidth:1100,margin:'0 auto'}}>
<p style={{fontSize:11,color:'#4a3a18',letterSpacing:2,textTransform:'uppercase',marginBottom:20}}>{navItems.find(n=>n.id===aba)?.label||'Painel'}</p>
{renderAba()}
</div>
</div>
</div>
)
}
