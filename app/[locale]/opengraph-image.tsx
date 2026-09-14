import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Opulanz — European financial and business platform';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function OpenGraphImage({
  params,
}: {
  params: { locale: string } | Promise<{ locale: string }>;
}) {
  const { locale } = await Promise.resolve(params);
  const isFr = locale === 'fr';
  const title = isFr
    ? 'Plateforme financière & business'
    : 'Financial & business platform';
  const subtitle = isFr
    ? 'Luxembourg · France · Europe'
    : 'Luxembourg · France · Europe';

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: 80,
          background: 'linear-gradient(135deg, #252623 0%, #3a3d37 55%, #252623 100%)',
          color: '#ffffff',
          fontFamily: 'Georgia, serif',
        }}
      >
        <div style={{ fontSize: 28, letterSpacing: 8, color: '#b59354', textTransform: 'uppercase' }}>
          OPULANZ
        </div>
        <div style={{ marginTop: 28, fontSize: 56, fontWeight: 700, lineHeight: 1.15, maxWidth: 900 }}>
          {title}
        </div>
        <div style={{ marginTop: 24, fontSize: 28, color: '#dac5a4' }}>{subtitle}</div>
      </div>
    ),
    { ...size }
  );
}
