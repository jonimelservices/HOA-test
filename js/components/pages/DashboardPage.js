export const DashboardPage = ({ theme, onNavigate, userRole }) => {
    return React.createElement('div', {
        className: "container mx-auto px-8 py-20 fade-in"
    }, [
        React.createElement('h1', {
            key: "title",
            className: "text-5xl font-extrabold text-gray-800 mb-12"
        }, "Dashboard"),
        React.createElement('div', {
            key: "grid",
            className: "grid md:grid-cols-2 lg:grid-cols-4 gap-10"
        }, [
            React.createElement('div', {
                key: "documents",
                onClick: () => onNavigate('documents'),
                className: "bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer flex flex-col items-center text-center"
            }, [
                React.createElement('div', {
                    key: "icon",
                    className: `${theme.iconBg} p-6 rounded-full mb-5`
                }, React.createElement('i', {
                    className: `fas fa-file-alt ${theme.iconText} text-4xl`
                })),
                React.createElement('h2', {
                    key: "title",
                    className: "text-2xl font-bold text-gray-800"
                }, "Documents"),
                React.createElement('p', {
                    key: "desc",
                    className: "text-gray-600 mt-2 text-lg"
                }, "View records & bylaws.")
            ]),
            React.createElement('div', {
                key: "calendar",
                onClick: () => onNavigate('calendar'),
                className: "bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer flex flex-col items-center text-center"
            }, [
                React.createElement('div', {
                    key: "icon",
                    className: "bg-green-100 p-6 rounded-full mb-5"
                }, React.createElement('i', {
                    className: "fas fa-calendar-alt text-green-600 text-4xl"
                })),
                React.createElement('h2', {
                    key: "title",
                    className: "text-2xl font-bold text-gray-800"
                }, "Event Calendar"),
                React.createElement('p', {
                    key: "desc",
                    className: "text-gray-600 mt-2 text-lg"
                }, "See upcoming events.")
            ]),
            React.createElement('div', {
                key: "account",
                onClick: () => onNavigate('account'),
                className: "bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer flex flex-col items-center text-center"
            }, [
                React.createElement('div', {
                    key: "icon",
                    className: "bg-purple-100 p-6 rounded-full mb-5"
                }, React.createElement('i', {
                    className: "fas fa-user-cog text-purple-600 text-4xl"
                })),
                React.createElement('h2', {
                    key: "title",
                    className: "text-2xl font-bold text-gray-800"
                }, "Account Settings"),
                React.createElement('p', {
                    key: "desc",
                    className: "text-gray-600 mt-2 text-lg"
                }, "Manage your profile.")
            ]),
            userRole === 'admin' && React.createElement('div', {
                key: "admin",
                onClick: () => onNavigate('admin'),
                className: "bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer flex flex-col items-center text-center"
            }, [
                React.createElement('div', {
                    key: "icon",
                    className: "bg-yellow-100 p-6 rounded-full mb-5"
                }, React.createElement('i', {
                    className: "fas fa-shield-alt text-yellow-600 text-4xl"
                })),
                React.createElement('h2', {
                    key: "title",
                    className: "text-2xl font-bold text-gray-800"
                }, "Admin Controls"),
                React.createElement('p', {
                    key: "desc",
                    className: "text-gray-600 mt-2 text-lg"
                }, "Edit site settings.")
            ])
        ])
    ]);
};
