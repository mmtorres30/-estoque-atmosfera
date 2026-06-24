'use client'
import { useState, useEffect, useRef } from 'react'
import * as XLSX from 'xlsx'
const LOC:Record<string,string>={central:'Estoque Central',frisa:'1° Andar Frisa',terceiro:'3° Andar',barfrisa:'Bar Frisa',barboate:'Bar Boate',barterceiro:'Bar 3° Andar',empresa:'Fornecedora'}
const UNIDS=['unidade(s)','caixa(s)','fardo(s)','barril(is)','garrafa(s)','lata(s)']
const G='#C9A84C',G2='#F0D080',G3='#8B6914',BG='#0a0800',BG2='#110e02',BG3='#1a1608',BOR='#2e2810'
const sI:any={width:'100%',height:38,border:`1px solid #2e2810`,borderRadius:6,padding:'0 12px',fontSize:13,background:'#110e02',color:'#F0D080',outline:'none',boxSizing:'border-box' as any}
const sC:any={background:'#1a1608',borderRadius:10,border:'1px solid #2e2810',padding:'20px 24px',marginBottom:16}
const sB:any={height:36,padding:'0 18px',borderRadius:6,border:'1px solid #3a3010',cursor:'pointer',fontSize:12,fontWeight:600,background:'#110e02',color:'#C9A84C',letterSpacing:1}
const sBP:any={height:36,padding:'0 18px',borderRadius:6,cursor:'pointer',fontSize:12,fontWeight:600,background:'linear-gradient(135deg,#8B6914,#C9A84C)',color:'#0a0800',border:'none',letterSpacing:1}
const LBL=(t:string)=><label style={{fontSize:10,color:G,display:'block',marginBottom:4,letterSpacing:1}}>{t}</label>
const TH=(h:string,i:number)=><th key={i} style={{textAlign:'left',padding:'8px 12px',fontSize:10,color:G,borderBottom:`1px solid ${BOR}`,textTransform:'uppercase' as any,letterSpacing:1.2}}>{h}</th>
const TD=({v,s}:{v:any,s?:any})=><td style={{padding:'9px 12px',color:G2,borderBottom:'1px solid #1a1600',fontSize:13,...s}}>{v}</td>
const Bdg=({t}:{t:string})=>{const c=t==='entrada'?['#0d2010','#4ade80']:t==='saida'?['#1a1200',G]:['#1a1200','#a0a0a0'];return <span style={{background:c[0],color:c[1],border:`1px solid ${c[1]}33`,borderRadius:20,padding:'2px 10px',fontSize:11,fontWeight:600}}>{t==='devolucao'?'devolução':t}</span>}
const LB=({l}:{l:string})=><span style={{background:'#1a1200',color:G,border:`1px solid ${BOR}`,borderRadius:20,padding:'2px 10px',fontSize:11}}>{LOC[l]||l}</span>

function EntradaForm({dest,emps,prods,onReg}:{dest:string,emps:any[],prods:any[],onReg:(t:string,d:any)=>Promise<boolean>}){
const [empresa,setEmpresa]=useState('')
const [nf,setNf]=useState('')
const [vUnit,setVUnit]=useState('')
const [vTot,setVTot]=useState('')
const [cod,setCod]=useState('')
const [prod,setProd]=useState('')
const [qty,setQty]=useState('')
const [unid,setUnid]=useState('unidade(s)')
const [orig,setOrig]=useState('frisa')
const [obs,setObs]=useState('')
const [nfFile,setNfFile]=useState('')
const fileRef=useRef<HTMLInputElement>(null)
const calcTot=(q:string,v:string)=>{const qn=parseFloat(q)||0,vn=parseFloat(v.replace(',','.'))||0;if(qn&&vn)setVTot((qn*vn).toFixed(2))}
const handleFile=(e:React.ChangeEvent<HTMLInputElement>)=>{const f=e.target.files?.[0];if(f)setNfFile(f.name)}
const submit=async()=>{
await onReg('entrada',{empresa_id:empresa,nf_numero:nf,nf_arquivo:nfFile,valor_unitario:vUnit,valor_total:vTot,cod_produto:cod,produto:prod,quantidade:parseInt(qty)||0,unidade:unid,origem:dest==='central'?'empresa':orig,destino:dest,observacao:obs,data:new Date().toISOString()})
setEmpresa('');setNf('');setVUnit('');setVTot('');setCod('');setProd('');setQty('');setUnid('unidade(s)');setOrig('frisa');setObs('');setNfFile('')
}
return <div style={sC}>
<p style={{fontSize:12,fontWeight:700,color:G,letterSpacing:1.5,marginBottom:16}}>↓ REGISTRAR ENTRADA</p>
<div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
{dest==='central'&&<>
<div>{LBL('EMPRESA')}<select style={sI} value={empresa} onChange={e=>setEmpresa(e.target.value)}><option value="">Selecione</option>{emps.map(e=><option key={e.id} value={e.id}>{e.nome}</option>)}</select></div>
<div>{LBL('Nº NOTA FISCAL')}<input style={sI} value={nf} onChange={e=>setNf(e.target.value)} placeholder="Ex: 123456"/></div>
<div>{LBL('VALOR UNITÁRIO (R$)')}<input style={sI} value={vUnit} onChange={e=>{setVUnit(e.target.value);calcTot(qty,e.target.value)}} placeholder="Ex: 2.50"/></div>
<div>{LBL('VALOR TOTAL (R$)')}<input style={{...sI,opacity:0.7}} value={vTot} readOnly placeholder="Calculado automaticamente"/></div>
<div style={{gridColumn:'1/-1'}}>
{LBL('ANEXO DA NOTA FISCAL')}
<div style={{display:'flex',gap:10,alignItems:'center'}}>
<button type="button" style={sB} onClick={()=>fileRef.current?.click()}>📎 Anexar arquivo</button>
{nfFile?<span style={{fontSize:12,color:G2}}>✓ {nfFile}</span>:<span style={{fontSize:11,color:'#5a4a20'}}>Nenhum arquivo</span>}
</div>
<input ref={fileRef} type="file" accept="image/*,.pdf" style={{display:'none'}} onChange={handleFile}/>
</div>
</>}
<div>{LBL('CÓDIGO')}<input style={sI} value={cod} onChange={e=>setCod(e.target.value)}/></div>
<div>{LBL('PRODUTO')}<select style={sI} value={prod} onChange={e=>setProd(e.target.value)}><option value="">Selecione</option>{prods.map(p=><option key={p.id}>{p.nome}</option>)}</select></div>
<div>{LBL('QUANTIDADE')}<input style={sI} value={qty} onChange={e=>{setQty(e.target.value);calcTot(e.target.value,vUnit)}} placeholder="Ex: 24"/></div>
<div>{LBL('UNIDADE')}<select style={sI} value={unid} onChange={e=>setUnid(e.target.value)}>{UNIDS.map(u=><option key={u}>{u}</option>)}</select></div>
{dest!=='central'&&<div>{LBL('DE QUAL DEPÓSITO')}<select style={sI} value={orig} onChange={e=>setOrig(e.target.value)}><option value="frisa">1° Andar Frisa</option><option value="terceiro">3° Andar</option></select></div>}
<div style={{gridColumn:'1/-1'}}>{LBL('OBSERVAÇÃO')}<input style={sI} value={obs} onChange={e=>setObs(e.target.value)}/></div>
</div>
<div style={{display:'flex',justifyContent:'flex-end',marginTop:16,gap:10}}>
<button style={sB} onClick={()=>{setEmpresa('');setNf('');setVUnit('');setVTot('');setCod('');setProd('');setQty('');setObs('');setNfFile('')}}>Limpar</button>
<button style={sBP} onClick={submit}>✓ Registrar Entrada</button>
</div>
</div>
}

