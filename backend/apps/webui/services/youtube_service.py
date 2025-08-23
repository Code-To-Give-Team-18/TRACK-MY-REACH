import os
import json
import logging
from typing import Optional, Dict, Any, List
from datetime import datetime
import pickle
from pathlib import Path

from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from googleapiclient.http import MediaFileUpload

logger = logging.getLogger(__name__)

class YouTubeService:
    SCOPES = ['https://www.googleapis.com/auth/youtube.upload',
              'https://www.googleapis.com/auth/youtube']
    
    def __init__(self, credentials_file: str = None, token_file: str = None):
        # Use absolute paths to ensure files are found
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
        self.credentials_file = credentials_file or os.getenv('YOUTUBE_CREDENTIALS_FILE', os.path.join(base_dir, 'youtube_credentials.json'))
        self.token_file = token_file or os.getenv('YOUTUBE_TOKEN_FILE', os.path.join(base_dir, 'youtube_token.pickle'))
        
        logger.info(f"YouTube Service initializing...")
        logger.info(f"Credentials file: {self.credentials_file}")
        logger.info(f"Token file: {self.token_file}")
        logger.info(f"Credentials exists: {os.path.exists(self.credentials_file)}")
        logger.info(f"Token exists: {os.path.exists(self.token_file)}")
        
        self.youtube = None
        self._authenticate()
    
    def _authenticate(self):
        """Authenticate and build YouTube service"""
        creds = None
        
        # Load saved token
        if os.path.exists(self.token_file):
            with open(self.token_file, 'rb') as token:
                creds = pickle.load(token)
        
        # Refresh or get new token
        if not creds or not creds.valid:
            if creds and creds.expired and creds.refresh_token:
                creds.refresh(Request())
            else:
                if not os.path.exists(self.credentials_file):
                    raise FileNotFoundError(
                        f"YouTube credentials file not found: {self.credentials_file}. "
                        "Please set up OAuth2 credentials in Google Cloud Console."
                    )
                
                flow = InstalledAppFlow.from_client_secrets_file(
                    self.credentials_file, self.SCOPES)
                creds = flow.run_local_server(port=0)
            
            # Save token for future use
            with open(self.token_file, 'wb') as token:
                pickle.dump(creds, token)
        
        self.youtube = build('youtube', 'v3', credentials=creds)
    
    def upload_video(
        self,
        video_path: str,
        title: str,
        description: str,
        tags: List[str] = None,
        category_id: str = "29",  # Nonprofits & Activism
        privacy_status: str = "public",
        thumbnail_path: Optional[str] = None,
        child_name: Optional[str] = None,
        post_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Upload a video to YouTube
        
        Args:
            video_path: Path to video file
            title: Video title (max 100 chars)
            description: Video description (max 5000 chars)
            tags: List of tags
            category_id: YouTube category ID
            privacy_status: 'private', 'unlisted', or 'public'
            thumbnail_path: Optional custom thumbnail
            child_name: Optional child name for tracking
            post_id: Optional post ID for linking
        
        Returns:
            Dict with video_id, url, and upload details
        """
        try:
            # Prepare metadata
            tags = tags or []
            if child_name:
                tags.append(f"child:{child_name}")
            if post_id:
                tags.append(f"post:{post_id}")
            
            # Add charity-specific tags
            tags.extend(['charity', 'donation', 'children', 'education', 'ProjectReach'])
            
            # Format description with donation link
            formatted_description = self._format_description(description, child_name, post_id)
            
            body = {
                'snippet': {
                    'title': title[:100],  # YouTube title limit
                    'description': formatted_description[:5000],  # YouTube description limit
                    'tags': tags[:500],  # YouTube tag limit
                    'categoryId': category_id
                },
                'status': {
                    'privacyStatus': privacy_status,
                    'selfDeclaredMadeForKids': False  # For COPPA compliance
                }
            }
            
            # Upload video
            insert_request = self.youtube.videos().insert(
                part=','.join(body.keys()),
                body=body,
                media_body=MediaFileUpload(
                    video_path,
                    chunksize=-1,
                    resumable=True
                )
            )
            
            response = self._resumable_upload(insert_request)
            
            if response:
                video_id = response['id']
                video_url = f"https://www.youtube.com/watch?v={video_id}"
                
                # Upload thumbnail if provided
                if thumbnail_path and os.path.exists(thumbnail_path):
                    self._upload_thumbnail(video_id, thumbnail_path)
                
                # Create playlist for child if doesn't exist
                if child_name:
                    playlist_id = self._get_or_create_playlist(child_name)
                    self._add_to_playlist(video_id, playlist_id)
                
                return {
                    'success': True,
                    'video_id': video_id,
                    'url': video_url,
                    'title': response['snippet']['title'],
                    'description': response['snippet']['description'],
                    'published_at': response['snippet']['publishedAt'],
                    'privacy_status': response['status']['privacyStatus']
                }
            
            return {'success': False, 'error': 'Upload failed - no response'}
            
        except HttpError as e:
            logger.error(f"YouTube API error: {e}")
            return {'success': False, 'error': str(e)}
        except Exception as e:
            logger.error(f"Upload error: {e}")
            return {'success': False, 'error': str(e)}
    
    def _resumable_upload(self, insert_request):
        """Handle resumable upload with retry logic"""
        response = None
        error = None
        retry = 0
        max_retries = 3
        
        while response is None:
            try:
                status, response = insert_request.next_chunk()
                if response is not None:
                    if 'id' in response:
                        logger.info(f"Video uploaded successfully: {response['id']}")
                        return response
                    else:
                        raise Exception(f"Upload failed: {response}")
            except HttpError as e:
                if e.resp.status in [500, 502, 503, 504]:
                    error = f"HTTP {e.resp.status} error"
                    retry += 1
                    if retry > max_retries:
                        raise
                    logger.warning(f"Retrying upload ({retry}/{max_retries})...")
                else:
                    raise
            except Exception as e:
                logger.error(f"Upload error: {e}")
                raise
        
        return response
    
    def _format_description(self, description: str, child_name: Optional[str], post_id: Optional[str]) -> str:
        """Format video description with donation links and metadata"""
        base_url = os.getenv('FRONTEND_URL', 'https://commitokids.org')
        
        formatted = f"{description}\n\n"
        formatted += "=" * 50 + "\n"
        formatted += "📚 About Project Reach\n"
        formatted += "We help underprivileged children access quality education.\n\n"
        
        if child_name:
            formatted += f"👦 This video features: {child_name}\n"
            formatted += f"Support {child_name}'s education: {base_url}/children/{child_name}\n\n"
        
        formatted += "💝 Make a Difference\n"
        formatted += f"Donate: {base_url}/donate\n"
        formatted += f"Learn more: {base_url}/about\n\n"
        
        formatted += "#Charity #Education #Children #Donation #ProjectReach"
        
        if post_id:
            formatted += f"\n\n[Post ID: {post_id}]"
        
        return formatted
    
    def _upload_thumbnail(self, video_id: str, thumbnail_path: str):
        """Upload custom thumbnail for video"""
        try:
            self.youtube.thumbnails().set(
                videoId=video_id,
                media_body=MediaFileUpload(thumbnail_path)
            ).execute()
            logger.info(f"Thumbnail uploaded for video {video_id}")
        except Exception as e:
            logger.error(f"Thumbnail upload failed: {e}")
    
    def _get_or_create_playlist(self, child_name: str) -> str:
        """Get or create a playlist for a specific child"""
        playlist_title = f"{child_name}'s Journey - Project Reach"
        
        # Search for existing playlist
        request = self.youtube.playlists().list(
            part="snippet",
            mine=True,
            maxResults=50
        )
        response = request.execute()
        
        for item in response.get('items', []):
            if item['snippet']['title'] == playlist_title:
                return item['id']
        
        # Create new playlist
        body = {
            'snippet': {
                'title': playlist_title,
                'description': f"Follow {child_name}'s educational journey with Project Reach",
                'tags': ['charity', 'education', child_name],
                'defaultLanguage': 'en'
            },
            'status': {
                'privacyStatus': 'public'
            }
        }
        
        response = self.youtube.playlists().insert(
            part="snippet,status",
            body=body
        ).execute()
        
        return response['id']
    
    def _add_to_playlist(self, video_id: str, playlist_id: str):
        """Add video to playlist"""
        try:
            body = {
                'snippet': {
                    'playlistId': playlist_id,
                    'resourceId': {
                        'kind': 'youtube#video',
                        'videoId': video_id
                    }
                }
            }
            
            self.youtube.playlistItems().insert(
                part="snippet",
                body=body
            ).execute()
            logger.info(f"Added video {video_id} to playlist {playlist_id}")
        except Exception as e:
            logger.error(f"Failed to add to playlist: {e}")
    
    def create_shorts_from_video(
        self,
        video_path: str,
        title: str,
        description: str,
        duration: int = 60,
        child_name: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        Create YouTube Shorts from longer video
        
        Args:
            video_path: Path to source video
            title: Base title for shorts
            description: Base description
            duration: Max duration for each short (max 60 seconds)
            child_name: Optional child name
        
        Returns:
            List of upload results
        """
        # This would require video processing with ffmpeg
        # Implementation would split video into 60-second segments
        # and upload each as a Short with #Shorts tag
        pass
    
    def get_video_analytics(self, video_id: str) -> Dict[str, Any]:
        """Get analytics for uploaded video"""
        try:
            response = self.youtube.videos().list(
                part="statistics,snippet",
                id=video_id
            ).execute()
            
            if response['items']:
                item = response['items'][0]
                return {
                    'video_id': video_id,
                    'title': item['snippet']['title'],
                    'views': int(item['statistics'].get('viewCount', 0)),
                    'likes': int(item['statistics'].get('likeCount', 0)),
                    'comments': int(item['statistics'].get('commentCount', 0)),
                    'published_at': item['snippet']['publishedAt']
                }
            return {}
        except Exception as e:
            logger.error(f"Failed to get analytics: {e}")
            return {}
    
    def schedule_upload(
        self,
        video_path: str,
        title: str,
        description: str,
        scheduled_time: datetime,
        **kwargs
    ) -> Dict[str, Any]:
        """Schedule a video for future publication"""
        # Set as private initially
        result = self.upload_video(
            video_path=video_path,
            title=title,
            description=description,
            privacy_status='private',
            **kwargs
        )
        
        if result['success']:
            # Schedule publication time
            body = {
                'status': {
                    'privacyStatus': 'private',
                    'publishAt': scheduled_time.isoformat() + 'Z'
                }
            }
            
            try:
                self.youtube.videos().update(
                    part="status",
                    body={'id': result['video_id'], **body}
                ).execute()
                
                result['scheduled_for'] = scheduled_time.isoformat()
                logger.info(f"Video {result['video_id']} scheduled for {scheduled_time}")
            except Exception as e:
                logger.error(f"Failed to schedule video: {e}")
        
        return result