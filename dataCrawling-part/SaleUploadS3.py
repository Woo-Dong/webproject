
from collections import OrderedDict
import requests
from bs4 import BeautifulSoup
import urllib.request
import os
import urllib
import base64
import boto3
from PIL import Image
from io import BytesIO
import re

req = requests.get('https://www.aritaum.com/event/ev/event_ev_event_list.do')
html = req.text
soup = BeautifulSoup(html, 'html.parser')

# 상세 이벤트 크롤링
eventClasses = soup.findAll('div', attrs={'class': 'event-unit'})

for eventClass in eventClasses:
    
    # 이벤트 날짜
    # eventDL = eventClass.find('dl', attrs={'class': 'event-title-block'})

    eventName = eventClass.find('dd', attrs={'class': 'data'})
    eventName = eventName.text.strip()
    eventName = re.sub('[\<>|!,-=.#/?:$}]', '', eventName ) + '.jpg'
    eventName = re.sub(' ', '', eventName)
    eventPicture = eventClass.find('img').get('src')
    urllib.request.urlretrieve(eventPicture, "./img/" + eventName)

    # print('1. jpg to PIL Image')
    img = Image.open('./img/' + eventName)

    # print('2. PIL Image to base64 encoded buffer')
    buffer = BytesIO()
    img.save(buffer, format='JPEG')
    imgBase64 = base64.b64encode(buffer.getvalue())

    # print('3. upload image to s3')
    s3 = boto3.resource('s3')
    s3.Bucket('heeburndeuk3'). \
        put_object(Key=eventName,
                Body=base64.b64decode(imgBase64),
                ContentType='image/jpeg',
                ACL='public-read')
    print(eventName + ' is  finished')

    file = './img/' + eventName
    if os.path.isfile(file):
        os.remove(file)
        print(file + " is deleted")
        
    