function SaidaForm({orig,dests,prods,onReg,onSuccess}:{orig:string,dests:{value:string,label:string}[],prods:any[],onReg:(t:string,d:any)=>Promise<boolean>,onSuccess:()=>void}){
const [cod,setCod]=useState(''),[prod,setProd]=useState(''),[qty,setQty]=useState(''),[unid,setUnid]=useState('unidade(s)'),[dest,setDest]=useState(''),[resp,setResp]=useState(''),[obs,setObs]=useState('')
const [erroSaida,setErroSaida]=useState('')
const submit=async()=>{
if(!prod){setErroSaida('Selecione um produto');return}
if(!qty||parseInt(qty)<1){setErroSaida('Informe a quantidade');return}
if(!dest){setErroSaida('Selecione o destino');return}
setErroSaida('')
const r=await fetch('/api/movimentos',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({tipo:'saida',cod_produto:cod,produto:prod,quantidade:parseInt(qty)||0,unidade:unid,origem:orig,destino:dest,responsavel:resp,observacao:obs,data:new Date().toISOString()})})
const d=await r.json()
if(!r.ok){setErroSaida(d.error||'Erro ao registrar saída');return}
setCod('');setProd('');setQty('');setUnid('unidade(s)');setDest('');setResp('');setObs('');setErroSaida('');onSuccess()
}
return <div style={sC}>
<p style={{fontSize:12,fontWeight:700,color:G,letterSpacing:1.5,marginBottom:16}}>↑ REGISTRAR SAÍDA</p>
{erroSaida&&<div style={{background:'#1a0808',border:'1px solid #5a1010',borderRadius:8,padding:'10px 14px',fontSize:13,color:'#fca5a5',marginBottom:14,display:'flex',alignItems:'center',gap:8}}><span style={{fontSize:16}}>⚠️</span>{erroSaida}</div>}
<div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
<div>{LBL('CÓDIGO')}<input style={sI} value={cod} onChange={e=>setCod(e.target.value)}/></div>
<div>{LBL('PRODUTO')}<select style={sI} value={prod} onChange={e=>setProd(e.target.value)}><option value="">Selecione</option>{prods.map(p=><option key={p.id}>{p.nome}</option>)}</select></div>
<div>{LBL('QUANTIDADE')}<input style={sI} value={qty} onChange={e=>setQty(e.target.value)} placeholder="Ex: 12"/></div>
<div>{LBL('UNIDADE')}<select style={sI} value={unid} onChange={e=>setUnid(e.target.value)}>{UNIDS.map(u=><option key={u}>{u}</option>)}</select></div>
<div>{LBL('DESTINO')}<select style={sI} value={dest} onChange={e=>setDest(e.target.value)}><option value="">Selecione</option>{dests.map(d=><option key={d.value} value={d.value}>{d.label}</option>)}</select></div>
<div>{LBL('RESPONSÁVEL')}<input style={sI} value={resp} onChange={e=>setResp(e.target.value)}/></div>
<div style={{gridColumn:'1/-1'}}>{LBL('OBSERVAÇÃO')}<input style={sI} value={obs} onChange={e=>setObs(e.target.value)}/></div>
</div>
<div style={{display:'flex',justifyContent:'flex-end',marginTop:16,gap:10}}>
<button style={sB} onClick={()=>{setCod('');setProd('');setQty('');setDest('');setResp('');setObs('')}}>Limpar</button>
<button style={sBP} onClick={submit}>✓ Registrar Saída</button>
</div>
</div>
}

