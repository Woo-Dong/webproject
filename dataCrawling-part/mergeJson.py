# 1000개 단위 json 파일 병합
import json

with open('__File_name__.json', 'a', encoding="utf-8") as totalCos:
    mergedList = []
    for num in range(0, 60):
        startNum = 1 + num*1000
        endNum = 1000 + num*1000
        fileName = './data/cosmeticInfo_' + str(startNum) + '_' + str(endNum) + '.json'
        print("Status: " + str(startNum) + " ~ " + str(endNum) )
        with open(fileName, 'r', encoding='UTF8') as Jsonfile:
            contents = json.load(Jsonfile)
            for content in contents:
                mergedList.append( content )
    json.dump(mergedList, totalCos, ensure_ascii=False, indent="\t")

