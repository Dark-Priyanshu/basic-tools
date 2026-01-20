import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { url, provider = 'isgd' } = await request.json();

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    let apiUrl = '';
    let method = 'GET';

    switch (provider) {
      case 'tinyurl':
        apiUrl = `https://tinyurl.com/api-create.php?url=${encodeURIComponent(url)}`;
        break;
      case 'isgd':
      default:
        apiUrl = `https://is.gd/create.php?format=simple&url=${encodeURIComponent(url)}`;
        break;
    }

    const response = await fetch(apiUrl, { 
      method,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    if (!response.ok) {
        // Some APIs return useful error text/blobs
        const errText = await response.text().catch(() => 'Unknown API Error');
        console.error(`Provider ${provider} failed with status ${response.status}:`, errText);
        return NextResponse.json({ error: `Provider ${provider} returned error: ${response.status} ${response.statusText}` }, { status: 502 });
    }

    const shortUrl = await response.text();
    
    return NextResponse.json({ shortUrl });
  } catch (error: any) {
    console.error('Shorten API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
