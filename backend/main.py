import base64
import uuid
from contextlib import asynccontextmanager

from authlib.integrations.starlette_client import OAuth
from authlib.oidc.core import UserInfo
from bs4 import BeautifulSoup
import json
import markdown
import time
import os
import sys
import logging
import aiohttp
import requests
import mimetypes
import shutil
import os
import uuid
import inspect
import asyncio

from fastapi import FastAPI, Request, Depends, status, UploadFile, File, Form
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from fastapi import HTTPException
from fastapi.middleware.wsgi import WSGIMiddleware
from fastapi.middleware.cors import CORSMiddleware
from starlette.exceptions import HTTPException as StarletteHTTPException
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.middleware.sessions import SessionMiddleware
from starlette.responses import StreamingResponse, Response, RedirectResponse


from apps.socket.main import app as socket_app


from apps.webui.main import (
    app as webui_app,
)


from pydantic import BaseModel
from typing import List, Optional, Iterator, Generator, Union

from apps.webui.models.auths import Auths
from apps.webui.models.users import Users


from utils.utils import (
    get_admin_user,
    get_verified_user,
    get_current_user,
    get_http_authorization_cred,
    get_password_hash,
    create_token,
)

from utils.misc import (
    parse_duration,
)


from config import (
    WEBUI_NAME,
    WEBUI_URL,
    WEBUI_AUTH,
    ENV,
    VERSION,
    CHANGELOG,
    FRONTEND_BUILD_DIR,
    CACHE_DIR,
    STATIC_DIR,
    DEFAULT_LOCALE,
    GLOBAL_LOG_LEVEL,
    SRC_LOG_LEVELS,
    WEBHOOK_URL,
    ENABLE_ADMIN_EXPORT,
    OAUTH_PROVIDERS,
    ENABLE_OAUTH_SIGNUP,
    OAUTH_MERGE_ACCOUNTS_BY_EMAIL,
    WEBUI_SECRET_KEY,
    WEBUI_SESSION_COOKIE_SAME_SITE,
    WEBUI_SESSION_COOKIE_SECURE,
    AppConfig,
)
from constants import ERROR_MESSAGES, WEBHOOK_MESSAGES
from utils.webhook import post_webhook


logging.basicConfig(stream=sys.stdout, level=GLOBAL_LOG_LEVEL)
log = logging.getLogger(__name__)
log.setLevel(SRC_LOG_LEVELS["MAIN"])


class SPAStaticFiles(StaticFiles):
    async def get_response(self, path: str, scope):
        try:
            return await super().get_response(path, scope)
        except (HTTPException, StarletteHTTPException) as ex:
            if ex.status_code == 404:
                return await super().get_response("index.html", scope)
            else:
                raise ex


print(
    rf"""
v{VERSION} - building the best AI user interface.
"""
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    yield


app = FastAPI(
    docs_url="/docs" if ENV == "dev" else None, redoc_url=None, lifespan=lifespan
)

app.state.config = AppConfig()


app.state.config.WEBHOOK_URL = WEBHOOK_URL


app.state.MODELS = {}

origins = ["*"]


app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def check_url(request: Request, call_next):
    if len(app.state.MODELS) == 0:
        # await get_all_models()
        pass
    else:
        pass

    start_time = int(time.time())
    response = await call_next(request)
    process_time = int(time.time()) - start_time
    response.headers["X-Process-Time"] = str(process_time)

    return response


app.mount("/ws", socket_app)
app.mount("/api/v1", webui_app)



##################################
#
# Config Endpoints
#
##################################


@app.get("/api/config")
async def get_app_config():
    return {
        "status": True,
        "name": WEBUI_NAME,
        "version": VERSION,
        "default_locale": str(DEFAULT_LOCALE),
        "default_models": webui_app.state.config.DEFAULT_MODELS,
        "default_prompt_suggestions": webui_app.state.config.DEFAULT_PROMPT_SUGGESTIONS,
        "features": {
            "auth": WEBUI_AUTH,
            "auth_trusted_header": bool(webui_app.state.AUTH_TRUSTED_EMAIL_HEADER),
            "enable_signup": webui_app.state.config.ENABLE_SIGNUP,
            "enable_community_sharing": webui_app.state.config.ENABLE_COMMUNITY_SHARING,
            "enable_admin_export": ENABLE_ADMIN_EXPORT,
        },
        "oauth": {
            "providers": {
                name: config.get("name", name)
                for name, config in OAUTH_PROVIDERS.items()
            }
        },
    }


@app.get("/api/webhook")
async def get_webhook_url(user=Depends(get_admin_user)):
    return {
        "url": app.state.config.WEBHOOK_URL,
    }


class UrlForm(BaseModel):
    url: str


@app.post("/api/webhook")
async def update_webhook_url(form_data: UrlForm, user=Depends(get_admin_user)):
    app.state.config.WEBHOOK_URL = form_data.url
    webui_app.state.WEBHOOK_URL = app.state.config.WEBHOOK_URL
    return {"url": app.state.config.WEBHOOK_URL}


@app.get("/api/version")
async def get_app_config():
    return {
        "version": VERSION,
    }


@app.get("/api/changelog")
async def get_app_changelog():
    return {key: CHANGELOG[key] for idx, key in enumerate(CHANGELOG) if idx < 5}


@app.get("/api/version/updates")
async def get_app_latest_release_version():
    try:
        async with aiohttp.ClientSession(trust_env=True) as session:
            async with session.get(
                "https://api.github.com/repos/open-webui/open-webui/releases/latest"
            ) as response:
                response.raise_for_status()
                data = await response.json()
                latest_version = data["tag_name"]

                return {"current": VERSION, "latest": latest_version[1:]}
    except aiohttp.ClientError as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=ERROR_MESSAGES.RATE_LIMIT_EXCEEDED,
        )


