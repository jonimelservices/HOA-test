const { useEffect } = React;

export const Notification = ({ message, onDismiss }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onDismiss();
        }, 3000);
        return () => clearTimeout(timer);
    }, [onDismiss]);

    return React.createElement('div', {
        className: "fixed top-28 right-8 bg-green-500 text-white py-4 px-8 rounded-xl shadow-lg z-50 animate-fade-in-out text-lg"
    }, message);
};
