# pymongo 이용한 Mlab 연동 및 insert (중복체크 기능 포함)
import pymongo
from pymongo import MongoClient
import json
from collections import OrderedDict

# =================================================================
# How to install "pymongo" from source
# $ git clone git://github.com/mongodb/mongo-python-driver.git pymongo
# $ cd pymongo/
# $ python setup.py install
# Reference: http://api.mongodb.com/python/current/installation.html

# Here's an example pymongo( MongoDB - Python method )
# Examples: https://github.com/mongolab/mongodb-driver-examples/blob/master/python/pymongo_simple_example.py

# =================================================================

# MongoDB(Mlab) connection -- Part

uri = 'mongodb://user:user123@ds115350.mlab.com:15350/heeburndeuk'

conn = MongoClient(uri)

db = conn.get_default_database()

users = db['users']

# cursor = users.find()

# for doc in cursor:
#     print(doc)

# =================================================================

cosmetics = db['cosmetics']


# startNum = 1
# endNum = 1000

fileName = 'file_name' 

with open(fileName, 'r', encoding='UTF8') as Jsonfile:
    contents = json.load(Jsonfile)
    num = 0

    for cosmetic in contents:
        cosmeticId = cosmetic['id']
        checkId = cosmetics.find_one( { "id" : str(cosmeticId) } )

        if( checkId ):
            print("already exists")
            continue
        else:
            refinedCos = OrderedDict(cosmetic)
            cosmetics.insert(refinedCos)
            num += 1
        if(num % 100 == 0):
            print("status: " + str(num) )
    # for cosmetic in contents:
    #     refinedCos = OrderedDict(cosmetic)
    #     cosmetics.insert(refinedCos)

# res = cosmetics.find()

# for obj in res:
#     print(obj)
    

