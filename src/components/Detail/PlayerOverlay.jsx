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
  const [activePill, setActivePill] = useState(null);

  /* =======================
     SANDBOX SYSTEM
  ======================= */

  const sandboxKey = useMemo(() => {
    if (!detailItem) return null;
    return `sandbox_${detailItem.id}_${season}_${episode}_${serverIdx}`;
  }, [detailItem, season, episode, serverIdx]);

  const [sandbox, setSandbox] = useState(true);
  const [iframeKey, setIframeKey] = useState(0);

  /* Load sandbox memory */
  useEffect(() => {
    if (!sandboxKey) return;
    const saved = localStorage.getItem(sandboxKey);
    if (saved !== null) setSandbox(JSON.parse(saved));
  }, [sandboxKey]);

  /* Persist sandbox per episode */
  useEffect(() => {
    if (!sandboxKey) return;
    localStorage.setItem(sandboxKey, JSON.stringify(sandbox));
  }, [sandbox, sandboxKey]);

  /* Force sandbox ON for ad servers */
  useEffect(() => {
    if (servers[serverIdx]?.forceSandbox) {
      setSandbox(true);
    }
  }, [serverIdx]);

  /* Reload iframe on sandbox change */
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

      {/* LAYOUT */}
      <div className="player-layout-container">
        {/* VIDEO */}
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

        {/* SIDEBAR (DESKTOP) */}
        <aside className="player-sidebar desktop-only-item">
          <div className="sidebar-content">
            <h2>{detailItem.title || detailItem.name}</h2>

            <p style={{ fontSize: "0.9rem", color: "#aaa", marginBottom: "15px" }}>
              {detailItem.overview}
            </p>

            <div className="control-group">
              <label>Server</label>
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

            {isTv && (
              <>
                <label>Episodes</label>
                <div className="sidebar-ep-grid">
                  {episodes.map(ep => (
                    <button
                      key={ep.id}
                      className={`ep-grid-btn ${
                        episode === ep.episode_number ? "active" : ""
                      }`}
                      onClick={() => setEpisode(ep.episode_number)}
                    >
                      {ep.episode_number}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </aside>
      </div>

      {/* MOBILE CONTROLS */}
      <div className="player-controls-bar stacked mobile-only-item">
        <div className="pill-wrapper">
          <div
            className={`pill-dropdown ${activePill === "server" ? "open" : ""}`}
            onClick={() => setActivePill(activePill === "server" ? null : "server")}
          >
            <span>{servers[serverIdx].name}</span>
            <i className="fa-solid fa-chevron-up" />
          </div>

          {activePill === "server" && (
            <div className="pill-menu">
              <div className="menu-header">
                Sandbox
                <span
                  className="sandbox-badge"
                  title="This server may show ads"
                >
                  Recommended ON
                </span>

                <label className="switch">
                  <input
                    type="checkbox"
                    checked={sandbox}
                    disabled={servers[serverIdx].forceSandbox}
                    onChange={() => setSandbox(!sandbox)}
                  />
                  <span className="slider" />
                </label>
              </div>

              {servers.map((s, i) => (
                <div
                  key={i}
                  className={`menu-option ${i === serverIdx ? "selected" : ""}`}
                  onClick={() => {
                    setServerIdx(i);
                    setActivePill(null);
                  }}
                >
                  {s.name}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
