export const Header = ({ config, theme, userRole, onLogout, onNavigate }) => {
    return React.createElement('header', {
        className: "glass-header transition-all duration-500"
    },
        React.createElement('nav', {
            className: "container mx-auto px-8 py-6 flex justify-between items-center"
        }, [
            React.createElement('div', {
                key: "logo",
                className: "flex items-center space-x-4 cursor-pointer group",
                onClick: () => onNavigate('home')
            }, [
                React.createElement('div', {
                    key: "icon",
                    className: `${theme.gradient} p-4 rounded-2xl shadow-lg group-hover:shadow-xl transition-all duration-300 logo-rotator`
                }, React.createElement('i', {
                    className: "fas fa-home text-white text-2xl"
                })),
                React.createElement('span', {
                    key: "name",
                    className: "text-3xl font-black gradient-text"
                }, config.hoaName)
            ]),
            React.createElement('div', {
                key: "nav",
                className: "hidden md:flex items-center space-x-8"
            }, [
                React.createElement('a', {
                    key: "home",
                    href: "#",
                    onClick: (e) => { e.preventDefault(); onNavigate('home'); },
                    className: "relative text-gray-700 font-semibold text-lg hover:text-gray-900 transition-all duration-300 py-2 px-4 rounded-lg hover:bg-white/20 group"
                }, [
                    "Home",
                    React.createElement('span', {
                        key: "underline",
                        className: "absolute bottom-0 left-1/2 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-600 group-hover:w-full group-hover:left-0 transition-all duration-300"
                    })
                ]),
                React.createElement('a', {
                    key: "about",
                    href: "#",
                    onClick: (e) => { e.preventDefault(); onNavigate('about'); },
                    className: "relative text-gray-700 font-semibold text-lg hover:text-gray-900 transition-all duration-300 py-2 px-4 rounded-lg hover:bg-white/20 group"
                }, [
                    "About",
                    React.createElement('span', {
                        key: "underline",
                        className: "absolute bottom-0 left-1/2 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-600 group-hover:w-full group-hover:left-0 transition-all duration-300"
                    })
                ]),
                userRole && React.createElement('a', {
                    key: "dashboard",
                    href: "#",
                    onClick: (e) => { e.preventDefault(); onNavigate('dashboard'); },
                    className: "relative text-gray-700 font-semibold text-lg hover:text-gray-900 transition-all duration-300 py-2 px-4 rounded-lg hover:bg-white/20 group"
                }, [
                    "Dashboard",
                    React.createElement('span', {
                        key: "underline",
                        className: "absolute bottom-0 left-1/2 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-600 group-hover:w-full group-hover:left-0 transition-all duration-300"
                    })
                ])
            ]),
            React.createElement('div', {
                key: "auth"
            },
                userRole ?
                    React.createElement('button', {
                        onClick: onLogout,
                        className: "bg-gradient-to-r from-red-500 to-rose-600 text-white font-bold py-3 px-8 rounded-2xl hover:from-red-600 hover:to-rose-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 hover:scale-105"
                    }, "Logout") :
                    React.createElement('button', {
                        onClick: () => onNavigate('login'),
                        className: "modern-button text-white font-bold py-3 px-8 rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 hover:scale-105"
                    }, "Member Login")
            )
        ])
    );
};
