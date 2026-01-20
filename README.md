# FreeTools - Free Online Tools

A modern, production-ready web application featuring 5 essential online tools
that work entirely in your browser. No uploads, no registration, completely
free.

## 🚀 Features

- **Image Format Converter** - Convert between JPEG, PNG, WEBP, BMP, and ICO
- **Crop & Resize Tool** - Resize images with preset aspect ratios or custom
  dimensions
- **Rotate & Flip Tool** - Rotate at any angle and flip images
- **QR Code Generator** - Create QR codes for URLs, WiFi, phone, email,
  WhatsApp, and UPI
- **Password Generator** - Generate strong, secure passwords with customization

## 🛠️ Tech Stack

- **Next.js 16.1.4** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Client-Side Processing** - All operations happen in the browser

## 📦 Installation

```bash
# Clone the repository
git clone <repository-url>
cd free-tools-app

# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 🎨 Features in Detail

### Image Tools

- **Batch Processing** - Upload and process multiple images at once
- **Drag & Drop** - Easy file upload with drag and drop support
- **Quality Control** - Adjust output quality for JPEG and WEBP
- **Live Preview** - See results before downloading
- **ZIP Downloads** - Download all processed images as a ZIP file

### QR Code Generator

- **Multiple Types** - URL, WiFi, Phone, SMS, Email, WhatsApp, UPI
- **Customization** - Colors, margins, and logo embedding
- **Multiple Formats** - Download as PNG or SVG
- **Live Preview** - See changes in real-time

### Password Generator

- **Customizable Length** - 8 to 64 characters
- **Character Options** - Uppercase, lowercase, numbers, symbols
- **Strength Meter** - Real-time password strength indicator
- **Exclude Similar** - Option to exclude confusing characters (O/0, l/1)

## 🔒 Privacy & Security

- **100% Client-Side** - All processing happens in your browser
- **No Data Collection** - We don't collect, store, or transmit any data
- **No Tracking** - No cookies, analytics, or tracking
- **No Registration** - Use all tools without creating an account

## 📱 Responsive Design

The application is fully responsive and works seamlessly on:

- Desktop computers
- Tablets
- Mobile phones

## 🌓 Theme Support

Automatically adapts to your system's dark/light mode preference for optimal
viewing comfort.

## 🏗️ Project Structure

```
free-tools-app/
├── app/
│   ├── components/      # Reusable components
│   ├── tools/          # Individual tool pages
│   ├── about/          # About page
│   ├── privacy/        # Privacy policy
│   ├── contact/        # Contact page
│   └── globals.css     # Global styles
├── public/             # Static assets
└── package.json        # Dependencies
```

## 🚀 Deployment

```bash
# Build for production
npm run build

# Start production server
npm start
```

The application can be deployed to any platform that supports Next.js:

- Vercel (recommended)
- Netlify
- AWS
- Google Cloud
- Self-hosted

## 📄 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

## 📧 Contact

For questions or support, please visit the Contact page in the application.

---

Built with ❤️ using Next.js and React
