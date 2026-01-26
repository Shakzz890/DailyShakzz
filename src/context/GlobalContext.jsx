import React, { createContext, useState, useContext, useEffect } from 'react';
import { initializeApp } from "firebase/app";
import { getAuth, signInWithPopup, signOut, onAuthStateChanged, GoogleAuthProvider, GithubAuthProvider } from "firebase/auth";
import { getFirestore, doc, setDoc, deleteDoc, getDoc, collection, query, orderBy, limit, getDocs, updateDoc } from "firebase/firestore";

const GlobalContext = createContext();

const firebaseConfig = {
    apiKey: "AIzaSyBh2QAytkv2e27oCRaMgVdYTru7lSS8Ffo",
    authDomain: "shakzz-tv.firebaseapp.com",
    databaseURL: "https://shakzz-tv-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "shakzz-tv",
    storageBucket: "shakzz-tv.firebasestorage.app",
    messagingSenderId: "640873351782",
    appId: "1:640873351782:web:9fa2bb26142528f898bba7",
    measurementId: "G-Y9BSQ0NT4H"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export const GlobalProvider = ({ children }) => {
    
    // --- 1. UI STATE (PERSISTED) ---
    // 'home' | 'live' | 'detail' | 'player' | 'category' | 'explore'
    const [currentView, setCurrentView] = useState(() => {
        return localStorage.getItem('shakzz_current_view') || 'home';
    });

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [loadingMessage, setLoadingMessage] = useState("Loading...");
    
    // --- 2. USER DATA ---
    const [user, setUser] = useState(null);
    const [history, setHistory] = useState([]);
    const [watchlist, setWatchlist] = useState([]);

    // --- 3. ACTIVE CONTENT STATE (PERSISTED) ---
    // Stores the item being viewed in Detail or Player pages
    const [detailItem, setDetailItem] = useState(() => {
        try { return JSON.parse(localStorage.getItem('shakzz_active_item')) || null; } 
        catch { return null; }
    });

    // --- 4. CATEGORY STATE (PERSISTED) ---
    // Stores which category is being browsed in Category page
    const [categoryModal, setCategoryModal] = useState(() => {
        try { 
            return JSON.parse(localStorage.getItem('shakzz_category_modal')) || { title: '', endpoint: '' }; 
        } catch { 
            return { title: '', endpoint: '' }; 
        }
    });

    const [infoModal, setInfoModal] = useState({ isOpen: false, type: '' });
    const [searchModal, setSearchModal] = useState({ isOpen: false, mode: 'search' }); 

    // --- 5. MASTER SAVE EFFECT ---
    useEffect(() => {
        localStorage.setItem('shakzz_current_view', currentView);
        localStorage.setItem('shakzz_active_item', JSON.stringify(detailItem));
        localStorage.setItem('shakzz_category_modal', JSON.stringify(categoryModal));
    }, [currentView, detailItem, categoryModal]);


    // --- NAVIGATION ---
    const switchView = (view) => {
        setCurrentView(view);
        setSearchModal({ ...searchModal, isOpen: false });
        setIsSidebarOpen(false);
        window.scrollTo(0, 0);
    };

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    const showLoader = (msg = "Loading...") => {
        setLoadingMessage(msg);
        setIsLoading(true);
    };

    const hideLoader = () => {
        setTimeout(() => setIsLoading(false), 500);
    };

    // --- PAGE NAVIGATION HELPERS ---
    
    // Open Detail Page (replaces overlay)
    const openDetail = (item) => {
        setDetailItem(item);
        setCurrentView('detail');
    };

    // Close Detail Page (goes back to home)
    const closeDetail = () => {
        setDetailItem(null);
        setCurrentView('home');
        localStorage.removeItem('shakzz_active_item');
    };

    // Open Player Page (replaces overlay)
    // Call this from Detail page when clicking Play
    const openPlayer = () => {
        if (!detailItem) return;
        setCurrentView('player');
    };

    // Close Player Page (goes back to detail)
    const closePlayer = () => {
        if (detailItem) {
            setCurrentView('detail');
        } else {
            setCurrentView('home');
        }
    };

    // Open Category Page (replaces modal)
    const openCategory = (title, endpoint) => {
        setCategoryModal({ title, endpoint });
        setCurrentView('category');
    };

    // Close Category Page (goes back to home)
    const closeCategory = () => {
        setCurrentView('home');
    };

    // --- AUTH ---
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            if (currentUser) {
                localStorage.setItem('isLoggedIn', 'true');
                loadUserData(currentUser.uid);
            } else {
                localStorage.setItem('isLoggedIn', 'false');
                setHistory([]);
                setWatchlist([]);
            }
        });
        return () => unsubscribe();
    }, []);

    const loginGoogle = async () => {
        try { await signInWithPopup(auth, new GoogleAuthProvider()); } catch (e) { alert(e.message); }
    };

    const loginGithub = async () => {
        try { await signInWithPopup(auth, new GithubAuthProvider()); } catch (e) { alert(e.message); }
    };

    const doLogout = async () => {
        await signOut(auth);
        window.location.reload();
    };

    const loadUserData = async (uid) => {
        const histRef = collection(db, "users", uid, "history");
        const qHist = query(histRef, orderBy("timestamp", "desc"), limit(30));
        const histSnap = await getDocs(qHist);
        const histData = histSnap.docs.map(d => d.data());
        histData.sort((a, b) => (b.pinned === true ? 1 : 0) - (a.pinned === true ? 1 : 0));
        setHistory(histData);

        const watchRef = collection(db, "users", uid, "watchlist");
        const qWatch = query(watchRef, orderBy("added_at", "desc"));
        const watchSnap = await getDocs(qWatch);
        setWatchlist(watchSnap.docs.map(d => d.data()));
    };

    // --- HISTORY MANAGEMENT ---
    const addToHistory = async (item, season = null, episode = null) => {
        if (!user) return;
        
        let label = "Movie";
        if (item.media_type === 'tv' || item.first_air_date) {
            const s = season || 1;
            const e = episode || 1;
            label = `S${s}:E${e}`;
        }

        const data = {
            id: item.id,
            title: item.title || item.name,
            poster_path: item.poster_path,
            backdrop_path: item.backdrop_path || item.poster_path,
            badge_label: label,
            media_type: item.media_type || (item.title ? 'movie' : 'tv'),
            vote_average: item.vote_average || 0,
            release_date: item.release_date || item.first_air_date || '',
            timestamp: new Date().toISOString(),
            progress: 45,
            pinned: item.pinned || false
        };

        setHistory(prev => {
            const filtered = prev.filter(i => i.id !== item.id);
            const updated = [data, ...filtered];
            updated.sort((a, b) => (b.pinned === true ? 1 : 0) - (a.pinned === true ? 1 : 0));
            return updated;
        });
        
        try {
            await setDoc(doc(db, "users", user.uid, "history", item.id.toString()), data);
        } catch (e) { console.error(e); }
    };

    const removeFromHistory = async (id) => {
        if (!user) return;
        setHistory(prev => prev.filter(item => item.id !== id));
        try { await deleteDoc(doc(db, "users", user.uid, "history", id.toString())); } catch (e) {}
    };

    const togglePin = async (id) => {
        if (!user) return;
        let newItem = null;
        setHistory(prev => {
            const updated = prev.map(item => {
                if (item.id === id) { newItem = { ...item, pinned: !item.pinned }; return newItem; }
                return item;
            });
            updated.sort((a, b) => (b.pinned === true ? 1 : 0) - (a.pinned === true ? 1 : 0));
            return updated;
        });
        if (newItem) {
            try { await updateDoc(doc(db, "users", user.uid, "history", id.toString()), { pinned: newItem.pinned }); } catch (e) {}
        }
    };

    const toggleWatchlist = async (item) => {
        if (!user) return alert("Please sign in.");
        const isAdded = watchlist.some(i => i.id === item.id);
        const docRef = doc(db, "users", user.uid, "watchlist", item.id.toString());

        if (isAdded) {
            setWatchlist(prev => prev.filter(i => i.id !== item.id));
            await deleteDoc(docRef);
        } else {
            const data = { ...item, added_at: new Date().toISOString() };
            setWatchlist(prev => [data, ...prev]);
            await setDoc(docRef, data);
        }
    };

    return (
        <GlobalContext.Provider value={{
            currentView, setCurrentView, // Expose setter for direct navigation
            isSidebarOpen, isLoading, loadingMessage,
            user, history, watchlist,
            detailItem, 
            categoryModal, setCategoryModal,
            infoModal, setInfoModal, 
            searchModal, setSearchModal,
            db, switchView, toggleSidebar, showLoader, hideLoader,
            loginGoogle, loginGithub, doLogout,
            addToHistory, removeFromHistory, togglePin, toggleWatchlist,
            // Page Navigation Functions
            openDetail, closeDetail,
            openPlayer, closePlayer,
            openCategory, closeCategory,
            // Legacy compatibility (optional - can remove if not needed)
            setDetailItem
        }}>
            {children}
        </GlobalContext.Provider>
    );
};

export const useGlobal = () => useContext(GlobalContext);
