"""Read-only official source adapters. Output JSON; prices are never inferred."""
import sys,json,re,urllib.request,urllib.parse,io,datetime,subprocess,tempfile
from html.parser import HTMLParser
from state_price_parsers import parse_karnataka,parse_chhattisgarh

def fetch(url,body=None):
 # curl uses the host's verified TLS trust store. Never bypass certificate checks.
 command=['curl','--fail','--silent','--show-error','--location','--max-time','60','--max-filesize','30000000','--user-agent','DrinkartoReference/1.0']
 if body is not None:command+=['--header','Content-Type: application/json','--data-binary',body.decode()]
 result=subprocess.run(command+[url],capture_output=True,timeout=65,check=True)
 if len(result.stdout)>30_000_000:raise ValueError('Source exceeds size limit')
 return result.stdout

def category(name):
 for c,p in [('Beer',r'\bbeer\b'),('Whisky',r'\bwhisk(?:ey|y)\b'),('Vodka',r'\bvodka\b'),('Rum',r'\brum\b'),('Gin',r'\bgin\b'),('Brandy',r'\bbrandy\b'),('Wine',r'\bwine\b'),('Tequila',r'\btequila\b')]:
  if re.search(p,name,re.I):return c
 return 'Other'

class HiddenFields(HTMLParser):
 def __init__(self):super().__init__();self.fields={}
 def handle_starttag(self,tag,attrs):
  attrs=dict(attrs)
  if tag=='input' and attrs.get('type')=='hidden' and attrs.get('name'):self.fields[attrs['name']]=attrs.get('value','')
def form_fields(markup):
 parser=HiddenFields();parser.feed(markup);return parser.fields
def form_fetch(url,cookies,fields=None):
 command=['curl','--fail','--silent','--show-error','--location','--max-time','60','--max-filesize','30000000','--cookie',cookies,'--cookie-jar',cookies]
 if fields is not None:command+=['--header','Content-Type: application/x-www-form-urlencoded','--data-binary','@-']
 result=subprocess.run(command+[url],input=urllib.parse.urlencode(fields).encode() if fields is not None else None,capture_output=True,timeout=65,check=True)
 return result.stdout.decode('utf-8',errors='strict')

class AssamRows(HTMLParser):
 def __init__(self):super().__init__();self.rows=[];self.row=None;self.cell=None
 def handle_starttag(self,tag,attrs):
  if tag=='tr':self.row=[]
  elif tag=='td' and self.row is not None:self.cell=[]
 def handle_data(self,data):
  if self.cell is not None:self.cell.append(data)
 def handle_endtag(self,tag):
  if tag=='td' and self.cell is not None:
   if self.row is not None:self.row.append(' '.join(''.join(self.cell).split()))
   self.cell=None
  elif tag=='tr' and self.row is not None:self.rows.append(self.row);self.row=None

date_pattern=re.compile(r'\(From\s+(\d{2})-([A-Za-z]{3})-(\d{4})\s+To\s+(\d{2})-([A-Za-z]{3})-(\d{4})\)',re.I)

authority=sys.argv[1];rows=[];published=effective=None
if authority=='bevco-2026-09':
 import pdfplumber
 listing='https://bevco.in/price-list-2/'
 html=fetch(listing).decode(errors='replace')
 links=re.findall(r'href=[\"\']([^\"\']+\.pdf)[\"\']',html,re.I)
 candidates=[]
 for link in links:
  link=urllib.parse.urljoin(listing,link.replace('&amp;','&'));name=urllib.parse.unquote(link)
  if urllib.parse.urlparse(link).hostname!='bevco.in':continue
  if 'IMFL' not in name.upper() or 'QUOTED' not in name.upper():continue
  date=re.search(r'PRICE-LIST[_-]+(\d{2})-(\d{2})-(\d{4})',name,re.I)
  if date:
   d,m,y=map(int,date.groups());candidates.append((datetime.date(y,m,d),link))
 if not candidates:raise ValueError('No dated official IMFL retail PDF found')
 date,url=max(candidates);published=date.isoformat()
 eff=re.search(r'effect[-_ ]from[-_ ](\d{2})-(\d{2})-(\d{4})',urllib.parse.unquote(url),re.I)
 if eff: d,m,y=map(int,eff.groups());effective=datetime.date(y,m,d).isoformat()
 pdf=pdfplumber.open(io.BytesIO(fetch(url)))
 if len(pdf.pages)>250:raise ValueError('Unexpected PDF page count')
 text='\n'.join(p.extract_text(layout=True) or '' for p in pdf.pages)
 if not re.search(r'FL\s*1.*Shop|Shop.*FL\s*1',text,re.I):raise ValueError('Retail column label missing')
 pattern=re.compile(r'^\s*(\d+)\s+([A-Z0-9]{8,12})\s+(.*?)\s+(\d{2,4})\s+(\d{1,3})\s+((?:\d+(?:\.\d+)?\s+){10}\d+(?:\.\d+)?)\s*$')
 last='';section=None
 for line in text.splitlines():
  if re.search(r'BEER\s+Supplier',line,re.I):section='Beer'
  if re.search(r'WINE\s+Supplier',line,re.I):section='Wine'
  m=pattern.match(line)
  if not m:continue
  serial,code,name,size,pack,numbers=m.groups();name=name.strip() or last;last=name;size=int(size);price=float(numbers.split()[-1])
  if not name or not 0<size<=2000 or price<=0:continue
  rows.append({'id':'kl-'+code,'name':re.sub(r"'S\b","'s",name.title()),'category':section or category(name),'state':'Kerala','sizeMl':size,'price':price,'sourceId':authority,'sourceCode':code})
