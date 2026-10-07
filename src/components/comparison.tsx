"use client";
import {useState} from 'react';
import Link from 'next/link';
import {profiles,educationSources} from '@/content/public';
import { BottleReferenceImage } from '@/components/bottle-reference-image';
export default function Comparison({initialLeft='whisky',initialRight='rum'}:{initialLeft?:string;initialRight?:string}) {
 const valid=(id:string)=>profiles.some(p=>p.id===id);
 const [left,setLeft]=useState(valid(initialLeft)?initialLeft:'whisky');
 const [right,setRight]=useState(valid(initialRight)?initialRight:'rum');
 const [differences,setDifferences]=useState(false);
 const a=profiles.find(p=>p.id===left)!,b=profiles.find(p=>p.id===right)!;
 const rows=[['Typical notes',a.notes.join(' · '),b.notes.join(' · ')],['Body',a.body,b.body],['Sweetness',a.sweetness,b.sweetness],['Acidity',a.acidity,b.acidity],['Tannin',a.tannin,b.tannin]];
 const shown=rows.filter(([,x,y])=>!differences||x!==y);
 return <section className="comparison-desk" aria-label="Style comparison">
 <div className="comparison-toolbar"><div className="compare-selects"><label>First style<select value={left} onChange={e=>setLeft(e.target.value)}>{profiles.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></label><button className="compare-swap" onClick={()=>{setLeft(right);setRight(left)}} aria-label="Swap comparison styles">⇄<span>Swap</span></button><label>Second style<select value={right} onChange={e=>setRight(e.target.value)}>{profiles.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></label></div><label className="compare-filter"><input type="checkbox" checked={differences} onChange={e=>setDifferences(e.target.checked)}/> Show differences only</label></div>
 {left===right&&<p role="status" className="public-notice">The same style is selected on both sides. Select another style to compare.</p>}
 <div className="compare-head">{[a,b].map((p,i)=>{const photoCategory=p.family==='Spirit'?p.name:'Wine';return <article key={i}>{['Whisky','Rum','Vodka','Gin','Brandy','Beer','Wine','Tequila'].includes(photoCategory)&&<BottleReferenceImage category={photoCategory} className="compare-bottle-photo"/>}<span className="compare-index">0{i+1} / {p.family}</span><h2>{p.name}</h2><p>{p.description}</p><div className="compare-notes">{p.notes.map(n=><span key={n}>{n}</span>)}</div></article>})}</div>
 <div className="comparison-table-heading"><h3>Characteristics at a glance</h3><span aria-live="polite">{shown.length} characteristics{differences?' with differences':''}</span></div>
 <div className="public-table-wrap" tabIndex={0} role="region" aria-label="Comparison characteristics"><table className="comparison-table"><caption>Typical style descriptions; individual bottles vary.</caption><thead><tr><th scope="col">Characteristic</th><th scope="col">{a.name}</th><th scope="col">{b.name}</th></tr></thead><tbody>{shown.map(([key,x,y])=><tr key={key}><th scope="row">{key}</th><td>{x}</td><td>{y}</td></tr>)}{shown.length===0&&<tr><td colSpan={3}>No differences in the listed characteristics.</td></tr>}<tr><th scope="row">Reference</th>{[a,b].map((p,i)=><td key={i}><a href={educationSources[p.source]} target="_blank" rel="noreferrer">Educational source ↗</a></td>)}</tr></tbody></table></div>
 <div className="compare-end"><p>Wine and spirits have different structures. Exact bottle prices, ABV and ingredients must be checked separately.</p><Link className="public-button" href="/prices">Find bottle prices ↗</Link></div></section>
}
