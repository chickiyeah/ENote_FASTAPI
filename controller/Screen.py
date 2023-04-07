from fastapi import APIRouter, Request

from fastapi.responses import HTMLResponse, PlainTextResponse
from fastapi.templating import Jinja2Templates # html 템플레이트 로더
templates = Jinja2Templates(directory="FrontSide/templates")

ScreenRoute = APIRouter(prefix="",tags=["Screens"])

@ScreenRoute.get("/")
async def index(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@ScreenRoute.get("/header")
async def header(request: Request):
    return templates.TemplateResponse("header.html", {"request": request})

@ScreenRoute.get("/footer")
async def footer(request: Request):
    return templates.TemplateResponse("footer.html", {"request": request})

@ScreenRoute.get("/register")
async def login(request: Request):
    return templates.TemplateResponse("join.html", {"request": request})

@ScreenRoute.get("/login")
async def login(request: Request):
    return templates.TemplateResponse("login.html", {"request": request})

@ScreenRoute.get("/storybook")
async def story(request: Request):
    return templates.TemplateResponse("storybook.html", {"request": request})

@ScreenRoute.get("/storybook/detail")
async def story(request: Request):
    return templates.TemplateResponse("storybook_detail.html", {"request": request})

@ScreenRoute.get("/word")
async def word(request: Request):
    return templates.TemplateResponse("word.html", {"request": request})

@ScreenRoute.get("/word/success")
async def word_success(request: Request):
    return templates.TemplateResponse("word_success.html", {"request": request})

@ScreenRoute.get("/word/failure")
async def word_failure(request: Request):
    return templates.TemplateResponse("word_failed.html", {"request": request})

@ScreenRoute.get("/mypage")
async def mypage(request: Request):
    return templates.TemplateResponse("account.html", {"request": request})

@ScreenRoute.get("/mypage/unregister")
async def unregister(request: Request):
    return templates.TemplateResponse("secession.html", {"request": request})

@ScreenRoute.get("/calender")
async def calender(request: Request):
    return templates.TemplateResponse("calendar.html", {"request": request})

@ScreenRoute.get("/robots.txt", response_class=PlainTextResponse)
async def robots(request: Request):
    data = """User-agent: *\nDisallow: /api\nDisallow: /docs\nAllow: /"""
    return data