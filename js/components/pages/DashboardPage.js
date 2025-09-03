export const DashboardPage = ({ theme, onNavigate, userRole }) => {
    return React.createElement('div', {
        className: "container mx-auto px-8 py-24 fade-in"
    }, [
        React.createElement('div', {
            key: "header",
            className: "text-center mb-16"
        }, [
            React.createElement('h1', {
                key: "title",
                className: "text-6xl font-black gradient-text mb-6"
            }, "Member Dashboard"),
            React.createElement('p', {
                key: "subtitle",
                className: "text-2xl text-gray-600 max-w-3xl mx-auto"
            }, "Access all your community resources and services in one place")
        ]),
        React.createElement('div', {
            key: "grid",
            className: "grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
        }, [
            React.createElement('div', {
                key: "documents",
                onClick: () => onNavigate('documents'),
                className: "group modern-card p-10 cursor-pointer flex flex-col items-center text-center stagger-fade-in hover:scale-105"
            }, [
                React.createElement('div', {
                    key: "icon",
                    className: `${theme.iconBg} p-8 rounded-3xl mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`
                }, React.createElement('i', {
                    className: `fas fa-file-alt ${theme.iconText} text-5xl`
                })),
                React.createElement('h2', {
                    key: "title",
                    className: "text-2xl font-black text-gray-800 mb-3"
                }, "Documents"),
                React.createElement('p', {
                    key: "desc",
                    className: "text-gray-600 text-lg leading-relaxed"
                }, "Access governing documents, financial records, and community bylaws"),
                React.createElement('div', {
                    key: "arrow",
                    className: "mt-4 inline-flex items-center text-blue-600 font-semibold group-hover:translate-x-2 transition-transform duration-300"
                }, [
                    "View Documents ",
                    React.createElement('i', {
                        className: "fas fa-arrow-right ml-2"
                    })
                ])
            ]),
            React.createElement('div', {
                key: "calendar",
                onClick: () => onNavigate('calendar'),
                className: "group modern-card p-10 cursor-pointer flex flex-col items-center text-center stagger-fade-in hover:scale-105"
            }, [
                React.createElement('div', {
                    key: "icon",
                    className: "bg-gradient-to-br from-green-100 to-emerald-200 p-8 rounded-3xl mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg"
                }, React.createElement('i', {
                    className: "fas fa-calendar-alt text-green-700 text-5xl"
                })),
                React.createElement('h2', {
                    key: "title",
                    className: "text-2xl font-black text-gray-800 mb-3"
                }, "Events"),
                React.createElement('p', {
                    key: "desc",
                    className: "text-gray-600 text-lg leading-relaxed"
                }, "View upcoming community events, meetings, and important dates"),
                React.createElement('div', {
                    key: "arrow",
                    className: "mt-4 inline-flex items-center text-green-600 font-semibold group-hover:translate-x-2 transition-transform duration-300"
                }, [
                    "View Calendar ",
                    React.createElement('i', {
                        className: "fas fa-arrow-right ml-2"
                    })
                ])
            ]),
            React.createElement('div', {
                key: "account",
                onClick: () => onNavigate('account'),
                className: "group modern-card p-10 cursor-pointer flex flex-col items-center text-center stagger-fade-in hover:scale-105"
            }, [
                React.createElement('div', {
                    key: "icon",
                    className: "bg-gradient-to-br from-purple-100 to-pink-200 p-8 rounded-3xl mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg"
                }, React.createElement('i', {
                    className: "fas fa-user-cog text-purple-700 text-5xl"
                })),
                React.createElement('h2', {
                    key: "title",
                    className: "text-2xl font-black text-gray-800 mb-3"
                }, "Settings"),
                React.createElement('p', {
                    key: "desc",
                    className: "text-gray-600 text-lg leading-relaxed"
                }, "Manage your profile, notifications, and account preferences"),
                React.createElement('div', {
                    key: "arrow",
                    className: "mt-4 inline-flex items-center text-purple-600 font-semibold group-hover:translate-x-2 transition-transform duration-300"
                }, [
                    "Manage Account ",
                    React.createElement('i', {
                        className: "fas fa-arrow-right ml-2"
                    })
                ])
            ]),
            userRole === 'admin' && React.createElement('div', {
                key: "admin",
                onClick: () => onNavigate('admin'),
                className: "group modern-card p-10 cursor-pointer flex flex-col items-center text-center stagger-fade-in hover:scale-105 col-span-full lg:col-span-1"
            }, [
                React.createElement('div', {
                    key: "icon",
                    className: "bg-gradient-to-br from-yellow-100 to-orange-200 p-8 rounded-3xl mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg"
                }, React.createElement('i', {
                    className: "fas fa-shield-alt text-yellow-700 text-5xl"
                })),
                React.createElement('h2', {
                    key: "title",
                    className: "text-2xl font-black text-gray-800 mb-3"
                }, "Admin Panel"),
                React.createElement('p', {
                    key: "desc",
                    className: "text-gray-600 text-lg leading-relaxed"
                }, "Configure site settings, manage content, and customize themes"),
                React.createElement('div', {
                    key: "arrow",
                    className: "mt-4 inline-flex items-center text-orange-600 font-semibold group-hover:translate-x-2 transition-transform duration-300"
                }, [
                    "Admin Controls ",
                    React.createElement('i', {
                        className: "fas fa-arrow-right ml-2"
                    })
                ])
            ])
        ])
    ]);
};
