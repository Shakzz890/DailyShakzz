import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGlobal } from '../context/GlobalContext';
import { channels, animeData } from '../api/channels'; 
import { PLACEHOLDER_IMG } from '../api/tmdb';

const SECURE_WORKER_URL = "https://stream.supreme-ninja01.workers.dev";

const TABS = [
    "all", 
    "favorites", 
    "news", 
    "entertainment", 
    "movies", 
    "sports", 
    "documentary", 
    "cartoons & animations", 
    "anime tagalog dubbed"
];

const Live = () => {
    const navigate = useNavigate();

    // --- STATE ---
    const [activeChannelKey, setActiveChannelKey] = useState(null);
    const [activeTab, setActiveTab] = useState(0); 
    const [searchQuery, setSearchQuery] = useState("");
    const [favorites, setFavorites] = useState([]);
    
    const [onlineCount, setOnlineCount] = useState(null);
    const [currentTime, setCurrentTime] = useState(new Date()); 
    
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [animeEpisodes, setAnimeEpisodes] = useState([]);
    const [selectedAnimeTitle, setSelectedAnimeTitle] = useState("");
    const [isAnimeLoading, setIsAnimeLoading] = useState(false);

    useEffect(() => {
        const storedFavs = JSON.parse(localStorage.getItem("favoriteChannels") || "[]");
        setFavorites(storedFavs);

        const lastPlayed = localStorage.getItem("lastPlayedChannel");
        let targetChannel = "";

        if (lastPlayed && channels[lastPlayed]) {
            targetChannel = lastPlayed;
        } else {
            targetChannel = channels['kapamilya'] ? 'kapamilya' : Object.keys(channels)[0];
        }

        if (targetChannel) {
            loadChannel(targetChannel);
        }

        const timeInterval = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000); 

        const updateCount = async () => {
            const uid = localStorage.getItem('visitor_uid') || Math.random().toString(36).substring(7);
            localStorage.setItem('visitor_uid', uid);
            try {
                const response = await fetch(`https://shakzz-tv.firebaseapp.com/api/visit?uid=${uid}&t=${Date.now()}`);
                if (response.ok) {
                    const data = await response.json();
                    setOnlineCount(data.count.toLocaleString());
                }
            } catch (err) {}
        };
        const countInterval = setInterval(updateCount, 5000);
        updateCount();

        if (!window.jwplayer) {
            const script = document.createElement('script');
            script.src = "https://ssl.p.jwpcdn.com/player/v/8.38.10/jwplayer.js";
            script.onload = () => {
                window.jwplayer.key = "ITWMv7t88JGzI0xPwW8I0+LveiXX9SWbfdmt0ArUSyc=";
                if(targetChannel) loadChannel(targetChannel);
            };
            document.head.appendChild(script);
        }

        return () => {
            clearInterval(timeInterval);
            clearInterval(countInterval);
        };
    }, []);

    const loadChannel = async (key, customData = null) => {
        const channelMeta = customData || channels[key];
        if (!channelMeta) return;

        setActiveChannelKey(key);
        if(!customData) localStorage.setItem("lastPlayedChannel", key);

        let secureData = {};
        
        try {
            if (!customData) {
                const response = await fetch(`${SECURE_WORKER_URL}/get-channel?id=${key}`);
                if (!response.ok) throw new Error("Stream Offline");
                secureData = await response.json();
            } else {
                secureData = customData; 
            }
        } catch (error) {
            console.error("Secure Fetch Error:", error);
            return; 
        }

        const finalConfig = { ...channelMeta, ...secureData };

        if (window.jwplayer) {
            const AUTH_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJTaGFrenoiLCJleHAiOjE3NjY5NTgzNTN9.RSc_LQ11txXXI0d7gZ8GvMOAwoHrWzUUr3CCQCM0Hco";
            
            let finalManifest = finalConfig.manifestUri;
            
            if (!finalManifest) return;

            if (finalManifest.includes("converse.nathcreqtives.com")) {
                const separator = finalManifest.includes('?') ? '&' : '?';
                finalManifest = `${finalManifest}${separator}token=${AUTH_TOKEN}`;
            }

            let drmConfig = undefined;
            if (finalConfig.type === "clearkey" && finalConfig.keyId && finalConfig.key) {
                drmConfig = { clearkey: { keyId: finalConfig.keyId, key: finalConfig.key } };
            } else if (finalConfig.type === "widevine") {
                drmConfig = { widevine: { url: finalConfig.licenseServerUri || finalConfig.key } };
            }

            window.jwplayer("video").setup({
                autostart: true,
                width: "100%",
                height: "100%",
                stretching: "exactfit",
                file: finalManifest,
                type: finalConfig.type === "mp4" ? "mp4" : (finalConfig.type === "hls" ? "hls" : "dash"),
                drm: drmConfig
            });
        }
    };

    const handleAnimeSelect = async (e) => {
        const title = e.target.value;
        setSelectedAnimeTitle(title);
        
        if (animeData && animeData[title]) {
            setIsAnimeLoading(true);
            setAnimeEpisodes([]);

            try {
                const response = await fetch(`${SECURE_WORKER_URL}/get-anime?title=${encodeURIComponent(title)}`);
                
                if (response.ok) {
                    const secureEpisodes = await response.json();
                    const localEpisodes = animeData[title];
                    
                    const mergedList = localEpisodes.map((localEp, index) => {
                        const secureEp = secureEpisodes[index] || {};
                        return {
                            ...localEp,
                            manifestUri: secureEp.manifestUri
                        };
                    });

                    setAnimeEpisodes(mergedList);
                } else {
                    setAnimeEpisodes([]);
                }
            } catch (error) {
                console.error("Anime Fetch Error:", error);
                setAnimeEpisodes([]);
            } finally {
                setIsAnimeLoading(false);
            }
        }
    };

    const handleCategorySelect = (index) => {
        setActiveTab(index);
        setIsCategoryModalOpen(false);
        if (TABS[index] !== "anime tagalog dubbed") {
            setSelectedAnimeTitle("");
            setAnimeEpisodes([]);
        }
    };

    const toggleFavorite = (e, key) => {
        e.stopPropagation();
        let newFavs;
        if (favorites.includes(key)) newFavs = favorites.filter(k => k !== key);
        else newFavs = [...favorites, key];
        setFavorites(newFavs);
        localStorage.setItem("favoriteChannels", JSON.stringify(newFavs));
    };

    const getFilteredList = () => {
        const selectedGroup = TABS[activeTab];
        if (selectedGroup === "anime tagalog dubbed") return [];

        return Object.entries(channels).filter(([key, channel]) => {
            const group = channel.group || "live";
            const matchesSearch = channel.name.toLowerCase().includes(searchQuery.toLowerCase());
            let matchesGroup = false;
            if (selectedGroup === "all") matchesGroup = true;
            else if (selectedGroup === "favorites") matchesGroup = favorites.includes(key);
            else matchesGroup = Array.isArray(group) ? group.includes(selectedGroup) : group === selectedGroup;

            return matchesSearch && matchesGroup;
        }).sort((a, b) => a[1].name.localeCompare(b[1].name));
    };

    const filteredChannels = getFilteredList();
    const isAnimeTab = TABS[activeTab] === "anime tagalog dubbed";

    const formatFullDateTime = (date) => {
        const dateStr = date.toLocaleDateString('en-US', { 
            weekday: 'short', month: 'short', day: 'numeric' 
        });

        let hours = date.getHours();
        const minutes = date.getMinutes().toString().padStart(2, '0');
        const seconds = date.getSeconds().toString().padStart(2, '0');
        
        let suffix = 'AM';
        if (hours === 12) suffix = 'NN';
        else if (hours === 0) { hours = 12; suffix = 'MN'; }
        else if (hours > 12) { hours -= 12; suffix = 'PM'; }

        return { dateStr, timeStr: `${hours}:${minutes}:${seconds} ${suffix}` };
    };

    const { dateStr, timeStr } = formatFullDateTime(currentTime);

    return (
        <div id="live-view" style={{ display: 'flex' }}>
            
            <div className="live-player-container">
                <div id="playerWrapper">
                    <div id="video">
                        <div className="skeleton" style={{width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, background: '#000'}}></div>
                    </div>
                    <div id="overlayContainer">
                        <div id="nowPlayingOverlay">
                            <span className="pulsing-dot"></span>
                            Now Playing: <span id="nowPlayingChannel">
                                {activeChannelKey && !isAnimeTab && channels[activeChannelKey] 
                                    ? channels[activeChannelKey].name 
                                    : (activeChannelKey || "--")}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="channel-section">
                <div className="search-container">
                    <i className="fas fa-search search-icon"></i>
                    <input 
                        type="text" 
                        id="live-search-input" 
                        placeholder="Search channel..." 
                        className="focusable-element"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <i 
                        className="fas fa-times clear-btn" 
                        id="live-clear-btn" 
                        style={{ display: searchQuery ? 'block' : 'none' }} 
                        onClick={() => setSearchQuery('')}
                    ></i>
                </div>

                <div className="category-bar"></div>
                <button 
                    id="mobileCategoryBtn" 
                    className="category-dropdown-btn focusable-element"
                    onClick={() => setIsCategoryModalOpen(true)}
                >
                    <span>{TABS[activeTab].toUpperCase()}</span>
                    <i className="fas fa-chevron-down"></i>
                </button>

                <div 
                    id="animeSeriesContainer" 
                    className="anime-selector-container" 
                    style={{ display: isAnimeTab ? 'block' : 'none' }}
                >
                    <select 
                        id="animeSeriesSelect" 
                        className="focusable-element" 
                        onChange={handleAnimeSelect} 
                        value={selectedAnimeTitle}
                    >
                        <option value="" disabled>Select Anime Title</option>
                        {animeData && Object.keys(animeData).map(title => (
                            <option key={title} value={title}>{title}</option>
                        ))}
                    </select>
                </div>

                <div 
                    id="clearFavWrapper" 
                    style={{ display: (TABS[activeTab] === "favorites" && filteredChannels.length > 0) ? 'block' : 'none', marginBottom: '10px' }}
                >
                    <button className="clear-fav-btn" onClick={() => { setFavorites([]); localStorage.setItem("favoriteChannels", "[]"); }}>
                        <i className="fas fa-trash"></i> Clear Favorites
                    </button>
                </div>

                <div className="channel-count-display">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#888', fontWeight: '600', fontSize: '0.8rem' }}>
                        <i className="fas fa-tv"></i>
                        <span>
                            {isAnimeLoading ? "Loading..." : 
                             isAnimeTab ? (selectedAnimeTitle ? `${animeEpisodes.length} Eps` : "Select Title") : 
                             `${filteredChannels.length} Channels`}
                        </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', lineHeight: '1.1' }}>
                        <span style={{ color: 'var(--accent-color)', fontWeight: '700', fontSize: '0.85rem', fontFamily: "'Orbitron', sans-serif", letterSpacing: '0.5px' }}>
                            {timeStr}
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                            <span style={{ color: '#aaa', fontSize: '0.7rem', fontWeight: '500' }}>{dateStr}</span>
                            {onlineCount && (
                                <>
                                    <span style={{color: '#444'}}>|</span>
                                    <span style={{color: '#fff', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '3px'}}>
                                        <i className="fas fa-user" style={{fontSize: '0.6rem'}}></i> {onlineCount}
                                    </span>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                <div className="channel-list-wrapper">
                    <div className="channel-list" id="channelList">
                        {!isAnimeTab && filteredChannels.map(([key, channel]) => (
                            <div 
                                key={key} 
                                className={`channel-button focusable-element ${activeChannelKey === key ? 'active' : ''}`}
                                onClick={() => loadChannel(key)}
                                tabIndex="0"
                            >
                                <div className="channel-logo">
                                    <img src={channel.logo} loading="lazy" onError={(e) => e.target.src = PLACEHOLDER_IMG} />
                                </div>
                                <span className="channel-name">{channel.name}</span>
                                <i 
                                    className={`favorite-star ${favorites.includes(key) ? 'fas' : 'far'} fa-star`}
                                    style={{ color: favorites.includes(key) ? '#e50914' : '#666' }}
                                    onClick={(e) => toggleFavorite(e, key)}
                                ></i>
                            </div>
                        ))}

                        {isAnimeTab && animeEpisodes.map((ep, idx) => (
                            <div 
                                key={idx} 
                                className={`channel-button focusable-element ${activeChannelKey === ep.name ? 'active' : ''}`}
                                onClick={() => loadChannel(null, {
                                    name: ep.name,
                                    type: ep.type || "hls",
                                    manifestUri: ep.manifestUri, 
                                    logo: ep.logo
                                })}
                                tabIndex="0"
                            >
                                <div className="channel-logo">
                                    <img src={ep.logo} loading="lazy" onError={(e) => e.target.src = PLACEHOLDER_IMG} style={{objectFit: 'cover'}}/>
                                </div>
                                <div className="channel-name">{ep.name}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {isCategoryModalOpen && (
                <div id="categoryModal" className="modal-overlay active" style={{ display: 'flex' }}>
                    <div className="modal-content category-modal-content" style={{ width: '90%', maxWidth: '500px', padding: '25px', maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
                        <span className="close-button" onClick={() => setIsCategoryModalOpen(false)}>×</span>
                        <h3 className="modal-heading">Select Category</h3>
                        <div id="mobileCategoryList" className="mobile-category-list" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', overflowY: 'auto', paddingBottom: '10px' }}>
                            {TABS.map((tab, index) => (
                                <div 
                                    key={index}
                                    className={`mobile-cat-option ${activeTab === index ? 'active' : ''}`}
                                    onClick={() => handleCategorySelect(index)}
                                    style={{ justifyContent: 'center', textAlign: 'center', minHeight: '50px', fontSize: '0.8rem', padding: '10px' }}
                                >
                                    <span>{tab.toUpperCase()}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Live;
