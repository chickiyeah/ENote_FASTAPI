from fastapi import FastAPI
app = FastAPI()

from controller import userapi, papagoapi

app.include_router(userapi.userapi)
app.include_router(papagoapi.papagoapi)