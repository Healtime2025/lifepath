import { subjectAliases } from './subjects';
export type Scores = Record<string, number>;
export function careerMatch(traits: Scores, learner: Scores) {
  const keys = [
    'build',
    'analyze',
    'create',
    'help',
    'lead',
    'organize'
  ];

  const learnerValues = keys.map(
    (key) => Number(learner[key] || 0)
  );

  const careerValues = keys.map(
    (key) => Number(traits[key] || 0)
  );

  /*
   * LP-2.2 Pattern-aware matching
   *
   * We compare the complete six-dimension profile,
   * but give more influence to dimensions that are
   * genuinely strong for this learner.
   *
   * This prevents a generally high-scoring learner
   * from appearing equally suited to almost everything.
   */

  const weightedDistance = keys.reduce((total, key, index) => {
    const learnerScore = learnerValues[index];
    const careerScore = careerValues[index];

    /*
     * Strong learner dimensions carry more weight.
     *
     * 0-59  -> 1.0
     * 60-74 -> 1.25
     * 75-84 -> 1.6
     * 85+   -> 2.0
     */
    const weight =
      learnerScore >= 85
        ? 2
        : learnerScore >= 75
          ? 1.6
          : learnerScore >= 60
            ? 1.25
            : 1;

    return {
      distance:
        total.distance +
        Math.abs(careerScore - learnerScore) * weight,
      weight: total.weight + weight
    };
  }, { distance: 0, weight: 0 });

  const absoluteFit =
    100 -
    weightedDistance.distance / weightedDistance.weight;

  /*
   * Rank-pattern similarity.
   *
   * Reward careers whose strongest traits occur in
   * the same areas as the learner's strongest traits.
   */
  const learnerRank = [...keys].sort(
    (a, b) =>
      Number(learner[b] || 0) -
      Number(learner[a] || 0)
  );

  const topThree = learnerRank.slice(0, 3);

  const patternFit =
    topThree.reduce((sum, key, index) => {
      const careerScore = Number(traits[key] || 0);

      const importance =
        index === 0 ? 1 :
        index === 1 ? 0.85 :
        0.65;

      return sum + careerScore * importance;
    }, 0) / 2.5;

  /*
   * Full-profile fit remains important.
   * Pattern fit makes the learner's strongest interests
   * more discriminating.
   */
  const score =
    absoluteFit * 0.65 +
    patternFit * 0.35;

  return Math.max(
    0,
    Math.min(100, Math.round(score))
  );
}
function findMark(subject:string,marks:Record<string,number>){if(marks[subject]!=null)return marks[subject];const aliases=subjectAliases[subject]||[];for(const a of aliases)if(marks[a]!=null)return marks[a];if(subject==='English'){const k=Object.keys(marks).find(x=>x.toLowerCase().includes('english'));return k?marks[k]:undefined}return undefined}
export function academicSignal(subjectGuidance:Record<string,string>,marks:Record<string,number>){const values:number[]=[];for(const[subject,importanceRaw]of Object.entries(subjectGuidance||{})){const mark=findMark(subject,marks);if(mark==null)continue;const importance=String(importanceRaw).toLowerCase();const target=importance==='important'||importance==='often required'?70:importance==='recommended'?60:50;values.push(Math.max(0,Math.min(100,50+(mark-target)*2)))}return values.length?Math.round(values.reduce((a,b)=>a+b,0)/values.length):null}
export function subjectGap(subjectGuidance:Record<string,string>,marks:Record<string,number>){return Object.entries(subjectGuidance||{}).map(([subject,importance])=>({subject,importance,mark:findMark(subject,marks)??null}))}
export function pathwayLabel(p:string){return({university:'University',university_of_technology:'University of Technology',tvet:'TVET',occupational:'Occupational qualification',apprenticeship:'Apprenticeship',learnership:'Learnership',self_employment:'Entrepreneurship / self-employment'}as Record<string,string>)[p]||p.replaceAll('_',' ')}
export function matchLabel(n:number){return n>=86?'Strong alignment':n>=76?'Good alignment':n>=66?'Worth exploring':'Explore if curious'}
export function matchReasons(c:any,marks:Record<string,number>){const reasons:string[]=[];const traits=c.traits||{};const labels:Record<string,string>={build:'hands-on / practical work',analyze:'analysis and problem-solving',create:'creative and design work',help:'helping and working with people',lead:'initiative and leadership',organize:'planning and organised work'};const top=Object.entries(traits).sort((a:any,b:any)=>Number(b[1])-Number(a[1])).slice(0,2).map(([k])=>labels[k]).filter(Boolean);if(top.length)reasons.push(`This career often uses ${top.join(' and ')}.`);const relevant=Object.keys(c.subject_guidance||{}).filter(s=>findMark(s,marks)!=null);if(relevant.length)reasons.push(`Your current subjects give a useful signal here: ${relevant.slice(0,3).join(', ')}.`);else reasons.push('Your interests create the signal here; check the exact subject requirements before choosing a route.');return reasons}

