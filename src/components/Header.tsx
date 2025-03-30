import { useEffect, useState } from "react";
import GoLogo from "./GoLogo";
import { ExternalLink } from "lucide-react";

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  // const { theme, setTheme } = useTheme(); // Removed useTheme usage

  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      if (offset > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out
      ${
        scrolled
          ? "bg-background/90 backdrop-blur-md shadow-sm py-3" // Removed dark:bg-background/80
          : "bg-transparent py-5"
      }`}
    >
      <div className="container mx-auto px-6 flex items-center justify-between">
        <div className="flex items-center space-x-3 animate-fade-in">
          <GoLogo size={36} />
          <h1 className="text-2xl font-medium text-foreground">
            Go Cheatsheet
          </h1>
        </div>

        <div className="flex items-center space-x-4">
          {" "}
          {/* Adjusted spacing */}
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
            href="https://github.com/tKwbr999/go-cheat-sheet-garden" // Updated repo URL
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center text-sm text-muted-foreground hover:text-primary transition-colors duration-200" // Hide on small screens
          >
            <img src="/public/github-mark.svg" alt="GitHub" width={18} height={18} className="mr-1" />
            <span>GitHub</span>
          </a>
          {/* Theme Toggle Dropdown Removed */}
        </div>
      </div>
    </header>
  );
};

export default Header;
