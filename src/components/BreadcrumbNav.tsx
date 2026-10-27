/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  ChevronRight,
  Home,
  Building2,
  Shield,
  UserCheck,
  FileCheck2,
  Gauge,
  Database,
  UploadCloud,
  FileText,
  Lock,
  QrCode,
  Layers,
  ChevronDown,
  Check,
  Copy,
  ArrowLeft
} from 'lucide-react';
import { ScreenId } from './Navbar.tsx';
import { UserSession } from '../services/apiService.ts';
import { Institution } from '../types.ts';
import { resolveBreadcrumbs, BreadcrumbItem, BreadcrumbIconType } from '../utils/breadcrumbs.ts';

interface BreadcrumbNavProps {
  currentScreen: ScreenId;
  currentUser: UserSession | null;
  activeInstitution?: Institution;
  activeStudentName?: string;
  activeSubTabLabel?: string;
  institutions?: Institution[];
  onNavigate: (screen: ScreenId) => void;
  onSelectInstitution?: (id: string) => void;
  onBack?: () => void;
  canGoBack?: boolean;
  previousScreenLabel?: string;
}

const ICON_MAP: Record<BreadcrumbIconType, React.ComponentType<{ className?: string }>> = {
  home: Home,
  building: Building2,
  shield: Shield,
  user: UserCheck,
  'file-check': FileCheck2,
  gauge: Gauge,
  database: Database,
  upload: UploadCloud,
  'file-text': FileText,
  lock: Lock,
  qr: QrCode,
  cases: Layers,
  simulator: Gauge
};

