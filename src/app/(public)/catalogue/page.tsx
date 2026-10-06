import CatalogueBrowser from '@/components/catalogue-browser';
export const metadata={title:'Product reference library'};
export default function Page(){return <section className="public-container public-page"><p className="public-eyebrow">THE REFERENCE SHELF</p><h1>Find a name.<br/><em>Make sense of the bottle.</em></h1><p className="public-intro">1,738 refined product identities from the Drinkarto reference workbook. Choose two for the comparison tray. Current rates come separately from official state sources.</p><CatalogueBrowser/></section>}
