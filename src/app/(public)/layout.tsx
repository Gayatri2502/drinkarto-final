import PublicFrame from '@/components/public-frame';
import './public.css';
import './professional.css';
import './knowledge.css';
export const metadata={title:{default:'Drinkarto — The Liquor Library',template:'%s · Drinkarto'},description:'Explore official state liquor price references, bottle sizes, an A–Z dictionary, wine styles and taste comparisons.'};
export default function Layout({children}:{children:React.ReactNode}){return <PublicFrame>{children}</PublicFrame>}
