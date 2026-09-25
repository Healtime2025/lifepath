import { ResetPasswordForm } from '@/components/ResetPasswordForm';
export const metadata={title:'Set new password'};
export default async function Page({searchParams}:{searchParams:Promise<{token?:string}>}){const {token=''}=await searchParams;return <div className="authwrap"><div className="authcard"><div className="eyebrow">Account recovery</div><h1 style={{fontSize:34,margin:'8px 0 10px'}}>Choose a new password</h1>{token?<ResetPasswordForm token={token}/>:<div className="notice">This reset link is incomplete.</div>}</div></div>}
