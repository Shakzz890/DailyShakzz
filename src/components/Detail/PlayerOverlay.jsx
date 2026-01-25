import React, { useState, useEffect, useMemo } from "react";
import { useGlobal } from "../../context/GlobalContext";
import { fetchData } from "../../api/tmdb";

/* =======================
   SERVERS CONFIG
======================= */
const servers = [
  { name: "Server 1", forceSandbox: false, getUrl: (id, type, s, e) =>
    `https://vidsrc.cc/v2/embed/${type}/${id}${type === "tv" ? `/${s}/${e}` : ""}` },

  { name: "Server 2", forceSandbox: false, getUrl: (id, type, s, e) =>
    `https://zxcstream.xyz/embed/${type}/${id}${type === "tv" ? `/${s}/${e}` : ""}` },

  { name: "Server 3", forceSandbox: true, getUrl: (id, type, s, e) =>
    type === "movie"
      ? `https://fmovies4u.com/embed/movie/${id}`
      : `https://fmovies4u.com/embed/tv/${id}/${s}/${e}` },

  { name: "Server 4", forceSandbox: false, getUrl: (id, type, s, e) =>
    `https://vidsrc.cx/embed/${type}/${id}${type === "tv" ? `/${s}/${e}` : ""}` },

  { name: "Server 5 (Ads)", forceSandbox: true, getUrl: (id, type, s, e) =>
    `https://mapple.uk/watch/${type}/${id}${type === "tv" ? `-${s}-${e}` : ""}` },
];