function DevolucaoForm({orig,prods,onReg}:{orig:string,prods:any[],onReg:(t:string,d:any)=>Promise<boolean>}){
const [prod,setProd]=useState(''),[qty,setQty]=useState(''),[unid,setUnid]=useState('unidade(s)'),[dest,setDest]=useState(''),[obs,setObs]=useState('')
const submit=async()=>{
await onReg('devolucao',{produto:prod,quantidade:parseInt(qty)||0,unidade:unid,origem:orig,destino:dest,observacao:obs,data:new Date().toISOString()})
setProd('');setQty('');setUnid('unidade(s)');setDest('');setObs('')
}
return <div style={{...sC,border:'1px solid #2a2a20'}}>
<p style={{fontSize:12,fontWeight:700,color:G,letterSpacing:1.5,marginBottom:16}}>↺ DEVOLUÇÃO / CONTAGEM FINAL</p>
<div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
<div>{LBL('PRODUTO')}<select style={sI} value={prod} onChange={e=>setProd(e.target.value)}><option value="">Selecione</option>{prods.map(p=><option key={p.id}>{p.nome}</option>)}</select></div>
<div>{LBL('QUANTIDADE')}<input style={sI} value={qty} onChange={e=>setQty(e.target.value)} placeholder="Ex: 5"/></div>
<div>{LBL('UNIDADE')}<select style={sI} value={unid} onChange={e=>setUnid(e.target.value)}>{UNIDS.map(u=><option key={u}>{u}</option>)}</select></div>
<div>{LBL('DEVOLVER PARA')}<select style={sI} value={dest} onChange={e=>setDest(e.target.value)}><option value="">Selecione</option><option value="frisa">1° Andar Frisa</option><option value="terceiro">3° Andar</option><option value="central">Estoque Central</option></select></div>
<div style={{gridColumn:'1/-1'}}>{LBL('OBSERVAÇÃO')}<input style={sI} value={obs} onChange={e=>setObs(e.target.value)}/></div>
</div>
<div style={{display:'flex',justifyContent:'flex-end',marginTop:16}}>
<button style={sBP} onClick={submit}>↺ Registrar Devolução</button>
</div>
</div>
}

function ProdutoForm({onAdd}:{onAdd:()=>void}){
const [nome,setNome]=useState(''),[cat,setCat]=useState(''),[unid,setUnid]=useState('unidade(s)'),[msg,setMsg]=useState('')
const submit=async()=>{
if(!nome){setMsg('Digite o nome');return}
const r=await fetch('/api/produtos',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({nome,categoria:cat,unidade_padrao:unid})})
if(!r.ok){setMsg('Erro ou produto já existe');return}
setNome('');setCat('');setUnid('unidade(s)');setMsg('Produto cadastrado!');onAdd()
setTimeout(()=>setMsg(''),2000)
}
return <div style={sC}>
<p style={{fontSize:12,fontWeight:700,color:G,letterSpacing:1.5,marginBottom:16}}>▤ CADASTRAR NOVO PRODUTO</p>
{msg&&<div style={{background:msg.includes('Erro')?'#1a0808':'#0d2010',border:`1px solid ${msg.includes('Erro')?'#5a1010':'#1a5a20'}`,borderRadius:6,padding:'8px 12px',fontSize:12,color:msg.includes('Erro')?'#f87171':'#4ade80',marginBottom:12}}>{msg}</div>}
<div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:14}}>
<div>{LBL('NOME DO PRODUTO *')}<input style={sI} value={nome} onChange={e=>setNome(e.target.value)} placeholder="Ex: Gin 1L"/></div>
<div>{LBL('CATEGORIA')}<input style={sI} value={cat} onChange={e=>setCat(e.target.value)} placeholder="Ex: Destilado"/></div>
<div>{LBL('UNIDADE PADRÃO')}<select style={sI} value={unid} onChange={e=>setUnid(e.target.value)}>{UNIDS.map(u=><option key={u}>{u}</option>)}</select></div>
</div>
<div style={{display:'flex',justifyContent:'flex-end',marginTop:16}}>
<button style={sBP} onClick={submit}>✓ Cadastrar Produto</button>
</div>
</div>
}

function EmpresaForm({onAdd}:{onAdd:()=>void}){
const [cod,setCod]=useState(''),[doc,setDoc]=useState(''),[nome,setNome]=useState(''),[tel,setTel]=useState(''),[email,setEmail]=useState(''),[prod,setProd]=useState(''),[msg,setMsg]=useState('')
const submit=async()=>{
if(!cod||!doc||!nome){setMsg('Preencha código, CNPJ e nome');return}
const r=await fetch('/api/empresas',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({cod_produto:cod,documento:doc,nome,telefone:tel,email,produto:prod})})
if(!r.ok){setMsg('Erro ao cadastrar');return}
setCod('');setDoc('');setNome('');setTel('');setEmail('');setProd('');setMsg('Empresa cadastrada!');setTimeout(()=>onAdd(),300)
setTimeout(()=>setMsg(''),2000)
}
return <div style={sC}>
<p style={{fontSize:11,fontWeight:700,color:G,letterSpacing:1.5,marginBottom:16}}>CADASTRAR EMPRESA</p>
{msg&&<div style={{background:msg.includes('Erro')?'#1a0808':'#0d2010',border:`1px solid ${msg.includes('Erro')?'#5a1010':'#1a5a20'}`,borderRadius:6,padding:'8px 12px',fontSize:12,color:msg.includes('Erro')?'#f87171':'#4ade80',marginBottom:12}}>{msg}</div>}
<div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:14}}>
<div>{LBL('CÓDIGO')}<input style={sI} value={cod} onChange={e=>setCod(e.target.value)} placeholder="Ex: AGU-500"/></div>
<div>{LBL('CNPJ/CPF')}<input style={sI} value={doc} onChange={e=>setDoc(e.target.value)} placeholder="00.000.000/0000-00"/></div>
<div>{LBL('NOME')}<input style={sI} value={nome} onChange={e=>setNome(e.target.value)} placeholder="Razão social"/></div>
<div>{LBL('TELEFONE')}<input style={sI} value={tel} onChange={e=>setTel(e.target.value)} placeholder="(21) 99999-9999"/></div>
<div>{LBL('E-MAIL')}<input style={sI} value={email} onChange={e=>setEmail(e.target.value)} placeholder="email@empresa.com"/></div>
<div>{LBL('PRODUTO')}<input style={sI} value={prod} onChange={e=>setProd(e.target.value)} placeholder="Ex: Água mineral"/></div>
</div>
<div style={{display:'flex',justifyContent:'flex-end',marginTop:16}}>
<button style={sBP} onClick={submit}>✓ Cadastrar Empresa</button>
</div>
</div>
}

