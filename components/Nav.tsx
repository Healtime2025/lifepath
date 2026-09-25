import Link from 'next/link';
import { Brand } from './Brand';
import { currentUser } from '@/lib/auth';
export async function Nav(){
  let user:any=null; try{user=await currentUser()}catch{}
  return <header className="nav"><div className="container navin"><Brand/><nav className="navlinks">
    <Link className="hide-mobile" href="/careers">Careers</Link><Link className="hide-mobile" href="/subject-planner">Subject planner</Link><Link className="hide-mobile" href="/institutions">Institutions</Link><Link className="hide-mobile" href="/programmes">Programmes</Link><Link className="hide-mobile" href="/verify-provider">Check a provider</Link>
    {user?<Link className="btn btn-primary" href="/dashboard">My LifePath</Link>:<><Link href="/login">Sign in</Link><Link className="btn btn-primary" href="/register">Start my path</Link></>}
  </nav></div></header>
}
