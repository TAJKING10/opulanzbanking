import Link from 'next/link';

export default function RootNotFound() {
  return (
    <html lang="en">
      <body>
        <div style={{ fontFamily: 'system-ui, sans-serif', textAlign: 'center', padding: '4rem 1.5rem' }}>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '0.75rem' }}>Page not found</h1>
          <p style={{ marginBottom: '1.5rem', color: '#555' }}>
            This URL does not exist. Please visit the Opulanz homepage.
          </p>
          <a href="/en" style={{ color: '#b59354', fontWeight: 600 }}>
            Go to Opulanz
          </a>
        </div>
      </body>
    </html>
  );
}