export const BreadcrumbNav: React.FC<BreadcrumbNavProps> = ({
  currentScreen,
  currentUser,
  activeInstitution,
  activeStudentName,
  activeSubTabLabel,
  institutions = [],
  onNavigate,
  onSelectInstitution,
  onBack,
  canGoBack = false,
  previousScreenLabel
}) => {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const dropdownRef = useRef<HTMLOListElement>(null);

  const crumbs = resolveBreadcrumbs({
    screen: currentScreen,
    userRole: currentUser?.role,
    institution: activeInstitution,
    studentName: activeStudentName,
    activeTabLabel: activeSubTabLabel
  });

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCopyPath = () => {
    const pathText = crumbs.map(c => c.label).join(' > ');
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(pathText).catch(() => {
        try {
          const textarea = document.createElement('textarea');
          textarea.value = pathText;
          textarea.style.position = 'fixed';
          textarea.style.opacity = '0';
          document.body.appendChild(textarea);
          textarea.select();
          document.execCommand('copy');
          document.body.removeChild(textarea);
        } catch {
          // ignore
        }
      });
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <nav
      aria-label="Hierarchical Breadcrumb"
      className="bg-white/95 border border-slate-200/90 rounded-xl px-3.5 py-2 shadow-2xs text-xs mb-5 flex flex-wrap items-center justify-between gap-2.5 transition-all"
    >
      {/* Left Area: Back Button + Breadcrumb Trail */}
      <div className="flex flex-wrap items-center gap-2.5 min-w-0">
        {/* Back Button for sub-screens */}
        {canGoBack && onBack && (
          <div className="flex items-center shrink-0 pr-2 border-r border-slate-200">
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200/80 text-slate-700 hover:text-slate-900 text-xs font-semibold border border-slate-200/90 shadow-2xs transition-all cursor-pointer group"
              title={previousScreenLabel ? `Back to ${previousScreenLabel}` : 'Back to previous screen'}
              aria-label={previousScreenLabel ? `Back to ${previousScreenLabel}` : 'Back to previous screen'}
            >
              <ArrowLeft className="w-3.5 h-3.5 text-slate-500 group-hover:-translate-x-0.5 transition-transform" />
              <span>Back</span>
              {previousScreenLabel && (
                <span className="hidden xl:inline text-[10px] font-normal text-slate-500 font-sans">
                  to {previousScreenLabel}
                </span>
              )}
            </button>
          </div>
        )}

        {/* Breadcrumb Trail */}
        <ol className="flex flex-wrap items-center gap-1.5 min-w-0" ref={dropdownRef}>
        {crumbs.map((crumb, idx) => {
          const isLast = idx === crumbs.length - 1;
          const Icon = crumb.iconType ? ICON_MAP[crumb.iconType] : null;
          const hasPeers = crumb.peerLinks && crumb.peerLinks.length > 0;
          const isInstEntity = crumb.id === 'inst-entity' && institutions.length > 1;

          return (
            <li key={crumb.id} className="flex items-center gap-1.5 min-w-0">
              {idx > 0 && (
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0 select-none" aria-hidden="true" />
              )}

              <div className="relative inline-flex items-center">
                {isLast ? (
                  // Current Leaf Node
                  <div
                    aria-current="page"
                    className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-100/90 text-slate-900 font-semibold tracking-tight"
                  >
                    {Icon && <Icon className="w-3.5 h-3.5 text-teal-700 shrink-0" />}
                    <span className="truncate max-w-[200px] sm:max-w-[280px]" title={crumb.label}>
                      {crumb.label}
                    </span>
                    {crumb.badge && (
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded-full font-medium border ${
                          crumb.badgeColor || 'bg-slate-200 text-slate-700 border-slate-300'
                        }`}
                      >
                        {crumb.badge}
                      </span>
                    )}
                  </div>
                ) : (
                  // Clickable Ancestor Link
                  <div className="inline-flex items-center">
                    <button
                      type="button"
                      onClick={() => crumb.screen && onNavigate(crumb.screen)}
                      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-slate-600 hover:text-teal-900 hover:bg-slate-100 font-medium transition cursor-pointer ${
                        !crumb.screen ? 'cursor-default text-slate-500' : ''
                      }`}
                      title={crumb.subLabel ? `${crumb.label} (${crumb.subLabel})` : crumb.label}
                    >
                      {Icon && <Icon className="w-3.5 h-3.5 text-slate-500 shrink-0" />}
                      <span className="truncate max-w-[140px] sm:max-w-[200px]">{crumb.label}</span>
                    </button>

                    {/* Peer Links Dropdown (e.g. switch between peer screens in same domain) */}
                    {hasPeers && (
                      <button
                        type="button"
                        onClick={() => setOpenDropdown(openDropdown === crumb.id ? null : crumb.id)}
                        className="p-1 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-100 transition cursor-pointer"
                        title="Explore related workspaces in this domain"
                        aria-expanded={openDropdown === crumb.id}
                      >
                        <ChevronDown className="w-3 h-3" />
                      </button>
                    )}

                    {/* Popover Menu for Peers */}
                    {openDropdown === crumb.id && crumb.peerLinks && (
                      <div className="absolute left-0 top-full mt-1.5 w-52 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                        <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 mb-1">
                          {crumb.label} Workspaces
                        </div>
                        {crumb.peerLinks.map((peer) => (
                          <button
                            key={peer.id}
                            type="button"
                            onClick={() => {
                              onNavigate(peer.id);
                              setOpenDropdown(null);
                            }}
                            className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between transition cursor-pointer ${
                              currentScreen === peer.id
                                ? 'bg-teal-50 text-teal-800 font-semibold'
                                : 'text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            <span>{peer.label}</span>
                            {currentScreen === peer.id && <Check className="w-3 h-3 text-teal-700" />}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* College Switcher on Entity node if applicable */}
                {isInstEntity && isLast && onSelectInstitution && (
                  <div className="relative inline-flex items-center ml-1">
                    <button
                      type="button"
                      onClick={() => setOpenDropdown(openDropdown === 'inst-picker' ? null : 'inst-picker')}
                      className="p-0.5 text-slate-400 hover:text-slate-700 rounded transition cursor-pointer"
                      title="Switch active institution"
                    >
                      <ChevronDown className="w-3 h-3" />
                    </button>
                    {openDropdown === 'inst-picker' && (
                      <div className="absolute left-0 top-full mt-1.5 w-64 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                        <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 mb-1">
                          Switch Active College
                        </div>
                        {institutions.map((inst) => (
                          <button
                            key={inst.id}
                            type="button"
                            onClick={() => {
                              onSelectInstitution(inst.id);
                              setOpenDropdown(null);
                            }}
                            className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between transition cursor-pointer ${
                              activeInstitution?.id === inst.id
                                ? 'bg-teal-50 text-teal-800 font-semibold'
                                : 'text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            <div>
                              <div className="font-medium text-slate-800">{inst.name.split(',')[0]}</div>
                              <div className="text-[10px] text-slate-400 font-mono">{inst.aicte_id}</div>
                            </div>
                            {activeInstitution?.id === inst.id && <Check className="w-3.5 h-3.5 text-teal-700 shrink-0" />}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ol>
      </div>

      {/* Right Side Utilities: Hierarchy Depth & Copy Path */}
      <div className="flex items-center gap-2 text-[11px] text-slate-500 shrink-0">
        <span className="hidden md:inline px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-mono text-[10px] border border-slate-200">
          Level {crumbs.length} Architecture
        </span>
        <button
          type="button"
          onClick={handleCopyPath}
          className="flex items-center gap-1 px-2 py-1 rounded text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition cursor-pointer border border-transparent hover:border-slate-200"
          title="Copy breadcrumb hierarchy path to clipboard"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-teal-700" />
              <span className="text-teal-700 font-medium">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Copy Path</span>
            </>
          )}
        </button>
      </div>
    </nav>
  );
};
