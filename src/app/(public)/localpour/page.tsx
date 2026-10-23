import DiscoveryExplorer from '@/components/discovery-explorer';
import LocalPour from '@/components/local-pour';
export const metadata={title:'LocalPour — your Drinkarto city explorer',description:'Explore liquor shops, bars and restaurants by city, learn about styles, and check available official state bottle price references.'};
export default function Page(){return <div className="public-container public-page localpour-dashboard"><p className="public-eyebrow">DISCOVER · TASTE · EXPLORE INDIA</p><h1>LocalPour<span className="localpour-dot">.</span></h1><p className="public-intro">Your city, your radius, your kind of evening.</p><DiscoveryExplorer/><details className="community-panel"><summary>State bottle budgets & city search links</summary><LocalPour/></details></div>}
