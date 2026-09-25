import Link from 'next/link';
import { ReactNode } from 'react';
export function AppShell({children}:{children:ReactNode}){
const links=[['Dashboard','/dashboard'],['My profile','/onboarding'],['Assessment','/assessment'],['Subject planner','/subject-planner'],['My results','/results'],['Explore careers','/careers'],['Institutions','/institutions'],['Programmes','/programmes'],['Check a provider','/verify-provider'],['Funding','/funding'],['Applications','/applications'],['AI career coach','/coach'],['Settings','/settings']];
return <div className="app-shell"><aside className="sidebar"><div className="sidegroup">{links.map(([n,h])=><Link className="sidelink" href={h} key={h}>{n}</Link>)}<form action="/api/auth/logout" method="post"><button className="sidelink" style={{border:0,background:'transparent',width:'100%',textAlign:'left'}}>Sign out</button></form></div></aside><main className="main">{children}</main></div>}
