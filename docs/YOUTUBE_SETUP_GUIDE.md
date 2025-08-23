# YouTube Integration Setup Guide

## Overview
This guide helps you set up automatic YouTube uploads for your charity posts, enabling maximum donor reach and engagement.

## Prerequisites
1. A Google account with YouTube channel
2. Google Cloud Console access
3. Admin access to the charity platform

## Step 1: Google Cloud Console Setup

### 1.1 Create a Project
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Click "Select a project" → "New Project"
3. Name it "CommitToKids-YouTube" 
4. Click "Create"

### 1.2 Enable YouTube Data API v3
1. In your project, go to "APIs & Services" → "Library"
2. Search for "YouTube Data API v3"
3. Click on it and press "Enable"

### 1.3 Create OAuth 2.0 Credentials
1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth client ID"
3. If prompted, configure OAuth consent screen:
   - User Type: External
   - App name: "Commit to Kids YouTube Uploader"
   - Support email: Your email
   - Authorized domains: Your domain
   - Scopes: Add `youtube.upload` and `youtube`
4. For Application type, choose "Desktop app"
5. Name it "YouTube Uploader"
6. Click "Create"
7. Download the credentials JSON file

## Step 2: Backend Configuration

### 2.1 Environment Variables
Add these to your `.env` file:
```bash
# YouTube Integration
YOUTUBE_AUTO_UPLOAD=true
YOUTUBE_CREDENTIALS_FILE=/path/to/credentials.json
YOUTUBE_TOKEN_FILE=/path/to/youtube_token.pickle
```

### 2.2 First-Time Authentication
1. Place the downloaded credentials JSON in your backend directory
2. Run this Python script once to authenticate:

```python
from apps.webui.services.youtube_service import YouTubeService

# This will open a browser for authentication
service = YouTubeService(
    credentials_file='path/to/credentials.json',
    token_file='youtube_token.pickle'
)
print("Authentication successful!")
```

3. Complete the OAuth flow in your browser
4. The token will be saved for future use

## Step 3: YouTube Channel Setup

### 3.1 Channel Optimization
1. Go to [YouTube Studio](https://studio.youtube.com)
2. Customize your channel:
   - Channel name: "Project Reach - Commit to Kids"
   - Channel description: Include donation links
   - Channel art: Upload charity branding
   - About section: Add website and donation info

### 3.2 Create Playlists Structure
The system automatically creates playlists for each child, but you can also create:
- "Success Stories"
- "Monthly Updates"
- "Impact Videos"
- "Donor Testimonials"

### 3.3 End Screens & Cards
Set up templates for:
- Donation call-to-action cards
- Subscribe reminders
- Website links
- Related video suggestions

## Step 4: Usage

### 4.1 Automatic Upload
When `YOUTUBE_AUTO_UPLOAD=true`:
- Posts with videos automatically upload to YouTube
- Creates child-specific playlists
- Adds donation links in descriptions
- Tags videos appropriately

### 4.2 Manual Upload
For existing posts:
1. Go to Post Management
2. Find the post with video
3. Click "Upload to YouTube" button
4. Check status in YouTube Studio

### 4.3 Monitoring Uploads
Check logs for upload status:
```bash
tail -f backend/logs/youtube_uploads.log
```

## Step 5: Best Practices

### 5.1 Video Optimization
- **Titles**: Keep under 60 characters, include child name
- **Descriptions**: Include story, impact, donation links
- **Thumbnails**: Use high-quality images showing children's progress
- **Tags**: Include: charity, education, children, donation, location

### 5.2 Content Guidelines
- Respect children's privacy (blur faces if needed)
- Include success metrics in descriptions
- Add subtitles for accessibility
- Keep videos under 5 minutes for better engagement

### 5.3 Engagement Strategy
- Post consistently (weekly updates)
- Respond to comments
- Create YouTube Shorts from longer videos
- Share YouTube links on other social platforms

## Step 6: Analytics & Tracking

### 6.1 YouTube Analytics
Monitor in YouTube Studio:
- View count and watch time
- Audience demographics
- Traffic sources
- Engagement metrics

### 6.2 Platform Integration
The system tracks:
- Which posts are on YouTube
- View counts (updated daily)
- YouTube URLs for sharing

## Troubleshooting

### Common Issues

1. **Authentication Failed**
   - Regenerate credentials in Google Cloud Console
   - Delete youtube_token.pickle and re-authenticate

2. **Upload Quota Exceeded**
   - Default quota: 10,000 units/day
   - Each upload uses ~1600 units
   - Request quota increase if needed

3. **Video Not Appearing**
   - Check privacy settings (should be "public")
   - Verify video processing completed
   - Check YouTube Studio for errors

4. **Thumbnail Not Updating**
   - YouTube may take time to process
   - Ensure image is JPG/PNG under 2MB
   - Check image dimensions (1280x720 recommended)

### Error Codes
- `403`: Authentication/permission issue
- `400`: Invalid request (check video format)
- `404`: Post or video not found
- `500`: Server error (retry later)

## Security Considerations

1. **Never commit credentials** to version control
2. **Rotate tokens** periodically
3. **Limit API scope** to minimum required
4. **Monitor usage** for unusual activity
5. **Use service accounts** for production

## Support

For issues or questions:
- Check logs: `backend/logs/youtube_uploads.log`
- Google Cloud Console for API errors
- YouTube Studio for content issues
- Contact platform admin for platform-specific issues

## Additional Resources

- [YouTube Data API Documentation](https://developers.google.com/youtube/v3)
- [YouTube Best Practices](https://creatoracademy.youtube.com)
- [Google Cloud Console](https://console.cloud.google.com)
- [YouTube Studio](https://studio.youtube.com)