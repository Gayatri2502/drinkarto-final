"""Pure parsers for published government price documents; no network access."""
import re,datetime,hashlib,html

def parse_karnataka(text,as_of,authority='ksbcl-2026-08'):
 pattern=re.compile(r'^\s*(\d+)\s*(.*?)\s+(\d{7,12})\s+(\d{2}-[A-Za-z]{3}-\d{2})\s+([\d,]+\.\d{2})\s+([\d,]+\.\d{2})\s+([\d,]+\.\d{2})\s+([\d,]+\.\d{2})\s*$')
 latest={};unparsed=0;dated=0
 for line in text.splitlines():
  if not re.search(r'\d{2}-[A-Za-z]{3}-\d{2}',line):continue
  dated+=1;m=pattern.match(line)
  if not m:unparsed+=1;continue
  serial,name,code,date,declared,landed,selling,mrp=m.groups();date=datetime.datetime.strptime(date,'%d-%b-%y').date()
  if date>as_of:continue
  sizes=re.findall(r'(\d+(?:\.\d+)?)\s*(ML|LTR|LITRE|LITER)',name,re.I)
  if not sizes:unparsed+=1;continue
  # MLx case notation is also used in the document.
  match=re.search(r'(\d+(?:\.\d+)?)\s*(ML|LTR|LITRE|LITER)',name,re.I)
  size=round(float(match[1])*(1000 if match[2].upper()!='ML' else 1));price=float(mrp.replace(',',''))
  if not 0<size<=2000 or price<=0:continue
  r={'id':'ka-'+code,'name':name.strip(),'category':'Other','state':'Karnataka','sizeMl':size,'price':price,'sourceId':authority,'sourceCode':code,'effective':date.isoformat()}
  key=(code,size)
  if key in latest and latest[key][0]==date and latest[key][1]!=r:raise ValueError('Conflicting Karnataka prices for the same code, size and effective date')
  if key not in latest or date>latest[key][0]:latest[key]=(date,r)
 if not dated or unparsed>max(3,dated*.01):raise ValueError(f'Karnataka layout changed: {unparsed} of {dated} dated lines unparsed')
 return [r for date,r in latest.values()]

def parse_chhattisgarh(markup,kind,authority='csmcl-public'):
 # Read the main card only; its modal repeats the name and price.
 pattern=re.compile(r'<p[^>]*onclick="showdivModel\(\d+\)"[^>]*>\s*\d+\s*-\s*([^<]+?)\s*-\s*<span class="lbl">(.*?)</span>\s*</p>\s*<p[^>]*>\s*(\d+)\s*ML\s*@\s*([\d,.]+)\s*</p>',re.S|re.I)
 rows=[]
 for category,name,size,price in pattern.findall(markup):
  name=html.unescape(re.sub('<[^>]+>','',name)).strip()[:250];size=int(size);price=float(price.replace(',',''))
  if not 0<size<=2000 or price<=0:continue
  category=category.strip().title();category={'Scotch':'Whisky','Whiskey':'Whisky','Ready To Drink':'Other','Country Liquor':'Other'}.get(category,category)
  if kind=='Beer':category='Beer'
  if kind=='Wine':category='Wine'
  if kind in ['ReadyToDrink','CL']:category='Other'
  code=hashlib.sha256((kind+'|'+category+'|'+name+'|'+str(size)).encode()).hexdigest()[:24]
  rows.append({'id':'cg-'+code,'name':name,'category':category,'state':'Chhattisgarh','sizeMl':size,'price':price,'sourceId':authority,'sourceCode':code})
 if not rows:raise ValueError('No Chhattisgarh retail price cards found')
 return rows
