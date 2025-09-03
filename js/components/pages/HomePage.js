import { ContactForm } from '../forms/ContactForm.js';

export const HomePage = ({ config, theme, onNavigate, showNotification }) => {
    return React.createElement('div', {
        className: "fade-in"
    }, [
        React.createElement('section', {
            key: "hero",
            className: "relative text-white text-center py-40 px-6 overflow-hidden",
            style: {
                backgroundImage: `linear-gradient(135deg, rgba(102, 126, 234, 0.9), rgba(118, 75, 162, 0.8)), url('${config.heroImageUrl}')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundAttachment: 'fixed'
            }
        }, [
            React.createElement('div', {
                key: "floating-elements",
                className: "absolute inset-0 overflow-hidden pointer-events-none"
            }, [
                React.createElement('div', {
                    key: "circle1",
                    className: "absolute top-20 left-20 w-32 h-32 bg-white/10 rounded-full blur-xl animate-pulse"
                }),
                React.createElement('div', {
                    key: "circle2",
                    className: "absolute bottom-32 right-32 w-24 h-24 bg-purple-300/20 rounded-full blur-lg"
                }),
                React.createElement('div', {
                    key: "circle3",
                    className: "absolute top-1/2 left-1/4 w-16 h-16 bg-blue-300/30 rounded-full blur-md"
                })
            ]),
            React.createElement('div', {
                key: "content",
                className: "relative z-10 max-w-5xl mx-auto"
            }, [
                React.createElement('h1', {
                    key: "title",
                    className: "text-6xl md:text-8xl font-black mb-8 leading-tight"
                }, [
                    "Welcome to ",
                    React.createElement('span', {
                        key: "name",
                        className: "bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent"
                    }, config.hoaName)
                ]),
                React.createElement('p', {
                    key: "subtitle",
                    className: "text-2xl md:text-3xl max-w-4xl mx-auto leading-relaxed font-light mb-12 text-blue-50"
                }, "Your modern, digital gateway to community information, documents, and seamless member services."),
                React.createElement('div', {
                    key: "cta-buttons",
                    className: "flex flex-col sm:flex-row gap-6 justify-center items-center"
                }, [
                    React.createElement('button', {
                        key: "explore",
                        onClick: () => onNavigate('about'),
                        className: "modern-button px-12 py-4 text-xl font-bold rounded-2xl shadow-2xl hover:shadow-3xl transform hover:-translate-y-2 hover:scale-105"
                    }, "Explore Community"),
                    React.createElement('button', {
                        key: "member-login",
                        onClick: () => onNavigate('login'),
                        className: "bg-white/20 backdrop-blur-md border border-white/30 text-white px-12 py-4 text-xl font-bold rounded-2xl hover:bg-white/30 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-2"
                    }, "Member Portal")
                ])
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
