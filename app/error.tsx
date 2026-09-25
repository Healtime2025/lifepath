'use client';
export default function ErrorPage({reset}:{reset:()=>void}){return <div className="container section"><div className="card empty"><h1>LifePath hit a problem.</h1><p>Nothing has been changed. Try the action again.</p><button className="btn btn-primary" onClick={reset}>Try again</button></div></div>}
