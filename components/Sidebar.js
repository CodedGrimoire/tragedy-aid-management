'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  UsersIcon as UserGroupIcon,
  CalendarIcon,
  HomeIcon,
  UserIcon,
  BuildingOfficeIcon,
  HeartIcon,
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';

import Logo from './Logo';

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const checkSize = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth < 1024) {
        setCollapsed(true);
      }
    };

    checkSize();
    window.addEventListener('resize', checkSize);
    return () => window.removeEventListener('resize', checkSize);
  }, []);

  const menuItems = [
    { name: 'Dashboard', icon: HomeIcon, href: '/' },
    { name: 'Victim Summary', icon: UserGroupIcon, href: '/victimsummary' },
    { name: 'Victims', icon: UserIcon, href: '/victims' },
    { name: 'Events', icon: CalendarIcon, href: '/events' },
    { name: 'FamilySupport', icon: UserGroupIcon, href: '/families' },
    { name: 'FamilySupportSummary', icon: UserGroupIcon, href: '/subsidy' },
    { name: 'Subsidy', icon: CurrencyDollarIcon, href: '/gsubsidy' },  // ✅ Added Subsidy Section
    { name: 'NGOs', icon: BuildingOfficeIcon, href: '/ngos' },
    { name: 'Medical', icon: HeartIcon, href: '/medical' },
    { name: 'Tragedies', icon: ExclamationTriangleIcon, href: '/tragedies' },
  ];

  const toggleMobileSidebar = () => setMobileOpen(!mobileOpen);
  const toggleCollapse = () => setCollapsed(!collapsed);

  const isActive = (href) => pathname === href || pathname.startsWith(`${href}/`);

  const sidebarClasses = `bg-white shadow-xl h-screen fixed top-0 left-0 z-30 transition-all duration-300 ease-in-out
    ${isMobile 
      ? mobileOpen ? 'translate-x-0 w-64' : '-translate-x-full w-64'
      : collapsed ? 'w-20' : 'w-64'}`;

  const toggleButtonClasses = `fixed top-4 z-40 bg-red-600 text-white p-2 rounded-full shadow-lg
    ${isMobile 
      ? mobileOpen ? 'left-64 -mr-4' : 'left-4'
      : collapsed ? 'left-20 -mr-4' : 'left-64 -mr-4'}`;

  return (
    <>
      {isMobile && mobileOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-20" onClick={toggleMobileSidebar}></div>
      )}

      <button
        onClick={isMobile ? toggleMobileSidebar : toggleCollapse}
        className={toggleButtonClasses}
        aria-label={collapsed || (isMobile && !mobileOpen) ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed || (isMobile && !mobileOpen) ? (
          <ChevronRightIcon className="h-5 w-5" />
        ) : (
          <ChevronLeftIcon className="h-5 w-5" />
        )}
      </button>

      <div className={sidebarClasses}>
        <div className="py-6 border-b border-red-100">
          <div className={`flex ${collapsed ? 'justify-center' : 'px-6'} items-center`}>
            {!collapsed && (
              <div className="ml-3">
                <Logo />
              </div>
            )}
          </div>
        </div>

        <div className="py-4">
          <div className={collapsed ? 'px-2' : 'px-4'}>
            <nav className="space-y-1">
              {menuItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center ${collapsed ? 'justify-center' : 'px-3'} py-3 rounded-lg text-sm font-medium transition-colors duration-150 ${
                    isActive(item.href)
                      ? 'bg-red-50 text-red-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <item.icon className={`${isActive(item.href) ? 'text-red-600' : 'text-gray-400'} h-6 w-6 ${!collapsed && 'mr-3'}`} />
                  {!collapsed && item.name}
                  {isActive(item.href) && collapsed && (
                    <span className="absolute left-0 w-1 h-6 bg-red-600 rounded-r-md"></span>
                  )}
                </Link>
              ))}
            </nav>
          </div>
        </div>

        <div className="absolute bottom-0 w-full border-t border-red-100 p-4">
          <div className={`flex ${collapsed ? 'justify-center' : ''} items-center`}>
            <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
              <UserIcon className="h-4 w-4 text-red-600" />
            </div>
            {!collapsed && (
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900 truncate">Admin User</p>
                <a href="#" className="text-xs font-medium text-red-600 hover:text-red-900">
                  View profile
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className={`transition-all duration-300 ${isMobile ? 'ml-0' : collapsed ? 'ml-20' : 'ml-64'}`}></div>
    </>
  );
}
