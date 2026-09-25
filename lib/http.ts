import { NextResponse } from 'next/server';
export function ok(data: unknown, init?: ResponseInit) { return NextResponse.json(data, { status: 200, ...init }); }
export function bad(message: string, status=400) { return NextResponse.json({ error: message }, { status }); }
export function cleanText(value: unknown, max=300) { return typeof value === 'string' ? value.trim().slice(0,max) : ''; }
export function cleanEmail(value: unknown) { const s=cleanText(value,254).toLowerCase(); return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s) ? s : ''; }
export function cleanUrl(value: unknown) { const s=cleanText(value,1000); if(!s) return ''; try { const u=new URL(s); return ['http:','https:'].includes(u.protocol) ? u.toString() : ''; } catch { return ''; } }
