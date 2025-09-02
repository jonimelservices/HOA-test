export const themeClasses = {
    blue: { name: 'Blue', bg: 'bg-blue-600', hoverBg: 'hover:bg-blue-700', text: 'text-blue-600', hoverText: 'hover:text-blue-600', border: 'focus:border-blue-500', ring: 'focus:ring-blue-500', iconBg: 'bg-blue-100', iconText: 'text-blue-600' },
    green: { name: 'Green', bg: 'bg-green-600', hoverBg: 'hover:bg-green-700', text: 'text-green-600', hoverText: 'hover:text-green-600', border: 'focus:border-green-500', ring: 'focus:ring-green-500', iconBg: 'bg-green-100', iconText: 'text-green-600' },
    teal: { name: 'Teal', bg: 'bg-teal-600', hoverBg: 'hover:bg-teal-700', text: 'text-teal-600', hoverText: 'hover:text-teal-600', border: 'focus:border-teal-500', ring: 'focus:ring-teal-500', iconBg: 'bg-teal-100', iconText: 'text-teal-600' },
    indigo: { name: 'Indigo', bg: 'bg-indigo-600', hoverBg: 'hover:bg-indigo-700', text: 'text-indigo-600', hoverText: 'hover:text-indigo-600', border: 'focus:border-indigo-500', ring: 'focus:ring-indigo-500', iconBg: 'bg-indigo-100', iconText: 'text-indigo-600' },
    purple: { name: 'Purple', bg: 'bg-purple-600', hoverBg: 'hover:bg-purple-700', text: 'text-purple-600', hoverText: 'hover:text-purple-600', border: 'focus:border-purple-500', ring: 'focus:ring-purple-500', iconBg: 'bg-purple-100', iconText: 'text-purple-600' },
    red: { bg: 'bg-red-500', hoverBg: 'hover:bg-red-600' },
    gray: { bg: 'bg-gray-500', hoverBg: 'hover:bg-gray-600' }
};

export const initialHoaConfig = {
    id: 1,
    hoaName: "Sunny Palms HOA",
    heroImageUrl: "https://images.pexels.com/photos/210552/pexels-photo-210552.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    managementCompanyInfo: "Our community is professionally managed by Example Management Company. They are responsible for the day-to-day operations, maintenance of common areas, and financial management. For any inquiries, please contact them directly.",
    contactInfo: {
        email: "board@sunnypalmshoa.com",
        phone: "555-123-4567",
        address: "123 Ocean View Dr, Miami, FL 33139",
        propertyManager: "Alex Green"
    },
    boardMembers: [
        { title: "President", name: "Jane Doe" },
        { title: "Vice President", name: "John Smith" },
        { title: "Treasurer", name: "Emily White" },
        { title: "Secretary", name: "Michael Brown" },
    ],
    themeName: 'blue'
};
