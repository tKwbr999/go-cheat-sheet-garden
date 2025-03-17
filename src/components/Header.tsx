
import React, { useEffect, useState } from 'react';
import GoLogo from './GoLogo';
import { Github, ExternalLink } from 'lucide-react';

const Header = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      if (offset > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out 
      ${scrolled ? 'bg-white/90 backdrop-blur-md shadow-sm py-3' : 'bg-transparent py-5'}`}
    >
      <div className="container mx-auto px-6 flex items-center justify-between">
        <div className="flex items-center space-x-3 animate-fade-in">
          <GoLogo size={36} />
          <h1 className="text-2xl font-medium text-gray-900">Go Cheatsheet</h1>
        </div>
        
        <div className="flex items-center space-x-6">
          <a 
            href="https://go.dev/doc/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center text-sm text-gray-600 hover:text-go-blue transition-colors duration-200"
          >
            <ExternalLink size={18} className="mr-1" />
            <span>公式サイト</span>
          </a>
          <a 
            href="https://github.com/golang/go" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center text-sm text-gray-600 hover:text-go-blue transition-colors duration-200"
          >
            <ExternalLink size={18} className="mr-1" />
            <span>GitHub</span>
          </a>
        </div>
      </div>
    </header>
  );
};

export default Header;
