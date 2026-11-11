"""Build a compact public-domain airport directory for Abu Al-Faisal's booking site.
Source: https://ourairports.com/data/ (OurAirports airports.csv, public domain).
"""
import csv,io,json,requests,datetime,re
from pathlib import Path

SOURCE='https://davidmegginson.github.io/ourairports-data/airports.csv'
ALIASES = {
'ADE':['عدن','مطار عدن'],'CAI':['القاهرة','القاهره','مطار القاهرة'],'JED':['جدة','جده','مطار الملك عبدالعزيز'],'DMM':['الدمام','مطار الملك فهد'],'AMM':['عمان','عمّان','الملكة علياء'],'RUH':['الرياض','مطار الملك خالد'],'GXF':['سيئون','سيئون'],'RIY':['المكلا','الريان'],'SCT':['سقطرى','سقطري'],'SAH':['صنعاء','صنعا'],
'ADD':['أديس أبابا','اديس','أثيوبيا','اثيوبيا'],'DXB':['دبي'],'DWC':['دبي','آل مكتوم','ال مكتوم'],'AUH':['أبوظبي','ابوظبي'],'SHJ':['الشارقة','الشارقه'],'DOH':['الدوحة','الدوحه'],'MCT':['مسقط'],'SLL':['صلالة','صلاله'],
'CMN':['الدار البيضاء','كازابلانكا','محمد الخامس'],'RBA':['الرباط'],'RAK':['مراكش'],'TNG':['طنجة'],'FEZ':['فاس'],'KWI':['الكويت'],'BAH':['البحرين','المنامة'],'IST':['اسطنبول','إسطنبول','مطار اسطنبول'],'SAW':['اسطنبول','إسطنبول','صبيحة','صبيحه'],'BGW':['بغداد'],'BSR':['البصرة'],'EBL':['أربيل','اربيل'],'NJF':['النجف'],'BEY':['بيروت'],'DAM':['دمشق'],'ALP':['حلب'],'JIB':['جيبوتي'],'NBO':['نيروبي'],'MBA':['مومباسا'],
'BOM':['مومباي','بومباي'],'DEL':['نيودلهي','دلهي','دلهى'],'BLR':['بنغالور'],'HYD':['حيدر اباد','حيدر آباد'],'MAA':['تشيناي','مدراس'],'COK':['كوتشي'],'CCU':['كلكتا'],'KHI':['كراتشي'],'LHE':['لاهور'],'ISB':['اسلام اباد','إسلام آباد'],'DAC':['دكا'],'CMB':['كولومبو'],
'JFK':['نيويورك','جون اف كينيدي','جون إف كينيدي','كينيدي','مطار كينيدي','New York City','NYC'],
'EWR':['نيويورك','نيوارك','نيورك','New York City','NYC'],
'LGA':['نيويورك','لاغوارديا','لاجوارديا','New York City','NYC'],
'SWF':['نيويورك','ستيوارت','New York','NYC'],
'LAX':['لوس انجلوس','لوس أنجلوس','لوس انجلس','Los Angeles'],
'SFO':['سان فرانسيسكو','سانفرانسيسكو'],'SJC':['سان خوسيه','سان هوزيه'],'OAK':['أوكلاند','اوكلاند','سان فرانسيسكو'],
'ORD':['شيكاغو','شيكاجو','أوهير'],'MDW':['شيكاغو','ميدواي'],
'IAD':['واشنطن','دالاس','Washington DC'],'DCA':['واشنطن','رونالد ريغان','Washington DC'],'BWI':['بالتيمور','واشنطن','Washington DC'],
'MIA':['ميامي'],'FLL':['فورت لودرديل','ميامي'],'MCO':['اورلاندو','أورلاندو'],'ATL':['أتلانتا','اتلانتا'],
'DFW':['دالاس'],'DAL':['دالاس'],'IAH':['هيوستن'],'HOU':['هيوستن'],'BOS':['بوسطن'],'SEA':['سياتل'],'DEN':['دنفر'],'PHX':['فينيكس'],'LAS':['لاس فيغاس','لاس فيجاس'],'SAN':['سان دييغو'],'DTW':['ديترويت'],
'YYZ':['تورنتو'],'YTZ':['تورنتو'],'YVR':['فانكوفر'],'YUL':['مونتريال'],'YYC':['كالغاري'],
'LHR':['لندن','هيثرو','مطار هيثرو'],'LGW':['لندن','غاتويك','جاتويك'],'STN':['لندن','ستانستد'],'LTN':['لندن','لوتون'],'LCY':['لندن','سيتي'],'SEN':['لندن','ساوثند'],
'CDG':['باريس','شارل ديغول','شارل ديجول'],'ORY':['باريس','أورلي','اورلي'],'BVA':['باريس','بوفيه'],'AMS':['أمستردام','امستردام'],'FRA':['فرانكفورت'],'MUC':['ميونخ'],'BER':['برلين'],'DUS':['دوسلدورف'],'HAM':['هامبورغ'],
'FCO':['روما','فيوميتشينو'],'CIA':['روما','شيامبينو'],'MXP':['ميلانو','مالبينسا'],'LIN':['ميلانو','ليناتي'],'VCE':['البندقية','فينيسيا'],'MAD':['مدريد'],'BCN':['برشلونة'],'AGP':['ملقا'],'LIS':['لشبونة'],'ZRH':['زيورخ'],'GVA':['جنيف'],'VIE':['فيينا'],'BRU':['بروكسل'],'ATH':['اثينا','أثينا'],
'SVO':['موسكو','شيريميتيفو'],'DME':['موسكو','دوموديدوفو'],'VKO':['موسكو','فنوكوفو'],'LED':['سانت بطرسبرغ'],
'PEK':['بكين'],'PKX':['بكين','داشينغ'],'PVG':['شنغهاي','شانغهاي'],'SHA':['شنغهاي','شانغهاي'],'CAN':['غوانزو','جوانزو'],'SZX':['شينزن','شنزن'],'HKG':['هونغ كونغ','هونج كونج'],'TPE':['تايبيه'],'NRT':['طوكيو','ناريتا'],'HND':['طوكيو','هانيدا'],'KIX':['اوساكا','أوساكا'],'ICN':['سيول','إنشيون','انشيون'],'GMP':['سيول','كيمبو'],
'SIN':['سنغافورة'],'KUL':['كوالالمبور'],'BKK':['بانكوك','بانكوك الدولي'],'DMK':['بانكوك','دون موانغ'],'HKT':['بوكيت'],'DPS':['بالي','دينباسار'],'CGK':['جاكرتا'],'MNL':['مانيلا'],'HAN':['هانوي'],'SGN':['هو تشي منه','سايغون'],
'JNB':['جوهانسبرغ','جوهانسبرج'],'CPT':['كيب تاون','كايب تاون'],'DAR':['دار السلام'],'ZNZ':['زنجبار'],'KGL':['كيغالي'],'EBB':['عنتيبي','كمبالا'],'LOS':['لاغوس'],'ACC':['أكرا','اكرا'],'ABV':['ابوجا','أبوجا'],'ALG':['الجزائر'],'TUN':['تونس'],'TIP':['طرابلس'],'BEN':['بنغازي'],'HBE':['الإسكندرية','الاسكندرية','برج العرب'],
'SYD':['سيدني'],'MEL':['ملبورن'],'BNE':['بريزبن'],'PER':['بيرث'],'AKL':['اوكلاند نيوزيلندا','أوكلاند نيوزيلندا'],
'GRU':['ساو باولو'],'GIG':['ريو دي جانيرو'],'EZE':['بوينس ايرس','بوينس آيرس'],'MEX':['مكسيكو سيتي'],'CUN':['كانكون'],
}
# Optional city-level synonyms are deliberately shared by multiple airports.
CITY_ALIASES={'New York':'نيويورك','Newark':'نيوارك','Los Angeles':'لوس أنجلوس','London':'لندن','Paris':'باريس','Istanbul':'إسطنبول',
'Casablanca':'الدار البيضاء','Cairo':'القاهرة','Aden':'عدن','Jeddah':'جدة','Riyadh':'الرياض','Dammam':'الدمام',
'Amman':'عمّان','Dubai':'دبي','Abu Dhabi':'أبوظبي','Doha':'الدوحة','Muscat':'مسقط','Sanaa':'صنعاء',
'Addis Ababa':'أديس أبابا','Mumbai':'مومباي','New Delhi':'نيودلهي','Delhi':'دلهي','Baghdad':'بغداد',
'Santiago':'سانتياغو','Chicago':'شيكاغو','Washington':'واشنطن','San Francisco':'سان فرانسيسكو',
'Toronto':'تورنتو','Tokyo':'طوكيو','Frankfurt':'فرانكفورت','Munich':'ميونخ','Rome':'روما',
'Berlin':'برلين','Amsterdam':'أمستردام','Nairobi':'نيروبي','Bangkok':'بانكوك','Kuala Lumpur':'كوالالمبور',
'Singapore':'سنغافورة','Hong Kong':'هونغ كونغ','Delhi':'دلهي','Irbil':'أربيل','Erbil':'أربيل',
'Taiz':'تعز','Seiyun':'سيئون','Mukalla':'المكلا','Socotra':'سقطرى','Djibouti':'جيبوتي','Madinah':'المدينة المنورة',
'Medina':'المدينة المنورة','Mecca':'مكة'}
PREFERRED=('ADE','CAI','JED','DMM','AMM','RUH','GXF','ADD','DXB','AUH','DOH','MCT','CMN','JFK','EWR','LGA','LAX','LHR','CDG','IST','NBO','BOM')
r=requests.get(SOURCE,timeout=100);r.raise_for_status()
rows=csv.DictReader(io.StringIO(r.content.decode('utf-8-sig')))
seen={};raw=0
for row in rows:
    raw+=1
    iata=row.get('iata_code','').strip().upper()
    if not re.fullmatch(r'[A-Z]{3}',iata):continue
    kind=row.get('type')
    if kind not in ('large_airport','medium_airport','small_airport'):continue
    if kind=='small_airport' and row.get('scheduled_service')!='yes' and iata not in PREFERRED:continue
    city=(row.get('municipality') or '').strip()
    name=(row.get('name') or '').strip()
    country=(row.get('iso_country') or '').strip()
    if not city and not name:continue
    alias=list(dict.fromkeys(ALIASES.get(iata,[])+([CITY_ALIASES[city]] if city in CITY_ALIASES else [])))
    # [IATA, city, airport, country, Arabic search aliases, popularity/scheduled]
    item=[iata,city,name,country,'|'.join(alias),2 if iata in PREFERRED else 1 if kind=='large_airport' else 0]
    previous=seen.get(iata)
    if previous is None or item[5]>previous[5] or (item[5]==previous[5] and len(name)>len(previous[2])):seen[iata]=item
data=sorted(seen.values(),key=lambda x:(-x[5],x[0]))
for x in PREFERRED:
    assert x in seen, f'Missing essential airport {x}'
out={'version':1,'source':'OurAirports public-domain airports.csv','sourceUrl':'https://ourairports.com/data/','updatedOn':datetime.datetime.now(datetime.timezone.utc).date().isoformat(),'count':len(data),'airports':data}
path=Path(__file__).parent/'airports-world.json'
path.write_text(json.dumps(out,ensure_ascii=False,separators=(',',':'))+'\n',encoding='utf-8')
print('AIRPORT_DATABASE_GENERATED',len(data),'entries',path.stat().st_size,'bytes', 'sample JFK',seen.get('JFK'), 'sample EWR',seen.get('EWR'))
