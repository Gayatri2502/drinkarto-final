import ProfileBrowser from '@/components/profile-browser';
export const metadata={title:'Popular wine styles'};
export default function Wines(){return <div className="public-container public-page"><p className="public-eyebrow">THE WINE NOTEBOOK</p><h1>A world of wine.<br/><em>A place to begin.</em></h1><p className="public-intro">Explore familiar grape varieties and wine styles, from Cabernet Sauvignon to sparkling wine. These are educational examples, not a sales ranking.</p><ProfileBrowser wineOnly/></div>}
