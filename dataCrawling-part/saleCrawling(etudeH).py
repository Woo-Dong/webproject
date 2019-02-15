# 올리브영 crwaling 
from collections import OrderedDict
import requests
from bs4 import BeautifulSoup
import openpyxl
import urllib.request

# 카테고리
def mkCategoryList(xlsxFile,sheetName):
    mongooseS = openpyxl.load_workbook(xlsxFile)
    category = mongooseS.get_sheet_by_name(sheetName)
    categoryList=[]
    for i in category.rows:
        for i2 in i:
            if i2.value:
                categoryList.append(i2.value)
    return set(categoryList)

# 세부 페이지 크롤링
def getPageInfor_EH(URL,page,rowDataList,categoryList=None):
    req = requests.get(URL+str(page))
    html = req.text
    soup = BeautifulSoup(html, 'html.parser')

    rowData=OrderedDict()
    
    eventClasses = soup.find_all('li', attrs={'class': 'item'})
    print(eventClasses)
    for eventClass in eventClasses:
        rowData['name'] = eventClass.find('div', attrs={'class' : 'item-name'}).text.strip()
        rowData['price'] = eventClass.find('div', attrs={'class' : 'item-original-price'}).text.strip()
        rowData['salePrice'] = eventClass.find('div', attrs={'class' : 'item-current-price'}).text.strip()
        rowData['brand'] = "에뛰드하우스"

        rowDataList.append(rowData)

    return rowDataList
        
def saveSaleData(rowData):

    saleData=OrderedDict()
    saleData['name'] = rowData['name']
    saleData['brand'] = rowData['brand']
    saleData['Price'] = rowData['Price']
    saleData['salePrice'] = rowData['salePrice']
    saleData['onOff'] = 'online'

    if rowData['start']:
        saleData['start'] = rowData['start']
    if rowData['end']:
        saleData['end'] = rowData['end']

    return saleData        
 

if ( __name__ == "__main__"):
    # categoryList = mkCategoryList('oliveCate.xlsx','category')
    URL="https://appsurprise.co.kr/%EB%B8%8C%EB%9E%9C%EB%93%9C/%EC%97%90%EB%9B%B0%EB%93%9C%ED%95%98%EC%9A%B0%EC%8A%A4/%EC%83%81%ED%92%88?page="
    pageStart=input("수집 시작 페이지")
    pageEnd=input("수집 마지막 페이지")
    rowDataList=[]
    for page in range(int(pageStart),int(pageEnd)+1):
        rowDataList=getPageInfor_EH(URL,page,rowDataList)
    print(rowDataList)
    