elif authority=='tasmac-2026-10':
 url='https://tasmac.tn.gov.in/brands';data=json.loads(fetch('https://shopdashboard-api.tasmace2e.in/api/liquor/get-productList',b'{}'))
 for supplier in data['data']:
  for product in supplier['Product_Name']:
   name=product['productName'].strip()
   for detail in product['productDetails']:
    unit=str(detail['unitName']);match=re.search(r'(\d+(?:\.\d+)?)\s*(ml|l|ltr)?',unit,re.I)
    if not match:raise ValueError('Unrecognized bottle size')
    size=round(float(match[1])*(1000 if match[2] and match[2].lower() in ['l','ltr'] else 1));price=float(detail['mrpPerBottle']);code=str(detail['pkProductId'])
    if not 0<size<=2000 or price<=0:continue
    c=category(name)
    if c=='Other':c=category(str(detail.get('brandName','')))
    rows.append({'id':'tn-'+code,'name':re.sub(r"'S\b","'s",name.title()),'category':c,'state':'Tamil Nadu','sizeMl':size,'price':price,'sourceId':authority,'sourceCode':code})
elif authority=='osbc-2026-27':
 from html.parser import HTMLParser
 import hashlib
 url='https://osbc.co.in/HTTP_PUBLIC/MRPList.aspx'
 html=fetch(url).decode('utf-8',errors='strict')
 if not re.search(r'MRP FOR\s*(?:<[^>]+>\s*)*2026-2027',html):raise ValueError('Expected 2026-2027 MRP header missing; review new financial year')
 class TableRows(HTMLParser):
  def __init__(self):super().__init__();self.rows=[];self.row=None;self.cell=None
  def handle_starttag(self,tag,attrs):
   if tag=='tr':self.row=[]
   elif tag=='td' and self.row is not None:self.cell=[]
  def handle_data(self,data):
   if self.cell is not None:self.cell.append(data)
  def handle_endtag(self,tag):
   if tag=='td' and self.cell is not None:
    if self.row is not None:self.row.append(' '.join(''.join(self.cell).split()))
    self.cell=None
   elif tag=='tr' and self.row is not None:self.rows.append(self.row);self.row=None
 parser=TableRows();parser.feed(html)
 for cells in parser.rows:
  if len(cells)!=5 or not cells[0].isdigit():continue
  serial,supplier,name,size,mrp=cells
  # Defence-specific rates are not general retail MRP.
  if re.search(r'\(DEF\)',name,re.I):continue
  match=re.fullmatch(r'(\d+)\s*ML',size,re.I)
  if not match:raise ValueError('Unrecognized OSBC pack size')
  size=int(match[1]);price=float(mrp.replace(',',''))
  if not 0<size<=2000 or price<=0:raise ValueError('Invalid OSBC bottle or MRP')
  code=hashlib.sha256((supplier+'|'+name+'|'+str(size)).encode()).hexdigest()[:24]
  rows.append({'id':'od-'+code,'name':name,'category':category(name),'state':'Odisha','sizeMl':size,'price':price,'sourceId':authority,'sourceCode':code})
elif authority=='ksbcl-2026-08':
 import pdfplumber
 listing='https://ksbcl.karnataka.gov.in/en'
 markup=fetch(listing).decode(errors='replace')
 links=re.findall(r'href=["\']([^"\']+\.pdf)["\']',markup,re.I)
 links=[urllib.parse.urljoin(listing,x.replace('&amp;','&')) for x in links if re.search(r'supplier.*wise.*item.*wise.*pric',urllib.parse.unquote(x),re.I)]
 links=[x for x in links if urllib.parse.urlparse(x).hostname=='ksbcl.karnataka.gov.in']
 if not links:raise ValueError('Official Karnataka supplier price PDF not found')
 url=links[0]
 with pdfplumber.open(io.BytesIO(fetch(url))) as pdf:
  if len(pdf.pages)>1000:raise ValueError('Unexpected Karnataka document size')
  first=pdf.pages[0].extract_text() or ''
  match=re.search(r'AS ON\s*(\d{2})[./-](\d{2})[./-](\d{4})',first,re.I)
  if not match:raise ValueError('Karnataka publication date missing')
  day,month,year=map(int,match.groups());as_of=datetime.date(year,month,day);published=as_of.isoformat()
  text=[]
  for page in pdf.pages:text.append(page.extract_text() or '');page.close()
 rows=parse_karnataka('\n'.join(text),as_of,authority)
 for row in rows:
  row['name']=row['name'][:250]
  row['category']=category(row['name'])
