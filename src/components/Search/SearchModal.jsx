import React, { useState, useEffect, useRef } from 'react';
import { useGlobal } from '../../context/GlobalContext';
import { POSTER_URL, PLACEHOLDER_IMG, getDisplayTitle } from '../../api/tmdb';

const API_KEY = '4eea503176528574efd91847b7a302cc';
const BASE_URL = 'https://api.themoviedb.org/3';

const SearchModal = () => {
    const { searchModal, setSearchModal, openDetail } = useGlobal();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    
    // Filters
    const [filters, setFilters] = useState({ type: 'All', region: 'All Regions', sort: 'Ongoing' });
    const [page, setPage] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    
    const resultsRef = useRef(null);
    const debounceTimer = useRef(null);
    const inputRef = useRef(null);

    // --- CONFIGURATION ---
    const typeOptions = ['All', 'Series', 'Movie', 'Tv Show', 'Anime'];
    const regionOptions = ['All Regions', 'South Korea', 'China', 'US', 'Japan', 'Philippines'];
    const sortOptions = ['Latest', 'Ongoing', 'Popular', 'Completed'];

    // --- 1. INITIAL LOAD & FOCUS ---
    useEffect(() => {
        if (searchModal.isOpen) {
            setResults([]);
            setPage(1);
            setHasMore(true);
            setQuery('');
            // Focus input on open
            if(inputRef.current) inputRef.current.focus();
            
            // Reset filters to 'All' when opening Search Mode to show trending first
            const initialFilters = searchModal.mode === 'search' 
                ? { type: 'All', region: 'All Regions', sort: 'Ongoing' }
                : filters;

            setFilters(initialFilters);
            loadResults(1, '', initialFilters);
        }
    }, [searchModal.isOpen, searchModal.mode]);

    // --- 2. INPUT HANDLER ---
    const handleInput = (e) => {
        const val = e.target.value;
        setQuery(val);
        
        clearTimeout(debounceTimer.current);
        debounceTimer.current = setTimeout(() => {
            setResults([]);
            setPage(1);
            loadResults(1, val, filters);
        }, 500);
    };

    // --- 3. FILTER HANDLER (The Fix) ---
    const handleFilter = (key, value) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);
        setResults([]);
        setPage(1);
        
        // Pass the new filters directly to loadResults
        loadResults(1, query, newFilters);
    };

    // --- 4. API FETCH LOGIC (LOGIC FIXED HERE) ---
    const loadResults = async (pageNum, searchQuery, currentFilters) => {
        if (pageNum > 1 && isLoading) return;
        setIsLoading(true);

        try {
            let url = '';
            
            // A. SEARCH MODE (User is Typing)
            if (searchQuery && searchQuery.trim().length > 0) {
                let endpoint = '/search/multi';
                // Optional: Refine search if a filter is active
                if(currentFilters.type === 'Movie') endpoint = '/search/movie';
                if(currentFilters.type === 'Series' || currentFilters.type === 'Tv Show') endpoint = '/search/tv';
                
                url = `${BASE_URL}${endpoint}?api_key=${API_KEY}&query=${encodeURIComponent(searchQuery)}&page=${pageNum}`;
            } 
            // B. DISCOVERY MODE (Empty Input)
            else {
                // LOGIC FIX: 
                // Only show "Trending Week" if mode is 'search' AND filter is 'All'.
                // If user selected 'Movie' or 'Anime', we MUST use the Discover engine.
                const isGenericSearch = searchModal.mode === 'search' && currentFilters.type === 'All';

                if (isGenericSearch) {
                    url = `${BASE_URL}/trending/all/week?api_key=${API_KEY}&page=${pageNum}`;
                } else {
                    // Use Discover for everything else (Explore Mode OR Search Mode with specific filter)
                    let endpoint = '/discover/tv';
                    const type = currentFilters.type.toLowerCase();
                    
                    if (type === 'movie') endpoint = '/discover/movie';
                    
                    let params = `&page=${pageNum}&sort_by=popularity.desc`;
                    
                    // Region Logic
                    const regionMap = { 
                        'South Korea': 'ko', 'China': 'zh', 'Japan': 'ja', 
                        'Philippines': 'tl', 'US': 'en' 
                    };
                    if (regionMap[currentFilters.region]) {
                        params += `&with_original_language=${regionMap[currentFilters.region]}`;
                    }
                    
                    // Anime Logic
                    if (type === 'anime') {
                        endpoint = '/discover/tv';
                        params += `&with_genres=16&with_original_language=ja`;
                    }

                    url = `${BASE_URL}${endpoint}?api_key=${API_KEY}${params}`;
                }
            }

            const res = await fetch(url);
            const data = await res.json();
            
            if (data.results && data.results.length > 0) {
                setResults(prev => pageNum === 1 ? data.results : [...prev, ...data.results]);
            } else {
                setHasMore(false);
            }
        } catch (e) { console.error(e); }
        finally { setIsLoading(false); }
    };

    // --- 5. SCROLL HANDLER ---
    const handleScroll = (e) => {
        const { scrollTop, clientHeight, scrollHeight } = e.target;
        if (scrollHeight - scrollTop <= clientHeight + 300 && hasMore && !isLoading) {
            const next = page + 1;
            setPage(next);
            loadResults(next, query, filters);
        }
    };

    if (!searchModal.isOpen) return null;

    // Dynamic Heading Logic
    let headingText = "Popular Searches";
    if (query) headingText = `Results for "${query}"`;
    else if (filters.type !== 'All') headingText = `Top ${filters.type}`;

    return (
        <div className="search-modal" style={{ display: 'flex' }}>
            
            {/* --- STICKY HEADER --- */}
            <div className="search-header-row">
                
                {/* ROW 1: INPUT */}
                <div className="search-input-row">
                    <i className="fa-solid fa-arrow-left search-back-btn" 
                       onClick={() => setSearchModal({ ...searchModal, isOpen: false })}></i>
                    
                    <div className="search-bar-wrapper">
                        <i className="fa-solid fa-magnifying-glass search-modal-icon"></i>
                        <input 
                            ref={inputRef}
                            type="text" 
                            id="search-input" 
                            placeholder="Search movies, series..." 
                            value={query} 
                            onChange={handleInput}
                            autoComplete="off"
                        />
                        {query && (
                            <i className="fa-solid fa-xmark search-clear-btn" 
                               style={{ display: 'block' }}
                               onClick={() => { setQuery(''); setResults([]); loadResults(1, '', { ...filters, type: 'All' }); }}
                            ></i>
                        )}
                    </div>
                </div>

                {/* ROW 2: PRIMARY PILLS (Now works in Search Mode!) */}
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

                {/* ROW 3: SECONDARY FILTERS (Only show in Explore Mode) */}
                {searchModal.mode === 'explore' && !query && (
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
                )}
            </div>

            {/* --- RESULTS GRID --- */}
            <div id="search-results" onScroll={handleScroll}>
                
                {/* Heading with your preferred spacing */}
                <h3 style={{
                    gridColumn: '1 / -1', 
                    margin: '25px 0 15px 5px', 
                    fontSize: '1rem', 
                    color: '#888',
                    fontWeight: '600'
                }}>
                    {headingText}
                </h3>

                {results.map((item, idx) => {
                    if (item.media_type === 'person' || !item.poster_path) return null;
                    return (
                        <div 
                            key={`${item.id}-${idx}`} 
                            className="movie-card fade-in" 
                            onClick={() => { 
                                setSearchModal(prev => ({ ...prev, isOpen: false })); 
                                openDetail(item); 
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
                    <div style={{
                        gridColumn: '1 / -1', 
                        textAlign: 'center', 
                        color: '#666', 
                        marginTop: '50px'
                    }}>
                        No results found.
                    </div>
                )}
            </div>
        </div>
    );
};

export default SearchModal;
