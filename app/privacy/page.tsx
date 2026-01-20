export default function PrivacyPage() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '2rem' }}>
        Privacy Policy
      </h1>
      
      <div style={{ lineHeight: '1.8', fontSize: '1.05rem' }}>
        <p style={{ marginBottom: '1.5rem' }}>
          <strong>Last updated:</strong> {new Date().toLocaleDateString()}
        </p>

        <h2 style={{ fontSize: '1.75rem', fontWeight: '600', marginTop: '2rem', marginBottom: '1rem' }}>
          Your Privacy Matters
        </h2>
        <p style={{ marginBottom: '1.5rem' }}>
          At FreeTools, we take your privacy seriously. This policy explains how we handle your data 
          when you use our services.
        </p>

        <h2 style={{ fontSize: '1.75rem', fontWeight: '600', marginTop: '2rem', marginBottom: '1rem' }}>
          Data Processing
        </h2>
        <p style={{ marginBottom: '1.5rem' }}>
          All tools on this website process data entirely in your browser using JavaScript. 
          We do not upload, store, or transmit any of your files or data to our servers or any third-party servers.
        </p>

        <h2 style={{ fontSize: '1.75rem', fontWeight: '600', marginTop: '2rem', marginBottom: '1rem' }}>
          No Data Collection
        </h2>
        <p style={{ marginBottom: '1.5rem' }}>
          We do not collect, store, or process any personal information. We do not use cookies, 
          analytics, or tracking technologies. Your data remains completely private and secure on your device.
        </p>

        <h2 style={{ fontSize: '1.75rem', fontWeight: '600', marginTop: '2rem', marginBottom: '1rem' }}>
          No Account Required
        </h2>
        <p style={{ marginBottom: '1.5rem' }}>
          Our tools do not require registration, login, or any form of account creation. 
          You can use all features anonymously without providing any personal information.
        </p>

        <h2 style={{ fontSize: '1.75rem', fontWeight: '600', marginTop: '2rem', marginBottom: '1rem' }}>
          Third-Party Services
        </h2>
        <p style={{ marginBottom: '1.5rem' }}>
          We do not integrate with any third-party services that could access your data. 
          All functionality is self-contained within this website.
        </p>

        <h2 style={{ fontSize: '1.75rem', fontWeight: '600', marginTop: '2rem', marginBottom: '1rem' }}>
          Security
        </h2>
        <p style={{ marginBottom: '1.5rem' }}>
          Since all processing happens in your browser and we don't store any data, 
          your information is as secure as your own device. We recommend keeping your browser 
          and operating system up to date for optimal security.
        </p>

        <h2 style={{ fontSize: '1.75rem', fontWeight: '600', marginTop: '2rem', marginBottom: '1rem' }}>
          Changes to This Policy
        </h2>
        <p style={{ marginBottom: '1.5rem' }}>
          We may update this privacy policy from time to time. Any changes will be posted on this page 
          with an updated revision date.
        </p>
      </div>
    </div>
  );
}
