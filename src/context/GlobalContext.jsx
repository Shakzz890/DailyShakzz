import React, { createContext, useState, useContext, useEffect } from 'react';
import { initializeApp } from "firebase/app";
import { getAuth, signInWithPopup, signOut, onAuthStateChanged, GoogleAuthProvider, GithubAuthProvider } from "firebase/auth";
import { getFirestore, doc, setDoc, deleteDoc, getDoc, collection, query, orderBy, limit, getDocs, updateDoc } from "firebase/firestore";

const GlobalContext = createContext();

const firebaseConfig = {
  apiKey: "AIzaSyBG_54h3xkGoGwfX_3kFLRUciTdEkmkrvA",
  authDomain: "shakzztv-de597.firebaseapp.com",
  databaseURL: "https://shakzztv-de597-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "shakzztv-de597",
  storageBucket: "shakzztv-de597.firebasestorage.app",
  messagingSenderId: "841207969238",
  appId: "1:841207969238:web:4f173cc794f99494c5e077",
  measurementId: "G-FZQTKE7STD"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export const GlobalProvider = ({ children }) => {
    
    // --- 1. UI STATE (PERSISTED) ---
    // Remembers if you were on Home, Explore, or Live TV
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

    // --- 3. DETAIL & PLAYER STATE (PERSISTED) ---
    const [detailItem, setDetailItem] = useState(() => {
        try { return JSON.parse(localStorage.getItem('shakzz_active_item')) || null; } catch { return null; }
    });

    const [isDetailOpen, setIsDetailOpen] = useState(() => {
        try { return JSON.parse(localStorage.getItem('shakzz_detail_open')) || false; } catch { return false; }
    });

    const [isPlayerOpen, setIsPlayerOpen] = useState(() => {
        try { return JSON.parse(localStorage.getItem('shakzz_player_open')) || false; } catch { return false; }
    });

    // --- 4. MODALS (CATEGORY PERSISTED) ---
    // Remembers if you were viewing "Latest Updates", "Filipino Drama", etc.
    const [categoryModal, setCategoryModal] = useState(() => {
        try { 
            return JSON.parse(localStorage.getItem('shakzz_category_modal')) || { isOpen: false, title: '', endpoint: '' }; 
        } catch { 
            return { isOpen: false, title: '', endpoint: '' }; 
        }
    });

    const [infoModal, setInfoModal] = useState({ isOpen: false, type: '' });
    const [searchModal, setSearchModal] = useState({ isOpen: false, mode: 'search' }); 

    // --- 5. MASTER SAVE EFFECT ---
    // Saves EVERYTHING whenever it changes
    useEffect(() => {
        localStorage.setItem('shakzz_current_view', currentView);
        localStorage.setItem('shakzz_active_item', JSON.stringify(detailItem));
        localStorage.setItem('shakzz_detail_open', JSON.stringify(isDetailOpen));
        localStorage.setItem('shakzz_player_open', JSON.stringify(isPlayerOpen));
        localStorage.setItem('shakzz_category_modal', JSON.stringify(categoryModal));
    }, [currentView, detailItem, isDetailOpen, isPlayerOpen, categoryModal]);


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

    // --- CONTROLS ---
    const openDetail = (item) => {
        setDetailItem(item);
        setIsDetailOpen(true);
        setIsPlayerOpen(false); 
    };

    const closeDetail = () => {
        setDetailItem(null);
        setIsDetailOpen(false);
        setIsPlayerOpen(false);
        // Clear active item from storage when closed
        localStorage.removeItem('shakzz_active_item');
        localStorage.removeItem('shakzz_detail_open');
        localStorage.removeItem('shakzz_player_open');
    };

    return (
        <GlobalContext.Provider value={{
            currentView, isSidebarOpen, isLoading, loadingMessage,
            user, history, watchlist,
            detailItem, isDetailOpen, isPlayerOpen,
            infoModal, searchModal, categoryModal,
            db, switchView, toggleSidebar, showLoader, hideLoader,
            loginGoogle, loginGithub, doLogout,
            addToHistory, removeFromHistory, togglePin, toggleWatchlist,
            setInfoModal, setSearchModal, setCategoryModal,
            setDetailItem, setIsPlayerOpen, 
            openDetail, closeDetail
        }}>
            {children}
        </GlobalContext.Provider>
    );
};

export const useGlobal = () => useContext(GlobalContext);
