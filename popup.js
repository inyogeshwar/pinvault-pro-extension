// Popup script for PinVault Pro Extension
class PinVaultProPopup {
    constructor() {
        this.selectedImages = new Set();
        this.totalImages = 0;
        this.isAutoScrolling = false;
        this.autoScrollStatsTimer = null;
        this.language = 'en';
        this.translations = {
            en: {
                checkingPinterest: 'Checking Pinterest...',
                connected: 'Connected to Pinterest',
                notConnected: 'Not on Pinterest',
                imagesOnPage: 'Images on page:',
                selected: 'Selected:',
                selectAll: 'Select All',
                deselectAll: 'Deselect All',
                autoScroll: 'Auto-scroll',
                stopScrolling: 'Stop Scrolling',
                downloadSettings: 'Download Settings',
                filenameFormat: 'Filename Format:',
                folderOrganization: 'Folder Organization:',
                customFolder: 'Custom Folder Name:',
                customFolderPlaceholder: 'Enter folder name...',
                folderByDate: 'By Date (2024-12-26)',
                folderByBoard: 'By Pinterest Board',
                folderByMonth: 'By Month (2024-12)',
                folderBoardDate: 'Board + Date',
                folderByDomain: 'By Pinterest Domain',
                folderCustom: 'Custom Folder',
                folderNone: 'No Organization',
                titleDate: 'Title + Date',
                boardTitleDate: 'Board + Title + Date',
                titleOnly: 'Title Only',
                originalFilename: 'Original Filename',
                highQuality: 'Download highest quality available',
                privacyMode: 'Privacy mode (no history tracking)',
                downloadSelected: 'Download Selected Images',
                downloadProgress: 'Download Progress',
                cancel: 'Cancel',
                preparingDownloads: 'Preparing downloads...',
                language: 'Language:',
                notOnPinterest: 'Not on Pinterest',
                help: 'Help',
                feedback: 'Feedback',
                brandName: 'PinVault Pro',
                uniqueFeatures: 'Professional Features: AI Auto-scroll, Real-time Sync, Advanced Organization'
            }
        };
        
        this.init();
    }

    async init() {
        await this.loadSettings();
        this.setupEventListeners();
        this.updateLanguage();
        await this.checkPinterestConnection();
        this.setupPeriodicUpdates();
    }

    async loadSettings() {
        const settings = await chrome.storage.sync.get({
            language: 'en',
            highQuality: true,
            privacyMode: false,
            autoScroll: false
        });

        this.language = settings.language;
        document.getElementById('highQuality').checked = settings.highQuality;
        document.getElementById('privacyMode').checked = settings.privacyMode;
        document.getElementById('autoScrollToggle').checked = settings.autoScroll;
    }

    setupEventListeners() {
        // Selection controls
        document.getElementById('selectAllBtn').addEventListener('click', () => this.selectAllImages());
        document.getElementById('deselectAllBtn').addEventListener('click', () => this.deselectAllImages());
        document.getElementById('openSidebarBtn').addEventListener('click', () => this.openSidebar());
        
        // Auto-scroll controls
        document.getElementById('autoScrollToggle').addEventListener('change', (e) => this.toggleAutoScroll(e.target.checked));
        document.getElementById('stopScrollBtn').addEventListener('click', () => this.stopAutoScroll());
        
        // Download controls
        document.getElementById('downloadBtn').addEventListener('click', () => this.startDownload());
        document.getElementById('cancelDownloadBtn').addEventListener('click', () => this.cancelDownload());
        
        // Settings (only for remaining checkboxes)
        document.getElementById('highQuality').addEventListener('change', (e) => this.saveSetting('highQuality', e.target.checked));
        document.getElementById('privacyMode').addEventListener('change', (e) => this.saveSetting('privacyMode', e.target.checked));
        
        // External links
        document.getElementById('openPinterestBtn').addEventListener('click', () => this.openPinterest());
        document.getElementById('helpLink').addEventListener('click', () => this.openHelp());
        document.getElementById('feedbackLink').addEventListener('click', () => this.openFeedback());
        document.getElementById('githubLink').addEventListener('click', () => this.openGithub());
    }

