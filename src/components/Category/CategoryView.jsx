import React, { useState, useEffect } from 'react';
import { useGlobal } from '../../context/GlobalContext';
import { POSTER_URL, IMG_URL, PLACEHOLDER_IMG, getDisplayTitle, fetchData } from '../../api/tmdb';

const CategoryView = () => {
    const { categoryModal, setCategoryModal, openDetail, history, watchlist } = useGlobal();
    const [results, setResults] = useState([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    
    const isUserList = categoryModal.title === 'Watch History' || categoryModal.title === 'My Favorites';

    useEffect(() => {
        if (!categoryModal.isOpen) return;

        setResults([]);
        setPage(1);
        setHasMore(true);

        if (isUserList) {
            if (categoryModal.title === 'Watch History') {
                setResults(history || []);
            } else {
                setResults(watchlist || []);
            }
            setLoading(false);
            setHasMore(false);
        } else {
            loadApiData(1);
        }
    }, [categoryModal.isOpen, categoryModal.endpoint, history, watchlist]);

    const loadApiData = async (pageNum) => {
        if (loading) return;
        setLoading(true);
        try {
            const data = await fetchData(categoryModal.endpoint, pageNum);
            if (!data.results || data.results.length === 0) setHasMore(false);
            else {
                setResults(prev => pageNum === 1 ? data.results : [...prev, ...data.results]);
            }
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const handleScroll = (e) => {
        if (isUserList) return;
        const bottom = e.target.scrollHeight - e.target.scrollTop <= e.target.clientHeight + 100;
        if (bottom && hasMore && !loading) {
            const next = page + 1;
            setPage(next);
            loadApiData(next);
        }
    };

    if (!categoryModal.isOpen) return null;

    const isHistory = categoryModal.title === 'Watch History';

    return (
        <div 
            className="page-view category-page"
            style={{
                // --- PAGE CONFIGURATION ---
                position: 'fixed',
                top: '70px', // Sit below Navbar
                left: 0,
                width: '100vw',
                height: 'calc(100vh - 70px)', // Fill remaining height
                zIndex: 50000, // Below Navbar (200000), Above Home (1)
                background: '#050505', // Solid background
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden' // Prevent double scrollbars
            }}
        >
            <div className="category-header" style={{ flexShrink: 0, padding: '20px 30px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <i 
                    className="fa-solid fa-arrow-left" 
                    onClick={() => setCategoryModal({ ...categoryModal, isOpen: false })}
                    style={{ fontSize: '1.2rem', cursor: 'pointer', marginRight: '20px', color: '#fff' }}
                ></i>
                <h1 id="category-title" style={{ display: 'inline', fontSize: '1.5rem', fontWeight: '700' }}>{categoryModal.title}</h1>
            </div>
            
            <div 
                className="category-content" 
                onScroll={handleScroll} 
                style={{ 
                    overflowY: 'auto', 
                    flex: 1, 
                    padding: '20px 30px',
                    paddingBottom: '80px' 
                }}
            >
                <div className={`category-grid ${isHistory ? 'landscape-grid' : ''}`} id="category-grid">
                    {results.map((item, index) => {
                        if(!item) return null;
                        const title = getDisplayTitle(item);
                        const year = (item.release_date || item.first_air_date || 'N/A').split('-')[0];
                        const typeLabel = item.media_type === 'tv' || item.first_air_date ? 'Series' : 'Movie';
                        const rating = item.vote_average ? Number(item.vote_average).toFixed(1) : 'NR';
                        const image = isHistory ? (item.backdrop_path ? IMG_URL + item.backdrop_path : POSTER_URL + item.poster_path) : (POSTER_URL + item.poster_path);

                        return (
                            <div key={`${item.id}-${index}`} className={isHistory ? "history-card fade-in" : "movie-card fade-in"} onClick={() => openDetail(item)}>
                                {isHistory ? (
                                    <>
                                        <div className="history-image-wrapper">
                                            <img src={image} onError={(e)=>e.target.src=PLACEHOLDER_IMG} loading="lazy" alt={title} />
                                            <div className="history-play-icon"><i className="fas fa-play"></i></div>
                                            <div className="history-progress-bar"><div className="history-progress-fill" style={{width: `${item.progress || 45}%`}}></div></div>
                                        </div>
                                        <div className="card-info">
                                            <div className="card-title" style={{fontSize:'0.95rem'}}>{title}</div>
                                            <div className="card-meta" style={{fontSize:'0.8rem', color:'#aaa'}}>{item.badge_label || 'Watched'}</div>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="card-poster">
                                            <div className="rating-badge"><i className="fas fa-star"></i> {rating}</div>
                                            <img src={image} onError={(e)=>e.target.src=PLACEHOLDER_IMG} loading="lazy" alt={title} />
                                        </div>
                                        <div className="card-info">
                                            <div className="card-title">{title}</div>
                                            <div className="card-meta">
                                                <span>{year}</span><span className="dot-sep"></span><span>{typeLabel}</span>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        );
                    })}
                    
                    {results.length === 0 && !loading && <div style={{color:'#888', width:'100%', textAlign:'center', marginTop:'50px'}}>List is empty.</div>}
                    {loading && <div className="spinner" style={{margin:'20px auto'}}></div>}
                </div>
            </div>
        </div>
    );
};

export default CategoryView;
