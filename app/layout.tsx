import './globals.css';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Nav } from '@/components/Nav';
import { PWARegister } from '@/components/PWARegister';
export const metadata:Metadata={title:{default:'LifePath — Every learner has a path',template:'%s · LifePath'},description:'South African career navigation from self-discovery to verified training, funding and application.'};
export default function RootLayout({children}:{children:ReactNode}){return <html lang="en"><body><PWARegister/><Nav/>{children}<footer className="footer"><div className="container">LifePath · Every learner has a path. Career guidance supports informed choices; the learner remains in control. · <a href="/privacy">Privacy</a> · <a href="/terms">Terms</a></div></footer></body></html>}
