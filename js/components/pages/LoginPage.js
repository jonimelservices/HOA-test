// Access the global Supabase client

const { useState } = React;

export const LoginPage = ({ theme, onLogin, showNotification, onNavigate }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async () => {
        setIsLoading(true);
        setError('');
        const { data: { user }, error: authError } = await window.supabaseClient.auth.signInWithPassword({
            email: email,
            password: password,
        });

        if (authError) {
            setError(authError.message);
            showNotification("Login failed: " + authError.message);
            setIsLoading(false);
        } else if (user) {
            // Try to load profile; if missing, create a minimal one
            const { data: userData, error: userError } = await window.supabaseClient
                .from('users')
                .select('*')
                .eq('id', user.id)
                .maybeSingle();

            if (!userError && userData) {
                onLogin(userData);
                return;
            }

            const minimalProfile = {
                id: user.id,
                email: user.email || null,
                full_name: (user.user_metadata && (user.user_metadata.full_name || user.user_metadata.name)) || null,
                role: 'member'
            };

            const up = await window.supabaseClient.from('users').upsert(minimalProfile);
            if (up.error) {
                setError("Could not retrieve user profile. Please contact support.");
                showNotification("Login failed: Could not retrieve user profile.");
                await window.supabaseClient.auth.signOut();
                setIsLoading(false);
                return;
            }

            const { data: createdProfile, error: fetchErr } = await window.supabaseClient
                .from('users')
                .select('*')
                .eq('id', user.id)
                .single();
            if (fetchErr || !createdProfile) {
                setError("Could not retrieve user profile. Please contact support.");
                showNotification("Login failed: Could not retrieve user profile.");
                await window.supabaseClient.auth.signOut();
                setIsLoading(false);
                return;
            }
            onLogin(createdProfile);
        }
    };

    return React.createElement('div', {
        className: "min-h-screen flex items-center justify-center fade-in p-6",
        style: {
            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1))'
        }
    },
        React.createElement('div', {
            className: "modern-card p-12 w-full max-w-md"
        }, [
            React.createElement('div', {
                key: "header",
                className: "text-center mb-12"
            }, [
                React.createElement('div', {
                    key: "icon",
                    className: "bg-gradient-to-br from-blue-100 to-purple-100 p-6 rounded-3xl inline-block mb-6 shadow-lg"
                }, React.createElement('i', {
                    className: "fas fa-lock text-4xl gradient-text"
                })),
                React.createElement('h1', {
                    key: "title",
                    className: "text-4xl font-black gradient-text mb-3"
                }, "Member Portal"),
                React.createElement('p', {
                    key: "subtitle",
                    className: "text-gray-600 text-lg"
                }, "Sign in to access your community resources")
            ]),
            error && React.createElement('div', {
                key: "error",
                className: "modern-card bg-red-50 border border-red-200 p-4 mb-6 text-center"
            }, React.createElement('p', {
                className: "text-red-600 font-semibold"
            }, error)),
            React.createElement('div', {
                key: "form",
                className: "space-y-6"
            }, [
                React.createElement('div', {
                    key: "email",
                    className: "space-y-2"
                }, [
                    React.createElement('label', {
                        key: "email-label",
                        className: "block text-lg font-bold text-gray-700"
                    }, "Email Address"),
                    React.createElement('div', {
                        key: "email-field",
                        className: "relative"
                    }, [
                        React.createElement('input', {
                            key: "email-input",
                            type: "email",
                            onChange: (e) => setEmail(e.target.value),
                            className: "modern-input w-full text-lg pl-12",
                            placeholder: "your.email@example.com"
                        }),
                        React.createElement('i', {
                            key: "email-icon",
                            className: "fas fa-envelope absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                        })
                    ])
                ]),
                React.createElement('div', {
                    key: "password",
                    className: "space-y-2"
                }, [
                    React.createElement('label', {
                        key: "password-label",
                        className: "block text-lg font-bold text-gray-700"
                    }, "Password"),
                    React.createElement('div', {
                        key: "password-field",
                        className: "relative"
                    }, [
                        React.createElement('input', {
                            key: "password-input",
                            type: "password",
                            onChange: (e) => setPassword(e.target.value),
                            className: "modern-input w-full text-lg pl-12",
                            placeholder: "Enter your password"
                        }),
                        React.createElement('i', {
                            key: "password-icon",
                            className: "fas fa-key absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                        })
                    ])
                ])
            ]),
            React.createElement('div', {
                key: "forgot",
                className: "mt-6 text-right"
            }, React.createElement('a', {
                href: "#",
                onClick: (e) => { e.preventDefault(); onNavigate('reset-password'); },
                className: "text-blue-600 hover:text-blue-800 font-semibold transition-colors duration-200"
            }, "Forgot Password?")),
            React.createElement('div', {
                key: "submit",
                className: "mt-8"
            }, React.createElement('button', {
                onClick: handleLogin,
                disabled: isLoading,
                className: "w-full modern-button text-white font-bold py-4 px-6 text-xl rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            }, isLoading ? React.createElement('div', {
                className: "flex items-center justify-center gap-3"
            }, [
                React.createElement('div', {
                    key: "loader",
                    className: "loader h-6 w-6"
                }),
                React.createElement('span', {
                    key: "loading-text"
                }, "Signing in...")
            ]) : React.createElement('div', {
                className: "flex items-center justify-center gap-3"
            }, [
                React.createElement('span', {
                    key: "login-text"
                }, "Sign In"),
                React.createElement('i', {
                    key: "login-icon",
                    className: "fas fa-sign-in-alt"
                })
            ])))
        ])
    );
};
