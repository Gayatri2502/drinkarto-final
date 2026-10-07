import PublicFrame from '@/components/public-frame';
import './public.css';
import './professional.css';
import './knowledge.css';
export const metadata={title:{default:'Drinkarto | Liquor price references and knowledge',template:'%s · Drinkarto'},description:'Browse dated liquor price references from linked state sources, compare wine and spirit styles, and read source-linked guides for adults.'};
export default function Layout({children}:{children:React.ReactNode}){return <PublicFrame>{children}</PublicFrame>}
