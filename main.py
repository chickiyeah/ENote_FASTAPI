from fastapi import FastAPI
from fastapi.security import OAuth2PasswordBearer
app = FastAPI()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

from controller import userapi, papagoapi

app.include_router(userapi.userapi)
app.include_router(papagoapi.papagoapi)