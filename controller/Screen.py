from fastapi import APIRouter, Request

from fastapi.responses import HTMLResponse, PlainTextResponse
from fastapi.templating import Jinja2Templates # html 템플레이트 로더
templates = Jinja2Templates(directory="FrontSide/templates")

ScreenRoute = APIRouter(prefix="",tags=["Screens"])

@ScreenRoute.get("/test")
async def index(request: Request):
    return templates.TemplateResponse("test.html", {"request": request})

@ScreenRoute.get("/")
async def index(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@ScreenRoute.get("/robots.txt", response_class=PlainTextResponse)
async def robots(request: Request):
    data = """User-agent: *\nDisallow: /api\nDisallow: /docs\nAllow: /"""
    return data