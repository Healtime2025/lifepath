import { neon } from '@neondatabase/serverless';
const url = process.env.DATABASE_URL;
if (!url) throw new Error('DATABASE_URL is required');
const sql = neon(url);

const DHET_UNI = 'https://www.dhet.gov.za/SitePages/UniversitiesinSA.aspx';
const DHET_TVET = 'https://www.dhet.gov.za/SitePages/TVETlinks.aspx?hl=en-ZA';
const QCTO = 'https://www.qcto.org.za/databases-of-sdps.html';
const SAQA = 'https://regqs.saqa.org.za/search.php';

const universities = [
['Cape Peninsula University of Technology','cput','Western Cape','https://www.cput.ac.za/'],
['Central University of Technology, Free State','cut','Free State','https://www.cut.ac.za/'],
['Durban University of Technology','dut','KwaZulu-Natal','https://www.dut.ac.za/'],
['Mangosuthu University of Technology','mut','KwaZulu-Natal','https://www.mut.ac.za/'],
['Nelson Mandela University','nmu','Eastern Cape','https://www.mandela.ac.za/'],
['North-West University','nwu','North West','https://www.nwu.ac.za/'],
['Rhodes University','rhodes','Eastern Cape','https://www.ru.ac.za/'],
['Sefako Makgatho Health Sciences University','smu','Gauteng','https://www.smu.ac.za/'],
['Sol Plaatje University','spu','Northern Cape','https://www.spu.ac.za/'],
['Stellenbosch University','stellenbosch','Western Cape','https://www.sun.ac.za/'],
['Tshwane University of Technology','tut','Gauteng','https://www.tut.ac.za/'],
['University of Cape Town','uct','Western Cape','https://www.uct.ac.za/'],
['University of Fort Hare','ufh','Eastern Cape','https://www.ufh.ac.za/'],
['University of Johannesburg','uj','Gauteng','https://www.uj.ac.za/'],
['University of KwaZulu-Natal','ukzn','KwaZulu-Natal','https://www.ukzn.ac.za/'],
['University of Limpopo','ul','Limpopo','https://www.ul.ac.za/'],
['University of Mpumalanga','ump','Mpumalanga','https://www.ump.ac.za/'],
['University of Pretoria','up','Gauteng','https://www.up.ac.za/'],
['University of South Africa','unisa','National / Distance','https://www.unisa.ac.za/'],
['University of the Free State','ufs','Free State','https://www.ufs.ac.za/'],
['University of the Western Cape','uwc','Western Cape','https://www.uwc.ac.za/'],
['University of the Witwatersrand','wits','Gauteng','https://www.wits.ac.za/'],
['University of Venda','univen','Limpopo','https://www.univen.ac.za/'],
['University of Zululand','unizulu','KwaZulu-Natal','https://www.unizulu.ac.za/'],
['Vaal University of Technology','vut','Gauteng','https://www.vut.ac.za/'],
['Walter Sisulu University','wsu','Eastern Cape','https://www.wsu.ac.za/']
];

