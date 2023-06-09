import json
from fastapi import APIRouter, HTTPException, Depends, Header, Request
from fastapi.security import OAuth2
from pydantic import BaseModel
import os
from firebase_admin import auth
import datetime
from controller.database import execute_sql

from typing import Optional

try:
    import requests
except ModuleNotFoundError:
    os.system('pip install requests')
    import requests

noteapi = APIRouter(prefix="/api/note",tags=["Note"])

unauthorized = {'code':'ER013','message':'UNAUTHORIZED'}
unauthorized_revoked = {'code':'ER014','message':'UNAUTHORIZED (REVOKED TOKEN)'}
unauthorized_invaild = {'code':'ER015','message':'UNAUTHORIZED (TOKEN INVALID)'}
unauthorized_userdisabled = {'code':'ER016','message':'UNAUTHORIZED (TOKENS FROM DISABLED USERS)'}
korean_cannot_be_empty = {'code':'ER017','message':'KOREAN CANNOT BE EMPTY'}
english_cannot_be_empty = {'code':'ER018','message':'ENGLISH CANNOT BE EMPTY'}

created_at_error = {'code':'ER019','message':'CREATED_AT_ERROR Correct Value : year, month, day, hour, minute, second'}
no_data_error = {'code':'ER020','message':'DATA NOT FOUND'}

