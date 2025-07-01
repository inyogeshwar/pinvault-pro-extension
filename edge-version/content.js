// Content script for PinVault Pro Extension
console.log('PinVault Pro content script: Starting to load...');

// Prevent multiple instances
if (window.pinVaultContentLoaded) {
    console.log('PinVault Pro content script already loaded, skipping...');
} else {
    window.pinVaultContentLoaded = true;
    console.log('PinVault Pro content script loading for first time...');

class PinVaultContent {
    constructor() {
        this.selectedImages = new Set();
        this.imageElements = new Map();
        this.isAutoScrolling = false;
        this.scrollInterval = null;
        this.scanInterval = null;
        this.observer = null;
        this.lastScrollHeight = 0;
        this.scrollAttempts = 0;
        this.maxScrollAttempts = 5;
        
        // Make sure we're available on window immediately
        window.pinVaultContent = this;
        
        this.init();
    }

    init() {
        console.log('PinVault Pro content script initializing...');
        try {
            this.injectStyles();
            this.setupMessageListener();
            this.setupKeyboardShortcuts();
            this.scanForImages();
            this.setupMutationObserver();
            this.setupContextMenu();
            console.log('PinVault Pro content script initialized successfully');
        } catch (error) {
            console.error('PinVault Pro content script initialization error:', error);
        }
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl+Shift+P to toggle sidebar
            if (e.ctrlKey && e.shiftKey && e.key === 'P') {
                e.preventDefault();
                this.toggleSidebar();
            }
        });
    }

    async toggleSidebar() {
        try {
            // Send message to background script to toggle sidebar
            chrome.runtime.sendMessage({ action: 'toggleSidebar' });
            
            // Show notification
            this.showNotification('Sidebar toggled via keyboard shortcut', 'info');
        } catch (error) {
            console.error('Error toggling sidebar:', error);
        }
    }

    showNotification(message, type = 'info') {
        // Create a temporary notification overlay
        const notification = document.createElement('div');
        notification.className = `pinvault-notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(0, 0, 0, 0.9);
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 500;
            z-index: 10000;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            animation: slideIn 0.3s ease-out;
        `;

        document.body.appendChild(notification);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-in forwards';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    injectStyles() {
        if (document.getElementById('pinvault-styles')) return;

        const style = document.createElement('style');
        style.id = 'pinvault-styles';
        style.textContent = `
            .pinvault-overlay {
                position: absolute;
                top: 8px;
                right: 8px;
                z-index: 9999;
                background: rgba(0, 0, 0, 0.8);
                border-radius: 50%;
                width: 28px;
                height: 28px;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                transition: all 0.2s ease;
                border: 2px solid transparent;
                user-select: none;
            }

            .pinvault-overlay:hover {
                background: rgba(0, 0, 0, 0.9);
                transform: scale(1.1);
            }

            .pinvault-overlay.selected {
                background: rgba(0, 123, 255, 0.9);
                border-color: rgba(255, 255, 255, 0.8);
            }

            .pinvault-overlay.success {
                background: rgba(40, 167, 69, 0.9);
                border-color: rgba(255, 255, 255, 0.8);
            }

            .pinvault-overlay.error {
                background: rgba(220, 53, 69, 0.9);
                border-color: rgba(255, 255, 255, 0.8);
            }

            .pinvault-checkbox {
                color: white;
                font-size: 14px;
                font-weight: bold;
                pointer-events: none;
            }

            .pinvault-image-container {
                position: relative;
            }

            .pinvault-loading {
                position: fixed;
                top: 20px;
                right: 20px;
                background: rgba(0, 123, 255, 0.9);
                color: white;
                padding: 12px 20px;
                border-radius: 25px;
                font-size: 14px;
                font-weight: 500;
                z-index: 10000;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
                transition: all 0.3s ease;
            }

            .pinvault-loading.hidden {
                opacity: 0;
                transform: translateY(-20px);
            }

            .pinvault-scroll-indicator {
                position: fixed;
                bottom: 20px;
                right: 20px;
                background: rgba(255, 193, 7, 0.9);
                color: #212529;
                padding: 8px 16px;
                border-radius: 20px;
                font-size: 12px;
                font-weight: 500;
                z-index: 10000;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
                animation: pulse 2s infinite;
            }

            @keyframes pulse {
                0% { opacity: 0.8; }
                50% { opacity: 1; }
                100% { opacity: 0.8; }
            }
        `;
        document.head.appendChild(style);
    }

    setupMessageListener() {
        console.log('PinVault Pro: Setting up message listener...');
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            console.log('PinVault Pro: Received message:', request);
            try {
                switch (request.action) {
                    case 'ping':
                        sendResponse({ status: 'ready' });
                        break;
                        
                    case 'getImageCounts':
                        // Rescan before returning counts to ensure we have latest data
                        this.scanForImages();
                        const selectedIds = Array.from(this.selectedImages);
                        console.log(`Content script image counts: ${this.imageElements.size} total, ${selectedIds.length} selected`);
                        sendResponse({
                            total: this.imageElements.size,
                            selected: selectedIds
                        });
                        break;
                    
                    case 'selectAllImages':
                        this.selectAllImages();
                        sendResponse({ success: true });
                        break;
                    
                    case 'deselectAllImages':
                        this.deselectAllImages();
                        sendResponse({ success: true });
                        break;
                    
                    case 'startAutoScroll':
                        this.startAutoScroll();
                        sendResponse({ success: true });
                        break;
                    
                    case 'stopAutoScroll':
                        this.stopAutoScroll();
                        sendResponse({ success: true });
                        break;
                    
                    case 'getSelectedImages':
                        const images = this.getSelectedImagesData(request.settings);
                        console.log(`Content script getSelectedImages: returning ${images.length} image data objects`);
                        sendResponse({ images });
                        break;
                    
                    case 'markImageStatus':
                        this.markImageStatus(request.imageId, request.status, request.error);
                        sendResponse({ success: true });
                        break;
                    
                    default:
                        sendResponse({ error: 'Unknown action' });
                }
            } catch (error) {
                console.error('Error handling message:', error);
                sendResponse({ error: error.message });
            }
            
            return true; // Keep message channel open for async response
        });
    }

    scanForImages() {
        console.log('PinVault Pro: Scanning for images...');
        const beforeCount = this.imageElements.size;
        
        // Pinterest uses various selectors for images
        const selectors = [
            'img[src*="pinimg.com"]',
            'img[data-src*="pinimg.com"]',
            '[data-test-id="pin"] img',
            '[data-test-id="visual-search-pin"] img',
            '.GrowthUnauthPin img',
            '.Pin img',
            '.pinWrapper img'
        ];

        selectors.forEach(selector => {
            document.querySelectorAll(selector).forEach(img => {
                this.processImage(img);
            });
        });
        
        // Also scan for any newly loaded images that might not match selectors
        document.querySelectorAll('img').forEach(img => {
            if (this.isValidPinterestImage(img) && !img.dataset.pinvaultProcessed) {
                this.processImage(img);
            }
        });
        
        const afterCount = this.imageElements.size;
        const newImages = afterCount - beforeCount;
        
        if (newImages > 0) {
            console.log(`PinVault Pro: Found ${newImages} new images. Total: ${afterCount}`);
        }
        
        // Dispatch custom event to notify about image count update
        window.dispatchEvent(new CustomEvent('pinvaultImagesUpdated', {
            detail: { total: afterCount, new: newImages }
        }));
    }

    processImage(img) {
        // Skip if already processed or not a valid Pinterest image
        if (img.dataset.pinvaultProcessed || !this.isValidPinterestImage(img)) {
            return;
        }

        img.dataset.pinvaultProcessed = 'true';
        
        // Generate unique ID for the image
        const imageId = this.generateImageId(img);
        
        // Find the container element
        const container = this.findImageContainer(img);
        if (!container) return;

        // Make container relative positioned
        if (getComputedStyle(container).position === 'static') {
            container.style.position = 'relative';
        }
        container.classList.add('pinvault-image-container');

        // Create overlay
        const overlay = this.createOverlay(imageId, img);
        container.appendChild(overlay);

        // Store image data
        this.imageElements.set(imageId, {
            element: img,
            container: container,
            overlay: overlay,
            url: this.getHighQualityUrl(img),
            title: this.extractImageTitle(container),
            board: this.extractBoardName(),
            domain: window.location.hostname,
            originalFilename: this.extractOriginalFilename(img)
        });
    }

    isValidPinterestImage(img) {
        const src = img.src || img.dataset.src || '';
        
        // Check if it's a Pinterest image
        if (!src.includes('pinimg.com')) return false;
        
        // Skip avatars, icons, and very small images
        const width = img.naturalWidth || img.width || 0;
        const height = img.naturalHeight || img.height || 0;
        
        if (width < 100 || height < 100) return false;
        
        // Skip if it's likely a profile picture or icon
        if (src.includes('/avatars/') || src.includes('/user/')) return false;
        
        return true;
    }

    generateImageId(img) {
        const src = img.src || img.dataset.src || '';
        const urlParts = src.split('/');
        const filename = urlParts[urlParts.length - 1];
        return filename.split('.')[0] || `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    findImageContainer(img) {
        let container = img.parentElement;
        
        // Look for common Pinterest container classes
        const containerSelectors = [
            '[data-test-id="pin"]',
            '[data-test-id="visual-search-pin"]',
            '.GrowthUnauthPin',
            '.Pin',
            '.pinWrapper'
        ];
        
        // Traverse up to find a suitable container
        for (let i = 0; i < 5 && container; i++) {
            if (containerSelectors.some(selector => container.matches && container.matches(selector))) {
                return container;
            }
            container = container.parentElement;
        }
        
        // Fallback to direct parent
        return img.parentElement;
    }

    createOverlay(imageId, img) {
        const overlay = document.createElement('div');
        overlay.className = 'pinvault-overlay';
        overlay.dataset.imageId = imageId;
        
        const checkbox = document.createElement('span');
        checkbox.className = 'pinvault-checkbox';
        checkbox.textContent = '☐';
        
        overlay.appendChild(checkbox);
        
        overlay.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.toggleImageSelection(imageId);
        });
        
        return overlay;
    }

    getHighQualityUrl(img) {
        let url = img.src || img.dataset.src || '';
        
        // Convert to highest quality Pinterest URL
        // Pinterest URL pattern: https://i.pinimg.com/564x/...
        // High quality: https://i.pinimg.com/originals/...
        
        if (url.includes('pinimg.com')) {
            // Replace size parameters with 'originals' for highest quality
            url = url.replace(/\/\d+x\//, '/originals/');
            url = url.replace(/\/\d+x\d+\//, '/originals/');
        }
        
        return url;
    }

    extractImageTitle(container) {
        // Try various selectors for Pinterest pin titles
        const titleSelectors = [
            '[data-test-id="pin-title"]',
            '.Pin-title',
            '.pinTitle',
            'h3',
            'h2',
            '[role="button"] div',
            'a[href*="/pin/"] div'
        ];
        
        for (const selector of titleSelectors) {
            const titleElement = container.querySelector(selector);
            if (titleElement && titleElement.textContent.trim()) {
                return titleElement.textContent.trim();
            }
        }
        
        return 'Pinterest Image';
    }

    extractBoardName() {
        // Try to extract board name from URL or page
        const url = window.location.href;
        const boardMatch = url.match(/\/([^\/]+)\/([^\/]+)\//);
        
        if (boardMatch && boardMatch[2]) {
            return boardMatch[2];
        }
        
        // Try to find board name in page
        const boardElement = document.querySelector('[data-test-id="board-name"], .boardName, .Board-name');
        if (boardElement) {
            return boardElement.textContent.trim();
        }
        
        return 'Pinterest';
    }

    extractOriginalFilename(img) {
        const url = img.src || img.dataset.src || '';
        const urlParts = url.split('/');
        return urlParts[urlParts.length - 1] || 'image.jpg';
    }

    toggleImageSelection(imageId) {
        const imageData = this.imageElements.get(imageId);
        if (!imageData) return;

        const overlay = imageData.overlay;
        const checkbox = overlay.querySelector('.pinvault-checkbox');

        if (this.selectedImages.has(imageId)) {
            // Deselect
            this.selectedImages.delete(imageId);
            overlay.classList.remove('selected');
            imageData.element.setAttribute('data-pinvault-selected', 'false');
            checkbox.textContent = '☐';
        } else {
            // Select
            this.selectedImages.add(imageId);
            overlay.classList.add('selected');
            imageData.element.setAttribute('data-pinvault-selected', 'true');
            checkbox.textContent = '☑';
        }
    }

    selectAllImages() {
        this.imageElements.forEach((imageData, imageId) => {
            if (!this.selectedImages.has(imageId)) {
                this.selectedImages.add(imageId);
                imageData.overlay.classList.add('selected');
                imageData.element.setAttribute('data-pinvault-selected', 'true');
                imageData.overlay.querySelector('.pinvault-checkbox').textContent = '☑';
            }
        });
    }

    deselectAllImages() {
        this.selectedImages.forEach(imageId => {
            const imageData = this.imageElements.get(imageId);
            if (imageData) {
                imageData.overlay.classList.remove('selected', 'success', 'error');
                imageData.element.setAttribute('data-pinvault-selected', 'false');
                imageData.overlay.querySelector('.pinvault-checkbox').textContent = '☐';
            }
        });
        this.selectedImages.clear();
    }

    startAutoScroll() {
        if (this.isAutoScrolling) return;

        this.isAutoScrolling = true;
        this.lastScrollHeight = document.body.scrollHeight;
        this.scrollAttempts = 0;

        // Show scroll indicator
        this.showScrollIndicator();

        // Start scanning for images more frequently during auto-scroll
        this.scanInterval = setInterval(() => {
            if (this.isAutoScrolling) {
                this.scanForImages();
            }
        }, 2000);

        this.scrollInterval = setInterval(() => {
            if (!this.isAutoScrolling) return;

            const currentScrollHeight = document.body.scrollHeight;
            const scrollY = window.scrollY;
            const windowHeight = window.innerHeight;

            // Check if we're at the bottom
            if (scrollY + windowHeight >= currentScrollHeight - 100) {
                // Scroll down to load more content
                window.scrollBy(0, 500);
                
                // Check if new content was loaded
                setTimeout(() => {
                    const newScrollHeight = document.body.scrollHeight;
                    if (newScrollHeight === this.lastScrollHeight) {
                        this.scrollAttempts++;
                        if (this.scrollAttempts >= this.maxScrollAttempts) {
                            this.stopAutoScroll();
                            return;
                        }
                    } else {
                        this.scrollAttempts = 0;
                        this.lastScrollHeight = newScrollHeight;
                        // Scan for new images immediately when new content loads
                        setTimeout(() => this.scanForImages(), 500);
                    }
                }, 1500);
            } else {
                // Continue scrolling
                window.scrollBy(0, 300);
                // Scan for images after each scroll
                setTimeout(() => this.scanForImages(), 500);
            }
        }, 2500);
    }

    stopAutoScroll() {
        this.isAutoScrolling = false;
        if (this.scrollInterval) {
            clearInterval(this.scrollInterval);
            this.scrollInterval = null;
        }
        if (this.scanInterval) {
            clearInterval(this.scanInterval);
            this.scanInterval = null;
        }
        this.hideScrollIndicator();
        
        // Do a final scan when stopping
        setTimeout(() => this.scanForImages(), 500);
    }

    showScrollIndicator() {
        const existing = document.getElementById('pinvault-scroll-indicator');
        if (existing) existing.remove();

        const indicator = document.createElement('div');
        indicator.id = 'pinvault-scroll-indicator';
        indicator.className = 'pinvault-scroll-indicator';
        indicator.textContent = '🔄 Auto-scrolling for more images...';
        document.body.appendChild(indicator);
    }

    hideScrollIndicator() {
        const indicator = document.getElementById('pinvault-scroll-indicator');
        if (indicator) {
            indicator.remove();
        }
    }

    setupMutationObserver() {
        // Watch for dynamically loaded content
        this.observer = new MutationObserver((mutations) => {
            let hasNewImages = false;
            
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        // Check if the node contains images
                        const images = node.querySelectorAll ? node.querySelectorAll('img') : [];
                        if (images.length > 0 || (node.tagName === 'IMG')) {
                            hasNewImages = true;
                        }
                    }
                });
            });
            
            if (hasNewImages) {
                // Debounce the scan
                clearTimeout(this.scanTimeout);
                this.scanTimeout = setTimeout(() => {
                    this.scanForImages();
                }, 500);
            }
        });

        this.observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    setupContextMenu() {
        // Add right-click context menu for individual image downloads
        document.addEventListener('contextmenu', (e) => {
            const img = e.target.closest('img');
            if (img && this.isValidPinterestImage(img)) {
                // Store reference for context menu action
                this.contextMenuImage = img;
            }
        });
    }

    getSelectedImagesData(settings) {
        const selectedData = [];
        
        console.log(`Getting selected images data: ${this.selectedImages.size} selected images`);
        
        this.selectedImages.forEach(imageId => {
            const imageData = this.imageElements.get(imageId);
            if (imageData) {
                selectedData.push({
                    id: imageId,
                    url: imageData.url,
                    title: imageData.title,
                    board: imageData.board,
                    domain: imageData.domain,
                    originalFilename: imageData.originalFilename
                });
            } else {
                console.warn(`No image data found for selected image ID: ${imageId}`);
            }
        });
        
        console.log(`Returning ${selectedData.length} image data objects`);
        return selectedData;
    }

    markImageStatus(imageId, status, error = null) {
        const imageData = this.imageElements.get(imageId);
        if (!imageData) return;

        const overlay = imageData.overlay;
        const checkbox = overlay.querySelector('.pinvault-checkbox');

        // Remove previous status classes
        overlay.classList.remove('success', 'error');

        switch (status) {
            case 'success':
                overlay.classList.add('success');
                checkbox.textContent = '✓';
                overlay.title = 'Downloaded successfully';
                break;
            case 'error':
                overlay.classList.add('error');
                checkbox.textContent = '❌';
                overlay.title = `Download failed: ${error || 'Unknown error'}`;
                break;
        }
    }
}

// Initialize content script when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.pinVaultContent = new PinVaultContent();
    });
} else {
    window.pinVaultContent = new PinVaultContent();
}

} // End of prevention check
