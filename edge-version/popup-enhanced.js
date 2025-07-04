// Popup script for PinVault Pro Extension (Firefox Version)
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
        const settings = await browser.storage.sync.get({
            language: 'en',
            highQuality: true,
            privacyMode: false,
            autoScroll: false,
            theme: 'default',
            advancedFeaturesEnabled: false,
            smartFeaturesEnabled: false,
            autoDownloadScheduler: false,
            batchProcessing: false,
            imageSizeFilter: 'all',
            duplicateDetection: true,
            customWatermark: false
        });

        this.language = settings.language;
        document.getElementById('highQuality').checked = settings.highQuality;
        document.getElementById('privacyMode').checked = settings.privacyMode;
        document.getElementById('autoScrollToggle').checked = settings.autoScroll;
        
        // Apply theme
        this.applyTheme(settings.theme);
        const themeSelector = document.getElementById('themeSelector');
        if (themeSelector) themeSelector.value = settings.theme;
        
        // Apply advanced settings
        this.toggleAdvancedFeatures(settings.advancedFeaturesEnabled);
        this.toggleSmartFeatures(settings.smartFeaturesEnabled);
        
        // Apply smart feature settings
        const autoDownloadEl = document.getElementById('autoDownloadScheduler');
        const batchProcessingEl = document.getElementById('batchProcessing');
        const imageSizeFilterEl = document.getElementById('imageSizeFilter');
        const duplicateDetectionEl = document.getElementById('duplicateDetection');
        const customWatermarkEl = document.getElementById('customWatermark');
        
        if (autoDownloadEl) autoDownloadEl.checked = settings.autoDownloadScheduler;
        if (batchProcessingEl) batchProcessingEl.checked = settings.batchProcessing;
        if (imageSizeFilterEl) imageSizeFilterEl.value = settings.imageSizeFilter;
        if (duplicateDetectionEl) duplicateDetectionEl.checked = settings.duplicateDetection;
        if (customWatermarkEl) customWatermarkEl.checked = settings.customWatermark;
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
        
        // Theme controls
        const themeSelector = document.getElementById('themeSelector');
        if (themeSelector) {
            themeSelector.addEventListener('change', (e) => this.changeTheme(e.target.value));
        }
        
        // Advanced and Smart Features toggle
        const advancedToggle = document.getElementById('advancedFeaturesToggle');
        const smartToggle = document.getElementById('smartFeaturesToggle');
        
        if (advancedToggle) {
            advancedToggle.addEventListener('change', (e) => this.toggleAdvancedFeatures(e.target.checked));
        }
        if (smartToggle) {
            smartToggle.addEventListener('change', (e) => this.toggleSmartFeatures(e.target.checked));
        }
        
        // Smart feature controls
        const smartFeatureInputs = ['autoDownloadScheduler', 'batchProcessing', 'imageSizeFilter', 'duplicateDetection', 'customWatermark'];
        smartFeatureInputs.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                if (element.type === 'checkbox') {
                    element.addEventListener('change', (e) => this.saveSetting(id, e.target.checked));
                } else {
                    element.addEventListener('change', (e) => this.saveSetting(id, e.target.value));
                }
            }
        });
        
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
            const tabs = await browser.tabs.query({ active: true, currentWindow: true });
            const tab = tabs[0];
            
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
            const results = await browser.tabs.executeScript(tabId, {
                code: 'window.pinVaultContentLoaded || false'
            });

            if (!results[0]) {
                // Content script not loaded, inject it
                await browser.tabs.executeScript(tabId, {
                    file: 'content.js'
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
            const tabs = await browser.tabs.query({ active: true, currentWindow: true });
            const tab = tabs[0];
            
            if (!tab || !tab.id || !this.isPinterestUrl(tab.url)) {
                return;
            }

            // Ensure content script is injected
            await this.ensureContentScriptInjected(tab.id);

            const response = await browser.tabs.sendMessage(tab.id, {
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
                const tabs = await browser.tabs.query({ active: true, currentWindow: true });
                const tab = tabs[0];
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
        const results = await browser.tabs.executeScript(tabId, {
            code: `
                (() => {
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
                        selectedIds.push(\`fallback-\${index}\`);
                    });
                    
                    return {
                        total: images.length,
                        selected: selectedIds
                    };
                })()
            `
        });

        if (results && results[0]) {
            const response = results[0];
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
            const tabs = await browser.tabs.query({ active: true, currentWindow: true });
            const tab = tabs[0];
            
            if (!tab || !tab.id || !this.isPinterestUrl(tab.url)) {
                console.warn('Not on a Pinterest page');
                return;
            }

            // Ensure content script is injected before sending message
            await this.ensureContentScriptInjected(tab.id);

            await browser.tabs.sendMessage(tab.id, {
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
            const tabs = await browser.tabs.query({ active: true, currentWindow: true });
            const tab = tabs[0];
            
            if (!tab || !tab.id || !this.isPinterestUrl(tab.url)) {
                console.warn('Not on a Pinterest page');
                return;
            }

            // Ensure content script is injected before sending message
            await this.ensureContentScriptInjected(tab.id);
            
            await browser.tabs.sendMessage(tab.id, {
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
            const tabs = await browser.tabs.query({ active: true, currentWindow: true });
            const tab = tabs[0];
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
                
                await browser.tabs.sendMessage(tab.id, {
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
            const tabs = await browser.tabs.query({ active: true, currentWindow: true });
            const tab = tabs[0];
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
                await browser.tabs.sendMessage(tab.id, {
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
            const tabs = await browser.tabs.query({ active: true, currentWindow: true });
            const tab = tabs[0];
            
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
                
                const response = await browser.tabs.sendMessage(tab.id, {
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
                const results = await browser.tabs.executeScript(tab.id, {
                    code: `
                        (() => {
                            const selected = document.querySelectorAll('img[data-pinvault-selected="true"]');
                            const imageData = [];
                            
                            selected.forEach((img, index) => {
                                if (img.src && img.src.includes('pinimg.com')) {
                                    imageData.push({
                                        id: \`img_\${Date.now()}_\${index}\`,
                                        url: img.src,
                                        title: img.alt || img.title || \`Pinterest Image \${index + 1}\`,
                                        board: document.title || 'Pinterest',
                                        domain: window.location.hostname,
                                        originalFilename: img.src.split('/').pop()
                                    });
                                }
                            });
                            
                            return imageData;
                        })()
                    `
                });

                if (results && results[0] && results[0].length > 0) {
                    selectedImages = results[0];
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
            const response = await browser.runtime.sendMessage({
                action: 'downloadImages',
                images: selectedImages,
                settings: {
                    highQuality: document.getElementById('highQuality').checked,
                    privacyMode: document.getElementById('privacyMode').checked
                }
            });

            if (response && response.success) {
                console.log('Download started successfully:', response);
            } else {
                console.error('Download failed:', response);
                alert('Download failed: ' + (response?.error || 'Unknown error'));
                this.hideProgress();
            }

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
        await browser.storage.sync.set({ [key]: value });
    }
    
    // Theme Management
    async changeTheme(theme) {
        this.applyTheme(theme);
        await this.saveSetting('theme', theme);
    }
    
    applyTheme(theme) {
        document.body.className = '';
        document.body.classList.add(`theme-${theme}`);
        
        // Update CSS custom properties for the selected theme
        const themeColors = {
            default: {
                '--primary-color': '#e60023',
                '--secondary-color': '#767676',
                '--background-color': '#ffffff',
                '--text-color': '#333333',
                '--border-color': '#e0e0e0',
                '--accent-color': '#f5f5f5'
            },
            dark: {
                '--primary-color': '#ff4458',
                '--secondary-color': '#999999',
                '--background-color': '#1a1a1a',
                '--text-color': '#ffffff',
                '--border-color': '#333333',
                '--accent-color': '#2a2a2a'
            },
            light: {
                '--primary-color': '#d4006f',
                '--secondary-color': '#888888',
                '--background-color': '#fafafa',
                '--text-color': '#222222',
                '--border-color': '#e8e8e8',
                '--accent-color': '#f0f0f0'
            },
            purple: {
                '--primary-color': '#8e44ad',
                '--secondary-color': '#9b59b6',
                '--background-color': '#f8f5ff',
                '--text-color': '#2c3e50',
                '--border-color': '#d7bde2',
                '--accent-color': '#ebdef0'
            },
            rainbow: {
                '--primary-color': 'linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4, #ffeaa7, #fd79a8)',
                '--secondary-color': '#666666',
                '--background-color': '#fff5f5',
                '--text-color': '#2d3436',
                '--border-color': '#fab1a0',
                '--accent-color': '#ffeaa7'
            },
            ocean: {
                '--primary-color': '#0984e3',
                '--secondary-color': '#74b9ff',
                '--background-color': '#f1f9ff',
                '--text-color': '#2d3436',
                '--border-color': '#a8dadc',
                '--accent-color': '#e3f2fd'
            }
        };
        
        const colors = themeColors[theme] || themeColors.default;
        Object.entries(colors).forEach(([property, value]) => {
            document.documentElement.style.setProperty(property, value);
        });
    }
    
    // Feature Management
    async toggleAdvancedFeatures(enabled) {
        const advancedPanel = document.getElementById('advancedFeaturesPanel');
        if (advancedPanel) {
            advancedPanel.style.display = enabled ? 'block' : 'none';
        }
        
        const advancedToggle = document.getElementById('advancedFeaturesToggle');
        if (advancedToggle) {
            advancedToggle.checked = enabled;
        }
        
        await this.saveSetting('advancedFeaturesEnabled', enabled);
    }
    
    async toggleSmartFeatures(enabled) {
        const smartPanel = document.getElementById('smartFeaturesPanel');
        if (smartPanel) {
            smartPanel.style.display = enabled ? 'block' : 'none';
        }
        
        const smartToggle = document.getElementById('smartFeaturesToggle');
        if (smartToggle) {
            smartToggle.checked = enabled;
        }
        
        await this.saveSetting('smartFeaturesEnabled', enabled);
    }

    openPinterest() {
        browser.tabs.create({ url: 'https://www.pinterest.com' });
    }

    async openSidebar() {
        try {
            // Firefox uses sidebarAction instead of sidePanel
            if (browser.sidebarAction) {
                await browser.sidebarAction.open();
            } else {
                // Fallback: Open sidebar in a new tab
                browser.tabs.create({ url: browser.runtime.getURL('sidebar.html') });
            }
        } catch (error) {
            console.error('Error opening sidebar:', error);
            // Final fallback: Open sidebar in a new tab
            browser.tabs.create({ url: browser.runtime.getURL('sidebar.html') });
        }
    }

    openHelp() {
        browser.tabs.create({ url: 'https://github.com/inyogeshwar/pinvault-pro-extension#readme' });
    }

    openFeedback() {
        browser.tabs.create({ url: 'mailto:yogeshwar853202@outlook.com?subject=PinVault%20Pro%20Feedback&body=Hi%20Yogeshwar,%0A%0ARegarding%20PinVault%20Pro%20extension:%0A%0A' });
    }

    openGithub() {
        browser.tabs.create({ url: 'https://github.com/inyogeshwar/pinvault-pro-extension' });
    }
}

// Initialize popup when DOM is loaded
let popupInstance;
document.addEventListener('DOMContentLoaded', () => {
    popupInstance = new PinVaultProPopup();
});

// Listen for messages from background script
browser.runtime.onMessage.addListener((message, sender) => {
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
