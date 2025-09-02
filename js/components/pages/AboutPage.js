export const AboutPage = ({ config, theme }) => {
    return React.createElement('div', {
        className: "container mx-auto px-8 py-20 fade-in"
    }, [
        React.createElement('h1', {
            key: "title",
            className: "text-5xl font-extrabold text-center text-gray-800 mb-16"
        }, `About ${config.hoaName}`),
        React.createElement('div', {
            key: "content",
            className: "bg-white p-12 rounded-2xl shadow-xl max-w-5xl mx-auto"
        }, [
            React.createElement('h2', {
                key: "mgmt-title",
                className: "text-4xl font-bold text-gray-800 mb-6"
            }, "Management Company"),
            React.createElement('p', {
                key: "mgmt-info",
                className: "text-gray-700 leading-relaxed text-lg mb-10"
            }, config.managementCompanyInfo),
            React.createElement('h2', {
                key: "board-title",
                className: "text-4xl font-bold text-gray-800 mb-8"
            }, "Board of Directors"),
            React.createElement('ul', {
                key: "board-list",
                className: "space-y-5 text-gray-700"
            }, config.boardMembers.map((member, index) =>
                React.createElement('li', {
                    key: index,
                    className: "text-xl"
                }, [
                    React.createElement('strong', {
                        key: "title",
                        className: "font-semibold"
                    }, `${member.title}:`),
                    ` ${member.name}`
                ])
            )),
            React.createElement('div', {
                key: "divider",
                className: "border-t my-10"
            }),
            React.createElement('h2', {
                key: "contact-title",
                className: "text-4xl font-bold text-gray-800 mt-10 mb-6"
            }, "Contact Information"),
            React.createElement('p', {
                key: "contact-info",
                className: "text-gray-700 leading-relaxed text-xl"
            }, [
                React.createElement('strong', { key: "pm-label" }, "Property Manager:"),
                ` ${config.contactInfo.propertyManager}`,
                React.createElement('br', { key: "br1" }),
                React.createElement('strong', { key: "email-label" }, "Email:"),
                " ",
                React.createElement('a', {
                    key: "email-link",
                    href: `mailto:${config.contactInfo.email}`,
                    className: `${theme.text} hover:underline font-semibold`
                }, config.contactInfo.email),
                React.createElement('br', { key: "br2" }),
                React.createElement('strong', { key: "phone-label" }, "Phone:"),
                ` ${config.contactInfo.phone}`,
                React.createElement('br', { key: "br3" }),
                React.createElement('strong', { key: "address-label" }, "Address:"),
                ` ${config.contactInfo.address}`
            ])
        ])
    ]);
};