const tvets = [
['Buffalo City TVET College','buffalo-city-tvet','Eastern Cape','https://www.bccollege.co.za'],
['Eastcape Midlands TVET College','eastcape-midlands-tvet','Eastern Cape','https://www.emcol.co.za'],
['Ikhala TVET College','ikhala-tvet','Eastern Cape','https://www.ikhalacollege.co.za'],
['Ingwe TVET College','ingwe-tvet','Eastern Cape','https://www.ingwecollege.co.za'],
['King Hintsa TVET College','king-hintsa-tvet','Eastern Cape','https://www.kinghintsacollege.edu.za'],
['King Sabata Dalindyebo TVET College','ksd-tvet','Eastern Cape','https://www.ksdcollege.edu.za'],
['Lovedale TVET College','lovedale-tvet','Eastern Cape','https://www.lovedalecollege.co.za'],
['Port Elizabeth TVET College','port-elizabeth-tvet','Eastern Cape','https://www.pecollege.edu.za'],
['Flavius Mareka TVET College','flavius-mareka-tvet','Free State','https://www.flaviusmareka.net'],
['Goldfields TVET College','goldfields-tvet','Free State','https://www.goldfieldsfet.edu.za'],
['Maluti TVET College','maluti-tvet','Free State','https://www.malutifet.org.za'],
['Motheo TVET College','motheo-tvet','Free State','https://www.motheotvet.co.za'],
['Central Johannesburg TVET College','central-johannesburg-tvet','Gauteng','https://www.cjc.co.za'],
['Ekurhuleni East TVET College','ekurhuleni-east-tvet','Gauteng','https://www.eec.edu.za'],
['Ekurhuleni West TVET College','ekurhuleni-west-tvet','Gauteng','https://www.ewc.edu.za'],
['Sedibeng TVET College','sedibeng-tvet','Gauteng','https://www.sedcol.co.za'],
['South West Gauteng TVET College','south-west-gauteng-tvet','Gauteng','https://www.swgc.co.za'],
['Tshwane North TVET College','tshwane-north-tvet','Gauteng','https://www.tnc4fet.co.za'],
['Tshwane South TVET College','tshwane-south-tvet','Gauteng','https://www.tsc.edu.za'],
['Western TVET College','western-tvet','Gauteng','https://www.westcol.co.za'],
['Coastal TVET College','coastal-tvet','KwaZulu-Natal','https://www.coastalkzn.co.za'],
['Elangeni TVET College','elangeni-tvet','KwaZulu-Natal','https://www.efet.co.za'],
['Esayidi TVET College','esayidi-tvet','KwaZulu-Natal','https://www.esayidifet.co.za'],
['Majuba TVET College','majuba-tvet','KwaZulu-Natal','https://www.majuba.edu.za'],
['Mnambithi TVET College','mnambithi-tvet','KwaZulu-Natal','https://www.mnambithicollege.co.za'],
['Mthashana TVET College','mthashana-tvet','KwaZulu-Natal','https://www.mthashanafet.co.za'],
['Thekwini TVET College','thekwini-tvet','KwaZulu-Natal','https://www.thekwinicollege.co.za'],
['Umfolozi TVET College','umfolozi-tvet','KwaZulu-Natal','https://www.umfolozicollege.co.za'],
['Umgungundlovu TVET College','umgungundlovu-tvet','KwaZulu-Natal','https://www.ufetc.edu.za'],
['Capricorn TVET College','capricorn-tvet','Limpopo','https://www.capricorncollege.edu.za'],
['Lephalale TVET College','lephalale-tvet','Limpopo','https://www.lephalalefetcollege.co.za'],
['Letaba TVET College','letaba-tvet','Limpopo','https://www.letabafet.co.za'],
['Mopani South East TVET College','mopani-south-east-tvet','Limpopo','https://www.mopanicollege.edu.za'],
['Sekhukhune TVET College','sekhukhune-tvet','Limpopo','https://www.sekfetcol.co.za'],
['Vhembe TVET College','vhembe-tvet','Limpopo','https://www.vhembefet.co.za'],
['Waterberg TVET College','waterberg-tvet','Limpopo','https://www.waterbergcollege.co.za'],
['Ehlanzeni TVET College','ehlanzeni-tvet','Mpumalanga','https://www.ehlanzenicollege.co.za'],
['Gert Sibande TVET College','gert-sibande-tvet','Mpumalanga','https://www.gscollege.co.za'],
['Nkangala TVET College','nkangala-tvet','Mpumalanga','https://www.nkangalafet.edu.za'],
['Northern Cape Rural TVET College','northern-cape-rural-tvet','Northern Cape','https://www.ncrfet.edu.za'],
['Northern Cape Urban TVET College','northern-cape-urban-tvet','Northern Cape','https://www.ncufetcollege.edu.za'],
['ORBIT TVET College','orbit-tvet','North West','https://www.orbitcollege.co.za'],
['Taletso TVET College','taletso-tvet','North West','https://www.taletsofetcollege.co.za'],
['Vuselela TVET College','vuselela-tvet','North West','https://www.vuselelacollege.co.za'],
['Boland TVET College','boland-tvet','Western Cape','https://www.bolandcollege.com'],
['College of Cape Town for TVET','college-of-cape-town-tvet','Western Cape','https://www.cct.edu.za'],
['False Bay TVET College','false-bay-tvet','Western Cape','https://www.falsebaycollege.co.za'],
['Northlink TVET College','northlink-tvet','Western Cape','https://www.northlink.co.za'],
['South Cape TVET College','south-cape-tvet','Western Cape','https://www.sccollege.co.za'],
['West Coast TVET College','west-coast-tvet','Western Cape','https://www.westcoastcollege.co.za']
];

