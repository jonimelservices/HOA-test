export const AboutPage = ({ config, theme }) => {
    return React.createElement('div', {
        className: "container mx-auto px-8 py-24 fade-in"
    }, [
        React.createElement('div', {
            key: "hero-section",
            className: "text-center mb-16"
        }, [
            React.createElement('h1', {
                key: "title",
                className: "text-6xl font-black gradient-text mb-6"
            }, `About ${config.hoaName}`),
            React.createElement('p', {
                key: "subtitle",
                className: "text-2xl text-gray-600 max-w-3xl mx-auto"
            }, "Learn about our community leadership, management, and how to get in touch")
        ]),

        React.createElement('div', {
            key: "content-grid",
            className: "grid lg:grid-cols-2 gap-12 mb-16"
        }, [
            React.createElement('div', {
                key: "management-card",
                className: "modern-card p-10 stagger-fade-in"
            }, [
                React.createElement('div', {
                    key: "mgmt-header",
                    className: "flex items-center gap-4 mb-8"
                }, [
                    React.createElement('div', {
                        key: "mgmt-icon",
                        className: "bg-gradient-to-br from-blue-100 to-blue-200 p-4 rounded-2xl"
                    }, React.createElement('i', {
                        className: "fas fa-building text-blue-700 text-2xl"
                    })),
                    React.createElement('h2', {
                        key: "mgmt-title",
                        className: "text-3xl font-black text-gray-800"
                    }, "Management Company")
                ]),
                React.createElement('p', {
                    key: "mgmt-info",
                    className: "text-gray-700 leading-relaxed text-lg"
                }, config.managementCompanyInfo)
            ]),

            React.createElement('div', {
                key: "contact-card",
                className: "modern-card p-10 stagger-fade-in"
            }, [
                React.createElement('div', {
                    key: "contact-header",
                    className: "flex items-center gap-4 mb-8"
                }, [
                    React.createElement('div', {
                        key: "contact-icon",
                        className: "bg-gradient-to-br from-green-100 to-green-200 p-4 rounded-2xl"
                    }, React.createElement('i', {
                        className: "fas fa-phone text-green-700 text-2xl"
                    })),
                    React.createElement('h2', {
                        key: "contact-title",
                        className: "text-3xl font-black text-gray-800"
                    }, "Contact Information")
                ]),
                React.createElement('div', {
                    key: "contact-details",
                    className: "space-y-4"
                }, [
                    React.createElement('div', {
                        key: "manager",
                        className: "flex items-center gap-3"
                    }, [
                        React.createElement('i', {
                            key: "manager-icon",
                            className: "fas fa-user-tie text-blue-600"
                        }),
                        React.createElement('div', {
                            key: "manager-info"
                        }, [
                            React.createElement('div', {
                                key: "manager-label",
                                className: "text-sm text-gray-500 font-semibold"
                            }, "Property Manager"),
                            React.createElement('div', {
                                key: "manager-name",
                                className: "text-lg font-bold text-gray-800"
                            }, config.contactInfo.propertyManager)
                        ])
                    ]),
                    React.createElement('div', {
                        key: "email",
                        className: "flex items-center gap-3"
                    }, [
                        React.createElement('i', {
                            key: "email-icon",
                            className: "fas fa-envelope text-green-600"
                        }),
                        React.createElement('div', {
                            key: "email-info"
                        }, [
                            React.createElement('div', {
                                key: "email-label",
                                className: "text-sm text-gray-500 font-semibold"
                            }, "Email Address"),
                            React.createElement('a', {
                                key: "email-link",
                                href: `mailto:${config.contactInfo.email}`,
                                className: "text-lg font-bold text-blue-600 hover:text-blue-800 transition-colors duration-200"
                            }, config.contactInfo.email)
                        ])
                    ]),
                    React.createElement('div', {
                        key: "phone",
                        className: "flex items-center gap-3"
                    }, [
                        React.createElement('i', {
                            key: "phone-icon",
                            className: "fas fa-phone text-purple-600"
                        }),
                        React.createElement('div', {
                            key: "phone-info"
                        }, [
                            React.createElement('div', {
                                key: "phone-label",
                                className: "text-sm text-gray-500 font-semibold"
                            }, "Phone Number"),
                            React.createElement('div', {
                                key: "phone-number",
                                className: "text-lg font-bold text-gray-800"
                            }, config.contactInfo.phone)
                        ])
                    ]),
                    React.createElement('div', {
                        key: "address",
                        className: "flex items-center gap-3"
                    }, [
                        React.createElement('i', {
                            key: "address-icon",
                            className: "fas fa-map-marker-alt text-red-600"
                        }),
                        React.createElement('div', {
                            key: "address-info"
                        }, [
                            React.createElement('div', {
                                key: "address-label",
                                className: "text-sm text-gray-500 font-semibold"
                            }, "Address"),
                            React.createElement('div', {
                                key: "address-text",
                                className: "text-lg font-bold text-gray-800"
                            }, config.contactInfo.address)
                        ])
                    ])
                ])
            ])
        ]),

        React.createElement('div', {
            key: "board-section",
            className: "modern-card p-12 stagger-fade-in"
        }, [
            React.createElement('div', {
                key: "board-header",
                className: "text-center mb-12"
            }, [
                React.createElement('div', {
                    key: "board-icon",
                    className: "bg-gradient-to-br from-purple-100 to-purple-200 p-6 rounded-3xl mx-auto w-fit mb-6"
                }, React.createElement('i', {
                    className: "fas fa-users text-purple-700 text-4xl"
                })),
                React.createElement('h2', {
                    key: "board-title",
                    className: "text-4xl font-black text-gray-800 mb-4"
                }, "Board of Directors"),
                React.createElement('p', {
                    key: "board-subtitle",
                    className: "text-xl text-gray-600"
                }, "Meet the dedicated individuals who serve our community")
            ]),
            React.createElement('div', {
                key: "board-grid",
                className: "grid md:grid-cols-2 gap-8"
            }, config.boardMembers.map((member, index) =>
                React.createElement('div', {
                    key: index,
                    className: "modern-card p-8 hover:scale-105 transition-transform duration-300"
                }, [
                    React.createElement('div', {
                        key: "member-avatar",
                        className: "bg-gradient-to-br from-indigo-100 to-indigo-200 w-16 h-16 rounded-full flex items-center justify-center mb-4"
                    }, React.createElement('i', {
                        className: "fas fa-user text-indigo-700 text-2xl"
                    })),
                    React.createElement('h3', {
                        key: "member-title",
                        className: "text-xl font-black text-gray-800 mb-2"
                    }, member.title),
                    React.createElement('p', {
                        key: "member-name",
                        className: "text-lg text-gray-600 font-semibold"
                    }, member.name)
                ])
            ))
        ])
    ]);
};
