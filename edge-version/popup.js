// Popup script for PinVault Pro Extension (Edge/Chrome Version)
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
            const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
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
            const results = await chrome.scripting.executeScript({
                target: { tabId: tabId },
                func: () => window.pinVaultContentLoaded || false
            });

            if (!results[0].result) {
                // Content script not loaded, inject it
                await chrome.scripting.executeScript({
                    target: { tabId: tabId },
                    files: ['content.js']
                });
                
                // Wait a bit for injection
                await new Promise(resolve => setTimeout(resolve, 100));
            }
        } catch (error) {
            console.error('Error injecting content script:', error);
        }
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

    async saveSetting(key, value) {
        await chrome.storage.sync.set({ [key]: value });
    }

    openPinterest() {
        chrome.tabs.create({ url: 'https://www.pinterest.com' });
    }

    async openSidebar() {
        try {
            // Try to open side panel in Chrome/Edge
            if (chrome.sidePanel) {
                await chrome.sidePanel.open({ windowId: chrome.windows.WINDOW_ID_CURRENT });
            } else {
                // Fallback: Open sidebar in a new tab
                chrome.tabs.create({ url: chrome.runtime.getURL('sidebar.html') });
            }
        } catch (error) {
            console.error('Error opening sidebar:', error);
            // Final fallback: Open sidebar in a new tab
            chrome.tabs.create({ url: chrome.runtime.getURL('sidebar.html') });
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

    // Similar implementation methods as Firefox version but using Chrome APIs...
    // (Keeping the rest similar but using chrome.* instead of browser.*)
    
    showConnected() {
        const statusEl = document.getElementById('connectionStatus');
        const indicatorEl = document.getElementById('statusIndicator');
        const textEl = document.getElementById('statusText');
        const mainContentEl = document.getElementById('mainContent');
        const notPinterestEl = document.getElementById('notPinterest');
        
        if (statusEl) statusEl.className = 'connection-status connected';
        if (indicatorEl) indicatorEl.className = 'status-indicator connected';
        if (textEl) textEl.textContent = this.translations[this.language].connected;
        if (mainContentEl) mainContentEl.style.display = 'block';
        if (notPinterestEl) notPinterestEl.style.display = 'none';
    }

    showNotPinterest() {
        const statusEl = document.getElementById('connectionStatus');
        const indicatorEl = document.getElementById('statusIndicator');
        const textEl = document.getElementById('statusText');
        const mainContentEl = document.getElementById('mainContent');
        const notPinterestEl = document.getElementById('notPinterest');
        
        if (statusEl) statusEl.className = 'connection-status not-connected';
        if (indicatorEl) indicatorEl.className = 'status-indicator not-connected';
        if (textEl) textEl.textContent = this.translations[this.language].notConnected;
        if (mainContentEl) mainContentEl.style.display = 'none';
        if (notPinterestEl) notPinterestEl.style.display = 'block';
    }

    showError() {
        const statusEl = document.getElementById('connectionStatus');
        const indicatorEl = document.getElementById('statusIndicator');
        const textEl = document.getElementById('statusText');
        
        if (statusEl) statusEl.className = 'connection-status error';
        if (indicatorEl) indicatorEl.className = 'status-indicator error';
        if (textEl) textEl.textContent = 'Error checking connection';
    }

    // Additional methods would be similar to Firefox version...
    // Using chrome.* APIs instead of browser.* APIs
}

// Initialize popup when DOM is loaded
let popupInstance;
document.addEventListener('DOMContentLoaded', () => {
    popupInstance = new PinVaultProPopup();
});

// Listen for messages from background script
chrome.runtime.onMessage.addListener((message, sender) => {
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
