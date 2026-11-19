"use client";
import {useState} from "react";
import Link from "next/link";
import {BookOpen,ArrowUpRight,Search,Layers} from "lucide-react";
import {knowledgeArticles} from "@/content/knowledge";
import {guides} from "@/content/public";
export default function LearningDashboard(){
 const [category,setCategory]=useState("");const [query,setQuery]=useState("");
 const articles=[...knowledgeArticles.map(a=>({...a,description:a.summary})),...guides.map(a=>({...a,readingTime:"3 min"}))];
 const categories=[...new Set(articles.map(a=>a.category))];
 const rows=articles.filter(a=>(!category||a.category===category)&&[a.title,a.description].join(" ").toLowerCase().includes(query.toLowerCase()));
 return <section className="desk-shell"><aside className="desk-sidebar"><span className="desk-label">READING ROOM</span><h2>Knowledge</h2><button aria-pressed={!category} onClick={()=>setCategory("")}><Layers size={16}/>All topics</button>{categories.map(c=><button key={c} aria-pressed={category===c} onClick={()=>setCategory(c)}>{c}</button>)}</aside><div className="desk-main"><div className="desk-feature"><span className="desk-label">THE DRINKARTO LIBRARY</span><h1>Start with a question.<br/>Leave with understanding.</h1><p>Origins, flavour, labels and business basics. Choose one topic at a time.</p><BookOpen size={70} strokeWidth={1}/></div><label className="desk-search"><Search size={18}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search articles" aria-label="Search knowledge articles"/></label><p role="status">{rows.length} articles · {category||"All topics"}</p><div className="desk-articles">{rows.map(a=><Link href={"/guides/"+a.slug} key={a.slug}><span className="desk-label">{a.category} · {a.readingTime}</span><h2>{a.title}</h2><p>{a.description}</p><span>Read article <ArrowUpRight size={16}/></span></Link>)}</div></div></section>
}