############################
# OAuth Login & Callback
############################

oauth = OAuth()

for provider_name, provider_config in OAUTH_PROVIDERS.items():
    oauth.register(
        name=provider_name,
        client_id=provider_config["client_id"],
        client_secret=provider_config["client_secret"],
        server_metadata_url=provider_config["server_metadata_url"],
        client_kwargs={
            "scope": provider_config["scope"],
        },
    )

# SessionMiddleware is used by authlib for oauth
if len(OAUTH_PROVIDERS) > 0:
    app.add_middleware(
        SessionMiddleware,
        secret_key=WEBUI_SECRET_KEY,
        session_cookie="oui-session",
        same_site=WEBUI_SESSION_COOKIE_SAME_SITE,
        https_only=WEBUI_SESSION_COOKIE_SECURE,
    )


@app.get("/oauth/{provider}/login")
async def oauth_login(provider: str, request: Request):
    if provider not in OAUTH_PROVIDERS:
        raise HTTPException(404)
    redirect_uri = request.url_for("oauth_callback", provider=provider)
    return await oauth.create_client(provider).authorize_redirect(request, redirect_uri)


# OAuth login logic is as follows:
# 1. Attempt to find a user with matching subject ID, tied to the provider
# 2. If OAUTH_MERGE_ACCOUNTS_BY_EMAIL is true, find a user with the email address provided via OAuth
#    - This is considered insecure in general, as OAuth providers do not always verify email addresses
# 3. If there is no user, and ENABLE_OAUTH_SIGNUP is true, create a user
#    - Email addresses are considered unique, so we fail registration if the email address is alreayd taken
@app.get("/oauth/{provider}/callback")
async def oauth_callback(provider: str, request: Request, response: Response):
    if provider not in OAUTH_PROVIDERS:
        raise HTTPException(404)
    client = oauth.create_client(provider)
    try:
        token = await client.authorize_access_token(request)
    except Exception as e:
        log.warning(f"OAuth callback error: {e}")
        raise HTTPException(400, detail=ERROR_MESSAGES.INVALID_CRED)
    user_data: UserInfo = token["userinfo"]

    sub = user_data.get("sub")
    if not sub:
        log.warning(f"OAuth callback failed, sub is missing: {user_data}")
        raise HTTPException(400, detail=ERROR_MESSAGES.INVALID_CRED)
    provider_sub = f"{provider}@{sub}"
    email = user_data.get("email", "").lower()
    # We currently mandate that email addresses are provided
    if not email:
        log.warning(f"OAuth callback failed, email is missing: {user_data}")
        raise HTTPException(400, detail=ERROR_MESSAGES.INVALID_CRED)

    # Check if the user exists
    user = Users.get_user_by_oauth_sub(provider_sub)

    if not user:
        # If the user does not exist, check if merging is enabled
        if OAUTH_MERGE_ACCOUNTS_BY_EMAIL.value:
            # Check if the user exists by email
            user = Users.get_user_by_email(email)
            if user:
                # Update the user with the new oauth sub
                Users.update_user_oauth_sub_by_id(user.id, provider_sub)

    if not user:
        # If the user does not exist, check if signups are enabled
        if ENABLE_OAUTH_SIGNUP.value:
            # Check if an existing user with the same email already exists
            existing_user = Users.get_user_by_email(user_data.get("email", "").lower())
            if existing_user:
                raise HTTPException(400, detail=ERROR_MESSAGES.EMAIL_TAKEN)

            picture_url = user_data.get("picture", "")
            if picture_url:
                # Download the profile image into a base64 string
                try:
                    async with aiohttp.ClientSession() as session:
                        async with session.get(picture_url) as resp:
                            picture = await resp.read()
                            base64_encoded_picture = base64.b64encode(picture).decode(
                                "utf-8"
                            )
                            guessed_mime_type = mimetypes.guess_type(picture_url)[0]
                            if guessed_mime_type is None:
                                # assume JPG, browsers are tolerant enough of image formats
                                guessed_mime_type = "image/jpeg"
                            picture_url = f"data:{guessed_mime_type};base64,{base64_encoded_picture}"
                except Exception as e:
                    log.error(f"Error downloading profile image '{picture_url}': {e}")
                    picture_url = ""
            if not picture_url:
                picture_url = "/user.png"
            role = (
                "admin"
                if Users.get_num_users() == 0
                else webui_app.state.config.DEFAULT_USER_ROLE
            )
            user = Auths.insert_new_auth(
                email=email,
                password=get_password_hash(
                    str(uuid.uuid4())
                ),  # Random password, not used
                name=user_data.get("name", "User"),
                profile_image_url=picture_url,
                role=role,
                oauth_sub=provider_sub,
            )

            if webui_app.state.config.WEBHOOK_URL:
                post_webhook(
                    webui_app.state.config.WEBHOOK_URL,
                    WEBHOOK_MESSAGES.USER_SIGNUP(user.name),
                    {
                        "action": "signup",
                        "message": WEBHOOK_MESSAGES.USER_SIGNUP(user.name),
                        "user": user.model_dump_json(exclude_none=True),
                    },
                )
        else:
            raise HTTPException(
                status.HTTP_403_FORBIDDEN, detail=ERROR_MESSAGES.ACCESS_PROHIBITED
            )

    jwt_token = create_token(
        data={"id": user.id},
        expires_delta=parse_duration(webui_app.state.config.JWT_EXPIRES_IN),
    )

    # Set the cookie token
    response.set_cookie(
        key="token",
        value=jwt_token,
        httponly=True,  # Ensures the cookie is not accessible via JavaScript
    )

    # Redirect back to the frontend with the JWT token
    redirect_url = f"{request.base_url}auth#token={jwt_token}"
    return RedirectResponse(url=redirect_url)


