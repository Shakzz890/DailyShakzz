import React from 'react';
import { useGlobal } from '../../context/GlobalContext';

// --- UPDATED CONTENT ---
const infoContent = {
    about: `
        <div class="update-item">
            <div class="update-header">
                <h3 class="update-title" style="font-size: 1.4rem; color: #fff;">About Shakzz TV</h3>
            </div>
            <p class="update-content">
                Shakzz TV delivers a premier, curated portfolio of local and international networks, providing a seamless, high-quality streaming experience available 24/7. Our platform offers a comprehensive spectrum of programming designed to cater to every interest—from breaking news and live sports to insightful documentaries and engaging animation.
            </p>
        </div>

        <div class="update-item">
            <div class="update-header">
                <h3 class="update-title" style="font-size: 1.2rem; color: #fff;">Our Vision & Commitment</h3>
            </div>
            <p class="update-content">
                To become the go-to free streaming service for Filipinos everywhere, bridging distances by providing a reliable and comprehensive source of local and international content. We envision a platform where every user feels connected to home, informed about the world, and entertained without barriers.
            </p>
        </div>

        <div class="update-item">
            <div class="update-header">
                <h3 class="update-title" style="font-size: 1.2rem; color: #fff;">The 'Why': A Note from the Creator</h3>
            </div>
            <p class="update-content">
                Shakzz TV was born from a simple idea: everyone deserves easy access to the channels they love, especially those that connect them to news, culture, and entertainment from home. This project is a labor of love, dedicated to providing a seamless and free service for the community.
            </p>
        </div>
    `,
    updates: `
        <div class="update-item">
            <div class="update-header">
                <h3 class="update-title">Server Performance Upgrade</h3>
                <span class="update-date">2026-01-15</span>
            </div>
            <p class="update-content">We have migrated to a high-speed CDN to reduce buffering during peak hours. Live TV channels now have 99.9% uptime stability.</p>
        </div>
        <div class="update-item">
            <div class="update-header">
                <h3 class="update-title">Anime Library Expansion</h3>
                <span class="update-date">2026-01-02</span>
            </div>
            <p class="update-content">Added over 500+ new Anime titles including Tagalog Dubbed classics. The player now supports multi-server selection for anime content.</p>
        </div>
        <div class="update-item">
            <div class="update-header">
                <h3 class="update-title">Global Live Chat</h3>
                <span class="update-date">2025-12-08</span>
            </div>
            <p class="update-content">Connect with other viewers in real-time! We've launched the Shakzz Community chat featuring photo/video sharing, camera support, and custom user profiles.</p>
        </div>
        <div class="update-item">
            <div class="update-header">
                <h3 class="update-title">Complete UI Overhaul</h3>
                <span class="update-date">2025-11-22</span>
            </div>
            <p class="update-content">Experience the new modern <strong>Glassmorphism dark theme</strong>, optimized mobile layout, and glitch-free sidebar.</p>
        </div>
        <div class="update-item">
            <div class="update-header">
                <h3 class="update-title">Live Notification System</h3>
                <span class="update-date">2025-11-08</span>
            </div>
            <p class="update-content">Notifications can now appear on-screen for important updates regarding server maintenance or new episodes.</p>
        </div>
    `,
    faq: `
        <div class="faq-container" style="padding: 10px 0;">
            <div class="faq-item">
                <h3 class="faq-question"><i class="fa-solid fa-circle-question"></i> Is Shakzz TV really free?</h3>
                <p class="faq-answer">Yes! Shakzz TV is 100% free. We do not ask for credit cards, subscriptions, or hidden fees. Just click and play.</p>
            </div>
            <div class="faq-item">
                <h3 class="faq-question"><i class="fa-solid fa-triangle-exclamation"></i> Why do I see pop-up ads?</h3>
                <p class="faq-answer">
                    We use third-party video servers (like VidSrc, SuperStream) to host content. These servers sometimes include their own ads to cover hosting costs. 
                    <br><strong style="color: #fff">Tip:</strong> Simply close the pop-up and click play again. We try to select servers with the fewest ads possible.
                </p>
            </div>
            <div class="faq-item">
                <h3 class="faq-question"><i class="fa-solid fa-wifi"></i> Why is the video buffering?</h3>
                <p class="faq-answer">
                    Buffering is usually caused by internet speed or high server traffic.
                    <br>1. <strong>Switch Servers:</strong> Use the "Server" menu below the player (try Server 2 or 3).
                    <br>2. Clear your browser cache.
                    <br>3. Check your internet connection.
                </p>
            </div>
            <div class="faq-item">
                <h3 class="faq-question"><i class="fa-solid fa-closed-captioning"></i> How do I turn on subtitles?</h3>
                <p class="faq-answer">
                    Most of our players have a <strong>"CC"</strong> button in the bottom corner of the video player. Click it to enable subtitles or switch languages. If a specific subtitle is missing, try switching to a different Server.
                </p>
            </div>
            <div class="faq-item">
                <h3 class="faq-question"><i class="fa-solid fa-mobile-screen"></i> Is there a mobile app?</h3>
                <p class="faq-answer">
                    Not on the App Store yet, but you can install Shakzz TV as a <strong>Web App (PWA)</strong>.
                    <br><strong>iOS:</strong> Tap Share > "Add to Home Screen".
                    <br><strong>Android:</strong> Tap Menu > "Install App" or "Add to Home Screen".
                </p>
            </div>
            <div class="faq-item">
                <h3 class="faq-question"><i class="fa-solid fa-video"></i> Can I request a movie or show?</h3>
                <p class="faq-answer">Yes! Join our Discord community (link in footer) or use the "Contact Us" form to send a request. We usually add requested content within 24-48 hours.</p>
            </div>
        </div>
    `,
    privacy: `
        <div class="privacy-container" style="padding: 10px 0; color: #ccc; line-height: 1.6;">
            <div class="update-item">
                <h3 class="update-title" style="color: #fff;">1. Introduction</h3>
                <p class="update-content">Welcome to Shakzz TV. We respect your privacy and are committed to protecting your personal data. This policy explains what we collect and how we use it.</p>
            </div>
            <div class="update-item">
                <h3 class="update-title" style="color: #fff;">2. Information We Collect</h3>
                <p class="update-content">
                    <strong>Personal Data:</strong> If you sign in via Google/Github, we store your public profile name and email solely for authentication purposes.
                    <br><strong>Usage Data:</strong> We track your "Watch History" and "Favorites" locally on your device or linked to your account to provide the "Continue Watching" feature.
                </p>
            </div>
            <div class="update-item">
                <h3 class="update-title" style="color: #fff;">3. Third-Party Services</h3>
                <p class="update-content">
                    Our website embeds video players from third-party services (e.g., TMDB, VidSrc). These third parties may use cookies or similar tracking technologies. Shakzz TV does not control these services and is not responsible for their privacy practices.
                </p>
            </div>
            <div class="update-item">
                <h3 class="update-title" style="color: #fff;">4. Data Security</h3>
                <p class="update-content">We implement standard security measures (SSL encryption, Firebase Authentication) to protect your data. However, no method of transmission over the Internet is 100% secure.</p>
            </div>
            <div class="update-item">
                <h3 class="update-title" style="color: #fff;">5. Your Rights</h3>
                <p class="update-content">You have the right to request the deletion of your account and data at any time. Simply contact us or use the delete option in your profile settings (coming soon).</p>
            </div>
        </div>
    `,
    contact: `
        <div style="text-align: center; padding: 20px 0;">
            <i class="fa-solid fa-paper-plane" style="font-size: 3rem; color: #ccc; margin-bottom: 20px;"></i>
            <h2 style="color: #fff; margin-bottom: 10px;">Get in Touch</h2>
            <p style="color: #aaa; max-width: 500px; margin: 0 auto 30px auto;">Have a request, found a bug, or just want to say hi? Send us a message!</p>
            <form action="https://formspree.io/f/manpwdko" method="POST" style="max-width: 500px; margin: 0 auto; text-align: left;">
                <div style="margin-bottom: 15px;">
                    <input class="contact-input" type="email" name="email" placeholder="Your Email" required style="width: 100%; padding: 12px; background: rgba(255,255,255,0.1); border: 1px solid #333; color: white; border-radius: 8px;">
                </div>
                <div style="margin-bottom: 15px;">
                    <textarea class="contact-input" name="message" rows="4" placeholder="Your Message" required style="width: 100%; padding: 12px; background: rgba(255,255,255,0.1); border: 1px solid #333; color: white; border-radius: 8px;"></textarea>
                </div>
                <button type="submit" class="contact-btn" style="width: 100%; padding: 14px; background: #e50914; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer;">Send Message</button>
            </form>
        </div>
    `
};

