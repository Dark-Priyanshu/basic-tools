import os
import uvicorn
from fastapi import FastAPI, HTTPException, Body, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import yt_dlp
import spotipy
import requests
import urllib.parse
from spotipy.oauth2 import SpotifyClientCredentials
from fastapi.responses import FileResponse

import time

def remove_file(path: str):
    max_retries = 5
    for i in range(max_retries):
        try:
            if os.path.exists(path):
                os.remove(path)
                print(f"DEBUG: Deleted temporary file: {path}")
            return
        except Exception as e:
            if i < max_retries - 1:
                print(f"WARNING: Parse error or file locked, retrying cleanup ({i+1}/{max_retries})...")
                time.sleep(1) # Wait 1 second before retrying
            else:
                print(f"ERROR: Failed to delete {path} after retries: {e}")

# Spotify Credentials
SPOTIPY_CLIENT_ID = "dbd2a664476f440aaffd0d6940580c1a"
SPOTIPY_CLIENT_SECRET = "ca14d283a1b04e3296064eb71776c369"

sp = spotipy.Spotify(auth_manager=SpotifyClientCredentials(
    client_id=SPOTIPY_CLIENT_ID, client_secret=SPOTIPY_CLIENT_SECRET))

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For local development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Content-Disposition"], # Allow frontend to access filename
)

# Request Models
class DownloadRequest(BaseModel):
    url: str
    format_type: str = "video" # video or audio
    quality: str = "best"      # best, 1080p, 720p, etc. (simplified for now)

@app.get("/")
def read_root():
    return {"message": "Social Tools Downloader API is running"}

@app.post("/download/{platform}")
def download_media(platform: str, request: DownloadRequest, background_tasks: BackgroundTasks):
    valid_platforms = ["youtube", "facebook", "instagram", "spotify"]
    if platform not in valid_platforms:
        raise HTTPException(status_code=400, detail="Invalid platform")

    # Validate URL matches platform
    domain_map = {
        "youtube": ["youtube.com", "youtu.be"],
        "facebook": ["facebook.com", "fb.watch"],
        "instagram": ["instagram.com"],
        "spotify": ["spotify.com", "open.spotify.com"]
    }
    
    if not any(domain in request.url.lower() for domain in domain_map.get(platform, [])):
        raise HTTPException(status_code=400, detail=f"Invalid URL. Please provide a valid {platform.capitalize()} link.")


    import tempfile
    # Use system temp location instead of project folder
    downloads_dir = os.path.join(tempfile.gettempdir(), "social_tools_dl")
    os.makedirs(downloads_dir, exist_ok=True)

    ydl_opts = {
        'outtmpl': os.path.join(downloads_dir, '%(id)s.%(ext)s'),
        'verbose': True,
        'nopart': True, # Don't use .part files to avoid potential locking/renaming issues
        'force_overwrites': True, # Force overwrite to prevent existing file errors
    }
    
    print(f"DEBUG: Processing {platform} download for {request.url}")

    final_filename_display = None # The name the user will see

    if platform == "spotify":
        try:
            # 1. Get Track Info
            track_info = sp.track(request.url)
            song_name = track_info["name"]
            artist_name = track_info["artists"][0]["name"]
            
            # 2. Search on YouTube
            query = f"{song_name} {artist_name} official audio"
            query_string = urllib.parse.quote(query)
            youtube_search_url = f"https://www.youtube.com/results?search_query={query_string}"
            
            # Simple retrieval of search page to find video ID
            response = requests.get(youtube_search_url)
            response_text = response.text
            
            try:
                video_id = response_text.split('watch?v=')[1].split('"')[0]
            except IndexError:
                raise HTTPException(status_code=404, detail="Could not find a YouTube video for this song.")

            download_url = f"https://www.youtube.com/watch?v={video_id}"
            
            # 3. Configure Download
            quality_target = request.quality.replace('k', '')
            if not quality_target.isdigit():
                 quality_target = '192'
            
            ydl_opts.update({
                'format': 'bestaudio/best',
                'postprocessors': [{
                    'key': 'FFmpegExtractAudio',
                    'preferredcodec': 'mp3',
                    'preferredquality': quality_target,
                }],
            })
            
            target_url = download_url
            # Set desired display name for Spotify
            final_filename_display = f"{song_name} - {artist_name}.mp3"
            
        except Exception as e:
             raise HTTPException(status_code=500, detail=f"Spotify processing failed: {str(e)}")

    else:
        # Standard video/audio
        target_url = request.url
        
        if request.format_type == 'audio':
            ydl_opts.update({
                'format': 'bestaudio/best',
                'postprocessors': [{
                    'key': 'FFmpegExtractAudio',
                    'preferredcodec': 'mp3',
                    'preferredquality': '192',
                }],
            })
        else:
            ydl_opts.update({'format': 'bestvideo+bestaudio/best'})

    try:
        from yt_dlp.utils import sanitize_filename
        
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(target_url, download=True)
            # Filename on disk (based on outtmpl)
            filename_on_disk = ydl.prepare_filename(info)
            
            if request.format_type == 'audio' or platform == 'spotify':
                 base, _ = os.path.splitext(filename_on_disk)
                 filename_on_disk = base + ".mp3"

            # Determine display filename if not set (for non-Spotify)
            if not final_filename_display:
                if platform == 'instagram':
                    # Try multiple fields to get the username, prioritizing channel (username)
                    uploader = info.get('channel') or info.get('uploader') or info.get('uploader_id') or 'Instagram User'
                    ext = "mp3" if request.format_type == 'audio' else info.get('ext', 'mp4')
                    final_filename_display = f"Video by {uploader}.{ext}"
                else:
                    original_title = info.get('title', 'video')
                    ext = "mp3" if request.format_type == 'audio' else info.get('ext', 'mp4')
                    final_filename_display = f"{original_title}.{ext}"

            # Sanitize the display filename just in case
            final_filename_display = sanitize_filename(final_filename_display)

            # Clean up task
            background_tasks.add_task(remove_file, filename_on_disk)
            
            # Return file stream
            return FileResponse(
                path=filename_on_disk, 
                filename=final_filename_display,
                media_type='application/octet-stream'
            )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    # Security: Bind only to localhost
    uvicorn.run(app, host="127.0.0.1", port=8000)
