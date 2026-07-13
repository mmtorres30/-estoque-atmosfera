'use client'
import { useState, useEffect, useRef } from 'react'
import * as XLSX from 'xlsx'
import Scanner from './components/Scanner'
const LOC:Record<string,string>={central:'Estoque Central',frisa:'Estoque 1° Andar',terceiro:'Estoque 3° Andar',barfrisa:'Bar Frisa',barboate:'Bar Boate',barterceiro:'Bar 3° Andar',empresa:'Fornecedora'}
const UNIDS=['unidade(s)','caixa(s)','fardo(s)','barril(is)','garrafa(s)','lata(s)']
const G='#C9A84C',G2='#F0D080',G3='#8B6914',BG='#0a0800',BG2='#110e02',BG3='#1a1608',BOR='#2e2810'
const sI:any={width:'100%',height:38,border:`1px solid #2e2810`,borderRadius:6,padding:'0 12px',fontSize:13,background:'#110e02',color:'#F0D080',outline:'none',boxSizing:'border-box' as any}
const sC:any={background:'#1a1608',borderRadius:10,border:'1px solid #2e2810',padding:'20px 24px',marginBottom:16}
const sB:any={height:36,padding:'0 18px',borderRadius:6,border:'1px solid #3a3010',cursor:'pointer',fontSize:12,fontWeight:600,background:'#110e02',color:'#C9A84C',letterSpacing:1}
const sBP:any={height:36,padding:'0 18px',borderRadius:6,cursor:'pointer',fontSize:12,fontWeight:600,background:'linear-gradient(135deg,#8B6914,#C9A84C)',color:'#0a0800',border:'none',letterSpacing:1}
const LBL=(t:string)=><label style={{fontSize:10,color:G,display:'block',marginBottom:4,letterSpacing:1}}>{t}</label>
const TH=(h:string,i:number)=><th key={i} style={{textAlign:'left',padding:'8px 12px',fontSize:10,color:G,borderBottom:`1px solid ${BOR}`,textTransform:'uppercase' as any,letterSpacing:1.2}}>{h}</th>
const TD=({v,s}:{v:any,s?:any})=><td style={{padding:'9px 12px',color:G2,borderBottom:'1px solid #1a1600',fontSize:13,...s}}>{v}</td>
const Bdg=({t}:{t:string})=>{const c=t==='entrada'?['#0d2010','#4ade80']:t==='saida'?['#1a1200',G]:t==='venda'?['#1a0a2a','#c084fc']:['#1a1200','#a0a0a0'];return <span style={{background:c[0],color:c[1],border:`1px solid ${c[1]}33`,borderRadius:20,padding:'2px 10px',fontSize:11,fontWeight:600}}>{t==='devolucao'?'devolução':t}</span>}
const LB=({l}:{l:string})=><span style={{background:'#1a1200',color:G,border:`1px solid ${BOR}`,borderRadius:20,padding:'2px 10px',fontSize:11}}>{LOC[l]||l}</span>



const fmtR=(v:number)=>v.toLocaleString('pt-BR',{style:'currency',currency:'BRL'})
const maskMoeda=(v:string)=>{
  const nums=v.replace(/\D/g,'')
  if(!nums)return ''
  const n=parseInt(nums)/100
  return n.toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2})
}
const unMaskMoeda=(v:string)=>parseFloat(v.replace(/\./g,'').replace(',','.'))||0

function EntradaForm({dest,emps,prods,onReg}:{dest:string,emps:any[],prods:any[],onReg:(t:string,d:any)=>Promise<boolean>}){
const [empresa,setEmpresa]=useState('')
const [nf,setNf]=useState('')
const [vUnit,setVUnit]=useState('0,00')
const [vTot,setVTot]=useState('')
const [cod,setCod]=useState('')
const [prod,setProd]=useState('')
const [qty,setQty]=useState('')
const [unid,setUnid]=useState('unidade(s)')
const [orig,setOrig]=useState('frisa')
const [obs,setObs]=useState('')
const [nfFile,setNfFile]=useState('')
const [dataEnt,setDataEnt]=useState('')
const fileRef=useRef<HTMLInputElement>(null)
const calcTot=(q:string,v:string)=>{const qn=parseFloat(q)||0,vn=unMaskMoeda(v);if(qn&&vn)setVTot(maskMoeda(String(Math.round(qn*vn*100))))}
const handleFile=(e:React.ChangeEvent<HTMLInputElement>)=>{const f=e.target.files?.[0];if(f)setNfFile(f.name)}
const submit=async()=>{
await onReg('entrada',{empresa_id:empresa,nf_numero:nf,nf_arquivo:nfFile,valor_unitario:unMaskMoeda(vUnit),valor_total:unMaskMoeda(vTot),cod_produto:cod,produto:prod,quantidade:parseInt(qty)||0,unidade:unid,origem:dest==='central'?'empresa':orig,destino:dest,observacao:obs,data:dataEnt?new Date(dataEnt).toISOString():new Date().toISOString()})
setEmpresa('');setNf('');setVUnit('');setVTot('');setCod('');setProd('');setQty('');setUnid('unidade(s)');setOrig('frisa');setObs('');setNfFile('');setDataEnt('')
}
return <div style={sC}>
<p style={{fontSize:12,fontWeight:700,color:G,letterSpacing:1.5,marginBottom:16}}>↓ REGISTRAR ENTRADA</p>
<div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
{dest==='central'&&<>
<div>{LBL('EMPRESA')}<select style={sI} value={empresa} onChange={e=>setEmpresa(e.target.value)}><option value="">Selecione</option>{emps.map(e=><option key={e.id} value={e.id}>{e.nome}</option>)}</select></div>
<div>{LBL('Nº NOTA FISCAL')}<input style={sI} value={nf} onChange={e=>setNf(e.target.value)} placeholder="Ex: 123456"/></div>
<div>{LBL('VALOR UNITÁRIO (R$)')}<input style={sI} value={vUnit} onChange={e=>{const m=maskMoeda(e.target.value);setVUnit(m);calcTot(qty,m)}} placeholder="R$ 0,00"/></div>
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
<div style={{gridColumn:'1/-1'}}>{LBL('CÓDIGO')}
<div style={{display:'flex',gap:8,alignItems:'center'}}>
<input style={sI} value={cod} onChange={e=>{setCod(e.target.value);const p=prods.find((x:any)=>x.cod_produto===e.target.value||x.nome===e.target.value);if(p){setProd(p.nome||p.produto||'')}}} placeholder="Digite ou escaneie"/>
<Scanner onScan={(code)=>{setCod(code);const p=prods.find((x:any)=>(x.cod_produto&&x.cod_produto===code)||x.nome===code);if(p){setProd(p.nome)}else{const pNome=prods.find((x:any)=>x.nome&&x.nome.toLowerCase().includes(code.toLowerCase()));if(pNome)setProd(pNome.nome)}}}/>
</div></div>
<div>{LBL('PRODUTO')}<select style={sI} value={prod} onChange={e=>setProd(e.target.value)}><option value="">Selecione</option>{prods.map(p=><option key={p.id}>{p.nome}</option>)}</select></div>
<div>{LBL('QUANTIDADE')}<input style={sI} value={qty} onChange={e=>{setQty(e.target.value);calcTot(e.target.value,vUnit)}} placeholder="Ex: 24"/></div>
<div>{LBL('UNIDADE')}<select style={sI} value={unid} onChange={e=>setUnid(e.target.value)}>{UNIDS.map(u=><option key={u}>{u}</option>)}</select></div>
{dest!=='central'&&<div>{LBL('DE QUAL DEPÓSITO')}<select style={sI} value={orig} onChange={e=>setOrig(e.target.value)}><option value="frisa">1° Andar Frisa</option><option value="terceiro">3° Andar</option></select></div>}
<div>{LBL('DATA (opcional)')}<input type='date' style={sI} value={dataEnt} onChange={e=>setDataEnt(e.target.value)}/></div><div style={{gridColumn:'1/-1'}}>{LBL('OBSERVAÇÃO')}<input style={sI} value={obs} onChange={e=>setObs(e.target.value)}/></div>
</div>
<div style={{display:'flex',justifyContent:'flex-end',marginTop:16,gap:10}}>
<button style={sB} onClick={()=>{setEmpresa('');setNf('');setVUnit('');setVTot('');setCod('');setProd('');setQty('');setObs('');setNfFile('')}}>Limpar</button>
<button style={sBP} onClick={submit}>✓ Registrar Entrada</button>
</div>
</div>
}

function SaidaForm({orig,dests,prods,onReg,onSuccess}:{orig:string,dests:{value:string,label:string}[],prods:any[],onReg:(t:string,d:any)=>Promise<boolean>,onSuccess:()=>void}){
const [dataSai,setDataSai]=useState('')
const [cod,setCod]=useState(''),[prod,setProd]=useState(''),[qty,setQty]=useState(''),[unid,setUnid]=useState('unidade(s)'),[dest,setDest]=useState(''),[resp,setResp]=useState(''),[obs,setObs]=useState('')
const [erroSaida,setErroSaida]=useState('')
const submit=async()=>{
if(!prod){setErroSaida('Selecione um produto');return}
if(!qty||parseInt(qty)<1){setErroSaida('Informe a quantidade');return}
if(!dest){setErroSaida('Selecione o destino');return}
setErroSaida('')
const r=await fetch('/api/movimentos',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({tipo:'saida',cod_produto:cod,produto:prod,quantidade:parseInt(qty)||0,unidade:unid,origem:orig,destino:dest,responsavel:resp,observacao:obs,data:dataSai?new Date(dataSai).toISOString():new Date().toISOString()})})
const d=await r.json()
if(!r.ok){setErroSaida(d.error||'Erro ao registrar saída');return}
setCod('');setProd('');setQty('');setUnid('unidade(s)');setDest('');setResp('');setObs('');setErroSaida('');onSuccess()
}
return <div style={sC}>
<p style={{fontSize:12,fontWeight:700,color:G,letterSpacing:1.5,marginBottom:16}}>↑ REGISTRAR SAÍDA</p>
{erroSaida&&<div style={{background:'#1a0808',border:'1px solid #5a1010',borderRadius:8,padding:'10px 14px',fontSize:13,color:'#fca5a5',marginBottom:14,display:'flex',alignItems:'center',gap:8}}><span style={{fontSize:16}}>⚠️</span>{erroSaida}</div>}
<div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
<div style={{gridColumn:'1/-1'}}>{LBL('CÓDIGO')}
<div style={{display:'flex',gap:8,alignItems:'center'}}>
<input style={sI} value={cod} onChange={e=>{setCod(e.target.value);const p=prods.find((x:any)=>x.cod_produto===e.target.value||x.nome===e.target.value);if(p){setProd(p.nome||p.produto||'')}}} placeholder="Digite ou escaneie"/>
<Scanner onScan={(code)=>{setCod(code);const p=prods.find((x:any)=>(x.cod_produto&&x.cod_produto===code)||x.nome===code);if(p){setProd(p.nome)}}}/>
</div></div>
<div>{LBL('PRODUTO')}<select style={sI} value={prod} onChange={e=>setProd(e.target.value)}><option value="">Selecione</option>{prods.map(p=><option key={p.id}>{p.nome}</option>)}</select></div>
<div>{LBL('QUANTIDADE')}<input style={sI} value={qty} onChange={e=>setQty(e.target.value)} placeholder="Ex: 12"/></div>
<div>{LBL('UNIDADE')}<select style={sI} value={unid} onChange={e=>setUnid(e.target.value)}>{UNIDS.map(u=><option key={u}>{u}</option>)}</select></div>
<div>{LBL('DESTINO')}<select style={sI} value={dest} onChange={e=>setDest(e.target.value)}><option value="">Selecione</option>{dests.map(d=><option key={d.value} value={d.value}>{d.label}</option>)}</select></div>
<div>{LBL('RESPONSÁVEL')}<input style={sI} value={resp} onChange={e=>setResp(e.target.value)}/></div>
<div>{LBL('DATA (opcional)')}<input type='date' style={sI} value={dataSai} onChange={e=>setDataSai(e.target.value)}/></div><div style={{gridColumn:'1/-1'}}>{LBL('OBSERVAÇÃO')}<input style={sI} value={obs} onChange={e=>setObs(e.target.value)}/></div>
</div>
<div style={{display:'flex',justifyContent:'flex-end',marginTop:16,gap:10}}>
<button style={sB} onClick={()=>{setCod('');setProd('');setQty('');setDest('');setResp('');setObs('');setDataSai('')}}>Limpar</button>
<button style={sBP} onClick={submit}>✓ Registrar Saída</button>
</div>
</div>
}

