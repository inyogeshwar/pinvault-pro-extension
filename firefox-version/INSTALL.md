# Firefox Installation Guide for PinVault Pro

## Quick Start

### Option 1: Load as Temporary Add-on (Development/Testing)
1. **Open Firefox** (version 57.0 or higher)
2. **Navigate to** `about:debugging` in the address bar
3. **Click** "This Firefox" in the left sidebar
4. **Click** "Load Temporary Add-on..." button
5. **Browse to** the `firefox-version` folder
6. **Select** the `manifest.json` file
7. **Click** "Open"

The extension will now be loaded and you'll see it in your toolbar!

### Option 2: Package as XPI (For Distribution)

If you want to create a permanent installation file:

1. **Zip the contents** of the `firefox-version` folder
2. **Rename** the `.zip` file to `.xpi`
3. **Drag and drop** the `.xpi` file into Firefox
4. **Allow** the installation when prompted

## Setup Instructions

### After Installation:
1. **Navigate** to any Pinterest website (pinterest.com, pinterest.co.uk, etc.)
2. **Click** the PinVault Pro icon in your toolbar
3. **Start selecting images** by clicking on them
4. **Use the popup** or **sidebar** to manage downloads

### Enable Sidebar (Recommended):
1. **Right-click** on the toolbar
2. **Select** "Customize"
3. **Look for** the sidebar button or
4. **Use** `Ctrl+Shift+E` (or `Cmd+Shift+E` on Mac) to toggle sidebar
5. **Select** "PinVault Pro" from the sidebar options

## Permissions Required

The extension will request these permissions:
- ✅ **Downloads**: To save images to your computer
- ✅ **Storage**: To save your settings
- ✅ **Active Tab**: To interact with Pinterest pages
- ✅ **Context Menus**: For right-click download options
- ✅ **Pinterest Domains**: To work on all Pinterest websites

## Features Available

### Core Features:
- 🖼️ **Bulk Image Selection**: Click images to select/deselect
- 📥 **Batch Download**: Download multiple images at once
- 🔄 **Auto-scroll**: Automatically scroll to load more images
- ⚙️ **Quality Settings**: Download highest quality available
- 📁 **Smart Organization**: Organize downloads by date/board
- 🎯 **Right-click Context Menu**: Quick download individual images

### Interfaces:
- 🔲 **Popup Interface**: Click the toolbar icon
- 📌 **Sidebar Interface**: Use Firefox's sidebar for persistent access
- 🌐 **Pinterest Integration**: Works on all Pinterest domains

## Troubleshooting

### Extension Not Working?
1. **Check Firefox Version**: Must be 57.0 or higher
2. **Refresh Pinterest**: Press F5 on the Pinterest page
3. **Reload Extension**: Go to `about:debugging` and reload
4. **Check Permissions**: Ensure all permissions are granted

### Images Not Selecting?
1. **Wait for Page Load**: Let Pinterest fully load
2. **Try Different Images**: Some images might not be selectable
3. **Check Console**: Press F12 and look for errors

### Downloads Not Starting?
1. **Check Download Permissions**: Firefox needs download permission
2. **Try Different Folder**: Change download location in settings
3. **Disable Other Extensions**: Temporarily disable other download managers

### Performance Issues?
1. **Limit Auto-scroll**: Turn off auto-scroll if page becomes slow
2. **Select Fewer Images**: Try downloading in smaller batches
3. **Close Other Tabs**: Free up memory for better performance

## Differences from Chrome Version

### What's Different:
- 📌 **Sidebar**: Uses Firefox's native sidebar instead of Chrome's side panel
- ⚡ **Background Script**: Optimized for Firefox's Manifest V2
- 🔧 **API Calls**: Uses Firefox's `browser.*` APIs

### What's the Same:
- 🎨 **User Interface**: Identical visual experience
- ⚙️ **All Features**: Same functionality and capabilities
- 📥 **Download Logic**: Same intelligent download system

## Support

### Common Issues:
- **"Not on Pinterest"**: Make sure you're on a Pinterest domain
- **No Images Found**: Wait for page to fully load, try refreshing
- **Download Fails**: Check Firefox download settings

### Getting Help:
- Check the browser console (F12) for error messages
- Verify you're on a supported Pinterest domain
- Ensure Firefox version is 57.0 or higher

## Privacy & Security

- 🔒 **Local Processing**: All image processing happens locally
- 🚫 **No Data Collection**: Extension doesn't collect or send data
- 🛡️ **Pinterest Only**: Only works on Pinterest domains
- 💾 **Local Storage**: Settings saved locally in Firefox

## Version Notes

This Firefox version is fully compatible with the Chrome version and includes all the same professional features:
- AI-powered auto-scroll technology
- Real-time interface synchronization
- Advanced organization options
- High-quality image extraction
