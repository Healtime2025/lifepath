export const careerFamilyOrder = [
  'Engineering & Technology','Trades & Artisan Careers','Health & Life Sciences','Business, Finance & Entrepreneurship',
  'Agriculture & Food','Construction & Built Environment','IT & Digital Technology','Creative, Media & Design',
  'Education & Community Services','Law, Safety & Public Service','Hospitality & Tourism','Administration & Customer Services',
  'Transport, Logistics & Supply Chain','Environment, Water & Green Economy','Manufacturing & Mining'
] as const;

const map: Record<string,string> = {
  Engineering:'Engineering & Technology','Engineering & Trades':'Engineering & Technology',Technology:'IT & Digital Technology',
  Trades:'Trades & Artisan Careers',Health:'Health & Life Sciences','Science & Health':'Health & Life Sciences',Science:'Health & Life Sciences',
  'Health & Community':'Health & Life Sciences','Business & Finance':'Business, Finance & Entrepreneurship','Business & People':'Business, Finance & Entrepreneurship',
  'Creative & Business':'Business, Finance & Entrepreneurship',Agriculture:'Agriculture & Food',Construction:'Construction & Built Environment',
  'Built Environment':'Construction & Built Environment','Creative & Media':'Creative, Media & Design','Creative & Technology':'Creative, Media & Design',
  Education:'Education & Community Services','Education & Information':'Education & Community Services','Community & Care':'Education & Community Services',
  Law:'Law, Safety & Public Service','Administration & Law':'Law, Safety & Public Service','Public Safety':'Law, Safety & Public Service','Public Service':'Law, Safety & Public Service',
  Hospitality:'Hospitality & Tourism',Tourism:'Hospitality & Tourism',Administration:'Administration & Customer Services','Customer Service':'Administration & Customer Services',
  Logistics:'Transport, Logistics & Supply Chain',Transport:'Transport, Logistics & Supply Chain','Business & Logistics':'Transport, Logistics & Supply Chain',
  'Green Economy':'Environment, Water & Green Economy','Water & Environment':'Environment, Water & Green Economy','Science & Environment':'Environment, Water & Green Economy',
  Manufacturing:'Manufacturing & Mining',Mining:'Manufacturing & Mining',Retail:'Administration & Customer Services','Personal Services':'Hospitality & Tourism'
};
export function careerFamily(category:string){return map[category]||category||'Other careers'}
export function familySort(a:string,b:string){const ai=careerFamilyOrder.indexOf(a as any),bi=careerFamilyOrder.indexOf(b as any);return (ai<0?999:ai)-(bi<0?999:bi)||a.localeCompare(b)}
