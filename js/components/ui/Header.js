export const Header = ({ config, theme, userRole, onLogout, onNavigate }) => {
    return React.createElement('header', {
        className: "glass-header sticky top-0 z-50 transition-all duration-300"
    }, 
        React.createElement('nav', {
            className: "container mx-auto px-8 py-4 flex justify-between items-center"
        }, [
            React.createElement('div', {
                key: "logo",
                className: "flex items-center space-x-4 cursor-pointer",
                onClick: () => onNavigate('home')
            }, [
                React.createElement('div', {
                    key: "icon",
                    className: `${theme.bg} p-3 rounded-xl shadow-lg`
                }, React.createElement('i', {
                    className: "fas fa-home text-white text-xl"
                })),
                React.createElement('span', {
                    key: "name",
                    className: "text-2xl font-extrabold text-gray-800"
                }, config.hoaName)
            ]),
            React.createElement('div', {
                key: "nav",
                className: "hidden md:flex items-center space-x-10"
            }, [
                React.createElement('a', {
                    key: "home",
                    href: "#",
                    onClick: (e) => { e.preventDefault(); onNavigate('home'); },
                    className: "text-gray-700 font-semibold text-lg hover:text-gray-900 transition duration-300"
                }, "Home"),
                React.createElement('a', {
                    key: "about",
                    href: "#",
                    onClick: (e) => { e.preventDefault(); onNavigate('about'); },
                    className: "text-gray-700 font-semibold text-lg hover:text-gray-900 transition duration-300"
                }, "About"),
                userRole && React.createElement('a', {
                    key: "dashboard",
                    href: "#",
                    onClick: (e) => { e.preventDefault(); onNavigate('dashboard'); },
                    className: "text-gray-700 font-semibold text-lg hover:text-gray-900 transition duration-300"
                }, "Dashboard")
            ]),
            React.createElement('div', {
                key: "auth"
            }, 
                userRole ? 
                    React.createElement('button', {
                        onClick: onLogout,
                        className: "bg-red-500 text-white font-bold py-3 px-6 rounded-xl hover:bg-red-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    }, "Logout") :
                    React.createElement('button', {
                        onClick: () => onNavigate('login'),
                        className: `${theme.bg} text-white font-bold py-3 px-6 rounded-xl ${theme.hoverBg} transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5`
                    }, "Member Login")
            )
        ])
    );
};
