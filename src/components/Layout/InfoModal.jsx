import React from 'react';
import { useGlobal } from '../../context/GlobalContext';

// --- EXPANDED CONTENT ---
const infoContent = {
    // --- FIXED STYLE: Now uses "update-item" classes to match other tabs ---
    about: `
        <div class="about-container">
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
                    To become the go-to free streaming service for Filipinos everywhere, bridging distances by providing a reliable and comprehensive source of local and international content. We envision a platform where every user feels connected to home, informed about the world, and entertained without barriers. We are committed to delivering a stable and high-quality streaming experience.
                </p>
            </div>

            <div class="update-item">
                <div class="update-header">
                    <h3 class="update-title" style="font-size: 1.2rem; color: #fff;">The 'Why': A Note from the Creator</h3>
                </div>
                <p class="update-content">
                    Shakzz TV was born from a simple idea: everyone deserves easy access to the channels they love, especially those that connect them to news, culture, and entertainment from home. As a passionate developer and media enthusiast, I created this platform to solve the common frustration of unreliable streams and scattered content.
                </p>
            </div>
        </div>
    `,
    updates: `
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
        <div class="update-item">
            <div class="update-header">
                <h3 class="update-title">TV Remote Compatibility</h3>
                <span class="update-date">2025-11-08</span>
            </div>
            <p class="update-content">Fully <strong>Smart TV compatible!</strong> Navigate using your remote's arrow keys. Supported on Android TV, Fire TV, Tizen, and WebOS.</p>
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
                    We use third-party video servers (like Server 1, Server 2) to host content. These servers sometimes include their own ads to cover costs. 
                    <br><strong>Tip:</strong> Simply close the pop-up and click play again. We try to select servers with the fewest ads possible.
                </p>
            </div>
            <div class="faq-item">
                <h3 class="faq-question"><i class="fa-solid fa-wifi"></i> Why is the video buffering?</h3>
                <p class="faq-answer">
                    Buffering is usually caused by internet speed or high server traffic.
                    <br>1. <strong>Switch Servers:</strong> Use the "Server" menu below the player (try Server 3 or 4).
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
                <h3 class="faq-question"><i class="fa-solid fa-film"></i> How do I request a movie/show?</h3>
                <p class="faq-answer">
                    We love adding new content! Use the <strong>"Contact Us"</strong> form in the sidebar menu. Please provide the exact Title and Year.
                </p>
            </div>
            <div class="faq-item">
                <h3 class="faq-question"><i class="fa-solid fa-tv"></i> Can I watch on my Smart TV?</h3>
                <p class="faq-answer">
                    Yes! Our site is optimized for TV browsers (Samsung Tizen, LG WebOS, Android TV). 
                    <br>You can use your remote's arrow keys to navigate the entire interface seamlessly.
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
                <h3 class="faq-question"><i class="fa-solid fa-link-slash"></i> The video says "File not found."</h3>
                <p class="faq-answer">
                    Links can sometimes expire. If a video is broken:
                    <br>1. Please try <strong>all available servers</strong> first.
                    <br>2. If none work, report it using the Contact form so we can re-upload it.
                </p>
            </div>
        </div>
    `,
    privacy: `
        <div class="privacy-container" style="padding: 10px 0; color: #ccc; line-height: 1.6;">
            <h2 style="color: #fff; margin-bottom: 20px;">Privacy Policy</h2>
            <p style="font-size: 0.9rem; margin-bottom: 20px;">Last Updated: January 2026</p>

            <div class="update-item">
                <h3 class="update-title" style="color: #fff;">1. Introduction</h3>
                <p class="update-content">
                    Welcome to Shakzz TV. We respect your privacy and are committed to protecting your personal data. 
                    This privacy policy will inform you as to how we look after your personal data when you visit our website.
                </p>
            </div>
            <div class="update-item">
                <h3 class="update-title" style="color: #fff;">2. Information We Collect</h3>
                <p class="update-content">
                    We collect minimal data to provide a better experience:
                    <br><br>
                    <strong>• Identity Data:</strong> Username/Email if you choose to sign in via Google/GitHub.
                    <br><strong>• Usage Data:</strong> Watch History, Favorites list, and video progress (saved locally or synced if logged in).
                    <br><strong>• Technical Data:</strong> IP address, browser type, and operating system (standard web logs).
                </p>
            </div>
            <div class="update-item">
                <h3 class="update-title" style="color: #fff;">3. Third-Party Links & Servers</h3>
                <p class="update-content">
                    Shakzz TV does not host any video content on its own servers. We act as a search engine that embeds links to content hosted on third-party services (e.g., VidSrc, Filemoon).
                    <br><br>
                    Clicking on these links may allow third parties to collect data about you. We do not control these third-party websites and are not responsible for their privacy statements.
                </p>
            </div>
            <div class="update-item">
                <h3 class="update-title" style="color: #fff;">4. Cookies</h3>
                <p class="update-content">
                    We use local storage and cookies to save your preferences (such as your last played channel, volume settings, or preferred server). You can clear this data at any time via your browser settings.
                </p>
            </div>
            <div class="update-item">
                <h3 class="update-title" style="color: #fff;">5. Data Deletion</h3>
                <p class="update-content">
                    If you wish to have your account and associated data (History/Watchlist) permanently deleted from our database, please contact us via the form below or email support.
                </p>
            </div>
        </div>
    `,
    contact: `
        <div style="text-align: center; padding: 20px 0;">
            <i class="fa-solid fa-paper-plane" style="font-size: 3rem; color: #ccc; margin-bottom: 20px;"></i>
            <h2 style="color: #fff; margin-bottom: 10px;">Get in Touch</h2>
            <p style="color: #aaa; max-width: 500px; margin: 0 auto 30px auto; line-height: 1.5;">
                Have a movie request, found a bug, or just want to say hi? 
                Fill out the form below or reach out via social media!
            </p>

            <form action="https://formspree.io/f/manpwdko" method="POST" style="max-width: 500px; margin: 0 auto; text-align: left;">
                <div style="margin-bottom: 15px;">
                    <label style="color:#ddd; font-size:0.9rem; margin-bottom:5px; display:block;">Your Email</label>
                    <input class="contact-input" type="email" name="email" placeholder="name@example.com" required 
                           style="width: 100%; padding: 12px 15px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.2); background: rgba(0,0,0,0.3); color: white; outline: none;">
                </div>
                <div style="margin-bottom: 15px;">
                    <label style="color:#ddd; font-size:0.9rem; margin-bottom:5px; display:block;">Message / Request</label>
                    <textarea class="contact-input" name="message" rows="4" placeholder="Enter movie name or describe the issue..." required 
                              style="width: 100%; padding: 12px 15px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.2); background: rgba(0,0,0,0.3); color: white; outline: none; resize: vertical;"></textarea>
                </div>
                <button type="submit" class="contact-btn" 
                        style="width: 100%; padding: 14px; background: #e50914; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; font-size: 1rem;">
                    <i class="fa-solid fa-paper-plane" style="margin-right:8px;"></i> Send Message
                </button>
            </form>

            <div style="margin-top: 40px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 20px;">
                <p style="color:#888; margin-bottom: 15px;">Or contact us directly:</p>
                <div style="display: flex; justify-content: center; gap: 20px; font-size: 1.2rem;">
                    <a href="mailto:support@shakzz.tv" style="color: #ccc;"><i class="fa-solid fa-envelope"></i></a>
                    <a href="#" style="color: #ccc;"><i class="fa-brands fa-facebook"></i></a>
                    <a href="#" style="color: #ccc;"><i class="fa-brands fa-discord"></i></a>
                </div>
            </div>
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
        faq: 'Frequently Asked Questions',
        privacy: 'Privacy Policy',
        history: 'Watch History',
        watchlist: 'My Favorites'
    };

    return (
        <div 
            id="info-modal" 
            className="info-modal" 
            style={{ 
                // --- FIXED POSITIONING AS PAGE ---
                position: 'fixed',
                top: '70px',
                left: 0,
                width: '100vw',
                height: 'calc(100vh - 70px)',
                zIndex: 5000, 
                background: '#141414',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden' // Important: Contain overflow here
            }} 
        >
            <div 
                className="info-content-wrapper" 
                style={{ 
                    width: '100%', 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column' 
                }}
            >
                <div className="info-header" style={{ flexShrink: 0 }}>
                    <h2 id="info-title">{titles[infoModal.type] || 'Information'}</h2>
                    <span className="close-info" onClick={() => setInfoModal({ ...infoModal, isOpen: false })}>×</span>
                </div>
                
                {/* --- SCROLLABLE BODY --- */}
                <div 
                    className="info-body" 
                    id="info-body" 
                    dangerouslySetInnerHTML={{ __html: infoContent[infoModal.type] }}
                    style={{ 
                        flex: 1, 
                        overflowY: 'auto',  // Enable vertical scrolling
                        padding: '20px 25px',
                        paddingBottom: '80px' 
                    }}
                ></div>
            </div>
        </div>
    );
};

export default InfoModal;
