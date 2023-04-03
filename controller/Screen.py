from fastapi import APIRouter, Request

from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates # html 템플레이트 로더
templates = Jinja2Templates(directory="FrontSide/templates")

ScreenRoute = APIRouter(prefix="",tags=["Screens"])

@ScreenRoute.get("/test")
async def index(request: Request):
    return templates.TemplateResponse("test.html", {"request": request})

@ScreenRoute.get("/")
async def index(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})