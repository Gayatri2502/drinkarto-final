import Link from 'next/link';
import {ArrowRight, ArrowUpRight, BarChart3, Boxes, ClipboardList, Users} from 'lucide-react';

export const metadata={title:'Drinkarto for Business',description:'A business workspace for beverage distribution, inventory, orders and reporting.'};

const capabilities=[
  {Icon:Boxes,title:'Inventory control',text:'Track products, stock movements and availability from one workspace.'},
  {Icon:ClipboardList,title:'Orders and invoices',text:'Keep order fulfilment, internal invoices and collections connected.'},
  {Icon:Users,title:'Retailer records',text:'Maintain business accounts and review credit activity with role-based access.'},
  {Icon:BarChart3,title:'Operational reporting',text:'See sales and inventory trends in dashboards designed for daily decisions.'},
];

export default function BusinessPage(){return <section className="public-container public-page business-page">
  <div className="business-breadcrumb"><Link href="/">← Drinkarto home</Link><span>Business workspace</span></div>
  <div className="business-hero">
    <div><p className="public-eyebrow">DRINKARTO FOR BUSINESS</p><h1>Run distribution<br/><em>with a clearer view.</em></h1><p className="public-intro">A practical ERP workspace for beverage distributors managing products, stock, retailers, orders and business reports.</p>
      <div className="public-hero-actions"><Link href="/workspace" className="public-button">Enter business workspace <ArrowRight size={16}/></Link><Link href="/pricing" className="public-button secondary">View proposed plans</Link></div>
    </div>
    <aside className="business-route-card"><span className="business-route-kicker">YOUR OPERATIONS, CONNECTED</span><strong>Products <i>→</i> Inventory <i>→</i> Orders <i>→</i> Reports</strong><p>Sign in to open your workspace, or review the proposed monthly plans before you begin.</p><Link href="/pricing">See features and pricing <ArrowUpRight size={15}/></Link></aside>
  </div>
  <div className="business-capabilities">{capabilities.map(({Icon,title,text})=><article key={title}><Icon size={21}/><h2>{title}</h2><p>{text}</p></article>)}</div>
  <p className="public-notice">Drinkarto ERP is business software. It does not sell, deliver or process payments for liquor. Any regulated activity remains subject to the business’s licences and local laws.</p>
</section>}
