import { themeClasses } from '../../utils/themes.js';

export const ConfirmationModal = ({ theme, message, onConfirm, onCancel }) => {
    return React.createElement('div', {
        className: "modal-backdrop"
    },
        React.createElement('div', {
            className: "bg-white p-10 rounded-xl shadow-2xl w-full max-w-md relative text-center"
        }, [
            React.createElement('h2', {
                key: "title",
                className: "text-2xl font-bold text-gray-800 mb-5"
            }, "Confirm Action"),
            React.createElement('p', {
                key: "message",
                className: "text-gray-600 text-lg mb-8"
            }, message),
            React.createElement('div', {
                key: "buttons",
                className: "mt-8 flex justify-center gap-5"
            }, [
                React.createElement('button', {
                    key: "cancel",
                    onClick: onCancel,
                    className: "bg-gray-200 text-gray-800 font-semibold py-3 px-8 rounded-lg hover:bg-gray-300"
                }, "Cancel"),
                React.createElement('button', {
                    key: "confirm",
                    onClick: onConfirm,
                    className: `${themeClasses.red.bg} text-white font-semibold py-3 px-8 rounded-lg ${themeClasses.red.hoverBg}`
                }, "Delete")
            ])
        ])
    );
};
