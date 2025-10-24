import { useState, useEffect } from 'react';

const useBreakpoint = () => {
  const [breakpoint, setBreakpoint] = useState('');

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) setBreakpoint('sm');
      else if (window.innerWidth < 768) setBreakpoint('md');
      else if (window.innerWidth < 1024) setBreakpoint('lg');
      else if (window.innerWidth < 1280) setBreakpoint('xl');
      else setBreakpoint('2xl');
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return {
    breakpoint,
    isMobile: breakpoint === 'sm',
    isTablet: breakpoint === 'md',
    isDesktop: ['lg', 'xl', '2xl'].includes(breakpoint)
  };
};

export default useBreakpoint;