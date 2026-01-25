import React, { useState, useEffect } from 'react';
import { useGlobal } from '../../context/GlobalContext';
import { fetchData } from '../../api/tmdb';

const servers = [
  { name: "Server 1", getUrl: (id, t, s, e) => `https://vidsrc.cc/v2/embed/${t}/${id}` + (t === "tv" ? `/${s}/${e}` : "") },
  { name: "Server 2", getUrl: (id, t, s, e) => `https://zxcstream.xyz/embed/${t}/${id}` + (t === "tv" ? `/${s}/${e}` : "") },
  { name: "Server 3", getUrl: (id, t, s, e) => t === "movie"
      ? `https://fmovies4u.com/embed/movie/${id}`
      : `https://fmovies4u.com/embed/tv/${id}/${s}/${e}`
  }
];

const PlayerOverlay = () => {
  const { isPlayerOpen, setIsPlayerOpen, detailItem, addToHistory } = useGlobal();

  const [serverIdx, setServerIdx] = useState(0);
  const [season, setSeason] = useState(1);
  const [episode, setEpisode] = useState(1);
  const [seasonsData, setSeasonsData] = useState([]);
  const [episodes, setEpisodes] = useState([]);
  const [epSearch, setEpSearch] = useState("");

  const isTv = detailItem?.media_type === 'tv' || detailItem?.first_air_date;
  const type = isTv ? 'tv' : 'movie';

  useEffect(() => {
    if (!isPlayerOpen || !detailItem) return;

    if (isTv) {
      fetchData(`/tv/${detailItem.id}`).then(d => {
        setSeasonsData(d.seasons?.filter(s => s.season_number > 0) || []);
      });
      fetchEpisodes(season);
      addToHistory(detailItem, season, episode);
    } else {
      addToHistory(detailItem, null, null);
    }
  }, [isPlayerOpen, detailItem]);

  const fetchEpisodes = async (s) => {
    const data = await fetchData(`/tv/${detailItem.id}/season/${s}`);
    setEpisodes(data.episodes || []);
  };

  const filteredEpisodes = episodes.filter(ep =>
    !epSearch ||
    ep.name?.toLowerCase().includes(epSearch.toLowerCase()) ||
    ep.episode_number.toString() === epSearch
  );

  if (!isPlayerOpen || !detailItem) return null;

  const src = servers[serverIdx].getUrl(detailItem.id, type, season, episode);

  return (
    <div className="player-overlay">

      {/* HEADER */}
      <div className="player-header">
        <button className="close-player-btn" onClick={() => setIsPlayerOpen(false)}>
          <i className="fa-solid fa-xmark" />
        </button>
      </div>

      {/* MAIN LAYOUT */}
      <div className="player-layout-container">

        {/* LEFT — VIDEO */}
        <div className="video-area">
          <div className="iframe-wrapper">
            <iframe
              id="overlay-video"
              src={src}
              allowFullScreen
              title="Player"
            />
          </div>
        </div>

        {/* RIGHT — SIDEBAR (DESKTOP ONLY) */}
        <aside className="player-sidebar">

          <div className="sidebar-content">

            {/* TITLE */}
            <h2 className="sidebar-title">
              {detailItem.title || detailItem.name}
            </h2>

            {/* META */}
            <div className="sidebar-meta">
              <span>{detailItem.release_date?.slice(0, 4) || detailItem.first_air_date?.slice(0, 4)}</span>
              <span className="dot" />
              <span>{isTv ? 'TV Series' : 'Movie'}</span>
            </div>

            {/* CONTROLS */}
            <div className="sidebar-controls">
              <select value={serverIdx} onChange={e => setServerIdx(+e.target.value)}>
                {servers.map((s, i) => <option key={i} value={i}>{s.name}</option>)}
              </select>

              {isTv && (
                <select
                  value={season}
                  onChange={e => {
                    const s = +e.target.value;
                    setSeason(s);
                    setEpisode(1);
                    fetchEpisodes(s);
                  }}
                >
                  {seasonsData.map(s => (
                    <option key={s.id} value={s.season_number}>
                      Season {s.season_number}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* EPISODES */}
            {isTv && (
              <>
                <input
                  className="sidebar-search-input"
                  placeholder="Search episode..."
                  value={epSearch}
                  onChange={e => setEpSearch(e.target.value)}
                />

                <div className="sidebar-ep-grid">
                  {filteredEpisodes.map(ep => (
                    <button
                      key={ep.id}
                      className={`ep-grid-btn ${episode === ep.episode_number ? 'active' : ''}`}
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
    </div>
  );
};

export default PlayerOverlay;
