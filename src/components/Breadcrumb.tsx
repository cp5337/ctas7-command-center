import React from 'react';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  id: string;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
}

interface Props {
  items: BreadcrumbItem[];
  activeItem: string;
  onNavigate: (itemId: string) => void;
}

export function Breadcrumb({ items, activeItem, onNavigate }: Props) {
  return (
    <nav className="flex items-center space-x-2 text-sm py-2">
      <button
        onClick={() => onNavigate('overview')}
        className="flex items-center space-x-1 text-slate-400 hover:text-slate-200 transition-colors"
      >
        <Home size={14} />
        <span>Home</span>
      </button>
      
      {items.map((item, index) => {
        const Icon = item.icon;
        const isActive = item.id === activeItem;
        const isLast = index === items.length - 1;
        
        return (
          <React.Fragment key={item.id}>
            <ChevronRight size={14} className="text-slate-500" />
            <button
              onClick={() => onNavigate(item.id)}
              className={`flex items-center space-x-1 transition-colors ${
                isActive 
                  ? 'text-cyan-400 font-medium' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {Icon && <Icon size={14} />}
              <span>{item.label}</span>
            </button>
          </React.Fragment>
        );
      })}
    </nav>
  );
}