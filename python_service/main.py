import os
import uvicorn
import sys
import subprocess
from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import spotipy
import requests
import urllib.parse
from spotipy.oauth2 import SpotifyClientCredentials
from fastapi.responses import StreamingResponse
import instaloader
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Spotify Credentials
SPOTIPY_CLIENT_ID = os.getenv("SPOTIPY_CLIENT_ID")
SPOTIPY_CLIENT_SECRET = os.getenv("SPOTIPY_CLIENT_SECRET")

sp = spotipy.Spotify(auth_manager=SpotifyClientCredentials(
    client_id=SPOTIPY_CLIENT_ID, client_secret=SPOTIPY_CLIENT_SECRET))

# Initialize Instaloader
L = instaloader.Instaloader()
# Optional: Load session if available, or just use anonymous for public posts
# L.load_session_from_file('user') 

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
    quality: str = "best"      # best, 1080p, 720p, etc.
    carousel_index: int = -1   # -1 for auto-detect/manifest, >=0 for specific item

@app.get("/")
def read_root():
    return {"message": "Social Tools Downloader API is running"}

@app.get("/proxy_image")
def proxy_image(url: str):
    """
    Proxies an image URL to bypass CORS/Referrer policies.
    """
    try:
        if not url:
            raise HTTPException(status_code=400, detail="Missing URL")
            
        def iter_content():
            with requests.get(url, stream=True) as r:
                r.raise_for_status()
                for chunk in r.iter_content(chunk_size=8192):
                    yield chunk
        
        return StreamingResponse(iter_content(), media_type="image/jpeg")
    except Exception as e:
        print(f"Proxy Error: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch image")

