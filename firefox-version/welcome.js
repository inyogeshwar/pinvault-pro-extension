function showHelp() {
    window.open('https://github.com/inyogeshwar/pinvault-pro-extension#readme', '_blank');
}

function showFeedback() {
    window.open('mailto:yogeshwar853202@outlook.com?subject=PinVault%20Pro%20Feedback&body=Hi%20Yogeshwar,%0A%0ARegarding%20PinVault%20Pro%20extension:%0A%0A', '_blank');
}

// Add some interactive animations
document.addEventListener('DOMContentLoaded', function() {
    const cards = document.querySelectorAll('.feature-card');
    
    cards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
        card.style.animation = 'fadeInUp 0.6s ease forwards';
    });
    
    // Add click event listeners for the footer links
    document.querySelector('a[href="#"][data-action="help"]').addEventListener('click', function(e) {
        e.preventDefault();
        showHelp();
    });
    
    document.querySelector('a[href="#"][data-action="feedback"]').addEventListener('click', function(e) {
        e.preventDefault();
        showFeedback();
    });
});

// Add CSS animation
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(style);
