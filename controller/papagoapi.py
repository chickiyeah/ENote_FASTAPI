import json
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import os

try:
    import requests
except ModuleNotFoundError:
    os.system('pip install requests')
    import requests


papagoapi = APIRouter(prefix="/api/papago",tags=["Papago"])

textnotfound = {'code':'ER001','message':'TEXT NOT FOUND'}
nosupportlang = {'code':'ER002','message':'This Lang Not Support'}

tokorcode = ['en', 'ja', 'zh-CN', 'zh-TW', 'vi', 'id', 'th', 'de', 'ru', 'es', 'it', 'fr']

papagoheaders = {
    'Content-Type' : 'application/x-www-form-urlencoded; charset=UTF-8',
    'X-Naver-Client-Id' : 'I0972vDNYoyXDckZwOpE',
    'X-Naver-Client-Secret' : '0O16VUG8OX'
}

"응답 구역"
class DetectLangValue(BaseModel):
    text: str

class DetectLangRes(BaseModel):
    langCode: str

class TranslateValue(BaseModel):
    text: str

class TranslateRes(BaseModel):
    text: str


responses = {
    400: {
        "description": "Bad Request",
        "content": {
            "application/json": {
                "examples": {
                    "Text Not Found": {
                        "summary": "텍스트가 입력되지 않았습니다.",
                        "value": textnotfound
                    },
                    "No Support Lang": {
                        "summary": "지원하지 않는 언어입니다.",
                        "value": nosupportlang
                    }
                }
            }
        }
    }
}


@papagoapi.post('/detectlang', response_model=DetectLangRes, responses=responses)
async def detectlang(text: DetectLangValue):
    text = text.text
    if text == "":
        raise HTTPException(status_code=400, detail=textnotfound)
    else:
        res = requests.post(
            url="https://openapi.naver.com/v1/papago/detectLangs",
            headers=papagoheaders,
            data={'query':text}
        )

        ares = json.loads(res.text)

        if ares['langCode'] == "ko" or ares['langCode'] == "en" or ares['langCode'] == "fr":
            return ares
        else:
            return nosupportlang

@papagoapi.post('/translate', responses=responses)
async def translate(text: TranslateValue):
    text = text.text
    if text == "":
        raise HTTPException(status_code=400, detail=textnotfound)
    else:
        res = requests.post(
            url="http://localhost:82/api/papago/detectlang",
            data={'text':text}
        )

        originlangcode = json.loads(res.text)
        
        try:
            if originlangcode['code'] == "ER001":
                raise HTTPException(status_code=400, detail=textnotfound)

            if originlangcode['code'] == "ER002":
                raise HTTPException(status_code=400, detail=nosupportlang)
        except:
            if originlangcode['langCode'] == "ko":
                originlang = {'source':'ko','target':'en','text':text}

                translang = requests.post(
                    url="https://openapi.naver.com/v1/papago/n2mt",
                    headers=papagoheaders,
                    data=originlang
                )

                return json.loads({"text":json.loads(translang.text)['message']['result']['translatedText']})

            if originlangcode['langCode'] == "en" or originlangcode['langCode'] == "fr":
                originlang = {'source':'en','target':'ko','text':text}

                translang = requests.post(
                    url="https://openapi.naver.com/v1/papago/n2mt",
                    headers=papagoheaders,
                    data=originlang
                )

                return json.loads({"text":json.loads(translang.text)['message']['result']['translatedText']})
