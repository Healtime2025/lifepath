export type SubjectGroup = { label: string; subjects: string[] };

const officialLanguages = ['Afrikaans','English','isiNdebele','isiXhosa','isiZulu','Sepedi','Sesotho','Setswana','Siswati','Tshivenda','Xitsonga'];
const languageSubjects = [
  ...officialLanguages.flatMap(l => [`${l} Home Language`,`${l} First Additional Language`,`${l} Second Additional Language`]),
  'South African Sign Language Home Language',
  'Arabic Second Additional Language','French Second Additional Language','German Second Additional Language',
  'Gujarati Second Additional Language','Hebrew Second Additional Language','Hindi Second Additional Language',
  'Italian Second Additional Language','Latin Second Additional Language','Mandarin Second Additional Language',
  'Portuguese Second Additional Language','Serbian Second Additional Language','Spanish Second Additional Language',
  'Tamil Second Additional Language','Telugu Second Additional Language','Urdu Second Additional Language'
];

export const subjectGroups: SubjectGroup[] = [
  {label:'Languages',subjects:languageSubjects},
  {label:'Mathematics & core',subjects:['Mathematics','Mathematical Literacy','Technical Mathematics','Life Orientation']},
  {label:'Sciences',subjects:['Physical Sciences','Life Sciences','Technical Sciences','Marine Sciences']},
  {label:'Business & commerce',subjects:['Accounting','Business Studies','Economics']},
  {label:'Agriculture',subjects:['Agricultural Sciences','Agricultural Management Practices','Agricultural Technology']},
  {label:'Engineering & technology',subjects:['Computer Applications Technology','Information Technology','Engineering Graphics and Design','Civil Technology: Civil Services','Civil Technology: Construction','Civil Technology: Woodworking','Electrical Technology: Digital Electronics','Electrical Technology: Electronics','Electrical Technology: Power Systems','Mechanical Technology: Automotive','Mechanical Technology: Fitting and Machining','Mechanical Technology: Welding and Metalwork']},
  {label:'Humanities & social sciences',subjects:['Geography','History','Religion Studies']},
  {label:'Arts & design',subjects:['Dance Studies','Design','Dramatic Arts','Music','Visual Arts']},
  {label:'Services',subjects:['Consumer Studies','Hospitality Studies','Tourism','Sport and Exercise Science','Maritime Economics']},
  {label:'Technical Occupational',subjects:['Agriculture Studies','Ancillary Health Care','Art and Crafts','Beauty and Nail Technology','Body Works','Bricklaying and Plastering','Early Childhood Development','Electrical Technology','Hairdressing and Beauty Care','Hospitality Studies (Technical Occupational)','Information and Communications Technology','Maintenance','Motor Mechanics','Natural Sciences (Technical Occupational)','Office Administration','Plumbing','Sewing','Sheet Metal Work','Upholstery','Welding','Wholesale and Retail','Woodworking and Timber']}
];

export const allSubjects = Array.from(new Set(subjectGroups.flatMap(g=>g.subjects))).sort((a,b)=>a.localeCompare(b));

export const subjectAliases: Record<string,string[]> = {
  English:['English Home Language','English First Additional Language','English Second Additional Language'],
  'Physical Sciences':['Physical Sciences','Technical Sciences'],
  Mathematics:['Mathematics','Technical Mathematics'],
  'Information Technology':['Information Technology','Computer Applications Technology','Information and Communications Technology']
};