const C = (slug,title,category,summary,what,pathways,traits,practical=3,academic=3,entre=3,outlook='strong',subjects={}) => ({slug,title,category,summary,what,pathways,traits,practical,academic,entre,outlook,subjects});
const careers = [
C('software-developer','Software Developer','Technology','Builds software, websites, apps and digital systems.','Designs, writes, tests and improves software used by people and organisations.',['university','university_of_technology','occupational','self_employment'],{build:35,analyze:90,create:80,help:35,lead:35,organize:65},2,4,4,'strong',{Mathematics:'recommended'}),
C('cybersecurity-specialist','Cybersecurity Specialist','Technology','Protects computers, networks and information from digital threats.','Monitors security, investigates incidents, tests systems and improves controls.',['university','university_of_technology','occupational'],{build:35,analyze:95,create:50,help:45,lead:35,organize:80},2,4,3,'strong',{Mathematics:'recommended'}),
C('data-scientist','Data Scientist','Technology','Uses data, statistics and computing to answer difficult questions.','Cleans data, builds models, analyses patterns and communicates findings.',['university'],{build:20,analyze:100,create:65,help:30,lead:30,organize:65},1,5,3,'strong',{Mathematics:'important'}),
C('ai-ml-specialist','AI & Machine Learning Specialist','Technology','Builds systems that learn from data and assist with complex tasks.','Develops, evaluates and deploys machine-learning and AI systems.',['university'],{build:35,analyze:100,create:80,help:30,lead:30,organize:60},2,5,4,'strong',{Mathematics:'important'}),
C('it-support-technician','IT Support Technician','Technology','Keeps computers, devices and users working effectively.','Installs systems, solves faults, supports users and manages devices.',['tvet','occupational','learnership'],{build:65,analyze:70,create:30,help:75,lead:25,organize:65},4,2,3,'strong',{}),
C('network-technician','Network Technician','Technology','Installs and maintains computer networks.','Configures routers, cabling, wireless networks and resolves connectivity faults.',['tvet','occupational','learnership'],{build:80,analyze:75,create:35,help:45,lead:25,organize:65},4,3,3,'strong',{}),
C('mechanical-engineer','Mechanical Engineer','Engineering','Designs and improves machines, equipment and mechanical systems.','Uses science and mathematics to design, analyse and improve mechanical systems.',['university','university_of_technology'],{build:80,analyze:90,create:70,help:25,lead:40,organize:60},4,5,3,'strong',{Mathematics:'important','Physical Sciences':'important'}),
C('electrical-engineer','Electrical Engineer','Engineering','Designs electrical power, control and electronic systems.','Develops, analyses and manages electrical systems and projects.',['university','university_of_technology'],{build:75,analyze:95,create:65,help:25,lead:40,organize:65},3,5,3,'strong',{Mathematics:'important','Physical Sciences':'important'}),
C('civil-engineer','Civil Engineer','Engineering','Designs infrastructure such as roads, structures and water systems.','Plans, designs and oversees infrastructure projects.',['university','university_of_technology'],{build:75,analyze:85,create:60,help:35,lead:50,organize:70},3,5,3,'strong',{Mathematics:'important','Physical Sciences':'important'}),
C('industrial-engineer','Industrial Engineer','Engineering','Improves systems, processes, productivity and flow.','Combines engineering, data and management to make operations work better.',['university'],{build:45,analyze:90,create:65,help:35,lead:60,organize:95},2,5,4,'strong',{Mathematics:'important','Physical Sciences':'often required'}),
C('mechatronics-engineer','Mechatronics Engineer','Engineering','Combines mechanics, electronics, control and software.','Designs automated machines, robots and intelligent equipment.',['university','university_of_technology'],{build:90,analyze:95,create:85,help:20,lead:35,organize:60},5,5,4,'strong',{Mathematics:'important','Physical Sciences':'important'}),
C('quantity-surveyor','Quantity Surveyor','Built Environment','Manages the cost and commercial side of construction projects.','Estimates, controls and reports construction costs and contracts.',['university','university_of_technology'],{build:30,analyze:80,create:35,help:35,lead:45,organize:95},2,4,4,'strong',{Mathematics:'recommended'}),
C('architect','Architect','Built Environment','Designs buildings and spaces for people.','Develops building concepts, drawings and technical designs and coordinates approvals.',['university'],{build:45,analyze:70,create:100,help:45,lead:45,organize:70},2,5,4,'stable',{Mathematics:'recommended'}),
C('doctor','Medical Doctor','Health','Diagnoses and treats illness and injury.','Examines patients, orders tests, diagnoses conditions and plans treatment.',['university'],{build:15,analyze:90,create:35,help:100,lead:55,organize:70},1,5,2,'strong',{Mathematics:'important','Physical Sciences':'important','Life Sciences':'recommended'}),
C('professional-nurse','Professional Nurse','Health','Provides clinical nursing care and supports patients and families.','Assesses patients, provides treatment, monitors recovery and coordinates care.',['university','university_of_technology'],{build:20,analyze:65,create:25,help:100,lead:55,organize:80},3,4,2,'strong',{'Life Sciences':'recommended'}),
C('pharmacist','Pharmacist','Health','Ensures medicines are used safely and effectively.','Dispenses medicines, checks interactions, counsels patients and manages medicine systems.',['university'],{build:15,analyze:90,create:25,help:80,lead:40,organize:90},1,5,3,'strong',{Mathematics:'important','Physical Sciences':'important'}),
C('physiotherapist','Physiotherapist','Health','Helps people restore movement, function and physical independence.','Assesses movement, provides rehabilitation and teaches exercises.',['university'],{build:35,analyze:70,create:45,help:100,lead:35,organize:60},4,5,3,'strong',{'Life Sciences':'recommended'}),
C('occupational-therapist','Occupational Therapist','Health','Helps people regain independence in everyday activities.','Assesses daily-function challenges and designs practical rehabilitation.',['university'],{build:45,analyze:65,create:70,help:100,lead:35,organize:60},4,5,3,'strong',{'Life Sciences':'recommended'}),
C('paramedic','Paramedic','Health','Provides emergency medical care before and during transport.','Responds to emergencies, stabilises patients and provides urgent clinical care.',['university_of_technology','occupational'],{build:45,analyze:75,create:30,help:100,lead:60,organize:55},5,4,2,'strong',{'Life Sciences':'recommended'}),
C('plumber','Plumber','Trades','Installs, repairs and maintains water, drainage and sanitation systems.','Reads plans, installs pipes and fixtures, finds leaks and repairs systems.',['tvet','occupational','apprenticeship','self_employment'],{build:100,analyze:60,create:45,help:55,lead:35,organize:60},5,2,5,'strong',{Mathematics:'helpful'}),
C('electrician','Electrician','Trades','Installs, tests and repairs electrical systems.','Wires buildings and equipment, tests circuits and fixes electrical faults.',['tvet','occupational','apprenticeship','self_employment'],{build:100,analyze:75,create:40,help:45,lead:35,organize:70},5,3,5,'strong',{Mathematics:'helpful','Physical Sciences':'helpful'}),
C('welder','Welder','Trades','Joins and repairs metal components using specialised welding processes.','Prepares metal, welds joints, checks quality and works from drawings.',['tvet','occupational','apprenticeship','self_employment'],{build:100,analyze:50,create:45,help:20,lead:20,organize:55},5,2,4,'strong',{}),
C('boilermaker','Boilermaker','Trades','Builds and repairs heavy metal structures, vessels and equipment.','Fabricates, assembles and repairs steel structures from drawings.',['tvet','occupational','apprenticeship'],{build:100,analyze:65,create:50,help:20,lead:30,organize:65},5,3,4,'strong',{Mathematics:'helpful'}),
C('fitter-turner','Fitter and Turner','Trades','Makes, fits and repairs mechanical parts and machinery.','Measures, machines, assembles and maintains precision components.',['tvet','occupational','apprenticeship'],{build:100,analyze:80,create:45,help:20,lead:25,organize:75},5,3,4,'strong',{Mathematics:'helpful'}),
C('millwright','Millwright','Trades','Maintains mechanical and electrical industrial equipment.','Diagnoses and repairs machinery, motors, drives and production equipment.',['tvet','occupational','apprenticeship'],{build:100,analyze:90,create:50,help:25,lead:30,organize:70},5,4,4,'strong',{Mathematics:'helpful','Physical Sciences':'helpful'}),
C('diesel-mechanic','Diesel Mechanic','Trades','Services and repairs diesel engines and heavy vehicles.','Diagnoses faults, services engines and repairs mechanical systems.',['tvet','occupational','apprenticeship','self_employment'],{build:100,analyze:75,create:30,help:35,lead:25,organize:55},5,3,5,'strong',{}),
C('motor-mechanic','Motor Mechanic','Trades','Services and repairs cars and light vehicles.','Diagnoses faults, replaces components and performs maintenance.',['tvet','occupational','apprenticeship','self_employment'],{build:100,analyze:75,create:30,help:45,lead:25,organize:55},5,3,5,'strong',{}),
C('refrigeration-technician','Refrigeration & Air-Conditioning Technician','Trades','Installs and maintains cooling, refrigeration and air-conditioning systems.','Tests, repairs and commissions refrigeration and HVAC equipment.',['tvet','occupational','apprenticeship','self_employment'],{build:100,analyze:80,create:40,help:45,lead:25,organize:65},5,3,5,'strong',{Mathematics:'helpful','Physical Sciences':'helpful'}),
C('carpenter','Carpenter','Trades','Builds and repairs structures, fittings and furniture from timber.','Measures, cuts, assembles and installs timber components.',['tvet','occupational','apprenticeship','self_employment'],{build:100,analyze:45,create:75,help:30,lead:25,organize:60},5,2,5,'stable',{}),
C('bricklayer','Bricklayer','Trades','Builds walls and structures using bricks, blocks and mortar.','Sets out work, prepares mortar and constructs masonry accurately.',['tvet','occupational','apprenticeship','self_employment'],{build:100,analyze:45,create:45,help:25,lead:25,organize:55},5,2,5,'stable',{}),
C('solar-installer','Solar PV Installer','Green Economy','Installs and maintains solar photovoltaic systems.','Mounts panels, wires components, tests systems and performs maintenance.',['tvet','occupational','learnership','self_employment'],{build:95,analyze:70,create:45,help:45,lead:25,organize:65},5,3,5,'strong',{Mathematics:'helpful','Physical Sciences':'helpful'}),
C('secretary','Secretary','Administration','Provides organised administrative support to a team or manager.','Manages correspondence, schedules, documents, meetings and office records.',['tvet','occupational','learnership'],{build:10,analyze:45,create:30,help:75,lead:30,organize:100},1,2,3,'stable',{English:'important'}),
C('office-administrator','Office Administrator','Administration','Keeps office systems, records and daily administration running smoothly.','Coordinates records, communication, supplies, schedules and basic reporting.',['tvet','occupational','learnership'],{build:10,analyze:50,create:25,help:70,lead:35,organize:100},1,2,4,'stable',{English:'important'}),
C('receptionist','Receptionist','Administration','Welcomes visitors and handles front-desk communication.','Answers calls, books appointments, receives visitors and maintains records.',['tvet','occupational','learnership'],{build:5,analyze:25,create:20,help:90,lead:25,organize:85},1,1,3,'stable',{English:'important'}),
C('bookkeeper','Bookkeeper','Business & Finance','Records and organises day-to-day financial transactions.','Captures transactions, reconciles accounts and prepares routine financial records.',['tvet','occupational','learnership','self_employment'],{build:5,analyze:80,create:20,help:35,lead:25,organize:100},1,3,5,'stable',{Mathematics:'helpful'}),
C('accountant','Accountant','Business & Finance','Prepares, analyses and reports financial information.','Maintains financial records, analyses performance and supports compliance and decisions.',['university','university_of_technology'],{build:5,analyze:90,create:20,help:35,lead:45,organize:95},1,5,5,'strong',{Mathematics:'important'}),
C('human-resources-administrator','Human Resources Administrator','Business & People','Supports recruitment, employee records and HR processes.','Maintains staff records, coordinates recruitment and supports employee processes.',['tvet','university_of_technology','learnership'],{build:5,analyze:45,create:25,help:85,lead:40,organize:95},1,3,3,'stable',{English:'important'}),
C('logistics-coordinator','Logistics Coordinator','Business & Logistics','Coordinates the movement and delivery of goods.','Plans shipments, tracks stock and transport, and resolves delivery problems.',['tvet','university_of_technology','learnership'],{build:20,analyze:75,create:25,help:40,lead:50,organize:100},2,3,4,'strong',{Mathematics:'helpful'}),
C('chef','Chef','Hospitality','Prepares food professionally and manages kitchen production.','Plans menus, prepares meals, controls quality and manages food-safety routines.',['tvet','occupational','learnership','self_employment'],{build:70,analyze:35,create:90,help:65,lead:60,organize:80},5,2,5,'stable',{}),
C('baker','Baker','Hospitality','Produces bread, pastries and baked products.','Measures ingredients, mixes dough, bakes products and controls quality.',['tvet','occupational','learnership','self_employment'],{build:70,analyze:45,create:80,help:45,lead:35,organize:80},5,2,5,'stable',{}),
C('hairdresser','Hairdresser','Personal Services','Cuts, styles and treats hair for clients.','Consults clients, performs hair services and manages hygiene and appointments.',['tvet','occupational','learnership','self_employment'],{build:65,analyze:20,create:95,help:90,lead:35,organize:55},5,1,5,'stable',{}),
C('beauty-therapist','Beauty Therapist','Personal Services','Provides professional beauty and skincare services.','Performs treatments, advises clients and maintains hygienic treatment spaces.',['tvet','occupational','learnership','self_employment'],{build:45,analyze:20,create:70,help:95,lead:30,organize:60},4,2,5,'stable',{}),
C('teacher','Teacher','Education','Helps learners develop knowledge, skills and confidence.','Plans lessons, teaches, assesses progress and supports learners.',['university'],{build:10,analyze:55,create:70,help:100,lead:80,organize:80},2,5,3,'strong',{English:'important'}),
C('ecd-practitioner','Early Childhood Development Practitioner','Education','Supports learning and development in young children.','Plans age-appropriate activities, observes development and supports families.',['tvet','occupational','learnership'],{build:25,analyze:35,create:80,help:100,lead:55,organize:70},3,3,3,'strong',{English:'helpful'}),
C('social-worker','Social Worker','Community & Care','Supports individuals, families and communities facing social challenges.','Assesses needs, provides support and connects people to services.',['university'],{build:5,analyze:60,create:35,help:100,lead:50,organize:65},1,5,2,'strong',{English:'important'}),
C('farmer','Farmer / Farm Manager','Agriculture','Produces crops or livestock and manages farming operations.','Plans production, manages resources, monitors quality and markets outputs.',['tvet','university','university_of_technology','occupational','self_employment'],{build:90,analyze:65,create:55,help:35,lead:75,organize:80},5,3,5,'strong',{'Life Sciences':'helpful'}),
C('horticulture-technician','Horticulture Technician','Agriculture','Works with plants, nurseries, landscaping and crop production.','Propagates plants, monitors growth, manages soil, pests and production.',['tvet','university_of_technology','occupational'],{build:80,analyze:55,create:65,help:30,lead:30,organize:60},5,3,5,'strong',{'Life Sciences':'helpful'}),
C('graphic-designer','Graphic Designer','Creative & Media','Creates visual communication for brands, products and media.','Develops layouts, graphics, branding and digital visual content.',['tvet','university_of_technology','self_employment'],{build:10,analyze:35,create:100,help:35,lead:25,organize:55},2,3,5,'stable',{}),
C('ux-designer','UX / Product Designer','Creative & Technology','Designs digital products that are easy and useful to use.','Researches users, maps journeys, prototypes interfaces and tests designs.',['university','university_of_technology','occupational','self_employment'],{build:20,analyze:70,create:100,help:75,lead:30,organize:60},2,4,5,'strong',{}),
C('digital-marketer','Digital Marketer','Creative & Business','Promotes organisations, products and services through digital channels.','Plans campaigns, creates content, analyses audiences and improves results.',['tvet','university_of_technology','occupational','self_employment'],{build:5,analyze:60,create:90,help:50,lead:55,organize:65},1,3,5,'strong',{English:'important'}),
C('lawyer','Lawyer','Law','Advises and represents people or organisations on legal matters.','Researches law, prepares legal documents, advises clients and may appear in court.',['university'],{build:5,analyze:90,create:55,help:65,lead:65,organize:75},1,5,4,'stable',{English:'important'}),
C('paralegal','Paralegal','Law','Supports legal work through research, documents and case administration.','Prepares documents, conducts research and maintains case files.',['tvet','university_of_technology','occupational'],{build:5,analyze:75,create:35,help:55,lead:30,organize:95},1,3,3,'stable',{English:'important'}),
C('police-officer','Police Officer','Public Service','Protects communities and enforces the law.','Responds to incidents, investigates offences and supports public safety.',['occupational'],{build:45,analyze:65,create:20,help:80,lead:70,organize:55},5,3,2,'stable',{}),
C('firefighter','Firefighter','Public Safety','Responds to fires, rescues and other emergencies.','Controls fires, performs rescues and maintains emergency readiness.',['occupational','learnership'],{build:75,analyze:55,create:15,help:100,lead:65,organize:50},5,2,2,'strong',{}),
C('environmental-scientist','Environmental Scientist','Science & Environment','Studies environmental systems and helps solve pollution and sustainability problems.','Collects data, assesses impacts and develops environmental recommendations.',['university'],{build:25,analyze:90,create:45,help:55,lead:35,organize:65},3,5,3,'strong',{Mathematics:'recommended','Life Sciences':'recommended'}),
C('laboratory-technician','Laboratory Technician','Science','Performs laboratory tests and supports scientific or industrial analysis.','Prepares samples, operates equipment, records results and maintains quality.',['tvet','university_of_technology','occupational'],{build:45,analyze:90,create:25,help:30,lead:20,organize:95},3,4,2,'stable',{'Physical Sciences':'helpful','Life Sciences':'helpful'}),
C('biomedical-scientist','Biomedical Scientist','Science & Health','Studies biological processes related to disease and human health.','Conducts laboratory research and analyses biological samples and data.',['university'],{build:20,analyze:100,create:45,help:55,lead:25,organize:80},2,5,2,'strong',{Mathematics:'recommended','Physical Sciences':'recommended','Life Sciences':'important'}),
C('radiographer','Radiographer','Health','Uses medical imaging technology to help diagnose and treat patients.','Positions patients, operates imaging equipment and works with clinical teams.',['university_of_technology','university'],{build:45,analyze:75,create:20,help:90,lead:25,organize:80},3,4,2,'strong',{'Physical Sciences':'recommended','Life Sciences':'helpful'}),
C('dental-assistant','Dental Assistant','Health','Supports dentists and patients during dental care.','Prepares treatment areas, assists procedures, sterilises equipment and manages records.',['occupational','tvet','learnership'],{build:45,analyze:35,create:15,help:95,lead:20,organize:90},4,2,2,'stable',{}),
C('community-health-worker','Community Health Worker','Health & Community','Supports basic health promotion and links communities to care.','Provides health education, basic support, referrals and community follow-up.',['occupational','learnership'],{build:20,analyze:35,create:25,help:100,lead:40,organize:65},3,2,2,'strong',{}),
C('care-worker','Care Worker','Health & Community','Supports people who need assistance with daily living and wellbeing.','Provides practical personal support, observes changes and assists with daily routines.',['occupational','learnership'],{build:35,analyze:25,create:20,help:100,lead:20,organize:60},4,1,2,'strong',{}),
C('instrumentation-technician','Instrumentation Technician','Engineering & Trades','Installs and maintains industrial measurement and control systems.','Tests sensors, instruments and control loops and diagnoses process-control faults.',['tvet','occupational','apprenticeship','university_of_technology'],{build:95,analyze:90,create:45,help:25,lead:30,organize:75},5,4,4,'strong',{Mathematics:'helpful','Physical Sciences':'helpful'}),
C('cnc-machinist','CNC Machinist','Manufacturing','Produces precision parts using computer-controlled machines.','Sets up CNC machines, reads drawings, measures parts and controls quality.',['tvet','occupational','apprenticeship'],{build:100,analyze:75,create:40,help:15,lead:20,organize:80},5,3,4,'strong',{Mathematics:'helpful'}),
C('machine-operator','Machine Operator','Manufacturing','Operates production machinery safely and consistently.','Sets up equipment, monitors output, performs checks and reports faults.',['occupational','learnership'],{build:90,analyze:45,create:15,help:15,lead:15,organize:85},5,1,2,'stable',{}),
C('construction-supervisor','Construction Supervisor','Construction','Coordinates people, materials and daily work on building sites.','Plans tasks, checks quality and safety, coordinates trades and reports progress.',['tvet','occupational','university_of_technology'],{build:80,analyze:55,create:35,help:45,lead:90,organize:90},5,3,4,'strong',{Mathematics:'helpful'}),
C('tiler','Tiler','Construction','Finishes floors and walls using tiles and related materials.','Measures surfaces, prepares bases, cuts tiles and installs finishes accurately.',['occupational','learnership','self_employment'],{build:100,analyze:35,create:55,help:25,lead:20,organize:60},5,1,5,'stable',{}),
C('painter-decorator','Painter & Decorator','Construction','Prepares and finishes building surfaces with paint and coatings.','Repairs surfaces, prepares finishes and applies coatings safely and neatly.',['occupational','learnership','self_employment'],{build:85,analyze:25,create:70,help:25,lead:20,organize:55},5,1,5,'stable',{}),
C('legal-secretary','Legal Secretary','Administration & Law','Provides specialised administrative support in legal offices.','Manages legal documents, correspondence, diaries and case administration.',['tvet','occupational','learnership'],{build:5,analyze:55,create:20,help:65,lead:25,organize:100},1,2,3,'stable',{English:'important'}),
C('personal-assistant','Personal / Executive Assistant','Administration','Provides high-level organisation and administrative support to managers or teams.','Coordinates diaries, meetings, communication, travel and documents.',['tvet','occupational','learnership'],{build:5,analyze:45,create:35,help:80,lead:45,organize:100},1,2,4,'stable',{English:'important'}),
C('data-capturer','Data Capturer','Administration','Captures and checks information accurately in digital systems.','Enters records, validates details, corrects errors and maintains data quality.',['occupational','learnership'],{build:5,analyze:45,create:10,help:20,lead:10,organize:100},1,1,2,'stable',{}),
C('call-centre-agent','Contact Centre Agent','Customer Service','Helps customers by phone, chat or digital channels.','Answers enquiries, resolves routine problems and records customer interactions.',['occupational','learnership'],{build:5,analyze:35,create:20,help:95,lead:35,organize:65},1,1,3,'stable',{English:'important'}),
C('retail-supervisor','Retail Supervisor','Retail','Coordinates store staff, service, stock and daily retail operations.','Supervises shifts, assists customers, manages stock and tracks sales.',['tvet','occupational','learnership'],{build:25,analyze:40,create:30,help:80,lead:85,organize:85},3,2,5,'stable',{}),
C('warehouse-controller','Warehouse Controller','Logistics','Controls stock movement, storage and warehouse records.','Receives goods, checks stock, organises storage and coordinates dispatch.',['tvet','occupational','learnership'],{build:55,analyze:55,create:10,help:25,lead:35,organize:100},4,2,3,'strong',{Mathematics:'helpful'}),
C('forklift-operator','Forklift Operator','Logistics','Moves goods safely in warehouses and industrial sites.','Operates lifting equipment, checks loads and follows warehouse safety procedures.',['occupational','learnership'],{build:90,analyze:30,create:10,help:15,lead:15,organize:65},5,1,2,'stable',{}),
C('truck-driver','Professional Truck Driver','Transport','Transports goods safely over local or long-distance routes.','Inspects vehicles, plans routes, transports loads and completes delivery records.',['occupational','learnership'],{build:65,analyze:35,create:10,help:20,lead:20,organize:70},5,1,4,'stable',{}),
C('tour-guide','Tour Guide','Tourism','Guides visitors and explains places, culture and attractions.','Plans tours, presents information, manages groups and supports visitor safety.',['tvet','occupational','self_employment'],{build:20,analyze:35,create:65,help:95,lead:75,organize:55},3,2,5,'stable',{English:'important'}),
C('hotel-supervisor','Hotel / Guest Services Supervisor','Hospitality','Coordinates guest service and front-of-house hotel operations.','Supervises service, handles guest needs and coordinates staff and bookings.',['tvet','university_of_technology','learnership'],{build:15,analyze:35,create:35,help:100,lead:80,organize:85},2,3,4,'stable',{English:'important'}),
C('photographer','Photographer','Creative & Media','Creates photographs for people, events, brands and publications.','Plans shoots, captures images, edits work and manages clients or assignments.',['tvet','occupational','self_employment'],{build:30,analyze:25,create:100,help:55,lead:35,organize:50},3,2,5,'stable',{}),
C('videographer','Videographer','Creative & Media','Creates video content for events, brands, news and digital media.','Plans, records, edits and delivers video stories or commercial content.',['tvet','university_of_technology','self_employment'],{build:35,analyze:35,create:100,help:50,lead:35,organize:60},3,3,5,'strong',{}),
C('financial-adviser','Financial Adviser','Business & Finance','Helps clients plan and manage financial goals within regulatory requirements.','Assesses needs, explains financial products and maintains client relationships.',['university','university_of_technology','occupational'],{build:5,analyze:80,create:25,help:75,lead:70,organize:80},1,4,5,'stable',{Mathematics:'recommended'}),
C('banking-service-consultant','Banking Service Consultant','Business & Finance','Assists customers with everyday banking services and products.','Handles customer requests, verifies information and explains services.',['learnership','occupational','university_of_technology'],{build:5,analyze:55,create:15,help:90,lead:40,organize:90},1,2,3,'stable',{Mathematics:'helpful'}),
C('traffic-officer','Traffic Officer','Public Safety','Supports road safety and enforces traffic laws.','Monitors roads, manages incidents, enforces regulations and assists motorists.',['occupational'],{build:45,analyze:45,create:10,help:70,lead:65,organize:55},5,2,2,'stable',{}),
C('security-officer','Security Officer','Public Safety','Protects people, property and premises.','Controls access, patrols areas, reports incidents and follows security procedures.',['occupational','learnership'],{build:45,analyze:35,create:10,help:45,lead:40,organize:65},4,1,3,'stable',{}),
C('agricultural-technician','Agricultural Technician','Agriculture','Supports crop, livestock or agricultural production using practical science.','Collects field data, supports production, monitors quality and applies technical methods.',['tvet','university_of_technology','occupational'],{build:75,analyze:65,create:35,help:25,lead:30,organize:70},5,3,4,'strong',{'Life Sciences':'helpful'}),
C('wind-turbine-technician','Wind Turbine Technician','Green Economy','Maintains wind-energy equipment and electrical/mechanical systems.','Inspects turbines, diagnoses faults and performs mechanical and electrical maintenance.',['tvet','occupational','apprenticeship'],{build:100,analyze:80,create:30,help:20,lead:25,organize:70},5,3,4,'strong',{Mathematics:'helpful','Physical Sciences':'helpful'}),
C('mining-technician','Mining Technician','Mining','Supports safe and efficient mining operations with technical measurements and systems.','Collects operational data, supports planning and monitors technical processes.',['tvet','university_of_technology','occupational'],{build:80,analyze:75,create:25,help:20,lead:35,organize:75},5,3,4,'stable',{Mathematics:'helpful','Physical Sciences':'helpful'}),
C('water-process-controller','Water Process Controller','Water & Environment','Operates and monitors water or wastewater treatment processes.','Checks treatment stages, records quality results and responds to process problems.',['occupational','tvet','learnership'],{build:70,analyze:75,create:20,help:60,lead:25,organize:85},4,3,3,'strong',{Mathematics:'helpful','Physical Sciences':'helpful'}),
C('library-assistant','Library Assistant','Education & Information','Helps people access books, information and library services.','Organises materials, assists users and maintains lending and information records.',['tvet','occupational','learnership'],{build:5,analyze:45,create:25,help:90,lead:20,organize:100},1,2,2,'stable',{English:'important'})
];

