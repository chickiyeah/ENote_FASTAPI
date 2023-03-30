import json
from fastapi import APIRouter, HTTPException, Depends, Header, Request
from fastapi.security import OAuth2
from pydantic import BaseModel
import os
from firebase_admin import auth
import datetime

try:
    import requests
except ModuleNotFoundError:
    os.system('pip install requests')
    import requests

noteapi = APIRouter(prefix="/api/note",tags=["Note"])

unauthorized = {'code':'ER013','message':'unauthorized'}
unauthorized_revoked = {'code':'ER014','message':'unauthorized (Revoked Token)'}
unauthorized_invaild = {'code':'ER015','message':'unauthorized (Token Invalid)'}
unauthorized_userdisabled = {'code':'ER016','message':'unauthorized (Tokens from disabled users)'}
author_cannot_be_empty = {'code':'ER017','message':'author cannot be empty'}
korean_cannot_be_empty = {'code':'ER018','message':'korean cannot be empty'}
english_cannot_be_empty = {'code':'ER019','message':'english cannot be empty'}


responses = {
    200: {
        "description": "OK",
        "content": {
            "application/json": {
                "examples": {
                    "Added Successfully": {
                        "summary": "Added Successfully",
                        "value": {
                            "detail": "Note Added Successfully"
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
                    "korean Can Not Be Empty": {
                        "summary": "한국어란은 비워둘 수 없습니다.",
                        "value": {"detail":korean_cannot_be_empty}
                    },
                    "english Can Not Be Empty": {
                        "summary": "영어란은 비워둘 수 없습니다.",
                        "value": {"detail":english_cannot_be_empty}
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

class NoteAdd(BaseModel):
    Korean: str
    English: str
    Speak: str and None

def verify_user_token(req: Request):

    try:
        token = req.headers["Authorization"]    
        # Verify the ID token while checking if the token is revoked by
        # passing check_revoked=True.
        user = auth.verify_id_token(token, check_revoked=True)
        # Token is valid and not revoked.
        return True, user['uid']
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
    
@noteapi.post("/add", responses=responses)
async def add_note(note: NoteAdd, authorized: bool = Depends(verify_user_token)):
    if authorized:
        if note.Korean == "":
            raise HTTPException(status_code=401, detail=korean_cannot_be_empty)
        if note.English == "":
            raise HTTPException(status_code=401, detail=english_cannot_be_empty)
        
        notejson = json.loads(json.dumps(note.dict()))
        notejson["Author"] = list(authorized)[1]
        notejson['Created_At'] = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        try:
            response = requests.post(
                "https://rjlmigoly0.execute-api.ap-northeast-2.amazonaws.com/Main/note/add",
                json=notejson
            )
        except requests.exceptions.RequestException as e:
            raise HTTPException(status_code=500, detail=str(e))
        
        if(response.text == "\"Status Code : 200 | OK : Successfully added data \""):
            return json.loads('{"detail":"Note Added Successfully"}')
        
#@noteapi.post("/get")