# FreeTools - Free Online Developer & Image Tools

A modern, production-ready web application featuring **15+ essential online
tools** that work entirely in your browser. No uploads to servers, no
registration, completely free and privacy-focused.

## 🚀 Features

### 🖼️ Image Tools

- **Image Format Converter** - Convert between JPEG, PNG, WEBP, BMP, and ICO
- **Crop & Resize Tool** - Resize images with preset aspect ratios or custom
  dimensions
- **Rotate & Flip Tool** - Rotate at any angle and flip images
- **Image Editor** - Advanced image editing capabilities
- **Steganography** - Hide secret messages in images

### 🔧 Developer Tools

- **QR Code Generator** - Create QR codes for URLs, WiFi, phone, email,
  WhatsApp, and UPI
- **Password Generator** - Generate strong, secure passwords with customization
- **URL Shortener** - Shorten long URLs using is.gd service
- **Base64 Encoder/Decoder** - Convert text and files to/from Base64
- **Color Converter** - Convert between HEX, RGB, HSL, and other color formats
- **Hash Generator** - Generate MD5, SHA-1, SHA-256, and other hashes
- **JSON Formatter** - Format, validate, and beautify JSON data
- **JWT Decoder** - Decode and inspect JSON Web Tokens
- **URL Encoder/Decoder** - Encode and decode URLs
- **UUID Generator** - Generate unique identifiers (v1, v4)

## 🛠️ Tech Stack & Optimization

- **Next.js 16** - React framework with App Router & TurboPack
- **React 19** - Latest React features including Server Components & Actions
- **TypeScript** - Full type-safety across the application
- **Responsive Design** - Fluid layouts for Mobile, Tablet, and Desktop
- **Performance Optimized**:
  - **Zero-Bundle Home**: Tool code is loaded on-demand only
  - **Lazy Loading**: Heavy libraries (`jszip`, `qrcode`, etc.) load only when
    used
  - **Client Components**: Client-side logic separated from server-rendered
    shell
- **Key Libraries**:
  - `jszip` - Client-side ZIP creation
  - `file-saver` - File downloads
  - `react-image-crop` - Advanced image cropping
  - `qrcode` - fast QR generation
  - Native `Crypto` API - Secure cryptographic operations in browser

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/Dark-Priyanshu/basic-tools.git
cd free-tools-app

# Install dependencies (Node.js 18+ recommended)
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
- **Steganography** - Hide and extract secret messages from images using AES-GCM
  encryption

### Developer Tools

#### QR Code Generator

- **Multiple Types** - URL, WiFi, Phone, SMS, Email, WhatsApp, UPI
- **Customization** - Colors, margins, and logo embedding
- **Multiple Formats** - Download as PNG or SVG
- **Live Preview** - See changes in real-time

#### Password Generator

- **Customizable Length** - 8 to 64 characters
- **Character Options** - Uppercase, lowercase, numbers, symbols
- **Strength Meter** - Real-time password strength indicator
- **Exclude Similar** - Option to exclude confusing characters (O/0, l/1)

#### Base64 Encoder/Decoder

- **Text Encoding** - Convert text to/from Base64
- **File Support** - Encode files to Base64
- **Copy to Clipboard** - Easy copying of results

#### Color Converter

- **Multiple Formats** - HEX, RGB, HSL, CMYK, HSV
- **Live Preview** - See color changes in real-time
- **Copy Support** - Quick copy to clipboard

#### Hash Generator

- **Multiple Algorithms** - MD5, SHA-1, SHA-256, SHA-384, SHA-512
- **Text & File Support** - Hash text or files
- **Instant Results** - Real-time hash generation

#### JSON Formatter

- **Format & Beautify** - Make JSON readable
- **Validation** - Check JSON syntax
- **Minify** - Compress JSON
- **Copy Support** - Easy copying of formatted JSON

#### JWT Decoder

- **Decode Tokens** - View JWT header and payload
- **Validation** - Check token structure
- **No Server** - All processing in browser

#### URL Encoder/Decoder

- **Encode URLs** - Convert special characters
- **Decode URLs** - Restore original URLs
- **Component Support** - Encode URL components

#### UUID Generator

- **Multiple Versions** - v1 (timestamp), v4 (random)
- **Bulk Generation** - Generate multiple UUIDs
- **Copy Support** - Quick copy to clipboard

## 🔒 Privacy & Security

- **100% Client-Side** - All processing happens in your browser
- **No Data Collection** - We don't collect, store, or transmit any data
- **No Tracking** - No cookies, analytics, or tracking
- **No Registration** - Use all tools without creating an account
- **Open Source** - Code is transparent and auditable

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
│   ├── components/      # Reusable components (Header, ToolCard, etc.)
│   ├── tools/          # Image & Utility tools components and pages
│   ├── dev/            # Developer tools components and pages
│   ├── about/          # About page
│   ├── privacy/        # Privacy policy
│   ├── contact/        # Contact page
│   └── globals.css     # Global styles & responsive utilities
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

## ⚙️ Configuration

The project includes optimized Next.js configuration:

- **Dynamic Imports** - Tools are loaded lazily to improve initial load time
- **TypeScript Support** - Full type safety
- **Optimized Build** - Fast production builds

## 📄 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📧 Contact

For questions or support, please visit the Contact page in the application or
open an issue on GitHub.

## 🙏 Acknowledgments

- Built with Next.js and React
- Styled with Tailwind CSS
- Icons and UI components from various open-source libraries

---

Built with ❤️ by [Dark-Priyanshu](https://github.com/Dark-Priyanshu)

**⭐ Star this repo if you find it useful!**
