import React, { useState, useEffect, useRef } from 'react';
import { useGlobal } from '../../context/GlobalContext';
import { fetchData } from '../../api/tmdb';

const servers = [
    { name: "Server 1", getUrl: (id, type, s, e) => `https://vidsrc.cc/v2/embed/${type}/${id}` + (type === "tv" ? `/${s}/${e}?autoPlay=false&poster=true` : "?autoPlay=false&poster=true") },
    { name: "Server 2", getUrl: (id, type, s, e) => `https://zxcstream.xyz/embed/${type}/${id}` + (type === "tv" ? `/${s}/${e}` : "") },
    { name: "Server 3", getUrl: (id, type, s, e) => type === "movie" ? `https://fmovies4u.com/embed/movie/${id}` : `https://fmovies4u.com/embed/tv/${id}/${s}/${e}` },
    { name: "Server 4", getUrl: (id, type, s, e) => `https://vidsrc.cx/embed/${type}/${id}` + (type === "tv" ? `/${s}/${e}` : "") },
    { name: "Server 5 (Ads) ⚠️", getUrl: (id, type, s, e) => `https://mapple.uk/watch/${type}/${id}` + (type === "tv" ? `-${s}-${e}` : "") },
    { name: "Server 6 (Ads) ⚠️", getUrl: (id, type, s, e) => `https://vidnest.fun/${type}/${id}` + (type === "tv" ? `/${s}/${e}` : "") },
    { name: "Server 7 (Ads) ⚠️", getUrl: (id, type, s, e) => `https://vidlink.pro/${type}/${id}` + (type === "tv" ? `/${s}/${e}` : "") }
];

