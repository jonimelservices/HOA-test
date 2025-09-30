const { useState } = React;

export const PasswordUpdatePage = ({ theme, showNotification, onNavigate }) => {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleUpdatePassword = async () => {
        if (newPassword !== confirmPassword) {
            showNotification('New passwords do not match.');
            return;
        }
        if (newPassword.length < 6) {
            showNotification('Password must be at least 6 characters long.');
            return;
        }
        try {
            setIsLoading(true);
            const { error } = await window.supabaseClient.auth.updateUser({ password: newPassword });
            if (error) {
                showNotification('Error updating password: ' + error.message);
            } else {
                showNotification('Password updated successfully. Please sign in with your new password.');
                try { await window.supabaseClient.auth.signOut(); } catch (_) {}
                onNavigate('login');
            }
        } catch (e) {
            showNotification('Error updating password.');
        } finally {
            setIsLoading(false);
        }
    };

    return React.createElement('div', {
        className: 'min-h-screen flex items-center justify-center fade-in p-6'
    }, React.createElement('div', {
        className: 'bg-white p-10 rounded-2xl shadow-xl w-full max-w-lg'
    }, [
        React.createElement('div', { key: 'header', className: 'text-center mb-10' }, [
            React.createElement('div', { key: 'shield', className: 'bg-gradient-to-br from-red-100 to-rose-100 w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center shadow-lg' },
                React.createElement('i', { className: 'fas fa-shield-alt text-4xl text-red-700' })
            ),
            React.createElement('h1', { key: 'title', className: 'text-4xl font-bold text-gray-800' }, 'Security Settings'),
            React.createElement('p', { key: 'subtitle', className: 'text-gray-600 mt-4' }, 'Set a new password to secure your account')
        ]),
        React.createElement('div', { key: 'form', className: 'space-y-6' }, [
            React.createElement('div', { key: 'new-password', className: 'space-y-3' }, [
                React.createElement('label', { key: 'new-password-label', className: 'block text-lg font-bold text-gray-700' }, 'New Password'),
                React.createElement('input', {
                    key: 'new-password-input',
                    type: 'password',
                    value: newPassword,
                    onChange: (e) => setNewPassword(e.target.value),
                    className: 'modern-input w-full text-lg',
                    placeholder: 'Enter new password'
                })
            ]),
            React.createElement('div', { key: 'confirm-password', className: 'space-y-3' }, [
                React.createElement('label', { key: 'confirm-password-label', className: 'block text-lg font-bold text-gray-700' }, 'Confirm New Password'),
                React.createElement('input', {
                    key: 'confirm-password-input',
                    type: 'password',
                    value: confirmPassword,
                    onChange: (e) => setConfirmPassword(e.target.value),
                    className: 'modern-input w-full text-lg',
                    placeholder: 'Confirm new password'
                })
            ]),
            React.createElement('button', {
                key: 'update-btn',
                onClick: handleUpdatePassword,
                disabled: isLoading,
                className: `w-full bg-gradient-to-r from-red-500 to-rose-600 text-white font-bold py-4 px-6 rounded-2xl text-lg hover:from-red-600 hover:to-rose-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed`
            }, isLoading ? React.createElement('div', { className: 'loader mx-auto h-6 w-6' }) : React.createElement('div', { className: 'flex items-center justify-center gap-3' }, [
                React.createElement('i', { key: 'key-icon', className: 'fas fa-key' }),
                React.createElement('span', { key: 'btn-text' }, 'Update Password')
            ]))
        ])
    ]));
};