    async checkPinterestConnection() {
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            
            if (!tab || !tab.url) {
                this.showNotPinterest();
                return;
            }

            const isPinterest = this.isPinterestUrl(tab.url);
            
            if (isPinterest) {
                this.showConnected();
                await this.updateImageCounts();
            } else {
                this.showNotPinterest();
            }
        } catch (error) {
            console.error('Error checking Pinterest connection:', error);
            this.showError();
        }
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

    async ensureContentScriptInjected(tabId) {
        try {
            // Check if content script is already loaded
            const results = await chrome.scripting.executeScript({
                target: { tabId },
                func: () => window.pinVaultContentLoaded || false
            });

            if (!results[0]?.result) {
                // Content script not loaded, inject it
                await chrome.scripting.executeScript({
                    target: { tabId },
                    files: ['content.js']
                });
                
                // Wait a moment for the script to initialize
                await new Promise(resolve => setTimeout(resolve, 100));
            }
        } catch (error) {
            console.log('Content script injection failed:', error.message);
            throw error;
        }
    }

    showConnected() {
        const statusIndicator = document.getElementById('statusIndicator');
        const statusText = document.getElementById('statusText');
        const mainContent = document.getElementById('mainContent');
        const notPinterest = document.getElementById('notPinterest');
        const proFeatures = document.getElementById('proFeatures');

        if (statusIndicator) statusIndicator.className = 'status-indicator connected';
        if (statusText) statusText.textContent = this.translations[this.language].connected;
        if (mainContent) mainContent.style.display = 'block';
        if (notPinterest) notPinterest.style.display = 'none';
        if (proFeatures) proFeatures.style.display = 'block';
    }

    showNotPinterest() {
        const statusIndicator = document.getElementById('statusIndicator');
        const statusText = document.getElementById('statusText');
        const mainContent = document.getElementById('mainContent');
        const notPinterest = document.getElementById('notPinterest');
        const proFeatures = document.getElementById('proFeatures');

        if (statusIndicator) statusIndicator.className = 'status-indicator error';
        if (statusText) statusText.textContent = this.translations[this.language].notConnected;
        if (mainContent) mainContent.style.display = 'none';
        if (notPinterest) notPinterest.style.display = 'block';
        if (proFeatures) proFeatures.style.display = 'none';
    }

    showError() {
        const statusIndicator = document.getElementById('statusIndicator');
        const statusText = document.getElementById('statusText');

        if (statusIndicator) statusIndicator.className = 'status-indicator error';
        if (statusText) statusText.textContent = 'Connection error';
    }

