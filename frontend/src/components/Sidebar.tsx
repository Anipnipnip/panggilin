import React from 'react'
import { Radio, Layers, ChevronLeft, ChevronRight, Moon, Sun } from 'lucide-react'
import type { Theme } from '../types'

interface SidebarProps {
  currentTab: 'events' | 'endpoints'
  onSelectTab: (tab: 'events' | 'endpoints') => void
  isCollapsed: boolean
  onToggleCollapse: () => void
  theme: Theme
  onToggleTheme: () => void
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isCollapsed,
  onToggleCollapse,
  theme,
  onToggleTheme,
}) => {
  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <div className="brand-wrapper">
          <div className="brand-icon" title="Panggilin">
            P
          </div>
          {!isCollapsed && (
            <div>
              <div className="brand-name">Panggilin</div>
              <div className="brand-tagline">Panggil. Periksa. Ulangi.</div>
            </div>
          )}
        </div>
        <button
          className="btn btn-icon-only"
          onClick={onToggleCollapse}
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>

      <nav className="sidebar-nav">
        <button
          className={`nav-item ${currentTab === 'events' ? 'active' : ''}`}
          onClick={() => onSelectTab('events')}
          title="Events"
        >
          <Radio size={16} />
          {!isCollapsed && <span>Events</span>}
        </button>
        <button
          className={`nav-item ${currentTab === 'endpoints' ? 'active' : ''}`}
          onClick={() => onSelectTab('endpoints')}
          title="Endpoints"
        >
          <Layers size={16} />
          {!isCollapsed && <span>Endpoints</span>}
        </button>
      </nav>

      <div className="sidebar-footer">
        <button
          className="btn btn-icon-only"
          onClick={onToggleTheme}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          aria-label={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
        </button>
        {!isCollapsed && (
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            v1.2 (MVP)
          </span>
        )}
      </div>
    </aside>
  )
}