export default function App(){
const [user,setUser]=useState<any>(null)
const [lu,setLu]=useState(''),[lp,setLp]=useState('')
const [aba,setAba]=useState('dashboard')
const [movs,setMovs]=useState<any[]>([])
const [ests,setEsts]=useState<any[]>([])
const [emps,setEmps]=useState<any[]>([])
const [prods,setProds]=useState<any[]>([])
const [toast,setToast]=useState(''),[toastE,setToastE]=useState(false)
const [editMov,setEditMov]=useState<any>(null)
const showT=(m:string,e=false)=>{setToast(m);setToastE(e);setTimeout(()=>setToast(''),3000)}
const load=async()=>{
const[m,e,em,pr]=await Promise.all([fetch('/api/movimentos').then(r=>r.json()),fetch('/api/estoques').then(r=>r.json()),fetch('/api/empresas').then(r=>r.json()),fetch('/api/produtos').then(r=>r.json())])
setMovs(Array.isArray(m)?m:[]);setEsts(Array.isArray(e)?e:[]);setEmps(Array.isArray(em)?em:[]);setProds(Array.isArray(pr)?pr:[])
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
if(!dados.produto||!dados.quantidade){showT('Preencha produto e quantidade',true);return false}
const r=await fetch('/api/movimentos',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({tipo,...dados})})
const d=await r.json()
if(!r.ok){
  const msg=d.error||'Erro ao registrar'
  showT(msg,true)
  return false
}
showT('Registrado com sucesso!');load();return true
}
const delEmp=async(id:string)=>{await fetch('/api/empresas',{method:'DELETE',headers:{'Content-Type':'application/json'},body:JSON.stringify({id})});showT('Removida');load()}
const salvarEdicao=async()=>{
  if(!editMov)return
  const r=await fetch('/api/movimentos/'+editMov.id,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(editMov)})
  if(r.ok){showT('Movimentação atualizada!');setEditMov(null);load()}else{showT('Erro ao atualizar',true)}
}
const delMov=async(id:string)=>{
if(!confirm('Tem certeza que deseja excluir esta movimentação? Os estoques não serão revertidos automaticamente.'))return
const r=await fetch('/api/movimentos/'+id,{method:'DELETE'})
if(r.ok){showT('Movimentação excluída');load()}else{showT('Erro ao excluir',true)}
}
const delProd=async(id:string)=>{await fetch('/api/produtos',{method:'DELETE',headers:{'Content-Type':'application/json'},body:JSON.stringify({id})});showT('Removido');load()}
const fdt=(dt:string)=>new Date(dt).toLocaleString('pt-BR',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'})

const exportarExcel=(local:string)=>{
  const nomeLocal=LOC[local]||local
  const saldo=Object.entries(estLoc(local)).filter(([,v])=>v>0).map(([p,q])=>({'Produto':p,'Quantidade em Estoque':q,'Local':nomeLocal}))
  const historico=movs.filter(m=>m.origem===local||m.destino===local).map(m=>({'Data':fdt(m.data),'Tipo':m.tipo,'Produto':m.produto,'Quantidade':m.quantidade,'Unidade':m.unidade,'Origem':LOC[m.origem]||m.origem,'Destino':LOC[m.destino]||m.destino,'NF':m.nf_numero||'','Observação':m.observacao||''}))
  const wb=XLSX.utils.book_new()
  const ws1=XLSX.utils.json_to_sheet(saldo.length>0?saldo:[{'Produto':'Sem produtos','Quantidade em Estoque':0,'Local':nomeLocal}])
  const ws2=XLSX.utils.json_to_sheet(historico.length>0?historico:[{'Data':'','Tipo':'Sem movimentações','Produto':'','Quantidade':0,'Unidade':'','Origem':'','Destino':'','NF':'','Observação':''}])
  XLSX.utils.book_append_sheet(wb,ws1,'Saldo Atual')
  XLSX.utils.book_append_sheet(wb,ws2,'Histórico')
  XLSX.writeFile(wb,`Estoque_${nomeLocal.replace(/ /g,'_')}_${new Date().toLocaleDateString('pt-BR').replace(/\//g,'-')}.xlsx`)
}

const TblEst=({loc}:{loc:string})=>{
const items=Object.entries(estLoc(loc)).filter(([,v])=>v>0)
if(!items.length)return <p style={{color:'#5a4a20',fontSize:13,textAlign:'center',padding:24}}>Nenhum produto em estoque</p>
return <table style={{width:'100%',borderCollapse:'collapse'}}><thead><tr>{['Produto','Quantidade'].map(TH)}</tr></thead><tbody>{items.map(([p,q])=><tr key={p}><TD v={p}/><TD v={<strong style={{color:G2}}>{q} un.</strong>}/></tr>)}</tbody></table>
}
const navItems=[
{id:'dashboard',icon:'⊞',label:'Painel'},
...(user?.perfil==='admin'||user?.perfil==='central'?[{id:'entrada-central',icon:'↓',label:'Entrada Central'},{id:'saida-central',icon:'↑',label:'Saída Central'}]:[]),
...(user?.perfil==='admin'||user?.perfil==='frisa'?[{id:'est-frisa',icon:'▣',label:'1° Frisa'}]:[]),
...(user?.perfil==='admin'||user?.perfil==='terceiro'?[{id:'est-terceiro',icon:'▣',label:'3° Andar'}]:[]),
...(user?.perfil==='admin'||user?.perfil==='barfrisa'?[{id:'bar-barfrisa',icon:'◈',label:'Bar Frisa'}]:[]),
...(user?.perfil==='admin'||user?.perfil==='barboate'?[{id:'bar-barboate',icon:'◈',label:'Bar Boate'}]:[]),
...(user?.perfil==='admin'||user?.perfil==='barterceiro'?[{id:'bar-barterceiro',icon:'◈',label:'Bar 3° Andar'}]:[]),
...(user?.perfil==='admin'||user?.perfil==='central'?[{id:'empresas',icon:'◉',label:'Empresas'},{id:'produtos',icon:'▤',label:'Produtos'}]:[]),
{id:'historico',icon:'≡',label:'Histórico'},
]
const renderAba=()=>{
if(aba==='dashboard'){
  const totalGeral=Object.keys(LOC).filter(k=>k!=='empresa').reduce((a,k)=>a+totLoc(k),0)
  const entHoje=movs.filter(m=>m.tipo==='entrada'&&new Date(m.data).toDateString()===new Date().toDateString()).length
  const saiHoje=movs.filter(m=>m.tipo==='saida'&&new Date(m.data).toDateString()===new Date().toDateString()).length
  const allItems=ests.filter(e=>e.quantidade>0)
  const produtosUnicos=[...new Set(allItems.map(e=>e.produto))]
  const locais=[
    {key:'central',nome:'Estoque Central',desc:'Recebe fornecedores'},
    {key:'frisa',nome:'1° Andar Frisa',desc:'Distribui para bares'},
    {key:'terceiro',nome:'3° Andar',desc:'Distribui para bares'},
    {key:'barfrisa',nome:'Bar Frisa',desc:'Atendimento direto'},
    {key:'barboate',nome:'Bar Boate',desc:'Atendimento direto'},
    {key:'barterceiro',nome:'Bar 3° Andar',desc:'Atendimento direto'},
  ]
  return <>
    <div style={{marginBottom:20}}>
      <p style={{fontSize:13,color:'#4a3a18'}}>{new Date().toLocaleDateString('pt-BR',{weekday:'long',day:'2-digit',month:'long',year:'numeric'})}</p>
    </div>
    <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:20}}>
      <div style={{background:'linear-gradient(135deg,#1c1608,#2a1e08)',border:'1px solid #3a3010',borderRadius:12,padding:'20px 18px'}}>
        <div style={{fontSize:10,color:'#8a7040',textTransform:'uppercase' as any,letterSpacing:1.5,marginBottom:10}}>Total em estoque</div>
        <div style={{fontSize:38,fontWeight:700,color:G2,letterSpacing:-1}}>{totalGeral.toLocaleString('pt-BR')}</div>
        <div style={{fontSize:11,color:'#6a5a30',marginTop:4}}>unidades — todos os locais</div>
      </div>
      <div style={{background:'linear-gradient(135deg,#0d1a0d,#0a150a)',border:'1px solid #1a3010',borderRadius:12,padding:'20px 18px'}}>
        <div style={{fontSize:10,color:'#4a7040',textTransform:'uppercase' as any,letterSpacing:1.5,marginBottom:10}}>Entradas hoje</div>
        <div style={{fontSize:38,fontWeight:700,color:'#4ade80',letterSpacing:-1}}>{entHoje}</div>
        <div style={{fontSize:11,color:'#3a5030',marginTop:4}}>registros de entrada</div>
      </div>
      <div style={{background:'linear-gradient(135deg,#1a1200,#150e00)',border:'1px solid #3a2800',borderRadius:12,padding:'20px 18px'}}>
        <div style={{fontSize:10,color:'#8a6020',textTransform:'uppercase' as any,letterSpacing:1.5,marginBottom:10}}>Saídas hoje</div>
        <div style={{fontSize:38,fontWeight:700,color:G,letterSpacing:-1}}>{saiHoje}</div>
        <div style={{fontSize:11,color:'#6a4a20',marginTop:4}}>registros de saída</div>
      </div>
      <div style={{background:'linear-gradient(135deg,#0d0d1a,#080810)',border:'1px solid #20203a',borderRadius:12,padding:'20px 18px'}}>
        <div style={{fontSize:10,color:'#5050a0',textTransform:'uppercase' as any,letterSpacing:1.5,marginBottom:10}}>Produtos ativos</div>
        <div style={{fontSize:38,fontWeight:700,color:'#a0a0ff',letterSpacing:-1}}>{produtosUnicos.length}</div>
        <div style={{fontSize:11,color:'#404080',marginTop:4}}>tipos de produto</div>
      </div>
    </div>
    <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12,marginBottom:20}}>
      {locais.map(l=>{
        const tot=totLoc(l.key)
        const items=Object.entries(estLoc(l.key)).filter(([,v])=>v>0)
        return <div key={l.key} style={{background:BG3,border:`1px solid ${tot>0?BOR:'#1a1608'}`,borderRadius:12,padding:'16px 18px'}}>
          <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:10}}>
            <div>
              <div style={{fontSize:12,fontWeight:700,color:G2}}>{l.nome}</div>
              <div style={{fontSize:10,color:'#5a4a20',marginTop:2}}>{l.desc}</div>
            </div>
            <div style={{textAlign:'right'}}>
              <div style={{fontSize:24,fontWeight:800,color:tot>0?G:'#3a3020'}}>{tot}</div>
              <div style={{fontSize:9,color:'#4a3a18'}}>unidades</div>
            </div>
          </div>
          <div style={{borderTop:'1px solid #1e1a08',paddingTop:8}}>
            {items.length>0?items.slice(0,4).map(([p,q])=>(
              <div key={p} style={{display:'flex',justifyContent:'space-between',padding:'3px 0'}}>
                <span style={{fontSize:11,color:'#8a7040',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',maxWidth:'72%'}}>{p}</span>
                <span style={{fontSize:11,fontWeight:600,color:G2,flexShrink:0}}>{q} un.</span>
              </div>
            )):<div style={{fontSize:11,color:'#3a3020',fontStyle:'italic'}}>Sem produtos em estoque</div>}
            {items.length>4&&<div style={{fontSize:10,color:'#5a4a20',marginTop:4}}>+{items.length-4} produtos</div>}
          </div>
        </div>
      })}
    </div>
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
      <div style={sC}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
          <p style={{fontSize:11,fontWeight:700,color:G,letterSpacing:1.5,margin:0}}>ÚLTIMAS MOVIMENTAÇÕES</p>
          <span style={{fontSize:10,color:'#5a4a20',background:'#1a1200',border:'1px solid #2e2810',borderRadius:20,padding:'3px 10px'}}>{movs.length} total</span>
        </div>
        {movs.length===0?<p style={{color:'#5a4a20',fontSize:13,textAlign:'center',padding:24}}>Nenhuma movimentação ainda</p>:
        <div>{movs.slice(0,6).map(m=>(
          <div key={m.id} style={{display:'flex',alignItems:'center',gap:10,padding:'9px 0',borderBottom:'1px solid #1a1600'}}>
            <div style={{width:8,height:8,borderRadius:'50%',background:m.tipo==='entrada'?'#4ade80':m.tipo==='saida'?G:'#a0a0a0',flexShrink:0}}/>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:12,color:G2,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{m.produto}</div>
              <div style={{fontSize:10,color:'#5a4a20',marginTop:1}}>{LOC[m.origem]||m.origem} → {LOC[m.destino]||m.destino}</div>
            </div>
            <div style={{textAlign:'right',flexShrink:0}}>
              <div style={{fontSize:12,fontWeight:700,color:m.tipo==='entrada'?'#4ade80':G}}>{m.tipo==='entrada'?'+':'-'}{m.quantidade} {m.unidade}</div>
              <div style={{fontSize:10,color:'#5a4a20'}}>{fdt(m.data)}</div>
            </div>
          </div>
        ))}</div>}
      </div>
      <div style={sC}>
        <p style={{fontSize:11,fontWeight:700,color:G,letterSpacing:1.5,marginBottom:14}}>INVENTÁRIO COMPLETO</p>
        {allItems.length===0?<p style={{color:'#5a4a20',fontSize:13,textAlign:'center',padding:24}}>Nenhum produto em estoque</p>:
        <div style={{maxHeight:320,overflowY:'auto'}}>
          <table style={{width:'100%',borderCollapse:'collapse'}}>
            <thead><tr>{['Produto','Local','Qtd'].map(TH)}</tr></thead>
            <tbody>{allItems.sort((a,b)=>b.quantidade-a.quantidade).map((e,i)=>(
              <tr key={i}>
                <TD v={e.produto} s={{fontSize:12}}/>
                <TD v={<span style={{background:'#1a1200',color:G,border:`1px solid ${BOR}`,borderRadius:20,padding:'1px 8px',fontSize:10,whiteSpace:'nowrap'}}>{LOC[e.local]||e.local}</span>}/>
                <TD v={<strong style={{color:G2}}>{e.quantidade}</strong>}/>
              </tr>
            ))}</tbody>
          </table>
        </div>}
      </div>
    </div>
  </>
}
if(aba==='entrada-central')return <>{canEdit('central')&&<EntradaForm dest="central" emps={emps} prods={prods} onReg={reg}/>}<div style={sC}><div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}><p style={{fontSize:11,fontWeight:700,color:G,letterSpacing:1.5,margin:0}}>SALDO — ESTOQUE CENTRAL</p><button style={sBP} onClick={()=>exportarExcel('central')}>📊 Exportar Excel</button></div><TblEst loc="central"/></div></>
if(aba==='saida-central')return <>{canEdit('central')&&<SaidaForm orig="central" dests={[{value:'frisa',label:'1° Andar Frisa'},{value:'terceiro',label:'3° Andar'}]} prods={prods} onReg={reg} onSuccess={load}/>}</>
if(aba==='est-frisa')return <><div style={sC}><div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}><p style={{fontSize:11,fontWeight:700,color:G,letterSpacing:1.5,margin:0}}>SALDO — 1° ANDAR FRISA</p><button style={sBP} onClick={()=>exportarExcel('frisa')}>📊 Exportar Excel</button></div><TblEst loc="frisa"/></div>{canEdit('frisa')&&<SaidaForm orig="frisa" dests={[{value:'barfrisa',label:'Bar Frisa'},{value:'barboate',label:'Bar Boate'},{value:'barterceiro',label:'Bar 3° Andar'}]} prods={prods} onReg={reg} onSuccess={load}/>}</>
if(aba==='est-terceiro')return <><div style={sC}><div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}><p style={{fontSize:11,fontWeight:700,color:G,letterSpacing:1.5,margin:0}}>SALDO — 3° ANDAR</p><button style={sBP} onClick={()=>exportarExcel('terceiro')}>📊 Exportar Excel</button></div><TblEst loc="terceiro"/></div>{canEdit('terceiro')&&<SaidaForm orig="terceiro" dests={[{value:'barfrisa',label:'Bar Frisa'},{value:'barboate',label:'Bar Boate'},{value:'barterceiro',label:'Bar 3° Andar'}]} prods={prods} onReg={reg} onSuccess={load}/>}</>
if(aba.startsWith('bar-')){const k=aba.replace('bar-','');return <><div style={sC}><div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}><p style={{fontSize:11,fontWeight:700,color:G,letterSpacing:1.5,margin:0}}>SALDO — {(LOC[k]||k).toUpperCase()}</p><button style={sBP} onClick={()=>exportarExcel(k)}>📊 Exportar Excel</button></div><TblEst loc={k}/></div>{canEdit(k)&&<><EntradaForm dest={k} emps={emps} prods={prods} onReg={reg}/><DevolucaoForm orig={k} prods={prods} onReg={reg}/></>}</>}
if(aba==='produtos')return <><ProdutoForm onAdd={load}/><div style={sC}><p style={{fontSize:11,fontWeight:700,color:G,letterSpacing:1.5,marginBottom:14}}>PRODUTOS CADASTRADOS</p>{prods.length===0?<p style={{color:'#5a4a20',fontSize:13,textAlign:'center',padding:24}}>Nenhum produto</p>:<table style={{width:'100%',borderCollapse:'collapse'}}><thead><tr>{['Nome','Categoria','Unidade',''].map(TH)}</tr></thead><tbody>{prods.map(p=><tr key={p.id}><TD v={p.nome}/><TD v={p.categoria||'—'}/><TD v={p.unidade_padrao}/><TD v={canEdit('central')&&<button onClick={()=>delProd(p.id)} style={{...sB,height:26,padding:'0 10px',fontSize:11}}>Excluir</button>}/></tr>)}</tbody></table>}</div></>
if(aba==='empresas')return <><EmpresaForm onAdd={load}/><div style={sC}><p style={{fontSize:11,fontWeight:700,color:G,letterSpacing:1.5,marginBottom:14}}>EMPRESAS CADASTRADAS</p>{emps.length===0?<p style={{color:'#5a4a20',fontSize:13,textAlign:'center',padding:24}}>Nenhuma empresa</p>:<table style={{width:'100%',borderCollapse:'collapse'}}><thead><tr>{['Cód.','CNPJ/CPF','Nome','Produto','Telefone','E-mail',''].map(TH)}</tr></thead><tbody>{emps.map(e=><tr key={e.id}>{[e.cod_produto,e.documento,e.nome,e.produto||'—',e.telefone||'—',e.email||'—'].map((v,i)=><TD key={i} v={v}/>)}<TD v={canEdit('central')&&<button onClick={()=>delEmp(e.id)} style={{...sB,height:26,padding:'0 10px',fontSize:11}}>Excluir</button>}/></tr>)}</tbody></table>}</div></>
if(aba==='historico')return <>
{editMov&&<div style={{...sC,border:`1px solid ${G}`,marginBottom:16}}>
  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
    <p style={{fontSize:12,fontWeight:700,color:G,letterSpacing:1.5,margin:0}}>✏️ EDITAR MOVIMENTAÇÃO</p>
    <button style={{...sB,height:28,padding:'0 12px',fontSize:11}} onClick={()=>setEditMov(null)}>✕ Fechar</button>
  </div>
  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
    <div><label style={{fontSize:10,color:G,display:'block',marginBottom:4,letterSpacing:1}}>TIPO</label>
    <select style={sI} value={editMov.tipo} onChange={e=>setEditMov({...editMov,tipo:e.target.value})}>
      <option value="entrada">entrada</option><option value="saida">saida</option><option value="devolucao">devolucao</option>
    </select></div>
    <div><label style={{fontSize:10,color:G,display:'block',marginBottom:4,letterSpacing:1}}>DATA</label>
    <input type="datetime-local" style={sI} value={editMov.data?.slice(0,16)||''} onChange={e=>setEditMov({...editMov,data:e.target.value})}/></div>
    <div><label style={{fontSize:10,color:G,display:'block',marginBottom:4,letterSpacing:1}}>PRODUTO</label>
    <select style={sI} value={editMov.produto||''} onChange={e=>setEditMov({...editMov,produto:e.target.value})}>
      {prods.map(p=><option key={p.id}>{p.nome}</option>)}
    </select></div>
    <div><label style={{fontSize:10,color:G,display:'block',marginBottom:4,letterSpacing:1}}>QUANTIDADE</label>
    <input style={sI} value={editMov.quantidade||''} onChange={e=>setEditMov({...editMov,quantidade:parseInt(e.target.value)||0})}/></div>
    <div><label style={{fontSize:10,color:G,display:'block',marginBottom:4,letterSpacing:1}}>UNIDADE</label>
    <select style={sI} value={editMov.unidade||'unidade(s)'} onChange={e=>setEditMov({...editMov,unidade:e.target.value})}>
      {UNIDS.map(u=><option key={u}>{u}</option>)}
    </select></div>
    <div><label style={{fontSize:10,color:G,display:'block',marginBottom:4,letterSpacing:1}}>ORIGEM</label>
    <select style={sI} value={editMov.origem||''} onChange={e=>setEditMov({...editMov,origem:e.target.value})}>
      {Object.entries(LOC).map(([k,v])=><option key={k} value={k}>{v as string}</option>)}
      <option value="empresa">Empresa Fornecedora</option>
    </select></div>
    <div><label style={{fontSize:10,color:G,display:'block',marginBottom:4,letterSpacing:1}}>DESTINO</label>
    <select style={sI} value={editMov.destino||''} onChange={e=>setEditMov({...editMov,destino:e.target.value})}>
      {Object.entries(LOC).map(([k,v])=><option key={k} value={k}>{v as string}</option>)}
    </select></div>
    <div><label style={{fontSize:10,color:G,display:'block',marginBottom:4,letterSpacing:1}}>Nº NOTA FISCAL</label>
    <input style={sI} value={editMov.nf_numero||''} onChange={e=>setEditMov({...editMov,nf_numero:e.target.value})}/></div>
    <div style={{gridColumn:'1/-1'}}><label style={{fontSize:10,color:G,display:'block',marginBottom:4,letterSpacing:1}}>OBSERVAÇÃO</label>
    <input style={sI} value={editMov.observacao||''} onChange={e=>setEditMov({...editMov,observacao:e.target.value})}/></div>
  </div>
  <div style={{display:'flex',justifyContent:'flex-end',gap:10,marginTop:16}}>
    <button style={sBP} onClick={salvarEdicao}>✓ Salvar alterações</button>
  </div>
</div>}
<div style={sC}><p style={{fontSize:11,fontWeight:700,color:G,letterSpacing:1.5,marginBottom:14}}>HISTÓRICO COMPLETO</p>{movs.length===0?<p style={{color:'#5a4a20',fontSize:13,textAlign:'center',padding:24}}>Nenhuma movimentação</p>:<div style={{overflowX:'auto'}}><table style={{width:'100%',borderCollapse:'collapse'}}><thead><tr>{['Tipo','Data','Produto','Qtd','Origem','Destino','NF','Obs',''].map(TH)}</tr></thead><tbody>{movs.map(m=><tr key={m.id}><TD v={<Bdg t={m.tipo}/>}/><TD v={fdt(m.data)} s={{whiteSpace:'nowrap',fontSize:11}}/><TD v={m.produto}/><TD v={`${m.quantidade} ${m.unidade}`}/><TD v={<LB l={m.origem}/>}/><TD v={<LB l={m.destino}/>}/><TD v={m.nf_numero||'—'}/><TD v={m.observacao||'—'} s={{color:'#6a5a30',fontSize:11}}/><TD v={<div style={{display:'flex',gap:4}}><button onClick={()=>setEditMov(m)} style={{...sB,height:26,padding:'0 8px',fontSize:11}}>✏️</button><button onClick={()=>delMov(m.id)} style={{...sB,height:26,padding:'0 8px',fontSize:11,color:'#f87171',borderColor:'#5a1010'}}>✕</button></div>}/></tr>)}</tbody></table></div>}</div>
}
if(!user)return(
<div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:`radial-gradient(ellipse at center,#1a1200 0%,${BG} 70%)`}}>
<div style={{width:420,padding:'44px 40px',background:`linear-gradient(160deg,${BG3},${BG2})`,border:`1px solid ${BOR}`,borderRadius:16,boxShadow:'0 0 80px #C9A84C10'}}>
<div style={{textAlign:'center',marginBottom:36}}>
<img src="/logo.png" alt="Camarote Atmosfera" style={{width:220,display:'block',margin:'0 auto 12px'}}/>
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
<div style={{padding:'20px 16px',borderBottom:`1px solid ${BOR}`,textAlign:'center'}}>
<img src="/logo.png" alt="Atmosfera" style={{width:160,display:'block',margin:'0 auto 8px'}}/>
<button onClick={async()=>{await load();showT("Dados atualizados!")}} style={{...sB,width:'100%',fontSize:11,letterSpacing:1,marginTop:4}}>🔄 Atualizar dados</button>
</div>
<div style={{flex:1,padding:'12px 8px',overflowY:'auto'}}>
{navItems.map(n=>(
<button key={n.id} onClick={()=>setAba(n.id)} style={{width:'100%',display:'flex',alignItems:'center',gap:10,padding:'10px 12px',marginBottom:2,border:'none',borderRadius:8,cursor:'pointer',background:aba===n.id?`linear-gradient(135deg,${G3}33,${G}22)`:'transparent',color:aba===n.id?G2:'#5a4a20',fontWeight:aba===n.id?700:400,fontSize:13,textAlign:'left',borderLeft:aba===n.id?`2px solid ${G}`:'2px solid transparent'}}>
<span style={{fontSize:16,width:20,textAlign:'center'}}>{n.icon}</span>{n.label}
</button>
))}
</div>
<div style={{padding:'16px',borderTop:`1px solid ${BOR}`}}>
<div style={{fontSize:11,color:'#5a4a20',marginBottom:8,letterSpacing:1}}>{user.nome.toUpperCase()}</div>
<button onClick={()=>setUser(null)} style={{...sB,width:'100%',fontSize:11,letterSpacing:1}}>SAIR</button>
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