function DevolucaoForm({orig,prods,onReg}:{orig:string,prods:any[],onReg:(t:string,d:any)=>Promise<boolean>}){
const [dataDevol,setDataDevol]=useState('')
const [prod,setProd]=useState(''),[qty,setQty]=useState(''),[unid,setUnid]=useState('unidade(s)'),[dest,setDest]=useState(''),[obs,setObs]=useState('')
const submit=async()=>{
await onReg('devolucao',{produto:prod,quantidade:parseInt(qty)||0,unidade:unid,origem:orig,destino:dest,observacao:obs,data:dataDevol?new Date(dataDevol).toISOString():new Date().toISOString()})
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
<div>{LBL('DATA (opcional)')}<input type='date' style={sI} value={dataDevol} onChange={e=>setDataDevol(e.target.value)}/></div>
</div>
<div style={{display:'flex',justifyContent:'flex-end',marginTop:16}}>
<button style={sBP} onClick={submit}>↺ Registrar Devolução</button>
</div>
</div>
}


function VendaForm({orig,prods,onReg,onSuccess}:{orig:string,prods:any[],onReg:(t:string,d:any)=>Promise<boolean>,onSuccess:()=>void}){
const [prod,setProd]=useState('')
const [qty,setQty]=useState('')
const [unid,setUnid]=useState('unidade(s)')
const [vUnit,setVUnit]=useState('')
const [vTot,setVTot]=useState('')
const [obs,setObs]=useState('')
const [dataVenda,setDataVenda]=useState('')
const [erroVenda,setErroVenda]=useState('')
const calcTot=(q:string,v:string)=>{const qn=parseFloat(q)||0,vn=unMaskMoeda(v);setVTot(qn&&vn?maskMoeda(String(Math.round(qn*vn*100))):'')}
const submit=async()=>{
if(!prod){setErroVenda('Selecione um produto');return}
if(!qty||parseInt(qty)<1){setErroVenda('Informe a quantidade');return}
setErroVenda('')
const r=await fetch('/api/movimentos',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({tipo:'venda',produto:prod,quantidade:parseInt(qty)||0,unidade:unid,origem:orig,valor_unitario:unMaskMoeda(vUnit),valor_total:unMaskMoeda(vTot),observacao:obs,data:dataVenda?new Date(dataVenda).toISOString():new Date().toISOString()})})
const d=await r.json()
if(!r.ok){setErroVenda(d.error||'Erro ao registrar venda');return}
setProd('');setQty('');setUnid('unidade(s)');setVUnit('');setVTot('');setObs('');setErroVenda('');onSuccess()
}
return <div style={{...sC,border:'1px solid #2a2a20'}}>
<p style={{fontSize:12,fontWeight:700,color:G,letterSpacing:1.5,marginBottom:16}}>🛒 REGISTRAR VENDA</p>
{erroVenda&&<div style={{background:'#1a0808',border:'1px solid #5a1010',borderRadius:8,padding:'10px 14px',fontSize:13,color:'#fca5a5',marginBottom:14,display:'flex',alignItems:'center',gap:8}}><span style={{fontSize:16}}>⚠️</span>{erroVenda}</div>}
<div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
<div>{LBL('PRODUTO')}<select style={sI} value={prod} onChange={e=>setProd(e.target.value)}><option value="">Selecione</option>{prods.map(p=><option key={p.id}>{p.nome}</option>)}</select></div>
<div>{LBL('QUANTIDADE')}<input style={sI} value={qty} onChange={e=>{setQty(e.target.value);calcTot(e.target.value,vUnit)}} placeholder="Ex: 2"/></div>
<div>{LBL('UNIDADE')}<select style={sI} value={unid} onChange={e=>setUnid(e.target.value)}>{UNIDS.map(u=><option key={u}>{u}</option>)}</select></div>
<div>{LBL('VALOR UNITÁRIO (R$)')}<input style={sI} value={vUnit} onChange={e=>{const m=maskMoeda(e.target.value);setVUnit(m);calcTot(qty,m)}} placeholder="R$ 0,00"/></div>
<div>{LBL('VALOR TOTAL (R$)')}<input style={{...sI,opacity:0.7}} value={vTot} readOnly placeholder="Calculado automaticamente"/></div>
<div>{LBL('DATA (opcional)')}<input type='date' style={sI} value={dataVenda} onChange={e=>setDataVenda(e.target.value)}/></div>
<div style={{gridColumn:'1/-1'}}>{LBL('OBSERVAÇÃO')}<input style={sI} value={obs} onChange={e=>setObs(e.target.value)}/></div>
</div>
<div style={{display:'flex',justifyContent:'flex-end',marginTop:16}}>
<button style={sBP} onClick={submit}>🛒 Registrar Venda</button>
</div>
</div>
}

