# 올리브영 crwaling 
from collections import OrderedDict
import requests
from bs4 import BeautifulSoup
import openpyxl
from datetime import date

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

# 세부 페이지 넘버 가저오기
def getEachSalePage(urlAddr,idNum):
    # urlAddr+idNum : 크롤링 할 웹사이트
    req = requests.get(urlAddr%idNum)
    html = req.text
    soup = BeautifulSoup(html, 'html.parser')
    saleInfors=soup.select('li > div > a')
    pageList=[]
    for Infor in saleInfors:

        pageNum=Infor.get('data-ref-goodsno')
        pageList.append(pageNum)

    return pageList

# 세부 페이지 크롤링
def getPageInfor(sebooURL,page,categoryList=None):
    req = requests.get(sebooURL+str(page))
    html = req.text
    soup = BeautifulSoup(html, 'html.parser')

    saleCategory = soup.find_all('a',{'class' : 'cate_y'})
    saleCategoryList=[x.text.strip() for x in saleCategory]
    print(saleCategoryList)
    for cate in saleCategoryList:
        cate=cate.split('/')
        for c in cate:
            if not(c in categoryList):
                print("수집 제외 카테고리 품목")
                return 0
    cosCategory=saleCategoryList[-1]


    saleName = soup.find('p',{'class' : 'prd_name'}).text.strip()
    print("이름:",saleName)

    saleBrand = soup.find('p',{'class' : 'prd_brand'}).text.strip()
    saleBrand=saleBrand.split()[0]
    print("브랜드:",saleBrand)

    price = soup.find_all('span',{'class' : 'tx_num'})

    if price:
        salePrice=price[1].text.strip()
        price=price[0].text.strip()
        salePrice=int(salePrice.replace(",", ""))
        price=int(price.replace(",", ""))
        salePer= (price-salePrice)*100//price
        print("판매가:",price,"세일가:",salePrice,"할인률: %s"%salePer)

    period=soup.select('div.prd_info > strong')
    if period:
        period=period[0].text.strip()
        period=period.split()
        start = period[0].strip()
        end = period[2].strip()
        print("start:",start)
        print("end:",end)   

    pictName=soup.select('div.prd_detail_box > div.left_area > div > img')[0].get('src')
    print(pictName)

    saleData=OrderedDict()
    saleData['name'] = saleName
    saleData['cosCategory'] = cosCategory
    saleData['place'] = 'OLIVEOYOUNG'
    saleData['brand'] = saleBrand
    saleData['salePer'] = salePer
    if period:
        saleData['start'] = start
        saleData['end'] = end
    saleData['pictName'] = 'pictName'
    saleData['onOff'] = 'online'

    return saleData        
 

if ( __name__ == "__main__"):
    categoryList = mkCategoryList('oliveCate.xlsx','category') #가져오는 엑셀파일의 경로를 어떻게 해야하는지 모르겠다
    # print(categoryList)
    urlAddr='http://www.oliveyoung.co.kr/store/main/getSaleList.do?dispCatNo=900000100090001&fltDispCatNo=&prdSort=01&pageIdx=%s&rowsPerPage=48&searchTypeSort=btn_thumb'
    # pageNum=getEachSalePage(urlAddr,1)

    page='A000000114090'

    sebooURL="http://www.oliveyoung.co.kr/store/goods/getGoodsDetail.do?goodsNo="
    crawlingDate=getPageInfor(sebooURL,page,categoryList)
    pass
