import React from 'react';
import { useGlobal } from '../../context/GlobalContext';

// --- EXPANDED PROFESSIONAL CONTENT ---
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
                To become the go-to free streaming service for Filipinos everywhere, bridging distances by providing a reliable and comprehensive source of local and international content.
            </p>
        </div>
        <div class="update-item">
            <div class="update-header">
                <h3 class="update-title" style="font-size: 1.2rem; color: #fff;">Legal Disclaimer</h3>
            </div>
            <p class="update-content" style="color: #aaa; font-style: italic;">
                Shakzz TV does not host any files on its servers. All content is provided by non-affiliated third parties.
            </p>
        </div>
    `,
    updates: `
        <div class="update-item">
            <div class="update-header">
                <h3 class="update-title">Server Infrastructure Upgrade</h3>
                <span class="update-date">2026-01-20</span>
            </div>
            <p class="update-content">Migrated to a decentralized CDN architecture to ensure 99.9% uptime and reduced buffering for international viewers.</p>
        </div>
        <div class="update-item">
            <div class="update-header">
                <h3 class="update-title">Anime Library Expansion</h3>
                <span class="update-date">2026-01-05</span>
            </div>
            <p class="update-content">Added 500+ new anime titles, including exclusive Tagalog Dubbed series. Integrated multi-source selection for backup playback.</p>
        </div>
        <div class="update-item">
            <div class="update-header">
                <h3 class="update-title">Global Live Chat Launch</h3>
                <span class="update-date">2025-12-08</span>
            </div>
            <p class="update-content">Real-time community chat is now live! Features include custom user profiles, photo sharing, and moderation tools.</p>
        </div>
        <div class="update-item">
            <div class="update-header">
                <h3 class="update-title">UI/UX Overhaul (Glassmorphism)</h3>
                <span class="update-date">2025-11-22</span>
            </div>
            <p class="update-content">Complete redesign of the interface featuring a modern dark aesthetic, improved mobile responsiveness, and smoother animations.</p>
        </div>
    `,
    faq: `
        <div class="faq-container" style="padding: 10px 0;">
            <div class="faq-item">
                <h3 class="faq-question"><i class="fa-solid fa-circle-question"></i> Is Shakzz TV completely free?</h3>
                <p class="faq-answer">Yes. We believe in open access to information and entertainment. There are no subscription fees, credit card requirements, or hidden paywalls.</p>
            </div>
            <div class="faq-item">
                <h3 class="faq-question"><i class="fa-solid fa-triangle-exclamation"></i> Why are there pop-up ads?</h3>
                <p class="faq-answer">
                    We utilize third-party video hosting providers to stream content. These providers often include ads to cover their significant bandwidth costs. Shakzz TV does not control these ads.
                    <br><strong style="color:#fff">Tip:</strong> Use the "Server" selector to find a stream with fewer interruptions.
                </p>
            </div>
            <div class="faq-item">
                <h3 class="faq-question"><i class="fa-solid fa-wifi"></i> Troubleshooting Buffering</h3>
                <p class="faq-answer">
                    If playback stalls:
                    <br>1. <strong>Switch Servers:</strong> Try Server 2 or 3 below the player.
                    <br>2. <strong>Quality:</strong> Lower the resolution (e.g., to 720p) via the settings gear icon.
                    <br>3. <strong>Cache:</strong> Clear your browser cache or try Incognito mode.
                </p>
            </div>
            <div class="faq-item">
                <h3 class="faq-question"><i class="fa-solid fa-mobile-screen"></i> How to install on Mobile?</h3>
                <p class="faq-answer">
                    Shakzz TV is a Progressive Web App (PWA).
                    <br><strong>iOS:</strong> Tap 'Share' > 'Add to Home Screen'.
                    <br><strong>Android:</strong> Tap 'Menu' (three dots) > 'Install App'.
                </p>
            </div>
        </div>
    `,
    privacy: `
        <div class="privacy-container" style="padding: 10px 0; color: #ccc; line-height: 1.6;">
            <div class="update-item">
                <h3 class="update-title" style="color: #fff;">1. Data Collection Policy</h3>
                <p class="update-content">
                    We value user anonymity. We do not collect personally identifiable information (PII) unless explicitly provided by you (e.g., via Google Login).
                    <br><strong>Logged Data:</strong> Includes IP address, browser type, and pages visited, used solely for analytics and abuse prevention.
                </p>
            </div>
            <div class="update-item">
                <h3 class="update-title" style="color: #fff;">2. Cookie Usage</h3>
                <p class="update-content">
                    We use local storage and cookies to remember your preferences (e.g., volume settings, last watched channel, dark mode toggles). These are stored on your device and are not shared with third parties.
                </p>
            </div>
            <div class="update-item">
                <h3 class="update-title" style="color: #fff;">3. Third-Party Embeds</h3>
                <p class="update-content">
                    Content on this site may include embedded videos from other services (e.g., YouTube, VidSrc). Embedded content behaves exactly as if the visitor has visited the other website. These websites may collect data about you, use cookies, and monitor your interaction with that embedded content.
                </p>
            </div>
            <div class="update-item">
                <h3 class="update-title" style="color: #fff;">4. DMCA / Copyright</h3>
                <p class="update-content">
                    Shakzz TV respects the intellectual property rights of others. We do not host copyrighted content. If you believe your work has been copied in a way that constitutes copyright infringement, please contact the third-party host directly or use our contact form for removal of the reference link.
                </p>
            </div>
        </div>
    `,
    contact: `
        <div style="text-align: center; padding: 20px 0;">
            <i class="fa-solid fa-envelope-open-text" style="font-size: 3rem; color: #ccc; margin-bottom: 20px;"></i>
            <h2 style="color: #fff; margin-bottom: 10px;">Contact Support</h2>
            <p style="color: #aaa; max-width: 500px; margin: 0 auto 30px auto;">
                Found a broken link? Have a feature request? Or just want to join the team?
                <br>Fill out the form below and we'll get back to you within 24 hours.
            </p>
            <form action="https://formspree.io/f/manpwdko" method="POST" style="max-width: 500px; margin: 0 auto; text-align: left;">
                <div style="margin-bottom: 15px;">
                    <input class="contact-input" type="email" name="email" placeholder="Your Email Address" required style="width: 100%; padding: 12px; background: rgba(255,255,255,0.1); border: 1px solid #333; color: white; border-radius: 8px;">
                </div>
                <div style="margin-bottom: 15px;">
                    <select class="contact-input" name="subject" style="width: 100%; padding: 12px; background: rgba(30,30,30,1); border: 1px solid #333; color: white; border-radius: 8px;">
                        <option value="General Inquiry">General Inquiry</option>
                        <option value="Report Broken Link">Report Broken Link</option>
                        <option value="Content Request">Request Content</option>
                        <option value="DMCA">DMCA / Legal</option>
                    </select>
                </div>
                <div style="margin-bottom: 15px;">
                    <textarea class="contact-input" name="message" rows="5" placeholder="How can we help?" required style="width: 100%; padding: 12px; background: rgba(255,255,255,0.1); border: 1px solid #333; color: white; border-radius: 8px;"></textarea>
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
        updates: 'Platform Updates',
        contact: 'Contact Support',
        faq: 'Frequently Asked Questions',
        privacy: 'Privacy & Terms',
        history: 'Watch History',
        watchlist: 'My Favorites'
    };

    return (
        <div 
            id="info-modal" 
            className="info-modal" 
            style={{ 
                position: 'fixed',
                top: '70px',
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