function ProdutoForm({onAdd}:{onAdd:()=>void}){
const [codProd,setCodProd]=useState('')
const [nome,setNome]=useState(''),[cat,setCat]=useState(''),[unid,setUnid]=useState('unidade(s)'),[msg,setMsg]=useState('')
const submit=async()=>{
if(!nome){setMsg('Digite o nome');return}
const r=await fetch('/api/produtos',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({nome,categoria:cat,unidade_padrao:unid,cod_produto:codProd})})
if(!r.ok){setMsg('Erro ou produto já existe');return}
setNome('');setCat('');setUnid('unidade(s)');setCodProd('');setMsg('Produto cadastrado!');onAdd()
setTimeout(()=>setMsg(''),2000)
}
return <div style={sC}>
<p style={{fontSize:12,fontWeight:700,color:G,letterSpacing:1.5,marginBottom:16}}>▤ CADASTRAR NOVO PRODUTO</p>
{msg&&<div style={{background:msg.includes('Erro')?'#1a0808':'#0d2010',border:`1px solid ${msg.includes('Erro')?'#5a1010':'#1a5a20'}`,borderRadius:6,padding:'8px 12px',fontSize:12,color:msg.includes('Erro')?'#f87171':'#4ade80',marginBottom:12}}>{msg}</div>}
<div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:14}}>
<div style={{gridColumn:'1/-1'}}>{LBL('CODIGO DO PRODUTO')}
<div style={{display:'flex',gap:8,alignItems:'center'}}>
<input style={sI} value={codProd} onChange={e=>setCodProd(e.target.value)} placeholder="Ex: AGU-500"/>
<Scanner onScan={(code)=>{setCodProd(code)}}/>
</div></div>
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
<div>{LBL('CNPJ/CPF')}<input style={sI} value={doc} onChange={e=>{
let v=e.target.value.replace(/\D/g,'');
if(v.length<=11){v=v.replace(/(\d{3})(\d)/,'$1.$2').replace(/(\d{3})(\d)/,'$1.$2').replace(/(\d{3})(\d{1,2})$/,'$1-$2')}
else{v=v.replace(/(\d{2})(\d)/,'$1.$2').replace(/(\d{3})(\d)/,'$1.$2').replace(/(\d{3})(\d)/,'$1/$2').replace(/(\d{4})(\d{1,2})$/,'$1-$2')}
setDoc(v)}} placeholder="00.000.000/0000-00" maxLength={18}/></div>
<div>{LBL('NOME')}<input style={sI} value={nome} onChange={e=>setNome(e.target.value)} placeholder="Razão social"/></div>
<div>{LBL('TELEFONE')}<input style={sI} value={tel} onChange={e=>{
let v=e.target.value.replace(/\D/g,'');
v=v.replace(/(\d{2})(\d)/,'($1) $2').replace(/(\d{5})(\d{1,4})$/,'$1-$2');
setTel(v)}} placeholder="(21) 99999-9999" maxLength={15}/></div>
<div>{LBL('E-MAIL')}<input style={sI} value={email} onChange={e=>setEmail(e.target.value)} placeholder="email@empresa.com"/></div>
<div>{LBL('PRODUTO')}<input style={sI} value={prod} onChange={e=>setProd(e.target.value)} placeholder="Ex: Água mineral"/></div>
</div>
<div style={{display:'flex',justifyContent:'flex-end',marginTop:16}}>
<button style={sBP} onClick={submit}>✓ Cadastrar Empresa</button>
</div>
</div>
}