elif authority=='csmcl-public':
 url='https://excise.cg.nic.in/CSMCL/RetailServices/reports/PriceListForApp.aspx'
 with tempfile.NamedTemporaryFile() as cookies:
  markup=form_fetch(url,cookies.name)
  for index,kind in enumerate(['FL','ReadyToDrink','Wine','Beer','CL']):
   markup=form_fetch(url,cookies.name,form_fields(markup)|{'__EVENTTARGET':'DBType$'+str(index),'__EVENTARGUMENT':'','DBType':kind})
   rows.extend(parse_chhattisgarh(markup,kind,authority))
elif authority=='assam-2026-27':
 url='https://stateexcise.assam.gov.in/index.php/PriceList/priceListView'
 with tempfile.NamedTemporaryFile() as cookies:
  markup=form_fetch(url,cookies.name)
  fields=form_fields(markup)
  # Follow every liquor type and segment offered by the public portal.
  type_block=re.search(r'<select[^>]*id=["\']liquorType["\'][^>]*>(.*?)</select>',markup,re.I|re.S)
  if not type_block:raise ValueError('Assam liquor type selector missing')
  liquor_types=[value for value in re.findall(r'<option[^>]*value=["\']([^"\']+)["\']',type_block[1],re.I) if value]
  if not liquor_types:raise ValueError('Assam public liquor types unavailable')
  # Import and Foreign identify general-market product channels in the portal;
  # defence, export, paramilitary and CLMS entries are excluded from this directory.
  public_channels={'civilian','import','foreign','country spirit','heritage wine'}
  today=datetime.date.today();latest={}
  for liquor_type in liquor_types:
   segment_markup=form_fetch(urllib.parse.urljoin(url,'getSegmentDetails'),cookies.name,{'type':liquor_type,'csrf_token':fields.get('csrf_token','')})
   segments=json.loads(segment_markup)
   if not isinstance(segments,list):raise ValueError('Assam segment response changed')
   for segment in segments:
    code=str(segment.get('CODE',''));name_of_segment=str(segment.get('NAME','')).strip()
    if not code or not name_of_segment:raise ValueError('Assam segment identity missing')
    body={'segment':code,'csrf_token':fields.get('csrf_token',''),'financialYear':'2026-2027','acttype':'list','liquorType':liquor_type}
    markup=form_fetch(urllib.parse.urljoin(url,'getPriceList'),cookies.name,body)
    parser=AssamRows();parser.feed(markup)
    for cells in parser.rows:
     if len(cells)<7 or not cells[0].isdigit():continue
     serial,supplier,purpose,brand,product,pack,mrp=cells[:7]
     market=purpose.strip()
     if market.casefold() not in public_channels:continue
     try:price=float(mrp.replace(',',''))
     except ValueError:continue
     if price<=0:continue
     size_match=re.fullmatch(r'\s*(\d{2,4})\s*[x×]\s*\d+\s*',pack,re.I)
     if not size_match:continue
     size=int(size_match[1])
     if not 0<size<=2000:continue
     date_match=date_pattern.search(product)
     if not date_match:raise ValueError('Assam effective date missing from public price row')
     d1,m1,y1,d2,m2,y2=date_match.groups();start=datetime.datetime.strptime(f'{d1}-{m1}-{y1}','%d-%b-%Y').date();end=datetime.datetime.strptime(f'{d2}-{m2}-{y2}','%d-%b-%Y').date()
     if not start<=today<=end:continue
     liquor_name=re.sub(r'\s*\(From\s+.*?\)\s*$','',product,flags=re.I).strip()
     if len(liquor_name)>250:continue
     identity='|'.join([liquor_type,code,market.casefold(),supplier.casefold(),liquor_name.casefold(),str(size)])
     source_code=__import__('hashlib').sha256(identity.encode()).hexdigest()[:24]
     row={'id':'as-'+source_code,'name':liquor_name,'category':category(liquor_name),'state':'Assam','sizeMl':size,'price':price,'sourceId':authority,'sourceCode':source_code,'market':market,'effective':start.isoformat(),'effectiveTo':end.isoformat()}
     key=identity
     if key not in latest or start>latest[key][0]:latest[key]=(start,row)
  rows=[entry[1] for entry in latest.values()]
  if not rows:raise ValueError('No current Assam public-market prices found across listed segments')
  published='2026-2027'

else:raise ValueError('Unknown official source')
unique={}
for r in rows:
 if r['id'] in unique and unique[r['id']]!=r:
  if authority!='csmcl-public':raise ValueError('Conflicting duplicate official row identities')
  if r['sourceCode']!=unique[r['id']]['sourceCode']:raise ValueError('Conflicting Chhattisgarh source identities')
 unique[r['id']]=r
if len(unique)<(1 if authority=='assam-2026-27' else 100):raise ValueError('Suspiciously small source result')
print(json.dumps({'rows':list(unique.values()),'sourceUrl':url,'published':published,'effective':effective}))
