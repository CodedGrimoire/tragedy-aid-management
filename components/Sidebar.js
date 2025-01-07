import Link from 'next/link'
import { 
  UsersIcon as UserGroupIcon, 
  CalendarIcon, 
  HomeIcon,
  UserIcon,
  BuildingOfficeIcon,
  HeartIcon
} from '@heroicons/react/24/outline'

export default function Sidebar() {
  const menuItems = [
    { name: 'Dashboard', icon: HomeIcon, href: '/' },  // Changed from '/dashboard' to '/'
    { name: 'Victims', icon: UserIcon, href: '/victims' },
    { name: 'Events', icon: CalendarIcon, href: '/events' },
    { name: 'Families', icon: UserGroupIcon, href: '/families' },
    { name: 'NGOs', icon: BuildingOfficeIcon, href: '/ngos' },
    { name: 'Medical', icon: HeartIcon, href: '/medical' },
  ]

  return (
    <div className="w-64 bg-white shadow-lg h-screen">
      <div className="p-4">
        <nav className="space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="flex items-center px-2 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900"
            >
              <item.icon className="mr-3 h-6 w-6" />
              {item.name}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  )
}