function UsuarioForm({onAdd}:{onAdd:()=>void}){
const [username,setUsername]=useState('')
const [senha,setSenha]=useState('')
const [nome,setNome]=useState('')
const [perfil,setPerfil]=useState('central')
const [msg,setMsg]=useState('')
const PERFIS=[
  {value:'operador',label:'Operador (acesso a todos estoques)'},
  {value:'central',label:'Estoque Central'},
  {value:'frisa',label:'1° Andar Frisa'},
  {value:'terceiro',label:'3° Andar'},
  {value:'barfrisa',label:'Bar Frisa'},
  {value:'barboate',label:'Bar Boate'},
  {value:'barterceiro',label:'Bar 3° Andar'},
]
const submit=async()=>{
  if(!username||!senha||!nome){setMsg('Preencha todos os campos');return}
  const r=await fetch('/api/usuarios',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username,senha,nome,nome_completo:nome,perfil})})
  const d=await r.json()
  if(!r.ok){setMsg(d.error||'Erro ao cadastrar');return}
  setUsername('');setSenha('');setNome('');setPerfil('central');setMsg('Usuário cadastrado!')
  onAdd();setTimeout(()=>setMsg(''),2000)
}
return <div style={sC}>
<p style={{fontSize:12,fontWeight:700,color:G,letterSpacing:1.5,marginBottom:16}}>👤 CADASTRAR NOVO USUÁRIO</p>
{msg&&<div style={{background:msg.includes('Erro')||msg.includes('Preencha')?'#1a0808':'#0d2010',border:`1px solid ${msg.includes('Erro')||msg.includes('Preencha')?'#5a1010':'#1a5a20'}`,borderRadius:6,padding:'8px 12px',fontSize:12,color:msg.includes('Erro')||msg.includes('Preencha')?'#f87171':'#4ade80',marginBottom:12}}>{msg}</div>}
<div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
<div><label style={{fontSize:10,color:G,display:'block',marginBottom:4,letterSpacing:1}}>NOME COMPLETO</label><input style={sI} value={nome} onChange={e=>setNome(e.target.value)} placeholder="Ex: João Silva"/></div>
<div><label style={{fontSize:10,color:G,display:'block',marginBottom:4,letterSpacing:1}}>LOGIN (usuário)</label><input style={sI} value={username} onChange={e=>setUsername(e.target.value.toLowerCase().replace(/\s/g,''))} placeholder="Ex: joao.silva"/></div>
<div><label style={{fontSize:10,color:G,display:'block',marginBottom:4,letterSpacing:1}}>SENHA</label><input type="password" style={sI} value={senha} onChange={e=>setSenha(e.target.value)} placeholder="Mínimo 6 caracteres"/></div>
<div><label style={{fontSize:10,color:G,display:'block',marginBottom:4,letterSpacing:1}}>PERFIL DE ACESSO</label>
<select style={sI} value={perfil} onChange={e=>setPerfil(e.target.value)}>
{PERFIS.map(p=><option key={p.value} value={p.value}>{p.label}</option>)}
</select></div>
</div>
<div style={{display:'flex',justifyContent:'flex-end',marginTop:16}}>
<button style={sBP} onClick={submit}>✓ Cadastrar Usuário</button>
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
const [editId,setEditId]=useState<string|null>(null)
const [editCod,setEditCod]=useState('')
const [editNome,setEditNome]=useState('')
const [editCat,setEditCat]=useState('')
const [editUnid,setEditUnid]=useState('unidade(s)')
const [editMsg,setEditMsg]=useState('')
const [showAllMovs,setShowAllMovs]=useState(false)
const [showAllInv,setShowAllInv]=useState(false)
const saveEdit=async()=>{
  const r=await fetch('/api/produtos',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:editId,cod_produto:editCod,nome:editNome,categoria:editCat,unidade_padrao:editUnid})})
  if(!r.ok){setEditMsg('Erro ao salvar');return}
  setEditMsg('Salvo!')
  setEditId(null)
  load()
  setTimeout(()=>setEditMsg(''),2000)
}
const [nome,setNome]=useState(''),[cat,setCat]=useState(''),[unid,setUnid]=useState('unidade(s)'),[msg,setMsg]=useState('')
const [usuarios,setUsuarios]=useState<any[]>([])
const [toast,setToast]=useState(''),[toastE,setToastE]=useState(false)
const [editMov,setEditMov]=useState<any>(null)
const [menuOpen,setMenuOpen]=useState(false)
const [rDe,setRDe]=useState('')
const [rAte,setRAte]=useState('')
const [rLocal,setRLocal]=useState('')
const [rProd,setRProd]=useState('')
const [rEmp,setREmp]=useState('')
const [rUser,setRUser]=useState('')
const [rTipo,setRTipo]=useState('')
const [rAbaRel,setRAbaRel]=useState('movimentos')
const showT=(m:string,e=false)=>{setToast(m);setToastE(e);setTimeout(()=>setToast(''),3000)}
const load=async()=>{
try{
const[m,e,em,pr,us]=await Promise.all([fetch('/api/movimentos').then(r=>r.json()),fetch('/api/estoques').then(r=>r.json()),fetch('/api/empresas').then(r=>r.json()),fetch('/api/produtos').then(r=>r.json()),fetch('/api/usuarios').then(r=>r.json())])
setMovs(Array.isArray(m)?m:[]);setEsts(Array.isArray(e)?e:[]);setEmps(Array.isArray(em)?em:[]);setProds(Array.isArray(pr)?pr:[]);setUsuarios(Array.isArray(us)?us:[])
}catch(err){console.error('Erro ao carregar dados:',err)}
}
useEffect(()=>{if(user)load()},[user])
const login=async()=>{
const r=await fetch('/api/auth',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:lu,senha:lp})})
const d=await r.json();if(!r.ok){showT(d.error,true);return};setUser(d.usuario)
}
const canEdit=(s:string)=>{
  const p=user?.perfil
  if(p==='admin') return true
  if(p==='operador') return true
  return p===s
}
const canView=()=>true
const isAdmin=()=>user?.perfil==='admin'
const isOperador=()=>user?.perfil==='operador'
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
const podeEditar=user?.perfil==='admin'||user?.perfil==='operador'
const editarEst=async(produto:string,qtdAtual:number)=>{
const nova=prompt(`Nova quantidade para "${produto}":`,String(qtdAtual))
if(nova===null)return
const q=parseInt(nova)
if(isNaN(q)||q<0){alert('Quantidade inválida');return}
const r=await fetch('/api/estoques',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({local:loc,produto,quantidade:q})})
if(r.ok){showT('Estoque atualizado!');load()}else showT('Erro ao atualizar',true)
}
const excluirEst=async(produto:string)=>{
if(!confirm(`Excluir "${produto}" do estoque?`))return
const r=await fetch('/api/estoques',{method:'DELETE',headers:{'Content-Type':'application/json'},body:JSON.stringify({local:loc,produto})})
if(r.ok){showT('Produto removido!');load()}else showT('Erro ao remover',true)
}
if(!items.length)return <p style={{color:'#5a4a20',fontSize:13,textAlign:'center',padding:24}}>Nenhum produto em estoque</p>
return <table style={{width:'100%',borderCollapse:'collapse'}}><thead><tr>{(podeEditar?['Produto','Quantidade','Ações']:['Produto','Quantidade']).map(TH)}</tr></thead><tbody>{items.map(([p,q])=><tr key={p}><TD v={p}/><TD v={<strong style={{color:G2}}>{q} un.</strong>}/>{podeEditar&&<TD v={<div style={{display:'flex',gap:4}}><button onClick={()=>editarEst(p,q)} style={{...sB,height:26,padding:'0 8px',fontSize:11}}>✏️</button><button onClick={()=>excluirEst(p)} style={{...sB,height:26,padding:'0 8px',fontSize:11,color:'#f87171',borderColor:'#5a1010'}}>✕</button></div>}/>}</tr>)}</tbody></table>
}
const navItems=[
{id:'dashboard',icon:'⊞',label:'Painel'},
...(user?.perfil==='admin'||user?.perfil==='central'?[{id:'entrada-central',icon:'↓',label:'Entrada Central'},{id:'saida-central',icon:'↑',label:'Saída Central'}]:[]),
...(user?.perfil==='admin'||user?.perfil==='frisa'?[{id:'est-frisa',icon:'▣',label:'Estoque 1° Andar'}]:[]),
...(user?.perfil==='admin'||user?.perfil==='terceiro'?[{id:'est-terceiro',icon:'▣',label:'Estoque 3° Andar'}]:[]),
...(user?.perfil==='admin'||user?.perfil==='barfrisa'?[{id:'bar-barfrisa',icon:'◈',label:'Bar Frisa'}]:[]),
...(user?.perfil==='admin'||user?.perfil==='barboate'?[{id:'bar-barboate',icon:'◈',label:'Bar Boate'}]:[]),
...(user?.perfil==='admin'||user?.perfil==='barterceiro'?[{id:'bar-barterceiro',icon:'◈',label:'Bar 3° Andar'}]:[]),
...(user?.perfil==='admin'||user?.perfil==='central'?[{id:'empresas',icon:'◉',label:'Empresas'},{id:'produtos',icon:'▤',label:'Produtos'}]:[]),
...(user?.perfil==='admin'?[{id:'usuarios',icon:'👤',label:'Usuários'}]:[]),
{id:'historico',icon:'≡',label:'Histórico'},
{id:'relatorio',icon:'📊',label:'Relatório'},
]
const renderAba=()=>{
if(aba==='dashboard'){
  const totalGeral=Object.keys(LOC).filter(k=>k!=='empresa').reduce((a,k)=>a+totLoc(k),0)
  const entHoje=movs.filter(m=>m.tipo==='entrada'&&new Date(m.data).toDateString()===new Date().toDateString()).length
  const saiHoje=movs.filter(m=>m.tipo==='saida'&&new Date(m.data).toDateString()===new Date().toDateString()).length
  const vendasHoje=movs.filter(m=>m.tipo==='venda'&&new Date(m.data).toDateString()===new Date().toDateString())
  const qtdVendasHoje=vendasHoje.length
  const fatHoje=vendasHoje.reduce((a,m)=>a+(m.valor_total||0),0)
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
  // Limites por local
  const LIMITES:Record<string,number>={central:30,frisa:20,terceiro:20,barfrisa:10,barboate:10,barterceiro:10}
  const alertas=ests.filter(e=>{
    const lim=LIMITES[e.local]||10
    return e.quantidade>0 && e.quantidade<=lim
  }).sort((a,b)=>a.quantidade-b.quantidade)

  return <>
    <div style={{marginBottom:20}}>
      <p style={{fontSize:13,color:'#4a3a18'}}>{new Date().toLocaleDateString('pt-BR',{weekday:'long',day:'2-digit',month:'long',year:'numeric'})}</p>
    </div>
    {alertas.length>0&&<div style={{background:'#1a0808',border:'1px solid #8a1a1a',borderRadius:10,padding:'14px 18px',marginBottom:20}}>
      <p style={{color:'#fca5a5',fontWeight:700,fontSize:12,letterSpacing:1,marginBottom:10}}>ALERTA DE ESTOQUE BAIXO ({alertas.length} {alertas.length===1?'item':'itens'})</p>
      <div style={{display:'flex',flexDirection:'column',gap:6}}>
        {alertas.map((e,i)=>{
          const lim=LIMITES[e.local]||10
          const pct=Math.round((e.quantidade/lim)*100)
          return <div key={i} style={{display:'flex',alignItems:'center',gap:10,background:'#2a0a0a',borderRadius:6,padding:'8px 12px'}}>
            <div style={{width:8,height:8,borderRadius:'50%',background:e.quantidade<=Math.floor(lim/2)?'#ef4444':'#f97316',flexShrink:0}}/>
            <div style={{flex:1,fontSize:12,color:'#fca5a5'}}><strong>{e.produto}</strong></div>
            <div style={{fontSize:11,color:'#888'}}>{LOC[e.local]||e.local}</div>
            <div style={{fontSize:12,fontWeight:700,color:e.quantidade<=Math.floor(lim/2)?'#ef4444':'#f97316'}}>{e.quantidade} un.</div>
            <div style={{fontSize:10,color:'#666'}}>min: {lim}</div>
            <div style={{width:60,height:4,background:'#3a1a1a',borderRadius:2,overflow:'hidden'}}>
              <div style={{width:`${Math.min(pct,100)}%`,height:'100%',background:e.quantidade<=Math.floor(lim/2)?'#ef4444':'#f97316'}}/>
            </div>
          </div>
        })}
      </div>
    </div>}
    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))',gap:12,marginBottom:20}}>
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
      <div style={{background:'linear-gradient(135deg,#1a0a2a,#150820)',border:'1px solid #3a2050',borderRadius:12,padding:'20px 18px'}}>
        <div style={{fontSize:10,color:'#9060c0',textTransform:'uppercase' as any,letterSpacing:1.5,marginBottom:10}}>Vendas hoje</div>
        <div style={{fontSize:38,fontWeight:700,color:'#c084fc',letterSpacing:-1}}>{qtdVendasHoje}</div>
        <div style={{fontSize:11,color:'#7040a0',marginTop:4}}>registros de venda</div>
      </div>
      <div style={{background:'linear-gradient(135deg,#1a0a2a,#150820)',border:'1px solid #3a2050',borderRadius:12,padding:'20px 18px'}}>
        <div style={{fontSize:10,color:'#9060c0',textTransform:'uppercase' as any,letterSpacing:1.5,marginBottom:10}}>Faturamento hoje</div>
        <div style={{fontSize:32,fontWeight:700,color:'#c084fc',letterSpacing:-1}}>{fmtR(fatHoje)}</div>
        <div style={{fontSize:11,color:'#7040a0',marginTop:4}}>vendido nos bares hoje</div>
      </div>
    </div>
    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))',gap:12,marginBottom:20}}>
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
            {items.length>0?items.slice(0,3).map(([p,q])=>(
              <div key={p} style={{display:'flex',justifyContent:'space-between',padding:'3px 0'}}>
                <span style={{fontSize:11,color:'#8a7040',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',maxWidth:'72%'}}>{p}</span>
                <span style={{fontSize:11,fontWeight:600,color:G2,flexShrink:0}}>{q} un.</span>
              </div>
            )):<div style={{fontSize:11,color:'#3a3020',fontStyle:'italic'}}>Sem produtos em estoque</div>}
            {items.length>3&&<div style={{fontSize:10,color:'#5a4a20',marginTop:4}}>+{items.length-3} produtos</div>}
          </div>
        </div>
      })}
    </div>
    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))',gap:16}}>
      <div style={sC}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
          <p style={{fontSize:11,fontWeight:700,color:G,letterSpacing:1.5,margin:0}}>ÚLTIMAS MOVIMENTAÇÕES</p>
          <span style={{fontSize:10,color:'#5a4a20',background:'#1a1200',border:'1px solid #2e2810',borderRadius:20,padding:'3px 10px'}}>{movs.length} total</span>
        </div>
        {movs.length===0?<p style={{color:'#5a4a20',fontSize:13,textAlign:'center',padding:24}}>Nenhuma movimentação ainda</p>:
        <div style={{overflowX:'auto'}}>{movs.slice(0,showAllMovs?1000:10).map(m=>(
          <div key={m.id} style={{display:'flex',alignItems:'center',gap:10,padding:'9px 0',borderBottom:'1px solid #1a1600'}}>
            <div style={{width:8,height:8,borderRadius:'50%',background:m.tipo==='entrada'?'#4ade80':m.tipo==='saida'?G:m.tipo==='venda'?'#c084fc':'#a0a0a0',flexShrink:0}}/>
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
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
          <p style={{fontSize:11,fontWeight:700,color:G,letterSpacing:1.5,margin:0}}>INVENTÁRIO COMPLETO</p>
          {allItems.length>10&&<button onClick={()=>setShowAllInv(!showAllInv)} style={{...sB,fontSize:10,padding:'3px 10px',height:'auto'}}>{showAllInv?'Ver menos':'Ver tudo ('+allItems.length+')'}</button>}
        </div>
        {allItems.length===0?<p style={{color:'#5a4a20',fontSize:13,textAlign:'center',padding:24}}>Nenhum produto em estoque</p>:
        <div style={{maxHeight:320,overflowY:'auto'}}>
          <table style={{width:'100%',borderCollapse:'collapse'}}>
            <thead><tr>{['Produto','Local','Qtd'].map(TH)}</tr></thead>
            <tbody>{allItems.sort((a,b)=>b.quantidade-a.quantidade).slice(0,showAllInv?10000:10).map((e,i)=>(
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
    <div style={sC}>
      <p style={{fontSize:11,fontWeight:700,color:'#c084fc',letterSpacing:1.5,marginBottom:14}}>🛒 VENDAS POR BAR</p>
      {(()=>{
        const vendas=movs.filter(m=>m.tipo==='venda')
        const bares=['barfrisa','barboate','barterceiro']
        if(vendas.length===0)return <p style={{color:'#5a4a20',fontSize:13,textAlign:'center',padding:24}}>Nenhuma venda registrada ainda</p>
        const blocos=bares.map(b=>{
          const vb=vendas.filter(m=>m.origem===b)
          if(vb.length===0)return null
          const porProduto:Record<string,{qtd:number,valor:number}>={}
          vb.forEach(m=>{
            if(!porProduto[m.produto])porProduto[m.produto]={qtd:0,valor:0}
            porProduto[m.produto].qtd+=m.quantidade
            porProduto[m.produto].valor+=(m.valor_total||0)
          })
          const totalBar=vb.reduce((a,m)=>a+(m.valor_total||0),0)
          const itens=Object.entries(porProduto).sort((a,b)=>b[1].valor-a[1].valor)
          return <div key={b} style={{background:BG3,border:'1px solid #3a2050',borderRadius:12,padding:'16px 18px'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
              <div style={{fontSize:12,fontWeight:700,color:'#c084fc'}}>{LOC[b]||b}</div>
              <div style={{fontSize:13,fontWeight:700,color:'#c084fc'}}>{fmtR(totalBar)}</div>
            </div>
            <div style={{borderTop:'1px solid #2a1a3a',paddingTop:8}}>
              {itens.map(([p,v])=>(
                <div key={p} style={{display:'grid',gridTemplateColumns:'1fr auto auto',gap:10,padding:'4px 0',alignItems:'center'}}>
                  <span style={{fontSize:11,color:'#c0a0e0',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{p}</span>
                  <span style={{fontSize:11,color:'#9060c0',textAlign:'right' as any}}>{v.qtd} un.</span>
                  <span style={{fontSize:11,fontWeight:600,color:'#c084fc',textAlign:'right' as any,minWidth:70}}>{fmtR(v.valor)}</span>
                </div>
              ))}
            </div>
          </div>
        }).filter(Boolean)
        return <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))',gap:16}}>{blocos}</div>
      })()}
    </div>
  </>
}
if(aba==='entrada-central')return <>{canEdit('central')&&<EntradaForm dest="central" emps={emps} prods={prods} onReg={reg}/>}<div style={sC}><div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}><p style={{fontSize:11,fontWeight:700,color:G,letterSpacing:1.5,margin:0}}>SALDO — ESTOQUE CENTRAL</p><button style={sBP} onClick={()=>exportarExcel('central')}>📊 Exportar Excel</button></div><TblEst loc="central"/></div></>
if(aba==='saida-central')return <>{canEdit('central')&&<SaidaForm orig="central" dests={[{value:'frisa',label:'1° Andar Frisa'},{value:'terceiro',label:'3° Andar'}]} prods={prods} onReg={reg} onSuccess={load}/>}</>
if(aba==='est-frisa')return <><div style={sC}><div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}><p style={{fontSize:11,fontWeight:700,color:G,letterSpacing:1.5,margin:0}}>SALDO — 1° ANDAR FRISA</p><button style={sBP} onClick={()=>exportarExcel('frisa')}>📊 Exportar Excel</button></div><TblEst loc="frisa"/></div>{canEdit('frisa')&&<SaidaForm orig="frisa" dests={[{value:'barfrisa',label:'Bar Frisa'},{value:'barboate',label:'Bar Boate'},{value:'barterceiro',label:'Bar 3° Andar'}]} prods={prods} onReg={reg} onSuccess={load}/>}</>
if(aba==='est-terceiro')return <><div style={sC}><div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}><p style={{fontSize:11,fontWeight:700,color:G,letterSpacing:1.5,margin:0}}>SALDO — 3° ANDAR</p><button style={sBP} onClick={()=>exportarExcel('terceiro')}>📊 Exportar Excel</button></div><TblEst loc="terceiro"/></div>{canEdit('terceiro')&&<SaidaForm orig="terceiro" dests={[{value:'barfrisa',label:'Bar Frisa'},{value:'barboate',label:'Bar Boate'},{value:'barterceiro',label:'Bar 3° Andar'}]} prods={prods} onReg={reg} onSuccess={load}/>}</>
if(aba.startsWith('bar-')){const k=aba.replace('bar-','');return <><div style={sC}><div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}><p style={{fontSize:11,fontWeight:700,color:G,letterSpacing:1.5,margin:0}}>SALDO — {(LOC[k]||k).toUpperCase()}</p><button style={sBP} onClick={()=>exportarExcel(k)}>📊 Exportar Excel</button></div><TblEst loc={k}/></div>{canEdit(k)&&<><EntradaForm dest={k} emps={emps} prods={prods} onReg={reg}/><VendaForm orig={k} prods={prods} onReg={reg} onSuccess={load}/><DevolucaoForm orig={k} prods={prods} onReg={reg}/></>}</>}
if(aba==='produtos')return <><ProdutoForm onAdd={load}/><div style={sC}><p style={{fontSize:11,fontWeight:700,color:G,letterSpacing:1.5,marginBottom:14}}>PRODUTOS CADASTRADOS</p>{prods.length===0?<p style={{color:'#5a4a20',fontSize:13,textAlign:'center',padding:24}}>Nenhum produto</p>:<table style={{width:'100%',borderCollapse:'collapse'}}><thead><tr>{['Codigo','Nome','Categoria','Unidade',''].map(TH)}</tr></thead><tbody>{prods.map(p=><tr key={p.id}><TD v={p.cod_produto||'-'}/><TD v={p.nome}/><TD v={p.categoria||'—'}/><TD v={p.unidade_padrao}/><TD v={canEdit('central')&&<div style={{display:'flex',gap:6}}><button onClick={()=>{setEditId(p.id);setEditCod(p.cod_produto||'');setEditNome(p.nome);setEditCat(p.categoria||'');setEditUnid(p.unidade_padrao||'unidade(s)')}} style={{...sB,height:26,padding:'0 10px',fontSize:11,background:'#1a2a0a',borderColor:'#4a8a2a',color:'#8ac84c'}}>Editar</button><button onClick={()=>delProd(p.id)} style={{...sB,height:26,padding:'0 10px',fontSize:11}}>Excluir</button></div>}/></tr>)}</tbody></table>}{editId&&<div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.85)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:9999}}><div style={{background:'#111',border:'1px solid #C9A84C',borderRadius:10,padding:24,width:'90%',maxWidth:480,display:'flex',flexDirection:'column',gap:14}}><p style={{color:'#C9A84C',fontWeight:700,fontSize:13,letterSpacing:1,margin:0}}>EDITAR PRODUTO</p>{editMsg&&<p style={{color:'#8ac84c',fontSize:12,margin:0}}>{editMsg}</p>}{LBL('CODIGO')}<div style={{display:'flex',gap:8,alignItems:'center'}}><input style={{...sI,flex:1}} value={editCod} onChange={e=>setEditCod(e.target.value)} placeholder='Ex: 7891234'/><Scanner onScan={(c)=>setEditCod(c)}/></div>{LBL('NOME')}<input style={sI} value={editNome} onChange={e=>setEditNome(e.target.value)}/>{LBL('CATEGORIA')}<input style={sI} value={editCat} onChange={e=>setEditCat(e.target.value)}/>{LBL('UNIDADE')}<select style={sI} value={editUnid} onChange={e=>setEditUnid(e.target.value)}>{UNIDS.map(u=><option key={u}>{u}</option>)}</select><div style={{display:'flex',gap:10,justifyContent:'flex-end',marginTop:8}}><button style={sB} onClick={()=>setEditId(null)}>Cancelar</button><button style={sBP} onClick={saveEdit}>Salvar</button></div></div></div>}</div></>
if(aba==='empresas')return <><EmpresaForm onAdd={load}/><div style={sC}><p style={{fontSize:11,fontWeight:700,color:G,letterSpacing:1.5,marginBottom:14}}>EMPRESAS CADASTRADAS</p>{emps.length===0?<p style={{color:'#5a4a20',fontSize:13,textAlign:'center',padding:24}}>Nenhuma empresa</p>:<table style={{width:'100%',borderCollapse:'collapse'}}><thead><tr>{['Cód.','CNPJ/CPF','Nome','Produto','Telefone','E-mail',''].map(TH)}</tr></thead><tbody>{emps.map(e=><tr key={e.id}>{[e.cod_produto,e.documento,e.nome,e.produto||'—',e.telefone||'—',e.email||'—'].map((v,i)=><TD key={i} v={v}/>)}<TD v={canEdit('central')&&<button onClick={()=>delEmp(e.id)} style={{...sB,height:26,padding:'0 10px',fontSize:11}}>Excluir</button>}/></tr>)}</tbody></table>}</div></>
if(aba==='usuarios')return <><UsuarioForm onAdd={load}/><div style={sC}>
<p style={{fontSize:11,fontWeight:700,color:G,letterSpacing:1.5,marginBottom:14}}>USUÁRIOS CADASTRADOS</p>
{usuarios.length===0?<p style={{color:'#5a4a20',fontSize:13,textAlign:'center',padding:24}}>Nenhum usuário</p>:
<table style={{width:'100%',borderCollapse:'collapse'}}>
<thead><tr>{['Login','Nome','Perfil','Status','Senha',''].map(TH)}</tr></thead>
<tbody>{usuarios.map(u=><tr key={u.id}>
<TD v={u.username}/>
<TD v={u.nome_completo||u.nome}/>
<TD v={<span style={{background:'#1a1200',color:G,border:`1px solid ${BOR}`,borderRadius:20,padding:'2px 10px',fontSize:11}}>{u.perfil}</span>}/>
<TD v={<span style={{background:u.bloqueado?'#1a0808':'#0d2010',color:u.bloqueado?'#f87171':'#4ade80',border:`1px solid ${u.bloqueado?'#5a1010':'#1a5a20'}`,borderRadius:20,padding:'2px 10px',fontSize:11}}>{u.bloqueado?'🔒 Bloqueado':'✓ Ativo'}</span>}/>
<TD v={<button onClick={async()=>{const ns=prompt('Nova senha:');if(ns){const r=await fetch('/api/usuarios',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:u.id,senha:ns,bloqueado:u.bloqueado,nome:u.nome,nome_completo:u.nome_completo})});if(r.ok){showT('Senha alterada!');load()}else showT('Erro',true)}}} style={{...sB,height:26,padding:'0 10px',fontSize:11}}>🔑 Alterar</button>}/>
<TD v={<div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
<select value={u.perfil} onChange={async(e)=>{const r=await fetch('/api/usuarios',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:u.id,perfil:e.target.value,bloqueado:u.bloqueado,senha:u.senha,nome:u.nome,nome_completo:u.nome_completo})});if(r.ok){showT('Perfil atualizado!');load()}else showT('Erro',true)}} style={{...sI,height:28,fontSize:11,width:'auto',padding:'0 8px'}} disabled={u.username==='admin'}>
<option value="admin">Admin</option>
<option value="operador">Operador</option>
<option value="central">Est. Central</option>
<option value="frisa">1° Frisa</option>
<option value="terceiro">3° Andar</option>
<option value="barfrisa">Bar Frisa</option>
<option value="barboate">Bar Boate</option>
<option value="barterceiro">Bar 3° Andar</option>
</select>
<button onClick={async()=>{const r=await fetch('/api/usuarios',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:u.id,bloqueado:!u.bloqueado,senha:u.senha,nome:u.nome,nome_completo:u.nome_completo,perfil:u.perfil})});if(r.ok){showT(u.bloqueado?'Desbloqueado!':'Bloqueado!');load()}else showT('Erro',true)}} style={{...sB,height:28,padding:'0 10px',fontSize:11,color:u.bloqueado?'#4ade80':'#f87171',borderColor:u.bloqueado?'#1a5a20':'#5a1010'}}>{u.bloqueado?'🔓':'🔒'}</button>
{u.username!=='admin'&&<button onClick={async()=>{if(confirm('Excluir usuário?')){const r=await fetch('/api/usuarios',{method:'DELETE',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:u.id})});if(r.ok){showT('Excluído');load()}else showT('Erro',true)}}} style={{...sB,height:28,padding:'0 8px',fontSize:11,color:'#f87171',borderColor:'#5a1010'}}>✕</button>}
</div>}/>
</tr>)}</tbody>
</table>}
</div></>

