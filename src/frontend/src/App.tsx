import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import HomePage from './pages/HomePage';
import VyperCompilerPage from './pages/VyperCompilerPage';
import SearchPage from './pages/SearchPage';
import WalletConnectButton from './components/WalletConnectButton';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-900 text-gray-100 font-sans">
        <header className="flex justify-between items-center p-4 border-b border-gray-700">
          <Link to="/" className="text-2xl font-bold text-versoriumx-blue">VersoriumX</Link>
          <nav className="flex space-x-6">
            <Link to="/" className="text-lg hover:text-versoriumx-light-blue transition-colors">Home</Link>
            <Link to="/compiler" className="text-lg hover:text-versoriumx-light-blue transition-colors">Vyper Compiler</Link>
            <Link to="/search" className="text-lg hover:text-versoriumx-light-blue transition-colors">AI Search</Link>
          </nav>
          <WalletConnectButton />
        </header>

        <main className="container mx-auto p-6">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/compiler" element={<VyperCompilerPage />} />
            <Route path="/search" element={<SearchPage />} />
          </Routes>
        </main>

        <footer className="mt-8 p-4 text-center text-gray-500 border-t border-gray-700">
          © {new Date().getFullYear()} VersoriumX. All rights reserved. Powered by Web3 & AI.
        </footer>
      </div>
    </Router>
  );
}

export default App;
