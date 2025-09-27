const { useState, useEffect } = React;
import { supa } from '../../utils/supabase.js';
import { ConfirmationModal } from '../ui/ConfirmationModal.js';

export const CalendarPage = ({ theme, userRole, showNotification, onNavigate }) => {
    const [events, setEvents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showEventForm, setShowEventForm] = useState(false);
    const [isEventSaving, setIsEventSaving] = useState(false);
    const [eventForm, setEventForm] = useState({ title: '', date: '', time: '', location: '', attachment: null });
    const [editingEvent, setEditingEvent] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteCandidate, setDeleteCandidate] = useState(null);

    const fetchEvents = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supa(() => window.supabaseClient.from('events').select('*'));
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

    const handleEventInputChange = (e) => {
        const { name, value, files } = e.target;
        if (name === 'attachment') {
            setEventForm(prev => ({ ...prev, attachment: files && files[0] ? files[0] : null }));
        } else {
            setEventForm(prev => ({ ...prev, [name]: value }));
        }
    };

    const startEditEvent = (ev) => {
        setEditingEvent(ev);
        setEventForm({
            title: ev.title || '',
            date: ev.date || '',
            time: ev.time || '',
            location: ev.location || '',
            attachment: null
        });
        setShowEventForm(true);
    };

    const resetForm = () => {
        setEventForm({ title: '', date: '', time: '', location: '', attachment: null });
        setEditingEvent(null);
    };

    const saveEvent = async () => {
        if (!eventForm.title || !eventForm.date) {
            showNotification('Please provide a title and date.');
            return;
        }
        setIsEventSaving(true);
        try {
            let attachment_url = null;
            if (eventForm.attachment) {
                const bucket = 'event-attachments';
                const unique = `${Date.now()}_${eventForm.attachment.name}`;
                const { error: upErr } = await supa(() => window.supabaseClient.storage
                    .from(bucket)
                    .upload(unique, eventForm.attachment, { upsert: true, contentType: eventForm.attachment.type || 'application/octet-stream' }));
                if (upErr) throw upErr;
                const { data: pub } = window.supabaseClient.storage.from(bucket).getPublicUrl(unique);
                attachment_url = pub?.publicUrl || null;
            }

            if (editingEvent && editingEvent.id) {
                if (attachment_url && editingEvent.attachment_url) {
                    const m = (editingEvent.attachment_url || '').match(/\/object\/public\/([^/]+)\/(.+)$/);
                    if (m) {
                        try { await window.supabaseClient.storage.from(m[1]).remove([m[2]]); } catch (_) {}
                    }
                }
                const updPayload = {
                    title: eventForm.title,
                    date: eventForm.date,
                    time: eventForm.time || null,
                    location: eventForm.location || null
                };
                if (attachment_url) updPayload.attachment_url = attachment_url;
                const upd = await supa(() => window.supabaseClient.from('events').update(updPayload).eq('id', editingEvent.id));
                if (upd.error) throw upd.error;
                showNotification('Event updated.');
            } else {
                const ins = await supa(() => window.supabaseClient.from('events').insert({
                    title: eventForm.title,
                    date: eventForm.date,
                    time: eventForm.time || null,
                    location: eventForm.location || null,
                    attachment_url
                }));
                if (ins.error) throw ins.error;
                showNotification('Event added.');
            }
            setShowEventForm(false);
            resetForm();
            fetchEvents();
        } catch (e) {
            console.error('Add event error:', e);
            showNotification('Failed to add event.');
        } finally {
            setIsEventSaving(false);
        }
    };

    const deleteEvent = async (eventRow) => {
        try {
            const m = (eventRow.attachment_url || '').match(/\/object\/public\/([^/]+)\/(.+)$/);
            if (m) {
                try { await window.supabaseClient.storage.from(m[1]).remove([m[2]]); } catch (_) {}
            }
            const { error } = await supa(() => window.supabaseClient.from('events').delete().eq('id', eventRow.id));
            if (error) throw error;
            showNotification('Event deleted.');
            fetchEvents();
        } catch (e) {
            console.error('Delete event error:', e);
            showNotification('Failed to delete event.');
        }
    };

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
                    React.createElement('i', { key: "icon", className: "fas fa-arrow-left mr-2" }),
                    React.createElement('span', { key: 'label' }, 'Back to Dashboard')
                ]),
                React.createElement('button', {
                    key: 'refresh-btn',
                    onClick: fetchEvents,
                    className: 'bg-gray-200 text-gray-800 font-bold py-3 px-4 rounded-xl hover:bg-gray-300 transition-all duration-300'
                }, [
                    React.createElement('i', { key: 'ri', className: 'fas fa-sync mr-2' }),
                    React.createElement('span', { key: 'label' }, 'Refresh')
                ]),
                userRole === 'admin' && React.createElement('button', { key: 'add-event-btn', onClick: () => { if (showEventForm) { setShowEventForm(false); resetForm(); } else { setShowEventForm(true); } }, className: 'bg-green-600 text-white font-bold py-3 px-4 rounded-xl hover:bg-green-700 transition-all duration-300' }, [
                    React.createElement('i', { key: 'ai', className: 'fas fa-calendar-plus mr-2' }),
                    showEventForm ? 'Close' : 'Add Event'
                ])
            ])
        ]),

        userRole === 'admin' && showEventForm && React.createElement('div', { key: 'event-form', className: 'modern-card p-8 mb-8' }, [
            React.createElement('div', { key: 'grid', className: 'grid md:grid-cols-2 gap-6' }, [
                React.createElement('div', { key: 'title', className: 'space-y-2' }, [
                    React.createElement('label', { key: 'tl', className: 'block text-sm font-bold text-gray-700' }, 'Title'),
                    React.createElement('input', { key: 'ti', type: 'text', name: 'title', value: eventForm.title, onChange: handleEventInputChange, className: 'modern-input w-full' })
                ]),
                React.createElement('div', { key: 'date', className: 'space-y-2' }, [
                    React.createElement('label', { key: 'dl', className: 'block text-sm font-bold text-gray-700' }, 'Date'),
                    React.createElement('input', { key: 'di', type: 'date', name: 'date', value: eventForm.date, onChange: handleEventInputChange, className: 'modern-input w-full' })
                ]),
                React.createElement('div', { key: 'time', className: 'space-y-2' }, [
                    React.createElement('label', { key: 'tlb', className: 'block text-sm font-bold text-gray-700' }, 'Time'),
                    React.createElement('input', { key: 'tib', type: 'text', name: 'time', value: eventForm.time, onChange: handleEventInputChange, className: 'modern-input w-full', placeholder: 'e.g., 7:00 PM' })
                ]),
                React.createElement('div', { key: 'location', className: 'space-y-2' }, [
                    React.createElement('label', { key: 'll', className: 'block text-sm font-bold text-gray-700' }, 'Location'),
                    React.createElement('input', { key: 'li', type: 'text', name: 'location', value: eventForm.location, onChange: handleEventInputChange, className: 'modern-input w-full' })
                ]),
                React.createElement('div', { key: 'attach', className: 'space-y-2 md:col-span-2' }, [
                    React.createElement('label', { key: 'al', className: 'block text-sm font-bold text-gray-700' }, 'Attachment (optional)'),
                    React.createElement('input', { key: 'ai', type: 'file', name: 'attachment', accept: '.pdf,.png,.jpg,.jpeg', onChange: handleEventInputChange, className: 'modern-input w-full' })
                ])
            ]),
            React.createElement('div', { key: 'actions', className: 'mt-6 flex items-center gap-4' }, [
                React.createElement('button', { key: 'save', onClick: saveEvent, disabled: isEventSaving, className: 'modern-button px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 disabled:opacity-50' }, isEventSaving ? 'Saving...' : (editingEvent ? 'Update Event' : 'Save Event')),
                React.createElement('button', { key: 'cancel', onClick: () => { setShowEventForm(false); resetForm(); }, className: 'bg-gray-200 text-gray-800 font-bold py-3 px-6 rounded-xl hover:bg-gray-300 transition-all duration-300' }, 'Cancel')
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
                                        React.createElement('i', { key: "attachment-icon", className: "fas fa-paperclip mr-2" }),
                                        React.createElement('span', { key: 'label' }, 'Download')
                                    ]))
                                ]),
                                userRole === 'admin' && React.createElement('div', { key: 'admin-actions', className: 'mt-4 flex items-center gap-3' }, [
                                    React.createElement('button', { key: 'edit', onClick: () => startEditEvent(event), className: 'bg-blue-50 text-blue-700 font-semibold px-3 py-2 rounded-lg hover:bg-blue-100 transition-colors duration-200' }, [React.createElement('i', { key: 'ei', className: 'fas fa-edit mr-1' }), 'Modify']),
                                    React.createElement('button', { key: 'del', onClick: () => { setDeleteCandidate(event); setShowDeleteConfirm(true); }, className: 'bg-red-50 text-red-700 font-semibold px-3 py-2 rounded-lg hover:bg-red-100 transition-colors duration-200' }, [React.createElement('i', { key: 'di', className: 'fas fa-trash mr-1' }), 'Delete'])
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
                        }, [
                            React.createElement('div', {
                                key: 'past-row-content',
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
                            ]),
                            userRole === 'admin' && React.createElement('div', { key: 'padmin', className: 'mt-2 flex items-center gap-3' }, [
                                React.createElement('button', { key: 'pedit', onClick: () => startEditEvent(event), className: 'bg-blue-50 text-blue-700 font-semibold px-3 py-2 rounded-lg hover:bg-blue-100 transition-colors duration-200' }, [React.createElement('i', { key: 'pei', className: 'fas fa-edit mr-1' }), 'Modify']),
                                React.createElement('button', { key: 'pdel', onClick: () => deleteEvent(event), className: 'bg-red-50 text-red-700 font-semibold px-3 py-2 rounded-lg hover:bg-red-100 transition-colors duration-200' }, [React.createElement('i', { key: 'pdi', className: 'fas fa-trash mr-1' }), 'Delete'])
                            ])
                        ]);
                    }))
                ])
            ]),
        showDeleteConfirm && React.createElement(ConfirmationModal, {
            key: 'confirm-delete-event',
            theme: theme,
            title: 'Delete Event',
            message: 'Are you sure you want to delete this event? This action cannot be undone.',
            confirmLabel: 'Delete',
            cancelLabel: 'Cancel',
            onConfirm: async () => { const target = deleteCandidate; setShowDeleteConfirm(false); setDeleteCandidate(null); if (target) await deleteEvent(target); },
            onCancel: () => { setShowDeleteConfirm(false); setDeleteCandidate(null); }
        })
    ]);
};
