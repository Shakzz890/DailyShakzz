import React, { useEffect, useState, useRef } from 'react';
import { useGlobal } from '../../context/GlobalContext';
import { IMG_URL, POSTER_URL, PLACEHOLDER_IMG, getDisplayTitle, fetchData } from '../../api/tmdb';
// --- FIX: Correct Import Path (Up one level to components, then to Layout) ---
import BackToTop from '../components/Layout/BackToTop'; 

const DetailView = () => {
    const { 
        detailItem, 
        isDetailOpen, 
        closeDetail, 
        addToHistory, 
        toggleWatchlist, 
        watchlist,
        setIsPlayerOpen,
        openDetail // Needed for recommendations
    } = useGlobal();

    const [recommendations, setRecommendations] = useState([]);
    const scrollRef = useRef(null); // Create ref for scrolling container

    // Reset scroll when item changes
    useEffect(() => {
        if (isDetailOpen && scrollRef.current) {
            scrollRef.current.scrollTop = 0;
        }
        
        const fetchRecs = async () => {
            if (detailItem) {
                const endpoint = detailItem.media_type === 'tv' || detailItem.first_air_date
                    ? `/tv/${detailItem.id}/recommendations`
                    : `/movie/${detailItem.id}/recommendations`;
                const data = await fetchData(endpoint);
                setRecommendations(data.results || []);
            }
        };
        fetchRecs();
    }, [detailItem, isDetailOpen]);

    if (!isDetailOpen || !detailItem) return null;

    const title = getDisplayTitle(detailItem);
    const backdrop = detailItem.backdrop_path ? IMG_URL + detailItem.backdrop_path : null;
    const poster = detailItem.poster_path ? POSTER_URL + detailItem.poster_path : PLACEHOLDER_IMG;
    const year = (detailItem.release_date || detailItem.first_air_date || 'N/A').split('-')[0];
    const rating = detailItem.vote_average ? detailItem.vote_average.toFixed(1) : 'NR';
    const isAdded = watchlist.some(i => i.id === detailItem.id);

    // Genres handling
    const genreNames = detailItem.genres?.map(g => g.name) || [];

    return (
        <div 
            id="detail-view" 
            className="detail-page" 
            ref={scrollRef} // Attach ref to main scrollable container
        >
            {/* BACKDROP & CLOSE BUTTON */}
            <div className="detail-backdrop-layer">
                {backdrop && <img id="detail-backdrop-img" src={backdrop} alt="Backdrop" />}
                <div className="detail-overlay-gradient"></div>
            </div>

            <div className="close-detail-btn" onClick={closeDetail}>
                <i className="fa-solid fa-arrow-right"></i>
            </div>

            <div className="detail-content-wrapper">
                {/* HERO SECTION */}
                <div className="detail-hero-layout">
                    <div className="detail-poster-card">
                        <img id="detail-poster-img" src={poster} alt={title} onError={(e) => e.target.src = PLACEHOLDER_IMG} />
                    </div>
                    
                    <div className="detail-info-box">
                        <h1 id="detail-title">{title}</h1>
                        
                        <div className="detail-meta-row">
                            <span className="rating-box"><i className="fas fa-star"></i> {rating}</span>
                            <span className="dot-sep"></span>
                            <span>{year}</span>
                            <span className="dot-sep"></span>
                            <span>{detailItem.media_type === 'tv' || detailItem.first_air_date ? 'Series' : 'Movie'}</span>
                        </div>

                        {genreNames.length > 0 && (
                            <div className="genre-pills-row">
                                {genreNames.slice(0, 3).map((g, i) => (
                                    <span key={i} className="genre-pill">{g}</span>
                                ))}
                            </div>
                        )}

                        <p id="detail-overview">
                            {detailItem.overview || "No overview available."}
                        </p>

                        <div className="detail-actions">
                            <button 
                                className="play-btn-primary" 
                                onClick={() => {
                                    setIsPlayerOpen(true);
                                    addToHistory(detailItem);
                                }}
                            >
                                <i className="fas fa-play"></i> Play Now
                            </button>
                            
                            <button 
                                className="watchlist-btn" 
                                onClick={() => toggleWatchlist(detailItem)}
                                style={{ background: isAdded ? 'var(--accent-color)' : 'rgba(255,255,255,0.1)' }}
                            >
                                <i className={isAdded ? "fas fa-check" : "fas fa-plus"}></i> 
                                {isAdded ? ' Added' : ' My List'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* RECOMMENDATIONS */}
                {recommendations.length > 0 && (
                    <div className="recommendations-section">
                        <h3>You May Also Like</h3>
                        <div className="recommendations-grid">
                            {recommendations.slice(0, 12).map(item => (
                                <div key={item.id} className="movie-card" onClick={() => openDetail(item)}>
                                    <div className="card-poster">
                                        <div className="rating-badge"><i className="fas fa-star"></i> {item.vote_average?.toFixed(1)}</div>
                                        <img 
                                            src={item.poster_path ? POSTER_URL + item.poster_path : PLACEHOLDER_IMG} 
                                            loading="lazy" 
                                            onError={(e) => e.target.src = PLACEHOLDER_IMG}
                                            alt={getDisplayTitle(item)}
                                        />
                                    </div>
                                    <div className="card-info">
                                        <div className="card-title">{getDisplayTitle(item)}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* BACK TO TOP BUTTON */}
            <BackToTop containerRef={scrollRef} />
        </div>
    );
};

export default DetailView;
