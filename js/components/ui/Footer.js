export const Footer = ({ config }) => {
    return React.createElement('footer', {
        className: "bg-gray-900 text-white py-12"
    },
        React.createElement('div', {
            className: "container mx-auto px-8 text-center text-gray-400"
        }, [
            React.createElement('p', {
                key: "copyright"
            }, `© ${new Date().getFullYear()} ${config.hoaName}. All Rights Reserved.`),
            React.createElement('p', {
                key: "compliance",
                className: "text-base mt-2"
            }, "Managed by Your HOA Board | Website compliant with Florida Statute 720.")
        ])
    );
};
