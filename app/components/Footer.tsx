import Link from 'next/link';

export default function Footer() {
  return (
    <footer style={{
      borderTop: '1px solid var(--border)',
      marginTop: '4rem',
      padding: '3rem 0 2rem'
    }}>
      <div className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '2rem',
          marginBottom: '2rem'
        }}>
          <div>
            <h3 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>About Our Tools</h3>
            <p style={{ color: 'var(--foreground)', opacity: 0.8, fontSize: '0.95rem' }}>
              Free online tools for image conversion, cropping, resizing, rotating, QR code generation, 
              and password creation. All processing happens in your browser - no uploads, completely private.
            </p>
          </div>
          
          <div>
            <h3 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>Tools</h3>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <li style={{ marginBottom: '0.5rem' }}>
                <Link href="/tools/convert" style={{ color: 'var(--primary)', textDecoration: 'none' }}>
                  Image Format Converter
                </Link>
              </li>
              <li style={{ marginBottom: '0.5rem' }}>
                <Link href="/tools/crop" style={{ color: 'var(--primary)', textDecoration: 'none' }}>
                  Crop & Resize Tool
                </Link>
              </li>
              <li style={{ marginBottom: '0.5rem' }}>
                <Link href="/tools/rotate" style={{ color: 'var(--primary)', textDecoration: 'none' }}>
                  Rotate & Flip Tool
                </Link>
              </li>
              <li style={{ marginBottom: '0.5rem' }}>
                <Link href="/tools/qr" style={{ color: 'var(--primary)', textDecoration: 'none' }}>
                  QR Code Generator
                </Link>
              </li>
              <li style={{ marginBottom: '0.5rem' }}>
                <Link href="/tools/password" style={{ color: 'var(--primary)', textDecoration: 'none' }}>
                  Password Generator
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>Information</h3>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <li style={{ marginBottom: '0.5rem' }}>
                <Link href="/about" style={{ color: 'var(--primary)', textDecoration: 'none' }}>
                  About
                </Link>
              </li>
              <li style={{ marginBottom: '0.5rem' }}>
                <Link href="/privacy" style={{ color: 'var(--primary)', textDecoration: 'none' }}>
                  Privacy Policy
                </Link>
              </li>
              <li style={{ marginBottom: '0.5rem' }}>
                <Link href="/contact" style={{ color: 'var(--primary)', textDecoration: 'none' }}>
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div style={{
          textAlign: 'center',
          paddingTop: '2rem',
          borderTop: '1px solid var(--border)',
          color: 'var(--foreground)',
          opacity: 0.6,
          fontSize: '0.9rem'
        }}>
          © {new Date().getFullYear()} FreeTools. All rights reserved. All processing happens in your browser.
        </div>
      </div>
    </footer>
  );
}
