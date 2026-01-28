import React, { useLayoutEffect } from 'react';
import { GlobalProvider, useGlobal } from './context/GlobalContext';

// Layout Imports
import Navbar from './components/Layout/Navbar';
import Sidebar from './components/Layout/Sidebar';
import InfoModal from './components/Layout/InfoModal';
import Loader from './components/Layout/Loader'; 

// Pages
import Home from './pages/Home';
import Live from './pages/Live';
import Explore from './pages/Explore';

// Components & Overlays
import DetailView from './components/Detail/DetailView';
import PlayerOverlay from './components/Detail/PlayerOverlay';
import CategoryView from './components/Category/CategoryView';
import SearchModal from './components/Search/SearchModal';

const AppContent = () => {
    const { currentView, switchView } = useGlobal();

    const handleNavClick = (view) => {
        // Reset scroll behavior to instant for the switch
        document.documentElement.style.scrollBehavior = 'auto';
        window.scrollTo(0, 0);
        
        switchView(view); 
        
        // Restore smooth scrolling after a tiny delay
        setTimeout(() => document.documentElement.style.scrollBehavior = '', 50);
    };

    useLayoutEffect(() => {
        if ('scrollRestoration' in window.history) window.history.scrollRestoration = 'manual';
        window.scrollTo(0, 0);
    }, [currentView]);

    // Active State Logic for Bottom Nav
    const isHomeActive = currentView === 'home';
    const isExploreActive = currentView === 'explore';
    const isLiveActive = currentView === 'live';

    return (
        <>
            {/* NEW LOADER COMPONENT */}
            <Loader />
            
            <Sidebar />
            <Navbar />

            {/* MAIN PAGES (Hidden/Shown via CSS for state preservation) */}
            <div style={{ display: currentView === 'home' ? 'block' : 'none' }}><Home /></div>
            <div style={{ display: currentView === 'explore' ? 'block' : 'none' }}><Explore /></div>
            <div style={{ display: currentView === 'live' ? 'block' : 'none' }}><Live /></div>
            
            {/* OVERLAYS & MODALS */}
            <DetailView />
            <PlayerOverlay />
            <CategoryView />
            <SearchModal />
            <InfoModal />
            
            {/* MOBILE BOTTOM NAV */}
            <div className="bottom-nav">
                <div className={`nav-item ${isHomeActive ? 'active' : ''}`} onClick={() => handleNavClick('home')}>
                    <i className="fa-solid fa-house"></i><span>Home</span>
                </div>
                <div className={`nav-item ${isExploreActive ? 'active' : ''}`} onClick={() => handleNavClick('explore')}>
                    <i className="fa-regular fa-compass"></i><span>Explore</span>
                </div>
                <div className={`nav-item ${isLiveActive ? 'active' : ''}`} onClick={() => handleNavClick('live')}>
                    <i className="fa-solid fa-tv"></i><span>Live TV</span>
                </div>
            </div>
        </>
    );
};

const App = () => <GlobalProvider><AppContent /></GlobalProvider>;
export default App;
