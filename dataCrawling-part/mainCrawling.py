# 글로우픽 crwaling 
from collections import OrderedDict
import requests
from bs4 import BeautifulSoup

def getEachCosmeticInfo(urlAddr, idNum):
    
    req = requests.get(urlAddr + idNum)
    html = req.text
    soup = BeautifulSoup(html, 'html.parser')
    # 화장품 이름
    cos_name = soup.find('span', attrs={'class': 'product-main-info__product_name__text'})
    if not(cos_name):
        return 0
    cos_name = cos_name.text.strip()
    if (cos_name == '제품등록요청'):
        return 0
    # 화장품 용량
    cos_volume = soup.find('div', attrs={'class': 'product-main-info__volume_price'})
    cos_volume = cos_volume.text.strip()
    cos_volume = cos_volume.split('/')[0]

    # 화장품 가격
    cos_price = soup.find('span', attrs={'class': 'product-main-info__volume_price--bold'})
    cos_price = cos_price.text.strip()

    # 화장품 브랜드
    cos_brand = soup.find('span', attrs={'class': 'brand_info__brand-name'})
    cos_brand = cos_brand.text.strip()

    # 화장품 카테고리
    cos_categories = soup.findAll('span', attrs={'class': 'product-detail__category'})
    resCosCategories = []
    for cos_category in cos_categories:
        resCosCategories.append( cos_category.text.strip() )

    #화장품 판매처 -> 표시되어 있지 않은 데이터 존재!
    cos_shops = soup.findAll('span', attrs={'class': 'product-detail__sellers'})
    # cos_shops_str = ""
    # for cos_shop in cos_shops:
    #     cos_shops_str += cos_shop.text.strip() + ","
    # cos_shops = cos_shops_str[:-1]
    resCosShops = []
    for cos_shop in cos_shops:
        resCosShops.append( cos_shop.text.strip() )
    # print(resCosShops)

    #화장품 상세설명
    cos_detail_descrpt = soup.find('div', attrs={'class': 'product-detail__description'})

    resCosDetail = cos_detail_descrpt.contents[0]
    if ( isinstance(resCosDetail, str) ):
        pass
    else:
        resCosDetail = cos_detail_descrpt.contents[1]
    # cos_detail_descrpt = cos_detail_descrpt.text
   
    cos_data = OrderedDict()
    cos_data['id'] = idNum
    cos_data['name'] = cos_name
    cos_data['category'] = resCosCategories
    if (len(resCosShops) ):
        cos_data['shop'] = resCosShops
    cos_data['brand'] = cos_brand
    cos_data['price'] = cos_price
    cos_data['volume'] = cos_volume
    cos_data['detail_descrpt'] = resCosDetail
    #제품등록 요청 or 없는 제품일경우 0 리턴
    return cos_data