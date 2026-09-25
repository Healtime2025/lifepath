export type Scores = Record<string, number>;
export function careerMatch(traits: Scores, learner: Scores) {
  const keys = ['build','analyze','create','help','lead','organize'];
  const distance = keys.reduce((sum,k)=>sum + Math.abs(Number(traits[k]||0)-Number(learner[k]||0)),0) / keys.length;
  return Math.max(0, Math.round(100-distance));
}
function findMark(subject:string, marks:Record<string,number>){
  if(marks[subject]!=null) return marks[subject];
  if(subject==='English'){
    const k=Object.keys(marks).find(x=>x.toLowerCase().includes('english'));
    return k?marks[k]:undefined;
  }
  return undefined;
}
export function academicSignal(subjectGuidance: Record<string,string>, marks: Record<string,number>) {
  const entries=Object.entries(subjectGuidance||{});
  const values:number[]=[];
  for(const [subject,importanceRaw] of entries){
    const mark=findMark(subject,marks); if(mark==null) continue;
    const importance=String(importanceRaw).toLowerCase();
    const target=importance==='important'||importance==='often required'?70:importance==='recommended'?60:50;
    const signal=Math.max(0,Math.min(100,50+(mark-target)*2));
    values.push(signal);
  }
  return values.length?Math.round(values.reduce((a,b)=>a+b,0)/values.length):null;
}
export function subjectGap(subjectGuidance: Record<string,string>, marks: Record<string,number>) {
  return Object.entries(subjectGuidance||{}).map(([subject,importance])=>({subject,importance,mark:findMark(subject,marks) ?? null}));
}
export function pathwayLabel(p:string) {
  return ({university:'University',university_of_technology:'University of Technology',tvet:'TVET',occupational:'Occupational qualification',apprenticeship:'Apprenticeship',learnership:'Learnership',self_employment:'Entrepreneurship / self-employment'} as Record<string,string>)[p] || p.replaceAll('_',' ');
}
