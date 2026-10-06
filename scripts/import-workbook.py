import openpyxl,re,json,hashlib,unicodedata
from pathlib import Path
import sys
root=Path(__file__).resolve().parents[1]
if len(sys.argv)!=2:raise SystemExit('Usage: python scripts/import-workbook.py /path/to/reference.xlsx')
w=openpyxl.load_workbook(sys.argv[1],read_only=True,data_only=True)
display={str(a).strip():str(b).strip() for a,b,*_ in w['des'].iter_rows(min_row=2,values_only=True) if a and b}
products={}; variants=0; nonalcohol=0
mapping=[('Non-alcoholic',r'mixer|water|tonic|mocktail|juice|syrup|aerated'),('Wine',r'wine|sparkling|champagne|prosecco|cabernet|riesling|gewurz|sauvignon|chardonnay|merlot|pinot|shiraz|malbec|port wine'),('Whisky',r'whisk(?:y|ey)|scotch|single malt|bourbon|speyside|highland|islay'),('Tequila',r'tequila|mezcal'),('Brandy',r'brandy|cognac'),('Vodka',r'vodka'),('Gin',r'\bgin\b'),('Rum',r'\brum\b'),('Beer',r'beer|lager|\bale\b|stout|\bcider\b')]
def sizes(v):
 return sorted(set(round(float(n)*(1000 if u.lower() not in ['ml'] else 1)) for n,u in re.findall(r'(\d+(?:\.\d+)?)\s*(ml|ltr|litre|liter|l)\b',str(v or ''),re.I)))
for rowno,r in enumerate(w['input'].iter_rows(min_row=2,max_col=52,values_only=True),2):
 key,typ,name,desc,image,col,*_=r
 if typ=='Variant':
  if key in products:products[key]['sizesMl']=sorted(set(products[key]['sizesMl']+sizes(r[18])));variants+=1
  continue
 if typ!='Product' or not name:continue
 name=re.sub(r'\s+',' ',display.get(str(name).strip(),str(name).title())).strip()
 text=f'{col or ""} {name}';category=next((c for c,p in mapping if re.search(p,text,re.I)),'Other')
 if category=='Non-alcoholic':nonalcohol+=1
 canonical=unicodedata.normalize('NFKD',name).encode('ascii','ignore').decode().lower();canonical=re.sub(r'[^a-z0-9]+','-',canonical).strip('-')
 products[key]={'id':'ref-'+hashlib.sha256(canonical.encode()).hexdigest()[:24],'name':name,'category':category,'referenceGroup':str(col or '').strip(),'sizesMl':sizes(r[18]),'source':'User workbook reference','sourceRow':rowno,'sourceHandle':key,'verification':'Reference identity only; check producer label. Workbook price and tasting claims are not published.'}
out=list(products.values());(root/'src/content/catalogue.json').write_text(json.dumps(out,ensure_ascii=False,separators=(',',':'))+'\n')
report={'products':len(out),'variantRowsMerged':variants,'nonAlcoholicReferences':nonalcohol,'sizeUnknown':sum(not p['sizesMl'] for p in out),'categories':{c:sum(p['category']==c for p in out) for c,_ in mapping},'excludedFields':['undated prices','InStock claims','promotional descriptions','remote images','blank filler columns'],'rule':'Product names reconciled against des sheet; duplicate variants merged by source handle; no prices used.'}
(root/'docs/WORKBOOK-IMPORT.json').write_text(json.dumps(report,indent=2));print(report)
