from fastapi import (
    Depends,
    FastAPI,
    HTTPException,
    status,
    Request,
    UploadFile,
    File,
    Form,
    Header,
)


from datetime import datetime, timedelta
from typing import List, Union, Optional
from pathlib import Path

from fastapi import APIRouter
from fastapi.responses import StreamingResponse, JSONResponse, FileResponse, Response

from pydantic import BaseModel
import json
import io
from PIL import Image
import mimetypes
import aiofiles
import re

from apps.webui.models.files import (
    Files,
    FileForm,
    FileModel,
    FileModelResponse,
)
from utils.utils import get_verified_user, get_admin_user
from constants import ERROR_MESSAGES

from importlib import util
import os
import uuid
import os, shutil, logging, re


from config import SRC_LOG_LEVELS, UPLOAD_DIR


log = logging.getLogger(__name__)
log.setLevel(SRC_LOG_LEVELS["MODELS"])


router = APIRouter()


############################
# Upload File
############################


@router.post("/")
def upload_file(
    file: UploadFile = File(...),
    user=Depends(get_verified_user),
):
    log.info(f"file.content_type: {file.content_type}")
    try:
        unsanitized_filename = file.filename
        filename = os.path.basename(unsanitized_filename)

        # replace filename with uuid
        id = str(uuid.uuid4())
        filename = f"{id}_{filename}"
        file_path = f"{UPLOAD_DIR}/{filename}"

        contents = file.file.read()
        with open(file_path, "wb") as f:
            f.write(contents)
            f.close()

        file = Files.insert_new_file(
            user.id,
            FileForm(
                **{
                    "id": id,
                    "filename": filename,
                    "meta": {
                        "content_type": file.content_type,
                        "size": len(contents),
                        "path": file_path,
                    },
                }
            ),
        )

        if file:
            return file
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=ERROR_MESSAGES.DEFAULT("Error uploading file"),
            )

    except Exception as e:
        log.exception(e)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=ERROR_MESSAGES.DEFAULT(e),
        )


############################
# List Files
############################


@router.get("/", response_model=List[FileModel])
async def list_files(user=Depends(get_verified_user)):
    files = Files.get_files()
    return files


############################
# Delete All Files
############################


@router.delete("/all")
async def delete_all_files(user=Depends(get_admin_user)):
    result = Files.delete_all_files()

    if result:
        folder = f"{UPLOAD_DIR}"
        try:
            # Check if the directory exists
            if os.path.exists(folder):
                # Iterate over all the files and directories in the specified directory
                for filename in os.listdir(folder):
                    file_path = os.path.join(folder, filename)
                    try:
                        if os.path.isfile(file_path) or os.path.islink(file_path):
                            os.unlink(file_path)  # Remove the file or link
                        elif os.path.isdir(file_path):
                            shutil.rmtree(file_path)  # Remove the directory
                    except Exception as e:
                        print(f"Failed to delete {file_path}. Reason: {e}")
            else:
                print(f"The directory {folder} does not exist")
        except Exception as e:
            print(f"Failed to process the directory {folder}. Reason: {e}")

        return {"message": "All files deleted successfully"}
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=ERROR_MESSAGES.DEFAULT("Error deleting files"),
        )


############################
# Get File By Id
############################


@router.get("/{id}", response_model=Optional[FileModel])
async def get_file_by_id(id: str, user=Depends(get_verified_user)):
    file = Files.get_file_by_id(id)

    if file:
        return file
    else:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=ERROR_MESSAGES.NOT_FOUND,
        )
        
@router.post("/image")
async def upload_image(
    file: UploadFile = File(...),
    user=Depends(get_verified_user),
):
    try:
        contents = await file.read()
        image = Image.open(io.BytesIO(contents))
        
        # Generate a unique filename
        id = str(uuid.uuid4())
        filename = f"{id}_{file.filename}"
        file_path = f"{UPLOAD_DIR}/{filename}"
        
        # Save the image
        image.save(file_path)
        
        file_model = Files.insert_new_file(
            user.id,
            FileForm(
                id=id,
                filename=filename,
                meta={
                    "content_type": file.content_type,
                    "size": len(contents),
                    "path": file_path,
                    "width": image.width,
                    "height": image.height,
                },
                file_type="image"
            ),
        )

        if file_model:
            return file_model
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=ERROR_MESSAGES.DEFAULT("Error uploading image"),
            )

    except Exception as e:
        log.exception(e)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=ERROR_MESSAGES.DEFAULT(str(e)),
        )

@router.get("/image/{id}")
async def get_image(id: str, user=Depends(get_verified_user)):
    file = Files.get_file_by_id(id)

    if file and (file.file_type == "image" or file.meta.get("content_type", "").startswith("image")):
        file_path = Path(file.meta["path"])

        if file_path.is_file():
            return FileResponse(file_path, media_type=file.meta["content_type"])
        else:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=ERROR_MESSAGES.NOT_FOUND,
            )
    else:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=ERROR_MESSAGES.NOT_FOUND,
        )

############################
# Get File Content By Id
############################


