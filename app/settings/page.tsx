import { AppShell } from '@/components/AppShell';import { AccountSettings } from '@/components/AccountSettings';import { currentUser } from '@/lib/auth';import { redirect } from 'next/navigation';
export const metadata={title:'Settings'};
export default async function Page(){const u=await currentUser().catch(()=>null);if(!u)redirect('/login');return <AppShell><div className="pagehead"><div><div className="eyebrow">Account</div><h1>Settings</h1><p className="muted">Signed in as {u.email}</p></div></div><AccountSettings/></AppShell>}
