from fastapi import FastAPI, Depends
from fastapi.routing import APIRoute
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware

from apps.webui.routers import (
    auths,
    users,
    configs,
    utils,
    files,
    classrooms,
    children,
    posts,
    regions,
    followers,
    donations,
    referrals,
)

from config import (
    WEBUI_BUILD_HASH,
    SHOW_ADMIN_DETAILS,
    ADMIN_EMAIL,
    WEBUI_AUTH,
    DEFAULT_MODELS,
    DEFAULT_PROMPT_SUGGESTIONS,
    DEFAULT_USER_ROLE,
    ENABLE_SIGNUP,
    USER_PERMISSIONS,
    WEBHOOK_URL,
    WEBUI_AUTH_TRUSTED_EMAIL_HEADER,
    WEBUI_AUTH_TRUSTED_NAME_HEADER,
    JWT_EXPIRES_IN,
    WEBUI_BANNERS,
    ENABLE_COMMUNITY_SHARING,
    AppConfig,
)

import inspect
import uuid
import time
import json

from typing import Iterator, Generator
from pydantic import BaseModel

app = FastAPI()

origins = ["*"]

app.state.config = AppConfig()

app.state.config.ENABLE_SIGNUP = ENABLE_SIGNUP
app.state.config.JWT_EXPIRES_IN = JWT_EXPIRES_IN
app.state.AUTH_TRUSTED_EMAIL_HEADER = WEBUI_AUTH_TRUSTED_EMAIL_HEADER
app.state.AUTH_TRUSTED_NAME_HEADER = WEBUI_AUTH_TRUSTED_NAME_HEADER


app.state.config.SHOW_ADMIN_DETAILS = SHOW_ADMIN_DETAILS
app.state.config.ADMIN_EMAIL = ADMIN_EMAIL


app.state.config.DEFAULT_MODELS = DEFAULT_MODELS
app.state.config.DEFAULT_PROMPT_SUGGESTIONS = DEFAULT_PROMPT_SUGGESTIONS
app.state.config.DEFAULT_USER_ROLE = DEFAULT_USER_ROLE
app.state.config.USER_PERMISSIONS = USER_PERMISSIONS
app.state.config.WEBHOOK_URL = WEBHOOK_URL
app.state.config.BANNERS = WEBUI_BANNERS

app.state.config.ENABLE_COMMUNITY_SHARING = ENABLE_COMMUNITY_SHARING

app.state.MODELS = {}
app.state.TOOLS = {}
app.state.FUNCTIONS = {}

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(configs.router, prefix="/configs", tags=["configs"])
app.include_router(auths.router, prefix="/auths", tags=["auths"])
app.include_router(users.router, prefix="/users", tags=["users"])
app.include_router(files.router, prefix="/files", tags=["files"])
app.include_router(utils.router, prefix="/utils", tags=["utils"])
app.include_router(children.router, prefix="/children", tags=["children"])
app.include_router(classrooms.router, tags=["classrooms"])
app.include_router(posts.router, prefix="/posts", tags=["posts"])
app.include_router(regions.router, prefix="/regions", tags=["regions"])
app.include_router(followers.router, prefix="/followers", tags=["followers"])
app.include_router(donations.router, prefix="/donations", tags=["donations"])
app.include_router(referrals.router, prefix="/referrals", tags=["referrals"])


@app.get("/")
async def get_status():
    return {
        "status": True,
        "auth": WEBUI_AUTH,
        "default_models": app.state.config.DEFAULT_MODELS,
        "default_prompt_suggestions": app.state.config.DEFAULT_PROMPT_SUGGESTIONS,
    }

for r in app.routes:
    try:
        print("ROUTE:", r.path, getattr(r, "methods", None))
    except Exception:
        pass

