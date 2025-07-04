/**
 * Utility functions for media content handling
 */

/**
 * Transform a YouTube URL to embed format
 * @param url - YouTube URL
 * @returns Embed URL or original URL if not YouTube
 */
export function transformYouTubeUrl(url: string): string {
  if (!url) return url;
  
  // Handle various YouTube URL formats
  const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(youtubeRegex);
  
  if (match && match[1]) {
    const videoId = match[1];
    return `https://www.youtube.com/embed/${videoId}?si=dwUCUfWnGrir6UPE`;
  }
  
  return url;
}

/**
 * Transform a Spotify URL to embed format (client-side version)
 * @param url - Spotify URL
 * @returns Embed URL or original URL if not Spotify
 */
export function transformSpotifyUrl(url: string): string {
  if (!url) return url;
  
  // Check if it's a Spotify episode link
  if (url.includes('open.spotify.com/episode/')) {
    const episodeMatch = url.match(/\/episode\/([^?\/]+)/);
    if (episodeMatch && episodeMatch[1]) {
      const episodeId = episodeMatch[1];
      return `https://open.spotify.com/embed/episode/${episodeId}?utm_source=generator`;
    }
  }
  
  // Check if it's a Spotify show/podcast link
  if (url.includes('open.spotify.com/show/')) {
    const showMatch = url.match(/\/show\/([^?\/]+)/);
    if (showMatch && showMatch[1]) {
      const showId = showMatch[1];
      return `https://open.spotify.com/embed/show/${showId}?utm_source=generator`;
    }
  }
  
  return url;
}

/**
 * Get the best available URL for media playback
 * Priority: transformed_link > specific_url > link
 * @param mediaItem - Media item with various URL fields
 * @returns Best available URL for the media type
 */
export function getBestMediaUrl(mediaItem: {
  media_type: string;
  transformed_link?: string | null;
  link?: string | null;
  podcast_url?: string | null;
  youtube_url?: string | null;
  news_url?: string | null;
}): string | null {
  console.log('getBestMediaUrl called with:', mediaItem);
  
  // If we have a transformed link (from backend), use it
  if (mediaItem.transformed_link) {
    console.log('Using transformed_link:', mediaItem.transformed_link);
    return mediaItem.transformed_link;
  }
  
  // Use media-specific URLs
  if (mediaItem.media_type === 'podcast' && mediaItem.podcast_url) {
    return transformSpotifyUrl(mediaItem.podcast_url);
  }
  
  if (mediaItem.media_type === 'youtube' && mediaItem.youtube_url) {
    return transformYouTubeUrl(mediaItem.youtube_url);
  }
  
  if (mediaItem.media_type === 'news' && mediaItem.news_url) {
    return mediaItem.news_url;
  }
  
  // Fallback to generic link with transformation
  if (mediaItem.link) {
    if (mediaItem.media_type === 'podcast') {
      return transformSpotifyUrl(mediaItem.link);
    }
    if (mediaItem.media_type === 'youtube') {
      return transformYouTubeUrl(mediaItem.link);
    }
    return mediaItem.link;
  }
  
  return null;
}

/**
 * Check if a URL is embeddable
 * @param url - URL to check
 * @returns Whether the URL can be embedded
 */
export function isEmbeddableUrl(url: string): boolean {
  if (!url) return false;
  
  const embeddableDomains = [
    'open.spotify.com/embed',
    'youtube.com/embed',
    'youtube-nocookie.com/embed',
    'soundcloud.com',
    'anchor.fm'
  ];
  
  return embeddableDomains.some(domain => url.includes(domain));
}

/**
 * Get platform name from URL
 * @param url - Media URL
 * @returns Platform name
 */
export function getPlatformFromUrl(url: string): string {
  if (!url) return 'Unknown';
  
  if (url.includes('spotify.com')) return 'Spotify';
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'YouTube';
  if (url.includes('soundcloud.com')) return 'SoundCloud';
  if (url.includes('anchor.fm')) return 'Anchor';
  
  try {
    const domain = new URL(url).hostname.replace('www.', '');
    return domain.charAt(0).toUpperCase() + domain.slice(1);
  } catch {
    return 'External Link';
  }
}