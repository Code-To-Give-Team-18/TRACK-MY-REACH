import { Home, Search, Settings, User, Menu, ChevronRight, Check } from 'lucide-react';

export default function IconExample() {
  return (
    <div className="p-8 space-y-4">
      <h1 className="text-2xl font-bold mb-4">Lucide Icons Examples</h1>
      
      {/* Basic usage */}
      <div className="flex gap-4">
        <Home />
        <Search />
        <Settings />
        <User />
      </div>

      {/* With size */}
      <div className="flex gap-4">
        <Home size={16} />
        <Home size={24} />
        <Home size={32} />
      </div>

      {/* With color */}
      <div className="flex gap-4">
        <Home className="text-blue-500" />
        <Search className="text-green-500" />
        <Settings className="text-purple-500" />
      </div>

      {/* With stroke width */}
      <div className="flex gap-4">
        <Menu strokeWidth={1} />
        <Menu strokeWidth={2} />
        <Menu strokeWidth={3} />
      </div>

      {/* In a button */}
      <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md">
        <Check size={20} />
        Save Changes
      </button>

      {/* As a link */}
      <a href="#" className="flex items-center gap-1 text-blue-500 hover:underline">
        View More
        <ChevronRight size={16} />
      </a>
    </div>
  );
}