for (const [name,slug,province,website] of universities) {
  await sql`INSERT INTO institutions (name,slug,institution_type,province,website_url,verification_status,verification_body,verification_source_url,verification_checked_at,public_institution)
    VALUES (${name},${slug},'university',${province},${website},'verified','Department of Higher Education and Training',${DHET_UNI},now(),true)
    ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, province=EXCLUDED.province, website_url=EXCLUDED.website_url, verification_status='verified', verification_source_url=${DHET_UNI}, verification_checked_at=now(), public_institution=true`;
}
for (const [name,slug,province,website] of tvets) {
  await sql`INSERT INTO institutions (name,slug,institution_type,province,website_url,verification_status,verification_body,verification_source_url,verification_checked_at,public_institution)
    VALUES (${name},${slug},'tvet',${province},${website},'verified','Department of Higher Education and Training',${DHET_TVET},now(),true)
    ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, province=EXCLUDED.province, website_url=EXCLUDED.website_url, verification_status='verified', verification_source_url=${DHET_TVET}, verification_checked_at=now(), public_institution=true`;
}
for (const c of careers) {
  await sql`INSERT INTO careers (slug,title,category,summary,what_you_do,pathways,subject_guidance,traits,practical_intensity,academic_intensity,entrepreneurship_fit,future_outlook)
    VALUES (${c.slug},${c.title},${c.category},${c.summary},${c.what},${c.pathways},${JSON.stringify(c.subjects)}::jsonb,${JSON.stringify(c.traits)}::jsonb,${c.practical},${c.academic},${c.entre},${c.outlook})
    ON CONFLICT (slug) DO UPDATE SET title=EXCLUDED.title, category=EXCLUDED.category, summary=EXCLUDED.summary, what_you_do=EXCLUDED.what_you_do, pathways=EXCLUDED.pathways, subject_guidance=EXCLUDED.subject_guidance, traits=EXCLUDED.traits, practical_intensity=EXCLUDED.practical_intensity, academic_intensity=EXCLUDED.academic_intensity, entrepreneurship_fit=EXCLUDED.entrepreneurship_fit, future_outlook=EXCLUDED.future_outlook, active=true, updated_at=now()`;
}

