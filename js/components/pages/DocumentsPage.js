import { logAccess, supa } from '../../utils/supabase.js';

const { useState, useEffect } = React;

export const DocumentsPage = ({ theme, user, userRole, showNotification, onNavigate }) => {
    const [documents, setDocuments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('All');
    const [dateFilter, setDateFilter] = useState('');
    const [showDocForm, setShowDocForm] = useState(false);
    const [docForm, setDocForm] = useState({ name: '', category: '', file: null });
    const [isDocSaving, setIsDocSaving] = useState(false);

    const fetchDocuments = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supa(() => window.supabaseClient.from('documents').select('*'));
            if (error) {
                console.error("Error fetching documents:", error);
                showNotification("Error fetching documents.");
                setDocuments([]);
            } else {
                const items = Array.isArray(data) ? data : [];
                const sorted = items.sort((a, b) => {
                    const ad = new Date(a.lastUpdated || a.updated_at || a.created_at || 0).getTime();
                    const bd = new Date(b.lastUpdated || b.updated_at || b.created_at || 0).getTime();
                    return bd - ad;
                });
                setDocuments(sorted);
            }
        } catch (error) {
            console.error("Error:", error);
            setDocuments([]);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        fetchDocuments();
        const channel = window.supabaseClient
            .channel('documents-changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'documents' }, () => {
                fetchDocuments();
            })
            .subscribe();
        return () => {
            try { window.supabaseClient.removeChannel(channel); } catch (e) {}
        };
    }, []);

    const categories = ['All', ...new Set(documents.map(doc => doc.category))];
    const filteredDocuments = documents.filter(doc =>
        (filterCategory === 'All' || doc.category === filterCategory) &&
        (doc.name || doc.title || '').toLowerCase().includes(searchTerm.toLowerCase()) &&
        ((doc.lastUpdated || doc.updated_at || doc.created_at || '') + '').includes(dateFilter)
    );

    const handleDocumentAccess = (doc) => {
        if (user) {
            logAccess(user, doc.name);
        }
        window.open(doc.url || doc.file_url || '#', '_blank');
    };

    const handleDocInputChange = (e) => {
        const { name, value, files } = e.target;
        if (name === 'file') {
            setDocForm(prev => ({ ...prev, file: files && files[0] ? files[0] : null }));
        } else {
            setDocForm(prev => ({ ...prev, [name]: value }));
        }
    };

    const saveDocument = async () => {
        if (!docForm.name || !docForm.file) {
            showNotification('Please provide a name and select a file.');
            return;
        }
        setIsDocSaving(true);
        try {
            const bucket = 'hoa-documents';
            const unique = `${Date.now()}_${docForm.file.name}`;
            const { error: upErr } = await supa(() => window.supabaseClient.storage
                .from(bucket)
                .upload(unique, docForm.file, { upsert: true, contentType: docForm.file.type || 'application/octet-stream' }));
            if (upErr) throw upErr;
            const { data: pub } = window.supabaseClient.storage.from(bucket).getPublicUrl(unique);
            const url = pub?.publicUrl || '';
            const sizeLabel = `${docForm.file.size} bytes`;
            const ins = await supa(() => window.supabaseClient.from('documents').insert({
                name: docForm.name,
                category: docForm.category || null,
                url,
                size: sizeLabel,
                lastUpdated: new Date().toISOString()
            }));
            if (ins.error) throw ins.error;
            showNotification('Document added.');
            setShowDocForm(false);
            setDocForm({ name: '', category: '', file: null });
            fetchDocuments();
        } catch (e) {
            console.error('Add document error:', e);
            showNotification('Failed to add document.');
        } finally {
            setIsDocSaving(false);
        }
    };

    const deleteDocument = async (doc) => {
        try {
            const m = (doc.url || '').match(/\/object\/public\/([^/]+)\/(.+)$/);
            if (m) {
                try { await window.supabaseClient.storage.from(m[1]).remove([m[2]]); } catch (_) {}
            }
            const { error } = await supa(() => window.supabaseClient.from('documents').delete().eq('id', doc.id));
            if (error) throw error;
            showNotification('Document deleted.');
            fetchDocuments();
        } catch (e) {
            console.error('Delete document error:', e);
            showNotification('Failed to delete document.');
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
                }, "Document Repository"),
                React.createElement('p', {
                    key: "subtitle",
                    className: "text-xl text-gray-600"
                }, "Access community documents, bylaws, and records")
            ]),
            React.createElement('div', { key: 'header-actions', className: 'flex items-center gap-3' }, [
                React.createElement('button', {
                    key: "back-btn",
                    onClick: () => onNavigate('dashboard'),
                    className: "modern-button px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                }, [
                    React.createElement('i', { key: "icon", className: "fas fa-arrow-left mr-2" }),
                    "Back to Dashboard"
                ]),
                React.createElement('button', {
                    key: 'refresh-btn',
                    onClick: fetchDocuments,
                    className: 'bg-gray-200 text-gray-800 font-bold py-3 px-4 rounded-xl hover:bg-gray-300 transition-all duration-300'
                }, [
                    React.createElement('i', { key: 'ri', className: 'fas fa-sync mr-2' }),
                    'Refresh'
                ]),
                userRole === 'admin' && React.createElement('button', { key: 'add-doc-btn', onClick: () => setShowDocForm(v => !v), className: 'bg-green-600 text-white font-bold py-3 px-4 rounded-xl hover:bg-green-700 transition-all duration-300' }, [
                    React.createElement('i', { key: 'ai', className: 'fas fa-file-upload mr-2' }),
                    showDocForm ? 'Close' : 'Add Document'
                ])
            ])
        ]),
        
        userRole === 'admin' && showDocForm && React.createElement('div', { key: 'doc-form', className: 'modern-card p-8 mb-8' }, [
            React.createElement('div', { key: 'grid', className: 'grid md:grid-cols-3 gap-6' }, [
                React.createElement('div', { key: 'name-field', className: 'space-y-2' }, [
                    React.createElement('label', { key: 'name-label', className: 'block text-sm font-bold text-gray-700' }, 'Document Name'),
                    React.createElement('input', { key: 'name-input', type: 'text', name: 'name', value: docForm.name, onChange: handleDocInputChange, className: 'modern-input w-full' })
                ]),
                React.createElement('div', { key: 'category-field', className: 'space-y-2' }, [
                    React.createElement('label', { key: 'cat-label', className: 'block text-sm font-bold text-gray-700' }, 'Category'),
                    React.createElement('input', { key: 'cat-input', type: 'text', name: 'category', value: docForm.category, onChange: handleDocInputChange, className: 'modern-input w-full' })
                ]),
                React.createElement('div', { key: 'file-field', className: 'space-y-2' }, [
                    React.createElement('label', { key: 'file-label', className: 'block text-sm font-bold text-gray-700' }, 'File'),
                    React.createElement('input', { key: 'file-input', type: 'file', name: 'file', accept: '.pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg', onChange: handleDocInputChange, className: 'modern-input w-full' })
                ])
            ]),
            React.createElement('div', { key: 'doc-actions', className: 'mt-6 flex items-center gap-4' }, [
                React.createElement('button', { key: 'save-doc', onClick: saveDocument, disabled: isDocSaving, className: 'modern-button px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 disabled:opacity-50' }, isDocSaving ? 'Saving...' : 'Save Document'),
                React.createElement('button', { key: 'cancel-doc', onClick: () => setShowDocForm(false), className: 'bg-gray-200 text-gray-800 font-bold py-3 px-6 rounded-xl hover:bg-gray-300 transition-all duration-300' }, 'Cancel')
            ])
        ]),

        React.createElement('div', {
            key: "search-section",
            className: "modern-card p-8 mb-8"
        }, [
            React.createElement('div', {
                key: "search-grid",
                className: "grid md:grid-cols-3 gap-6"
            }, [
                React.createElement('div', {
                    key: "search-input",
                    className: "relative"
                }, [
                    React.createElement('i', {
                        key: "search-icon",
                        className: "fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    }),
                    React.createElement('input', {
                        key: "search",
                        type: "text",
                        placeholder: "Search documents...",
                        value: searchTerm,
                        onChange: e => setSearchTerm(e.target.value),
                        className: "modern-input w-full pl-12 pr-4 py-3"
                    })
                ]),
                React.createElement('div', {
                    key: "date-input",
                    className: "relative"
                }, [
                    React.createElement('i', {
                        key: "date-icon",
                        className: "fas fa-calendar-alt absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    }),
                    React.createElement('input', {
                        key: "date",
                        type: "text",
                        placeholder: "Filter by date (YYYY-MM-DD)",
                        value: dateFilter,
                        onChange: e => setDateFilter(e.target.value),
                        className: "modern-input w-full pl-12 pr-4 py-3"
                    })
                ]),
                React.createElement('div', {
                    key: "category-select",
                    className: "relative"
                }, [
                    React.createElement('i', {
                        key: "filter-icon",
                        className: "fas fa-filter absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    }),
                    React.createElement('select', {
                        key: "category",
                        value: filterCategory,
                        onChange: e => setFilterCategory(e.target.value),
                        className: "modern-input w-full pl-12 pr-4 py-3 appearance-none cursor-pointer"
                    }, [
                        React.createElement('option', { key: "all", value: "All" }, "All Categories"),
                        ...categories.filter((v,i,a) => a.indexOf(v)===i && v !== 'All').map(cat => 
                            React.createElement('option', { key: cat, value: cat }, cat)
                        )
                    ]),
                    React.createElement('i', {
                        key: "chevron",
                        className: "fas fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                    })
                ])
            ])
        ]),

        React.createElement('div', {
            key: "documents-section",
            className: "modern-card overflow-hidden"
        }, [
            isLoading ? 
                React.createElement('div', {
                    key: "loading",
                    className: "flex justify-center items-center py-16"
                }, React.createElement('div', {
                    className: "loader"
                })) :
                filteredDocuments.length === 0 ?
                    React.createElement('div', {
                        key: "empty",
                        className: "text-center py-16"
                    }, [
                        React.createElement('i', {
                            key: "empty-icon",
                            className: "fas fa-folder-open text-6xl text-gray-300 mb-4"
                        }),
                        React.createElement('h3', {
                            key: "empty-title",
                            className: "text-2xl font-bold text-gray-500 mb-2"
                        }, "No Documents Found"),
                        React.createElement('p', {
                            key: "empty-desc",
                            className: "text-gray-400"
                        }, "Try adjusting your search criteria")
                    ]) :
                    React.createElement('div', {
                        key: "table",
                        className: "overflow-x-auto"
                    }, React.createElement('table', {
                        className: "min-w-full divide-y divide-gray-200"
                    }, [
                        React.createElement('thead', {
                            key: "head",
                            className: "bg-gradient-to-r from-gray-50 to-gray-100"
                        }, React.createElement('tr', {}, [
                            React.createElement('th', {
                                key: "name-header",
                                className: "px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider"
                            }, "Document"),
                            React.createElement('th', {
                                key: "category-header",
                                className: "px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider"
                            }, "Category"),
                            React.createElement('th', {
                                key: "updated-header",
                                className: "px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider"
                            }, "Last Updated"),
                            React.createElement('th', {
                                key: "actions-header",
                                className: "px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider"
                            }, "Actions")
                        ])),
                        React.createElement('tbody', {
                            key: "body",
                            className: "bg-white divide-y divide-gray-200"
                        }, filteredDocuments.map((doc, index) =>
                            React.createElement('tr', {
                                key: doc.id || index,
                                className: "hover:bg-gray-50 transition-colors duration-200"
                            }, [
                                React.createElement('td', {
                                    key: "name",
                                    className: "px-6 py-4"
                                }, [
                                    React.createElement('div', {
                                        key: "name-content",
                                        className: "text-sm font-semibold text-gray-900"
                                    }, doc.name || doc.title),
                                    React.createElement('div', {
                                        key: "size",
                                        className: "text-sm text-gray-500"
                                    }, doc.size || '')
                                ]),
                                React.createElement('td', {
                                    key: "category",
                                    className: "px-6 py-4"
                                }, React.createElement('span', {
                                    className: `px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                        doc.category?.includes('Gov') ? 'bg-blue-100 text-blue-800' : 
                                        doc.category?.includes('Finan') ? 'bg-green-100 text-green-800' : 
                                        'bg-purple-100 text-purple-800'
                                    }`
                                }, doc.category)),
                                React.createElement('td', {
                                    key: "date",
                                    className: "px-6 py-4 text-sm text-gray-500"
                                }, (doc.lastUpdated || doc.updated_at || doc.created_at) ? new Date(doc.lastUpdated || doc.updated_at || doc.created_at).toLocaleDateString() : 'N/A'),
                                React.createElement('td', {
                                    key: "actions",
                                    className: "px-6 py-4"
                                }, React.createElement('div', { className: 'flex items-center gap-3' }, [
                                    React.createElement('button', {
                                        key: 'dl',
                                        onClick: () => handleDocumentAccess(doc),
                                        className: "text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-2 hover:gap-3 transition-all duration-200",
                                        title: "Download"
                                    }, [
                                        React.createElement('i', { key: "download-icon", className: "fas fa-download" }),
                                        "Download"
                                    ]),
                                    userRole === 'admin' && React.createElement('button', { key: 'del', onClick: () => deleteDocument(doc), className: 'bg-red-50 text-red-700 font-semibold px-3 py-2 rounded-lg hover:bg-red-100 transition-colors duration-200' }, [React.createElement('i', { key: 'i', className: 'fas fa-trash mr-1' }), 'Delete'])
                                ]))
                            ])
                        ))
                    ]))
        ])
    ]);
};
