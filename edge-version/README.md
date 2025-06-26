# PinVault Pro - Bulk Image Collector

A professional bulk image collection browser extension with AI-powered auto-scroll technology and intelligent vault organization.

## 📚 Documentation

For comprehensive documentation, visit our **[Project Wiki](WIKI.md)**:
- 🚀 [Getting Started Guide](README.md#-quick-start)
- 🗺️ [Project Roadmap](ROADMAP.md)
- 🔧 [Technical Documentation](TECHNICAL.md)
- 📊 [Development Status](STATUS.md)
- 🛠️ [Development Setup](DEVELOPMENT.md)

## 🚀 Quick Start

### For Users
1. Download the extension from Microsoft Edge Add-ons Store
2. Visit any supported image platform
3. Click the PinVault Pro icon in your browser toolbar
4. Start collecting images with one click!

## 📋 Features

- **🤖 AI-Powered Auto-Scroll**: Intelligent scrolling with automatic image detection
- **🔄 Dual Interface**: Both popup and sidebar modes for maximum flexibility
- **✨ Glassmorphism UI**: Modern, distinctive interface design
- **📦 Bulk Operations**: Select all, deselect all, and bulk download
- **🏷️ Smart Organization**: Timestamped vault organization
- **⚡ Real-time Sync**: Live synchronization between popup and sidebar
- **🎯 Precise Selection**: Individual image selection with visual feedback

## 🛠️ Installation

### From Microsoft Edge Add-ons Store (Recommended)
1. Visit the Microsoft Edge Add-ons Store
2. Search for "PinVault Pro"
3. Click "Get" to install

### Manual Installation (Developer Mode)
1. Download or clone this repository
2. Open Microsoft Edge and go to `edge://extensions/`
3. Enable "Developer mode" (toggle in left sidebar)
4. Click "Load unpacked"
5. Select the extension folder
6. The extension will appear in your toolbar

## 📁 Repository Structure

```
pinvault-pro-extension/
├── 📄 README.md              # This file
├── 📄 LICENSE                # MIT License
├── 📄 manifest.json          # Extension manifest
├── 🎨 popup.html             # Main popup interface
├── ⚙️ popup.js               # Popup functionality
├── 🎨 popup.css              # Popup styling
├── 🎨 sidebar.html           # Sidebar interface
├── ⚙️ sidebar.js             # Sidebar functionality
├── 🎨 sidebar.css            # Sidebar styling
├── ⚙️ content.js             # Content script
├── ⚙️ background.js          # Background service worker
├── 🎨 styles.css             # Injected styles
├── 🎨 welcome.html           # Welcome page
└── 📁 icons/                 # Extension icons
    ├── icon16.png
    ├── icon32.png
    ├── icon48.png
    └── icon128.png
```

## 🔧 Development

### File Overview
- **manifest.json**: Extension configuration and permissions
- **popup.html/js/css**: Main interface when clicking the extension icon
- **sidebar.html/js/css**: Side panel interface for extended functionality
- **content.js**: Script injected into web pages
- **background.js**: Service worker for background tasks
- **styles.css**: CSS injected into web pages

### Key Features Implementation
- **Auto-scroll**: Intelligent scrolling algorithm in `content.js`
- **Image Detection**: Advanced selectors for various image platforms
- **Dual Interface**: Synchronized popup and sidebar modes
- **Bulk Operations**: Efficient batch processing
- **Download Management**: Queue-based download system

## 🎯 Usage

### Basic Usage
1. Visit a supported image platform
2. Click the PinVault Pro extension icon
3. Images will be automatically detected and highlighted
4. Click individual images to select/deselect
5. Use "Download Selected" to save chosen images

### Advanced Features
- **Auto-scroll**: Enable to automatically scroll and find more images
- **Select All**: Choose all visible images at once
- **Sidebar Mode**: Open the sidebar for a larger interface
- **Bulk Download**: Download multiple images simultaneously

## 🔒 Privacy & Security

- **No Data Collection**: Extension doesn't collect personal data
- **Local Processing**: All operations happen locally in your browser
- **Secure Downloads**: Images downloaded directly to your device
- **Open Source**: Code is fully transparent and auditable

## 🐛 Troubleshooting

### Common Issues
1. **Extension not working**: Refresh the page and try again
2. **Images not detecting**: Make sure you're on a supported platform
3. **Download fails**: Check browser download permissions
4. **Interface not loading**: Disable other similar extensions

### Support
- Create an issue on GitHub
- Check existing issues for solutions
- Provide browser version and error details

## 📝 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📋 Changelog

### v1.1.3 (Current)
- Microsoft Edge certification compliance
- Removed brand-specific references
- Enhanced error handling
- Improved content script stability

## 🔗 Links

- [Microsoft Edge Add-ons Store](#) (Under Review - Store ID: 0RDCKC80KK2N)
- [GitHub Repository](https://github.com/inyogeshwar/pinvault-pro-extension)
- [Issues & Support](https://github.com/inyogeshwar/pinvault-pro-extension/issues)

## 👨‍💻 Author

**Yogeshwar Kumar**
- 💼 LinkedIn: [@yogeshwarkumarartist](https://linkedin.com/in/yogeshwarkumarartist)
- 🐙 GitHub: [@inyogeshwar](https://github.com/inyogeshwar)
- 📸 Instagram: [@theyogeshwara](https://instagram.com/theyogeshwara)
- 📧 Email: [yogeshwar853202@outlook.com](mailto:yogeshwar853202@outlook.com)
- 💬 Telegram: [@in_yogeshwar](https://t.me/in_yogeshwar)

---

**Made with ❤️ for content creators and power users**