responses = {
    201: {
        "description": "Created successfully",
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

update_responses = {
    200: {
        "description": "Update successfully",
        "content": {
            "application/json": {
                "examples": {
                    "Added Successfully": {
                        "summary": "아무 오류도 없이 변경에 성공했습니다.",
                        "value": {
                            "detail": "Note Update Successfully"
                        }
                    },
                    "Updated Successfully with some warning": {
                        "summary": "두개 이상의 노트가 동시에 변경되었습니다.",
                        "value": {
                            "detail": "WARNING: TWO OR MORE DATA CHANGED AT THE SAME TIME"
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
                    },
                    "created_at_error": {
                        "summary": "Created_At의 값이 올바르지 않습니다.",
                        "value": {"detail":created_at_error}
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
    },
    404: {
        "description": "Not Found",
        "content": {
            "application/json": {
                "examples": {
                    "Note Not Found": {
                        "summary": "해당 사용자가 해당 시간에 쓴 노트는 존재하지 않습니다.",
                        "value": {
                            "detail": no_data_error
                        }
                    }
                }
            }
        }
    }
}

search_responses = {
    200: {
        "description": "Search successfully",
        "content": {
            "application/json": {
                "examples": {
                    "Search Successfully": {
                        "summary": "조회에 성공했습니다.",
                        "value": {
                            "data": [        {
                                "Author": "유저 고유 아이디",
                                "English": "영어",
                                "Korean": "한국어",
                                "Speak": "발음",
                                "Created_At": "노트가 등록된 시간"
                            }]
                        }
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
                        "value": {
                            "detail":unauthorized_userdisabled
                        }
                    }
                }
            }
        }             
    },
    404: {
        "description": "Not Found",
        "content": {
            "application/json": {
                "examples": {
                    "Note Not Found": {
                        "summary": "데이터를 찾을수 없습니다.",
                        "value": {
                            "detail": no_data_error
                        }
                    }
                }
            }
        }
    }
}

delete_responses = {
    200: {
        "description": "Delete successfully",
        "content": {
            "application/json": {
                "examples": {
                    "Search Successfully": {
                        "summary": "삭제에 성공했습니다.",
                        "value": {
                            "detail":"Note Delete Successfully"
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
                    "created_at_error": {
                        "summary": "Created_At의 값이 올바르지 않습니다.",
                        "value": {"detail":created_at_error}
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
                        "value": {
                            "detail":unauthorized_userdisabled
                        }
                    }
                }
            }
        }             
    },
    404: {
        "description": "Not Found",
        "content": {
            "application/json": {
                "examples": {
                    "Note Not Found": {
                        "summary": "데이터를 찾을수 없습니다.",
                        "value": {
                            "detail": no_data_error
                        }
                    }
                }
            }
        }
    }
}

class NoteAdd(BaseModel):
    Korean: str
    English: str
    Speak: Optional[str] = None
    Category: Optional[str] = None

class NoteGetPer10(BaseModel):
    Page: int

class NoteUpdate(BaseModel):
    Korean: str
    English: str
    Speak: Optional[str] = None
    Created_At: str
    Category: Optional[str] = None

class NoteDelete(BaseModel):
    Created_At: str

class NoteSearchWithDate(BaseModel):
    Created_At: str

class NoteSearchWithDate_10(BaseModel):
    Created_At: str
    Page: int

class NoteSearchWithCategory(BaseModel):
    Category: str

class NoteSearchWithCategory_10(BaseModel):
    Category: str
    Page: int

class NoteSearchWithDate_Category(BaseModel):
    Created_At: str
    Category: str

class NoteSearchWithDate_Category_10(BaseModel):
    Created_At: str
    Category: str
    Page: int

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
    
@noteapi.post("/add", responses=responses, status_code=201) # 노트 추가 (201 반환)
async def add_note(note: NoteAdd, authorized: bool = Depends(verify_user_token)):
    if authorized:
        if note.Korean == "":
            raise HTTPException(status_code=401, detail=korean_cannot_be_empty)
        if note.English == "":
            raise HTTPException(status_code=401, detail=english_cannot_be_empty)
        
        notejson = json.loads(json.dumps(note.dict()))
        notejson["Author"] = list(authorized)[1]
        notejson['Created_At'] = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        
        res = execute_sql("INSERT INTO Notes (Author, English, Korean, Speak, Created_At, Category) VALUES ('{0}','{1}','{2}','{3}','{4}','{5}')".format(notejson['Author'], notejson['English'], notejson['Korean'], notejson['Speak'], notejson['Created_At'], notejson['Category']))
        
        if res == 0:
            raise HTTPException(400, "노트 등록 실패 ( SQL문의 오류일수도있고 데이터가 이미 존재할수도 있음 )")
        
        return "NOTE ADDED"
        
@noteapi.post("/get_10", responses=search_responses) # 10개의 노트만 가져오기
async def get_10_note(page: NoteGetPer10,authorized: bool = Depends(verify_user_token)):
    if authorized:
        json_10 = json.loads(json.dumps(page.dict()))
        json_10["Author"] = list(authorized)[1]
        json_10["Page"] = json_10["Page"] - 1
        
        res = execute_sql("SELECT * FROM Notes WHERE Author='{0}' order by Created_At DESC LIMIT 10 OFFSET {1}0".format(json_10["Author"], json_10["Page"]))
        
        if len(res) == 0:
            raise HTTPException(status_code=404, detail=no_data_error)
        
        return res
        
@noteapi.get("/get_all", responses=search_responses) # 모든 노트 가져오기
async def get_all_note(authorized: bool = Depends(verify_user_token)):
    if authorized:
        res = execute_sql("SELECT * FROM Notes WHERE Author='{0}' order by Created_At DESC".format(authorized[1]))
        
        if len(res) == 0:
            raise HTTPException(status_code=404, detail=no_data_error)

        return({"data":res})

@noteapi.post("/get_date_10", responses=search_responses) # 작성 날짜를 기준으로 10개의 노트 가져오기
async def get_date_10_note(note: NoteSearchWithDate_10, authorized: bool = Depends(verify_user_token)):
    if authorized:
        notejson = json.loads(json.dumps(note.dict()))
        notejson["Author"] = list(authorized)[1]
        notejson["Page"] = notejson["Page"] - 1
        notetime = note.Created_At.split(",")
        Created_At = {}
        try:
            Created_At['year'] = int(notetime[0])
            Created_At['month'] = int(notetime[1])
            Created_At['day'] = int(notetime[2])
        except IndexError:
            raise HTTPException(status_code=400, detail=created_at_error)
        
        res = execute_sql("SELECT * FROM Notes WHERE Author='{0}' AND DATE_FORMAT(Created_At, '%Y-%m-%d')=DATE_FORMAT('{1}', '%Y-%m-%d') order by Created_At DESC LIMIT 10 OFFSET {2}0".format(notejson["Author"], notejson["Created_At"], notejson["Page"]))
        
        if len(res) == 0:
            raise HTTPException(status_code=404, detail=no_data_error)

        return({"data":res})

@noteapi.post("/get_date", responses=search_responses) # 작성 날짜를 기준으로 모든 노트 가져오기
async def get_all_note_with_Created_At(note: NoteSearchWithDate, authorized: bool = Depends(verify_user_token)):
    if authorized:
        notejson = json.loads(json.dumps(note.dict()))
        notejson["Author"] = list(authorized)[1]
        notetime = note.Created_At.split(",")
        Created_At = {}
        try:
            Created_At['year'] = int(notetime[0])
            Created_At['month'] = int(notetime[1])
            Created_At['day'] = int(notetime[2])
        except IndexError:
            raise HTTPException(status_code=400, detail=created_at_error)
        
        res = execute_sql("SELECT * FROM Notes WHERE Author='{0}' AND DATE_FORMAT(Created_At, '%Y-%m-%d')=DATE_FORMAT('{1}', '%Y-%m-%d') order by Created_At DESC".format(notejson["Author"], notejson["Created_At"]))
        
        if len(res) == 0:
            raise HTTPException(status_code=404, detail=no_data_error)

        return({"data":res})
    
@noteapi.post("/get_date_cate_10", responses=search_responses)
async def get_date_cate_10(note:NoteSearchWithDate_Category_10, authorized: bool = Depends(verify_user_token)):
    if authorized:
        notejson = json.loads(json.dumps(note.dict()))
        notejson["Author"] = list(authorized)[1]
        notejson["Page"] = notejson["Page"] - 1
        notetime = note.Created_At.split(",")
        Created_At = {}
        try:
            Created_At['year'] = int(notetime[0])
            Created_At['month'] = int(notetime[1])
            Created_At['day'] = int(notetime[2])
        except IndexError:
            raise HTTPException(status_code=400, detail=created_at_error)
        res = execute_sql("SELECT * FROM Notes WHERE Author='{0}' AND DATE_FORMAT(Created_At, '%Y-%m-%d')=DATE_FORMAT('{1}', '%Y-%m-%d') AND Category='{3}' order by Created_At DESC LIMIT 10 OFFSET {2}0".format(notejson["Author"], notejson["Created_At"], notejson["Page"], notejson['Category']))
        
        if len(res) == 0:
            raise HTTPException(status_code=404, detail=no_data_error)

        return({"data":res})

@noteapi.post("/get_date_cate", responses=search_responses)
async def get_date_cate(note:NoteSearchWithDate_Category, authorized: bool = Depends(verify_user_token)):
    if authorized:
        notejson = json.loads(json.dumps(note.dict()))
        notejson["Author"] = list(authorized)[1]
        notetime = note.Created_At.split(",")
        Created_At = {}
        try:
            Created_At['year'] = int(notetime[0])
            Created_At['month'] = int(notetime[1])
            Created_At['day'] = int(notetime[2])
        except IndexError:
            raise HTTPException(status_code=400, detail=created_at_error)
        res = execute_sql("SELECT * FROM Notes WHERE Author='{0}' AND DATE_FORMAT(Created_At, '%Y-%m-%d')=DATE_FORMAT('{1}', '%Y-%m-%d') AND Category='{2}' order by Created_At DESC".format(notejson["Author"], notejson["Created_At"], notejson['Category']))
        
        if len(res) == 0:
            raise HTTPException(status_code=404, detail=no_data_error)

        return({"data":res})

@noteapi.post("/get_cate_10", responses=search_responses)
async def get_cate_10(note:NoteSearchWithCategory_10, authorized: bool = Depends(verify_user_token)):
    if authorized:
        notejson = json.loads(json.dumps(note.dict()))
        notejson["Author"] = list(authorized)[1]
        notejson["Page"] = notejson["Page"] - 1
        notetime = note.Created_At.split(",")
        Created_At = {}
        try:
            Created_At['year'] = int(notetime[0])
            Created_At['month'] = int(notetime[1])
            Created_At['day'] = int(notetime[2])
        except IndexError:
            raise HTTPException(status_code=400, detail=created_at_error)
        
        res = execute_sql("SELECT * FROM Notes WHERE Author='{0}' AND Category='{1}' order by Created_At DESC LIMIT 10 OFFSET {2}0".format(notejson["Author"], notejson["Category"], notejson["Page"]))
        
        if len(res) == 0:
            raise HTTPException(status_code=404, detail=no_data_error)

        return({"data":res})

@noteapi.post("/get_cate", responses=search_responses)
async def get_cate(note:NoteSearchWithCategory, authorized: bool = Depends(verify_user_token)):
    if authorized:
        notejson = json.loads(json.dumps(note.dict()))
        notejson["Author"] = list(authorized)[1]
        notetime = note.Created_At.split(",")
        Created_At = {}
        try:
            Created_At['year'] = int(notetime[0])
            Created_At['month'] = int(notetime[1])
            Created_At['day'] = int(notetime[2])
        except IndexError:
            raise HTTPException(status_code=400, detail=created_at_error)
        
        res = execute_sql("SELECT * FROM Notes WHERE Author='{0}' AND Category='{1}' order by Created_At DESC".format(notejson["Author"], notejson["Category"]))
        
        if len(res) == 0:
            raise HTTPException(status_code=404, detail=no_data_error)

        return({"data":res})

@noteapi.patch("/update", responses=update_responses) # 노트 업데이트
async def update_note(note: NoteUpdate, authorized: bool = Depends(verify_user_token)):
    if authorized:
        if note.Korean == "":
            raise HTTPException(status_code=401, detail=korean_cannot_be_empty)
        if note.English == "":
            raise HTTPException(status_code=401, detail=english_cannot_be_empty)
        
        notejson = json.loads(json.dumps(note.dict()))
        notejson["Author"] = list(authorized)[1]
        notetime = note.Created_At.split(",")
        Created_At = {}
        try:
            Created_At['year'] = int(notetime[0])
            Created_At['month'] = int(notetime[1])
            Created_At['day'] = int(notetime[2])
            Created_At['hour'] = int(notetime[3])
            Created_At['minute'] = int(notetime[4])
            Created_At['second'] = int(notetime[5])
        except IndexError:
            raise HTTPException(status_code=400, detail=created_at_error)

        notejson['Created_At'] = datetime.datetime(Created_At['year'],Created_At['month'],Created_At['day'],Created_At['hour'],Created_At['minute'],Created_At['second']).strftime("%Y-%m-%d %H:%M:%S")
        
        res = execute_sql("UPDATE Notes SET Korean='{0}', English='{1}', Speak='{2}', Category='{3}' WHERE Author='{4}' AND Created_At='{5}'".format(notejson['Korean'], notejson['English'], notejson['Speak'], notejson['Category'], notejson['Author'],notejson['Created_At']))
        
        if(res == 1):
            return json.loads('{"detail":"Note Update Successfully"}')

        if(res >= 1):
            return json.loads('{"detail":"WARNING: TWO OR MORE DATA CHANGED AT THE SAME TIME"}')
        
        if(res == 0):
            raise HTTPException(status_code=404, detail=no_data_error)
        
@noteapi.delete("/delete", responses=delete_responses) # 노트 삭제
async def delete_note(note: NoteDelete, authorized: bool = Depends(verify_user_token)):
    if authorized:
        notetime = note.Created_At.split(",")
        Created_At = {}
        try:
            Created_At['year'] = int(notetime[0])
            Created_At['month'] = int(notetime[1])
            Created_At['day'] = int(notetime[2])
            Created_At['hour'] = int(notetime[3])
            Created_At['minute'] = int(notetime[4])
            Created_At['second'] = int(notetime[5])
        except IndexError:
            raise HTTPException(status_code=400, detail=created_at_error)

        notejson = {}
        notejson["Author"] = list(authorized)[1]
        notejson["Created_At"] = datetime.datetime(Created_At['year'],Created_At['month'],Created_At['day'],Created_At['hour'],Created_At['minute'],Created_At['second']).strftime("%Y-%m-%d %H:%M:%S")

        res = execute_sql("DELETE FROM Notes WHERE Author='{0}' AND Created_At='{1}'".format(notejson['Author'],notejson['Created_At']))
        
        if(res == 1):
            return json.loads('{"detail":"Note Delete Successfully"}')

        if(res >= 1):
            return json.loads('{"detail":"WARNING: TWO OR MORE DATA DELETED AT THE SAME TIME"}')
        
        if(res == 0):
            raise HTTPException(status_code=404, detail=no_data_error)