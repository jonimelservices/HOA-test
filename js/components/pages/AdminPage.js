import { themeClasses } from '../../utils/themes.js';

const { useState, useEffect } = React;

export const AdminPage = ({ config, setConfig, theme, themeName, setThemeName, showNotification, onNavigate }) => {
    const [localConfig, setLocalConfig] = useState(config || {});
    const [localThemeName, setLocalThemeName] = useState(themeName || 'blue');
    const [activeTab, setActiveTab] = useState('general');
    const [userRows, setUserRows] = useState([]);
    const [isUsersLoading, setIsUsersLoading] = useState(false);
    const [showUserForm, setShowUserForm] = useState(false);
    const [editingUserId, setEditingUserId] = useState(null);
    const [userForm, setUserForm] = useState({ id: '', first_name: '', last_name: '', address: '', phone: '', email: '', role: 'member' });

    const handleConfigChange = (e) => {
        const { name, value } = e.target;
        setLocalConfig(prev => ({ ...prev, [name]: value }));
    };
    
    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setLocalConfig(prev => ({ ...prev, heroImageUrl: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleContactChange = (e) => {
        const { name, value } = e.target;
        setLocalConfig(prev => ({ 
            ...prev, 
            contactInfo: { ...prev.contactInfo, [name]: value } 
        }));
    };

    const handleBoardChange = (index, e) => {
        const { name, value } = e.target;
        const updatedBoard = [...(localConfig.boardMembers || [])];
        updatedBoard[index] = { ...updatedBoard[index], [name]: value };
        setLocalConfig(prev => ({ ...prev, boardMembers: updatedBoard }));
    };

    const addBoardMember = () => {
        setLocalConfig(prev => ({ 
            ...prev, 
            boardMembers: [...(prev.boardMembers || []), { title: '', name: '' }] 
        }));
    };

    const removeBoardMember = (index) => {
        setLocalConfig(prev => ({ 
            ...prev, 
            boardMembers: (prev.boardMembers || []).filter((_, i) => i !== index) 
        }));
    };

    const handleSave = async () => {
        try {
            const { error } = await window.supabaseClient
                .from('configuration')
                .upsert({ 
                    id: 1,
                    hoaName: localConfig.hoaName,
                    heroImageUrl: localConfig.heroImageUrl,
                    managementCompanyInfo: localConfig.managementCompanyInfo,
                    contactInfo: localConfig.contactInfo,
                    boardMembers: localConfig.boardMembers,
                    themeName: localThemeName
                 }, { onConflict: 'id' });

            if (error) {
                showNotification("Error saving settings: " + error.message);
            } else {
                setConfig(localConfig);
                setThemeName(localThemeName);
                showNotification("Admin settings saved successfully!");
            }
        } catch (error) {
            showNotification("Error saving settings.");
        }
    };

    const handleReset = () => {
        setLocalConfig(config);
        setLocalThemeName(themeName);
        showNotification("Changes have been discarded.");
    };

    const TabButton = ({ tabName, label, icon }) => 
        React.createElement('button', {
            onClick: () => setActiveTab(tabName),
            className: `flex items-center gap-3 px-6 py-4 text-lg font-semibold rounded-2xl transition-all duration-300 ${
                activeTab === tabName 
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg' 
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
            }`
        }, [
            React.createElement('i', {
                key: "icon",
                className: `fas ${icon}`
            }),
            label
        ]);

    const fetchReadOnlyUsers = async () => {
        setIsUsersLoading(true);
        try {
            const { data, error } = await window.supabaseClient
                .from('users')
                .select('id, email, role, full_name, first_name, last_name, address, phone')
                .neq('role', 'admin');
            if (error) {
                console.error('Error loading users:', error);
                setUserRows([]);
                showNotification('Could not load users. Check RLS/policies.');
            } else {
                const rows = (data || []).map(u => ({
                    id: u.id,
                    email: u.email || '',
                    role: u.role || 'member',
                    first_name: u.first_name || (u.full_name ? (u.full_name.split(' ')[0] || '') : ''),
                    last_name: u.last_name || (u.full_name ? (u.full_name.split(' ').slice(1).join(' ') || '') : ''),
                    address: u.address || '',
                    phone: u.phone || ''
                }));
                setUserRows(rows);
            }
        } catch (e) {
            console.error(e);
            setUserRows([]);
        }
        setIsUsersLoading(false);
    };

    useEffect(() => {
        if (activeTab === 'user') fetchReadOnlyUsers();
    }, [activeTab]);

    const openAddUser = () => {
        setEditingUserId(null);
        setUserForm({ id: '', first_name: '', last_name: '', address: '', phone: '', email: '', role: 'member' });
        setShowUserForm(true);
    };

    const openEditUser = (row) => {
        setEditingUserId(row.id);
        setUserForm({ id: row.id, first_name: row.first_name, last_name: row.last_name, address: row.address, phone: row.phone, email: row.email, role: row.role || 'member' });
        setShowUserForm(true);
    };

    const handleUserFormChange = (e) => {
        const { name, value } = e.target;
        setUserForm(prev => ({ ...prev, [name]: value }));
    };

    const saveUser = async () => {
        const payload = {
            email: userForm.email || null,
            full_name: `${userForm.first_name || ''} ${userForm.last_name || ''}`.trim() || null,
            first_name: userForm.first_name || null,
            last_name: userForm.last_name || null,
            address: userForm.address || null,
            phone: userForm.phone || null,
            role: userForm.role || 'member'
        };
        try {
            if (editingUserId) {
                const { error } = await window.supabaseClient.from('users').update(payload).eq('id', editingUserId);
                if (error) throw error;
                showNotification('User updated.');
            } else {
                if (!userForm.id) {
                    showNotification('User ID is required. Create user in Auth first, then paste their UUID here.');
                    return;
                }
                const insertPayload = { id: userForm.id, ...payload };
                const { error } = await window.supabaseClient.from('users').insert(insertPayload);
                if (error) throw error;
                showNotification('User added.');
            }
            setShowUserForm(false);
            fetchReadOnlyUsers();
        } catch (err) {
            console.error('Save user error:', err);
            showNotification('Failed to save user. Ensure columns/policies exist.');
        }
    };

    const deleteUser = async (row) => {
        try {
            const { error } = await window.supabaseClient.from('users').delete().eq('id', row.id);
            if (error) throw error;
            showNotification('User removed from profiles.');
            fetchReadOnlyUsers();
        } catch (err) {
            console.error('Delete user error:', err);
            showNotification('Failed to delete user.');
        }
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 'general':
                return React.createElement('div', {
                    className: "space-y-8"
                }, [
                    React.createElement('div', {
                        key: "hoa-name",
                        className: "space-y-3"
                    }, [
                        React.createElement('label', {
                            key: "name-label",
                            className: "block text-lg font-bold text-gray-700"
                        }, "HOA Name"),
                        React.createElement('input', {
                            key: "name-input",
                            type: "text",
                            name: "hoaName",
                            value: localConfig.hoaName || '',
                            onChange: handleConfigChange,
                            className: "modern-input w-full text-lg",
                            placeholder: "Enter HOA name"
                        })
                    ]),
                    React.createElement('div', {
                        key: "hero-image",
                        className: "space-y-3"
                    }, [
                        React.createElement('label', {
                            key: "image-label",
                            className: "block text-lg font-bold text-gray-700"
                        }, "Hero Background Image"),
                        React.createElement('div', {
                            key: "image-upload",
                            className: "modern-card p-6"
                        }, [
                            localConfig.heroImageUrl && React.createElement('img', {
                                key: "preview",
                                src: localConfig.heroImageUrl,
                                alt: "Hero preview",
                                className: "w-full h-48 object-cover rounded-xl mb-4"
                            }),
                            React.createElement('input', {
                                key: "file-input",
                                type: "file",
                                accept: "image/jpeg, image/png",
                                onChange: handleImageUpload,
                                className: "modern-input w-full text-lg"
                            })
                        ])
                    ])
                ]);

            case 'content':
                return React.createElement('div', {
                    className: "space-y-8"
                }, [
                    React.createElement('div', {
                        key: "management-info",
                        className: "space-y-3"
                    }, [
                        React.createElement('label', {
                            key: "mgmt-label",
                            className: "block text-lg font-bold text-gray-700"
                        }, "Management Company Information"),
                        React.createElement('textarea', {
                            key: "mgmt-textarea",
                            name: "managementCompanyInfo",
                            value: localConfig.managementCompanyInfo || '',
                            onChange: handleConfigChange,
                            rows: "6",
                            className: "modern-input w-full text-lg resize-none",
                            placeholder: "Enter management company information"
                        })
                    ]),
                    React.createElement('div', {
                        key: "contact-section",
                        className: "space-y-6"
                    }, [
                        React.createElement('h3', {
                            key: "contact-title",
                            className: "text-2xl font-black text-gray-800"
                        }, "Contact Information"),
                        React.createElement('div', {
                            key: "contact-grid",
                            className: "grid md:grid-cols-2 gap-6"
                        }, [
                            React.createElement('div', {
                                key: "manager-field",
                                className: "space-y-3"
                            }, [
                                React.createElement('label', {
                                    key: "manager-label",
                                    className: "block text-sm font-bold text-gray-700"
                                }, "Property Manager"),
                                React.createElement('input', {
                                    key: "manager-input",
                                    type: "text",
                                    name: "propertyManager",
                                    value: localConfig.contactInfo?.propertyManager || '',
                                    onChange: handleContactChange,
                                    className: "modern-input w-full"
                                })
                            ]),
                            React.createElement('div', {
                                key: "email-field",
                                className: "space-y-3"
                            }, [
                                React.createElement('label', {
                                    key: "email-label",
                                    className: "block text-sm font-bold text-gray-700"
                                }, "Contact Email"),
                                React.createElement('input', {
                                    key: "email-input",
                                    type: "email",
                                    name: "email",
                                    value: localConfig.contactInfo?.email || '',
                                    onChange: handleContactChange,
                                    className: "modern-input w-full"
                                })
                            ]),
                            React.createElement('div', {
                                key: "phone-field",
                                className: "space-y-3"
                            }, [
                                React.createElement('label', {
                                    key: "phone-label",
                                    className: "block text-sm font-bold text-gray-700"
                                }, "Contact Phone"),
                                React.createElement('input', {
                                    key: "phone-input",
                                    type: "tel",
                                    name: "phone",
                                    value: localConfig.contactInfo?.phone || '',
                                    onChange: handleContactChange,
                                    className: "modern-input w-full"
                                })
                            ]),
                            React.createElement('div', {
                                key: "address-field",
                                className: "space-y-3"
                            }, [
                                React.createElement('label', {
                                    key: "address-label",
                                    className: "block text-sm font-bold text-gray-700"
                                }, "Address"),
                                React.createElement('input', {
                                    key: "address-input",
                                    type: "text",
                                    name: "address",
                                    value: localConfig.contactInfo?.address || '',
                                    onChange: handleContactChange,
                                    className: "modern-input w-full"
                                })
                            ])
                        ])
                    ])
                ]);

            case 'theme':
                return React.createElement('div', {
                    className: "space-y-8"
                }, [
                    React.createElement('div', {
                        key: "theme-header",
                        className: "text-center"
                    }, [
                        React.createElement('h3', {
                            key: "theme-title",
                            className: "text-2xl font-black text-gray-800 mb-4"
                        }, "Choose Your Theme"),
                        React.createElement('p', {
                            key: "theme-desc",
                            className: "text-gray-600 text-lg"
                        }, "Select a color scheme that represents your community")
                    ]),
                    React.createElement('div', {
                        key: "theme-grid",
                        className: "grid md:grid-cols-2 lg:grid-cols-3 gap-6"
                    }, Object.keys(themeClasses).filter(key => themeClasses[key].name).map(key => 
                        React.createElement('div', {
                            key: key,
                            onClick: () => setLocalThemeName(key),
                            className: `modern-card p-6 cursor-pointer transition-all duration-300 ${
                                localThemeName === key 
                                    ? 'ring-4 ring-blue-500 scale-105 shadow-xl' 
                                    : 'hover:scale-102 hover:shadow-lg'
                            }`
                        }, [
                            React.createElement('div', {
                                key: "theme-preview",
                                className: `${themeClasses[key].gradient} h-24 rounded-xl mb-4`
                            }),
                            React.createElement('h4', {
                                key: "theme-name",
                                className: "text-xl font-bold text-gray-800 text-center"
                            }, themeClasses[key].name)
                        ])
                    ))
                ]);

            case 'user':
                return React.createElement('div', { className: "space-y-8" }, [
                    React.createElement('div', { key: 'user-header', className: 'flex items-center justify-between' }, [
                        React.createElement('div', { key: 'titles' }, [
                            React.createElement('h3', { key: 'title', className: 'text-2xl font-black text-gray-800 mb-1' }, 'Read-only Users'),
                            React.createElement('p', { key: 'desc', className: 'text-gray-600' }, 'Manage users with view-only access. Add by linking an Auth user ID.')
                        ]),
                        React.createElement('button', { key: 'add-btn', onClick: openAddUser, className: 'modern-button px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1' }, [
                            React.createElement('i', { key: 'icon', className: 'fas fa-user-plus mr-2' }),
                            'Add Read-only User'
                        ])
                    ]),

                    React.createElement('div', { key: 'list-card', className: 'modern-card overflow-hidden' }, [
                        isUsersLoading ? React.createElement('div', { key: 'loading', className: 'flex justify-center items-center py-12' }, React.createElement('div', { className: 'loader' })) :
                        React.createElement('div', { key: 'table-wrap', className: 'overflow-x-auto' }, React.createElement('table', { className: 'min-w-full divide-y divide-gray-200' }, [
                            React.createElement('thead', { key: 'head', className: 'bg-gradient-to-r from-gray-50 to-gray-100' }, React.createElement('tr', {}, [
                                React.createElement('th', { key: 'name', className: 'px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider' }, 'Name / Last Name'),
                                React.createElement('th', { key: 'address', className: 'px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider' }, 'Address'),
                                React.createElement('th', { key: 'phone', className: 'px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider' }, 'Phone'),
                                React.createElement('th', { key: 'email', className: 'px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider' }, 'Email'),
                                React.createElement('th', { key: 'actions', className: 'px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider' }, 'Actions')
                            ])),
                            React.createElement('tbody', { key: 'body', className: 'bg-white divide-y divide-gray-200' },
                                userRows.map((row, idx) => React.createElement('tr', { key: row.id || idx, className: 'hover:bg-gray-50 transition-colors duration-200' }, [
                                    React.createElement('td', { key: 'name', className: 'px-6 py-4' }, React.createElement('div', { className: 'text-sm font-semibold text-gray-900' }, `${row.first_name || ''} ${row.last_name || ''}`.trim() || '—')),
                                    React.createElement('td', { key: 'address', className: 'px-6 py-4 text-sm text-gray-600' }, row.address || '—'),
                                    React.createElement('td', { key: 'phone', className: 'px-6 py-4 text-sm text-gray-600' }, row.phone || '—'),
                                    React.createElement('td', { key: 'email', className: 'px-6 py-4 text-sm text-gray-600' }, row.email || '—'),
                                    React.createElement('td', { key: 'act', className: 'px-6 py-4' }, React.createElement('div', { className: 'flex items-center gap-3' }, [
                                        React.createElement('button', { key: 'edit', onClick: () => openEditUser(row), className: 'bg-blue-50 text-blue-700 font-semibold px-3 py-2 rounded-lg hover:bg-blue-100 transition-colors duration-200' }, [React.createElement('i', { key: 'i', className: 'fas fa-edit mr-1' }), 'Modify']),
                                        React.createElement('button', { key: 'del', onClick: () => deleteUser(row), className: 'bg-red-50 text-red-700 font-semibold px-3 py-2 rounded-lg hover:bg-red-100 transition-colors duration-200' }, [React.createElement('i', { key: 'i', className: 'fas fa-trash mr-1' }), 'Delete'])
                                    ]))
                                ]))
                            )
                        ]))
                    ]),

                    showUserForm && React.createElement('div', { key: 'form', className: 'modern-card p-8' }, [
                        React.createElement('div', { key: 'grid', className: 'grid md:grid-cols-2 gap-6' }, [
                            !editingUserId && React.createElement('div', { key: 'id-field', className: 'space-y-2 md:col-span-2' }, [
                                React.createElement('label', { key: 'id-label', className: 'block text-sm font-bold text-gray-700' }, 'Auth User ID (UUID)'),
                                React.createElement('input', { key: 'id-input', type: 'text', name: 'id', value: userForm.id, onChange: handleUserFormChange, className: 'modern-input w-full', placeholder: 'Paste user UUID from Authentication > Users' })
                            ]),
                            React.createElement('div', { key: 'first', className: 'space-y-2' }, [
                                React.createElement('label', { key: 'first-label', className: 'block text-sm font-bold text-gray-700' }, 'First Name'),
                                React.createElement('input', { key: 'first-input', type: 'text', name: 'first_name', value: userForm.first_name, onChange: handleUserFormChange, className: 'modern-input w-full' })
                            ]),
                            React.createElement('div', { key: 'last', className: 'space-y-2' }, [
                                React.createElement('label', { key: 'last-label', className: 'block text-sm font-bold text-gray-700' }, 'Last Name'),
                                React.createElement('input', { key: 'last-input', type: 'text', name: 'last_name', value: userForm.last_name, onChange: handleUserFormChange, className: 'modern-input w-full' })
                            ]),
                            React.createElement('div', { key: 'address', className: 'space-y-2 md:col-span-2' }, [
                                React.createElement('label', { key: 'address-label', className: 'block text-sm font-bold text-gray-700' }, 'Address'),
                                React.createElement('input', { key: 'address-input', type: 'text', name: 'address', value: userForm.address, onChange: handleUserFormChange, className: 'modern-input w-full' })
                            ]),
                            React.createElement('div', { key: 'phone', className: 'space-y-2' }, [
                                React.createElement('label', { key: 'phone-label', className: 'block text-sm font-bold text-gray-700' }, 'Phone'),
                                React.createElement('input', { key: 'phone-input', type: 'tel', name: 'phone', value: userForm.phone, onChange: handleUserFormChange, className: 'modern-input w-full' })
                            ]),
                            React.createElement('div', { key: 'email', className: 'space-y-2' }, [
                                React.createElement('label', { key: 'email-label', className: 'block text-sm font-bold text-gray-700' }, 'Email'),
                                React.createElement('input', { key: 'email-input', type: 'email', name: 'email', value: userForm.email, onChange: handleUserFormChange, className: 'modern-input w-full' })
                            ])
                        ]),
                        React.createElement('div', { key: 'form-actions', className: 'mt-6 flex items-center gap-4' }, [
                            React.createElement('button', { key: 'save', onClick: saveUser, className: 'modern-button px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1' }, [React.createElement('i', { key: 'i', className: 'fas fa-save mr-2' }), editingUserId ? 'Save Changes' : 'Add User']),
                            React.createElement('button', { key: 'cancel', onClick: () => setShowUserForm(false), className: 'bg-gray-200 text-gray-800 font-bold py-3 px-6 rounded-xl hover:bg-gray-300 transition-all duration-300' }, 'Cancel')
                        ])
                    ])
                ]);

            default:
                return null;
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
                }, "Admin Controls"),
                React.createElement('p', {
                    key: "subtitle",
                    className: "text-xl text-gray-600"
                }, "Configure your community website settings")
            ]),
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
            ])
        ]),

        React.createElement('div', {
            key: "content",
            className: "grid lg:grid-cols-4 gap-8"
        }, [
            React.createElement('div', {
                key: "sidebar",
                className: "lg:col-span-1"
            }, React.createElement('div', {
                className: "modern-card p-6 space-y-4"
            }, [
                React.createElement(TabButton, {
                    key: "general-tab",
                    tabName: "general",
                    label: "General",
                    icon: "fa-cog"
                }),
                React.createElement(TabButton, {
                    key: "content-tab",
                    tabName: "content",
                    label: "Content",
                    icon: "fa-edit"
                }),
                React.createElement(TabButton, {
                    key: "theme-tab",
                    tabName: "theme",
                    label: "Theme",
                    icon: "fa-palette"
                })
            ])),
            React.createElement('div', {
                key: "main-content",
                className: "lg:col-span-3"
            }, [
                React.createElement('div', {
                    key: "tab-content",
                    className: "modern-card p-10"
                }, renderTabContent()),
                React.createElement('div', {
                    key: "action-buttons",
                    className: "mt-8 flex flex-col sm:flex-row gap-4 justify-end"
                }, [
                    React.createElement('button', {
                        key: "reset-btn",
                        onClick: handleReset,
                        className: "bg-gray-200 text-gray-800 font-bold py-3 px-8 rounded-xl hover:bg-gray-300 transition-all duration-300"
                    }, "Reset Changes"),
                    React.createElement('button', {
                        key: "save-btn",
                        onClick: handleSave,
                        className: "modern-button px-12 py-3 text-lg rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                    }, [
                        React.createElement('i', {
                            key: "save-icon",
                            className: "fas fa-save mr-3"
                        }),
                        "Save All Changes"
                    ])
                ])
            ])
        ])
    ]);
};
