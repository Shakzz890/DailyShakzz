import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGlobal } from '../context/GlobalContext';
import { fetchData, IMG_URL, POSTER_URL, PLACEHOLDER_IMG, getDisplayTitle } from '../api/tmdb';

// --- MEMOIZED LIST ---
const MovieList = React.memo(({ items, isUpcoming }) => {
    const { openDetail } = useGlobal();

    return (
        <div className="list">
            {items.slice(0, 12).map(item => (
                <div key={item.id} className="movie-card focusable-element fade-in" onClick={() => openDetail(item)} tabIndex="0">
                    <div className="card-poster">
                        {isUpcoming ? <div className="coming-badge">COMING</div> : <div className="badge-overlay">HD</div>}
                        {!isUpcoming && <div className="rating-badge"><i className="fas fa-star"></i> {item.vote_average?.toFixed(1)}</div>}
                        <img 
                            src={item.poster_path ? POSTER_URL + item.poster_path : PLACEHOLDER_IMG} 
                            loading="lazy" 
                            onError={(e) => e.target.src = PLACEHOLDER_IMG} 
                            alt={getDisplayTitle(item)}
                        />
                    </div>
                    <div className="card-info">
                        <div className="card-title">{getDisplayTitle(item)}</div>
                        <div className="card-meta">
                            <span>{(item.release_date || item.first_air_date || 'N/A').split('-')[0]}</span>
                            <span className="dot-sep"></span>
                            <span>{item.media_type === 'tv' || item.first_air_date ? 'Series' : 'Movie'}</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
});

const Explore = () => {
    const { openDetail } = useGlobal();
    const navigate = useNavigate();
    
    // --- STATE ---
    const [results, setResults] = useState([]);
    const [filters, setFilters] = useState({ type: 'All', region: 'All Regions', sort: 'Ongoing' });
    const [page, setPage] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);

    // --- CONFIGURATION ---
    const typeOptions = ['All', 'Series', 'Movie', 'Tv Show', 'Anime'];
    const regionOptions = ['All Regions', 'South Korea', 'China', 'US', 'Japan', 'Philippines'];
    const sortOptions = ['Latest', 'Ongoing', 'Popular', 'Completed'];

    // --- 1. INITIAL LOAD ---
    useEffect(() => {
        setResults([]);
        setPage(1);
        setHasMore(true);
        loadResults(1, filters);
    }, []);

    // --- 2. FILTER HANDLER ---
    const handleFilter = (key, value) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);
        setResults([]);
        setPage(1);
        setHasMore(true);
        loadResults(1, newFilters);
    };

    // --- 3. FIXED FETCH LOGIC ---
    const loadResults = async (pageNum, currentFilters) => {
        if (pageNum > 1 && isLoading) return;
        setIsLoading(true);

        try {
            let endpoint = '/discover/tv';
            let type = currentFilters.type.toLowerCase();
            
            let params = `&page=${pageNum}&sort_by=popularity.desc`;

            if (type === 'movie') endpoint = '/discover/movie';
            
            if (type === 'anime') {
                endpoint = '/discover/tv';
                params += `&with_genres=16`; 
            }

            const regionMap = { 
                'South Korea': 'ko', 
                'China': 'zh', 
                'Japan': 'ja', 
                'Philippines': 'tl', 
                'US': 'en' 
            };

            if (currentFilters.region !== 'All Regions' && regionMap[currentFilters.region]) {
                params += `&with_original_language=${regionMap[currentFilters.region]}`;
            } else if (type === 'anime') {
                params += `&with_original_language=ja`;
            }

            if (currentFilters.sort === 'Latest') {
                const dateKey = type === 'movie' ? 'primary_release_date' : 'first_air_date';
                const today = new Date().toISOString().split('T')[0];
                params += `&sort_by=${dateKey}.desc&${dateKey}.lte=${today}`;
            }

            const url = `https://api.themoviedb.org/3${endpoint}?api_key=4eea503176528574efd91847b7a302cc${params}`;
            const res = await fetch(url);
            const data = await res.json();

            if (data.results && data.results.length > 0) {
                setResults(prev => pageNum === 1 ? data.results : [...prev, ...data.results]);
            } else {
                setHasMore(false);
            }
        } catch (error) {
            console.error("Explore Load Error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // --- 4. SCROLL HANDLER ---
    const handleScroll = (e) => {
        const { scrollTop, clientHeight, scrollHeight } = e.target;
        if (scrollHeight - scrollTop <= clientHeight + 300 && hasMore && !isLoading) {
            const next = page + 1;
            setPage(next);
            loadResults(next, filters);
        }
    };

    return (
        <div id="explore-view" onScroll={handleScroll}>
            
            {/* --- STICKY HEADER --- */}
            <div className="explore-header-wrapper">
                
                {/* ROW 1: PRIMARY PILLS */}
                <div className="header-pills-wrapper">
                    {typeOptions.map(t => (
                        <div 
                            key={t} 
                            className={`filter-pill ${filters.type === t ? 'active' : ''}`} 
                            onClick={() => handleFilter('type', t)}
                        >
                            {t}
                        </div>
                    ))}
                </div>

                {/* ROW 2 & 3: SECONDARY FILTERS */}
                <div className="explore-filters-container">
                    <div className="filter-row">
                        {regionOptions.map(r => (
                            <div key={r} className={`filter-pill ${filters.region === r ? 'active' : ''}`} onClick={() => handleFilter('region', r)}>
                                {r}
                            </div>
                        ))}
                    </div>
                    <div className="filter-row">
                        {sortOptions.map(s => (
                            <div key={s} className={`filter-pill ${filters.sort === s ? 'active' : ''}`} onClick={() => handleFilter('sort', s)}>
                                {s}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* --- RESULTS GRID --- */}
            <div className="explore-grid">
                {results.map((item, idx) => {
                     if (item.media_type === 'person' || !item.poster_path) return null;
                     return (
                        <div 
                            key={`${item.id}-${idx}`} 
                            className="movie-card fade-in" 
                            onClick={() => {
                                openDetail(item);
                                navigate(`/detail/${item.id}`);
                            }}
                        >
                            <div className="card-poster">
                                <div className="badge-overlay">HD</div>
                                <div className="rating-badge"><i className="fas fa-star"></i> {item.vote_average?.toFixed(1)}</div>
                                <img 
                                    src={POSTER_URL + item.poster_path} 
                                    onError={(e) => e.target.src = PLACEHOLDER_IMG} 
                                    loading="lazy" 
                                    alt={getDisplayTitle(item)}
                                />
                            </div>
                            <div className="card-info">
                                <div className="card-title">{getDisplayTitle(item)}</div>
                            </div>
                        </div>
                     );
                })}
                
                {isLoading && (
                    <div className="spinner" style={{ gridColumn: '1 / -1', margin: '20px auto' }}></div>
                )}
                
                {!isLoading && results.length === 0 && (
                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#666', marginTop: '50px' }}>
                        No results found.
                    </div>
                )}
            </div>
        </div>
    );
};

export default Explore;
