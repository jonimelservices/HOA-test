import { ConfirmationModal } from '../ui/ConfirmationModal.js';
const { useState } = React;

export const AccountPage = ({ theme, user, setUser, showNotification, onNavigate, initialTab, restrictSecurityOnly, recoveryMode }) => {
    const [formData, setFormData] = useState(user || {});
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [activeTab, setActiveTab] = useState(initialTab || 'profile');
    const [showSaveConfirm, setShowSaveConfirm] = useState(false);
    const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };
    
    const handleSave = async () => {
        try {
            const { error } = await window.supabaseClient
                .from('users')
                .update({
                    first_name: formData.first_name || null,
                    last_name: formData.last_name || null,
                    email: formData.email,
                    notify_new_documents: formData.notify_new_documents,
                    notify_new_meetings: formData.notify_new_meetings
                })
                .eq('id', user.id);

            if (error) {
                showNotification("Error updating profile: " + error.message);
            } else {
                setUser(formData);
                showNotification("Account details updated successfully!");
            }
        } catch (error) {
            showNotification("Error updating profile.");
        }
    };

    const handleChangePassword = async () => {
        if (newPassword !== confirmPassword) {
            showNotification("New passwords do not match.");
            return;
        }
        if (newPassword.length < 6) {
            showNotification("Password must be at least 6 characters long.");
            return;
        }

        try {
            const { error } = await window.supabaseClient.auth.updateUser({
                password: newPassword
            });

            if (error) {
                showNotification("Error changing password: " + error.message);
            } else {
                showNotification("Password changed successfully!");
                setNewPassword('');
                setConfirmPassword('');
                setShowPasswordConfirm(true);
                if (recoveryMode) {
                    try { await window.supabaseClient.auth.signOut(); } catch (_) {}
                    onNavigate('login');
                } else {
                    try { alert('Done'); } catch (_) {}
                }
            }
        } catch (error) {
            showNotification("Error changing password.");
        }
    };

    if (!user) {
        return React.createElement('div', {
            className: "container mx-auto px-8 py-16 text-center"
        }, React.createElement('div', {
            className: "loader mx-auto"
        }));
    }

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

    const renderTabContent = () => {
        switch (activeTab) {
            case 'profile':
                return React.createElement('div', {
                    className: "space-y-8"
                }, [
                    React.createElement('div', {
                        key: "profile-header",
                        className: "text-center mb-10"
                    }, [
                        React.createElement('div', {
                            key: "avatar",
                            className: "bg-gradient-to-br from-blue-100 to-purple-100 w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center shadow-lg"
                        }, React.createElement('i', {
                            className: "fas fa-user text-4xl text-blue-700"
                        })),
                        React.createElement('h2', {
                            key: "profile-title",
                            className: "text-3xl font-black text-gray-800 mb-2"
                        }, "Profile Information"),
                        React.createElement('p', {
                            key: "profile-subtitle",
                            className: "text-gray-600"
                        }, "Update your personal information")
                    ]),
                    React.createElement('div', {
                        key: "name-field",
                        className: "space-y-3"
                    }, [
                        React.createElement('label', {
                            key: "name-label",
                            className: "block text-lg font-bold text-gray-700"
                        }, "First Name"),
                        React.createElement('input', {
                            key: "name-input",
                            type: "text",
                            name: "first_name",
                            value: formData.first_name || '',
                            onChange: handleInputChange,
                            className: "modern-input w-full text-lg",
                            placeholder: "Enter your first name"
                        })
                    ]),
                    React.createElement('div', {
                        key: "last-name-field",
                        className: "space-y-3"
                    }, [
                        React.createElement('label', {
                            key: "last-name-label",
                            className: "block text-lg font-bold text-gray-700"
                        }, "Last Name"),
                        React.createElement('input', {
                            key: "last-name-input",
                            type: "text",
                            name: "last_name",
                            value: formData.last_name || '',
                            onChange: handleInputChange,
                            className: "modern-input w-full text-lg",
                            placeholder: "Enter your last name"
                        })
                    ]),
                    React.createElement('div', {
                        key: "email-field",
                        className: "space-y-3"
                    }, [
                        React.createElement('label', {
                            key: "email-label",
                            className: "block text-lg font-bold text-gray-700"
                        }, "Email Address"),
                        React.createElement('input', {
                            key: "email-input",
                            type: "email",
                            name: "email",
                            value: formData.email || '',
                            onChange: handleInputChange,
                            className: "modern-input w-full text-lg",
                            placeholder: "Enter your email address"
                        })
                    ])
                ]);

            case 'notifications':
                return React.createElement('div', {
                    className: "space-y-8"
                }, [
                    React.createElement('div', {
                        key: "notification-header",
                        className: "text-center mb-10"
                    }, [
                        React.createElement('div', {
                            key: "bell-icon",
                            className: "bg-gradient-to-br from-green-100 to-emerald-100 w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center shadow-lg"
                        }, React.createElement('i', {
                            className: "fas fa-bell text-4xl text-green-700"
                        })),
                        React.createElement('h2', {
                            key: "notification-title",
                            className: "text-3xl font-black text-gray-800 mb-2"
                        }, "Notification Preferences"),
                        React.createElement('p', {
                            key: "notification-subtitle",
                            className: "text-gray-600"
                        }, "Choose what updates you'd like to receive")
                    ]),
                    React.createElement('div', {
                        key: "notification-options",
                        className: "space-y-6"
                    }, [
                        React.createElement('div', {
                            key: "doc-notifications",
                            className: "modern-card p-6 hover:shadow-lg transition-shadow duration-300"
                        }, React.createElement('label', {
                            className: "flex items-center gap-4 cursor-pointer"
                        }, [
                            React.createElement('input', {
                                key: "doc-checkbox",
                                type: "checkbox",
                                name: "notify_new_documents",
                                checked: formData.notify_new_documents || false,
                                onChange: handleInputChange,
                                className: "h-6 w-6 rounded border-2 border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-2"
                            }),
                            React.createElement('div', {
                                key: "doc-content",
                                className: "flex-1"
                            }, [
                                React.createElement('div', {
                                    key: "doc-title",
                                    className: "text-lg font-bold text-gray-800"
                                }, "Document Updates"),
                                React.createElement('div', {
                                    key: "doc-desc",
                                    className: "text-gray-600"
                                }, "Get notified when new documents are uploaded")
                            ]),
                            React.createElement('i', {
                                key: "doc-icon",
                                className: "fas fa-file-alt text-2xl text-blue-600"
                            })
                        ])),
                        React.createElement('div', {
                            key: "meeting-notifications",
                            className: "modern-card p-6 hover:shadow-lg transition-shadow duration-300"
                        }, React.createElement('label', {
                            className: "flex items-center gap-4 cursor-pointer"
                        }, [
                            React.createElement('input', {
                                key: "meeting-checkbox",
                                type: "checkbox",
                                name: "notify_new_meetings",
                                checked: formData.notify_new_meetings || false,
                                onChange: handleInputChange,
                                className: "h-6 w-6 rounded border-2 border-gray-300 text-green-600 focus:ring-green-500 focus:ring-2"
                            }),
                            React.createElement('div', {
                                key: "meeting-content",
                                className: "flex-1"
                            }, [
                                React.createElement('div', {
                                    key: "meeting-title",
                                    className: "text-lg font-bold text-gray-800"
                                }, "Meeting Reminders"),
                                React.createElement('div', {
                                    key: "meeting-desc",
                                    className: "text-gray-600"
                                }, "Get notified about upcoming meetings and events")
                            ]),
                            React.createElement('i', {
                                key: "meeting-icon",
                                className: "fas fa-calendar-alt text-2xl text-green-600"
                            })
                        ]))
                    ])
                ]);

            case 'security':
                return React.createElement('div', {
                    className: "space-y-8"
                }, [
                    React.createElement('div', {
                        key: "security-header",
                        className: "text-center mb-10"
                    }, [
                        React.createElement('div', {
                            key: "shield-icon",
                            className: "bg-gradient-to-br from-red-100 to-rose-100 w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center shadow-lg"
                        }, React.createElement('i', {
                            className: "fas fa-shield-alt text-4xl text-red-700"
                        })),
                        React.createElement('h2', {
                            key: "security-title",
                            className: "text-3xl font-black text-gray-800 mb-2"
                        }, "Security Settings"),
                        React.createElement('p', {
                            key: "security-subtitle",
                            className: "text-gray-600"
                        }, "Keep your account secure with a strong password")
                    ]),
                    React.createElement('div', {
                        key: "password-fields",
                        className: "space-y-6"
                    }, [
                        React.createElement('div', {
                            key: "new-password",
                            className: "space-y-3"
                        }, [
                            React.createElement('label', {
                                key: "new-password-label",
                                className: "block text-lg font-bold text-gray-700"
                            }, "New Password"),
                            React.createElement('input', {
                                key: "new-password-input",
                                type: "password",
                                value: newPassword,
                                onChange: (e) => setNewPassword(e.target.value),
                                className: "modern-input w-full text-lg",
                                placeholder: "Enter new password"
                            })
                        ]),
                        React.createElement('div', {
                            key: "confirm-password",
                            className: "space-y-3"
                        }, [
                            React.createElement('label', {
                                key: "confirm-password-label",
                                className: "block text-lg font-bold text-gray-700"
                            }, "Confirm New Password"),
                            React.createElement('input', {
                                key: "confirm-password-input",
                                type: "password",
                                value: confirmPassword,
                                onChange: (e) => setConfirmPassword(e.target.value),
                                className: "modern-input w-full text-lg",
                                placeholder: "Confirm new password"
                            })
                        ]),
                        React.createElement('button', {
                            key: "change-password-btn",
                            onClick: handleChangePassword,
                            className: "w-full bg-gradient-to-r from-red-500 to-rose-600 text-white font-bold py-4 px-6 rounded-2xl text-lg hover:from-red-600 hover:to-rose-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                        }, [
                            React.createElement('i', {
                                key: "password-icon",
                                className: "fas fa-key mr-3"
                            }),
                            "Change Password"
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
                }, "Account Settings"),
                React.createElement('p', {
                    key: "subtitle",
                    className: "text-xl text-gray-600"
                }, "Manage your profile and preferences")
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
                    key: "profile-tab",
                    tabName: "profile",
                    label: "Profile",
                    icon: "fa-user"
                }),
                React.createElement(TabButton, {
                    key: "notifications-tab",
                    tabName: "notifications",
                    label: "Notifications",
                    icon: "fa-bell"
                }),
                React.createElement(TabButton, {
                    key: "security-tab",
                    tabName: "security",
                    label: "Security",
                    icon: "fa-shield-alt"
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
                (activeTab === 'profile' || activeTab === 'notifications') && React.createElement('div', {
                    key: "save-section",
                    className: "mt-8 text-center"
                }, React.createElement('button', {
                    onClick: () => setShowSaveConfirm(true),
                    className: "modern-button px-12 py-4 text-xl rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 hover:scale-105"
                }, [
                    React.createElement('i', {
                        key: "save-icon",
                        className: "fas fa-save mr-3"
                    }),
                    "Save Changes"
                ]))
            ])
        ]),
        showSaveConfirm && React.createElement(ConfirmationModal, {
            key: 'confirm-save',
            theme: theme,
            title: 'Save Changes',
            message: 'Are you sure you want to save your account changes?',
            confirmLabel: 'Save',
            cancelLabel: 'Cancel',
            onConfirm: async () => { setShowSaveConfirm(false); await handleSave(); },
            onCancel: () => setShowSaveConfirm(false)
        }),
        showPasswordConfirm && React.createElement(ConfirmationModal, {
            key: 'confirm-password-changed',
            theme: theme,
            title: 'Password Changed',
            message: 'Your password has been updated.',
            confirmLabel: 'OK',
            cancelLabel: 'Close',
            onConfirm: () => setShowPasswordConfirm(false),
            onCancel: () => setShowPasswordConfirm(false)
        })
    ]);
};
