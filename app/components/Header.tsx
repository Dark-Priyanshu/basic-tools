import Link from 'next/link';

export default function Header() {
  return (
    <header style={{
      borderBottom: '1px solid var(--border)',
      padding: '1rem 0',
      marginBottom: '2rem'
    }}>
      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1rem'
      }}>
        <Link href="/" style={{
          fontSize: '1.5rem',
          fontWeight: 'bold',
          color: 'var(--foreground)',
          textDecoration: 'none'
        }}>
          🛠️ FreeTools
        </Link>
      </div>
    </header>
  );
}