    async updateImageCounts() {
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            
            if (!tab || !tab.id || !this.isPinterestUrl(tab.url)) {
                return;
            }

            // Ensure content script is injected
            await this.ensureContentScriptInjected(tab.id);

            const response = await chrome.tabs.sendMessage(tab.id, {
                action: 'getImageCounts'
            });

            if (response) {
                this.totalImages = response.total || 0;
                this.selectedImages = new Set(response.selected || []);
                
                console.log(`Image counts updated: ${this.totalImages} total, ${this.selectedImages.size} selected`);
                
                // Add null checks for DOM elements
                const totalImagesEl = document.getElementById('totalImages');
                const selectedCountEl = document.getElementById('selectedCount');
                const downloadCountEl = document.getElementById('downloadCount');
                const downloadBtn = document.getElementById('downloadBtn');
                
                if (totalImagesEl) totalImagesEl.textContent = this.totalImages;
                if (selectedCountEl) selectedCountEl.textContent = this.selectedImages.size;
                if (downloadCountEl) downloadCountEl.textContent = `(${this.selectedImages.size})`;
                
                if (downloadBtn) {
                    downloadBtn.disabled = this.selectedImages.size === 0;
                    
                    // Update the download button text to be more informative
                    if (this.selectedImages.size > 0) {
                        downloadBtn.textContent = `Download ${this.selectedImages.size} Images`;
                    } else {
                        downloadBtn.textContent = 'Download Selected Images';
                    }
                }
            } else {
                // Fallback to direct script execution
                await this.fallbackUpdateCounts(tab.id);
            }
        } catch (error) {
            console.log('Error updating image counts:', error);
            try {
                const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
                if (tab?.url && this.isPinterestUrl(tab.url)) {
                    await this.fallbackUpdateCounts(tab.id);
                }
            } catch (fallbackError) {
                console.log('Fallback count update failed:', fallbackError);
                // Set default values when all methods fail with null checks
                const totalImagesEl = document.getElementById('totalImages');
                const selectedCountEl = document.getElementById('selectedCount');
                const downloadCountEl = document.getElementById('downloadCount');
                const downloadBtn = document.getElementById('downloadBtn');
                
                if (totalImagesEl) totalImagesEl.textContent = '0';
                if (selectedCountEl) selectedCountEl.textContent = '0';
                if (downloadCountEl) downloadCountEl.textContent = '(0)';
                if (downloadBtn) {
                    downloadBtn.disabled = true;
                    downloadBtn.textContent = 'Download Selected Images';
                }
            }
        }
    }

    async fallbackUpdateCounts(tabId) {
        const results = await chrome.scripting.executeScript({
            target: { tabId: tabId },
            function: () => {
                // Trigger a rescan if content script is available
                if (window.pinVaultContent) {
                    window.pinVaultContent.scanForImages();
                    const selectedIds = Array.from(window.pinVaultContent.selectedImages);
                    return {
                        total: window.pinVaultContent.imageElements.size,
                        selected: selectedIds
                    };
                }
                
                // Fallback to direct DOM counting
                const images = document.querySelectorAll('img[src*="pinimg.com"], img[data-src*="pinimg.com"]');
                const selectedImages = document.querySelectorAll('img[data-pinvault-selected="true"]');
                
                // Create a simple ID array for selected images
                const selectedIds = [];
                selectedImages.forEach((img, index) => {
                    selectedIds.push(`fallback-${index}`);
                });
                
                return {
                    total: images.length,
                    selected: selectedIds
                };
            }
        });

        if (results && results[0]) {
            const response = results[0].result;
            this.totalImages = response.total || 0;
            this.selectedImages = new Set(response.selected || []);
            
            console.log(`Fallback counts: ${this.totalImages} total, ${this.selectedImages.size} selected`);
            
            // Add null checks for DOM elements
            const totalImagesEl = document.getElementById('totalImages');
            const selectedCountEl = document.getElementById('selectedCount');
            const downloadCountEl = document.getElementById('downloadCount');
            const downloadBtn = document.getElementById('downloadBtn');
            
            if (totalImagesEl) totalImagesEl.textContent = this.totalImages;
            if (selectedCountEl) selectedCountEl.textContent = this.selectedImages.size;
            if (downloadCountEl) downloadCountEl.textContent = `(${this.selectedImages.size})`;
            
            if (downloadBtn) {
                downloadBtn.disabled = this.selectedImages.size === 0;
                
                // Update the download button text
                if (this.selectedImages.size > 0) {
                    downloadBtn.textContent = `Download ${this.selectedImages.size} Images`;
                } else {
                    downloadBtn.textContent = 'Download Selected Images';
                }
            }
        }
    }

    async selectAllImages() {
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            
            if (!tab || !tab.id || !this.isPinterestUrl(tab.url)) {
                console.warn('Not on a Pinterest page');
                return;
            }

            // Ensure content script is injected before sending message
            await this.ensureContentScriptInjected(tab.id);

            await chrome.tabs.sendMessage(tab.id, {
                action: 'selectAllImages'
            });
            
            await this.updateImageCounts();
        } catch (error) {
            console.error('Error selecting all images:', error);
            console.log('Content script not available for selecting images');
        }
    }

    async deselectAllImages() {
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            
            if (!tab || !tab.id || !this.isPinterestUrl(tab.url)) {
                console.warn('Not on a Pinterest page');
                return;
            }

            // Ensure content script is injected before sending message
            await this.ensureContentScriptInjected(tab.id);
            
            await chrome.tabs.sendMessage(tab.id, {
                action: 'deselectAllImages'
            });
            
            await this.updateImageCounts();
        } catch (error) {
            console.error('Error deselecting all images:', error);
            // Don't show error to user, just log it
            console.log('Content script not available for deselecting images');
        }
    }

    async toggleAutoScroll(enabled) {
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            const stopBtn = document.getElementById('stopScrollBtn');
            
            if (!tab || !tab.id || !this.isPinterestUrl(tab.url)) {
                console.warn('Not on a Pinterest page');
                return;
            }
            
            if (enabled) {
                this.isAutoScrolling = true;
                stopBtn.disabled = false;
                
                // Ensure content script is injected
                await this.ensureContentScriptInjected(tab.id);
                
                await chrome.tabs.sendMessage(tab.id, {
                    action: 'startAutoScroll'
                });
                
                // Start frequent image count updates during auto-scroll (same as sidebar)
                if (this.autoScrollStatsTimer) {
                    clearInterval(this.autoScrollStatsTimer);
                }
                this.autoScrollStatsTimer = setInterval(() => {
                    if (this.isAutoScrolling) {
                        this.updateImageCounts();
                    }
                }, 1000); // Update every 1 second during auto-scroll
                
                console.log('Auto-scroll started with frequent stats updates');
            } else {
                await this.stopAutoScroll();
            }
            
            await this.saveSetting('autoScroll', enabled);
        } catch (error) {
            console.error('Error toggling auto-scroll:', error);
            console.log('Content script not available for auto-scroll');
        }
    }

    async stopAutoScroll() {
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            const autoScrollToggle = document.getElementById('autoScrollToggle');
            const stopBtn = document.getElementById('stopScrollBtn');
            
            this.isAutoScrolling = false;
            autoScrollToggle.checked = false;
            stopBtn.disabled = true;
            
            // Clear the frequent stats update timer
            if (this.autoScrollStatsTimer) {
                clearInterval(this.autoScrollStatsTimer);
                this.autoScrollStatsTimer = null;
            }
            
            if (tab && tab.id && this.isPinterestUrl(tab.url)) {
                await chrome.tabs.sendMessage(tab.id, {
                    action: 'stopAutoScroll'
                });
            }
            
            // Do one final stats update when stopping
            setTimeout(() => {
                this.updateImageCounts();
            }, 500);
            
            console.log('Auto-scroll stopped, stats updates cleared');
        } catch (error) {
            console.log('Auto-scroll stopped locally');
        }
    }

    async startDownload() {
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            
            if (!tab || !tab.id || !this.isPinterestUrl(tab.url)) {
                alert('Please navigate to a Pinterest page first.');
                return;
            }

            console.log('Starting download process...');

            // First, get fresh image counts to verify selection
            await this.updateImageCounts();
            
            if (this.selectedImages.size === 0) {
                alert('No images selected for download. Please select some images first.');
                return;
            }

            console.log(`Attempting to download ${this.selectedImages.size} selected images`);

            // Try content script method first
            let selectedImages = [];
            try {
                await this.ensureContentScriptInjected(tab.id);
                
                const response = await chrome.tabs.sendMessage(tab.id, {
                    action: 'getSelectedImages',
                    settings: {}
                });
                
                if (response && response.images && response.images.length > 0) {
                    selectedImages = response.images;
                    console.log(`Content script returned ${selectedImages.length} images`);
                }
            } catch (error) {
                console.log('Content script method failed, trying DOM fallback');
            }

            // Fallback to DOM selection if content script fails
            if (selectedImages.length === 0) {
                console.log('Using DOM fallback to get selected images');
                const results = await chrome.scripting.executeScript({
                    target: { tabId: tab.id },
                    function: () => {
                        const selected = document.querySelectorAll('img[data-pinvault-selected="true"]');
                        const imageData = [];
                        
                        selected.forEach((img, index) => {
                            if (img.src && img.src.includes('pinimg.com')) {
                                imageData.push({
                                    id: `img_${Date.now()}_${index}`,
                                    url: img.src,
                                    title: img.alt || img.title || `Pinterest Image ${index + 1}`,
                                    board: document.title || 'Pinterest',
                                    domain: window.location.hostname,
                                    originalFilename: img.src.split('/').pop()
                                });
                            }
                        });
                        
                        return imageData;
                    }
                });

                if (results && results[0] && results[0].result.length > 0) {
                    selectedImages = results[0].result;
                    console.log(`DOM fallback found ${selectedImages.length} selected images`);
                } else {
                    alert('No images found for download. Please try selecting images again.');
                    return;
                }
            }

            if (selectedImages.length === 0) {
                alert('No images selected for download. Please select some images first.');
                return;
            }

            // Show progress section
            const progressSection = document.getElementById('progressSection');
            const downloadBtn = document.getElementById('downloadBtn');
            
            if (progressSection) progressSection.style.display = 'block';
            if (downloadBtn) downloadBtn.disabled = true;

            // Use background script for download (same as sidebar)
            chrome.runtime.sendMessage({
                action: 'downloadImages',
                images: selectedImages,
                settings: {
                    highQuality: document.getElementById('highQuality').checked,
                    privacyMode: document.getElementById('privacyMode').checked
                }
            }, (response) => {
                if (chrome.runtime.lastError) {
                    console.error('Download error:', chrome.runtime.lastError);
                    alert('Error starting download: ' + chrome.runtime.lastError.message);
                    this.hideProgress();
                } else if (response && response.success) {
                    console.log('Download started successfully:', response);
                } else {
                    console.error('Download failed:', response);
                    alert('Download failed: ' + (response?.error || 'Unknown error'));
                    this.hideProgress();
                }
            });

        } catch (error) {
            console.error('Error starting download:', error);
            alert('Download failed: ' + error.message);
            this.hideProgress();
        }
    }

    updateProgress(current, total, message) {
        let percentage = 0;
        
        // Handle different parameter combinations
        if (typeof current === 'number' && typeof total === 'number' && total > 0) {
            // Traditional format: updateProgress(current, total, message)
            percentage = Math.round((current / total) * 100);
        } else if (typeof current === 'number' && (typeof total === 'string' || total === undefined)) {
            // Progress format: updateProgress(percentage, undefined, message)
            percentage = Math.round(current);
            message = total; // total is actually the message in this case
        }
        
        // Add null checks for progress elements
        const progressFill = document.getElementById('progressFill');
        const progressText = document.getElementById('progressText');
        const progressDetails = document.getElementById('progressDetails');
        
        if (progressFill) progressFill.style.width = `${percentage}%`;
        if (progressText) progressText.textContent = `${percentage}%`;
        if (progressDetails) progressDetails.textContent = message || 'Processing...';
    }

    hideProgress() {
        const progressSection = document.getElementById('progressSection');
        const downloadBtn = document.getElementById('downloadBtn');
        
        if (progressSection) progressSection.style.display = 'none';
        if (downloadBtn) downloadBtn.disabled = false;
    }

    cancelDownload() {
        // Implementation for canceling downloads
        this.hideProgress();
    }

    setupPeriodicUpdates() {
        // Update image counts every 2 seconds when popup is open
        this.updateInterval = setInterval(() => {
            this.updateImageCounts();
        }, 2000);
        
        // Initial update
        setTimeout(() => {
            this.updateImageCounts();
        }, 500);
    }

    cleanup() {
        // Clear all timers when popup closes
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
        if (this.autoScrollStatsTimer) {
            clearInterval(this.autoScrollStatsTimer);
            this.autoScrollStatsTimer = null;
        }
    }

    updateLanguage() {
        const t = this.translations[this.language];
        
        // Update all translatable elements with data-translate attribute
        document.querySelectorAll('[data-translate]').forEach(element => {
            const key = element.getAttribute('data-translate');
            if (t[key]) {
                element.textContent = t[key];
            }
        });

        // Update placeholder text
        document.querySelectorAll('[data-translate-placeholder]').forEach(element => {
            const key = element.getAttribute('data-translate-placeholder');
            if (t[key]) {
                element.placeholder = t[key];
            }
        });

        // Update status text
        const statusText = document.getElementById('statusText');
        if (statusText) {
            statusText.textContent = t.checkingPinterest;
        }

        // Update folder organization options
        this.updateFolderOrganizationOptions();
        
        // Update filename format options
        this.updateFilenameFormatOptions();
    }

    updateFolderOrganizationOptions() {
        const t = this.translations[this.language];
        const folderSelect = document.getElementById('folderOrganization');
        
        if (folderSelect) {
            const options = folderSelect.querySelectorAll('option');
            options.forEach(option => {
                const value = option.value;
                switch (value) {
                    case 'date':
                        option.textContent = t.folderByDate;
                        break;
                    case 'board':
                        option.textContent = t.folderByBoard;
                        break;
                    case 'month':
                        option.textContent = t.folderByMonth;
                        break;
                    case 'board_date':
                        option.textContent = t.folderBoardDate;
                        break;
                    case 'domain':
                        option.textContent = t.folderByDomain;
                        break;
                    case 'custom':
                        option.textContent = t.folderCustom;
                        break;
                    case 'none':
                        option.textContent = t.folderNone;
                        break;
                }
            });
        }
    }

    updateFilenameFormatOptions() {
        const t = this.translations[this.language];
        const filenameSelect = document.getElementById('filenameFormat');
        
        if (filenameSelect) {
            const options = filenameSelect.querySelectorAll('option');
            options.forEach(option => {
                const value = option.value;
                switch (value) {
                    case 'title_date':
                        option.textContent = t.titleDate;
                        break;
                    case 'board_title_date':
                        option.textContent = t.boardTitleDate;
                        break;
                    case 'title_only':
                        option.textContent = t.titleOnly;
                        break;
                    case 'original':
                        option.textContent = t.originalFilename;
                        break;
                }
            });
        }
    }

    async saveSetting(key, value) {
        await chrome.storage.sync.set({ [key]: value });
    }

    openPinterest() {
        chrome.tabs.create({ url: 'https://www.pinterest.com' });
    }

    async openSidebar() {
        try {
            // Get the current window first, then open the sidebar panel
            const currentWindow = await chrome.windows.getCurrent();
            await chrome.sidePanel.open({ windowId: currentWindow.id });
        } catch (error) {
            console.error('Error opening sidebar:', error);
            try {
                // Fallback: Try without specifying window ID
                await chrome.sidePanel.open({});
            } catch (fallbackError) {
                console.error('Fallback sidebar open failed:', fallbackError);
                // Final fallback: Open sidebar in a new tab
                chrome.tabs.create({ url: chrome.runtime.getURL('sidebar.html') });
            }
        }
    }

    openHelp() {
        chrome.tabs.create({ url: 'https://github.com/inyogeshwar/pinvault-pro-extension#readme' });
    }

    openFeedback() {
        chrome.tabs.create({ url: 'mailto:yogeshwar853202@outlook.com?subject=PinVault%20Pro%20Feedback&body=Hi%20Yogeshwar,%0A%0ARegarding%20PinVault%20Pro%20extension:%0A%0A' });
    }

    openGithub() {
        chrome.tabs.create({ url: 'https://github.com/inyogeshwar/pinvault-pro-extension' });
    }
}

// Initialize popup when DOM is loaded
let popupInstance;
document.addEventListener('DOMContentLoaded', () => {
    popupInstance = new PinVaultProPopup();
});

// Listen for messages from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (popupInstance) {
        if (message.action === 'downloadProgress') {
            popupInstance.updateProgress(message.progress, message.details);
        } else if (message.action === 'downloadComplete') {
            popupInstance.hideProgress();
            popupInstance.updateImageCounts(); // Refresh stats
        } else if (message.action === 'downloadError') {
            popupInstance.hideProgress();
            alert('Download error: ' + message.error);
        }
    }
});

// Cleanup when popup is unloaded
window.addEventListener('beforeunload', () => {
    if (popupInstance) {
        popupInstance.cleanup();
    }
});

// Also cleanup when popup is hidden (for browsers that support it)
document.addEventListener('visibilitychange', () => {
    if (document.hidden && popupInstance) {
        popupInstance.cleanup();
    }
});
