import React from 'react';
import { Package, GraduationCap } from 'lucide-react';

interface NavigationProps {
  activeTab: 'supply' | 'edu';
  onTabChange: (tab: 'supply' | 'edu') => void;
}

export function Navigation({ activeTab, onTabChange }: NavigationProps) {
  return (
    <div className="flex space-x-4 mb-8">
      <button
        onClick={() => onTabChange('supply')}
        className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-colors ${
          activeTab === 'supply'
            ? 'bg-blue-500 text-white'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`}
      >
        <Package className="h-5 w-5" />
        <span>SupplyTrust</span>
      </button>
      <button
        onClick={() => onTabChange('edu')}
        className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-colors ${
          activeTab === 'edu'
            ? 'bg-green-500 text-white'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`}
      >
        <GraduationCap className="h-5 w-5" />
        <span>EduFund</span>
      </button>
    </div>
  );
}