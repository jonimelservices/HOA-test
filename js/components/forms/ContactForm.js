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
        className: "space-y-6"
    }, [
        React.createElement('input', {
            key: "name",
            type: "text",
            name: "name",
            value: formData.name,
            onChange: handleInputChange,
            placeholder: "Your Name",
            className: `w-full px-5 py-3 border rounded-xl text-lg ${theme.ring} ${theme.border}`,
            required: true
        }),
        React.createElement('input', {
            key: "email",
            type: "email",
            name: "email",
            value: formData.email,
            onChange: handleInputChange,
            placeholder: "Your Email",
            className: `w-full px-5 py-3 border rounded-xl text-lg ${theme.ring} ${theme.border}`,
            required: true
        }),
        React.createElement('textarea', {
            key: "message",
            name: "message",
            value: formData.message,
            onChange: handleInputChange,
            placeholder: "Your Message",
            rows: "5",
            className: `w-full px-5 py-3 border rounded-xl text-lg ${theme.ring} ${theme.border}`,
            required: true
        }),
        React.createElement('div', {
            key: "captcha",
            className: "flex items-center gap-4"
        }, [
            React.createElement('label', {
                key: "captcha-label",
                className: "text-gray-700 text-lg"
            }, `${captcha.num1} + ${captcha.num2} = ?`),
            React.createElement('input', {
                key: "captcha-input",
                type: "number",
                value: captcha.answer,
                onChange: handleCaptchaChange,
                className: `w-28 px-4 py-3 border rounded-xl text-lg ${theme.ring} ${theme.border}`,
                required: true
            })
        ]),
        React.createElement('button', {
            key: "submit",
            type: "submit",
            disabled: isLoading,
            className: `w-full ${theme.bg} text-white font-semibold py-4 px-5 rounded-xl text-lg ${theme.hoverBg} transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:bg-gray-400`
        }, isLoading ? React.createElement('div', {
            className: "loader mx-auto h-6 w-6"
        }) : 'Send Message')
    ]);
};