/* =======================
   PLAYER OVERLAY
======================= */
export default function PlayerOverlay() {
  const { isPlayerOpen, setIsPlayerOpen, detailItem, addToHistory } = useGlobal();

  const isTv = detailItem?.media_type === "tv" || detailItem?.first_air_date;
  const type = isTv ? "tv" : "movie";

  const [serverIdx, setServerIdx] = useState(0);
  const [season, setSeason] = useState(1);
  const [episode, setEpisode] = useState(1);
  const [seasons, setSeasons] = useState([]);
  const [episodes, setEpisodes] = useState([]);
  
  // Search State
  const [epSearch, setEpSearch] = useState("");

  /* =======================
     SANDBOX SYSTEM
  ======================= */
  const sandboxKey = useMemo(() => {
    if (!detailItem) return null;
    return `sandbox_${detailItem.id}_${season}_${episode}_${serverIdx}`;
  }, [detailItem, season, episode, serverIdx]);

  const [sandbox, setSandbox] = useState(true);
  const [iframeKey, setIframeKey] = useState(0);

  useEffect(() => {
    if (!sandboxKey) return;
    const saved = localStorage.getItem(sandboxKey);
    if (saved !== null) setSandbox(JSON.parse(saved));
  }, [sandboxKey]);

  useEffect(() => {
    if (!sandboxKey) return;
    localStorage.setItem(sandboxKey, JSON.stringify(sandbox));
  }, [sandbox, sandboxKey]);

  useEffect(() => {
    if (servers[serverIdx]?.forceSandbox) {
      setSandbox(true);
    }
  }, [serverIdx]);

  useEffect(() => {
    setIframeKey(k => k + 1);
  }, [sandbox]);

  /* =======================
     DATA FETCH
  ======================= */
  useEffect(() => {
    if (!isPlayerOpen || !detailItem || !isTv) return;

    fetchData(`/tv/${detailItem.id}`).then(d => {
      setSeasons(d.seasons?.filter(s => s.season_number > 0) || []);
    });
  }, [isPlayerOpen, detailItem, isTv]);

  useEffect(() => {
    if (!isTv || !detailItem) return;

    fetchData(`/tv/${detailItem.id}/season/${season}`).then(d => {
      setEpisodes(d.episodes || []);
      addToHistory(detailItem, season, episode);
    });
  }, [season, episode]);

  if (!isPlayerOpen || !detailItem) return null;

  const src = servers[serverIdx].getUrl(detailItem.id, type, season, episode);

  // Filter Logic
  const filteredEpisodes = episodes.filter(ep => 
    ep.episode_number.toString().includes(epSearch) || 
    (ep.name && ep.name.toLowerCase().includes(epSearch.toLowerCase()))
  );

  /* =======================
     RENDER
  ======================= */
  return (
    <div className="player-overlay">
      {/* HEADER */}
      <div className="player-header">
        <div className="player-header-info mobile-only-item">
          <strong>{detailItem.title || detailItem.name}</strong>
          {isTv && (
            <span style={{ fontSize: "0.8rem", color: "var(--accent-color)" }}>
              Season {season} • Episode {episode}
            </span>
          )}
        </div>

        <button className="close-player-btn" onClick={() => setIsPlayerOpen(false)}>
          <i className="fa-solid fa-xmark" />
        </button>
      </div>

      {/* LAYOUT CONTAINER */}
      <div className="player-layout-container">
        
        {/* LEFT: VIDEO AREA */}
        <div className="video-area">
          <div className="iframe-wrapper">
            <iframe
              key={iframeKey}
              id="overlay-video"
              src={src}
              allowFullScreen
              sandbox={
                sandbox
                  ? "allow-scripts allow-same-origin allow-presentation allow-forms allow-popups allow-popups-to-escape-sandbox"
                  : undefined
              }
            />
          </div>
        </div>

        {/* RIGHT: SIDEBAR (Universal Controls) */}
        <aside className="player-sidebar">
          <div className="sidebar-content">
            <h2>{detailItem.title || detailItem.name}</h2>

            {/* SERVER SELECTOR */}
            <div className="control-group">
              <label>Select Server</label>
              <select
                className="sidebar-select"
                value={serverIdx}
                onChange={e => setServerIdx(+e.target.value)}
              >
                {servers.map((s, i) => (
                  <option key={i} value={i}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            {/* RESTORED: SEASON & SEARCH (Only for TV) */}
            {isTv && (
              <>
                <div className="control-group">
                  <label>Select Season</label>
                  <select
                    className="sidebar-select"
                    value={season}
                    onChange={e => setSeason(+e.target.value)}
                  >
                    {seasons.map(s => (
                      <option key={s.id} value={s.season_number}>
                        Season {s.season_number} ({s.episode_count} eps)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="control-group">
                  <label>Search Episode</label>
                  <input 
                    type="text" 
                    className="sidebar-search-input"
                    placeholder="Type episode number or title..."
                    value={epSearch}
                    onChange={(e) => setEpSearch(e.target.value)}
                  />
                </div>

                {/* EPISODE GRID */}
                <div className="ep-section-header">
                    <span>Episodes ({filteredEpisodes.length})</span>
                </div>
                
                <div className="sidebar-ep-grid">
                  {filteredEpisodes.length === 0 ? (
                    <div style={{color:'#666', fontSize:'0.9rem', gridColumn:'1/-1'}}>No episodes found</div>
                  ) : (
                    filteredEpisodes.map(ep => (
                      <button
                        key={ep.id}
                        className={`ep-grid-btn ${episode === ep.episode_number ? "active" : ""}`}
                        onClick={() => setEpisode(ep.episode_number)}
                        title={ep.name}
                      >
                        {ep.episode_number}
                      </button>
                    ))
                  )}
                </div>
              </>
            )}
            
            {/* SANDBOX TOGGLE (Moved to bottom of sidebar) */}
            <div className="sidebar-divider"></div>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:'10px'}}>
                <span style={{fontSize:'0.85rem', color:'#aaa'}}>Ad-Block (Sandbox)</span>
                <label className="switch" style={{transform:'scale(0.8)'}}>
                  <input
                    type="checkbox"
                    checked={sandbox}
                    disabled={servers[serverIdx].forceSandbox}
                    onChange={() => setSandbox(!sandbox)}
                  />
                  <span className="slider" />
                </label>
            </div>

          </div>
        </aside>
      </div>
      
      {/* BOTTOM SHEET REMOVED COMPLETELY */}
    </div>
  );
}
