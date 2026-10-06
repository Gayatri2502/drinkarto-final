import DictionaryBrowser from '@/components/dictionary-browser';
export const metadata={title:'A–Z liquor dictionary'};
export default function Dictionary(){return <div className="public-container public-page"><p className="public-eyebrow">THE A–Z LIBRARY</p><h1>Big words.<br/><em>Simple explanations.</em></h1><p className="public-intro">A short, alphabetical reference to the words behind the bottle. Search by term or explore a topic.</p><DictionaryBrowser/></div>}