@app.post("/download/{platform}")
def download_media(platform: str, request: DownloadRequest):
    valid_platforms = ["youtube", "facebook", "instagram", "spotify"]
    if platform not in valid_platforms:
        raise HTTPException(status_code=400, detail="Invalid platform")

    print(f"DEBUG: Processing {platform} download for {request.url}")

    # --- INSTAGRAM PHOTO/CAROUSEL HANDLING ---
    if platform == "instagram":
        try:
            # 1. Extract Shortcode
            shortcode = None
            if "/p/" in request.url:
                shortcode = request.url.split("/p/")[1].split("/")[0]
            elif "/reel/" in request.url:
                shortcode = request.url.split("/reel/")[1].split("/")[0]
            elif "/reels/" in request.url:
                shortcode = request.url.split("/reels/")[1].split("/")[0]
            
            if shortcode:
                print(f"DEBUG: Instagram Shortcode: {shortcode}")
                try:
                    post = instaloader.Post.from_shortcode(L.context, shortcode)
                    
                    # --- CAROUSEL DETECTION ---
                    if post.typename == 'GraphSidecar':
                        # Case A: Discovery (Client asking "what is inside?")
                        if request.carousel_index == -1:
                            print("DEBUG: Detected Carousel - Returning Manifest")
                            items = []
                            for i, node in enumerate(post.get_sidecar_nodes()):
                                items.append({
                                    "index": i,
                                    "is_video": node.is_video,
                                    "url": node.display_url, # Thumbnail/Preview
                                    "type": "video" if node.is_video else "photo"
                                })
                            
                            from fastapi.responses import JSONResponse
                            return JSONResponse(content={"type": "carousel", "items": items})
                        
                        # Case B: Download Specific Item
                        else:
                            print(f"DEBUG: Downloading Carousel Item Index: {request.carousel_index}")
                            nodes = list(post.get_sidecar_nodes())
                            if request.carousel_index < 0 or request.carousel_index >= len(nodes):
                                raise HTTPException(status_code=400, detail="Invalid carousel index")
                            
                            target_node = nodes[request.carousel_index]
                            
                            # Stream Logic for Target Node
                            if target_node.is_video:
                                # For video nodes in carousel, instaloader gives video_url
                                video_url = target_node.video_url
                                final_filename_display = f"Video by {post.owner_username} ({request.carousel_index + 1}).mp4"
                                
                                # Stream using Requests (simpler than yt-dlp for direct URL)
                                # OR pass to yt-dlp if URL is complex. Usually direct URL works for Sidecar.
                                def iter_video():
                                    with requests.get(video_url, stream=True) as r:
                                        r.raise_for_status()
                                        for chunk in r.iter_content(chunk_size=1024*1024):
                                            yield chunk

                                from urllib.parse import quote
                                filename_header = f"attachment; filename*=utf-8''{quote(final_filename_display)}"
                                return StreamingResponse(
                                    iter_video(),
                                    media_type="video/mp4",
                                    headers={"Content-Disposition": filename_header}
                                )
                            else:
                                # Photo Node
                                image_url = target_node.display_url
                                filename_display = f"Photo by {post.owner_username} ({request.carousel_index + 1}).jpg"
                                
                                def iter_image():
                                    with requests.get(image_url, stream=True) as r:
                                        r.raise_for_status()
                                        for chunk in r.iter_content(chunk_size=8192):
                                            yield chunk
                                
                                from urllib.parse import quote
                                filename_header = f"attachment; filename*=utf-8''{quote(final_filename_display)}"
                                return StreamingResponse(
                                    iter_image(),
                                    media_type="image/jpeg",
                                    headers={"Content-Disposition": filename_header}
                                )

                    # --- SINGLE POST (Photo) ---
                    elif not post.is_video:
                        print("DEBUG: Detected Single Instagram Photo")
                        image_url = post.url
                        filename_display = f"Photo by {post.owner_username}.jpg"
                        
                        def iter_image():
                            with requests.get(image_url, stream=True) as r:
                                r.raise_for_status()
                                for chunk in r.iter_content(chunk_size=8192): 
                                    yield chunk
                        
                        from urllib.parse import quote
                        filename_header = f"attachment; filename*=utf-8''{quote(filename_display)}"
                        
                        return StreamingResponse(
                            iter_image(),
                            media_type="image/jpeg",
                            headers={"Content-Disposition": filename_header}
                        )
                    else:
                        print("DEBUG: Detected Instagram Video/Reel - Falling back to yt-dlp")
                        # Fallback to yt-dlp code below for videos
                except Exception as e:
                    print(f"WARNING: Instaloader failed: {e}")
                    pass # Fallback
        except Exception as e:
             print(f"Error in Instagram logic: {e}")

    # --- STANDARD VIDEO/AUDIO (yt-dlp) ---
    
    target_url = request.url
    final_filename_display = None

    # Spotify Logic
    if platform == "spotify":
        try:
            track_info = sp.track(request.url)
            song_name = track_info["name"]
            artist_name = track_info["artists"][0]["name"]
            
            query = f"{song_name} {artist_name} official audio"
            query_string = urllib.parse.quote(query)
            youtube_search_url = f"https://www.youtube.com/results?search_query={query_string}"
            
            response = requests.get(youtube_search_url)
            try:
                video_id = response.text.split('watch?v=')[1].split('"')[0]
            except IndexError:
                raise HTTPException(status_code=404, detail="Could not find a YouTube video for this song.")

            target_url = f"https://www.youtube.com/watch?v={video_id}"
            final_filename_display = f"{song_name} - {artist_name}.mp3"
        except Exception as e:
             raise HTTPException(status_code=500, detail=f"Spotify processing failed: {str(e)}")

    # Construct yt-dlp command
    cmd_base = [sys.executable, "-m", "yt_dlp", "--no-part", "--no-cache-dir", "--quiet", "--no-warnings"]

    # 1. Get the Filename (if not already set)
    if not final_filename_display:
        try:
            name_cmd = cmd_base + ["--get-filename", "-o", "%(title)s.%(ext)s"]
            
            if platform == 'instagram':
                 name_cmd = cmd_base + ["--get-filename", "-o", "Video by %(uploader)s.%(ext)s"]

            if request.format_type == 'audio':
                 name_cmd.extend(["-f", "bestaudio"]) 
            else:
                 name_cmd.extend(["-f", "best"]) 

            name_cmd.append(target_url)

            proc = subprocess.run(name_cmd, capture_output=True, text=True, check=False)
            if proc.returncode == 0:
                final_filename_display = proc.stdout.strip()
                if request.format_type == 'audio' and not final_filename_display.endswith('.mp3'):
                     final_filename_display = os.path.splitext(final_filename_display)[0] + ".mp3"
            else:
                final_filename_display = "download.mp4" if request.format_type != 'audio' else "download.mp3"
        except Exception as e:
            print(f"ERROR getting filename: {e}")
            final_filename_display = "download.mp4"

    # 2. Stream the Content
    stream_cmd = [sys.executable, "-m", "yt_dlp", "--no-part", "--no-cache-dir", "-o", "-"] 
    
    if request.format_type == 'audio':
        stream_cmd.extend(["-f", "bestaudio"])
    else:
        stream_cmd.extend(["-f", "best"])
    
    stream_cmd.append(target_url)
    
    def iterfile():
        try:
            with subprocess.Popen(stream_cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, bufsize=10**5) as proc:
                while True:
                    chunk = proc.stdout.read(64 * 1024) 
                    if not chunk:
                        break
                    yield chunk
        except Exception as e:
            print(f"Stream Exception: {e}")
            yield b"" 

    from urllib.parse import quote
    try:
        filename_header = f"attachment; filename*=utf-8''{quote(final_filename_display)}"
    except:
        filename_header = f"attachment; filename=\"download_media\""

    return StreamingResponse(
        iterfile(),
        media_type="application/octet-stream",
        headers={"Content-Disposition": filename_header}
    )

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
