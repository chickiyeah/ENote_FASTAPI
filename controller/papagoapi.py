import json
from fastapi import APIRouter, HTTPException, Depends, Header, Request
from fastapi.security import OAuth2
from pydantic import BaseModel
import os
from firebase_admin import auth

try:
    import requests
except ModuleNotFoundError:
    os.system('pip install requests')
    import requests


papagoapi = APIRouter(prefix="/api/papago",tags=["Papago"])


textnotfound = {'code':'ER001','message':'TEXT NOT FOUND'}
nosupportlang = {'code':'ER002','message':'THIS LANGUAGE IS NOT SUPPORTED'}
unauthorized = {'code':'ER013','message':'unauthorized'}
unauthorized_revoked = {'code':'ER014','message':'UNAUTHORIZED (REVOKED TOKEN)'}
unauthorized_invaild = {'code':'ER015','message':'UNAUTHORIZED (TOKEN INVALID)'}
unauthorized_userdisabled = {'code':'ER016','message':'UNAUTHORIZED (TOKENS FROM DISABLED USERS)'}

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


detect_responses = {
    200: {
        "description": "Detected language",
        "content": {
            "application/json": {
                "examples": {
                    "Added Successfully": {
                        "summary": "Detect Successfully",
                        "value": {                                                        
                            "langCode": "감지된 언어의 코드 (en, fr, ko)"
                        }
                    }
                }
            }
        }
    }, 
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
    },
    401: {
        "description": "Unauthorized",
        "content": {
            "application/json": {
                "examples": {
                    "Unauthorized": {
                        "summary": "인증 헤더값(Authorization)이(가) 필요합니다.",
                        "value": {"detail":unauthorized}
                    },
                    "Revoked Token": {
                        "summary": "취소된 엑세스 토큰이 입력되었습니다.",
                        "value": {"detail":unauthorized_revoked}
                    },
                    "Invalid Token": {
                        "summary": "엑세스 토큰이 올바르지 않습니다.",
                        "value": {"detail":unauthorized_invaild}
                    },
                    "User Disabled": {
                        "summary": "비활성화된 사용자의 엑세스 토큰이 사용되었습니다.",
                        "value": {"detail":unauthorized_userdisabled}
                    }
                }
            }
        }             
    }
}

translate_responses = {
    200: {
        "description": "Translate language",
        "content": {
            "application/json": {
                "examples": {
                    "Added Successfully": {
                        "summary": "Translate Successfully",
                        "value": {                                                        
                            "text": "번역 결과"
                        }
                    }
                }
            }
        }
    }, 
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
    },
    401: {
        "description": "Unauthorized",
        "content": {
            "application/json": {
                "examples": {
                    "Unauthorized": {
                        "summary": "인증 헤더값(Authorization)이(가) 필요합니다.",
                        "value": {"detail":unauthorized}
                    },
                    "Revoked Token": {
                        "summary": "취소된 엑세스 토큰이 입력되었습니다.",
                        "value": {"detail":unauthorized_revoked}
                    },
                    "Invalid Token": {
                        "summary": "엑세스 토큰이 올바르지 않습니다.",
                        "value": {"detail":unauthorized_invaild}
                    },
                    "User Disabled": {
                        "summary": "비활성화된 사용자의 엑세스 토큰이 사용되었습니다.",
                        "value": {"detail":unauthorized_userdisabled}
                    }
                }
            }
        }             
    }
}

def verify_user_token(req: Request):

    try:
        token = req.headers["Authorization"]    
        # Verify the ID token while checking if the token is revoked by
        # passing check_revoked=True.
        auth.verify_id_token(token, check_revoked=True)
        # Token is valid and not revoked.
        return True
    except auth.RevokedIdTokenError:
        # Token revoked, inform the user to reauthenticate or signOut().
        raise HTTPException(status_code=401, detail=unauthorized_revoked)
    except auth.UserDisabledError:
        # Token belongs to a disabled user record.
        raise HTTPException(status_code=401, detail=unauthorized_userdisabled)
    except auth.InvalidIdTokenError:
        # Token is invalid
        raise HTTPException(status_code=401, detail=unauthorized_invaild)
    except KeyError:
        raise HTTPException(status_code=401, detail=unauthorized)

@papagoapi.post('/detectlang', response_model=DetectLangRes, responses=detect_responses)
async def detectlang(text: DetectLangValue):
        try:
            text = text.text
        except AttributeError:
            text = text

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
                raise HTTPException(status_code=400, detail=nosupportlang)

@papagoapi.post('/translate', responses=translate_responses)
async def translate(text: TranslateValue, authorized: bool = Depends(verify_user_token)):
    if authorized:
        text = text.text
        if text == "":
            raise HTTPException(status_code=400, detail=textnotfound)
        else:
            res = await detectlang(text)

            originlangcode = res

        if "code" not in list(originlangcode.keys()):
            originlangcode['code'] = "OK" 

        code = originlangcode['code']
        if code == "ER001":
            raise HTTPException(status_code=400, detail=textnotfound)

        if code == "ER002":
            raise HTTPException(status_code=400, detail=nosupportlang)

        if originlangcode['langCode'] == "ko":
            originlang = {'source':'ko','target':'en','text':text}

            translang = requests.post(
                url="https://openapi.naver.com/v1/papago/n2mt",
                headers=papagoheaders,
                data=originlang
            )

            return {"text":json.loads(translang.text)['message']['result']['translatedText']}

        if originlangcode['langCode'] == "en" or originlangcode['langCode'] == "fr":
            originlang = {'source':'en','target':'ko','text':text}

            translang = requests.post(
                url="https://openapi.naver.com/v1/papago/n2mt",
                headers=papagoheaders,
                data=originlang
            )
            
            return {"text":str(json.loads(translang.text)['message']['result']['translatedText'])}        
    else:
        raise HTTPException(status_code=401, detail=unauthorized)
