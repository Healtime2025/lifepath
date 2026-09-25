export async function openAIText(instructions: string, input: string, max=900) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error('AI_NOT_CONFIGURED');
  const model = process.env.OPENAI_MODEL || 'gpt-5.6-luna';
  const res = await fetch('https://api.openai.com/v1/responses', {
    method:'POST', headers:{'Authorization':`Bearer ${key}`,'Content-Type':'application/json'},
    body: JSON.stringify({ model, instructions, input, max_output_tokens:max })
  });
  if (!res.ok) throw new Error(`AI request failed (${res.status})`);
  const data = await res.json();
  if (typeof data.output_text === 'string') return data.output_text;
  const text = (data.output || []).flatMap((o:any)=>o.content||[]).filter((c:any)=>c.type==='output_text').map((c:any)=>c.text).join('\n');
  if (!text) throw new Error('AI returned no text');
  return text;
}
