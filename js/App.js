import { Header } from './components/ui/Header.js';
import { Footer } from './components/ui/Footer.js';
import { Notification } from './components/ui/Notification.js';
import { ScrollToTopButton } from './components/ui/ScrollToTopButton.js';
import { HomePage } from './components/pages/HomePage.js';
import { AboutPage } from './components/pages/AboutPage.js';
import { LoginPage } from './components/pages/LoginPage.js';
import { ResetPasswordPage } from './components/pages/ResetPasswordPage.js';
import { DashboardPage } from './components/pages/DashboardPage.js';
import { DocumentsPage } from './components/pages/DocumentsPage.js';
import { PasswordUpdatePage } from './components/pages/PasswordUpdatePage.js';
import { CalendarPage } from './components/pages/CalendarPage.js';
import { AccountPage } from './components/pages/AccountPage.js';
import { AdminPage } from './components/pages/AdminPage.js';
import { themeClasses, initialHoaConfig } from './utils/themes.js';
// Global supabase client will be accessed directly

const { useState, useEffect } = React;

const IDLE_TIMEOUT_MS = 5 * 60 * 1000;

export const App = () => {
    const [currentPage, setCurrentPage] = useState('home');
    const [userRole, setUserRole] = useState(null);
    const [user, setUser] = useState(null);
    const [themeName, setThemeName] = useState('blue');
    const [config, setConfig] = useState(null);
    const [notification, setNotification] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    
    const activeTheme = themeClasses[themeName] || themeClasses.blue;

    useEffect(() => {
        const fetchConfig = async () => {
            const { data, error } = await window.supabaseClient.from('configuration').select('*').eq('id', 1).single();
            if (error && error.code === 'PGRST116') {
                console.warn("Configuration not found in database, using initial config. Please save settings in admin panel to create the record.");
                setConfig(initialHoaConfig);
            } else if (error) {
                console.error("Error fetching configuration:", error.message);
                setConfig(initialHoaConfig);
            } else {
                setConfig(data);
                setThemeName(data.themeName || 'blue');
            }
            setIsLoading(false);
        };
        fetchConfig();

        // Realtime: refresh config when table changes
        const cfgChannel = window.supabaseClient
            .channel('configuration-changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'configuration' }, () => {
                fetchConfig();
            })
            .subscribe();

        const { data: authListener } = window.supabaseClient.auth.onAuthStateChange(
            async (event, session) => {
                if (event === 'PASSWORD_RECOVERY') {
                    setCurrentPage('password-update');
                    return;
                }
                if (session?.user) {
                    const { data: userData } = await window.supabaseClient
                        .from('users')
                        .select('*')
                        .eq('id', session.user.id)
                        .maybeSingle();
                    if (userData) {
                        setUser(userData);
                        setUserRole(userData.role);
                        try { await fetchConfig(); } catch (_) {}
                    }
                } else {
                    setUser(null);
                    setUserRole(null);
                }
            }
        );

        return () => {
            authListener.subscription.unsubscribe();
            try { window.supabaseClient.removeChannel(cfgChannel); } catch (_) {}
        };
    }, []);

    useEffect(() => {
        try {
            const hash = window.location.hash || '';
            if (hash.includes('type=recovery')) {
                setCurrentPage('password-update');
            }
        } catch (_) {}
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 500);
        return () => clearTimeout(timer);
    }, [currentPage]);

    // Auto-logout after 5 minutes of inactivity
    useEffect(() => {
        if (!userRole) return;
        let idleTimer = null;
        const resetTimer = () => {
            if (idleTimer) clearTimeout(idleTimer);
            idleTimer = setTimeout(async () => {
                try { showNotification('You were logged out due to 5 minutes of inactivity.'); } catch (_) {}
                await handleLogout();
            }, IDLE_TIMEOUT_MS);
        };
        const activityHandler = () => resetTimer();
        const events = ['mousemove', 'keydown', 'scroll', 'touchstart'];
        events.forEach(evt => window.addEventListener(evt, activityHandler, { passive: true }));
        resetTimer();
        return () => {
            events.forEach(evt => window.removeEventListener(evt, activityHandler));
            if (idleTimer) clearTimeout(idleTimer);
        };
    }, [userRole]);
    
    const showNotification = (message) => {
        setNotification(message);
    };

    const navigate = (page) => {
        setIsLoading(true);
        setCurrentPage(page);
        window.scrollTo(0,0);
    };

    const handleLogin = (userData) => {
        setIsLoading(true);
        setUser(userData);
        setUserRole(userData.role);
        setCurrentPage('dashboard');
    };

    const handleLogout = async () => {
        setIsLoading(true);
        await window.supabaseClient.auth.signOut();
        setUser(null);
        setUserRole(null);
        setCurrentPage('home');
    };

    const renderPage = () => {
        if (!config || isLoading) {
            return React.createElement('div', {
                className: "flex justify-center items-center h-screen"
            }, React.createElement('div', {
                className: "loader"
            }));
        }
        
        // Page Access Guards
        const memberPages = ['dashboard', 'documents', 'calendar', 'account', 'admin'];
        if (memberPages.includes(currentPage) && !userRole) {
            return React.createElement(LoginPage, {
                theme: activeTheme,
                onLogin: handleLogin,
                showNotification: showNotification,
                onNavigate: navigate
            });
        }
        if (currentPage === 'admin' && userRole !== 'admin') {
            return React.createElement(DashboardPage, {
                theme: activeTheme,
                onNavigate: navigate,
                userRole: userRole
            });
        }

        switch (currentPage) {
            case 'home':
                return React.createElement(HomePage, {
                    config: config,
                    theme: activeTheme,
                    onNavigate: navigate,
                    showNotification: showNotification
                });
            case 'about':
                return React.createElement(AboutPage, {
                    config: config,
                    theme: activeTheme,
                    userRole: userRole
                });
            case 'login':
                return React.createElement(LoginPage, {
                    theme: activeTheme,
                    onLogin: handleLogin,
                    showNotification: showNotification,
                    onNavigate: navigate
                });
            case 'reset-password':
                return React.createElement(ResetPasswordPage, {
                    theme: activeTheme,
                    showNotification: showNotification,
                    onNavigate: navigate
                });
            case 'password-update':
                return React.createElement(PasswordUpdatePage, {
                    theme: activeTheme,
                    showNotification: showNotification,
                    onNavigate: navigate
                });
            case 'dashboard':
                return React.createElement(DashboardPage, {
                    theme: activeTheme,
                    onNavigate: navigate,
                    userRole: userRole
                });
            case 'documents':
                return React.createElement(DocumentsPage, {
                    theme: activeTheme,
                    user: user,
                    userRole: userRole,
                    showNotification: showNotification,
                    onNavigate: navigate
                });
            case 'calendar':
                return React.createElement(CalendarPage, {
                    theme: activeTheme,
                    userRole: userRole,
                    showNotification: showNotification,
                    onNavigate: navigate
                });
            case 'account':
                return React.createElement(AccountPage, {
                    theme: activeTheme,
                    user: user,
                    setUser: setUser,
                    showNotification: showNotification,
                    onNavigate: navigate
                });
            case 'admin':
                return React.createElement(AdminPage, {
                    config: config,
                    setConfig: setConfig,
                    theme: activeTheme,
                    themeName: themeName,
                    setThemeName: setThemeName,
                    showNotification: showNotification,
                    onNavigate: navigate
                });
            default:
                return React.createElement(HomePage, {
                    config: config,
                    theme: activeTheme,
                    onNavigate: navigate,
                    showNotification: showNotification
                });
        }
    };
    
    return React.createElement('div', {
        className: "flex flex-col min-h-screen bg-white"
    }, [
        notification && React.createElement(Notification, {
            key: "notification",
            message: notification,
            onDismiss: () => setNotification('')
        }),
        currentPage !== 'password-update' && !isLoading && config && React.createElement(Header, {
            key: "header",
            config: config,
            theme: activeTheme,
            userRole: userRole,
            onLogout: handleLogout,
            onNavigate: navigate
        }),
        React.createElement('main', {
            key: "main",
            className: "flex-grow"
        }, renderPage()),
        currentPage !== 'password-update' && !isLoading && config && React.createElement(Footer, {
            key: "footer",
            config: config
        }),
        React.createElement(ScrollToTopButton, {
            key: "scroll-top",
            theme: activeTheme
        })
    ]);
};
