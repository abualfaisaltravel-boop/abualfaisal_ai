from bs4 import BeautifulSoup
import requests
from urllib.parse import urljoin

HEADERS={"User-Agent":"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/125.0 Safari/537.36","Accept-Language":"en-US,en;q=0.8"}
BASE="https://customer3.videcom.com/FlyAden/VARS/Public/CustomerPanels/FlightScheduleReportParams.aspx"
session=requests.Session()
r=session.get(BASE,headers=HEADERS,timeout=25)
print("ADEN_GET",r.status_code,len(r.content))
soup=BeautifulSoup(r.text,"html.parser")
for city, destination in (("ADE","JED"),("ADE","CAI")):
    form=soup.find("form")
    if not form: print("FORM_MISSING");continue
    data={}
    for field in form.find_all("input"):
        if field.get("name") and field.get("type","").lower()=="hidden":
            data[field["name"]]=field.get("value","")
    data.update({"ddlDepartCity":city,"ddlArriveCity":destination,"dtpFromDate":"20/11/2026","dtpToDate":"30/11/2026","btnRunReport":"Flight Schedule"})
    try:
        res=session.post(urljoin(BASE,form.get("action") or ""),data=data,headers=HEADERS,timeout=25,allow_redirects=True)
        t=BeautifulSoup(res.text,"html.parser")
        print("ADEN_SEARCH",city,destination,"STATUS",res.status_code,"URL",res.url,"TYPE",res.headers.get("Content-Type"),"BYTES",len(res.content),"TABLES",len(t.find_all("table")),"FORMS",len(t.find_all("form")))
        print("ADEN_TEXT",t.get_text(" ",strip=True)[:900])
        print("ADEN_LINKS",[(a.get_text(" ",strip=True)[:35],a.get("href","")[:130]) for a in t.find_all("a")[:12]])
        print("ADEN_IFRAMES",[x.get("src") for x in t.find_all("iframe")[:4]])
        print("ADEN_SCRIPTS",[x.get("src") for x in t.find_all("script",src=True)[-8:]])
    except Exception as exc: print("ADEN_ERROR",type(exc).__name__,str(exc)[:200])
YEM="https://yemenia.com/ar/flights-schedule"
for date in ("2026-10-20","2026-11-13"):
    try:
        res=requests.get(YEM,params={"from":"1658","to":"1663","date":date},headers=HEADERS,timeout=25)
        doc=BeautifulSoup(res.text,"html.parser")
        main=doc.select_one("main") or doc
        print("YEMENIA_QUERY",date,"STATUS",res.status_code,"TEXT",main.get_text(" ",strip=True)[:450],"TABLES",len(main.find_all("table")))
    except Exception as exc: print("YEMENIA_ERROR",date,type(exc).__name__,str(exc)[:180])
