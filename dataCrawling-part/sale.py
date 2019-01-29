from saleCrawling import mkCategoryList, getEachSalePage, getPageInfor
import json


if ( __name__ == "__main__"):
    startC=input("크롤링 시작 페이지 : ")
    endC=input("크롤링 마지막 페이지 : ")
    categoryList=mkCategoryList('./oliveCate.xlsx','category') # 경로 : C:\main\WebProject\webproject
    # print(categoryList)
    jsonFileName = "saleInfo_" + str(startC) + "_" + str(endC) + ".json"
    with open(jsonFileName, 'a', encoding="utf-8") as make_file:
        totalList = []
        idx = 0

        #
        urlAddr='http://www.oliveyoung.co.kr/store/main/getSaleList.do?dispCatNo=900000100090001&fltDispCatNo=&prdSort=01&pageIdx=%s&rowsPerPage=48&searchTypeSort=btn_thumb'
        pageNum=[]
        for n in range(int(startC),int(endC)+1):
            pageNum+=(getEachSalePage(urlAddr,n))
        print(pageNum)

        sebooURL="http://www.oliveyoung.co.kr/store/goods/getGoodsDetail.do?goodsNo="
        for page in pageNum:
            pageInfor=getPageInfor(sebooURL,page,categoryList)

            if ( isinstance(pageInfor, dict) ):
                totalList.append( pageInfor )
                idx += 1
            else:
                continue
            if (idx%10 == 0):
                print(idx)

        json.dump(totalList, make_file, ensure_ascii=False, indent="\t")
