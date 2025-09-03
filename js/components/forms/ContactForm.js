// Access the global Supabase client

const { useState, useEffect } = React;

export const ContactForm = ({ theme, showNotification }) => {
    const [formData, setFormData] = useState({ name: '', email: '', message: '' });
    const [captcha, setCaptcha] = useState({ num1: 0, num2: 0, answer: '' });
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        setCaptcha({ num1: Math.floor(Math.random() * 10) + 1, num2: Math.floor(Math.random() * 10) + 1, answer: ''});
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCaptchaChange = (e) => {
        setCaptcha(prev => ({...prev, answer: e.target.value}));
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (parseInt(captcha.answer) !== captcha.num1 + captcha.num2) {
            showNotification("Incorrect CAPTCHA answer. Please try again.");
            return;
        }
        setIsLoading(true);
        try {
            const { error } = await window.supabaseClient.functions.invoke('send-contact-email', {
                body: JSON.stringify(formData)
            });
            if (error) throw error;
            showNotification("Message sent successfully!");
            setFormData({ name: '', email: '', message: '' });
            setCaptcha({ num1: Math.floor(Math.random() * 10) + 1, num2: Math.floor(Math.random() * 10) + 1, answer: ''});
        } catch (error) {
            console.error("Error sending contact form:", error);
            showNotification("Error sending message. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return React.createElement('form', {
        onSubmit: handleSubmit,
        className: "space-y-8"
    }, [
        React.createElement('div', {
            key: "name-field",
            className: "relative"
        }, [
            React.createElement('input', {
                key: "name",
                type: "text",
                name: "name",
                value: formData.name,
                onChange: handleInputChange,
                placeholder: "Your Full Name",
                className: `modern-input w-full text-lg ${theme.ring} ${theme.border}`,
                required: true
            }),
            React.createElement('div', {
                key: "name-icon",
                className: "absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400"
            }, React.createElement('i', {
                className: "fas fa-user"
            }))
        ]),
        React.createElement('div', {
            key: "email-field",
            className: "relative"
        }, [
            React.createElement('input', {
                key: "email",
                type: "email",
                name: "email",
                value: formData.email,
                onChange: handleInputChange,
                placeholder: "your.email@example.com",
                className: `modern-input w-full text-lg ${theme.ring} ${theme.border}`,
                required: true
            }),
            React.createElement('div', {
                key: "email-icon",
                className: "absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400"
            }, React.createElement('i', {
                className: "fas fa-envelope"
            }))
        ]),
        React.createElement('div', {
            key: "message-field",
            className: "relative"
        }, [
            React.createElement('textarea', {
                key: "message",
                name: "message",
                value: formData.message,
                onChange: handleInputChange,
                placeholder: "Tell us how we can help you...",
                rows: "6",
                className: `modern-input w-full text-lg resize-none ${theme.ring} ${theme.border}`,
                required: true
            }),
            React.createElement('div', {
                key: "message-icon",
                className: "absolute right-4 top-4 text-gray-400"
            }, React.createElement('i', {
                className: "fas fa-comment"
            }))
        ]),
        React.createElement('div', {
            key: "captcha",
            className: "flex items-center justify-center gap-6 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border border-blue-100"
        }, [
            React.createElement('div', {
                key: "captcha-question",
                className: "flex items-center gap-4"
            }, [
                React.createElement('i', {
                    key: "captcha-icon",
                    className: "fas fa-shield-alt text-blue-600 text-xl"
                }),
                React.createElement('label', {
                    key: "captcha-label",
                    className: "text-gray-700 text-xl font-semibold"
                }, `${captcha.num1} + ${captcha.num2} = ?`)
            ]),
            React.createElement('input', {
                key: "captcha-input",
                type: "number",
                value: captcha.answer,
                onChange: handleCaptchaChange,
                className: `w-20 px-4 py-3 border-2 border-blue-200 rounded-xl text-xl text-center font-bold focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all duration-300`,
                required: true
            })
        ]),
        React.createElement('button', {
            key: "submit",
            type: "submit",
            disabled: isLoading,
            className: `w-full modern-button text-white font-bold py-5 px-6 text-xl rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`
        }, isLoading ? React.createElement('div', {
            className: "flex items-center justify-center gap-3"
        }, [
            React.createElement('div', {
                key: "loader",
                className: "loader h-6 w-6"
            }),
            React.createElement('span', {
                key: "loading-text"
            }, "Sending...")
        ]) : React.createElement('div', {
            className: "flex items-center justify-center gap-3"
        }, [
            React.createElement('span', {
                key: "send-text"
            }, "Send Message"),
            React.createElement('i', {
                key: "send-icon",
                className: "fas fa-paper-plane"
            })
        ]))
    ]);
};
