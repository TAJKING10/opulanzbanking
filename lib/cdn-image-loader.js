export default function cdnImageLoader({ src, width, quality }) {
  const cdnUrl = process.env.NEXT_PUBLIC_CDN_URL;
  const params = `w=${width}&q=${quality || 75}`;
  const cleanSrc = src.startsWith('/') ? src : `/${src}`;
  return `${cdnUrl}${cleanSrc}?${params}`;
}
