export const dimensions = [
  ['build','Build & Fix','Hands-on work, tools, machines, practical problem-solving'],
  ['analyze','Analyse & Solve','Numbers, evidence, logic, investigation and complex problems'],
  ['create','Create & Design','Ideas, design, originality and making new things'],
  ['help','Help & Connect','Supporting, teaching, caring and working with people'],
  ['lead','Lead & Influence','Taking initiative, persuading, leading and enterprise'],
  ['organize','Organise & Deliver','Planning, detail, systems, records and dependable execution']
] as const;

export const questions = [
['q1','I enjoy repairing, assembling or working with physical things.','build'],['q2','I would rather learn by doing than only by reading.','build'],['q3','I enjoy understanding how machines or systems work.','build'],['q4','I like seeing a physical result from my work.','build'],
['q5','I enjoy solving difficult problems even when they take time.','analyze'],['q6','I like working with numbers, evidence or patterns.','analyze'],['q7','I enjoy science, experiments or investigating why something happens.','analyze'],['q8','I usually want to understand the reason behind an answer.','analyze'],
['q9','I enjoy drawing, designing, writing or creating original ideas.','create'],['q10','I notice how things look and how they could be improved.','create'],['q11','I enjoy making something different from what already exists.','create'],['q12','I like work that gives me room to use imagination.','create'],
['q13','I enjoy helping someone understand or solve a problem.','help'],['q14','I would be comfortable working closely with people every day.','help'],['q15','I care about work that improves people’s lives.','help'],['q16','People often come to me for support or advice.','help'],
['q17','I enjoy taking responsibility when a group needs direction.','lead'],['q18','I would like to run a business or project one day.','lead'],['q19','I am comfortable presenting ideas or persuading people.','lead'],['q20','I enjoy setting goals and getting others moving.','lead'],
['q21','I like keeping information, tasks or spaces well organised.','organize'],['q22','I notice details that other people sometimes miss.','organize'],['q23','I enjoy following a plan and completing it properly.','organize'],['q24','I am comfortable with records, schedules, lists or procedures.','organize']
] as const;

export function scoreAssessment(answers: Record<string,number>) {
  const sums: Record<string,{sum:number,count:number}> = {};
  for (const [, , d] of questions) sums[d] ??= {sum:0,count:0};
  for (const [id,,d] of questions) { const v=Math.max(1,Math.min(5,Number(answers[id]||3))); sums[d].sum += v; sums[d].count++; }
  return Object.fromEntries(Object.entries(sums).map(([k,v])=>[k, Math.round(((v.sum-v.count)/(v.count*4))*100)]));
}
