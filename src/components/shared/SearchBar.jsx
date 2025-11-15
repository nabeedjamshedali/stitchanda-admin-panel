import { Search } from 'lucide-react';

const SearchBar = ({
  value,
  onChange,
  placeholder = 'Search...',
  onEnter
}) => {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && onEnter) {
      onEnter(value);
    }
  };

  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="h-5 w-5 text-gray-400" />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        placeholder={placeholder}
      />
    </div>
  );
};

export default SearchBar;