@app.get("/manifest.json")
async def get_manifest_json():
    return {
        "name": WEBUI_NAME,
        "short_name": WEBUI_NAME,
        "start_url": "/",
        "display": "standalone",
        "background_color": "#343541",
        "orientation": "portrait-primary",
        "icons": [{"src": "/static/logo.png", "type": "image/png", "sizes": "500x500"}],
    }


@app.get("/opensearch.xml")
async def get_opensearch_xml():
    xml_content = rf"""
    <OpenSearchDescription xmlns="http://a9.com/-/spec/opensearch/1.1/" xmlns:moz="http://www.mozilla.org/2006/browser/search/">
    <ShortName>{WEBUI_NAME}</ShortName>
    <Description>Search {WEBUI_NAME}</Description>
    <InputEncoding>UTF-8</InputEncoding>
    <Image width="16" height="16" type="image/x-icon">{WEBUI_URL}/favicon.png</Image>
    <Url type="text/html" method="get" template="{WEBUI_URL}/?q={"{searchTerms}"}"/>
    <moz:SearchForm>{WEBUI_URL}</moz:SearchForm>
    </OpenSearchDescription>
    """
    return Response(content=xml_content, media_type="application/xml")


@app.get("/health")
async def healthcheck():
    return {"status": True}


app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")
app.mount("/cache", StaticFiles(directory=CACHE_DIR), name="cache")

if os.path.exists(FRONTEND_BUILD_DIR):
    mimetypes.add_type("text/javascript", ".js")
    app.mount(
        "/",
        SPAStaticFiles(directory=FRONTEND_BUILD_DIR, html=True),
        name="spa-static-files",
    )
else:
    log.warning(
        f"Frontend build directory not found at '{FRONTEND_BUILD_DIR}'. Serving API only."
    )
