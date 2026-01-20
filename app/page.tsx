import ToolCard from './components/ToolCard';

export default function Home() {
  const tools = [
    {
      title: 'Image Converter',
      description: 'Convert images between JPEG, PNG, WEBP, BMP, and ICO formats with quality control.',
      icon: '🔄',
      href: '/tools/convert',
      bgImage: '/assets/image-editor-bg.png'
    },
    {
      title: 'Image Editor',
      description: 'The all-in-one tool to Rotate, Flip, Crop, and Resize your images.',
      icon: '🎨',
      href: '/tools/editor',
      bgImage: '/assets/image-editor-bg.png'
    },
    {
      title: 'QR Code Generator',
      description: 'Generate customizable QR codes for URLs, WiFi, phone, email, WhatsApp, and UPI payments.',
      icon: '📱',
      href: '/tools/qr',
      bgImage: '/assets/qr-bg.png'
    },
    {
      title: 'Password Generator',
      description: 'Create strong, secure passwords with customizable length and character options.',
      icon: '🔐',
      href: '/tools/password',
      bgImage: '/assets/password-bg.png'
    },
    {
      title: 'URL Shortener',
      description: 'Shorten long URLs into compact, shareable links instantly.',
      icon: '🔗',
      href: '/tools/shorten',
      bgImage: '/assets/url-shortener-bg.png'
    },
    {
      title: 'Hide Text in Image',
      description: 'Hide secret messages inside images using steganography with optional encryption.',
      icon: '🔒',
      href: '/tools/steganography',
      bgImage: '/assets/steganography-bg.png'
    }
  ];

  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
          Free Online Tools
        </h1>
        <p style={{ fontSize: '1.1rem', opacity: 0.8, maxWidth: '600px', margin: '0 auto' }}>
          Professional tools that work entirely in your browser. No uploads, no registration, completely free.
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        {tools.map((tool) => (
          <ToolCard key={tool.href} {...tool} />
        ))}
      </div>
    </div>
  );
}
