import json
from fastapi import APIRouter, HTTPException, Depends, Request
from pydantic import BaseModel
import os
import requests
import datetime
import re
import smtplib
from email.message import EmailMessage

s = smtplib.SMTP("smtp.gmail.com", 587)
s.ehlo()
s.starttls()
s.login("noreply.enote", "iguffrrwnfhmocxt")

try:   
    import firebase_admin
    from firebase_admin import auth
    from firebase_admin import credentials
    from firebase_admin import storage
    from firebase_admin import _auth_utils
    from firebase import Firebase

    firebaseConfig = {
        "apiKey": "AIzaSyDBt0rc-OcLhxTSrXizM4PUWhCe569F-Pw",
        "authDomain": "deli-english-web.firebaseapp.com",
        "projectId": "deli-english-web",
        "storageBucket": "deli-english-web.appspot.com",
        "messagingSenderId": "119539050922",
        "appId": "1:119539050922:web:83c34b761fcc603024a3d3",
        "measurementId": "G-9YS5TESRYC",
        "databaseURL":"https://deli-english-web-default-rtdb.firebaseio.com"
    }

        #파이어베이스 서비스 세팅
    cred = credentials.Certificate('./cert/firebase-service-account.json')
    default_app = firebase_admin.initialize_app(cred,{"databaseURL":"https://deli-english-web-default-rtdb.firebaseio.com"})

    Auth = Firebase(firebaseConfig).auth()
    Storage = Firebase(firebaseConfig).storage()
except ModuleNotFoundError:

    os.system('pip install firebase')
    os.system('pip install sseclient')
    os.system('pip install firebase_admin')
    os.system('pip install gcloud')
    os.system('pip install python_jwt')
    os.system('pip install crypto')
    os.system('pip install requests_toolbelt')

    import crypto
    import sys

    sys.modules['Crypto'] = crypto
    import firebase_admin
    from firebase_admin import auth
    from firebase_admin import credentials
    from firebase_admin import storage
    from firebase import Firebase




    firebaseConfig = {
        "apiKey": "AIzaSyDBt0rc-OcLhxTSrXizM4PUWhCe569F-Pw",
        "authDomain": "deli-english-web.firebaseapp.com",
        "projectId": "deli-english-web",
        "storageBucket": "deli-english-web.appspot.com",
        "messagingSenderId": "119539050922",
        "appId": "1:119539050922:web:83c34b761fcc603024a3d3",
        "measurementId": "G-9YS5TESRYC",
        "databaseURL":"https://deli-english-web-default-rtdb.firebaseio.com"
    }

        #파이어베이스 서비스 세팅
    cred = credentials.Certificate('./cert/serviceAccountKey.json')
    #default_app = firebase_admin.initialize_app(cred,{"databaseURL":"https://deli-english-web-default-rtdb.firebaseio.com"})

    Auth = Firebase(firebaseConfig).auth()
    Storage = Firebase(firebaseConfig).storage()

userapi = APIRouter(prefix="/api/user", tags=["user"])

"응답 정의 구역"
Missing_Email = {"code":"ER003", "message":"MISSING EMAIL"}
Missing_Password = {"code":"ER004", "message":"MISSING PASSWORD"}
Password_is_Too_Short = {"code":"ER005", "message":"PASSWORD IS TOO SHORT"}
Too_Many_Duplicate_Characters = {"code":"ER006", "message":"TOO MANY DUPLICATE CHARACTERS"}
Missing_Nickname = {"code":"ER007", "message":"MISSING NICKNAME"}

Invaild_Email = {"code":"ER008", "message":"INVAILD_EMAIL"}
Invaild_Password = {"code":"ER009", "message":"INVAILD_PASSWORD"}
Email_Exists = {"code":"ER010", "message":"EMAIL_EXISTS"}

User_NotFound = {"code":"ER011", "message":"USER_NOT_FOUND"}

Email_Not_Verified = {"code":"ER012", "message":"EMAIL_NOT_VERIFIED"}

