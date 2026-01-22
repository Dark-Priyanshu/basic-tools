import ToolCard from './components/ToolCard';

export default function Home() {
  const tools = [
    {
      title: 'Image Converter',
      description: 'Convert images between JPEG, PNG, WEBP, BMP, and ICO formats with quality control.',
      icon: '🔄',
      href: '/tools/convert',
      bgImage: '/assets/image-editor-bg.webp'
    },
    {
      title: 'Image Editor',
      description: 'The all-in-one tool to Rotate, Flip, Crop, and Resize your images.',
      icon: '🎨',
      href: '/tools/editor',
      bgImage: '/assets/image-editor-bg.webp'
    },
    {
      title: 'QR Code Generator',
      description: 'Generate customizable QR codes for URLs, WiFi, phone, email, WhatsApp, and UPI payments.',
      icon: '📱',
      href: '/tools/qr',
      bgImage: '/assets/qr-bg.webp'
    },
    {
      title: 'Password Generator',
      description: 'Create strong, secure passwords with customizable length and character options.',
      icon: '🔐',
      href: '/tools/password',
      bgImage: '/assets/password-bg.webp'
    },
    {
      title: 'URL Shortener',
      description: 'Shorten long URLs into compact, shareable links instantly.',
      icon: '🔗',
      href: '/tools/shorten',
      bgImage: '/assets/url-shortener-bg.webp'
    },
    {
      title: 'Hide Text in Image',
      description: 'Hide secret messages inside images using steganography with optional encryption.',
      icon: '🔒',
      href: '/tools/steganography',
      bgImage: '/assets/steganography-bg.webp'
    },
    // Developer Tools
    {
      title: 'JSON Formatter',
      description: 'Format, minify, and validate JSON data with error highlighting.',
      icon: '📝',
      href: '/dev/json-formatter',
      bgImage: '/assets/json-formattor-bg.webp'
    },
    {
      title: 'Base64 Converter',
      description: 'Encode and decode Base64 strings with UTF-8 support.',
      icon: '🔤',
      href: '/dev/base64',
      bgImage: '/assets/base64-convertor-bg.webp'
    },
    {
      title: 'Hash Generator',
      description: 'Generate MD5, SHA-1, SHA-256, and SHA-512 hashes instantly.',
      icon: '#️⃣',
      href: '/dev/hash-generator',
      bgImage: '/assets/hash-generator-bg.webp'
    },
    {
      title: 'JWT Decoder',
      description: 'Decode and inspect JSON Web Tokens (Header & Payload).',
      icon: '🔑',
      href: '/dev/jwt-decoder',
      bgImage: '/assets/jwt-decoder-bg.webp'
    },
    {
      title: 'URL Encoder',
      description: 'Encode and decode URL-encoded strings safely.',
      icon: '🌐',
      href: '/dev/url-encoder',
      bgImage: '/assets/url-encoder-bg.webp'
    },
    {
      title: 'Color Converter',
      description: 'Convert between HEX, RGB, and HSL with live preview.',
      icon: '🎨',
      href: '/dev/color-converter',
      bgImage: '/assets/color-converter-bg.webp'
    },
    {
      title: 'UUID Generator',
      description: 'Generate random UUID v4 identifiers in bulk.',
      icon: '🆔',
      href: '/dev/uuid-generator',
      bgImage: '/assets/uuid-generator-bg.webp'
    }
  ];

  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ marginBottom: '1rem', fontWeight: 'bold' }}>
           {/* Font size is handled by globals.css media queries now */}
           <span style={{ fontSize: '2.5rem' }} className="responsive-h1">Free Online Tools</span>
        </h1>
        <p style={{ fontSize: '1.1rem', opacity: 0.8, maxWidth: '600px', margin: '0 auto' }}>
          Professional tools that work entirely in your browser. No uploads, no registration, completely free.
        </p>
      </div>

      <div className="tools-grid">
        {tools.map((tool) => (
          <ToolCard key={tool.href} {...tool} />
        ))}
      </div>
    </div>
  );
}
