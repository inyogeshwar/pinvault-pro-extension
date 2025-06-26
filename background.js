// Background script for PinVault Pro Extension
class PinVaultProBackground {
    constructor() {
        this.activeDownloads = new Map();
        this.downloadQueue = [];
        this.isProcessingQueue = false;
        this.maxConcurrentDownloads = 3;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupContextMenu();
        this.setupDownloadHandlers();
        this.setupSidePanel();
    }

    setupEventListeners() {
        // Extension installed/updated
        chrome.runtime.onInstalled.addListener((details) => {
            this.handleInstallation(details);
        });

        // Message handling
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            this.handleMessage(request, sender, sendResponse);
            return true; // Keep channel open for async response
        });

        // Tab updates
        chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
            this.handleTabUpdate(tabId, changeInfo, tab);
        });
    }

    setupContextMenu() {
        // Remove existing context menu items to prevent duplicates
        chrome.contextMenus.removeAll(() => {
            chrome.contextMenus.create({
                id: 'pinvault-download-image',
                title: 'Collect with PinVault Pro',
                contexts: ['image'],
                documentUrlPatterns: [
                    '*://*.pinterest.com/*',
                    '*://*.pinterest.co.uk/*',
                    '*://*.pinterest.fr/*',
                    '*://*.pinterest.de/*',
                    '*://*.pinterest.es/*',
                    '*://*.pinterest.it/*',
                    '*://*.pinterest.jp/*',
                    '*://*.pinterest.ca/*',
                    '*://*.pinterest.au/*',
                    '*://*.pinterest.in/*',
                    '*://*.pinterest.mx/*',
                    '*://*.pinterest.se/*',
                    '*://*.pinterest.dk/*',
                    '*://*.pinterest.no/*',
                    '*://*.pinterest.pt/*',
                    '*://*.pinterest.ru/*',
                    '*://*.pinterest.kr/*',
                    '*://*.pinterest.ph/*',
                    '*://*.pinterest.nz/*',
                    '*://*.pinterest.cl/*',
                    '*://*.pinterest.com.mx/*'
                ]
            });
        });

        chrome.contextMenus.onClicked.addListener((info, tab) => {
            this.handleContextMenuClick(info, tab);
        });
    }

    setupDownloadHandlers() {
        // Monitor download progress
        chrome.downloads.onChanged.addListener((downloadDelta) => {
            this.handleDownloadChange(downloadDelta);
        });

        // Handle download completion
        chrome.downloads.onDeterminingFilename.addListener((downloadItem, suggest) => {
            this.handleDownloadFilename(downloadItem, suggest);
        });
    }

    setupSidePanel() {
        // Set up side panel for Pinterest pages
        if (chrome.sidePanel) {
            try {
                chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: false });
            } catch (error) {
                console.log('Side panel API not fully available:', error);
            }
        }
    }

    handleInstallation(details) {
        if (details.reason === 'install') {
            // Set default settings
            chrome.storage.sync.set({
                language: 'en',
                filenameFormat: 'title_date',
                highQuality: true,
                privacyMode: false,
                autoScroll: false,
                maxConcurrentDownloads: 3,
                downloadPath: ''
            });

            console.log('PinVault Pro - Advanced Pinterest Image Harvester installed successfully!');
        } else if (details.reason === 'update') {
            // Handle updates
            this.handleUpdate(details.previousVersion);
        }
    }

    handleUpdate(previousVersion) {
        // Perform migration tasks if needed
        console.log(`Updated from version ${previousVersion}`);
        
        // Log update instead of showing notification
        console.log('PinVault Pro - Advanced Pinterest Image Harvester Updated: New professional features and improvements are now available!');
    }

    async handleMessage(request, sender, sendResponse) {
        try {
            switch (request.action) {
                case 'ping':
                    sendResponse({ status: 'ready', timestamp: Date.now() });
                    break;
                    
                case 'downloadImage':
                    const downloadId = await this.downloadSingleImage(request.imageData, request.settings);
                    sendResponse({ success: true, downloadId });
                    break;

                case 'downloadImages':
                    console.log('Background: Received downloadImages request with', request.images?.length || 0, 'images');
                    const results = await this.downloadMultipleImages(request.images || request.urls, request.settings);
                    sendResponse({ success: true, results });
                    break;

                case 'cancelDownload':
                    await this.cancelDownload(request.downloadId);
                    sendResponse({ success: true });
                    break;

                case 'getDownloadStats':
                    const stats = this.getDownloadStats();
                    sendResponse({ stats });
                    break;

                case 'openOptionsPage':
                    chrome.runtime.openOptionsPage();
                    sendResponse({ success: true });
                    break;

                default:
                    console.warn('Background: Unknown action:', request.action);
                    sendResponse({ error: 'Unknown action' });
            }
        } catch (error) {
            console.error('Error handling message:', error);
            sendResponse({ error: error.message });
        }
    }

    handleTabUpdate(tabId, changeInfo, tab) {
        // Inject content script if navigating to Pinterest
        if (changeInfo.status === 'complete' && tab.url && this.isPinterestUrl(tab.url)) {
            // Check if content script is already injected
            chrome.scripting.executeScript({
                target: { tabId: tabId },
                func: () => window.pinVaultContentLoaded || false
            }).then(results => {
                if (!results[0].result) {
                    // Content script not loaded, inject it
                    chrome.scripting.executeScript({
                        target: { tabId: tabId },
                        files: ['content.js']
                    }).catch(error => {
                        console.log('Content script injection skipped:', error.message);
                    });
                }
            }).catch(error => {
                // Tab might not be ready, try injecting anyway
                chrome.scripting.executeScript({
                    target: { tabId: tabId },
                    files: ['content.js']
                }).catch(err => {
                    console.log('Content script injection failed:', err.message);
                });
            });
        }
    }

    async handleContextMenuClick(info, tab) {
        try {
            const imageUrl = info.srcUrl;
            if (!imageUrl || !this.isPinterestImageUrl(imageUrl)) {
                return;
            }

            // Get user settings
            const settings = await chrome.storage.sync.get({
                filenameFormat: 'title_date',
                highQuality: true,
                privacyMode: false
            });

            // Prepare image data
            const imageData = {
                url: this.getHighQualityUrl(imageUrl),
                title: this.extractTitleFromUrl(imageUrl) || 'Pinterest Image',
                board: 'Pinterest',
                originalFilename: this.extractFilenameFromUrl(imageUrl)
            };

            // Download the image
            await this.downloadSingleImage(imageData, settings);

            // Log download start instead of notification
            console.log('Download Started:', imageData.title);

        } catch (error) {
            console.error('Error handling context menu click:', error);
            console.log('Download Failed: Failed to download image');
        }
    }

    async downloadSingleImage(imageData, settings) {
        try {
            console.log('Starting download for:', imageData);
            
            const filename = this.generateFilename(imageData, settings.filenameFormat);
            const folderPath = this.generateFolderPath(imageData, settings);
            
            const downloadOptions = {
                url: imageData.url,
                filename: `${folderPath}/${filename}`,
                conflictAction: 'uniquify'
            };

            console.log('Download options:', downloadOptions);

            // Note: Chrome downloads API doesn't support 'incognito' property
            // Privacy mode is handled at the browser level, not in download options

            const downloadId = await chrome.downloads.download(downloadOptions);
            console.log('Download started with ID:', downloadId);
            
            // Track download
            this.activeDownloads.set(downloadId, {
                imageData,
                settings,
                startTime: Date.now(),
                status: 'downloading'
            });

            return downloadId;

        } catch (error) {
            console.error('Error downloading image:', error);
            console.error('Image data:', imageData);
            throw error;
        }
    }

    async downloadMultipleImages(images, settings) {
        const results = [];
        const totalImages = images.length;
        let completedImages = 0;
        
        // Create a new folder with timestamp for this batch
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
        const folderName = `PinVault_Pro_${timestamp}`;
        
        console.log(`Starting download of ${totalImages} images to folder: ${folderName}`);
        
        // Send initial progress
        this.sendProgressUpdate(0, `Starting download of ${totalImages} images...`);
        
        const batchSize = settings.maxConcurrentDownloads || this.maxConcurrentDownloads;
        
        // Process images in batches
        for (let i = 0; i < images.length; i += batchSize) {
            const batch = images.slice(i, i + batchSize);
            const batchPromises = batch.map(async (image, batchIndex) => {
                try {
                    // Prepare image data for download
                    let imageUrl = image.url || image;
                    
                    // Ensure high quality URL for Pinterest images
                    if (typeof imageUrl === 'string' && imageUrl.includes('pinimg.com')) {
                        imageUrl = this.getHighQualityUrl(imageUrl);
                    }
                    
                    const imageData = {
                        url: imageUrl,
                        title: image.title || `Image_${i + batchIndex + 1}`,
                        board: image.board || 'Pinterest',
                        folder: folderName
                    };
                    
                    console.log(`Downloading image ${completedImages + 1}/${totalImages}:`, imageData.url);
                    
                    const downloadId = await this.downloadSingleImage(imageData, settings);
                    completedImages++;
                    
                    // Update progress
                    const progress = (completedImages / totalImages) * 100;
                    this.sendProgressUpdate(progress, `Downloaded ${completedImages}/${totalImages} images`);
                    
                    return { success: true, downloadId, imageId: image.id || `img_${i + batchIndex}` };
                } catch (error) {
                    console.error(`Error downloading image ${completedImages + 1}:`, error);
                    completedImages++;
                    const progress = (completedImages / totalImages) * 100;
                    const successCount = completedImages - (results.filter(r => !r.success).length + 1);
                    this.sendProgressUpdate(progress, `Downloaded ${successCount}/${totalImages} images (${completedImages - successCount} failed)`);
                    
                    return { success: false, error: error.message, imageId: image.id || `img_${i + batchIndex}` };
                }
            });

            const batchResults = await Promise.all(batchPromises);
            results.push(...batchResults);

            // Small delay between batches to prevent overwhelming
            if (i + batchSize < images.length) {
                await new Promise(resolve => setTimeout(resolve, 500));
            }
        }

        // Send completion message
        this.sendProgressUpdate(100, `Download complete! ${results.filter(r => r.success).length}/${totalImages} images downloaded successfully.`);
        
        // Send download complete message to all extension pages
        setTimeout(() => {
            this.sendMessageToAllExtensionPages({ action: 'downloadComplete', results });
        }, 1000);

        return results;
    }

    async cancelDownload(downloadId) {
        try {
            await chrome.downloads.cancel(downloadId);
            this.activeDownloads.delete(downloadId);
        } catch (error) {
            console.error('Error canceling download:', error);
            throw error;
        }
    }

    sendProgressUpdate(progress, details) {
        // Send progress update to all active extension pages (popup and sidebar)
        const message = {
            action: 'downloadProgress',
            progress: progress,
            details: details
        };
        
        // Send to all extension pages
        this.sendMessageToAllExtensionPages(message);
    }

    async sendMessageToAllExtensionPages(message) {
        try {
            // Send to runtime (popup)
            chrome.runtime.sendMessage(message).catch(() => {
                // Ignore if popup is not open
            });

            // Send to all tabs with our extension content
            const tabs = await chrome.tabs.query({});
            for (const tab of tabs) {
                if (tab.url && (tab.url.includes(chrome.runtime.id) || tab.url.includes('pinterest'))) {
                    chrome.tabs.sendMessage(tab.id, message).catch(() => {
                        // Ignore errors for tabs that don't have our content script
                    });
                }
            }
        } catch (error) {
            console.log('Error sending message to extension pages:', error);
        }
    }

    async sendMessageToSidebar(message) {
        // Use the unified method
        await this.sendMessageToAllExtensionPages(message);
    }

    handleDownloadChange(downloadDelta) {
        const downloadId = downloadDelta.id;
        const downloadInfo = this.activeDownloads.get(downloadId);
        
        if (!downloadInfo) return;

        // Update download status
        if (downloadDelta.state) {
            downloadInfo.status = downloadDelta.state.current;
            
            if (downloadDelta.state.current === 'complete') {
                downloadInfo.endTime = Date.now();
                downloadInfo.duration = downloadInfo.endTime - downloadInfo.startTime;
                
                // Show completion log for single downloads
                if (!downloadInfo.isBatch) {
                    console.log('Download Complete:', downloadInfo.imageData.title);
                }
                
                // Clean up
                setTimeout(() => {
                    this.activeDownloads.delete(downloadId);
                }, 30000); // Keep for 30 seconds for stats
                
            } else if (downloadDelta.state.current === 'interrupted') {
                downloadInfo.error = downloadDelta.error || 'Download interrupted';
                
                // Show error log
                console.log('Download Failed:', downloadInfo.imageData.title);
                
                // Clean up
                this.activeDownloads.delete(downloadId);
            }
        }
    }

    handleDownloadFilename(downloadItem, suggest) {
        // Allow custom filename logic if needed
        const downloadInfo = this.activeDownloads.get(downloadItem.id);
        
        if (downloadInfo && downloadInfo.settings.customPath) {
            suggest({
                filename: downloadInfo.settings.customPath + '/' + downloadItem.filename,
                conflictAction: 'uniquify'
            });
        } else {
            suggest();
        }
    }

    generateFilename(imageData, format) {
        const date = new Date().toISOString().split('T')[0];
        const sanitize = (str) => str.replace(/[^a-z0-9\-_\.]/gi, '_').substring(0, 100);
        
        switch (format) {
            case 'board_title_date':
                return `${sanitize(imageData.board || 'pinterest')}_${sanitize(imageData.title || 'image')}_${date}.jpg`;
            case 'title_only':
                return `${sanitize(imageData.title || 'image')}.jpg`;
            case 'original':
                return imageData.originalFilename || `image_${Date.now()}.jpg`;
            case 'title_date':
            default:
                return `${sanitize(imageData.title || 'image')}_${date}.jpg`;
        }
    }

    generateFolderPath(imageData, settings) {
        // If a specific folder is provided (like from sidebar), use it
        if (imageData.folder) {
            return `PinVault Pro Downloads/${imageData.folder}`;
        }
        
        const sanitize = (str) => str.replace(/[^a-z0-9\-_\.]/gi, '_').substring(0, 50);
        const date = new Date();
        const dateStr = date.toISOString().split('T')[0];
        const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        // Base folder
        let folderPath = 'PinVault Pro Downloads';
        
        // Add organization based on settings
        switch (settings.folderOrganization || 'date') {
            case 'board':
                // Organize by Pinterest board
                const boardName = sanitize(imageData.board || 'General');
                folderPath += `/${boardName}`;
                break;
                
            case 'date':
                // Organize by date (default)
                folderPath += `/${dateStr}`;
                break;
                
            case 'month':
                // Organize by month-year
                folderPath += `/${monthYear}`;
                break;
                
            case 'board_date':
                // Organize by board, then date
                const board = sanitize(imageData.board || 'General');
                folderPath += `/${board}/${dateStr}`;
                break;
                
            case 'domain':
                // Organize by Pinterest domain
                const domain = this.extractDomainFromUrl(imageData.url) || 'Pinterest';
                folderPath += `/${domain}`;
                break;
                
            case 'custom':
                // Custom folder if specified
                if (settings.customFolder) {
                    folderPath += `/${sanitize(settings.customFolder)}`;
                }
                break;
                
            case 'none':
            default:
                // No additional organization
                break;
        }
        
        return folderPath;
    }

    extractDomainFromUrl(url) {
        try {
            const domain = new URL(url).hostname;
            // Extract country-specific Pinterest domain
            if (domain.includes('pinterest.')) {
                const parts = domain.split('.');
                if (parts.length > 2) {
                    return `Pinterest_${parts[parts.length - 1].toUpperCase()}`;
                }
                return 'Pinterest';
            }
            return domain;
        } catch (error) {
            return 'Unknown';
        }
    }

    getHighQualityUrl(url) {
        if (url.includes('pinimg.com')) {
            // Convert to highest quality Pinterest URL
            let highQualityUrl = url;
            
            // Replace various size patterns with originals
            highQualityUrl = highQualityUrl.replace(/\/\d+x\//, '/originals/');
            highQualityUrl = highQualityUrl.replace(/\/\d+x\d+\//, '/originals/');
            highQualityUrl = highQualityUrl.replace(/\/\d+x\d+_/, '/originals/');
            highQualityUrl = highQualityUrl.replace(/_\d+x\d+\./, '_originals.');
            
            // If no change was made, try another approach
            if (highQualityUrl === url) {
                // Try to replace the size directory with originals
                const urlParts = highQualityUrl.split('/');
                for (let i = 0; i < urlParts.length; i++) {
                    if (urlParts[i].match(/^\d+x\d*$/)) {
                        urlParts[i] = 'originals';
                        break;
                    }
                }
                highQualityUrl = urlParts.join('/');
            }
            
            console.log('Original URL:', url);
            console.log('High Quality URL:', highQualityUrl);
            return highQualityUrl;
        }
        return url;
    }

    isPinterestUrl(url) {
        const pinterestDomains = [
            'pinterest.com', 'pinterest.co.uk', 'pinterest.fr', 'pinterest.de',
            'pinterest.es', 'pinterest.it', 'pinterest.jp', 'pinterest.ca',
            'pinterest.au', 'pinterest.in', 'pinterest.mx', 'pinterest.se',
            'pinterest.dk', 'pinterest.no', 'pinterest.pt', 'pinterest.ru',
            'pinterest.kr', 'pinterest.ph', 'pinterest.nz', 'pinterest.cl',
            'pinterest.com.mx'
        ];
        
        return pinterestDomains.some(domain => url.includes(domain));
    }

    isPinterestImageUrl(url) {
        return url.includes('pinimg.com') || url.includes('pinterest.com');
    }

    extractTitleFromUrl(url) {
        // Try to extract meaningful title from URL
        const urlParts = url.split('/');
        const filename = urlParts[urlParts.length - 1];
        return filename.split('.')[0].replace(/[_\-]/g, ' ');
    }

    extractFilenameFromUrl(url) {
        const urlParts = url.split('/');
        return urlParts[urlParts.length - 1] || 'image.jpg';
    }

    getDownloadStats() {
        const active = Array.from(this.activeDownloads.values());
        
        return {
            activeDownloads: active.length,
            completedDownloads: active.filter(d => d.status === 'complete').length,
            failedDownloads: active.filter(d => d.error).length,
            totalDataTransferred: active.reduce((sum, d) => sum + (d.bytesReceived || 0), 0)
        };
    }
}

// Initialize background script
new PinVaultProBackground();
