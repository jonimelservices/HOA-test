const { useState, useEffect } = React;

export const ScrollToTopButton = ({ theme }) => {
    const [isVisible, setIsVisible] = useState(false);

    const toggleVisibility = () => {
        if (window.pageYOffset > 300) {
            setIsVisible(true);
        } else {
            setIsVisible(false);
        }
    };
    
    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    useEffect(() => {
        window.addEventListener('scroll', toggleVisibility);
        return () => {
            window.removeEventListener('scroll', toggleVisibility);
        };
    }, []);
    
    return React.createElement('button', {
        onClick: scrollToTop,
        className: `${isVisible ? 'opacity-100' : 'opacity-0'} ${theme.bg} text-white rounded-full fixed bottom-10 right-10 w-14 h-14 shadow-lg flex items-center justify-center text-xl transition-opacity duration-300 z-50 hover:scale-110`
    }, React.createElement('i', {
        className: "fas fa-arrow-up"
    }));
};
