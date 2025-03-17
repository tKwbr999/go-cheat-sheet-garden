
import React from 'react';
import { Link } from 'react-scroll';

interface TableOfContentsProps {
  sections: { title: string; id: string }[];
  isOpen: boolean;
  onClose: () => void;
}

const TableOfContents: React.FC<TableOfContentsProps> = ({ sections, isOpen, onClose }) => {
  return (
    <div
      className={`fixed top-0 left-0 h-full bg-white z-50 shadow-lg transition-transform duration-300 transform ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 lg:static lg:h-auto lg:shadow-none`}
    >
      <div className="w-64 p-6 overflow-y-auto h-full">
        <div className="flex justify-between items-center mb-6 lg:hidden">
          <h3 className="font-medium text-lg">目次</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <nav>
          <ul className="space-y-3">
            {sections.map((section) => (
              <li key={section.id}>
                <Link
                  to={section.id}
                  spy={true}
                  smooth={true}
                  offset={-100}
                  duration={500}
                  className="block text-gray-600 hover:text-go-blue transition-colors duration-200 cursor-pointer"
                  activeClass="text-go-blue font-medium"
                >
                  {section.title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default TableOfContents;
