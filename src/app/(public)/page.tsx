import Link from 'next/link';
import { ArrowUpRight, BookOpen, GitCompare, Layers, ShieldCheck } from 'lucide-react';
import PriceBrowser from '@/components/price-browser';
import { profiles } from '@/content/public';
import {db} from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const snapshots=await db.publicPriceSnapshot.findMany();
  const coverage=[...new Set(snapshots.map(s=>s.state))].sort();
  const countries=coverage.join(' · ');
  const listedAuthorities=[...new Set(snapshots.map(s=>({'bevco-2026-09':'BEVCO','tasmac-2026-10':'TASMAC','osbc-2026-27':'OSBC','ksbcl-2026-08':'KSBCL','csmcl-public':'CSMCL','assam-2026-27':'Assam Excise'} as Record<string,string>)[s.authority]??s.state))].sort();
  return <>
    <section className="professional-hero public-container">
      <div className="professional-hero-copy">
        <p className="public-eyebrow">INDIA · LIQUOR REFERENCE & KNOWLEDGE</p>
        <h1>A clear reference.<br />An informed perspective.</h1>
        <p className="hero-description">Explore official state price references, understand liquor categories, and compare styles with clear, practical information.</p>
        <div className="public-hero-actions">
          <Link href="/prices" className="public-button">Browse price references <ArrowUpRight size={16} /></Link>
          <Link href="/catalogue" className="public-button secondary">Product library</Link>
        </div>
        <p className="professional-hero-note"><ShieldCheck size={16} /> Source-linked information. Educational reference for adults.</p>
      </div>
      <aside className="reference-brief" aria-label="Reference coverage">
        <div className="brief-heading"><span className="brief-mark">D</span><span>DRINKARTO REFERENCE DESK</span></div>
        <h2>Information with<br />a traceable source.</h2>
        <dl>
          <div><dt>Price coverage</dt><dd>{countries||'Official sources are being initialized'}</dd></div>
          <div><dt>Published authorities</dt><dd>{listedAuthorities.join(' · ')}</dd></div>
          <div><dt>Product identities</dt><dd>1,738 workbook references</dd></div>
          <div><dt>Knowledge library</dt><dd>Categories, styles & terminology</dd></div>
        </dl>
        <Link href="/guides/price-sources">Read our sourcing methodology <ArrowUpRight size={15} /></Link>
      </aside>
    </section>
    <section className="public-container public-section" id="prices">
      <div className="public-section-heading"><div><p className="public-eyebrow">PRICE DIRECTORY</p><h2>State liquor price references</h2><p>Search by product, state and bottle size. Verify the exact variant against the published source.</p></div><Link href="/prices" className="public-text-link">Full directory <ArrowUpRight size={16} /></Link></div>
      <PriceBrowser compact initialState="" initialSize="750" />
      <p className="public-source-line">Coverage: {countries||'no state feeds yet'}. Published references do not establish availability.</p>
    </section>
    <section className="professional-knowledge"><div className="public-container public-section">
      <div className="public-section-heading"><div><p className="public-eyebrow">KNOWLEDGE LIBRARY</p><h2>Understand what distinguishes a liquor.</h2></div><Link href="/guides" className="public-text-link">Browse guides <ArrowUpRight size={16} /></Link></div>
      <div className="professional-resource-grid">
        {[{Icon:BookOpen,title:'Terminology & categories',text:'A concise alphabetical reference to production, ingredients and the terms found on a bottle label.',href:'/dictionary',cta:'Open the dictionary'}, {Icon:Layers,title:'Style & taste profiles',text:'Understand body, sweetness, acidity and common flavour descriptions across wine and spirit styles.',href:'/taste',cta:'Explore taste profiles'}, {Icon:GitCompare,title:'Side-by-side comparisons',text:'Compare characteristics across two styles, with clear descriptions and educational source references.',href:'/compare',cta:'Compare styles'}].map(({Icon,title,text,href,cta})=><Link key={href} href={href} className="professional-resource"><Icon size={22}/><h3>{title}</h3><p>{text}</p><span>{cta}<ArrowUpRight size={15}/></span></Link>)}
      </div>
    </div></section>
    <section className="public-container public-section"><div className="public-section-heading"><div><p className="public-eyebrow">WINE REFERENCE</p><h2>Wine styles at a glance</h2><p>Descriptive style references. Individual bottles vary by producer, region and vintage.</p></div><Link href="/wines" className="public-text-link">Wine library <ArrowUpRight size={16}/></Link></div>
      <div className="professional-wines">{profiles.filter(p=>['cabernet','sauvignon','rose'].includes(p.id)).map(p=><Link key={p.id} href={'/wines#'+p.id}><span className="wine-category">{p.family}</span><h3>{p.name}</h3><p>{p.notes.slice(0,2).join(' · ')}</p><div><span>Body: {p.body}</span><ArrowUpRight size={17}/></div></Link>)}</div>
    </section>
    <section className="public-business-strip public-container"><div><p className="public-eyebrow">DRINKARTO FOR BUSINESS</p><h3>Inventory, orders and reporting.<br />One operational workspace.</h3><p>Tools for beverage distribution teams.</p></div><div className="business-actions"><Link href="/business" className="public-button">Explore business tools <ArrowUpRight size={16}/></Link><Link href="/pricing" className="public-text-link">View proposed pricing</Link></div></section>
  </>;
}
