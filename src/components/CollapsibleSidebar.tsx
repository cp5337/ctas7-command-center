import React, { useState } from 'react';
import {
  Globe,
  BookOpen,
  Wifi,
  DollarSign,
  Target,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { getWalkerDeltaPositions } from '../services/orbitalMechanics';

interface CollapsibleSidebarProps {
  activeTab: 'satellites' | 'research' | 'laser' | 'financial';
  onTabChange: (tab: 'satellites' | 'research' | 'laser' | 'financial') => void;
  onQuickJump: (target: string) => void;
}

export function CollapsibleSidebar({ activeTab, onTabChange, onQuickJump }: CollapsibleSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(true);

  const navigationTabs = [
    { id: 'satellites', label: '3D Satellites', icon: Globe, color: 'cyan' },
    { id: 'research', label: 'Research Paper', icon: BookOpen, color: 'blue' },
    { id: 'laser', label: 'Laser Light', icon: Wifi, color: 'red' },
    { id: 'financial', label: 'Financial', icon: DollarSign, color: 'green' },
  ];

  const getTabColorClasses = (color: string, isActive: boolean) => {
    const colors = {
      cyan: isActive ? 'bg-cyan-500 text-white' : 'text-cyan-400 hover:bg-cyan-500/20',
      blue: isActive ? 'bg-blue-500 text-white' : 'text-blue-400 hover:bg-blue-500/20',
      red: isActive ? 'bg-red-500 text-white' : 'text-red-400 hover:bg-red-500/20',
      green: isActive ? 'bg-green-500 text-white' : 'text-green-400 hover:bg-green-500/20',
    };
    return colors[color as keyof typeof colors];
  };

  return (
    <div className={`
      fixed left-0 top-[73px] h-[calc(100vh-73px)] bg-slate-900/95 backdrop-blur border-r border-slate-700/50
      transition-all duration-300 z-40 flex flex-col
      ${isCollapsed ? 'w-12' : 'w-64'}
    `}>

      {/* Navigation Tabs */}
      <div className="flex-1 overflow-y-auto">
        {!isCollapsed && (
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
                Command Center
              </h2>
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 rounded transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {isCollapsed && (
          <div className="p-1">
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="w-full p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 transition-colors"
            >
              <ChevronRight className="w-3 h-3 mx-auto" />
            </button>
          </div>
        )}

        <nav className={`${isCollapsed ? 'px-0' : 'px-4'}`}>
          <div className="space-y-1">
            {navigationTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id as any)}
                  className={`
                    w-full flex items-center justify-center ${isCollapsed ? 'px-0 py-2' : 'space-x-3 px-3 py-2.5'}
                    transition-all duration-200 text-sm font-medium
                    ${getTabColorClasses(tab.color, isActive)}
                  `}
                  title={isCollapsed ? tab.label : undefined}
                >
                  <Icon className={`${isCollapsed ? 'w-4 h-4' : 'w-4 h-4'} flex-shrink-0`} />
                  {!isCollapsed && <span>{tab.label}</span>}
                </button>
              );
            })}
          </div>
        </nav>


      </div>

    </div>
  );
}