const InfoModal = () => {
    const { infoModal, setInfoModal } = useGlobal();

    if (!infoModal.isOpen) return null;

    const titles = {
        about: 'About Us',
        updates: 'Latest Updates',
        contact: 'Contact Us',
        faq: 'FAQs',
        privacy: 'Privacy Policy',
        history: 'Watch History',
        watchlist: 'My Favorites'
    };

    return (
        <div 
            id="info-modal" 
            className="info-modal" 
            style={{ 
                position: 'fixed',
                top: '70px', // Below navbar
                left: 0,
                width: '100vw',
                height: 'calc(100vh - 70px)',
                zIndex: 300000, 
                background: '#141414',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
            }} 
        >
            <div className="info-content-wrapper" style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
                <div className="info-header" style={{ flexShrink: 0 }}>
                    <h2 id="info-title">{titles[infoModal.type] || 'Information'}</h2>
                    <span className="close-info" onClick={() => setInfoModal({ ...infoModal, isOpen: false })}>×</span>
                </div>
                
                {/* --- ENABLE SCROLLING HERE --- */}
                <div 
                    className="info-body" 
                    id="info-body" 
                    dangerouslySetInnerHTML={{ __html: infoContent[infoModal.type] }}
                    style={{ 
                        flex: 1, 
                        overflowY: 'auto', 
                        padding: '20px 25px',
                        paddingBottom: '80px' 
                    }}
                ></div>
            </div>
        </div>
    );
};

export default InfoModal;
