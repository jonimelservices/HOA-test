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
            className: "container mx-auto px-8 py-32 -mt-16 relative z-10"
        },
            React.createElement('div', {
                className: "grid lg:grid-cols-2 gap-16 items-start"
            }, [
                React.createElement('div', {
                    key: "contact",
                    className: "modern-card p-12 stagger-fade-in"
                }, [
                    React.createElement('div', {
                        key: "contact-header",
                        className: "text-center mb-10"
                    }, [
                        React.createElement('div', {
                            key: "contact-icon",
                            className: "bg-gradient-to-br from-blue-100 to-purple-100 p-6 rounded-3xl mx-auto w-fit mb-6 shadow-lg"
                        }, React.createElement('i', {
                            className: "fas fa-envelope text-4xl gradient-text"
                        })),
                        React.createElement('h2', {
                            key: "contact-title",
                            className: "text-5xl font-black text-gray-800 mb-4"
                        }, "Get in Touch"),
                        React.createElement('p', {
                            key: "contact-subtitle",
                            className: "text-gray-600 text-xl"
                        }, "We're here to help with any questions or concerns")
                    ]),
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
                    React.createElement('div', {
                        key: "links-header",
                        className: "text-center mb-12 stagger-fade-in"
                    }, [
                        React.createElement('h3', {
                            key: "links-title",
                            className: "text-5xl font-black text-gray-800 mb-4"
                        }, "Quick Access"),
                        React.createElement('p', {
                            key: "links-subtitle",
                            className: "text-gray-600 text-xl"
                        }, "Navigate to key community resources")
                    ]),
                    React.createElement('div', {
                        key: "member-portal",
                        onClick: () => onNavigate('login'),
                        className: "group modern-card p-10 cursor-pointer stagger-fade-in hover:scale-105 transition-all duration-300"
                    }, [
                        React.createElement('div', {
                            key: "portal-content",
                            className: "flex items-center"
                        }, [
                            React.createElement('div', {
                                key: "portal-icon",
                                className: `${theme.iconBg} p-6 rounded-3xl mr-8 group-hover:scale-110 transition-transform duration-300 shadow-lg`
                            }, React.createElement('i', {
                                className: `fas fa-sign-in-alt ${theme.iconText} text-4xl`
                            })),
                            React.createElement('div', {
                                key: "portal-text",
                                className: "flex-1"
                            }, [
                                React.createElement('h4', {
                                    key: "portal-title",
                                    className: "font-black text-3xl text-gray-800 mb-2"
                                }, "Member Portal"),
                                React.createElement('p', {
                                    key: "portal-desc",
                                    className: "text-gray-600 text-xl"
                                }, "Access exclusive documents, meeting info, and member services"),
                                React.createElement('div', {
                                    key: "portal-arrow",
                                    className: "mt-4 inline-flex items-center text-blue-600 font-semibold group-hover:translate-x-2 transition-transform duration-300"
                                }, [
                                    "Access Now ",
                                    React.createElement('i', {
                                        className: "fas fa-arrow-right ml-2"
                                    })
                                ])
                            ])
                        ])
                    ]),
                    React.createElement('div', {
                        key: "about-hoa",
                        onClick: () => onNavigate('about'),
                        className: "group modern-card p-10 cursor-pointer stagger-fade-in hover:scale-105 transition-all duration-300"
                    }, [
                        React.createElement('div', {
                            key: "about-content",
                            className: "flex items-center"
                        }, [
                            React.createElement('div', {
                                key: "about-icon",
                                className: `bg-gradient-to-br from-green-100 to-teal-100 p-6 rounded-3xl mr-8 group-hover:scale-110 transition-transform duration-300 shadow-lg`
                            }, React.createElement('i', {
                                className: `fas fa-info-circle text-green-700 text-4xl`
                            })),
                            React.createElement('div', {
                                key: "about-text",
                                className: "flex-1"
                            }, [
                                React.createElement('h4', {
                                    key: "about-title",
                                    className: "font-black text-3xl text-gray-800 mb-2"
                                }, "About Our Community"),
                                React.createElement('p', {
                                    key: "about-desc",
                                    className: "text-gray-600 text-xl"
                                }, "Learn about our board members, community guidelines, and management team"),
                                React.createElement('div', {
                                    key: "about-arrow",
                                    className: "mt-4 inline-flex items-center text-green-600 font-semibold group-hover:translate-x-2 transition-transform duration-300"
                                }, [
                                    "Learn More ",
                                    React.createElement('i', {
                                        className: "fas fa-arrow-right ml-2"
                                    })
                                ])
                            ])
                        ])
                    ])
                ])
            ])
        )
    ]);
};