unauthorized = {'code':'ER013','message':'UNAUTHORIZED'}
unauthorized_revoked = {'code':'ER014','message':'UNAUTHORIZED (REVOKED TOKEN)'}
unauthorized_invaild = {'code':'ER015','message':'UNAUTHORIZED (TOKEN INVALID)'}
unauthorized_userdisabled = {'code':'ER016','message':'UNAUTHORIZED (TOKENS FROM DISABLED USERS)'}

Nickname_cantuse = {'code':'ER017','message':'Nickname Cant Contain "removed"'}

email_provider_error = {'code':'ER018','message':'Unable to sign up using this email provider'}

Token_Revoke = {"code":"ER999", "message":"TOKEN REVOKED"}
Invalid_Token = {"code":"ER998", "message":"INVALID TOKEN"}
User_Disabled = {"code":"ER997", "message":"USER DISABLED"}

login_responses = {
    400: {
        "description": "Bad Request",
        "content": {
            "application/json": {
                "examples": {
                    "Missing password": {
                        "summary": "비밀번호가 입력되지 않았습니다.",
                        "value": {"detail":Missing_Password}
                    },
                    "Missing email": {  
                        "summary": "이메일이 입력되지 않았습니다.",
                        "value": {"detail":Missing_Email}
                    },
                    "invaild email": {
                        "summary": "아이디의 입력값이 이메일이 아니거나, 이메일이 유효하지 않습니다.",
                        "value": {"detail":Invaild_Email}
                    },
                    "invaild password": {
                        "summary": "비밀번호가 일치하지 않습니다.",
                        "value": {"detail":Invaild_Password}
                    },
                    "User Disabled": {
                        "summary": "사용자가 비활성화 되었습니다.",
                        "value": {"detail":User_Disabled}
                    },
                    "Email Not Verified": {
                        "summary": "이메일 인증이 완료되지 않았습니다.",
                        "value": {"detail":Email_Not_Verified}
                    }
                }
            }
        }
    }
}

register_responses = {
    201: {
        "description": "가입 성공",
        "content": {
            "application/json": {
                "examples": {
                    "Success": { 
                        "summary": "회원가입 성공",
                        "value": {"detail": "User Register Successfully"}
                    }
                }
            }
        },
    },
    400: {
        "description": "Bad Request",
        "content": {
            "application/json": {
                "examples": {
                    "Missing email": {  
                        "summary": "이메일이 입력되지 않았습니다.",
                        "value": {"detail":Missing_Email}
                    },
                    "Missing password": {
                        "summary": "비밀번호가 입력되지 않았습니다.",
                        "value": {"detail":Missing_Password}
                    },
                    "invaild email": {
                        "summary": "아이디의 입력값이 이메일이 아니거나, 이메일이 유효하지 않습니다.",
                        "value": {"detail":Invaild_Email}
                    },
                    "Password is Too Short": {
                        "summary": "비밀번호가 너무 짧습니다. 비밀번호는 6자 이상이어야 합니다.",
                        "value": {"detail":Password_is_Too_Short}
                    },
                    "Too Many Duplicate Characters": {
                        "summary": "비밀번호에 연속적으로 중복된 문자가 너무 많습니다. (최대 중복 4글자)",
                        "value": {"detail":Too_Many_Duplicate_Characters}
                    },
                    "Missing nickname": {
                        "summary": "닉네임이 입력되지 않았습니다.",
                        "value": {"detail":Missing_Nickname}
                    },
                    "EMail Exists": {
                        "summary": "이미 가입되어있는 이메일입니다.",
                        "value": {"detail":Email_Exists}
                    }
                }
            }
        }
    }
}

token_verify_responses = {
    400: {
        "description": "Bad Request",
        "content": {
            "application/json": {
                "examples": {
                    "Token Revoked": {
                        "summary": "토근이 취소되었습니다. (재 로그인 필요)",
                        "value": {"detail":Token_Revoke}
                    },
                    "Invaild Token": {  
                        "summary": "토큰이 유효하지 않습니다.",
                        "value": {"detail":Invalid_Token}
                    },
                    "User Disabled": {  
                        "summary": "해당 유저는 비활성화 되어있습니다.",
                        "value": {"detail":User_Disabled}
                    }
                }
            }
        }
    }
}

