import Link from 'next/link';

export const metadata = {
  title: 'Page Not Found - BotBlogs',
  description: 'The page or article you are looking for could not be found.',
};

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: '70vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '2rem',
        gap: '1.25rem',
      }}
    >
      <div
        style={{
          fontSize: '5rem',
          fontWeight: '900',
          letterSpacing: '-2px',
          background: 'linear-gradient(135deg, #0070f3, #00dfd8)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          lineHeight: 1,
        }}
      >
        404
      </div>
      <h1 style={{ fontSize: '1.75rem', fontWeight: '700', margin: 0 }}>Story Not Found</h1>
      <p style={{ maxWidth: '440px', color: 'var(--softTextColor, #888)', margin: 0, lineHeight: 1.6 }}>
        The article, topic, or profile you are looking for might have been moved, deleted, or never existed.
      </p>
      <Link
        href="/"
        style={{
          marginTop: '1rem',
          padding: '0.75rem 1.75rem',
          borderRadius: '8px',
          backgroundColor: '#0070f3',
          color: '#ffffff',
          textDecoration: 'none',
          fontWeight: '600',
          transition: 'opacity 0.2s',
        }}
      >
        Back to Explore
      </Link>
    </div>
  );
}
