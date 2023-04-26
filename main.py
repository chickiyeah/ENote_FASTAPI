from fastapi import FastAPI
from fastapi.security import OAuth2PasswordBearer
import crypto
import sys
import uvicorn
sys.modules['Crypto'] = crypto

from starlette_context import middleware, plugins
from starlette.middleware.cors import CORSMiddleware
from starlette.responses import FileResponse
from starlette.staticfiles import StaticFiles



app = FastAPI()

origins = [
    "http://localhost:8000",
    "http://3.34.125.70:83",
]

app.add_middleware( 
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

from controller import userapi, papagoapi, noteapi, Screen

app.include_router(userapi.userapi)
app.include_router(papagoapi.papagoapi)
app.include_router(noteapi.noteapi)
app.include_router(Screen.ScreenRoute)
app.mount("/static", StaticFiles(directory="FrontSide/assets"))

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=80, reload=True)
