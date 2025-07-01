// Sidebar JavaScript for PinVault Pro - Modern Rewrite

class PinVaultProSidebar {
    constructor() {
        this.downloadQueue = [];
        this.isQueuePaused = false;
        this.selectedImages = new Set();
        this.previewImages = new Map();
        this.currentTheme = 'auto';
        this.init();
    }

    init() {
        this.setupTheme();
        this.setupEventListeners();
        this.setupKeyboardShortcuts();
        this.checkPinterestStatus();
        this.loadSettings();
        
        // Update UI every 2 seconds for regular monitoring
        this.statsUpdateTimer = setInterval(() => {
            this.updateStats();
        }, 2000);
        
        // Initial stats update
        setTimeout(() => {
            this.updateStats();
        }, 1000);
    }

    setupEventListeners() {
        // Selection controls
        document.getElementById('selectAllBtn').addEventListener('click', () => {
            this.selectAll();
        });

        document.getElementById('deselectAllBtn').addEventListener('click', () => {
            this.deselectAll();
        });

        // Download control
        document.getElementById('downloadBtn').addEventListener('click', () => {
            this.startDownload();
        });

        // Theme toggle
        document.getElementById('themeToggle').addEventListener('click', () => {
            this.toggleTheme();
        });

        // Settings
        document.getElementById('formatSelect').addEventListener('change', (e) => {
            this.saveSetting('formatQuality', e.target.value);
        });

        document.getElementById('privacyMode').addEventListener('change', (e) => {
            this.saveSetting('privacyMode', e.target.checked);
        });

        document.getElementById('autoScrollToggle').addEventListener('change', (e) => {
            this.toggleAutoScroll(e.target.checked);
        });

        document.getElementById('showPreview').addEventListener('change', (e) => {
            this.togglePreviewGrid(e.target.checked);
            this.saveSetting('showPreview', e.target.checked);
        });

        // Queue controls
        document.getElementById('pauseResumeBtn')?.addEventListener('click', () => {
            this.toggleDownloadQueue();
        });

        document.getElementById('clearQueueBtn')?.addEventListener('click', () => {
            this.clearDownloadQueue();
        });

        // Cancel download
        const cancelBtn = document.getElementById('cancelDownloadBtn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                this.cancelDownload();
            });
        }

        // Footer links
        document.getElementById('openPinterestBtn')?.addEventListener('click', () => {
            chrome.tabs.create({ url: 'https://www.pinterest.com' });
        });

        document.getElementById('helpLink').addEventListener('click', (e) => {
            e.preventDefault();
            chrome.tabs.create({ url: chrome.runtime.getURL('welcome.html') });
        });

        document.getElementById('feedbackLink').addEventListener('click', (e) => {
            e.preventDefault();
            chrome.tabs.create({ url: 'mailto:yogeshwar853202@outlook.com?subject=PinVault%20Pro%20Feedback&body=Hi%20Yogeshwar,%0A%0ARegarding%20PinVault%20Pro%20extension:%0A%0A' });
        });

        document.getElementById('githubLink').addEventListener('click', (e) => {
            e.preventDefault();
            chrome.tabs.create({ url: 'https://github.com/inyogeshwar/pinvault-pro-extension' });
        });
    }

    setupTheme() {
        const savedTheme = localStorage.getItem('pinvault-theme') || 'auto';
        this.setTheme(savedTheme);
    }

    setTheme(theme) {
        this.currentTheme = theme;
        document.body.setAttribute('data-theme', theme);
        localStorage.setItem('pinvault-theme', theme);
        
        const themeIcon = document.querySelector('.theme-icon');
        if (themeIcon) {
            switch (theme) {
                case 'light':
                    themeIcon.textContent = '☀️';
                    break;
                case 'dark':
                    themeIcon.textContent = '🌙';
                    break;
                case 'auto':
                default:
                    themeIcon.textContent = '🌓';
                    break;
            }
        }
    }

    toggleTheme() {
        const themes = ['auto', 'light', 'dark'];
        const currentIndex = themes.indexOf(this.currentTheme);
        const nextIndex = (currentIndex + 1) % themes.length;
        const nextTheme = themes[nextIndex];
        
        this.setTheme(nextTheme);
        this.showToast(`Theme changed to ${nextTheme}`, 'info');
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl+Shift+P to toggle sidebar (this will close it since it's already open)
            if (e.ctrlKey && e.shiftKey && e.key === 'P') {
                e.preventDefault();
                this.showToast('Use Ctrl+Shift+P from any Pinterest page to toggle sidebar', 'info');
            }
        });
    }

    showToast(message, type = 'info', duration = 4000) {
        const toastContainer = document.getElementById('toastContainer');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        toast.innerHTML = `
            <span>${message}</span>
            <button class="toast-close" aria-label="Close notification">&times;</button>
        `;
        
        toastContainer.appendChild(toast);
        
        // Close button functionality
        const closeBtn = toast.querySelector('.toast-close');
        closeBtn.addEventListener('click', () => {
            this.removeToast(toast);
        });
        
        // Auto remove after duration
        setTimeout(() => {
            this.removeToast(toast);
        }, duration);
    }

    removeToast(toast) {
        if (toast && toast.parentNode) {
            toast.classList.add('hiding');
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }
    }

    togglePreviewGrid(show) {
        const previewSection = document.getElementById('previewSection');
        if (previewSection) {
            previewSection.style.display = show ? 'block' : 'none';
        }
        
        if (show) {
            this.updatePreviewGrid();
        }
    }

    updatePreviewGrid() {
        const previewGrid = document.getElementById('previewGrid');
        if (!previewGrid) return;
        
        if (this.selectedImages.size === 0) {
            previewGrid.innerHTML = `
                <div class="preview-placeholder">
                    <div class="preview-icon">🖼️</div>
                    <p>Select images to see preview</p>
                </div>
            `;
            return;
        }
        
        previewGrid.innerHTML = '';
        this.previewImages.forEach((imageData, imageId) => {
            if (this.selectedImages.has(imageId)) {
                const previewItem = document.createElement('div');
                previewItem.className = 'preview-item';
                previewItem.innerHTML = `<img src="${imageData.thumbnail}" alt="Preview" loading="lazy">`;
                previewItem.addEventListener('click', () => {
                    this.showImageDetails(imageData);
                });
                previewGrid.appendChild(previewItem);
            }
        });
    }

    showImageDetails(imageData) {
        this.showToast(`Image: ${imageData.title || 'Untitled'}`, 'info');
    }

    toggleDownloadQueue() {
        this.isQueuePaused = !this.isQueuePaused;
        const btn = document.getElementById('pauseResumeBtn');
        if (btn) {
            const icon = btn.querySelector('.icon');
            if (this.isQueuePaused) {
                icon.textContent = '▶️';
                btn.innerHTML = btn.innerHTML.replace('Pause Queue', 'Resume Queue');
                this.showToast('Download queue paused', 'warning');
            } else {
                icon.textContent = '⏸️';
                btn.innerHTML = btn.innerHTML.replace('Resume Queue', 'Pause Queue');
                this.showToast('Download queue resumed', 'success');
            }
        }
    }

    clearDownloadQueue() {
        this.downloadQueue = [];
        this.updateQueueDisplay();
        this.showToast('Download queue cleared', 'info');
        
        // Hide queue section if empty
        const queueSection = document.getElementById('queueSection');
        if (queueSection) {
            queueSection.style.display = 'none';
        }
    }

    updateQueueDisplay() {
        const queueList = document.getElementById('queueList');
        const queueSection = document.getElementById('queueSection');
        
        if (!queueList || !queueSection) return;
        
        if (this.downloadQueue.length === 0) {
            queueSection.style.display = 'none';
            return;
        }
        
        queueSection.style.display = 'block';
        queueList.innerHTML = '';
        
        this.downloadQueue.forEach((item, index) => {
            const queueItem = document.createElement('div');
            queueItem.className = 'queue-item';
            queueItem.innerHTML = `
                <div class="queue-item-status ${item.status}"></div>
                <span>${item.title || `Image ${index + 1}`}</span>
            `;
            queueList.appendChild(queueItem);
        });
    }

    async checkPinterestStatus() {
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            const isPinterest = tab?.url && this.isPinterestUrl(tab.url);
            
            const statusIndicator = document.getElementById('statusIndicator');
            const statusText = document.getElementById('statusText');
            const mainContent = document.querySelector('.sidebar-container');
            const notPinterest = document.getElementById('notPinterest');

            if (isPinterest) {
                if (statusIndicator) statusIndicator.style.background = '#10b981';
                if (statusText) statusText.textContent = 'Connected to Pinterest';
                if (notPinterest) notPinterest.style.display = 'none';
                this.updateStats();
            } else {
                if (statusIndicator) statusIndicator.style.background = '#f59e0b';
                if (statusText) statusText.textContent = 'Not on Pinterest';
                if (notPinterest) notPinterest.style.display = 'block';
                this.resetStats();
            }
        } catch (error) {
            console.error('Error checking Pinterest status:', error);
            const statusIndicator = document.getElementById('statusIndicator');
            const statusText = document.getElementById('statusText');
            if (statusIndicator) statusIndicator.style.background = '#ef4444';
            if (statusText) statusText.textContent = 'Connection error';
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

    async updateStats() {
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            if (!tab?.url || !this.isPinterestUrl(tab.url)) return;

            // Ensure content script is injected first
            await this.ensureContentScriptInjected(tab.id);

            // Get stats from content script
            const response = await chrome.tabs.sendMessage(tab.id, { action: 'getImageCounts' });
            
            if (response && response.total !== undefined) {
                this.updateStatsDisplay(response.total, response.selected?.length || 0);
            } else {
                // Fallback to direct DOM counting if content script fails
                await this.fallbackUpdateStats(tab.id);
            }
        } catch (error) {
            console.error('Error updating stats:', error);
            // Try fallback method
            try {
                const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
                if (tab?.url && this.isPinterestUrl(tab.url)) {
                    await this.fallbackUpdateStats(tab.id);
                }
            } catch (fallbackError) {
                console.error('Fallback stats update failed:', fallbackError);
            }
        }
    }

    async fallbackUpdateStats(tabId) {
        const results = await chrome.scripting.executeScript({
            target: { tabId: tabId },
            function: () => {
                // Trigger a rescan if content script is available
                if (window.pinVaultContent) {
                    window.pinVaultContent.scanForImages();
                    return {
                        total: window.pinVaultContent.imageElements.size,
                        selected: window.pinVaultContent.selectedImages.size
                    };
                }
                
                // Fallback to direct DOM counting
                const images = document.querySelectorAll('img[src*="pinimg.com"], img[data-src*="pinimg.com"]');
                const selected = document.querySelectorAll('img[data-pinvault-selected="true"]');
                
                // Count all valid Pinterest images
                const allImages = document.querySelectorAll('img');
                let pinterestImageCount = 0;
                
                allImages.forEach(img => {
                    const src = img.src || img.dataset.src || '';
                    if (src.includes('pinimg.com')) {
                        const width = img.naturalWidth || img.width || 0;
                        const height = img.naturalHeight || img.height || 0;
                        if (width >= 100 && height >= 100) {
                            pinterestImageCount++;
                        }
                    }
                });
                
                return {
                    total: Math.max(images.length, pinterestImageCount),
                    selected: selected.length
                };
            }
        });

        if (results && results[0]) {
            const stats = results[0].result;
            this.updateStatsDisplay(stats.total, stats.selected);
        }
    }

    async ensureContentScriptInjected(tabId) {
        try {
            // Check if content script is already loaded
            const response = await chrome.tabs.sendMessage(tabId, { action: 'ping' });
            if (response?.status === 'ready') {
                return true;
            }
        } catch (error) {
            // Content script not loaded, inject it
            console.log('Injecting content script...');
        }

        try {
            await chrome.scripting.executeScript({
                target: { tabId: tabId },
                files: ['content.js']
            });
            
            // Wait a bit for initialization
            await new Promise(resolve => setTimeout(resolve, 500));
            return true;
        } catch (error) {
            console.error('Failed to inject content script:', error);
            return false;
        }
    }

    updateStatsDisplay(total, selected) {
        const totalImagesEl = document.getElementById('totalImages');
        const selectedCountEl = document.getElementById('selectedCount');
        const downloadCountEl = document.getElementById('downloadCount');
        const downloadBtn = document.getElementById('downloadBtn');
        
        if (totalImagesEl) totalImagesEl.textContent = total;
        if (selectedCountEl) selectedCountEl.textContent = selected;
        if (downloadCountEl) downloadCountEl.textContent = `(${selected})`;
        
        if (downloadBtn) {
            downloadBtn.disabled = selected === 0;
            
            if (selected > 0) {
                downloadBtn.classList.add('success');
                downloadBtn.classList.remove('secondary');
            } else {
                downloadBtn.classList.add('secondary');
                downloadBtn.classList.remove('success');
            }
        }
    }

    resetStats() {
        this.updateStatsDisplay(0, 0);
    }

    async selectAll() {
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            if (!tab?.url || !this.isPinterestUrl(tab.url)) return;

            // Ensure content script is loaded
            await this.ensureContentScriptInjected(tab.id);

            try {
                // Try using content script first
                await chrome.tabs.sendMessage(tab.id, { action: 'selectAllImages' });
            } catch (error) {
                // Fallback to direct script injection
                await chrome.scripting.executeScript({
                    target: { tabId: tab.id },
                    function: () => {
                        const images = document.querySelectorAll('img[src*="pinimg.com"]');
                        images.forEach(img => {
                            img.setAttribute('data-pinvault-selected', 'true');
                            img.style.border = '3px solid #10b981';
                            img.style.borderRadius = '8px';
                        });
                    }
                });
            }

            this.updateStats();
        } catch (error) {
            console.error('Error selecting all:', error);
        }
    }

    async deselectAll() {
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            if (!tab?.url || !this.isPinterestUrl(tab.url)) return;

            // Ensure content script is loaded
            await this.ensureContentScriptInjected(tab.id);

            try {
                // Try using content script first
                await chrome.tabs.sendMessage(tab.id, { action: 'deselectAllImages' });
            } catch (error) {
                // Fallback to direct script injection
                await chrome.scripting.executeScript({
                    target: { tabId: tab.id },
                    function: () => {
                        const images = document.querySelectorAll('img[data-pinvault-selected="true"]');
                        images.forEach(img => {
                            img.removeAttribute('data-pinvault-selected');
                            img.style.border = '';
                            img.style.borderRadius = '';
                        });
                    }
                });
            }

            this.updateStats();
        } catch (error) {
            console.error('Error deselecting all:', error);
        }
    }

    async toggleAutoScroll(enabled) {
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            if (!tab?.url || !this.isPinterestUrl(tab.url)) return;

            // Ensure content script is loaded
            await this.ensureContentScriptInjected(tab.id);

            if (enabled) {
                // Use content script for auto-scroll if available
                try {
                    await chrome.tabs.sendMessage(tab.id, { action: 'startAutoScroll' });
                } catch (error) {
                    console.log('Content script auto-scroll not available, using fallback');
                    // Fallback to direct script injection
                    await chrome.scripting.executeScript({
                        target: { tabId: tab.id },
                        function: () => {
                            window.pinVaultAutoScroll = setInterval(() => {
                                window.scrollBy(0, 300);
                                
                                // Trigger image scanning if content script is available
                                if (window.pinVaultContent) {
                                    setTimeout(() => {
                                        window.pinVaultContent.scanForImages();
                                    }, 500);
                                }
                                
                                // Trigger a custom event to notify extension about scroll
                                window.dispatchEvent(new CustomEvent('pinvaultAutoScrolled'));
                            }, 1500);
                        }
                    });
                }
                
                // Start more frequent stats updates during auto-scroll
                if (this.autoScrollStatsTimer) {
                    clearInterval(this.autoScrollStatsTimer);
                }
                this.autoScrollStatsTimer = setInterval(() => {
                    this.updateStats();
                }, 1000); // Update every 1 second during auto-scroll
                
            } else {
                // Stop auto-scroll using content script
                try {
                    await chrome.tabs.sendMessage(tab.id, { action: 'stopAutoScroll' });
                } catch (error) {
                    // Fallback to direct script injection
                    await chrome.scripting.executeScript({
                        target: { tabId: tab.id },
                        function: () => {
                            if (window.pinVaultAutoScroll) {
                                clearInterval(window.pinVaultAutoScroll);
                                window.pinVaultAutoScroll = null;
                            }
                        }
                    });
                }
                
                // Clear the frequent stats update timer
                if (this.autoScrollStatsTimer) {
                    clearInterval(this.autoScrollStatsTimer);
                    this.autoScrollStatsTimer = null;
                }
                
                // Update stats one final time when stopping
                setTimeout(() => this.updateStats(), 500);
            }

            this.saveSetting('autoScroll', enabled);
        } catch (error) {
            console.error('Error toggling auto-scroll:', error);
        }
    }

    async startDownload() {
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            if (!tab?.url || !this.isPinterestUrl(tab.url)) {
                alert('Please navigate to a Pinterest page first.');
                return;
            }

            console.log('Sidebar: Starting download process...');

            // Get fresh image counts to verify selection
            await this.updateStats();
            
            // Try content script method first
            let selectedImages = [];
            try {
                await this.ensureContentScriptInjected(tab.id);
                
                const response = await chrome.tabs.sendMessage(tab.id, {
                    action: 'getSelectedImages',
                    settings: await this.getSettings()
                });
                
                if (response && response.images && response.images.length > 0) {
                    selectedImages = response.images;
                    console.log(`Sidebar: Content script returned ${selectedImages.length} images`);
                }
            } catch (error) {
                console.log('Sidebar: Content script method failed, trying DOM fallback');
            }

            // Fallback to DOM selection if content script fails
            if (selectedImages.length === 0) {
                console.log('Sidebar: Using DOM fallback to get selected images');
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
                    console.log(`Sidebar: DOM fallback found ${selectedImages.length} selected images`);
                } else {
                    alert('No images found for download. Please try selecting images again.');
                    return;
                }
            }

            if (selectedImages.length === 0) {
                alert('No images selected for download. Please select some images first.');
                return;
            }

            console.log(`Sidebar: Starting download of ${selectedImages.length} images`);
            this.showProgress();
            
            // Send message to background script to handle download
            chrome.runtime.sendMessage({
                action: 'downloadImages',
                images: selectedImages,
                settings: await this.getSettings()
            }, (response) => {
                if (chrome.runtime.lastError) {
                    console.error('Sidebar: Download error:', chrome.runtime.lastError);
                    alert('Error starting download: ' + chrome.runtime.lastError.message);
                    this.hideProgress();
                } else if (response && response.success) {
                    console.log('Sidebar: Download started successfully:', response);
                } else {
                    console.error('Sidebar: Download failed:', response);
                    alert('Download failed: ' + (response?.error || 'Unknown error'));
                    this.hideProgress();
                }
            });

        } catch (error) {
            console.error('Sidebar: Error starting download:', error);
            alert('Download failed: ' + error.message);
            this.hideProgress();
        }
    }

    showProgress() {
        const progressSection = document.getElementById('progressSection');
        const progressRingFill = document.getElementById('progressRingFill');
        const progressPercentage = document.getElementById('progressPercentage');
        const progressDetails = document.getElementById('progressDetails');
        
        if (progressSection) progressSection.style.display = 'block';
        if (progressRingFill) {
            progressRingFill.style.strokeDashoffset = '314'; // Reset to 0%
        }
        if (progressPercentage) progressPercentage.textContent = '0%';
        if (progressDetails) progressDetails.textContent = 'Starting download...';
        
        this.showToast('Download started', 'info');
    }

    hideProgress() {
        const progressSection = document.getElementById('progressSection');
        if (progressSection) progressSection.style.display = 'none';
    }

    updateProgress(progress, details) {
        const progressRingFill = document.getElementById('progressRingFill');
        const progressPercentage = document.getElementById('progressPercentage');
        const progressDetails = document.getElementById('progressDetails');
        
        // Calculate stroke-dashoffset for circular progress
        // Total circumference is approximately 314 (2 * π * r where r = 50)
        const offset = 314 - (314 * progress / 100);
        
        if (progressRingFill) {
            progressRingFill.style.strokeDashoffset = offset.toString();
        }
        if (progressPercentage) progressPercentage.textContent = Math.round(progress) + '%';
        if (progressDetails) progressDetails.textContent = details;
        
        // Update queue if downloading
        if (progress > 0 && progress < 100) {
            this.updateDownloadQueue(details);
        }
    }

    updateDownloadQueue(currentDetails) {
        // Add current download to queue display
        if (currentDetails && !this.downloadQueue.find(item => item.title === currentDetails)) {
            this.downloadQueue.push({
                title: currentDetails,
                status: 'downloading'
            });
            this.updateQueueDisplay();
        }
    }

    cancelDownload() {
        chrome.runtime.sendMessage({ action: 'cancelDownload' });
        this.hideProgress();
    }

    async loadSettings() {
        try {
            const settings = await chrome.storage.sync.get({
                formatQuality: 'high',
                privacyMode: false,
                autoScroll: false,
                showPreview: true
            });

            const formatSelect = document.getElementById('formatSelect');
            if (formatSelect) formatSelect.value = settings.formatQuality || 'high';
            
            const privacyMode = document.getElementById('privacyMode');
            if (privacyMode) privacyMode.checked = settings.privacyMode === true;
            
            const autoScrollToggle = document.getElementById('autoScrollToggle');
            if (autoScrollToggle) autoScrollToggle.checked = settings.autoScroll === true;
            
            const showPreview = document.getElementById('showPreview');
            if (showPreview) {
                showPreview.checked = settings.showPreview !== false;
                this.togglePreviewGrid(settings.showPreview !== false);
            }
            
        } catch (error) {
            console.error('Error loading settings:', error);
        }
    }

    async saveSetting(key, value) {
        try {
            await chrome.storage.sync.set({ [key]: value });
        } catch (error) {
            console.error('Error saving setting:', error);
        }
    }

    async getSettings() {
        try {
            return await chrome.storage.sync.get({
                formatQuality: 'high',
                privacyMode: false,
                showPreview: true,
                filenameFormat: 'title_date',
                folderOrganization: 'date',
                customFolder: ''
            });
        } catch (error) {
            console.error('Error getting settings:', error);
            return {
                formatQuality: 'high',
                privacyMode: false,
                showPreview: true,
                filenameFormat: 'title_date',
                folderOrganization: 'date',
                customFolder: ''
            };
        }
    }
}

// Listen for messages from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'downloadProgress') {
        sidebar.updateProgress(message.progress, message.details);
    } else if (message.action === 'downloadComplete') {
        sidebar.hideProgress();
        sidebar.updateStats(); // Refresh stats
        sidebar.showToast('Download completed successfully!', 'success');
    } else if (message.action === 'downloadError') {
        sidebar.hideProgress();
        sidebar.showToast('Download error: ' + message.error, 'error');
    }
});

// Initialize sidebar when DOM is loaded
let sidebar;
document.addEventListener('DOMContentLoaded', () => {
    sidebar = new PinVaultProSidebar();
});

// Also initialize if DOM is already loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        if (!sidebar) sidebar = new PinVaultProSidebar();
    });
} else {
    sidebar = new PinVaultProSidebar();
}
