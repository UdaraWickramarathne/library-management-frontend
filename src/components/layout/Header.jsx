import { useState } from 'react';
import { Bell, Search, Menu } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/Button';

const Header = ({ onMenuClick }) => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <header className="bg-slate-800 border-b border-slate-700 py-4">
      <div className="max-w-full lg:ml-4 lg:mr-6 mx-6">
        <div className="flex items-center justify-between">
          {/* Left side */}
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={onMenuClick}
              className="lg:hidden mr-2"
            >
              <Menu className="w-5 h-5" />
            </Button>
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search books, users, loans..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-slate-700 border border-slate-600 rounded-lg text-gray-100 placeholder-gray-400 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-colors duration-200 pl-10 pr-4 py-2 w-64 lg:w-96"
              />
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-3">
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
