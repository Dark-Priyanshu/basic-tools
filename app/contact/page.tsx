export default function ContactPage() {
  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '2rem' }}>
        Contact Us
      </h1>
      
      <div style={{ lineHeight: '1.8', fontSize: '1.05rem' }}>
        <p style={{ marginBottom: '2rem' }}>
          Have questions, suggestions, or feedback about our tools? We'd love to hear from you!
        </p>

        <div className="card" style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem' }}>
            Get in Touch
          </h2>
          <p style={{ marginBottom: '1rem' }}>
            For general inquiries, feature requests, or bug reports, please reach out to us:
          </p>
          <p style={{ marginBottom: '0.5rem' }}>
            <strong>Email:</strong> <a href="mailto:Priyanshushakya016@outlook.com" 
              style={{ color: 'var(--primary)', textDecoration: 'none' }}>
              Priyanshushakya016@outlook.com
            </a>
          </p>
        </div>

        <div className="card">
          <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem' }}>
            Frequently Asked Questions
          </h2>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.5rem' }}>
              Are these tools really free?
            </h3>
            <p>
              Yes! All our tools are completely free to use with no hidden costs or limitations.
            </p>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.5rem' }}>
              Is my data safe?
            </h3>
            <p>
              Absolutely. All processing happens in your browser. We never upload or store your files.
            </p>
          </div>

          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.5rem' }}>
              Can I use these tools offline?
            </h3>
            <p>
              Once the page is loaded, most tools will work offline since processing happens in your browser.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