if(aba==='relatorio')return <div style={sC}>
<div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20,flexWrap:'wrap',gap:10}}>
<p style={{fontSize:11,fontWeight:700,color:G,letterSpacing:1.5,margin:0}}>RELATÓRIO DE MOVIMENTAÇÕES</p>
<div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
<button onClick={()=>{
const t=document.getElementById('rel-table') as HTMLElement|null;
const w=window.open('','_blank');
if(w){w.document.write('<html><head><title>Relatório Atmosfera</title><style>body{font-family:Arial,sans-serif;font-size:12px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #ccc;padding:6px 8px;text-align:left}th{background:#1a1a0a;color:#C9A84C}tr:nth-child(even){background:#f9f9f0}h2{color:#1a1a0a}@media print{button{display:none}}</style></head><body><h2>Camarote Atmosfera — Relatório de Movimentações</h2><p>Gerado em: '+new Date().toLocaleString('pt-BR')+'</p>'+(t?.outerHTML||'')+'<br/><button onclick="window.print()">Imprimir</button></body></html>');
w.document.close();w.focus();w.print();}
}} style={{...sB,height:34,padding:'0 14px',fontSize:11}}>🖨️ Imprimir PDF</button>
<button onClick={()=>{
const rFil=movs.filter(m=>{
let ok=true;
if(rLocal&&m.origem!==rLocal&&m.destino!==rLocal)ok=false;
if(rProd&&!m.produto.toLowerCase().includes(rProd.toLowerCase()))ok=false;
if(rEmp&&m.empresa_id){const emp=emps.find(e=>e.id===m.empresa_id);if(!emp||!emp.nome.toLowerCase().includes(rEmp.toLowerCase()))ok=false;}
if(rUser&&m.responsavel&&!m.responsavel.toLowerCase().includes(rUser.toLowerCase()))ok=false;
if(rTipo&&m.tipo!==rTipo)ok=false;
if(rDe&&new Date(m.data)<new Date(rDe))ok=false;
if(rAte&&new Date(m.data)>new Date(rAte+'T23:59:59'))ok=false;
return ok;
});
const wb=XLSX.utils.book_new();
const ws=XLSX.utils.json_to_sheet(rFil.length>0?rFil.map(m=>({'Data':fdt(m.data),'Tipo':m.tipo,'Produto':m.produto,'Quantidade':m.quantidade,'Unidade':m.unidade,'Origem':LOC[m.origem]||m.origem,'Destino':LOC[m.destino]||m.destino,'NF':m.nf_numero||'','Responsável':m.responsavel||'','Observação':m.observacao||''})):[{'Data':'','Tipo':'Sem movimentações','Produto':'','Quantidade':0,'Unidade':'','Origem':'','Destino':'','NF':'','Responsável':'','Observação':''}]);
XLSX.utils.book_append_sheet(wb,ws,'Relatório');
XLSX.writeFile(wb,'relatorio-atmosfera.xlsx');
}} style={{...sB,height:34,padding:'0 14px',fontSize:11,background:'#1a4a1a',borderColor:'#4a8a4a',color:'#8aba8a'}}>📥 Excel</button>
</div>
</div>
<div style={{display:'flex',gap:8,marginBottom:16,borderBottom:`1px solid ${BOR}`}}>
<button onClick={()=>setRAbaRel('movimentos')} style={{padding:'8px 16px',fontSize:11,letterSpacing:1,background:'transparent',border:'none',cursor:'pointer',color:rAbaRel==='movimentos'?G:'#5a4a20',borderBottom:rAbaRel==='movimentos'?`2px solid ${G}`:'2px solid transparent',fontWeight:rAbaRel==='movimentos'?700:400}}>MOVIMENTAÇÕES</button>
<button onClick={()=>setRAbaRel('permanencia')} style={{padding:'8px 16px',fontSize:11,letterSpacing:1,background:'transparent',border:'none',cursor:'pointer',color:rAbaRel==='permanencia'?G:'#5a4a20',borderBottom:rAbaRel==='permanencia'?`2px solid ${G}`:'2px solid transparent',fontWeight:rAbaRel==='permanencia'?700:400}}>PERMANÊNCIA NO ESTOQUE</button>
</div>
{rAbaRel==='permanencia'&&(()=>{
const entradas=movs.filter(m=>m.tipo==='entrada'||m.tipo==='transferencia');
const saidas=movs.filter(m=>m.tipo==='saida'||m.tipo==='transferencia');
const prods=[...new Set(movs.map(m=>m.produto))];
const rows:any[]=[];
prods.forEach(prod=>{
const locs=[...new Set([...movs.filter(m=>m.produto===prod&&m.destino).map(m=>m.destino),...movs.filter(m=>m.produto===prod&&m.origem).map(m=>m.origem)])];
locs.forEach(loc=>{
const ents=movs.filter(m=>m.produto===prod&&(m.destino===loc)&&(m.tipo==='entrada'||m.tipo==='transferencia')).sort((a,b)=>new Date(a.data).getTime()-new Date(b.data).getTime());
const sais=movs.filter(m=>m.produto===prod&&(m.origem===loc)&&(m.tipo==='saida'||m.tipo==='transferencia')).sort((a,b)=>new Date(a.data).getTime()-new Date(b.data).getTime());
if(ents.length>0){
const dtEnt=ents[0].data;
const dtSai=sais.length>0?sais[sais.length-1].data:null;
const dias=dtSai?Math.round((new Date(dtSai).getTime()-new Date(dtEnt).getTime())/(1000*60*60*24)):Math.round((new Date().getTime()-new Date(dtEnt).getTime())/(1000*60*60*24));
rows.push({prod,loc,dtEnt,dtSai,dias,atual:!dtSai});
}
});
});
return <><p style={{fontSize:11,color:'#5a4a20',marginBottom:8}}>{rows.length} registro(s)</p>
<div style={{overflowX:'auto'}}><table style={{width:'100%',borderCollapse:'collapse'}}>
<thead><tr>{['Produto','Local','Data Entrada','Data Saída','Dias no Estoque','Status'].map(h=><th key={h} style={{fontSize:10,color:G,letterSpacing:1,padding:'8px 10px',borderBottom:`1px solid ${BOR}`,textAlign:'left',whiteSpace:'nowrap'}}>{h}</th>)}</tr></thead>
<tbody>{rows.length===0?<tr><td colSpan={6} style={{textAlign:'center',padding:24,color:'#5a4a20'}}>Sem dados</td></tr>:rows.map((r,i)=><tr key={i} style={{borderBottom:`1px solid ${BOR}22`}}>
<td style={{fontSize:11,padding:'7px 10px'}}>{r.prod}</td>
<td style={{fontSize:11,padding:'7px 10px',whiteSpace:'nowrap'}}>{LOC[r.loc]||r.loc}</td>
<td style={{fontSize:11,padding:'7px 10px',whiteSpace:'nowrap'}}>{fdt(r.dtEnt)}</td>
<td style={{fontSize:11,padding:'7px 10px',whiteSpace:'nowrap'}}>{r.dtSai?fdt(r.dtSai):'—'}</td>
<td style={{fontSize:11,padding:'7px 10px',textAlign:'center'}}>{r.dias}</td>
<td style={{fontSize:11,padding:'7px 10px'}}><span style={{background:r.atual?'#1a3a1a':'#2a2a2a',color:r.atual?'#4aaa4a':'#888',padding:'2px 8px',borderRadius:4,fontSize:10}}>{r.atual?'No estoque':'Saiu'}</span></td>
</tr>)}</tbody>
</table></div></>})()}
{rAbaRel==='movimentos'&&<div style={{marginBottom:16}}>
<div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:8}}>
<input value={rDe} onChange={e=>setRDe(e.target.value)} type="date" style={{...sI,height:36,fontSize:11,width:150}}/>
<input value={rAte} onChange={e=>setRAte(e.target.value)} type="date" style={{...sI,height:36,fontSize:11,width:150}}/>
<select value={rLocal} onChange={e=>setRLocal(e.target.value)} style={{...sI,height:36,fontSize:11,width:180}}><option value="">Todos os locais</option>{Object.entries(LOC).map(([k,v])=><option key={k} value={k}>{v as string}</option>)}</select>
<select value={rTipo} onChange={e=>setRTipo(e.target.value)} style={{...sI,height:36,fontSize:11,width:160}}><option value="">Todos os tipos</option><option value="entrada">Entrada</option><option value="saida">Saída</option><option value="transferencia">Transferência</option><option value="devolucao">Devolução</option><option value="venda">Venda</option></select>
</div>
<div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:8}}>
<input value={rProd} onChange={e=>setRProd(e.target.value)} style={{...sI,height:36,fontSize:11,width:160}} placeholder="🔍 Produto..."/>
<input value={rEmp} onChange={e=>setREmp(e.target.value)} style={{...sI,height:36,fontSize:11,width:160}} placeholder="🏢 Empresa..."/>
<input value={rUser} onChange={e=>setRUser(e.target.value)} style={{...sI,height:36,fontSize:11,width:180}} placeholder="👤 Usuário/Responsável..."/>
<button onClick={()=>{setRDe('');setRAte('');setRLocal('');setRProd('');setREmp('');setRUser('');setRTipo('')}} style={{...sB,height:36,padding:'0 16px',fontSize:11,background:'transparent',borderColor:`${G}44`,color:G}}>✕ Limpar</button>
</div>
</div>}
{(()=>{const rFil=movs.filter(m=>{
let ok=true;
if(rLocal&&m.origem!==rLocal&&m.destino!==rLocal)ok=false;
if(rProd&&!m.produto.toLowerCase().includes(rProd.toLowerCase()))ok=false;
if(rEmp&&m.empresa_id){const emp=emps.find(e=>e.id===m.empresa_id);if(!emp||!emp.nome.toLowerCase().includes(rEmp.toLowerCase()))ok=false;}
if(rUser&&m.responsavel&&!m.responsavel.toLowerCase().includes(rUser.toLowerCase()))ok=false;
if(rTipo&&m.tipo!==rTipo)ok=false;
if(rDe&&new Date(m.data)<new Date(rDe))ok=false;
if(rAte&&new Date(m.data)>new Date(rAte+'T23:59:59'))ok=false;
return ok;
});
return <><p style={{fontSize:11,color:'#5a4a20',marginBottom:8}}>{rFil.length} movimentação(ões) encontrada(s)</p>{rFil.some(m=>m.tipo==='venda')&&<p style={{fontSize:13,color:G2,marginBottom:8}}>💰 Total vendido: <strong style={{color:G}}>{fmtR(rFil.filter(m=>m.tipo==='venda').reduce((a,m)=>a+(m.valor_total||0),0))}</strong></p>}
<div style={{overflowX:'auto'}}><table id="rel-table" style={{width:'100%',borderCollapse:'collapse'}}>
<thead><tr>{['Data','Tipo','Produto','Qtd','Unid','Origem','Destino','NF','Responsável','Usuário','Obs'].map(h=><th key={h} style={{fontSize:10,color:G,letterSpacing:1,padding:'8px 10px',borderBottom:`1px solid ${BOR}`,textAlign:'left',whiteSpace:'nowrap'}}>{h}</th>)}</tr></thead>
<tbody>{rFil.length===0?<tr><td colSpan={11} style={{textAlign:'center',padding:24,color:'#5a4a20',fontSize:13}}>Nenhuma movimentação encontrada</td></tr>:rFil.map(m=><tr key={m.id} style={{borderBottom:`1px solid ${BOR}22`}}>
<td style={{fontSize:11,padding:'7px 10px',whiteSpace:'nowrap',color:'#e8e0d0'}}>{fdt(m.data)}</td>
<td style={{fontSize:11,padding:'7px 10px'}}><span style={{background:m.tipo==='entrada'?'#1a3a1a':m.tipo==='saida'?'#3a1a1a':m.tipo==='transferencia'?'#1a1a3a':m.tipo==='venda'?'#2a1a3a':'#2a2a1a',color:m.tipo==='entrada'?'#4aaa4a':m.tipo==='saida'?'#aa4a4a':m.tipo==='transferencia'?'#4a4aaa':m.tipo==='venda'?'#c084fc':'#aaaa4a',padding:'2px 8px',borderRadius:4,fontSize:10,whiteSpace:'nowrap'}}>{m.tipo}</span></td>
<td style={{fontSize:11,padding:'7px 10px',color:'#e8e0d0'}}>{m.produto}</td>
<td style={{fontSize:11,padding:'7px 10px',color:'#e8e0d0'}}>{m.quantidade}</td>
<td style={{fontSize:11,padding:'7px 10px',color:'#e8e0d0'}}>{m.unidade}</td>
<td style={{fontSize:11,padding:'7px 10px',whiteSpace:'nowrap'}}>{LOC[m.origem]||m.origem||'-'}</td>
<td style={{fontSize:11,padding:'7px 10px',whiteSpace:'nowrap'}}>{LOC[m.destino]||m.destino||'-'}</td>
<td style={{fontSize:11,padding:'7px 10px'}}>{m.nf_numero||'-'}</td>
<td style={{fontSize:11,padding:'7px 10px'}}>{m.responsavel||'-'}</td>
<td style={{fontSize:11,padding:'7px 10px'}}>{m.usuario_id||'-'}</td>
<td style={{fontSize:11,padding:'7px 10px'}}>{m.observacao||'-'}</td>
</tr>)}</tbody>
</table></div></>})()}
</div>
if(aba==='historico')return <>
{editMov&&<div style={{...sC,border:`1px solid ${G}`,marginBottom:16}}>
  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
    <p style={{fontSize:12,fontWeight:700,color:G,letterSpacing:1.5,margin:0}}>✏️ EDITAR MOVIMENTAÇÃO</p>
    <button style={{...sB,height:28,padding:'0 12px',fontSize:11}} onClick={()=>setEditMov(null)}>✕ Fechar</button>
  </div>
  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
    <div><label style={{fontSize:10,color:G,display:'block',marginBottom:4,letterSpacing:1}}>TIPO</label>
    <select style={sI} value={editMov.tipo} onChange={e=>setEditMov({...editMov,tipo:e.target.value})}>
      <option value="entrada">entrada</option><option value="saida">saida</option><option value="devolucao">devolucao</option><option value="venda">venda</option>
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
</>}
if(!user)return(
<div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:`radial-gradient(ellipse at center,#1a1200 0%,${BG} 70%)`}}>
<div style={{width:'min(420px,92vw)',padding:'clamp(24px,6vw,44px) clamp(20px,6vw,40px)',background:`linear-gradient(160deg,${BG3},${BG2})`,border:`1px solid ${BOR}`,borderRadius:16,boxShadow:'0 0 80px #C9A84C10'}}>
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

