# PinVault Pro Extension - Firefox Version

## About
This is the Firefox-compatible version of PinVault Pro - a professional bulk image collection tool for Pinterest. This version has been adapted to work with Firefox's WebExtensions API and Manifest V2.

## Key Differences from Chrome Version

### Manifest Differences
- **Manifest Version**: Uses Manifest V2 (Firefox standard) instead of V3
- **Background Scripts**: Uses `background.scripts` instead of `service_worker`
- **Permissions**: Includes host permissions directly in the permissions array
- **Browser Action**: Uses `browser_action` instead of `action`
- **Sidebar**: Uses `sidebar_action` instead of `side_panel`
- **Applications**: Includes Firefox-specific `applications.gecko` configuration

### API Differences
- **Browser API**: Uses `browser.*` instead of `chrome.*` APIs
- **Message Handling**: Adapted for Firefox's Promise-based messaging
- **Script Injection**: Uses `browser.tabs.executeScript` instead of `chrome.scripting.executeScript`
- **Downloads**: Uses Firefox's `browser.downloads` API

### Features
- ✅ Bulk image selection and download
- ✅ Auto-scroll functionality
- ✅ High-quality image extraction
- ✅ Popup interface
- ✅ Sidebar interface (Firefox sidebar)
- ✅ Context menu integration
- ✅ Settings persistence
- ✅ Progress tracking

## Installation

### For Development
1. Open Firefox
2. Navigate to `about:debugging`
3. Click "This Firefox"
4. Click "Load Temporary Add-on"
5. Select the `manifest.json` file from this directory

### For Production
1. Package the extension as a .xpi file
2. Submit to Firefox Add-ons (AMO) for review and distribution

## Browser Compatibility
- **Minimum Firefox Version**: 57.0+
- **Tested On**: Firefox 115+ (ESR and regular)

## File Structure
```
firefox-version/
├── manifest.json          # Firefox Manifest V2
├── background.js          # Firefox-compatible background script
├── content.js            # Firefox-compatible content script
├── popup.html            # Popup HTML (same as Chrome)
├── popup.js             # Firefox-compatible popup script
├── popup.css            # Popup styles (same as Chrome)
├── sidebar.html         # Sidebar HTML (same as Chrome)
├── sidebar.js          # Firefox-compatible sidebar script
├── sidebar.css         # Sidebar styles (same as Chrome)
├── styles.css          # Content script styles (same as Chrome)
├── welcome.html        # Welcome page (same as Chrome)
├── LICENSE            # License file
├── INSTALL.md         # Firefox installation guide
└── icons/            # Extension icons (included)
    ├── icon16.png     # 16x16 toolbar icon
    ├── icon32.png     # 32x32 toolbar icon
    ├── icon48.png     # 48x48 menu icon
    └── icon128.png    # 128x128 extension icon
```

## Key Technical Changes

### Background Script
- Replaced `chrome.*` with `browser.*`
- Updated message handling to use Promises instead of callbacks
- Adapted for Firefox's background page model

### Content Script
- Updated message listener to return Promises
- Maintained compatibility with Pinterest's dynamic loading

### Popup & Sidebar
- Converted Chrome API calls to Firefox equivalents
- Updated tab querying and script execution methods
- Adapted sidebar functionality for Firefox's sidebar API

## Development Notes

### Testing
- Test on multiple Pinterest domains (.com, .co.uk, .fr, etc.)
- Verify auto-scroll functionality across different Pinterest layouts
- Test download functionality with various image formats
- Ensure settings persistence works correctly

### Debugging
- Use Firefox Developer Tools
- Check Browser Console for extension errors
- Use `about:debugging` for extension inspection

## Known Limitations
- Firefox sidebar behavior differs slightly from Chrome's side panel
- Some Firefox versions may have different permission handling
- Download progress tracking may vary based on Firefox version

## Support
For issues specific to the Firefox version, please check:
1. Firefox version compatibility (57.0+)
2. Extension permissions
3. Pinterest website compatibility
4. Browser console for errors

## License
Same as the original Chrome version - see LICENSE file for details.
