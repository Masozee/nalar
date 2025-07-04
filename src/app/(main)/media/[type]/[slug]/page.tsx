'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { 
  FiArrowLeft, 
  FiCalendar, 
  FiClock, 
  FiUser, 
  FiTag, 
  FiShare2, 
  FiPlayCircle,
  FiYoutube,
  FiFileText,
  FiTwitter,
  FiLinkedin,
  FiMail,
  FiLink,
  FiCopy,
  FiCheck,
  FiEye
} from 'react-icons/fi';
import { fetchMediaItem, fetchMediaItems, MediaItem } from '@/services/mediaService';
import { getBestMediaUrl, isEmbeddableUrl, getPlatformFromUrl } from '@/lib/mediaUtils';
import Footer from '@/components/Footer';

export default function MediaDetailPage() {
  const params = useParams();
  const { type, slug } = params;
  
  const [mediaItem, setMediaItem] = useState<MediaItem | null>(null);
  const [relatedItems, setRelatedItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isShareMenuOpen, setIsShareMenuOpen] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };
  
  useEffect(() => {
    const loadMediaItem = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch the current media item using slug (this will increment view count)
        const currentItem = await fetchMediaItem(slug as string);
        setMediaItem(currentItem);
        
        console.log(`📊 Media viewed: ${currentItem.title} (Views: ${currentItem.viewed})`);
        
        // Fetch related items (same topics or departments)
        const relatedResponse = await fetchMediaItems({ 
          page_size: 20 
        });
        
        const related = relatedResponse.results.filter(item => 
          item.slug !== currentItem.slug && 
          (item.topic.some(topic => currentItem.topic.some(t => t.id === topic.id)) ||
           item.department.some(dept => currentItem.department.some(d => d.id === dept.id)))
        ).slice(0, 3);
        
        setRelatedItems(related);
      } catch (err) {
        setError('Failed to load media item. Please try again later.');
        console.error('Error loading media item:', err);
      } finally {
        setLoading(false);
      }
    };
    
    if (slug) {
      loadMediaItem();
    }
  }, [slug, type]);
  
  if (loading) {
    return (
      <main className="min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="animate-pulse flex flex-col items-center">
              <div className="h-10 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-6 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-64 bg-gray-200 rounded w-full mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (error || !mediaItem) {
    return (
      <main className="min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              {error ? 'Error Loading Media' : 'Media Not Found'}
            </h1>
            <p className="text-gray-600 mb-8">
              {error || 'The media item you\'re looking for doesn\'t exist or has been removed.'}
            </p>
            <Link href="/media" className="inline-flex items-center text-accent hover:underline">
              <FiArrowLeft className="mr-2" />
              Back to Media
            </Link>
          </div>
        </div>
      </main>
    );
  }
  
  return (
    <>
      <main className="">
        {/* Breadcrumb */}
        <div className="bg-gray-50 border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center text-sm text-gray-500">
              <Link href="/" className="hover:text-gray-700">Home</Link>
              <span className="mx-2">/</span>
              <Link href="/media" className="hover:text-gray-700">Media</Link>
              <span className="mx-2">/</span>
              <span className="text-gray-900 font-medium truncate">{mediaItem.title}</span>
            </div>
          </div>
        </div>
        
        {/* Media Header - Following publication style */}
        <section className="bg-primary text-white py-10 md:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="bg-white/20 text-white text-xs px-3 py-1 rounded-full flex items-center">
                {mediaItem.media_type === 'podcast' && <FiPlayCircle className="mr-1" />}
                {mediaItem.media_type === 'youtube' && <FiYoutube className="mr-1" />}
                {mediaItem.media_type === 'news' && <FiFileText className="mr-1" />}
                {mediaItem.media_type === 'podcast' ? 'Podcast' : 
                 mediaItem.media_type === 'youtube' ? 'Video' : 'News'}
              </span>
              {mediaItem.featured && (
                <span className="bg-accent text-white text-xs px-3 py-1 rounded-full">
                  Featured
                </span>
              )}
            </div>
            
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold !text-white mb-6">
              {mediaItem.title}
            </h1>
            
            {/* Media date and featured persons */}
            <div className="mb-4">
              <span className="text-white/80">
                Published on {new Date(mediaItem.publish_date).toLocaleDateString('en-US', { 
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
              {mediaItem.persons.length > 0 && (
                <span className="text-white/80 ml-4">
                  • Featuring {mediaItem.persons.slice(0, 2).map(p => p.person.name).join(', ')}
                  {mediaItem.persons.length > 2 && ` +${mediaItem.persons.length - 2} more`}
                </span>
              )}
            </div>
            
            {/* Topics and Departments */}
            {(mediaItem.topic.length > 0 || mediaItem.department.length > 0) && (
              <div className="mb-6">
                <div className="flex flex-wrap gap-2">
                  {mediaItem.topic.map((topic) => (
                    <Link 
                      key={topic.id}
                      href={`/media?topic=${encodeURIComponent(topic.slug)}`}
                      className="bg-white/20 hover:bg-white/30 text-white px-3 py-1 rounded-full text-sm transition-colors"
                    >
                      {topic.name}
                    </Link>
                  ))}
                  {mediaItem.department.map((dept) => (
                    <Link 
                      key={dept.id}
                      href={`/media?department=${encodeURIComponent(dept.slug)}`}
                      className="bg-white/20 hover:bg-white/30 text-white px-3 py-1 rounded-full text-sm transition-colors"
                    >
                      {dept.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
        
        {/* Media Content */}
        <section className="bg-white py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              {/* Main Content */}
              <div className="lg:col-span-2">
                {/* Featured Media with credit below */}
                <div className="mb-8">
                  <div className="aspect-video relative rounded-lg overflow-hidden">
                    {mediaItem.media_type === 'youtube' ? (
                      <div className="relative w-full h-full bg-gray-200 flex items-center justify-center">
                        <div className="text-center">
                          <FiYoutube size={48} className="text-gray-400 mx-auto mb-2" />
                          <p className="text-gray-600">YouTube video player would be embedded here</p>
                        </div>
                      </div>
                    ) : (
                      <div className="relative w-full h-full">
                        <Image
                          src={mediaItem.thumbnail || "/bg/frank-mouland-e4mYPf_JUIk-unsplash.png"}
                          alt={mediaItem.title}
                          fill
                          className="object-cover"
                        />
                        {mediaItem.media_type === 'podcast' && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                            <div className="text-center">
                              <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
                                <FiPlayCircle size={32} className="text-white" />
                              </div>
                              <p className="text-white font-medium">Listen to the podcast</p>
                            </div>
                          </div>
                        )}
                        {mediaItem.media_type === 'news' && (
                          <div className="absolute bottom-4 left-4 bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium">
                            <FiFileText className="inline mr-1" />
                            News Article
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  {/* Media credit */}
                  <p className="mt-2 text-xs text-gray-500 text-right italic">
                    {mediaItem.thumbnail_credit || 'Media: CSIS Indonesia'}
                  </p>
                </div>

                {/* Media Player Section */}
                {(() => {
                  const mediaUrl = getBestMediaUrl(mediaItem);
                  const isEmbeddable = mediaUrl ? isEmbeddableUrl(mediaUrl) : false;
                  const platform = mediaUrl ? getPlatformFromUrl(mediaUrl) : '';
                  
                  // Debug logging to console
                  console.log('Media Debug Info:', {
                    title: mediaItem.title,
                    media_type: mediaItem.media_type,
                    transformed_link: mediaItem.transformed_link,
                    link: mediaItem.link,
                    podcast_url: mediaItem.podcast_url,
                    selectedUrl: mediaUrl,
                    isEmbeddable,
                    platform
                  });
                  
                  if (!mediaUrl) return null;
                  
                  return (
                    <div className="bg-gray-100 rounded-lg p-6 mb-8">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold flex items-center">
                          {mediaItem.media_type === 'podcast' && <FiPlayCircle className="mr-2" />}
                          {mediaItem.media_type === 'youtube' && <FiYoutube className="mr-2" />}
                          {mediaItem.media_type === 'news' && <FiFileText className="mr-2" />}
                          {mediaItem.media_type === 'podcast' && 'Listen to Podcast'}
                          {mediaItem.media_type === 'youtube' && 'Watch Video'}
                          {mediaItem.media_type === 'news' && 'Read Article'}
                          {platform && platform !== 'Unknown' && (
                            <span className="ml-2 text-sm text-gray-600 font-normal">
                              on {platform}
                            </span>
                          )}
                        </h3>
                        
                        {/* Debug info - shows which URL source is being used */}
                        <div className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">
                          {mediaItem.transformed_link ? '🔄 Transformed' : 
                           mediaItem.podcast_url ? '🎵 Podcast URL' :
                           mediaItem.youtube_url ? '📺 YouTube URL' :
                           mediaItem.news_url ? '📰 News URL' :
                           mediaItem.link ? '🔗 Generic Link' : '❌ No URL'}
                        </div>
                      </div>
                      
                      <div className="bg-white rounded-lg overflow-hidden">
                        {isEmbeddable ? (
                          mediaItem.media_type === 'youtube' ? (
                            <div className="aspect-video relative">
                              <iframe 
                                width="560" 
                                height="315" 
                                src={mediaUrl}
                                title="YouTube video player" 
                                frameBorder="0" 
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                                referrerPolicy="strict-origin-when-cross-origin" 
                                allowFullScreen
                                className="absolute inset-0 w-full h-full"
                              />
                            </div>
                          ) : (
                            <iframe 
                              style={{ borderRadius: '12px' }}
                              src={mediaUrl} 
                              width="100%" 
                              height="152" 
                              frameBorder="0" 
                              allowFullScreen 
                              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
                              loading="lazy"
                            />
                          )
                        ) : (
                          <div className="p-6 text-center">
                            <div className="mb-4">
                              {mediaItem.media_type === 'podcast' && <FiPlayCircle size={48} className="mx-auto text-gray-400" />}
                              {mediaItem.media_type === 'youtube' && <FiYoutube size={48} className="mx-auto text-gray-400" />}
                              {mediaItem.media_type === 'news' && <FiFileText size={48} className="mx-auto text-gray-400" />}
                            </div>
                            <p className="text-gray-600 mb-4">
                              {mediaItem.media_type === 'podcast' && 'Listen to this podcast'}
                              {mediaItem.media_type === 'youtube' && 'Watch this video'}
                              {mediaItem.media_type === 'news' && 'Read the full article'}
                              {platform && ` on ${platform}`}
                            </p>
                            <a 
                              href={mediaUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center bg-primary text-white px-6 py-3 rounded-lg hover:bg-accent transition-colors font-medium"
                            >
                              {mediaItem.media_type === 'podcast' && <FiPlayCircle className="mr-2" />}
                              {mediaItem.media_type === 'youtube' && <FiYoutube className="mr-2" />}
                              {mediaItem.media_type === 'news' && <FiFileText className="mr-2" />}
                              {mediaItem.media_type === 'podcast' && 'Listen Now'}
                              {mediaItem.media_type === 'youtube' && 'Watch Now'}
                              {mediaItem.media_type === 'news' && 'Read Now'}
                              <FiLink className="ml-2" size={16} />
                            </a>
                            {(mediaItem.news_source || platform) && (
                              <p className="text-sm text-gray-500 mt-3">
                                Source: {mediaItem.news_source || platform}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                      
                      {/* URL Debug Info */}
                      <div className="mt-3 p-3 bg-gray-50 rounded text-xs text-gray-600">
                        <div className="font-medium mb-1">Source URL:</div>
                        <div className="break-all font-mono text-gray-800">{mediaUrl}</div>
                        <div className="mt-1 text-gray-500">
                          Using: {mediaItem.transformed_link ? 'transformed_link (from backend)' : 
                                  mediaItem.podcast_url ? 'podcast_url' :
                                  mediaItem.youtube_url ? 'youtube_url' :
                                  mediaItem.news_url ? 'news_url' :
                                  mediaItem.link ? 'link (generic)' : 'unknown'}
                        </div>
                      </div>
                    </div>
                  );
                })()}
                
                {/* Content */}
                <div 
                  className="prose prose-lg max-w-none mb-12" 
                  dangerouslySetInnerHTML={{ __html: mediaItem.description || '' }}
                />
                
                
                {/* Featured Persons section */}
                {mediaItem.persons && mediaItem.persons.length > 0 && (
                  <div className="mt-12 pt-8 border-t border-gray-200">
                    <h3 className="text-xl font-semibold mb-6">Featured Persons</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {mediaItem.persons.map((mediaPerson, index) => (
                        <div key={index} className="flex items-start">
                          {mediaPerson.person.photo && (
                            <div className="w-20 h-20 rounded-full overflow-hidden mr-4 flex-shrink-0">
                              <Image
                                src={mediaPerson.person.photo}
                                alt={mediaPerson.person.name}
                                width={80}
                                height={80}
                                className="object-cover"
                              />
                            </div>
                          )}
                          <div>
                            <h4 className="font-semibold text-gray-900 text-lg">{mediaPerson.person.name}</h4>
                            <p className="text-sm text-gray-700 mb-1">{mediaPerson.role}</p>
                            {mediaPerson.person.position && (
                              <p className="text-sm text-gray-600">{mediaPerson.person.position}</p>
                            )}
                            {mediaPerson.notes && (
                              <p className="text-sm text-gray-500 mt-2">{mediaPerson.notes}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Related Media - Moved to bottom */}
                {relatedItems.length > 0 && (
                  <div className="mt-12 pt-8 border-t border-gray-200">
                    <h3 className="text-xl font-semibold mb-6">Related Media</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {relatedItems.map((item) => (
                        <Link 
                          key={item.id}
                          href={`/media/${item.media_type}/${item.slug}`}
                          className="block group bg-gray-50 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                        >
                          <div className="relative w-full h-40 rounded overflow-hidden mb-4">
                            <Image
                              src={item.thumbnail || '/placeholder-image.jpg'}
                              alt={item.title}
                              fill
                              className="object-cover"
                            />
                            <div className="absolute bottom-2 right-2 bg-black/70 text-white rounded-full p-2">
                              {item.media_type === 'podcast' && <FiPlayCircle size={16} />}
                              {item.media_type === 'youtube' && <FiYoutube size={16} />}
                              {item.media_type === 'news' && <FiFileText size={16} />}
                            </div>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900 group-hover:text-primary transition-colors mb-2 line-clamp-2">
                              {item.title}
                            </h4>
                            <div className="text-sm text-gray-500 mb-1">
                              {item.media_type === 'podcast' ? 'Podcast' : 
                               item.media_type === 'youtube' ? 'Video' : 'News'} • {new Date(item.publish_date).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </div>
                            <div className="text-xs text-gray-400">
                              {item.topic[0]?.name || item.department[0]?.name || 'General'}
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Sidebar */}
              <div className="lg:col-span-1">
                <div className="sticky top-28 pt-4">
                  {/* Media Stats */}
                  {mediaItem.viewed !== undefined && (
                    <div className="bg-gray-50 rounded-lg p-6 mb-6">
                      <h3 className="text-lg font-semibold mb-4">Media Stats</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 flex items-center">
                            <FiEye className="h-5 w-5 mr-2 text-gray-500" />
                            Views
                          </span>
                          <span className="text-gray-900 font-medium">{mediaItem.viewed.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 flex items-center">
                            <FiCalendar className="h-5 w-5 mr-2 text-gray-500" />
                            Published
                          </span>
                          <span className="text-gray-900 font-medium">
                            {new Date(mediaItem.publish_date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 flex items-center">
                            {mediaItem.media_type === 'podcast' && <FiPlayCircle className="h-5 w-5 mr-2 text-gray-500" />}
                            {mediaItem.media_type === 'youtube' && <FiYoutube className="h-5 w-5 mr-2 text-gray-500" />}
                            {mediaItem.media_type === 'news' && <FiFileText className="h-5 w-5 mr-2 text-gray-500" />}
                            Type
                          </span>
                          <span className="text-gray-900 font-medium">
                            {mediaItem.media_type === 'podcast' ? 'Podcast' : 
                             mediaItem.media_type === 'youtube' ? 'Video' : 'News'}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Share and Actions */}
                  <div className="bg-gray-50 rounded-lg p-6 mb-6">
                    <h3 className="text-lg font-semibold mb-4">Share Media</h3>
                    
                    <div className="relative">
                      <button 
                        onClick={() => setIsShareMenuOpen(!isShareMenuOpen)} 
                        className="inline-flex items-center justify-center w-full px-4 py-2 border border-gray-300 hover:bg-gray-100 rounded-md transition-colors"
                      >
                        <FiShare2 className="mr-2" />
                        Share
                      </button>
                      
                      {isShareMenuOpen && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white shadow-lg rounded-md p-4 z-10">
                          <div className="flex flex-wrap justify-between gap-2">
                            <a 
                              href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}&text=${encodeURIComponent(mediaItem.title)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center text-gray-700 hover:text-primary p-2"
                            >
                              <FiTwitter className="mr-2" />
                              Twitter
                            </a>
                            <a 
                              href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center text-gray-700 hover:text-primary p-2"
                            >
                              <FiLinkedin className="mr-2" />
                              LinkedIn
                            </a>
                            <a 
                              href={`mailto:?subject=${encodeURIComponent(mediaItem.title)}&body=${encodeURIComponent(`Check out this media: ${typeof window !== 'undefined' ? window.location.href : ''}`)}`}
                              className="flex items-center text-gray-700 hover:text-primary p-2"
                            >
                              <FiMail className="mr-2" />
                              Email
                            </a>
                            <button 
                              onClick={copyToClipboard}
                              className="flex items-center text-gray-700 hover:text-primary p-2"
                            >
                              <FiLink className="mr-2" />
                              {copySuccess ? 'Copied!' : 'Copy Link'}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
} 