@router.get("/{id}/content", response_model=Optional[FileModel])
async def get_file_content_by_id(id: str,
                                #  user=Depends(get_verified_user)
                                 ):
    file = Files.get_file_by_id(id)

    if file:
        file_path = Path(file.meta["path"])

        # Check if the file already exists in the cache
        if file_path.is_file():
            print(f"file_path: {file_path}")
            return FileResponse(file_path)
        else:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=ERROR_MESSAGES.NOT_FOUND,
            )
    else:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=ERROR_MESSAGES.NOT_FOUND,
        )


@router.get("/{id}/content/{file_name}", response_model=Optional[FileModel])
async def get_file_content_by_id(id: str, user=Depends(get_verified_user)):
    file = Files.get_file_by_id(id)

    if file:
        file_path = Path(file.meta["path"])

        # Check if the file already exists in the cache
        if file_path.is_file():
            print(f"file_path: {file_path}")
            return FileResponse(file_path)
        else:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=ERROR_MESSAGES.NOT_FOUND,
            )
    else:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=ERROR_MESSAGES.NOT_FOUND,
        )


############################
# Delete File By Id
############################


@router.delete("/{id}")
async def delete_file_by_id(id: str, user=Depends(get_verified_user)):
    file = Files.get_file_by_id(id)

    if file:
        result = Files.delete_file_by_id(id)
        if result:
            return {"message": "File deleted successfully"}
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=ERROR_MESSAGES.DEFAULT("Error deleting file"),
            )
    else:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=ERROR_MESSAGES.NOT_FOUND,
        )


############################
# Upload Video
############################


@router.post("/video")
async def upload_video(
    file: UploadFile = File(...),
    user=Depends(get_verified_user),
):
    """
    Upload a video file. Accepts common video formats.
    """
    try:
        # Validate video file type
        allowed_types = ["video/mp4", "video/mpeg", "video/quicktime", "video/x-msvideo", "video/webm"]
        if file.content_type not in allowed_types:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid file type. Allowed types: {', '.join(allowed_types)}"
            )
        
        # Generate unique filename
        id = str(uuid.uuid4())
        filename = f"{id}_{os.path.basename(file.filename)}"
        file_path = f"{UPLOAD_DIR}/{filename}"
        
        # Save video file
        contents = await file.read()
        with open(file_path, "wb") as f:
            f.write(contents)
        
        # Store metadata in database
        file_model = Files.insert_new_file(
            user.id,
            FileForm(
                id=id,
                filename=filename,
                meta={
                    "content_type": file.content_type,
                    "size": len(contents),
                    "path": file_path,
                },
                file_type="video"
            ),
        )
        
        if file_model:
            return file_model
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=ERROR_MESSAGES.DEFAULT("Error uploading video"),
            )
    
    except Exception as e:
        log.exception(e)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=ERROR_MESSAGES.DEFAULT(str(e)),
        )


############################
# Stream Video with Range Support
############################


@router.get("/video/{id}/stream")
async def stream_video(
    id: str,
    range: Optional[str] = Header(None),
    # user=Depends(get_verified_user)
):
    """
    Stream video with support for HTTP range requests.
    This enables video seeking and efficient streaming.
    """
    file = Files.get_file_by_id(id)
    
    if not file:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=ERROR_MESSAGES.NOT_FOUND,
        )
    
    # Verify it's a video file
    if file.file_type != "video" and not file.meta.get("content_type", "").startswith("video"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File is not a video",
        )
    
    file_path = Path(file.meta["path"])
    
    if not file_path.is_file():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=ERROR_MESSAGES.NOT_FOUND,
        )
    
    file_size = file_path.stat().st_size
    
    # Handle range request for video seeking
    if range:
        # Parse range header (e.g., "bytes=0-1023")
        range_match = re.search(r'bytes=(\d+)-(\d*)', range)
        if range_match:
            start = int(range_match.group(1))
            end = int(range_match.group(2)) if range_match.group(2) else file_size - 1
            
            # Ensure valid range
            start = min(start, file_size - 1)
            end = min(end, file_size - 1)
            
            # Read the requested chunk
            async def stream_chunk():
                async with aiofiles.open(file_path, 'rb') as video_file:
                    await video_file.seek(start)
                    chunk_size = 8192  # 8KB chunks
                    current = start
                    
                    while current <= end:
                        read_size = min(chunk_size, end - current + 1)
                        data = await video_file.read(read_size)
                        if not data:
                            break
                        current += len(data)
                        yield data
            
            headers = {
                'Content-Range': f'bytes {start}-{end}/{file_size}',
                'Accept-Ranges': 'bytes',
                'Content-Length': str(end - start + 1),
                'Content-Type': file.meta.get("content_type", "video/mp4"),
            }
            
            return StreamingResponse(
                stream_chunk(),
                status_code=206,  # Partial Content
                headers=headers,
                media_type=file.meta.get("content_type", "video/mp4")
            )
    
    # No range request - stream entire file
    async def stream_file():
        async with aiofiles.open(file_path, 'rb') as video_file:
            chunk_size = 8192  # 8KB chunks
            while True:
                data = await video_file.read(chunk_size)
                if not data:
                    break
                yield data
    
    headers = {
        'Accept-Ranges': 'bytes',
        'Content-Length': str(file_size),
        'Content-Type': file.meta.get("content_type", "video/mp4"),
    }
    
    return StreamingResponse(
        stream_file(),
        headers=headers,
        media_type=file.meta.get("content_type", "video/mp4")
    )
