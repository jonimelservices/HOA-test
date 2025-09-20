const { useState, useEffect } = React;

export const CalendarPage = ({ theme, userRole, showNotification, onNavigate }) => {
    const [events, setEvents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchEvents = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await window.supabaseClient.from('events').select('*');
            if (error) {
                console.error("Error fetching events:", error);
                showNotification("Error fetching events.");
                setEvents([]);
            } else {
                const items = Array.isArray(data) ? data : [];
                const normalized = items.map(e => ({
                    ...e,
                    date: e.date || e.event_date || e.scheduled_at || e.start_date || e.start_at || null,
                    time: e.time || e.start_time || e.starts_at || ''
                }));
                const sorted = normalized.sort((a, b) => {
                    const ad = new Date((a.date || 0).toString().replace(/-/g, '/')).getTime();
                    const bd = new Date((b.date || 0).toString().replace(/-/g, '/')).getTime();
                    return ad - bd;
                });
                setEvents(sorted);
            }
        } catch (error) {
            console.error("Error:", error);
            setEvents([]);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        fetchEvents();
        const channel = window.supabaseClient
            .channel('events-changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'events' }, () => {
                fetchEvents();
            })
            .subscribe();
        return () => {
            try { window.supabaseClient.removeChannel(channel); } catch (e) {}
        };
    }, []);

    const formatDate = (dateString) => {
        if (!dateString) return { month: '', day: '', year: '', weekday: '' };
        const date = new Date(dateString.replace(/-/g, '/'));
        return {
            month: date.toLocaleDateString('en-US', { month: 'short' }),
            day: date.getDate(),
            year: date.getFullYear(),
            weekday: date.toLocaleDateString('en-US', { weekday: 'long' })
        };
    };

    const isUpcoming = (dateString) => {
        if (!dateString) return false;
        const eventDate = new Date(dateString.replace(/-/g, '/'));
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return eventDate >= today;
    };

    const upcomingEvents = events.filter(event => isUpcoming(event.date));
    const pastEvents = events.filter(event => !isUpcoming(event.date));

    return React.createElement('div', {
        className: "container mx-auto px-8 py-16 fade-in"
    }, [
        React.createElement('div', {
            key: "header",
            className: "flex flex-col lg:flex-row justify-between items-center mb-12"
        }, [
            React.createElement('div', {
                key: "title-section",
                className: "text-center lg:text-left mb-6 lg:mb-0"
            }, [
                React.createElement('h1', {
                    key: "title",
                    className: "text-5xl font-black gradient-text mb-4"
                }, "Community Calendar"),
                React.createElement('p', {
                    key: "subtitle",
                    className: "text-xl text-gray-600"
                }, "Stay informed about upcoming events and meetings")
            ]),
            React.createElement('div', { key: 'header-actions', className: 'flex items-center gap-3' }, [
                React.createElement('button', {
                    key: "back-btn",
                    onClick: () => onNavigate('dashboard'),
                    className: "modern-button px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                }, [
                    React.createElement('i', {
                        key: "icon",
                        className: "fas fa-arrow-left mr-2"
                    }),
                    "Back to Dashboard"
                ]),
                React.createElement('button', {
                    key: 'refresh-btn',
                    onClick: fetchEvents,
                    className: 'bg-gray-200 text-gray-800 font-bold py-3 px-4 rounded-xl hover:bg-gray-300 transition-all duration-300'
                }, [
                    React.createElement('i', { key: 'ri', className: 'fas fa-sync mr-2' }),
                    'Refresh'
                ])
            ])
        ]),

        isLoading ? 
            React.createElement('div', {
                key: "loading",
                className: "flex justify-center items-center py-16"
            }, React.createElement('div', {
                className: "loader"
            })) :
            React.createElement('div', {
                key: "content",
                className: "space-y-12"
            }, [
                // Upcoming Events Section
                React.createElement('section', {
                    key: "upcoming",
                    className: "space-y-6"
                }, [
                    React.createElement('div', {
                        key: "upcoming-header",
                        className: "flex items-center gap-4"
                    }, [
                        React.createElement('div', {
                            key: "upcoming-icon",
                            className: "bg-gradient-to-br from-green-100 to-emerald-200 p-4 rounded-2xl"
                        }, React.createElement('i', {
                            className: "fas fa-calendar-plus text-green-700 text-2xl"
                        })),
                        React.createElement('h2', {
                            key: "upcoming-title",
                            className: "text-3xl font-black text-gray-800"
                        }, "Upcoming Events"),
                        React.createElement('span', {
                            key: "upcoming-count",
                            className: "bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-bold"
                        }, upcomingEvents.length)
                    ]),
                    upcomingEvents.length === 0 ? 
                        React.createElement('div', {
                            key: "no-upcoming",
                            className: "modern-card p-12 text-center"
                        }, [
                            React.createElement('i', {
                                key: "empty-icon",
                                className: "fas fa-calendar-day text-6xl text-gray-300 mb-4"
                            }),
                            React.createElement('h3', {
                                key: "empty-title",
                                className: "text-2xl font-bold text-gray-500 mb-2"
                            }, "No Upcoming Events"),
                            React.createElement('p', {
                                key: "empty-desc",
                                className: "text-gray-400"
                            }, "Check back later for new community events")
                        ]) :
                        React.createElement('div', {
                            key: "upcoming-grid",
                            className: "grid gap-6"
                        }, upcomingEvents.map((event, index) => {
                            const dateInfo = formatDate(event.date);
                            return React.createElement('div', {
                                key: event.id || index,
                                className: "modern-card p-8 hover:scale-102 transition-all duration-300 stagger-fade-in"
                            }, [
                                React.createElement('div', {
                                    key: "event-content",
                                    className: "flex flex-col md:flex-row items-start md:items-center gap-6"
                                }, [
                                    React.createElement('div', {
                                        key: "date-badge",
                                        className: "flex-shrink-0 text-center bg-gradient-to-br from-blue-100 to-blue-200 p-4 rounded-2xl shadow-lg min-w-[100px]"
                                    }, [
                                        React.createElement('p', {
                                            key: "month",
                                            className: "text-blue-700 font-bold text-lg"
                                        }, dateInfo.month),
                                        React.createElement('p', {
                                            key: "day",
                                            className: "text-blue-900 font-black text-3xl"
                                        }, dateInfo.day),
                                        React.createElement('p', {
                                            key: "year",
                                            className: "text-blue-600 font-semibold text-sm"
                                        }, dateInfo.year)
                                    ]),
                                    React.createElement('div', {
                                        key: "event-details",
                                        className: "flex-1"
                                    }, [
                                        React.createElement('h3', {
                                            key: "event-title",
                                            className: "font-black text-2xl text-gray-800 mb-2"
                                        }, event.title),
                                        React.createElement('div', {
                                            key: "event-meta",
                                            className: "space-y-2 text-gray-600"
                                        }, [
                                            React.createElement('p', {
                                                key: "time",
                                                className: "flex items-center gap-2"
                                            }, [
                                                React.createElement('i', {
                                                    key: "time-icon",
                                                    className: "far fa-clock text-blue-600"
                                                }),
                                                React.createElement('span', {
                                                    key: "time-text",
                                                    className: "font-semibold"
                                                }, event.time),
                                                React.createElement('span', {
                                                    key: "weekday",
                                                    className: "text-sm"
                                                }, `• ${dateInfo.weekday}`)
                                            ]),
                                            React.createElement('p', {
                                                key: "location",
                                                className: "flex items-center gap-2"
                                            }, [
                                                React.createElement('i', {
                                                    key: "location-icon",
                                                    className: "fas fa-map-marker-alt text-green-600"
                                                }),
                                                React.createElement('span', {
                                                    key: "location-text",
                                                    className: "font-semibold"
                                                }, event.location)
                                            ])
                                        ])
                                    ]),
                                    event.attachment_url && React.createElement('div', {
                                        key: "attachment",
                                        className: "flex-shrink-0"
                                    }, React.createElement('a', {
                                        href: event.attachment_url,
                                        target: "_blank",
                                        rel: "noopener noreferrer",
                                        className: "modern-button px-4 py-2 text-sm rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-1"
                                    }, [
                                        React.createElement('i', {
                                            key: "attachment-icon",
                                            className: "fas fa-paperclip mr-2"
                                        }),
                                        "Download"
                                    ]))
                                ])
                            ]);
                        }))
                ]),

                // Past Events Section (if any)
                pastEvents.length > 0 && React.createElement('section', {
                    key: "past",
                    className: "space-y-6"
                }, [
                    React.createElement('div', {
                        key: "past-header",
                        className: "flex items-center gap-4"
                    }, [
                        React.createElement('div', {
                            key: "past-icon",
                            className: "bg-gradient-to-br from-gray-100 to-gray-200 p-4 rounded-2xl"
                        }, React.createElement('i', {
                            className: "fas fa-history text-gray-700 text-2xl"
                        })),
                        React.createElement('h2', {
                            key: "past-title",
                            className: "text-3xl font-black text-gray-800"
                        }, "Past Events"),
                        React.createElement('span', {
                            key: "past-count",
                            className: "bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-bold"
                        }, pastEvents.length)
                    ]),
                    React.createElement('div', {
                        key: "past-grid",
                        className: "grid gap-4"
                    }, pastEvents.slice(0, 5).map((event, index) => {
                        const dateInfo = formatDate(event.date);
                        return React.createElement('div', {
                            key: event.id || index,
                            className: "modern-card p-6 opacity-75 hover:opacity-90 transition-opacity duration-300"
                        }, React.createElement('div', {
                            className: "flex items-center gap-4"
                        }, [
                            React.createElement('div', {
                                key: "past-date",
                                className: "text-center bg-gray-100 p-3 rounded-xl min-w-[80px]"
                            }, [
                                React.createElement('p', {
                                    key: "past-month",
                                    className: "text-gray-600 font-bold text-sm"
                                }, dateInfo.month),
                                React.createElement('p', {
                                    key: "past-day",
                                    className: "text-gray-800 font-black text-xl"
                                }, dateInfo.day)
                            ]),
                            React.createElement('div', {
                                key: "past-details",
                                className: "flex-1"
                            }, [
                                React.createElement('h4', {
                                    key: "past-title",
                                    className: "font-bold text-lg text-gray-700"
                                }, event.title),
                                React.createElement('p', {
                                    key: "past-time",
                                    className: "text-gray-500 text-sm"
                                }, `${event.time} • ${event.location}`)
                            ])
                        ]));
                    }))
                ])
            ])
    ]);
};
