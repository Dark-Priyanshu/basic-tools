'use server';

export async function shortenUrlAction(longUrl: string) {
  if (!longUrl) {
    return { error: 'URL is required' };
  }

  const apiUrl = `https://is.gd/create.php?format=simple&url=${encodeURIComponent(longUrl)}`;

  try {
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    if (!response.ok) {
        const errText = await response.text().catch(() => 'Unknown API Error');
        console.error(`Provider is.gd failed with status ${response.status}:`, errText);
        return { error: `Provider is.gd returned error: ${response.status}` };
    }

    const shortUrl = await response.text();
    return { shortUrl };

  } catch (error: any) {
    console.error('Shorten Action Error:', error);
    return { error: error.message || 'Failed to connect to shortening service' };
  }
}
