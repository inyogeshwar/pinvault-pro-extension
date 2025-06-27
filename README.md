# PinSaver Pro - Bulk Image Downloader

[![Firefox Add-on](https://img.shields.io/badge/Firefox-Compatible-orange?logo=firefox)](https://addons.mozilla.org)
[![Edge Add-on](https://img.shields.io/badge/Edge-Compatible-blue?logo=microsoftedge)](https://microsoftedge.microsoft.com/addons)
[![Chrome Extension](https://img.shields.io/badge/Chrome-Compatible-green?logo=googlechrome)](https://chrome.google.com/webstore)
[![Opera Add-on](https://img.shields.io/badge/Opera-Compatible-red?logo=opera)](https://addons.opera.com)
[![GitHub Release](https://img.shields.io/github/v/release/inyogeshwar/pinvault-pro-extension?logo=github)](https://github.com/inyogeshwar/pinvault-pro-extension/releases/latest)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Downloads](https://img.shields.io/github/downloads/inyogeshwar/pinvault-pro-extension/total?logo=download)](https://github.com/inyogeshwar/pinvault-pro-extension/releases)

> **Professional bulk image downloading tool for Pinterest with AI-powered auto-scroll technology, real-time dual-interface synchronization, and intelligent vault organization.**

![PinSaver Pro Demo](https://via.placeholder.com/800x400/667eea/ffffff?text=PinSaver+Pro+Demo)

## 🚀 Features

### ✨ **Core Functionality**
- **🖼️ Bulk Image Selection** - Select multiple Pinterest images with visual checkboxes
- **⚡ AI-Powered Auto-Scroll** - Automatically loads more content as you browse
- **📥 High-Quality Downloads** - Fetches original resolution images automatically
- **🏷️ Smart Naming** - Intelligent timestamped file organization
- **🎯 Visual Feedback** - Real-time download status indicators

### 🔧 **Advanced Features**
- **📱 Dual Interface** - Popup + sidebar for optimal workflow
- **🔄 Real-Time Sync** - Seamless coordination between interfaces
- **🌐 Global Pinterest Support** - Works on all Pinterest international domains
- **💾 Local Processing** - No external servers, all processing is local
- **🎨 Glassmorphism UI** - Modern, responsive design

### 🌍 **Platform Support**
- **🦊 Firefox Desktop** (79.0+)
- **📱 Firefox for Android** (113.0+)
- **🌐 Microsoft Edge** (Chromium-based)
- **🟢 Google Chrome** (Manifest V3)
- **🔴 Opera Browser** (77.0+)

## 📦 Installation

### Firefox
1. **From Mozilla Add-ons (AMO):** [Install PinSaver Pro](https://addons.mozilla.org) *(Coming Soon)*
2. **From GitHub Releases:** [Download Firefox XPI](https://github.com/inyogeshwar/pinvault-pro-extension/releases/latest/download/PinSaver-Pro-Firefox-v1.1.3.xpi)
3. **Manual Installation:**
   - Download `PinSaver-Pro-Firefox-v1.1.3.xpi` from [Releases](https://github.com/inyogeshwar/pinvault-pro-extension/releases)
   - Open Firefox → Add-ons Manager → Install Add-on From File

### Edge/Chrome
1. **From Microsoft Edge Add-ons:** [Install PinSaver Pro](https://microsoftedge.microsoft.com/addons) *(Coming Soon)*
2. **From GitHub Releases:** [Download Edge ZIP](https://github.com/inyogeshwar/pinvault-pro-extension/releases/latest/download/PinSaver-Pro-Edge-v1.1.3.zip)
3. **Manual Installation:**
   - Download `PinSaver-Pro-Edge-v1.1.3.zip` from [Releases](https://github.com/inyogeshwar/pinvault-pro-extension/releases)
   - Extract and load as unpacked extension

### Opera
1. **From Opera Add-ons:** [Install PinSaver Pro](https://addons.opera.com) *(Coming Soon)*
2. **From GitHub Releases:** [Download Opera ZIP](https://github.com/inyogeshwar/pinvault-pro-extension/releases/latest/download/PinSaver-Pro-Opera-v1.1.3.zip)
3. **Manual Installation:**
   - Download `PinSaver-Pro-Opera-v1.1.3.zip` from [Releases](https://github.com/inyogeshwar/pinvault-pro-extension/releases)
   - Extract ZIP file
   - Open `opera://extensions/` → Enable Developer mode → Load unpacked

## 🎯 Usage

### Getting Started
1. **📌 Navigate to Pinterest** - Open any Pinterest page or board
2. **🔍 Browse Images** - Images will automatically get selection overlays
3. **✅ Select Images** - Click checkbox overlays to select desired images
4. **⚡ Auto-Scroll** - Use auto-scroll to load more content automatically
5. **📥 Bulk Download** - Use popup or sidebar to download selected images

### Interface Options

#### 🎛️ **Popup Interface** (Primary)
- Click the PinSaver Pro icon in your browser toolbar
- Quick access to all controls and image counts
- Perfect for fast operations

#### 📋 **Sidebar Interface** (Desktop Only)
- Extended interface with detailed controls
- Real-time image preview and management
- Ideal for large bulk operations

### 🚀 **Auto-Scroll Feature**
- **Activate:** Click "Start Auto-Scroll" in popup/sidebar
- **Smart Detection:** Automatically detects when to load more content
- **Rate Limiting:** Respects Pinterest's loading patterns
- **Manual Stop:** Click "Stop Auto-Scroll" when finished

## 🏗️ Project Structure

```
pinvault-pro-extension/
├── 📁 firefox-version/          # Firefox Manifest V2
│   ├── manifest.json           # Firefox-specific manifest
│   ├── background.js           # Event page (non-persistent)
│   ├── content.js              # Pinterest page injection
│   ├── popup.html/js/css       # Toolbar popup interface
│   ├── sidebar.html/js/css     # Sidebar interface
│   ├── welcome.html/js         # Welcome/onboarding page
│   ├── styles.css              # Global styles
│   └── icons/                  # Extension icons
│
├── 📁 edge-version/             # Edge/Chrome Manifest V3
│   ├── manifest.json           # Manifest V3 specification
│   ├── background.js           # Service worker
│   ├── content.js              # Pinterest page injection
│   ├── popup.html/js/css       # Action popup interface
│   ├── sidebar.html/js/css     # Side panel interface
│   └── icons/                  # Extension icons
│
├── � opera-version/            # Opera Manifest V3
│   ├── manifest.json           # Opera-specific manifest
│   ├── background.js           # Service worker
│   ├── content.js              # Pinterest page injection
│   ├── popup.html/js/css       # Action popup interface
│   ├── sidebar.html/js/css     # Side panel interface
│   └── icons/                  # Extension icons
│
├── �📦 PinSaver-Pro-Firefox-v1.1.3.zip    # Firefox package
├── 📦 PinSaver-Pro-Firefox-v1.1.3.xpi    # Firefox XPI
├── 📦 PinSaver-Pro-Edge-v1.1.3.zip       # Edge/Chrome package
├── 📦 PinSaver-Pro-Opera-v1.1.3.zip      # Opera package
├── 📦 PinSaver-Pro-Opera-v1.1.3.nex      # Opera NEX format
└── 📄 README.md                           # This file
```

## 📥 Releases

All extension packages are available in [GitHub Releases](https://github.com/inyogeshwar/pinvault-pro-extension/releases):

### Latest Release: v1.1.3
- **🦊 Firefox:** [`PinSaver-Pro-Firefox-v1.1.3.xpi`](https://github.com/inyogeshwar/pinvault-pro-extension/releases/latest/download/PinSaver-Pro-Firefox-v1.1.3.xpi) *(61.4 KB)*
- **🌐 Edge/Chrome:** [`PinSaver-Pro-Edge-v1.1.3.zip`](https://github.com/inyogeshwar/pinvault-pro-extension/releases/latest/download/PinSaver-Pro-Edge-v1.1.3.zip) *(60.0 KB)*
- **🔴 Opera:** [`PinSaver-Pro-Opera-v1.1.3.zip`](https://github.com/inyogeshwar/pinvault-pro-extension/releases/latest/download/PinSaver-Pro-Opera-v1.1.3.zip) *(58.8 KB)*

### Installation from Releases
1. **Visit:** [GitHub Releases Page](https://github.com/inyogeshwar/pinvault-pro-extension/releases)
2. **Download:** The appropriate package for your browser
3. **Install:** Follow platform-specific installation instructions above

## 🔧 Development

### Prerequisites
- **Node.js** (for any build tools, optional)
- **Git** for version control
- **Browser** with developer mode enabled

### Setup
```bash
# Clone the repository
git clone https://github.com/inyogeshwar/pinvault-pro-extension.git
cd pinvault-pro-extension

# For Firefox development
cd firefox-version

# For Edge/Chrome development  
cd edge-version
```

### Testing
1. **Firefox:**
   - Open `about:debugging`
   - Load temporary add-on from `firefox-version/manifest.json`

2. **Edge/Chrome:**
   - Open Extensions page → Developer mode
   - Load unpacked from `edge-version/` folder

3. **Opera:**
   - Open `opera://extensions/` → Developer mode
   - Load unpacked from `opera-version/` folder

### Building Packages
```bash
# Create Firefox package
python create_pinsaver_package.py

# Create Edge package  
python create_edge_package.py

# Create Opera package
python create_opera_package.py
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Workflow
1. **🍴 Fork** the repository
2. **🌿 Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **💻 Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **📤 Push** to the branch (`git push origin feature/amazing-feature`)
5. **🔄 Open** a Pull Request

### Code Style
- **JavaScript:** ES6+ with async/await
- **HTML:** Semantic HTML5
- **CSS:** Modern CSS with custom properties
- **Comments:** Clear, descriptive comments for complex logic

## 📋 Permissions Explained

### Firefox Version
- **`downloads`** - Save images to your computer
- **`storage`** - Remember your settings and preferences
- **`contextMenus`** - Right-click menu options
- **`activeTab`** - Access current Pinterest tab
- **`tabs`** - Manage extension tabs
- **`*://*.pinterest.com/*`** - Access Pinterest domains globally

### Edge/Chrome Version
- **`downloads`** - Save images to your computer
- **`storage`** - Remember your settings and preferences
- **`contextMenus`** - Right-click menu options
- **`activeTab`** - Access current Pinterest tab
- **`scripting`** - Inject content scripts (Manifest V3)
- **`sidePanel`** - Modern sidebar interface
- **`windows`** - Window management

### Opera Version
- **`downloads`** - Save images to your computer
- **`storage`** - Remember your settings and preferences
- **`contextMenus`** - Right-click menu options
- **`activeTab`** - Access current Pinterest tab
- **`scripting`** - Inject content scripts (Manifest V3)
- **`sidePanel`** - Modern sidebar interface
- **`windows`** - Window management

## 🛡️ Privacy & Security

- **🔒 No Data Collection** - We don't collect or store any personal data
- **💻 Local Processing** - All image processing happens on your device
- **🚫 No External Servers** - No data is sent to external servers
- **🎯 Pinterest Only** - Extension only works on Pinterest domains
- **📝 Open Source** - Full source code available for inspection

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🐛 Bug Reports & Feature Requests

Found a bug or have a feature request? Please create an issue:

1. **🐛 Bug Reports:** [Create Bug Report](https://github.com/inyogeshwar/pinvault-pro-extension/issues/new?template=bug_report.md)
2. **✨ Feature Requests:** [Request Feature](https://github.com/inyogeshwar/pinvault-pro-extension/issues/new?template=feature_request.md)

## 📞 Support

- **📧 Email:** [yogeshwar853202@outlook.com](mailto:yogeshwar853202@outlook.com)
- **🐙 GitHub Issues:** [Repository Issues](https://github.com/inyogeshwar/pinvault-pro-extension/issues)
- **📖 Documentation:** [Wiki](https://github.com/inyogeshwar/pinvault-pro-extension/wiki)

## 🎉 Acknowledgments

- **🎨 UI Inspiration** - Modern glassmorphism design trends
- **🔧 Pinterest API** - Built to work seamlessly with Pinterest's interface
- **🌐 Browser APIs** - Leveraging modern extension APIs for optimal performance
- **👥 Community** - Thanks to all contributors and testers

## 📊 Changelog

### v1.1.3 (2025-06-26)
- **🔄 Rebranded** from PinVault Pro to PinSaver Pro
- **🦊 Firefox Support** - Full Firefox desktop and Android compatibility
- **🌐 Edge Support** - Manifest V3 with modern APIs
- **✅ Validation** - Zero errors/warnings on Firefox AMO
- **🎨 UI Updates** - Improved glassmorphism interface
- **📱 Multi-platform** - Unified experience across browsers

---

<div align="center">

**Made with ❤️ for the Pinterest community**

[⭐ Star this repo](https://github.com/inyogeshwar/pinvault-pro-extension) | [🐛 Report Bug](https://github.com/inyogeshwar/pinvault-pro-extension/issues) | [✨ Request Feature](https://github.com/inyogeshwar/pinvault-pro-extension/issues)

</div>
