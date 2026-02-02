import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
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

// Wrapper to handle layout and navigation
const AppLayout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { switchView } = useGlobal();

    // Determine active view based on current route
    const getActiveView = () => {
        const path = location.pathname;
        if (path === '/home' || path === '/') return 'home';
        if (path === '/explore') return 'explore';
        if (path === '/live-tv') return 'live';
        return 'home';
    };

    const currentView = getActiveView();

    const handleNavClick = (view) => {
        // Reset scroll behavior to instant for the switch
        document.documentElement.style.scrollBehavior = 'auto';
        window.scrollTo(0, 0);
        
        // Navigate to route
        const routeMap = {
            'home': '/home',
            'explore': '/explore',
            'live': '/live-tv'
        };
        navigate(routeMap[view] || '/home');
        
        // Update context state
        switchView(view);
        
        // Restore smooth scrolling after a tiny delay
        setTimeout(() => document.documentElement.style.scrollBehavior = '', 50);
    };

    // Hide bottom nav on player page
    const hideBottomNav = location.pathname.startsWith('/player');

    // Active State Logic for Bottom Nav
    const isHomeActive = currentView === 'home';
    const isExploreActive = currentView === 'explore';
    const isLiveActive = currentView === 'live';

    return (
        <>
            <Loader />
            <Sidebar />
            <Navbar />

            {/* ROUTES */}
            <Routes>
                {/* Redirect root to /home */}
                <Route path="/" element={<Navigate to="/home" replace />} />
                
                {/* Main Pages */}
                <Route path="/home" element={<Home />} />
                <Route path="/explore" element={<Explore />} />
                <Route path="/live-tv" element={<Live />} />
                
                {/* Dynamic Routes */}
                <Route path="/detail/:id" element={<DetailView />} />
                <Route path="/player/:id" element={<PlayerOverlay />} />
                <Route path="/category/:type" element={<CategoryView />} />
                <Route path="/info/:type" element={<InfoModal />} />
            </Routes>

            {/* Search Modal - can be kept as overlay or moved to route */}
            <SearchModal />
            
            {/* MOBILE BOTTOM NAV - Hidden on player page */}
            {!hideBottomNav && (
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

const App = () => (
    <GlobalProvider>
        <Router>
            <AppLayout />
        </Router>
    </GlobalProvider>
);

export default App;
