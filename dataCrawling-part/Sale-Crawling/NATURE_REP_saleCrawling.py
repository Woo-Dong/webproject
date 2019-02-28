# NATURE REPUBLIC crwaling 
from collections import OrderedDict
import requests
from bs4 import BeautifulSoup

from datetime import date
import urllib.request
import os
import urllib
import base64
import boto3
from PIL import Image
from io import BytesIO
import re
import json

import pymongo
from pymongo import MongoClient


NATURE_REP_LINK = 'https://www.naturerepublic.com'

# 세부 페이지 링크 가저오기
def getEachSalePage(urlAddr):
    req = requests.get(urlAddr)
    html = req.text
    soup = BeautifulSoup(html, 'html.parser')

    resSaleLists = []
    eventList_li = soup.findAll('li')

    for eachList in eventList_li:
        try:
            each_li = eachList.find('a')
            each_imgTmp = each_li.find('img').get('alt')
            if each_imgTmp == 'event_tmp':
                link = eachList.find('a')['href']
                title = eachList.find('dt')
                title = title.text.strip()
                date = eachList.find('dd')
                date = date.text.strip()
                start = date.split('~')[0]
                end = date.split('~')[1]
                
                img = eachList.find('img').get('src')
                img = NATURE_REP_LINK + img

                imgTitle = re.sub('[\<>|!,-=.#/?:$}]', '', title ) + '.gif'
                imgTitle = re.sub(' ', '', imgTitle)                
                urllib.request.urlretrieve(img, "./img/" + imgTitle)

                img = Image.open('./img/' + imgTitle)
                buffer = BytesIO()
                img.save(buffer, format='GIF')
                imgBase64 = base64.b64encode(buffer.getvalue())

                s3 = boto3.resource('s3')
                s3.Bucket('heeburndeuk3'). \
                    put_object(Key=imgTitle,
                            Body=base64.b64decode(imgBase64),
                            ContentType='image/gif',
                            ACL='public-read')
                
                saleData = dict()
                saleData['title'] = title
                saleData['link'] = NATURE_REP_LINK + str(link)
                saleData['start'] = start
                saleData['end'] = end
                saleData['img'] = 'https://s3.ap-northeast-2.amazonaws.com/heeburndeuk3/' + imgTitle
                
                
                resSaleLists.append(saleData)
        except:
            continue
    return resSaleLists

# 세부 페이지 크롤링
def getdetailSale(resSaleLists):

    resEachSaleLists = []
    for eachSaleList in resSaleLists:
        req = requests.get(eachSaleList['link'])
        html = req.text
        soup = BeautifulSoup(html, 'html.parser')
        pdcard = soup.findAll('li')
        

        for eachPdcard in pdcard:
            price = eachPdcard.find('dd', {'class': 'price'})
            if price:
                price = price.text.strip()
                prcSplit = price.split("￦")
                price_original = price.split("￦")[1]
                if(len(prcSplit) > 2):      #세일하는 품목만 선정
                    price_sale = price.split("￦")[2]
                    price_original = re.sub(',', '', price_original)  
                    price_sale = re.sub(',', '', price_sale) 
                    salePer = int( ( int(price_original)-int(price_sale) ) / int(price_original) * 100 )
                    salePer = str(salePer) + '%'
                    title = eachPdcard.find('dt')
                    title = title.text
                    link = eachPdcard.find('a')['href']
                    link = NATURE_REP_LINK + link

                    img = eachPdcard.find('img').get('src')

                    imgTitle = re.sub('[\<>|!,-=.#/?:$}]', '', title ) + '.gif'
                    imgTitle = re.sub(' ', '', imgTitle)                
                    urllib.request.urlretrieve(img, "./img/" + imgTitle)

                    img = Image.open('./img/' + imgTitle)

                    buffer = BytesIO()
                    img.save(buffer, format='GIF')
                    imgBase64 = base64.b64encode(buffer.getvalue())

                    s3 = boto3.resource('s3')
                    s3.Bucket('heeburndeuk3'). \
                        put_object(Key=imgTitle,
                                Body=base64.b64decode(imgBase64),
                                ContentType='image/gif',
                                ACL='public-read')
                    
                    saleData = OrderedDict()
                    saleData['name'] = title
                    saleData['brand'] = '네이처리퍼블릭'
                    saleData['shop'] = '네이처리퍼블릭'
                    saleData['link'] = link
                    saleData['start'] = eachSaleList['start']
                    saleData['end'] = eachSaleList['end']
                    saleData['img'] = 'https://s3.ap-northeast-2.amazonaws.com/heeburndeuk3/' + imgTitle
                    saleData['saleTitle'] = eachSaleList['title']
                    saleData['price'] = price_original
                    saleData['salePrice'] = price_sale
                    saleData['salePer'] = salePer
                    saleData['eventLink'] = eachSaleList['link']
                    resEachSaleLists.append(saleData)
                else:
                    continue

    return resEachSaleLists

#크롤링한 결과 
def makeJsonFile(dictionList):
    jsonFileName = 'NATURE_REP_SALE.json'
    with open(jsonFileName, 'a', encoding="utf-8") as make_file:
        if ( isinstance(dictionList, list) ):
            json.dump(dictionList, make_file, ensure_ascii=False, indent="\t")
            return jsonFileName

#mongoDB 내용 삽입
def insertMongoDB(jsonFile):

    uri = 'mongodb://user:user123@ds115350.mlab.com:15350/heeburndeuk'
    conn = MongoClient(uri)
    db = conn.get_default_database()

    jsonFile = 'NATURE_REP_SALE.json' 
    sales = db['sales']
    with open(jsonFile, 'r', encoding='UTF8') as Jsonfile:
        contents = json.load(Jsonfile)

        for sale in contents:
            saleName = sale['name']
            checkName = sales.find_one( { "name" : str(saleName) } )

            if( checkName ):
                print("already exists: ", saleName)
                continue
            else:
                refinedCos = OrderedDict(sale)
                sales.insert(refinedCos)

if ( __name__ == "__main__"):

    urlAddr='https://www.naturerepublic.com/event/event_list.php'
    resSaleLists = getEachSalePage(urlAddr)
    resGetDetailSaleLists = getdetailSale(resSaleLists)
    resJsonFile = makeJsonFile(resGetDetailSaleLists)
    insertMongoDB(resJsonFile)