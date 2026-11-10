"""Read public airline schedules for Abu Al-Faisal; not ticket availability."""
from datetime import datetime,timedelta
from zoneinfo import ZoneInfo
from pathlib import Path
import json,re,time
import requests
from bs4 import BeautifulSoup

ADEN='https://customer3.videcom.com/FlyAden/VARS/Public/CustomerPanels/FlightScheduleReportParams.aspx'
YEMENIA='https://yemenia.com/ar/flights-schedule'
HEADERS={'User-Agent':'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/125.0 Safari/537.36','Accept-Language':'ar,en;q=0.8'}
NOW=datetime.now(ZoneInfo('Asia/Aden')); TODAY=NOW.date(); DAYS=21
ROUTES=[('ADE',c) for c in ('JED','CAI','DMM','AMM')]+[(c,'ADE') for c in ('JED','CAI','DMM','AMM')]

def aden_schedules():
    ses=requests.Session();res=ses.get(ADEN,headers=HEADERS,timeout=25);res.raise_for_status()
    page=BeautifulSoup(res.text,'html.parser');form=page.find('form')
    if not form:raise ValueError('Public schedule form missing')
    from urllib.parse import urljoin
    dest=urljoin(ADEN,form.get('action') or '')
    select={x.get('name'):set(o.get('value','') for o in x.find_all('option')) for x in page.find_all('select')}
    data=[];checked=0;errors=[]
    for src,dst in ROUTES:
        if src not in select.get('ddlDepartCity',set()) or dst not in select.get('ddlArriveCity',set()):continue
        fields={i.get('name'):i.get('value','') for i in form.find_all('input',type='hidden') if i.get('name')}
        fields.update({'ddlDepartCity':src,'ddlArriveCity':dst,'dtpFromDate':TODAY.strftime('%d/%m/%Y'),
                       'dtpToDate':(TODAY+timedelta(days=DAYS)).strftime('%d/%m/%Y'),'btnRunReport':'Flight Schedule'})
        try:
            r=ses.post(dest,data=fields,headers=HEADERS,timeout=25);r.raise_for_status()
            doc=BeautifulSoup(r.text,'html.parser')
            if not doc.select_one('#Content_divReportContainer'):raise ValueError('Report container missing')
            checked+=1
            for row in doc.select('.row.reportrow'):
                values=[x.get_text(' ',strip=True) for x in row.find_all('div',recursive=False)]
                if len(values)<7:continue
                flight,dep,arr,freq,stops,start,end=values[:7]
                if not re.fullmatch(r'[A-Z]{2,4}\d{2,5}',flight):continue
                if not re.fullmatch(r'(?:[01]\d|2[0-3]):[0-5]\d',dep) or not re.fullmatch(r'(?:[01]\d|2[0-3]):[0-5]\d',arr):continue
                begins=datetime.strptime(start,'%d/%m/%Y').date()
                ends=datetime.strptime(end,'%d/%m/%Y').date()
                weekdays=set(re.findall(r'Mon|Tue|Wed|Thu|Fri|Sat|Sun',freq,re.I))
                weekdays={d.title() for d in weekdays}
                for offset in range(DAYS+1):
                    day=TODAY+timedelta(days=offset)
                    if not (begins<=day<=ends) or day.strftime('%a') not in weekdays:continue
                    data.append({'carrier':'aden','from':src,'to':dst,'date':day.isoformat(),'flightNo':flight,'departure':dep,'arrival':arr,
                                 'stops':int(stops) if stops.isdigit() else None,'arrivalNextDay':arr<dep,
                                 'sourceLabel':'طيران عدن — الجدول الرسمي المنشور','sourceUrl':'https://fly-aden.com/'})
        except Exception as e:errors.append(src+'-'+dst+': '+type(e).__name__+' '+str(e)[:80])
        time.sleep(.2)
    return data,{'state':'ok' if checked else 'unavailable','routesChecked':checked,'errors':errors}

def yemenia_schedules():
    ses=requests.Session();r=ses.get(YEMENIA,headers=HEADERS,timeout=25);r.raise_for_status()
    page=BeautifulSoup(r.text,'html.parser')
    opts={o.get_text(' ',strip=True):o.get('value') for o in page.select('select[name=from] option') if o.get('value')}
    routes=[('عدن','جدة'),('عدن','القاهرة')];count=0;empty=0;unknown=0;errors=[]
    for src,dst in routes:
        if not opts.get(src) or not opts.get(dst):continue
        for offset in (0,3,7):
            day=TODAY+timedelta(days=offset)
            try:
                x=ses.get(YEMENIA,params={'from':opts[src],'to':opts[dst],'date':day.isoformat()},headers=HEADERS,timeout=25)
                x.raise_for_status();count+=1
                body=BeautifulSoup(x.text,'html.parser').get_text(' ',strip=True)
                if 'لا توجد رحلات' in body or 'No Flights' in body:empty+=1
                else:unknown+=1
            except Exception as e:errors.append(type(e).__name__+': '+str(e)[:80])
            time.sleep(.15)
    return [],{'state':'no_public_results' if count and count==empty else ('unparsed_results' if unknown else 'unavailable'),
               'queriesChecked':count,'emptyQueries':empty,'unparsedQueries':unknown,'errors':errors}

def main():
    try:a,a_state=aden_schedules()
    except Exception as e:a=[];a_state={'state':'unavailable','error':str(e)[:150]}
    try:y,y_state=yemenia_schedules()
    except Exception as e:y=[];y_state={'state':'unavailable','error':str(e)[:150]}
    if a_state['state']=='unavailable' and y_state['state']=='unavailable':raise RuntimeError('All schedule sources unavailable; previous feed preserved')
    records=sorted(a+y,key=lambda x:(x['date'],x['departure'],x['carrier'],x['flightNo']))
    obj={'updatedOn':TODAY.isoformat(),'retrievedAt':NOW.isoformat(timespec='seconds'),
         'validUntil':(NOW+timedelta(hours=18)).isoformat(timespec='seconds'),
         'sourceStatus':{'aden':a_state,'yemenia':y_state},
         'schedules':records,'notices':[],'generalNotices':[],
         'disclaimer':'هذه مواعيد منشورة فقط؛ لا تثبت تشغيل الرحلة أو توفر المقاعد أو السعر'}
    Path(__file__).with_name('schedules.json').write_text(json.dumps(obj,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print('PUBLIC_TIMETABLE_SYNC',json.dumps({'date':TODAY.isoformat(),'scheduleCount':len(records),'aden':a_state,'yemenia':y_state},ensure_ascii=False))

if __name__=='__main__':main()
