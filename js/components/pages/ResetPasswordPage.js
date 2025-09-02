const { useState } = React;

export const ResetPasswordPage = ({ theme, showNotification, onNavigate }) => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handlePasswordReset = async () => {
        setIsLoading(true);
        const { error } = await window.supabaseClient.auth.resetPasswordForEmail(email, {
            redirectTo: window.location.origin,
        });
        if (error) {
            showNotification("Error: " + error.message);
        } else {
            showNotification("Password recovery email sent!");
            onNavigate('login');
        }
        setIsLoading(false);
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
                React.createElement('h1', {
                    key: "title",
                    className: "text-4xl font-bold text-gray-800"
                }, "Reset Password"),
                React.createElement('p', {
                    key: "subtitle",
                    className: "text-gray-600 mt-4"
                }, "Enter your email to receive a password reset link.")
            ]),
            React.createElement('div', {
                key: "form",
                className: "space-y-8"
            }, React.createElement('div', {
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
            ])),
            React.createElement('div', {
                key: "submit",
                className: "mt-10"
            }, React.createElement('button', {
                onClick: handlePasswordReset,
                disabled: isLoading,
                className: `w-full ${theme.bg} text-white font-bold py-4 px-5 rounded-xl text-lg ${theme.hoverBg} transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:bg-gray-400`
            }, isLoading ? React.createElement('div', {
                className: "loader mx-auto h-6 w-6"
            }) : 'Send Recovery Email'))
        ])
    );
};
