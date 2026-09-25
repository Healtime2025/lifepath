import { ForgotPasswordForm } from '@/components/ForgotPasswordForm';
export const metadata={title:'Reset password'};
export default function Page(){return <div className="authwrap"><div className="authcard"><div className="eyebrow">Account recovery</div><h1 style={{fontSize:34,margin:'8px 0 10px'}}>Reset your password</h1><p className="muted">Enter the email used for your LifePath account.</p><ForgotPasswordForm/></div></div>}
