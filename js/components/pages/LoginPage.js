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
            const { data: userData, error: userError } = await window.supabaseClient
                .from('users')
                .select('*')
                .eq('id', user.id)
                .single();

            if (userError || !userData) {
                setError("Could not retrieve user profile. Please contact support.");
                showNotification("Login failed: Could not retrieve user profile.");
                await window.supabaseClient.auth.signOut();
                setIsLoading(false);
            } else {
                onLogin(userData);
            }
        }
    };

    return React.createElement('div', {
        className: "min-h-screen flex items-center justify-center fade-in p-6"
    },
        React.createElement('div', {
            className: "bg-white p-10 rounded-2xl shadow-xl w-full max-w-lg"
        }, [
            React.createElement('div', {
                key: "header",
                className: "text-center mb-10"
            }, [
                React.createElement('div', {
                    key: "icon",
                    className: `${theme.bg} inline-block p-4 rounded-full mb-5`
                }, React.createElement('i', {
                    className: "fas fa-lock text-white text-3xl"
                })),
                React.createElement('h1', {
                    key: "title",
                    className: "text-4xl font-bold text-gray-800"
                }, "Portal Login")
            ]),
            error && React.createElement('p', {
                key: "error",
                className: "text-red-500 text-center mb-5 font-semibold text-lg"
            }, error),
            React.createElement('div', {
                key: "form",
                className: "space-y-8"
            }, [
                React.createElement('div', {
                    key: "email"
                }, [
                    React.createElement('label', {
                        key: "email-label",
                        className: "block text-base font-medium text-gray-700 mb-2"
                    }, "Email"),
                    React.createElement('input', {
                        key: "email-input",
                        type: "email",
                        onChange: (e) => setEmail(e.target.value),
                        className: `w-full px-5 py-4 border rounded-xl text-lg ${theme.ring} ${theme.border}`,
                        placeholder: "Enter your email"
                    })
                ]),
                React.createElement('div', {
                    key: "password"
                }, [
                    React.createElement('label', {
                        key: "password-label",
                        className: "block text-base font-medium text-gray-700 mb-2"
                    }, "Password"),
                    React.createElement('input', {
                        key: "password-input",
                        type: "password",
                        onChange: (e) => setPassword(e.target.value),
                        className: `w-full px-5 py-4 border rounded-xl text-lg ${theme.ring} ${theme.border}`,
                        placeholder: "Enter your password"
                    })
                ])
            ]),
            React.createElement('div', {
                key: "forgot",
                className: "mt-4 text-right"
            }, React.createElement('a', {
                href: "#",
                onClick: (e) => { e.preventDefault(); onNavigate('reset-password'); },
                className: `text-sm ${theme.text} hover:underline font-semibold`
            }, "Forgot Password?")),
            React.createElement('div', {
                key: "submit",
                className: "mt-6"
            }, React.createElement('button', {
                onClick: handleLogin,
                disabled: isLoading,
                className: `w-full ${theme.bg} text-white font-bold py-4 px-5 rounded-xl text-lg ${theme.hoverBg} transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:bg-gray-400`
            }, isLoading ? React.createElement('div', {
                className: "loader mx-auto h-6 w-6"
            }) : 'Login'))
        ])
    );
};
