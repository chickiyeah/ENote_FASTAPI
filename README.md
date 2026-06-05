# ENote

FastAPI 기반 **노트(메모) 앱**. 노트 작성·관리에 **Papago 번역**을 연동했다. OAuth2/JWT 인증 + 정적 프론트(FrontSide).

## 기술 스택
- **백엔드**: FastAPI + Uvicorn (Starlette, starlette-context)
- **DB**: MySQL (PyMySQL) + SQLAlchemy
- **인증**: OAuth2 + JWT (PyJWT), 암호화(pycryptodome)
- **외부 연동**: Papago 번역 API (httpx)
- **프론트**: `FrontSide/` (JS/HTML/CSS), StaticFiles로 서빙
- **기타**: CORS

## 주요 기능
- **노트 CRUD** (noteapi)
- **번역** — Papago 연동 (papagoapi)
- **회원/인증** — OAuth2 (userapi)
- **화면 라우팅** (Screen)

## 실행
```
pip install -r requirements.txt
uvicorn main:app --reload
```
`.env`(또는 설정)에 MySQL 접속·JWT 시크릿·**Papago API 키**(Client ID/Secret) 설정 — 실제 값 커밋 금지.

## 디렉터리
- `main.py` — FastAPI 엔트리 (라우터 등록 + 정적 마운트)
- `controller/` — 라우터·로직 (userapi, noteapi, papagoapi, Screen, database)
- `FrontSide/` — 프론트엔드
