import yt_dlp
import json

url = "https://www.instagram.com/reels/DUF8It7iP6G/"

ydl_opts = {
    'quiet': True,
    'no_warnings': True,
}

with yt_dlp.YoutubeDL(ydl_opts) as ydl:
    try:
        info = ydl.extract_info(url, download=False)
        print("Keys available:", info.keys())
        print(f"uploader: {info.get('uploader')}")
        print(f"uploader_id: {info.get('uploader_id')}")
        print(f"channel: {info.get('channel')}")
        print(f"user: {info.get('user')}")
        print(f"creator: {info.get('creator')}")
        print(f"webpage_url_basename: {info.get('webpage_url_basename')}")
        # print(json.dumps(info, indent=2, default=str)) # Too large to print all
    except Exception as e:
        print(f"Error: {e}")
