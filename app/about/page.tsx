export default function AboutPage() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '2rem' }}>
        About FreeTools
      </h1>
      
      <div style={{ lineHeight: '1.8', fontSize: '1.05rem' }}>
        <p style={{ marginBottom: '1.5rem' }}>
          Welcome to FreeTools - your one-stop destination for essential online utilities. 
          All our tools work entirely in your browser, ensuring complete privacy and security.
        </p>

        <h2 style={{ fontSize: '1.75rem', fontWeight: '600', marginTop: '2rem', marginBottom: '1rem' }}>
          Our Tools
        </h2>

        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>
            🔄 Image Format Converter
          </h3>
          <p>
            Convert images between multiple formats including JPEG, PNG, WEBP, BMP, and ICO. 
            Supports batch processing and quality control for optimal results.
          </p>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>
            🎨 Image Editor
          </h3>
          <p>
            A powerful all-in-one tool to Rotate, Flip, Crop, and Resize your images. 
            Includes preset aspect ratios, custom dimensions, quality control, and format conversion.
          </p>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>
            📱 QR Code Generator
          </h3>
          <p>
            Generate professional QR codes for URLs, WiFi credentials, phone numbers, SMS, email, 
            WhatsApp messages, and UPI payments. Customize colors, patterns, and even embed your logo.
          </p>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>
            🔐 Password Generator
          </h3>
          <p>
            Create strong, secure passwords with customizable length and character options. 
            Includes strength meter and option to exclude similar-looking characters.
          </p>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>
            🔗 URL Shortener
          </h3>
          <p>
            Instantly shorten long URLs using reliable public services. 
             Perfect for sharing links on social media or messages where space is limited.
          </p>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>
            🔒 Hide Text in Image
          </h3>
          <p>
            Hide secret messages inside images using LSB steganography with optional AES encryption.
            Encode text into images and decode hidden messages - all processed locally in your browser.
          </p>
        </div>

        <h2 style={{ fontSize: '1.75rem', fontWeight: '600', marginTop: '2rem', marginBottom: '1rem' }}>
          Privacy & Security
        </h2>
        <p style={{ marginBottom: '1.5rem' }}>
          All processing happens directly in your browser. We never upload your files to any server, 
          ensuring complete privacy and security. Your data never leaves your device.
        </p>
      </div>
    </div>
  );
}
