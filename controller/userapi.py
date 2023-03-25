import json
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import os
import requests
import datetime
import re


try:   
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

    import firebase_admin
    from firebase_admin import auth
    from firebase_admin import credentials
    from firebase_admin import storage
    from firebase import Firebase

    import crypto
    import sys

    sys.modules['Crypto'] = crypto


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
    default_app = firebase_admin.initialize_app(cred,{"databaseURL":"https://deli-english-web-default-rtdb.firebaseio.com"})

    Auth = Firebase(firebaseConfig).auth()
    Storage = Firebase(firebaseConfig).storage()

userapi = APIRouter(prefix="/api/user", tags=["user"])

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
    created_at: str

@userapi.post('/login', response_model=LoginResponse)
async def user_login(userdata: UserLogindata):
    email = userdata.email
    password = userdata.password
    try:
        Auth.sign_in_with_email_and_password(email, password)
    except requests.exceptions.HTTPError as erra:
        #HTTP 에러가 발생한 경우
        #오류 가져오기 json.loads(str(erra).split("]")[1].split('"errors": [\n')[1])['message']
        res = json.loads(str(erra).split("]")[1].split('"errors": [\n')[1])['message']
        if " : " in res:
            res = res.split(" : ")[0]
            raise HTTPException(status_code=400, detail=res)
        else:
            raise HTTPException(status_code=400, detail=res)

    currentuser = Auth.current_user
    user = requests.post(
        url='https://rjlmigoly0.execute-api.ap-northeast-2.amazonaws.com/Main/user/get',
        json={'Id':currentuser['localId']}
    )
    user.encoding = "UTF-8"
    return json.loads(user.text)

@userapi.post("/register")
async def user_create(userdata: UserRegisterdata):
    now = datetime.datetime.now()
    email = userdata.email
    password = userdata.password
    nickname = userdata.nickname
    #이메일이 공란이면
    if(len(email) == 0):
        raise HTTPException(status_code=400, detail="Missing Email")

    #비번이 공란이면
    if(len(password) == 0):
        raise HTTPException(status_code=400, detail="Missing Password")
    else:
        #비번이 6자리 이하이면
        if(len(password) <= 6):
            raise HTTPException(status_code=400, detail="Password Too Short")
        else:
            #비번에 4글자이상 중복되는 글자가 있으면
            if(re.search('(([a-zA-Z0-9])\\2{3,})', password)):
                raise HTTPException(status_code=400, detail="Too Many Duplicate Characters")

    #닉네임이 공란이면
    if(len(nickname) == 0):
        raise HTTPException(status_code=400, detail="Missing Nickname")

    try:
        #파이어베이스의 유저만드는거 사용
        a = Auth.create_user_with_email_and_password(email, password)
    except requests.exceptions.HTTPError as erra:
        #HTTP 에러가 발생한 경우
        #오류 가져오기 json.loads(str(erra).split("]")[1].split('"errors": [\n')[1])['message']
        return json.loads(str(erra).split("]")[1].split('"errors": [\n')[1])['message'], 500

    #유저의 고유 아이디 (UniqueID)
    id = a['localId']
    data = {
        'email':email,
        'Id':id,
        'Nickname':nickname,
        'Created_At':str(now)
    }
    try:
        c = requests.post(
            url = 'https://rjlmigoly0.execute-api.ap-northeast-2.amazonaws.com/Main/user/add',
            json=data
        )
    except requests.exceptions.RequestException as erra:
        raise HTTPException(status_code=500, detail=str(erra))
    

    if(c.text == "\"Status Code : 200 | OK : Successfully added data \""):
        return "User Register Successfully"
    
    return json.loads(c.text)['message'], 500
