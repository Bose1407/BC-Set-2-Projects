import React, { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { Web3Provider } from './contexts/Web3Context';
import { WalletConnection } from './components/WalletConnection';
import { Navigation } from './components/Navigation';
import { SupplyTrust } from './components/SupplyTrust';
import { EduFund } from './components/EduFund';
import { Zap } from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = useState<'supply' | 'edu'>('supply');

  return (
    <Web3Provider>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Toaster position="top-right" />
        
        {/* Header */}
        <header className="bg-white shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <Zap className="h-8 w-8 text-blue-500" />
                <h1 className="text-2xl font-bold text-gray-900">Web3 DApp Hub</h1>
              </div>
              <WalletConnection />
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
          
          <div className="bg-white rounded-2xl shadow-xl p-8">
            {activeTab === 'supply' ? <SupplyTrust /> : <EduFund />}
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-gray-800 text-white py-8 mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-gray-300">
              Built with React, Ethers.js, and Tailwind CSS for Web3 contract interaction
            </p>
          </div>
        </footer>
      </div>
    </Web3Provider>
  );
}

export default App;