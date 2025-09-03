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
import { CalendarPage } from './components/pages/CalendarPage.js';
import { AccountPage } from './components/pages/AccountPage.js';
import { AdminPage } from './components/pages/AdminPage.js';
import { themeClasses, initialHoaConfig } from './utils/themes.js';
// Global supabase client will be accessed directly

const { useState, useEffect } = React;

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

        const { data: authListener } = window.supabaseClient.auth.onAuthStateChange(
            async (event, session) => {
                if (session?.user) {
                    const { data: userData, error } = await window.supabaseClient
                        .from('users')
                        .select('*')
                        .eq('id', session.user.id)
                        .single();
                    if (userData) {
                        setUser(userData);
                        setUserRole(userData.role);
                    }
                } else {
                    setUser(null);
                    setUserRole(null);
                }
            }
        );

        return () => {
            authListener.subscription.unsubscribe();
        };
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 500);
        return () => clearTimeout(timer);
    }, [currentPage]);
    
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
                    theme: activeTheme
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
            case 'dashboard':
                return React.createElement(DashboardPage, {
                    theme: activeTheme,
                    onNavigate: navigate,
                    userRole: userRole
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
        !isLoading && config && React.createElement(Header, {
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
        !isLoading && config && React.createElement(Footer, {
            key: "footer",
            config: config
        }),
        React.createElement(ScrollToTopButton, {
            key: "scroll-top",
            theme: activeTheme
        })
    ]);
};