token_revoke_responses = {
    200: {
        "description": "Token Revoked",
        "content": {
            "application/json": {
                "examples": {
                    "Added Successfully": {
                        "summary": "Revoke Successfully",
                        "value": {                                                        
                            "detail": "Tokens revoked at: timestamp"
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
                    "User Not Found": {
                        "summary": "해당 유저는 존재하지 않습니다.",
                        "value": {"detail":User_NotFound}
                    },
                    "Invalid Token": {
                        "summary": "토큰이 유효하지 않습니다.",
                        "value": {"detail":Invalid_Token}
                    }
                }
            }
        }
    }
}

class UserLogindata(BaseModel):
    email: str
    password: str

class UserRegisterdata(BaseModel):
    email: str
    password: str
    nickname: str

class LoginResponse(BaseModel):
    id: str
    nickname: str
    email: str
    access_token: str
    refresh_token: str
    expires_in: int
    Created_At: str

class RegisterResponse(BaseModel):
    detail: str

class verify_token(BaseModel):
    access_token: str

class verify_token_res(BaseModel):
    uid: str
    email: str

class token_revoke(BaseModel):
    uid: str

class token_revoke_res(BaseModel):
    detail: str

class UserResetPWdata(BaseModel):
    email: str

class EmailVerify(BaseModel):
    email: str

class EmailSend(BaseModel):
    title: str
    content: str
    email: str

class UserLogoutdata(BaseModel):
    access_token: str

class UserFindiddata(BaseModel):
    nickname: str

class refresh_token(BaseModel):
    refresh_token: str

async def verify_tokenb(req: str):
    token = req   
    try:
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


async def verify_tokena(req: Request):
    token = req.headers["Authorization"]  
    try:
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

def verify_admin_token(req: Request):
    Auth.refresh
    token = req.headers["Authorization"]
    
    if token == "Bearer cncztSAt9m4JYA9":
        return True
    else:
        return False

@userapi.post("/refresh_token")
async def refresh_token(token: refresh_token):
    try:
        refreshtoken = token.refresh_token
    except AttributeError as e:
        refreshtoken = token['refresh_token']

    try:
        currentuser = Auth.refresh(refreshtoken)
        userjson = {}
        userjson['id'] = currentuser['userId']
        userjson['access_token'] = currentuser['idToken']
        userjson['refresh_token'] = currentuser['refreshToken']  
        return userjson
    except HTTPException as e:
        raise HTTPException(500)

@userapi.post("/verify_token", response_model=verify_token_res, responses=token_verify_responses)
async def verify_token(token: verify_token):

    try:
        usertoken = token.access_token
    except AttributeError as e:
        usertoken = token['access_token']

    try:
        # Verify the ID token while checking if the token is revoked by
        # passing check_revoked=True.
        decoded_token = auth.verify_id_token(usertoken, check_revoked=True)
        # Token is valid and not revoked.
        return decoded_token
    except auth.RevokedIdTokenError:
        # Token revoked, inform the user to reauthenticate or signOut().
        raise HTTPException(status_code=400, detail=Token_Revoke)
    except auth.UserDisabledError:
        # Token belongs to a disabled user record.
        raise HTTPException(status_code=400, detail=User_Disabled)
    except auth.InvalidIdTokenError:
        # Token is invalid
        raise HTTPException(status_code=400, detail=Invalid_Token)
    
@userapi.post("/revoke_token", response_model=token_revoke_res, responses=token_revoke_responses)
async def revoke_token(token: token_revoke):
    try:
        uid = token.access_token
    except AttributeError as e:
        uid = token

    try:
        auth.revoke_refresh_tokens(uid)
        user = auth.get_user(uid)
        revocation = user.tokens_valid_after_timestamp / 1000
        return {"detail": 'Tokens revoked at: {0}'.format(revocation)}
    except _auth_utils.InvalidIdTokenError:
        raise HTTPException(status_code=400, detail=Invalid_Token)
    except _auth_utils.UserNotFoundError:
        raise HTTPException(status_code=400, detail=User_NotFound)
"""  
@userapi.delete('/delete')
async def user_delete(authorized:bool = Depends(verify_token)):
    if authorized:
"""


@userapi.post('/login', response_model=LoginResponse, responses=login_responses)
async def user_login(userdata: UserLogindata, request: Request):
    email = userdata.email
    password = userdata.password

    if(len(email) == 0):
        raise HTTPException(status_code=400, detail=Missing_Email)

    if(len(password) == 0):
        raise HTTPException(status_code=400, detail=Missing_Password)

    try:
        Auth.sign_in_with_email_and_password(email, password)
    except requests.exceptions.HTTPError as erra:
        #HTTP 에러가 발생한 경우
        #오류 가져오기 json.loads(str(erra).split("]")[1].split('"errors": [\n')[1])['message']
        res = json.loads(str(erra).split("]")[1].split('"errors": [\n')[1])['message']
        res = res.split(" : ")[0]
        if "INVALID_EMAIL" in res:
            raise HTTPException(status_code=400, detail=Invaild_Email)

        if "INVALID_PASSWORD" in res:
            raise HTTPException(status_code=400, detail=Invaild_Password)

        if "USER_DISABLED" in res:
            raise HTTPException(status_code=400, detail=User_Disabled)

    currentuser = Auth.current_user
    user = requests.post(
        url='https://rjlmigoly0.execute-api.ap-northeast-2.amazonaws.com/Main/user/get',
        json={'Id':currentuser['localId']}
    )

    user.encoding = "UTF-8"
    userjson = json.loads(user.text)
    
    userjson['access_token'] = currentuser['idToken']
    userjson['refresh_token'] = currentuser['refreshToken']
    userjson['expires_in'] = currentuser['expiresIn']
    verify = await verify_token(userjson)
    if verify['email_verified'] == False:
        """
        res = auth.generate_email_verification_link(email, action_code_settings=None, app=None)
        message = res.replace("lang=en", "lang=ko")
        msg = EmailMessage()
        msg['Subject'] = '[ENote] 이메일을 인증하세요'
        msg['From'] = "noreply.enote@gmail.com"
        msg['To'] = email
        msg.set_content("아래 링크를 클릭해서 이메일을 인증하세요.\n"+message)
        s.send_message(msg)
        """
        raise HTTPException(status_code=400, detail=Email_Not_Verified)

    
    id = userjson['id']
    login_at = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    ip = request.client.host
    login_log = {}
    login_log['Id'] = id
    login_log['Login_At'] = login_at
    login_log['Login_IP'] = ip
    login_log['nickname'] = userjson['nickname']

    lres = requests.post(
        url='https://rjlmigoly0.execute-api.ap-northeast-2.amazonaws.com/Main/loginlog/add',
        json=login_log
    )

    print(lres.text)

    return userjson
#.

@userapi.post("/register", response_model=RegisterResponse, responses=register_responses, status_code=201)
async def user_create(userdata: UserRegisterdata):
    now = datetime.datetime.now()
    email = userdata.email
    password = userdata.password
    nickname = userdata.nickname
    #이메일이 공란이면
    if(len(email) == 0):
        raise HTTPException(status_code=400, detail=Missing_Email)

    #비번이 공란이면
    if(len(password) == 0):
        raise HTTPException(status_code=400, detail=Missing_Password)
    else:
        #비번이 6자리 이하이면
        if(len(password) <= 6):
            raise HTTPException(status_code=400, detail=Password_is_Too_Short)
        else:
            #비번에 4글자이상 중복되는 글자가 있으면
            if(re.search('(([a-zA-Z0-9])\\2{3,})', password)):
                raise HTTPException(status_code=400, detail=Too_Many_Duplicate_Characters)

    #닉네임이 공란이면
    if(len(nickname) == 0):
        raise HTTPException(status_code=400, detail=Missing_Nickname)
    
    if 'removed' in nickname:
        raise HTTPException(status_code=400, detail=Nickname_cantuse)
    
    if 'kakao' in email:
        raise HTTPException(status_code=400, detail=email_provider_error)

    try:
        #파이어베이스의 유저만드는거 사용
        a = Auth.create_user_with_email_and_password(email, password)
    except requests.exceptions.HTTPError as erra:
        #HTTP 에러가 발생한 경우
        #오류 가져오기 json.loads(str(erra).split("]")[1].split('"errors": [\n')[1])['message']
        res = json.loads(str(erra).split("]")[1].split('"errors": [\n')[1])['message']
        res = res.split(" : ")[0]
        if "INVALID_EMAIL" in res:
            raise HTTPException(status_code=400, detail=Invaild_Email)
        
        if "INVALID_PASSWORD" in res:
            raise HTTPException(status_code=400, detail=Invaild_Password)

        if "USER_DISABLED" in res:
            raise HTTPException(status_code=400, detail=User_Disabled)

        if "EMAIL_EXISTS" in res:
            raise HTTPException(status_code=400, detail=Email_Exists)

    #유저의 고유 아이디 (UniqueID)
    id = a['localId']
    data = {
        'email':email,
        'Id':id,
        'Nickname':nickname,
        'Created_At':str(now)
    }

    res = auth.generate_email_verification_link(email, action_code_settings=None, app=None)
    message = res.replace("lang=en", "lang=ko")
    msg = EmailMessage()
    msg['Subject'] = '[ENote] 계정 이메일 인증'
    msg['From'] = "noreply.enote@gmail.com"
    msg['To'] = email
    msg.set_content("안녕하세요 ENote입니다.\n\n해당 이메일로 ENote 사이트에 가입되어 이메일 인증이 필요합니다.\n아래 링크를 클릭해서 이메일 인증을 완료할 수 있습니다.\n\n"+message+"\n\n만약 본인이 가입하지 않은거라면 이 메일을 무시하세요.\n\n\n※ 본 메일은 발신 전용 메일이며, 자세한 문의사항은 ENote 고객센터를 이용해 주시기 바랍니다.")
    
    try:
        s.send_message(msg)
    except smtplib.SMTPServerDisconnected:
        d = smtplib.SMTP("smtp.gmail.com", 587)
        d.ehlo()
        d.starttls()
        d.login("noreply.enote", "iguffrrwnfhmocxt")
        d.send_message(msg)

    try:
        c = requests.post(
            url = 'https://rjlmigoly0.execute-api.ap-northeast-2.amazonaws.com/Main/user/add',
            json=data
        )
    except requests.exceptions.RequestException as erra:
        raise HTTPException(status_code=500, detail=str(erra))
    

    if(c.text == "\"Status Code : 200 | OK : Successfully added data \""):
        return json.loads('{"detail":"User Register Successfully"}')
    
    raise HTTPException(status_code=500, detail=json.loads(c.text)['message'])

@userapi.post('/logout')
async def user_logout(userdata: UserLogoutdata):
    auth = await verify_tokenb(userdata.access_token)
    if auth:
        print(auth)
        res = await revoke_token(list(auth)[1])
        return {"detail":"User Logout Successfully"}
    else:
        raise HTTPException(status_code=401, detail=unauthorized)

@userapi.post("/findid")
async def user_findid(userdata: UserFindiddata):
    nick = userdata.nickname

    data = {
        "NickName":nick
    }

    try:
        c = requests.post(
            url = 'https://rjlmigoly0.execute-api.ap-northeast-2.amazonaws.com/Main/user/findid',
            json=data
        )
    except requests.exceptions.RequestException as erra:
        raise HTTPException(status_code=500, detail=str(erra))
    
    emails = json.loads(c.text)

    resemails = {}
    resemails["data"] = []
    for email in emails:
        originmail = email['email'].split("@")
        ldiff = originmail[0][0:round(len(originmail[0])/2)] +""+ str("*"*(len(originmail[0])-round(len(originmail[0])/2)))
        rdiff = originmail[1][0:round(len(originmail[0])/2)] +""+ str("*"*(len(originmail[1])-round(len(originmail[0])/2)))
        resemails["data"].append({"email":ldiff+"@"+rdiff})

    resemails["amount"] = len(resemails["data"])
    
    return resemails



@userapi.post("/resetpw")
async def user_reset_password(userdata: UserResetPWdata):
    email = userdata.email
    try:
        auth.get_user_by_email(email)
    except _auth_utils.UserNotFoundError:
        raise HTTPException(status_code=400, detail=User_NotFound)
    except ValueError:
        raise HTTPException(status_code=400, detail=Invaild_Email)
    
    rstlink = auth.generate_password_reset_link(email, action_code_settings=None, app=None)
    rstlink = rstlink.replace("lang=en", "lang=ko")

    rst = EmailMessage()
    rst['Subject'] = '[ENote] 계정 비밀번호 변경'
    rst['From'] = "noreply.enote@gmail.com"
    rst['To'] = email
    rst.set_content("안녕하세요 ENote입니다.\n\n회원님께서는 ENote 계정의 비밀번호 변경을 요청하셨습니다.\n링크를 누르면 새로운 비밀번호를 설정하실 수 있습니다.\n\n"+rstlink+"\n\n회원님이 요청하신 것이 아니라면 이 메일을 무시하세요.\n\n\n※ 본 메일은 발신 전용 메일이며, 자세한 문의사항은 ENote 고객센터를 이용해 주시기 바랍니다.")
    
    try:
        s.send_message(rst)
    except smtplib.SMTPServerDisconnected:
        d = smtplib.SMTP("smtp.gmail.com", 587)
        d.ehlo()
        d.starttls()
        d.login("noreply.enote", "iguffrrwnfhmocxt")
        d.send_message(rst)

    return rstlink

@userapi.post("/verify_email")
async def user_verify(userdata: EmailVerify):
        email = userdata.email
        try:
            auth.get_user_by_email(email)
        except _auth_utils.UserNotFoundError:
            raise HTTPException(status_code=400, detail=User_NotFound)
        except ValueError:
            raise HTTPException(status_code=400, detail=Invaild_Email)
        
        vlink = auth.generate_email_verification_link(email, action_code_settings=None, app=None)

        ver = EmailMessage()
        ver['Subject'] = '[ENote] 계정 이메일 인증'
        ver['From'] = 'noreply.enote@gmail.com'
        ver['To'] = email
        ver.set_content("안녕하세요 ENote입니다.\n\n해당 이메일로 ENote 사이트에 가입되어 이메일 인증이 필요합니다.\n아래 링크를 클릭해서 이메일 인증을 완료할 수 있습니다.\n\n"+vlink+"\n\n만약 본인이 가입하지 않은거라면 이 메일을 무시하세요.\n\n\n※ 본 메일은 발신 전용 메일이며, 자세한 문의사항은 ENote 고객센터를 이용해 주시기 바랍니다.")

        try:
            s.send_message(ver)
        except smtplib.SMTPServerDisconnected:
            d = smtplib.SMTP("smtp.gmail.com", 587)
            d.ehlo()
            d.starttls()
            d.login("noreply.enote", "iguffrrwnfhmocxt")
            d.send_message(ver)
        
        return {"detail":"Email Verification Link Sent"}

@userapi.post("/send_email")
async def admin_send_email(userdata: EmailSend, authorized: bool = Depends(verify_admin_token)):
    if authorized:
        email = userdata.email
        try:
            auth.get_user_by_email(email)
        except _auth_utils.UserNotFoundError:
            raise HTTPException(status_code=400, detail=User_NotFound)
        except ValueError:
            raise HTTPException(status_code=400, detail=Invaild_Email)
        
        message = EmailMessage()
        message['Subject'] = '[ENote] '+userdata.title
        message['From'] = 'noreply.enote@gmail.com'
        message['To'] = email
        message.set_content(userdata.content+"\n\n\n※ 본 메일은 발신 전용 메일이며, 자세한 문의사항은 ENote 고객센터를 이용해 주시기 바랍니다.")

        try:
            s.send_message(message)
        except smtplib.SMTPServerDisconnected:
            d = smtplib.SMTP("smtp.gmail.com", 587)
            d.ehlo()
            d.starttls()
            d.login("noreply.enote", "iguffrrwnfhmocxt")
            d.send_message(message)

        return {"detail":"Email Sent"}
    else:
        raise HTTPException(status_code=401, detail=unauthorized)