</div>
</div>
)
return(
<div style={{display:'flex',minHeight:'100vh',background:BG,fontFamily:'system-ui,sans-serif'}} className='app-root'>
{menuOpen&&<div className='menu-overlay' onClick={()=>setMenuOpen(false)}></div>}<div className={'sidebar-desktop'+(menuOpen?' menu-open':'')} style={{width:220,minWidth:220,background:'#111',borderRight:`1px solid ${BOR}`,display:'flex',flexDirection:'column',height:'100vh',position:'sticky',top:0}}><div style={{padding:'20px 16px',borderBottom:`1px solid ${BOR}`,textAlign:'center'}}>
<img src="/logo.png" alt="Atmosfera" style={{width:160,display:'block',margin:'0 auto'}}/>
</div>
<div style={{flex:1,padding:'12px 8px',overflowY:'auto'}}>
{navItems.map(n=>(
<button key={n.id} onClick={()=>{setAba(n.id);setMenuOpen(false)}} style={{width:'100%',display:'flex',alignItems:'center',gap:10,padding:'10px 12px',marginBottom:2,border:'none',borderRadius:8,cursor:'pointer',background:aba===n.id?`linear-gradient(135deg,${G3}33,${G}22)`:'transparent',color:aba===n.id?G2:'#5a4a20',fontWeight:aba===n.id?700:400,fontSize:13,textAlign:'left',borderLeft:aba===n.id?`2px solid ${G}`:'2px solid transparent'}}>
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
<button className='hamburger-btn' onClick={()=>setMenuOpen(true)}>☰</button>
<div style={{padding:'24px',maxWidth:1100,margin:'0 auto'}}>
<div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}><p style={{fontSize:11,color:'#4a3a18',letterSpacing:2,textTransform:'uppercase',margin:0}}>{navItems.find(n=>n.id===aba)?.label||'Painel'}</p><button onClick={()=>{setAba('dashboard');load()}} style={{...sB,height:32,padding:'0 14px',fontSize:11,letterSpacing:1}}>🔄 Atualizar</button></div>
{renderAba()}
</div>
</div>
</div>
)
}
