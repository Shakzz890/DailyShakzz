import React from 'react';
import { useGlobal } from '../../context/GlobalContext';

const InfoModal = () => {
    const { infoModal, setInfoModal } = useGlobal();

    if (!infoModal.isOpen) return null;

    const closeModal = () => setInfoModal({ isOpen: false, type: '' });

    const getTitle = () => {
        switch(infoModal.type) {
            case 'updates': return 'System Updates';
            case 'faq': return 'Help & FAQ';
            case 'privacy': return 'Privacy Policy';
            case 'contact': return 'Contact Us';
            default: return 'Info';
        }
    };

    return (
        <div id="info-modal" style={{display:'flex', zIndex:5000}}>
            <div className="info-content-wrapper">
                
                {/* HEADER */}
                <div className="info-header">
                    <button className="close-info" onClick={closeModal} style={{left:'20px', right:'auto', transform:'none'}}>
                        <i className="fa-solid fa-arrow-left"></i>
                    </button>
                    <h2 id="info-title" style={{marginLeft:'60px', paddingRight:0}}>{getTitle()}</h2>
                </div>

                {/* BODY */}
                <div className="info-body" style={{display: 'flex', flexDirection: 'column'}}>
                    
                    {/* CONTACT FORM */}
                    {infoModal.type === 'contact' && (
                        <div style={{
                            display: 'flex', flexDirection: 'column', gap: '15px', 
                            maxWidth: '500px', margin: '0 auto', height: '100%', width: '100%',
                            overflow: 'hidden'
                        }}>
                            <p style={{color:'#aaa', marginBottom:'5px', textAlign:'center', fontSize:'0.9rem'}}>
                                Send us a request, bug report, or feedback.
                            </p>
                            
                            {/* TITLE */}
                            <div style={{display:'flex', flexDirection:'column', gap:'5px'}}>
                                <label style={{color:'#fff', fontWeight:'600', fontSize:'0.85rem'}}>Title / Subject</label>
                                <input type="text" placeholder="e.g. Broken Link" className="contact-input" />
                            </div>

                            {/* NAME */}
                            <div style={{display:'flex', flexDirection:'column', gap:'5px'}}>
                                <label style={{color:'#fff', fontWeight:'600', fontSize:'0.85rem'}}>Your Name</label>
                                <input type="text" placeholder="Your Name" className="contact-input" />
                            </div>

                            {/* DESCRIPTION */}
                            <div style={{display:'flex', flexDirection:'column', gap:'5px', flex:'1', minHeight:'0'}}>
                                <label style={{color:'#fff', fontWeight:'600', fontSize:'0.85rem'}}>Description</label>
                                <textarea 
                                    placeholder="Type your message here..." 
                                    className="contact-input" 
                                    style={{
                                        resize:'none', height:'100%', 
                                        padding:'15px', lineHeight:'1.5'
                                    }}
                                ></textarea>
                            </div>

                            <button className="contact-btn" onClick={() => { alert("Message Sent!"); closeModal(); }} style={{marginTop:'5px', marginBottom:'20px'}}>
                                Send Message <i className="fa-solid fa-paper-plane" style={{marginLeft:'5px'}}></i>
                            </button>
                        </div>
                    )}

                    {/* UPDATES CONTENT */}
                    {infoModal.type === 'updates' && (
                        <div className="update-item">
                            <div className="update-header">
                                <h3 className="update-title">Version 2.0 Released</h3>
                                <span className="update-date">Jan 23, 2026</span>
                            </div>
                            <p className="update-content">
                                • Added "Continue Watching" history<br/>
                                • Improved Video Player & Servers<br/>
                                • New Discord Community Integration
                            </p>
                        </div>
                    )}

                    {/* FAQ CONTENT */}
                    {infoModal.type === 'faq' && (
                        <div className="faq-list">
                            <div className="faq-item">
                                <div className="faq-question"><i className="fas fa-question-circle"></i> Is this free?</div>
                                <div className="faq-answer">Yes, 100% free streaming.</div>
                            </div>
                            <div className="faq-item">
                                <div className="faq-question"><i className="fas fa-video"></i> Video buffering?</div>
                                <div className="faq-answer">Try switching servers in the player settings.</div>
                            </div>
                        </div>
                    )}

                    {/* PRIVACY CONTENT */}
                    {infoModal.type === 'privacy' && (
                        <div style={{color:'#ccc', lineHeight:'1.6'}}>
                            <p>We do not host any content. All videos are provided by 3rd party services. We simply index them.</p>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default InfoModal;