const PlayerOverlay = () => {
    const { isPlayerOpen, setIsPlayerOpen, detailItem, addToHistory } = useGlobal();
    
    const [serverIdx, setServerIndex] = useState(() => parseInt(localStorage.getItem('currentServer') || '0'));
    const [season, setSeason] = useState(1);
    const [episode, setEpisode] = useState(1);
    const [sandbox, setSandbox] = useState(() => {
        try { return JSON.parse(localStorage.getItem('sandboxEnabled') ?? 'true'); } 
        catch { return true; }
    });
    
    const [seasonsData, setSeasonsData] = useState([]);
    const [episodeList, setEpisodeList] = useState([]);
    const [activePill, setActivePill] = useState(null); 
    const [epSearch, setEpSearch] = useState("");

    useEffect(() => {
        if (isPlayerOpen && detailItem) {
            let startSeason = 1;
            let startEpisode = 1;

            if (detailItem.badge_label && detailItem.badge_label.includes(':')) {
                const match = detailItem.badge_label.match(/S(\d+):E(\d+)/);
                if (match) {
                    startSeason = parseInt(match[1]);
                    startEpisode = parseInt(match[2]);
                }
            }

            setSeason(startSeason);
            setEpisode(startEpisode);
            setActivePill(null); 
            setEpSearch("");
            
            const isTv = detailItem.media_type === 'tv' || detailItem.first_air_date;
            
            if (!isTv) {
                addToHistory(detailItem, null, null);
            } else {
                addToHistory(detailItem, startSeason, startEpisode);
                fetchData(`/tv/${detailItem.id}`).then(data => {
                    if(data.seasons) {
                        setSeasonsData(data.seasons.filter(s => s.season_number > 0));
                        fetchEpisodes(startSeason); 
                    }
                });
            }
        }
    }, [isPlayerOpen, detailItem]);

    useEffect(() => {
        localStorage.setItem('currentServer', serverIdx);
        localStorage.setItem('sandboxEnabled', sandbox);
    }, [serverIdx, sandbox]);

    const fetchEpisodes = async (seasonNum) => {
        const data = await fetchData(`/tv/${detailItem.id}/season/${seasonNum}`);
        setEpisodeList(data.episodes || []);
    };

    const handleSeasonChange = (seasonNum) => {
        setSeason(seasonNum);
        setEpisode(1);
        fetchEpisodes(seasonNum);
        setActivePill(null);
        addToHistory(detailItem, seasonNum, 1);
    };

    const handleEpisodeChange = (epNum) => {
        setEpisode(epNum);
        setActivePill(null);
        addToHistory(detailItem, season, epNum);
    };

    useEffect(() => {
        const closeMenu = (e) => {
            if (!e.target.closest('.pill-wrapper') && !e.target.closest('.episode-search')) {
                setActivePill(null);
            }
        };
        window.addEventListener('click', closeMenu);
        return () => window.removeEventListener('click', closeMenu);
    }, []);

    if (!isPlayerOpen || !detailItem) return null;

    const isTv = detailItem.media_type === 'tv' || detailItem.first_air_date;
    const type = isTv ? 'tv' : 'movie';
    const src = servers[serverIdx].getUrl(detailItem.id, type, season, episode);

    const filteredEpisodes = episodeList.filter(ep => {
        if (!epSearch) return true;
        const q = epSearch.toLowerCase();
        return (
            ep.episode_number.toString() === q ||
            (ep.name && ep.name.toLowerCase().includes(q)) ||
            q.includes(ep.episode_number.toString())
        );
    });

    return (
        <div id="player-overlay" className="player-overlay" style={{ display: 'flex' }}>
            
            {/* CLEAN HEADER: Title removed to allow server title to shine */}
            <div className="player-header">
                <button className="close-player-btn" onClick={() => setIsPlayerOpen(false)}>
                    <i className="fa-solid fa-arrow-right"></i>
                </button>
            </div>

            <div className="iframe-wrapper">
                <iframe 
                    id="overlay-video" 
                    src={src} 
                    allowFullScreen 
                    title="Player"
                    sandbox={sandbox ? "allow-scripts allow-same-origin allow-presentation allow-forms" : undefined}
                ></iframe>
            </div>

            {/* CONTROLS REMAIN STACKED BELOW VIDEO */}
            <div className="player-controls-bar stacked">
                <div className="row-server">
                    <div className="pill-wrapper">
                        <div className={`pill-dropdown ${activePill === 'server' ? 'open' : ''}`} onClick={(e) => { e.stopPropagation(); setActivePill(activePill === 'server' ? null : 'server'); }}>
                            <div className="pill-label"><span>{servers[serverIdx].name}</span><i className="fas fa-chevron-up"></i></div>
                        </div>
                        <div className="pill-menu" style={{display: activePill === 'server' ? 'flex' : 'none'}} onClick={(e) => e.stopPropagation()}>
                            <div className="menu-header">
                                <span>Sandbox</span>
                                <label className="switch">
                                    <input type="checkbox" checked={sandbox} onChange={() => setSandbox(!sandbox)} />
                                    <span className="slider"></span>
                                </label>
                            </div>
                            {servers.map((s, i) => (
                                <div key={i} className={`menu-option ${serverIdx === i ? 'selected' : ''}`} onClick={() => { setServerIndex(i); setActivePill(null); }}>
                                    {s.name}
                                </div>
                            ))}
                        </div>
                    </div>

                    {isTv && (
                        <div className="pill-wrapper">
                            <div className={`pill-dropdown ${activePill === 'season' ? 'open' : ''}`} onClick={(e) => { e.stopPropagation(); setActivePill(activePill === 'season' ? null : 'season'); }}>
                                <div className="pill-label"><span>Season {season}</span><i className="fas fa-chevron-up"></i></div>
                            </div>
                            <div className="pill-menu" style={{display: activePill === 'season' ? 'flex' : 'none'}} onClick={(e) => e.stopPropagation()}>
                                <div className="menu-header">Select Season</div>
                                {seasonsData.map(s => (
                                    <div key={s.id} className={`menu-option ${season === s.season_number ? 'selected' : ''}`} onClick={() => handleSeasonChange(s.season_number)}>
                                        <span>Season {s.season_number}</span>
                                        <span style={{fontSize:'0.75rem', opacity:0.5}}>{s.episode_count} Eps</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {isTv && (
                    <div className="row-nav">
                        <input
                            type="text"
                            placeholder="Search Ep..."
                            className="episode-search"
                            value={epSearch}
                            onChange={(e) => { setEpSearch(e.target.value); setActivePill('episode'); }}
                            onClick={(e) => { e.stopPropagation(); setActivePill('episode'); }}
                        />

                        <div className="pill-wrapper">
                            <div className={`pill-dropdown ${activePill === 'episode' ? 'open' : ''}`} onClick={(e) => { e.stopPropagation(); setActivePill(activePill === 'episode' ? null : 'episode'); }}>
                                <div className="pill-label"><span>Episode {episode}</span><i className="fas fa-chevron-up"></i></div>
                            </div>
                            <div className="pill-menu" style={{display: activePill === 'episode' ? 'flex' : 'none'}} onClick={(e) => e.stopPropagation()}>
                                <div className="menu-header">Select Episode</div>
                                {filteredEpisodes.length === 0 ? <div style={{padding:'15px', color:'#888', textAlign:'center'}}>No episode found</div> : 
                                    filteredEpisodes.map(ep => (
                                        <div key={ep.id} className={`menu-option ${episode === ep.episode_number ? 'selected' : ''}`} onClick={() => handleEpisodeChange(ep.episode_number)}>
                                            <span style={{fontWeight:700, color:'#e50914', marginRight:'8px'}}>{ep.episode_number}.</span>
                                            <span style={{whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{ep.name || `Episode ${ep.episode_number}`}</span>
                                        </div>
                                    ))
                                }
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PlayerOverlay;