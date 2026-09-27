'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { PathwayTags } from '@/components/PathwayTags';
import {
  careerFamily,
  familySort
} from '@/lib/career-families';
import { matchLabel } from '@/lib/matching';

export function ResultsCareerFamilies({
  matches
}:{
  matches:any[];
}){
  const [open,setOpen]=useState<Record<string,boolean>>({});

  const groups=useMemo(()=>{
    const grouped:Record<string,any[]>={};

    for(const career of matches){
      const family=careerFamily(career.category);
      (grouped[family]??=[]).push(career);
    }

    return Object.entries(grouped)
      .map(([family,items])=>{
        const sortedItems=[...items].sort(
          (a,b)=>Number(b.match||0)-Number(a.match||0)
        );

        const strongest=sortedItems.slice(0,3);

        const familyScore=strongest.length
          ? strongest.reduce(
              (sum,career)=>
                sum+Number(career.match||0),
              0
            )/strongest.length
          : 0;

        return {
          family,
          items:sortedItems,
          familyScore
        };
      })
      .sort(
        (a,b)=>
          b.familyScore-a.familyScore ||
          familySort(
            a.items[0]?.category||'',
            b.items[0]?.category||''
          )
      );
  },[matches]);

  return (
    <div className="lp-family-list">
      {groups.map(
        ({family,items,familyScore},index)=>{
          const expanded=open[family]??index<2;

          return (
            <section
              className="lp-family"
              key={family}
            >
              <button
                className="lp-family-toggle"
                type="button"
                aria-expanded={expanded}
                onClick={()=>
                  setOpen(current=>({
                    ...current,
                    [family]:!expanded
                  }))
                }
              >
                <span className="lp-family-heading">
                  <strong>{family}</strong>

                  <small>
                    {matchLabel(Math.round(familyScore))}
                    {' Â· '}
                    {items.length}{' '}
                    {items.length===1
                      ? 'possibility'
                      : 'possibilities'}
                  </small>
                </span>

                <span className="lp-family-chevron">
                  {expanded?'âˆ’':'+'}
                </span>
              </button>

              {expanded && (
                <div className="lp-family-body">
                  <div className="grid grid-3">
                    {items.map((career:any)=>(
                      <article
                        className="card career-card lp-career-card"
                        key={career.id}
                      >
                        <div className="lp-career-top">
                          <span className="pill">
                            {career.category}
                          </span>

                          <span className="lp-match-score">
                            <strong>
                              {Math.round(
                                Number(career.match||0)
                              )}%
                            </strong>

                            <small>
                              {matchLabel(career.match)}
                            </small>
                          </span>
                        </div>

                        <h3>{career.title}</h3>

                        <p className="muted lp-summary">
                          {career.summary}
                        </p>

                        <div className="lp-why">
                          <b>Why this appeared for you</b>

                          {(career.reasons||[])
                            .slice(0,3)
                            .map(
                              (
                                reason:string,
                                reasonIndex:number
                              )=>(
                                <span key={reasonIndex}>
                                  <span aria-hidden="true">
                                    âœ“
                                  </span>{' '}
                                  {reason}
                                </span>
                              )
                            )}
                        </div>

                        {career.subjectSignal!=null && (
                          <div className="lp-academic">
                            <span>
                              School-subject signal
                            </span>

                            <strong>
                              {Math.round(
                                Number(
                                  career.subjectSignal
                                )
                              )}%
                            </strong>
                          </div>
                        )}

                        <div style={{marginTop:14}}>
                          <PathwayTags
                            items={career.pathways}
                          />
                        </div>

                        <Link
                          className="btn btn-primary lp-explore"
                          href={`/careers/${career.slug}`}
                        >
                          Explore my path â†’
                        </Link>
                      </article>
                    ))}
                  </div>
                </div>
              )}
            </section>
          );
        }
      )}

      <style jsx>{`
        .lp-family-list{
          display:grid;
          gap:12px;
          margin-top:20px;
        }

        .lp-family{
          border:1px solid #e3e7ef;
          border-radius:16px;
          background:#fff;
          overflow:hidden;
          box-shadow:0 2px 8px rgba(15,23,42,.035);
        }

        .lp-family-toggle{
          width:100%;
          border:0;
          background:#fff;
          padding:17px 20px;
          display:flex;
          align-items:center;
          justify-content:space-between;
          gap:18px;
          cursor:pointer;
          text-align:left;
          color:inherit;
          font:inherit;
        }

        .lp-family-toggle:hover{
          background:#f8f9ff;
        }

        .lp-family-heading{
          display:flex;
          align-items:baseline;
          gap:12px;
          min-width:0;
        }

        .lp-family-heading strong{
          font-size:16px;
          line-height:1.3;
          color:#111827;
        }

        .lp-family-heading small{
          color:#667085;
          font-size:13px;
          font-weight:500;
        }

        .lp-family-chevron{
          width:32px;
          height:32px;
          flex:0 0 32px;
          border-radius:10px;
          background:#f1f2ff;
          color:#4f46e5;
          display:grid;
          place-items:center;
          font-size:20px;
          font-weight:700;
        }

        .lp-family-body{
          border-top:1px solid #edf0f5;
          padding:16px;
          background:#fafbff;
        }

        .lp-career-card{
          display:flex;
          flex-direction:column;
          min-height:100%;
        }

        .lp-career-top{
          display:flex;
          justify-content:space-between;
          align-items:flex-start;
          gap:10px;
        }

        .lp-match-score{
          display:grid;
          text-align:right;
          line-height:1.1;
        }

        .lp-match-score strong{
          color:#4f46e5;
          font-size:20px;
        }

        .lp-match-score small{
          color:#667085;
          font-size:10px;
          margin-top:4px;
        }

        .lp-summary{
          line-height:1.55;
        }

        .lp-why{
          display:grid;
          gap:6px;
          margin:14px 0;
          line-height:1.45;
        }

        .lp-why > span{
          display:block;
          color:#475467;
          font-size:13px;
        }

        .lp-academic{
          display:flex;
          justify-content:space-between;
          gap:12px;
          padding:10px 12px;
          background:#f8fafc;
          border:1px solid #edf0f5;
          border-radius:10px;
          color:#475467;
          font-size:12px;
        }

        .lp-academic strong{
          color:#111827;
        }

        .lp-explore{
          margin-top:auto;
          align-self:flex-start;
        }

        @media(max-width:760px){
          .lp-family-toggle{
            padding:15px 16px;
          }

          .lp-family-heading{
            display:grid;
            gap:4px;
          }

          .lp-family-heading strong{
            font-size:15px;
          }

          .lp-family-heading small{
            font-size:12px;
          }

          .lp-family-body{
            padding:12px;
          }
        }
      `}</style>
    </div>
  );
}
