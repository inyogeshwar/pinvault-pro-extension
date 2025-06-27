# Opera Installation Guide - PinSaver Pro

## Method 1: From Opera Add-ons Store (Recommended)
*Coming Soon - Extension will be available on the Opera Add-ons store*

## Method 2: Manual Installation (Developer Mode)

### Prerequisites
- Opera Browser version 77.0 or higher
- Downloaded extension package

### Step-by-Step Instructions

1. **Download the Extension**
   - Visit the [GitHub Releases page](https://github.com/inyogeshwar/pinvault-pro-extension/releases)
   - Download `PinSaver-Pro-Opera-v1.1.3.zip`

2. **Extract the Package**
   - Right-click the downloaded ZIP file
   - Select "Extract All" or use your preferred extraction tool
   - Extract to a permanent location (don't delete this folder later)

3. **Enable Developer Mode in Opera**
   - Open Opera browser
   - Type `opera://extensions/` in the address bar and press Enter
   - Toggle "Developer mode" switch in the top-right corner

4. **Load the Extension**
   - Click "Load unpacked" button
   - Navigate to the extracted folder from step 2
   - Select the folder and click "Select Folder"

5. **Verify Installation**
   - You should see "PinSaver Pro - Bulk Image Downloader" in your extensions list
   - Look for the PinSaver Pro icon in your browser toolbar
   - The extension should show as "Enabled"

6. **Test the Extension**
   - Go to any Pinterest page (e.g., pinterest.com)
   - Click the PinSaver Pro icon in your toolbar
   - You should see the popup interface

### Troubleshooting

#### Extension Not Loading
- Make sure you selected the correct folder (should contain `manifest.json`)
- Check that Developer mode is enabled
- Try refreshing the extensions page

#### Icon Not Showing
- Go to `opera://extensions/`
- Find PinSaver Pro and make sure it's enabled
- Check if the extension has proper permissions

#### Not Working on Pinterest
- Make sure you're on a Pinterest domain (*.pinterest.com)
- Try refreshing the Pinterest page
- Check browser console for any error messages

### Features Available in Opera Version
- ✅ Bulk image selection with visual checkboxes
- ✅ AI-powered auto-scroll functionality
- ✅ High-quality image downloads
- ✅ Smart file naming with timestamps
- ✅ Popup interface for quick access
- ✅ Sidebar interface for extended operations
- ✅ Real-time download progress feedback
- ✅ Support for all Pinterest international domains

### Permissions Explained
The Opera version requires these permissions:
- **downloads** - To save images to your computer
- **storage** - To remember your settings and preferences
- **contextMenus** - For right-click menu options
- **activeTab** - To access the current Pinterest tab
- **scripting** - To inject content scripts (Manifest V3)
- **sidePanel** - For the modern sidebar interface
- **windows** - For window management features

### Updates
Since this is a manual installation, you'll need to manually update:
1. Download the new version from GitHub Releases
2. Extract to the same location (overwriting old files)
3. Go to `opera://extensions/` and click the reload button for PinSaver Pro

### Support
If you encounter any issues:
1. Check our [GitHub Issues](https://github.com/inyogeshwar/pinvault-pro-extension/issues)
2. Create a new issue with details about your problem
3. Include your Opera version and operating system

---

**Note:** This extension works entirely locally on your device - no data is sent to external servers.
