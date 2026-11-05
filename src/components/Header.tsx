import React from 'react';
import { 
  Moon, 
  Sun, 
  UtensilsCrossed, 
  LayoutGrid, 
  TableProperties, 
  Smartphone, 
  Receipt 
} from 'lucide-react';
import { AppRole, AdminTab } from '../types';

interface HeaderProps {
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  currentRole: AppRole;
  onRoleChange: (role: AppRole) => void;
  activeAdminTab: AdminTab;
  onAdminTabChange: (tab: AdminTab) => void;
  activeTableName?: string;
}

export const Header: React.FC<HeaderProps> = ({
  isDarkMode,
  onToggleDarkMode,
  currentRole,
  onRoleChange,
  activeAdminTab,
  onAdminTabChange,
  activeTableName,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-sm shadow-emerald-600/20">
            <UtensilsCrossed className="w-5 h-5" />
          </div>
          <div>
            <span className="text-base font-bold text-slate-900 dark:text-white tracking-tight whitespace-nowrap block leading-tight">
              RestoQuick
            </span>
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">
              Gestión de Mesas, Menú & Caja
            </span>
          </div>
        </div>

        {/* Zone 2: Navigation & Role Switcher */}
        <div className="hidden md:flex items-center gap-2">
          {/* Main Role Toggle */}
          <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => onRoleChange('admin')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                currentRole === 'admin'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Salón & Caja</span>
            </button>

            <button
              type="button"
              onClick={() => onRoleChange('cliente')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                currentRole === 'cliente'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Carta / Menú Digital</span>
            </button>
          </div>

          {/* Sub-tabs for Admin */}
          {currentRole === 'admin' && (
            <div className="flex items-center gap-1 pl-2 border-l border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => onAdminTabChange('plano')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                  activeAdminTab === 'plano'
                    ? 'text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/40'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Plano de Mesas
              </button>

              <button
                type="button"
                onClick={() => onAdminTabChange('ventas')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                  activeAdminTab === 'ventas'
                    ? 'text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/40'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Planilla de Ventas
              </button>
            </div>
          )}
        </div>

        {/* Zone 3: Mobile Mode Pill & Dark Mode Control */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Mobile Role Switch Button */}
          <button
            type="button"
            onClick={() => onRoleChange(currentRole === 'admin' ? 'cliente' : 'admin')}
            className="md:hidden inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
          >
            {currentRole === 'admin' ? (
              <>
                <Smartphone className="w-3.5 h-3.5" />
                <span>Ver Menú</span>
              </>
            ) : (
              <>
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Ver Salón</span>
              </>
            )}
          </button>

          {/* Theme Toggle */}
          <button
            type="button"
            onClick={onToggleDarkMode}
            className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            title={isDarkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            aria-label="Alternar tema claro y oscuro"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>
        </div>
      </div>
    </header>
  );
};
