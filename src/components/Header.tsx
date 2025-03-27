import React, { useEffect, useState } from 'react';
import GoLogo from './GoLogo';
import { Github, ExternalLink, Sun, Moon } from 'lucide-react'; // Added Sun, Moon
import { useTheme } from '@/hooks/use-theme'; // Import the custom hook
import { Button } from "@/components/ui/button"; // Import Button
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"; // Import DropdownMenu components

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const { theme, setTheme } = useTheme(); // Use the theme hook

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
      ${scrolled
        ? 'bg-background/90 dark:bg-background/80 backdrop-blur-md shadow-sm py-3'
        : 'bg-transparent py-5'
      }`}
    >
      <div className="container mx-auto px-6 flex items-center justify-between">
        <div className="flex items-center space-x-3 animate-fade-in">
          <GoLogo size={36} />
          <h1 className="text-2xl font-medium text-foreground">Go Cheatsheet</h1>
        </div>

        <div className="flex items-center space-x-4"> {/* Adjusted spacing */}
          {/* Links */}
          <a
            href="https://go.dev/doc/"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center text-sm text-muted-foreground hover:text-primary transition-colors duration-200" // Hide on small screens
          >
            <ExternalLink size={18} className="mr-1" />
            <span>公式サイト</span>
          </a>
          <a
            href="https://github.com/your-repo/go-cheat-sheet-garden" // TODO: Update with actual repo URL
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center text-sm text-muted-foreground hover:text-primary transition-colors duration-200" // Hide on small screens
          >
            <Github size={18} className="mr-1" />
            <span>GitHub</span>
          </a>

          {/* Theme Toggle Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setTheme('light')}>
                Light
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme('dark')}>
                Dark
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme('system')}>
                System
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Header;
