import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGlobal } from '../../context/GlobalContext';
import { fetchData, IMG_URL, POSTER_URL, PLACEHOLDER_IMG, getDisplayTitle } from '../../api/tmdb';

const DetailView = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { 
        openDetail, 
        closeDetail, 
        setIsPlayerOpen, 
        watchlist, 
        toggleWatchlist, 
        addToHistory,
        detailItem,
        setDetailItem
    } = useGlobal();

    const [fullDetails, setFullDetails] = useState(null);
    const [similar, setSimilar] = useState([]);

    useEffect(() => {
        // Fetch item details based on ID from URL
        const fetchDetails = async () => {
            if (!id) return;
            
            // Try to get from context first, otherwise fetch
            if (detailItem && detailItem.id.toString() === id) {
                // Use existing detailItem
                const type = detailItem.media_type === 'tv' || detailItem.first_air_date ? 'tv' : 'movie';
                const [detailsRes, similarRes] = await Promise.all([
                    fetchData(`/${type}/${id}`),
                    fetchData(`/${type}/${id}/recommendations`)
                ]);
                setFullDetails(detailsRes);
                setSimilar(similarRes.results || []);
            } else {
                // Fetch fresh data if not in context
                try {
                    // Try movie first, then tv
                    let data = await fetchData(`/movie/${id}`);
                    let type = 'movie';
                    if (!data || data.success === false) {
                        data = await fetchData(`/tv/${id}`);
                        type = 'tv';
                    }
                    setDetailItem(data);
                    const [detailsRes, similarRes] = await Promise.all([
                        fetchData(`/${type}/${id}`),
                        fetchData(`/${type}/${id}/recommendations`)
                    ]);
                    setFullDetails(detailsRes);
                    setSimilar(similarRes.results || []);
                } catch (e) {
                    console.error("Failed to fetch item:", e);
                    navigate('/home');
                }
            }
        };
        
        fetchDetails();
    }, [id]);

    if (!fullDetails) return null;

    const handleClose = () => {
        navigate('/home');
    };

    const handlePlay = () => {
        setIsPlayerOpen(true);
        addToHistory(fullDetails);
        navigate(`/player/${id}`);
    };

    const handleRecClick = (item) => {
        const type = item.media_type || (item.title ? 'movie' : 'tv');
        const newItem = { ...item, media_type: type };
        setDetailItem(newItem);
        navigate(`/detail/${item.id}`);
    };

    const isAdded = watchlist.some(i => i.id === fullDetails.id);
    const typeLabel = fullDetails.first_air_date ? 'TV Series' : 'Movie';

    return (
        <div className="page-view detail-page">
            
            {/* BACKDROP IMAGE */}
            <div className="detail-backdrop-layer">
                <img 
                    id="detail-backdrop-img" 
                    src={fullDetails.backdrop_path ? IMG_URL + fullDetails.backdrop_path : POSTER_URL + fullDetails.poster_path} 
                    onError={(e) => e.target.src = PLACEHOLDER_IMG}
                    alt="Backdrop"
                />
                <div className="detail-overlay-gradient"></div>
            </div>

            {/* CLOSE BUTTON */}
            <button className="close-detail-btn" onClick={handleClose}>
                <i className="fa-solid fa-arrow-left"></i>
            </button>

            <div className="detail-content-wrapper">
                <div className="detail-hero-layout">
                    <div className="detail-poster-card">
                        <img 
                            src={fullDetails.poster_path ? POSTER_URL + fullDetails.poster_path : PLACEHOLDER_IMG} 
                            onError={(e) => e.target.src = PLACEHOLDER_IMG}
                            alt="Poster"
                        />
                    </div>

                    <div className="detail-info-box">
                        <h1 id="detail-title">{getDisplayTitle(fullDetails)}</h1>
                        
                        <div className="detail-meta-row">
                            <span>{(fullDetails.release_date || fullDetails.first_air_date || 'N/A').split('-')[0]}</span>
                            <span className="dot-sep"></span>
                            <span className="rating-box"><i className="fas fa-star"></i> {fullDetails.vote_average?.toFixed(1)}</span>
                            <span className="dot-sep"></span>
                            <span>{typeLabel}</span>
                        </div>

                        <div className="genre-pills-row">
                            {fullDetails.genres?.slice(0, 3).map(g => (
                                <span key={g.id} className="genre-pill">{g.name}</span>
                            ))}
                        </div>

                        <p id="detail-overview">{fullDetails.overview}</p>

                        <div className="detail-actions">
                            <button className="play-btn-primary" onClick={handlePlay}>
                                <i className="fas fa-play"></i> Play
                            </button>
                            
                            <button className="watchlist-btn" onClick={() => toggleWatchlist(fullDetails)}>
                                <i className={isAdded ? "fas fa-check" : "fas fa-plus"}></i> {isAdded ? "List" : "List"}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="recommendations-section">
                    <h3>You May Also Like</h3>
                    <div className="recommendations-grid">
                        {similar.length > 0 ? similar.slice(0, 12).map(item => (
                            <div key={item.id} className="movie-card" onClick={() => handleRecClick(item)}>
                                <div className="card-poster">
                                    <div className="rating-badge"><i className="fas fa-star"></i> {item.vote_average?.toFixed(1)}</div>
                                    <img 
                                        src={item.poster_path ? POSTER_URL + item.poster_path : PLACEHOLDER_IMG} 
                                        onError={(e) => e.target.src = PLACEHOLDER_IMG}
                                        alt={item.title}
                                    />
                                </div>
                                <div className="card-info">
                                    <div className="card-title">{getDisplayTitle(item)}</div>
                                </div>
                            </div>
                        )) : (
                            <p style={{color:'#666', padding:'20px'}}>No recommendations found.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DetailView;
