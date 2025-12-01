export function Header() {
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white">S</span>
            </div>
            <span>Smart Finances</span>
          </div>
          
          <nav className="hidden md:flex items-center gap-8">
            <a href="#" className="text-gray-900 hover:text-blue-600 transition-colors">
              Dashboard
            </a>
            <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">
              Goals
            </a>
            <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">
              Transactions
            </a>
          </nav>
        </div>
      </div>
    </header>
  );
}
