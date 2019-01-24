import mainCrawling
import json


if ( __name__ == "__main__"):
    pass

basicUrl = 'https://www.glowpick.com/product/' 

for m in range(0, 40):
    startNum = 1 + m*1000
    endNum = 1000 + m*1000

    jsonFileName = "cosmeticInfo_" + str(startNum) + "_" + str(endNum) + ".json"

    with open(jsonFileName, 'a', encoding="utf-8") as make_file:
        totalList = []
        idx = 0

        for productId in range(startNum, endNum+1):

            toString = str(productId)
            eachCosmetic = mainCrawling.getEachCosmeticInfo(basicUrl, toString)

            if ( isinstance(eachCosmetic, dict) ):
                totalList.append( eachCosmetic )
                idx += 1
            else:
                continue
            
            if( productId % 50 == 0):
                print("Crawled Number of Cosmetics: " +  str(productId))
                print("Saved Number of Cosmetics: " +  str(idx))
        json.dump(totalList, make_file, ensure_ascii=False, indent="\t")

    


            