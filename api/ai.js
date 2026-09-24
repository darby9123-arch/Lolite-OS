export default async function handler(req,res){
  res.setHeader('Access-Control-Allow-Origin','*');
  res.setHeader('Access-Control-Allow-Methods','POST, OPTIONS, GET');
  res.setHeader('Access-Control-Allow-Headers','Content-Type');
  if(req.method==='OPTIONS')return res.status(204).end();
  if(req.method==='GET')return res.status(200).json({ok:true,service:'Lolite AI API'});
  if(req.method!=='POST')return res.status(405).json({error:'Method not allowed. Use POST.'});
  const key=process.env.OPENAI_API_KEY;
  if(!key)return res.status(503).json({error:'OPENAI_API_KEY is not configured on this deployment.'});
  let body;
  try{body=typeof req.body==='string'?JSON.parse(req.body):req.body||{}}catch{return res.status(400).json({error:'Invalid JSON'})}
  const message=String(body.message||'').trim().slice(0,8000);
  if(!message)return res.status(400).json({error:'Message is required'});
  const model=process.env.OPENAI_MODEL||'gpt-5.6-luna';
  try{
    const r=await fetch('https://api.openai.com/v1/responses',{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+key},body:JSON.stringify({model,instructions:'You are Lolite AI, the friendly built-in assistant for Lolite OS. Be concise, helpful and age-appropriate. Help with Lolite OS, coding, games, school-safe questions and creative ideas. Never claim to have performed actions you did not perform.',input:message,max_output_tokens:1200})});
    const raw=await r.text();let data={};try{data=JSON.parse(raw)}catch{}
    if(!r.ok)return res.status(r.status).json({error:data?.error?.message||`OpenAI request failed (${r.status}).`});
    const output=data.output_text||data.output?.flatMap(x=>x.content||[]).filter(x=>x.type==='output_text').map(x=>x.text).join('')||'';
    return res.status(200).json({output:output||'No response.'});
  }catch(e){return res.status(500).json({error:e?.message||'AI request failed.'})}
}