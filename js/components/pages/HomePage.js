import { ContactForm } from '../forms/ContactForm.js';

export const HomePage = ({ config, theme, onNavigate, showNotification }) => {
    return React.createElement('div', {
        className: "fade-in"
    }, [
        React.createElement('section', {
            key: "hero",
            className: "relative text-white text-center py-32 px-6 bg-cover bg-center",
            style: { backgroundImage: `url('${config.heroImageUrl}')` }
        }, [
            React.createElement('div', {
                key: "overlay",
                className: "absolute inset-0 bg-black bg-opacity-60"
            }),
            React.createElement('div', {
                key: "content",
                className: "relative z-10"
            }, [
                React.createElement('h1', {
                    key: "title",
                    className: "text-5xl md:text-7xl font-extrabold mb-5 drop-shadow-lg"
                }, `Welcome to ${config.hoaName}`),
                React.createElement('p', {
                    key: "subtitle",
                    className: "text-xl md:text-2xl max-w-4xl mx-auto drop-shadow-md"
                }, "Your source for official HOA information, documents, and news.")
            ])
        ]),
        React.createElement('section', {
            key: "main",
            className: "container mx-auto px-8 py-24"
        },
            React.createElement('div', {
                className: "grid md:grid-cols-2 gap-20 items-center"
            }, [
                React.createElement('div', {
                    key: "contact",
                    className: "bg-white p-10 rounded-2xl shadow-xl"
                }, [
                    React.createElement('h2', {
                        key: "contact-title",
                        className: "text-4xl font-bold text-gray-800 mb-8"
                    }, "Contact Us"),
                    React.createElement(ContactForm, {
                        key: "contact-form",
                        theme: theme,
                        showNotification: showNotification
                    })
                ]),
                React.createElement('div', {
                    key: "links",
                    className: "space-y-8"
                }, [
                    React.createElement('h3', {
                        key: "links-title",
                        className: "text-4xl font-bold text-gray-800 mb-6"
                    }, "Quick Links"),
                    React.createElement('div', {
                        key: "member-portal",
                        onClick: () => onNavigate('login'),
                        className: "flex items-center p-8 bg-white rounded-2xl shadow-xl hover:shadow-2xl cursor-pointer transition-all duration-300 transform hover:-translate-y-2"
                    }, [
                        React.createElement('div', {
                            key: "portal-icon",
                            className: `${theme.iconBg} p-5 rounded-full mr-8`
                        }, React.createElement('i', {
                            className: `fas fa-sign-in-alt ${theme.iconText} text-3xl`
                        })),
                        React.createElement('div', {
                            key: "portal-text"
                        }, [
                            React.createElement('h4', {
                                key: "portal-title",
                                className: "font-bold text-2xl text-gray-800"
                            }, "Member Portal"),
                            React.createElement('p', {
                                key: "portal-desc",
                                className: "text-gray-600 text-lg"
                            }, "Access documents, meetings, and more.")
                        ])
                    ]),
                    React.createElement('div', {
                        key: "about-hoa",
                        onClick: () => onNavigate('about'),
                        className: "flex items-center p-8 bg-white rounded-2xl shadow-xl hover:shadow-2xl cursor-pointer transition-all duration-300 transform hover:-translate-y-2"
                    }, [
                        React.createElement('div', {
                            key: "about-icon",
                            className: `${theme.iconBg} p-5 rounded-full mr-8`
                        }, React.createElement('i', {
                            className: `fas fa-info-circle ${theme.iconText} text-3xl`
                        })),
                        React.createElement('div', {
                            key: "about-text"
                        }, [
                            React.createElement('h4', {
                                key: "about-title",
                                className: "font-bold text-2xl text-gray-800"
                            }, "About the HOA"),
                            React.createElement('p', {
                                key: "about-desc",
                                className: "text-gray-600 text-lg"
                            }, "Learn about our board and rules.")
                        ])
                    ])
                ])
            ])
        )
    ]);
};
