export const themeClasses = {
    blue: {
        name: 'Ocean Blue',
        bg: 'modern-button',
        hoverBg: 'modern-button',
        text: 'gradient-text',
        hoverText: 'gradient-text',
        border: 'focus:border-blue-500',
        ring: 'focus:ring-blue-500 focus:ring-opacity-30',
        iconBg: 'bg-gradient-to-br from-blue-100 to-blue-200',
        iconText: 'text-blue-700',
        gradient: 'bg-gradient-to-r from-blue-500 to-purple-600',
        cardBg: 'modern-card'
    },
    green: {
        name: 'Emerald',
        bg: 'bg-gradient-to-r from-emerald-500 to-teal-600',
        hoverBg: 'hover:from-emerald-600 hover:to-teal-700',
        text: 'text-emerald-600',
        hoverText: 'hover:text-emerald-700',
        border: 'focus:border-emerald-500',
        ring: 'focus:ring-emerald-500 focus:ring-opacity-30',
        iconBg: 'bg-gradient-to-br from-emerald-100 to-teal-200',
        iconText: 'text-emerald-700',
        gradient: 'bg-gradient-to-r from-emerald-500 to-teal-600',
        cardBg: 'modern-card'
    },
    teal: {
        name: 'Teal Wave',
        bg: 'bg-gradient-to-r from-teal-500 to-cyan-600',
        hoverBg: 'hover:from-teal-600 hover:to-cyan-700',
        text: 'text-teal-600',
        hoverText: 'hover:text-teal-700',
        border: 'focus:border-teal-500',
        ring: 'focus:ring-teal-500 focus:ring-opacity-30',
        iconBg: 'bg-gradient-to-br from-teal-100 to-cyan-200',
        iconText: 'text-teal-700',
        gradient: 'bg-gradient-to-r from-teal-500 to-cyan-600',
        cardBg: 'modern-card'
    },
    indigo: {
        name: 'Deep Purple',
        bg: 'bg-gradient-to-r from-indigo-500 to-purple-600',
        hoverBg: 'hover:from-indigo-600 hover:to-purple-700',
        text: 'text-indigo-600',
        hoverText: 'hover:text-indigo-700',
        border: 'focus:border-indigo-500',
        ring: 'focus:ring-indigo-500 focus:ring-opacity-30',
        iconBg: 'bg-gradient-to-br from-indigo-100 to-purple-200',
        iconText: 'text-indigo-700',
        gradient: 'bg-gradient-to-r from-indigo-500 to-purple-600',
        cardBg: 'modern-card'
    },
    purple: {
        name: 'Violet Dream',
        bg: 'bg-gradient-to-r from-purple-500 to-pink-600',
        hoverBg: 'hover:from-purple-600 hover:to-pink-700',
        text: 'text-purple-600',
        hoverText: 'hover:text-purple-700',
        border: 'focus:border-purple-500',
        ring: 'focus:ring-purple-500 focus:ring-opacity-30',
        iconBg: 'bg-gradient-to-br from-purple-100 to-pink-200',
        iconText: 'text-purple-700',
        gradient: 'bg-gradient-to-r from-purple-500 to-pink-600',
        cardBg: 'modern-card'
    },
    ember: {
        name: 'Sunrise Ember',
        bg: 'bg-gradient-to-r from-red-500 to-orange-500',
        hoverBg: 'hover:from-red-600 hover:to-orange-600',
        text: 'text-red-600',
        hoverText: 'hover:text-red-700',
        border: 'focus:border-red-500',
        ring: 'focus:ring-red-500 focus:ring-opacity-30',
        iconBg: 'bg-gradient-to-br from-red-100 to-orange-200',
        iconText: 'text-red-700',
        gradient: 'bg-gradient-to-r from-red-500 to-orange-500',
        cardBg: 'modern-card'
    },
    citrus: {
        name: 'Citrus Glow',
        bg: 'bg-gradient-to-r from-amber-500 to-yellow-500',
        hoverBg: 'hover:from-amber-600 hover:to-yellow-600',
        text: 'text-amber-600',
        hoverText: 'hover:text-amber-700',
        border: 'focus:border-amber-500',
        ring: 'focus:ring-amber-500 focus:ring-opacity-30',
        iconBg: 'bg-gradient-to-br from-amber-100 to-yellow-200',
        iconText: 'text-amber-700',
        gradient: 'bg-gradient-to-r from-amber-500 to-yellow-500',
        cardBg: 'modern-card'
    },
    sunset: {
        name: 'Golden Sunset',
        bg: 'bg-gradient-to-r from-orange-500 to-amber-600',
        hoverBg: 'hover:from-orange-600 hover:to-amber-700',
        text: 'text-orange-600',
        hoverText: 'hover:text-orange-700',
        border: 'focus:border-orange-500',
        ring: 'focus:ring-orange-500 focus:ring-opacity-30',
        iconBg: 'bg-gradient-to-br from-orange-100 to-amber-200',
        iconText: 'text-orange-700',
        gradient: 'bg-gradient-to-r from-orange-500 to-amber-600',
        cardBg: 'modern-card'
    },
    red: {
        bg: 'bg-gradient-to-r from-red-500 to-rose-600',
        hoverBg: 'hover:from-red-600 hover:to-rose-700',
        gradient: 'bg-gradient-to-r from-red-500 to-rose-600'
    },
    gray: {
        bg: 'bg-gradient-to-r from-gray-500 to-slate-600',
        hoverBg: 'hover:from-gray-600 hover:to-slate-700',
        gradient: 'bg-gradient-to-r from-gray-500 to-slate-600'
    }
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
