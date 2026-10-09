export default async function handler(req,res){
  res.setHeader('Access-Control-Allow-Origin','*');
  res.setHeader('Access-Control-Allow-Methods','GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers','Content-Type');
  res.setHeader('Vary','Origin');
  res.setHeader('Content-Type','application/json; charset=utf-8');
  if(req.method==='OPTIONS')return res.status(204).end();
  if(req.method==='GET')return res.status(200).json({ok:true,service:'Lolite AI API',configured:Boolean(process.env.OPENAI_API_KEY)});
  if(req.method!=='POST')return res.status(405).json({error:'Method not allowed. Send a POST request.'});
  const key=process.env.OPENAI_API_KEY;
  if(!key)return res.status(503).json({error:'Lolite AI needs OPENAI_API_KEY configured in the Vercel project environment variables.'});
  let body;
  try{body=typeof req.body==='string'?JSON.parse(req.body):req.body||{}}catch{return res.status(400).json({error:'Invalid JSON request body.'})}
  const message=String(body.message||'').trim().slice(0,8000);
  if(!message)return res.status(400).json({error:'Type a message before sending it.'});
  const model=process.env.OPENAI_MODEL||'gpt-4.1-mini';
  const controller=new AbortController();
  const timer=setTimeout(()=>controller.abort(),25000);
  try{
    const upstream=await fetch('https://api.openai.com/v1/responses',{
      method:'POST',
      headers:{'Content-Type':'application/json','Authorization':'Bearer '+key},
      signal:controller.signal,
      body:JSON.stringify({
        model,
        instructions:'You are Lolite AI, the friendly built-in assistant for Lolite OS. Be concise, helpful and age-appropriate. Help with Lolite OS, coding, games, school-safe questions and creative ideas. Never claim to have performed actions you did not perform.',
        input:message,
        max_output_tokens:1200
      })
    });
    const raw=await upstream.text();
    let data={};try{data=JSON.parse(raw)}catch{}
    if(!upstream.ok){
      const message=data?.error?.message||`The AI provider returned HTTP ${upstream.status}.`;
      return res.status(upstream.status>=500?502:upstream.status).json({error:message,providerStatus:upstream.status});
    }
    const output=data.output_text||data.output?.flatMap(x=>x.content||[]).filter(x=>x.type==='output_text').map(x=>x.text).join('')||'';
    if(!output)return res.status(502).json({error:'The AI provider returned an empty response. Please try again.'});
    return res.status(200).json({output});
  }catch(e){
    const timedOut=e?.name==='AbortError';
    return res.status(timedOut?504:502).json({error:timedOut?'The AI request took too long. Please try again.':'Could not reach the AI provider. Please try again.'});
  }finally{clearTimeout(timer)}
}