const funds = [
  ['NSFAS Bursary','National Student Financial Aid Scheme','bursary','Government financial aid for eligible students at public universities and TVET colleges.',['university','university_of_technology','tvet'],'https://www.nsfas.org.za/content/','https://my.nsfas.org.za/'],
  ['Funza Lushaka Bursary','Department of Basic Education','bursary','Teaching bursary programme for eligible students preparing for priority teaching areas.',['university'],'https://www.funzalushaka.doe.gov.za/','https://www.funzalushaka.doe.gov.za/'],
  ['International Scholarships (DHET)','Department of Higher Education and Training','scholarship','Official DHET information portal for international scholarship opportunities.',['university'],'https://www.internationalscholarships.dhet.gov.za/','https://www.internationalscholarships.dhet.gov.za/']
];
for (const [name,provider,type,summary,pathways,info,apply] of funds) {
  await sql`INSERT INTO funding_opportunities (name,provider,funding_type,summary,eligible_pathways,application_url,info_url,recurring,verified,verification_source_url,verified_at)
    VALUES (${name},${provider},${type},${summary},${pathways},${apply},${info},true,true,${info},now())
    ON CONFLICT DO NOTHING`;
}

const sources = [
  ['DHET Public Universities',DHET_UNI],['DHET Public TVET Colleges',DHET_TVET],['QCTO Accredited Skills Development Providers',QCTO],['SAQA Registered Qualifications',SAQA]
];
for (const [name,source] of sources) {
  await sql`INSERT INTO audit_events (action,entity_type,detail) VALUES ('seed_reference_source','verification_source',${JSON.stringify({name,source})}::jsonb)`;
}
console.log(`Seeded ${universities.length} public universities, ${tvets.length} public TVET colleges, ${careers.length} careers and ${funds.length} national funding sources.`);
