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
import DetailView from './components/Detail/DetailView';      // Now a page
import PlayerOverlay from './components/Detail/PlayerOverlay'; // Now a page (rename to PlayerPage later if you want)
import CategoryView from './components/Category/CategoryView'; // Now a page

// Modals (These can stay as overlays/modals)
import SearchModal from './components/Search/SearchModal';

const AppContent = () => {
    const { currentView, switchView } = useGlobal();

    const handleNavClick = (view) => {
        document.documentElement.style.scrollBehavior = 'auto';
        window.scrollTo(0, 0);
        switchView(view); 
        setTimeout(() => document.documentElement.style.scrollBehavior = '', 50);
    };

    useLayoutEffect(() => {
        if ('scrollRestoration' in window.history) window.history.scrollRestoration = 'manual';
        window.scrollTo(0, 0);
    }, [currentView]);

    const isHomeActive = currentView === 'home';
    const isExploreActive = currentView === 'explore';
    const isLiveActive = currentView === 'live';

    return (
        <>
            <Loader />
            <Sidebar />
            <Navbar />

            {/* MAIN CONTENT AREA - Only ONE visible at a time */}
            <main className="main-content">
                {/* Standard Pages */}
                {currentView === 'home' && <Home />}
                {currentView === 'explore' && <Explore />}
                {currentView === 'live' && <Live />}
                
                {/* Detail Page (was overlay, now page) */}
                {currentView === 'detail' && <DetailView />}
                
                {/* Player Page (was overlay, now page) */}
                {currentView === 'player' && <PlayerOverlay />}
                
                {/* Category Page (was overlay, now page) */}
                {currentView === 'category' && <CategoryView />}
            </main>
            
            {/* MODALS - These render on top when open */}
            <SearchModal />
            <InfoModal />
            
            {/* MOBILE BOTTOM NAV - Hide when on Player or Detail for immersive experience */}
            {currentView !== 'player' && currentView !== 'detail' && (
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
            )}
        </>
    );
};

const App = () => <GlobalProvider><AppContent /></GlobalProvider>;
export default App;
