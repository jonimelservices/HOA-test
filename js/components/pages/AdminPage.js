import { themeClasses } from '../../utils/themes.js';
import { ConfirmationModal } from '../ui/ConfirmationModal.js';

const { useState, useEffect, useRef } = React;
import { supa } from '../../utils/supabase.js';

export const AdminPage = ({ config, setConfig, theme, themeName, setThemeName, showNotification, onNavigate }) => {
    const [localConfig, setLocalConfig] = useState(config || {});
    const [localThemeName, setLocalThemeName] = useState(themeName || 'blue');
    const [activeTab, setActiveTab] = useState('general');
    const [userRows, setUserRows] = useState([]);
    const [isUsersLoading, setIsUsersLoading] = useState(false);
    const [showUserForm, setShowUserForm] = useState(false);
    const [editingUserId, setEditingUserId] = useState(null);
    const [userForm, setUserForm] = useState({ id: '', first_name: '', last_name: '', address: '', phone: '', email: '', role: 'member' });
    const [isBulkUploading, setIsBulkUploading] = useState(false);
    const fileInputRef = useRef(null);
    const [showSaveConfirm, setShowSaveConfirm] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteCandidate, setDeleteCandidate] = useState(null);

    // Try uploading to any available bucket; fall back gracefully if none exist or policy forbids
    const uploadAssetToAnyBucket = async (fileOrBlob, filename, contentType) => {
        // Keep attempts bounded and timeouts short to avoid UI hanging
        const candidates = ['site-assets', 'public'];
        for (const bucket of candidates) {
            try {
                const res = await supa(
                    () => window.supabaseClient.storage
                        .from(bucket)
                        .upload(filename, fileOrBlob, { upsert: true, contentType: contentType || 'application/octet-stream' }),
                    { timeoutMs: 6000 }
                );
                if (res && !res.error) {
                    const { data: pub } = window.supabaseClient.storage.from(bucket).getPublicUrl(filename);
                    return { url: pub?.publicUrl || null, bucket };
                }
                if (res && res.error) {
                    const msg = String(res.error.message || '');
                    if (/bucket.*not.*found/i.test(msg) || /not found/i.test(msg) || /404/.test(msg)) continue;
                }
            } catch (_) {
                // continue trying next bucket
            }
        }
        return { url: null, bucket: null };
    };

    const handleConfigChange = (e) => {
        const { name, value } = e.target;
        setLocalConfig(prev => ({ ...prev, [name]: value }));
    };
    
    const handleImageUpload = async (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;
        const unique = `hero_${Date.now()}_${file.name}`;
        try {
            const { url } = await uploadAssetToAnyBucket(file, unique, file.type || 'image/jpeg');
            if (url) {
                setLocalConfig(prev => ({ ...prev, heroImageUrl: url }));
                showNotification('Hero image uploaded.');
                return;
            }
        } catch (_) {}
        // Fallback to embedding as data URL if no bucket was available
        try {
            const reader = new FileReader();
            reader.onloadend = () => {
                setLocalConfig(prev => ({ ...prev, heroImageUrl: String(reader.result || '') }));
                showNotification('Stored image inline (no storage bucket available).');
            };
            reader.readAsDataURL(file);
        } catch (err) {
            console.error('Hero image handling error:', err);
            showNotification('Could not process hero image.');
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
            // Save configuration and theme
            let heroUrl = localConfig.heroImageUrl || null;
            if (heroUrl && /^data:image\//.test(heroUrl)) {
                try {
                    const mime = (heroUrl.match(/^data:(image\/[^;]+);/) || [])[1] || 'image/png';
                    const b64 = heroUrl.split(',')[1] || '';
                    const byteChars = atob(b64);
                    const byteNumbers = new Array(byteChars.length);
                    for (let i = 0; i < byteChars.length; i++) byteNumbers[i] = byteChars.charCodeAt(i);
                    const blob = new Blob([new Uint8Array(byteNumbers)], { type: mime });
                    const unique = `hero_${Date.now()}.${(mime.split('/')[1] || 'png')}`;
                    const uploaded = await uploadAssetToAnyBucket(blob, unique, mime);
                    if (uploaded.url) {
                        heroUrl = uploaded.url;
                    } else {
                        console.warn('Hero image migration skipped: no suitable storage bucket. Keeping inline image.');
                    }
                } catch (e) {
                    console.warn('Hero image migration error (kept inline):', e && (e.message || e));
                }
            }
            const { error } = await supa(() => window.supabaseClient
                .from('configuration')
                .upsert({
                    id: 1,
                    hoaName: localConfig.hoaName,
                    heroImageUrl: heroUrl,
                    managementCompanyInfo: localConfig.managementCompanyInfo,
                    contactInfo: localConfig.contactInfo,
                    boardMembers: localConfig.boardMembers,
                    themeName: localThemeName
                }, { onConflict: 'id' }), { timeoutMs: 30000 });

            if (error) throw error;
            setConfig(localConfig);
            setThemeName(localThemeName);

            // If user form is open, persist user changes as part of Save All
            if (showUserForm && (editingUserId || userForm.email)) {
                const payloadFull = {
                    email: userForm.email || null,
                    first_name: userForm.first_name || null,
                    last_name: userForm.last_name || null,
                    address: userForm.address || null,
                    phone: userForm.phone || null,
                    role: userForm.role || 'member'
                };

                if (editingUserId) {
                    let { error: uerr } = await window.supabaseClient.from('users').update(payloadFull).eq('id', editingUserId);
                    if (uerr) throw uerr;
                    showNotification('User updated.');
                } else if (userForm.email) {
                    // Try to create Auth user via Edge Function, else fallback to profile row only
                    try {
                        let createData = null; let createErr = null;
                        try {
                            const res = await window.supabaseClient.functions.invoke('create-user', {
                                body: JSON.stringify({
                                    email: userForm.email,
                                    first_name: userForm.first_name || null,
                                    last_name: userForm.last_name || null,
                                    role: userForm.role || 'member'
                                })
                            });
                            createData = res.data; createErr = res.error || null;
                        } catch (_) {}
                        if (createErr || !createData?.user_id) {
                            const res2 = await window.supabaseClient.functions.invoke('admin-create-user', {
                                body: JSON.stringify({
                                    email: userForm.email,
                                    first_name: userForm.first_name || null,
                                    last_name: userForm.last_name || null,
                                    role: userForm.role || 'member'
                                })
                            });
                            createData = res2.data; createErr = res2.error || null;
                        }
                        if (!createErr && createData?.user_id) {
                            const up = await window.supabaseClient.from('users').upsert({ id: createData.user_id, ...payloadFull });
                            if (up.error) throw up.error;
                            showNotification('User account created and profile saved.');
                        } else {
                            // Fallback: profile row only
                            const ins = await window.supabaseClient.from('users').insert(payloadFull);
                            if (ins.error) throw ins.error;
                            showNotification('User added.');
                        }
                    } catch (e) {
                        // As a last resort, try upsert by email
                        const upd = await window.supabaseClient.from('users').upsert(payloadFull, { onConflict: 'email' });
                        if (upd.error) throw upd.error;
                        showNotification('User saved.');
                    }
                }

                setShowUserForm(false);
                await fetchReadOnlyUsers();
            }

            showNotification('Admin settings saved successfully!');
        } catch (error) {
            console.error('Save all error:', error.message || error);
            showNotification('Error saving settings.');
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
            const { data, error } = await supa(() => window.supabaseClient
                .from('users')
                .select('id, email, role, first_name, last_name, address, phone')
                .neq('role', 'admin'));
            if (error) {
                console.error('Error loading users:', error.message || error);
                setUserRows([]);
                const msg = error.code === '42501' || error.code === 'PGRST301' ? 'Access denied by RLS. Ensure admin policy exists.' : 'Could not load users.';
                showNotification(msg);
            } else {
                const rows = (data || []).map(u => ({
                    id: u.id,
                    email: u.email || '',
                    role: u.role || 'member',
                    first_name: u.first_name || '',
                    last_name: u.last_name || '',
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
        let channel = null;
        if (activeTab === 'user') {
            channel = window.supabaseClient
                .channel('users-changes')
                .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, () => {
                    fetchReadOnlyUsers();
                })
                .subscribe();
        }
        return () => { if (channel) { try { window.supabaseClient.removeChannel(channel); } catch (_) {} } };
    }, [activeTab]);

    const openAddUser = () => {
        setEditingUserId(null);
        setUserForm({ first_name: '', last_name: '', address: '', phone: '', email: '', role: 'member' });
        setShowUserForm(true);
    };

    const openEditUser = (row) => {
        setEditingUserId(row.id);
        setUserForm({ first_name: row.first_name, last_name: row.last_name, address: row.address, phone: row.phone, email: row.email, role: row.role || 'member' });
        setShowUserForm(true);
    };

    const handleUserFormChange = (e) => {
        const { name, value } = e.target;
        setUserForm(prev => ({ ...prev, [name]: value }));
    };

    const saveUser = async () => {
        const payloadFull = {
            email: userForm.email || null,
            first_name: userForm.first_name || null,
            last_name: userForm.last_name || null,
            address: userForm.address || null,
            phone: userForm.phone || null,
            role: userForm.role || 'member'
        };
        const payloadMinimal = {
            email: userForm.email || null,
            first_name: userForm.first_name || null,
            last_name: userForm.last_name || null,
            role: userForm.role || 'member'
        };
        try {
            if (editingUserId) {
                let { error } = await window.supabaseClient.from('users').update(payloadFull).eq('id', editingUserId);
                if (error) {
                    // Retry with minimal payload if unknown columns
                    if ((error.code === '42703') || /column .* does not exist/i.test(error.message || '')) {
                        const res2 = await window.supabaseClient.from('users').update(payloadMinimal).eq('id', editingUserId);
                        if (res2.error) throw res2.error;
                    } else {
                        throw error;
                    }
                }
                showNotification('User updated.');
            } else {
                // Try to create an Auth user (Edge Function with service role required)
                try {
                    let createData = null; let createErr = null;
                    try {
                        const res = await window.supabaseClient.functions.invoke('create-user', {
                            body: JSON.stringify({
                                email: userForm.email,
                                first_name: userForm.first_name || null,
                                last_name: userForm.last_name || null,
                                role: userForm.role || 'member'
                            })
                        });
                        createData = res.data; createErr = res.error || null;
                    } catch (_) {}

                    if (createErr || !createData?.user_id) {
                        const res2 = await window.supabaseClient.functions.invoke('admin-create-user', {
                            body: JSON.stringify({
                                email: userForm.email,
                                first_name: userForm.first_name || null,
                                last_name: userForm.last_name || null,
                                role: userForm.role || 'member'
                            })
                        });
                        createData = res2.data; createErr = res2.error || null;
                    }

                    if (!createErr && createData?.user_id) {
                        // Ensure profile row updated with same id
                        const up = await window.supabaseClient.from('users').upsert({ id: createData.user_id, ...payloadFull });
                        if (up.error) throw up.error;
                        showNotification('User account created and profile saved.');
                        setShowUserForm(false);
                        fetchReadOnlyUsers();
                        return;
                    }
                } catch (e) {
                    // Proceed with fallback below
                }

                // Fallback: insert/update profile by email only
                let { error } = await window.supabaseClient.from('users').insert(payloadFull);
                if (error) {
                    if ((error.code === '42703') || /column .* does not exist/i.test(error.message || '')) {
                        const res2 = await window.supabaseClient.from('users').insert(payloadMinimal);
                        if (res2.error) throw res2.error;
                    } else if ((error.code === '23505') || /duplicate key/i.test(error.message || '')) {
                        const upd = await window.supabaseClient.from('users').update(payloadFull).eq('email', userForm.email);
                        if (upd.error) throw upd.error;
                    } else if ((error.code === '23503') || /foreign key/i.test(error.message || '')) {
                        const { data: existing } = await window.supabaseClient.from('users').select('id').eq('email', userForm.email).maybeSingle();
                        if (existing?.id) {
                            const upd = await window.supabaseClient.from('users').update(payloadFull).eq('id', existing.id);
                            if (upd.error) throw upd.error;
                        } else {
                            throw error;
                        }
                    } else {
                        throw error;
                    }
                }
                showNotification('User added. (Auth invite requires admin-create-user function)');
            }
            setShowUserForm(false);
            fetchReadOnlyUsers();
        } catch (err) {
            console.error('Save user error:', err.message || err);
            const msg = (err.code === '42501' || err.code === 'PGRST301') ? 'Access denied by RLS. Ensure admin policy exists.' : 'Failed to save user.';
            showNotification(msg);
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

    const parseCSV = (text) => {
        const lines = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n").filter(l => l.trim().length);
        if (!lines.length) return [];
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        const rows = [];
        for (let i = 1; i < lines.length; i++) {
            const s = lines[i];
            const row = [];
            let cur = '';
            let inQuotes = false;
            for (let j = 0; j < s.length; j++) {
                const ch = s[j];
                if (ch === '"') {
                    if (inQuotes && s[j+1] === '"') { cur += '"'; j++; }
                    else { inQuotes = !inQuotes; }
                } else if (ch === ',' && !inQuotes) {
                    row.push(cur);
                    cur = '';
                } else {
                    cur += ch;
                }
            }
            row.push(cur);
            const obj = {};
            headers.forEach((h, idx) => obj[h] = (row[idx] || '').trim());
            rows.push(obj);
        }
        return rows;
    };

    const upsertUsersFromCSV = async (users) => {
        let success = 0, failed = 0;
        for (const u of users) {
            const payloadFull = {
                email: u.email || null,
                first_name: u.first_name || null,
                last_name: u.last_name || null,
                address: u.address || null,
                phone: u.phone || null,
                role: u.role || 'member'
            };
            const payloadMinimal = { email: u.email || null, first_name: u.first_name || null, last_name: u.last_name || null, role: u.role || 'member' };
            try {
                if (!u.email) throw new Error('Missing email');
                let { error } = await window.supabaseClient.from('users').insert(payloadFull);
                if (error) {
                    if ((error.code === '42703') || /column .* does not exist/i.test(error.message || '')) {
                        const res2 = await window.supabaseClient.from('users').insert(payloadMinimal);
                        if (res2.error) throw res2.error;
                    } else if ((error.code === '23505') || /duplicate key/i.test(error.message || '')) {
                        const upd = await window.supabaseClient.from('users').update(payloadFull).eq('email', u.email);
                        if (upd.error) throw upd.error;
                    } else if ((error.code === '23503') || /foreign key/i.test(error.message || '')) {
                        const { data: existing } = await window.supabaseClient.from('users').select('id').eq('email', u.email).maybeSingle();
                        if (existing?.id) {
                            const upd = await window.supabaseClient.from('users').update(payloadFull).eq('id', existing.id);
                            if (upd.error) throw upd.error;
                        } else {
                            throw error;
                        }
                    } else {
                        throw error;
                    }
                }
                success++;
            } catch (e) {
                console.error('CSV row failed:', u, e.message || e);
                failed++;
            }
        }
        showNotification(`Bulk upload complete. Imported: ${success}. Failed: ${failed}.`);
        fetchReadOnlyUsers();
    };

    const handleBulkUploadClick = () => fileInputRef.current && fileInputRef.current.click();
    const handleCSVChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setIsBulkUploading(true);
        const reader = new FileReader();
        reader.onload = async () => {
            try {
                const text = String(reader.result || '');
                const rows = parseCSV(text);
                await upsertUsersFromCSV(rows);
            } finally {
                setIsBulkUploading(false);
                e.target.value = '';
            }
        };
        reader.readAsText(file);
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
                            React.createElement('h3', { key: 'title', className: 'text-2xl font-black text-gray-800 mb-1' }, 'Users'),
                            React.createElement('p', { key: 'desc', className: 'text-gray-600' }, 'Manage users with view-only access.')
                        ]),
                        React.createElement('div', { key: 'actions', className: 'flex items-center gap-3' }, [
                            React.createElement('button', { key: 'add-btn', onClick: openAddUser, className: 'modern-button px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1' }, [
                                React.createElement('i', { key: 'icon', className: 'fas fa-user-plus mr-2' }),
                                'Add User'
                            ]),
                            React.createElement('button', { key: 'bulk-btn', onClick: handleBulkUploadClick, disabled: isBulkUploading, className: 'bg-gray-200 text-gray-800 font-bold py-3 px-4 rounded-xl hover:bg-gray-300 transition-all duration-300 disabled:opacity-50' }, [
                                React.createElement('i', { key: 'bi', className: 'fas fa-file-upload mr-2' }),
                                isBulkUploading ? 'Uploading...' : 'Bulk Upload (CSV)'
                            ]),
                            React.createElement('a', { key: 'example', href: './example-users.csv', download: 'example-users.csv', className: 'text-blue-600 hover:text-blue-800 font-semibold' }, 'Example CSV')
                        ]),
                        React.createElement('input', { key: 'csv-input', ref: fileInputRef, type: 'file', accept: '.csv', onChange: handleCSVChange, style: { display: 'none' } })
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
                                        React.createElement('button', { key: 'del', onClick: () => { setDeleteCandidate(row); setShowDeleteConfirm(true); }, className: 'bg-red-50 text-red-700 font-semibold px-3 py-2 rounded-lg hover:bg-red-100 transition-colors duration-200' }, [React.createElement('i', { key: 'i', className: 'fas fa-trash mr-1' }), 'Delete'])
                                    ]))
                                ]))
                            )
                        ]))
                    ]),

                    showUserForm && React.createElement('div', { key: 'form', className: 'modern-card p-8' }, [
                        React.createElement('div', { key: 'grid', className: 'grid md:grid-cols-2 gap-6' }, [
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
                            React.createElement('button', { key: 'cancel', onClick: () => setShowUserForm(false), className: 'bg-gray-200 text-gray-800 font-bold py-3 px-6 rounded-xl hover:bg-gray-300 transition-all duration-300' }, 'Close (Use "Save All Changes")')
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
                }),
                React.createElement(TabButton, {
                    key: "user-tab",
                    tabName: "user",
                    label: "User",
                    icon: "fa-users"
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
                        onClick: () => setShowSaveConfirm(true),
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
        ]),
        showSaveConfirm && React.createElement(ConfirmationModal, {
            key: 'confirm-save',
            theme: theme,
            title: 'Save Changes',
            message: 'Are you sure you want to save all changes? This will update your site settings.',
            confirmLabel: 'Save',
            cancelLabel: 'Cancel',
            onConfirm: async () => { setShowSaveConfirm(false); await handleSave(); },
            onCancel: () => setShowSaveConfirm(false)
        }),
        showDeleteConfirm && React.createElement(ConfirmationModal, {
            key: 'confirm-delete-user',
            theme: theme,
            title: 'Delete User',
            message: 'Are you sure you want to delete this user? This action cannot be undone.',
            confirmLabel: 'Delete',
            cancelLabel: 'Cancel',
            onConfirm: async () => {
                const target = deleteCandidate;
                setShowDeleteConfirm(false);
                setDeleteCandidate(null);
                if (target) {
                    await deleteUser(target);
                }
            },
            onCancel: () => { setShowDeleteConfirm(false); setDeleteCandidate(null); }
        })
    ]);
};
