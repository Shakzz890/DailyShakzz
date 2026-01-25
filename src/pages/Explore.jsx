import React, { useState, useEffect, useRef } from 'react';
import { useGlobal } from '../context/GlobalContext';
import { POSTER_URL, PLACEHOLDER_IMG, getDisplayTitle } from '../api/tmdb';

const API_KEY = '4eea503176528574efd91847b7a302cc';
const BASE_URL = 'https://api.themoviedb.org/3';

const Explore = () => {
    const { openDetail } = useGlobal();
    
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
            let endpoint = '/discover/tv'; // Default to TV
            let type = currentFilters.type.toLowerCase();
            
            // A. Base Parameters
            let params = `&page=${pageNum}&sort_by=popularity.desc`;

            // B. Handle Type Switching
            if (type === 'movie') endpoint = '/discover/movie';
            
            // C. Handle Anime (Genre 16 = Animation)
            if (type === 'anime') {
                endpoint = '/discover/tv'; // Anime is usually TV
                params += `&with_genres=16`; 
            }

            // D. Handle Region / Language (THE FIX)
            const regionMap = { 
                'South Korea': 'ko', 
                'China': 'zh', 
                'Japan': 'ja', 
                'Philippines': 'tl', 
                'US': 'en' 
            };

            // If a specific region is selected, force that language
            if (currentFilters.region !== 'All Regions' && regionMap[currentFilters.region]) {
                params += `&with_original_language=${regionMap[currentFilters.region]}`;
            } 
            // If "All Regions" is selected BUT type is Anime, default to Japanese
            else if (type === 'anime') {
                params += `&with_original_language=ja`;
            }

            // E. Handle Sorting (Optional refinement)
            if (currentFilters.sort === 'Latest') {
                const dateKey = type === 'movie' ? 'primary_release_date' : 'first_air_date';
                const today = new Date().toISOString().split('T')[0];
                params += `&sort_by=${dateKey}.desc&${dateKey}.lte=${today}`;
            }

            const url = `${BASE_URL}${endpoint}?api_key=${API_KEY}${params}`;
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
                            onClick={() => openDetail(item)}
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
