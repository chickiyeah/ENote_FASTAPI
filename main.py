from fastapi import FastAPI
app = FastAPI()

from controller import userapi

app.include_router(userapi.userapi)