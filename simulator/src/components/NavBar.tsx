"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_LINKS = [
  { href: '/engine',      label: 'Engine' },
  { href: '/environment', label: 'Environment' },
  { href: '/mission',     label: 'Mission' },
  { href: '/faults',      label: 'Faults' },
  { href: '/health',      label: 'Health' },
  { href: '/analytics',   label: 'AI Analytics' },
  { href: '/telemetry',   label: 'Telemetry' },
];

export default function NavBar() {
  const pathname = usePathname();

  return (
    <nav className="px-4 py-2.5 border-b border-[#E2E8F0] flex items-center gap-3 bg-white shadow-sm flex-shrink-0">
      {/* Brand */}
      <div className="font-bold text-sm text-[#2563EB] mr-3 tracking-wide whitespace-nowrap">
        MALE UAV GCS
      </div>

      {/* Nav links */}
      <div className="flex items-center gap-1 flex-wrap">
        {NAV_LINKS.map((link) => {
          const isActive = pathname === link.href || (pathname === '/' && link.href === '/engine');
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-[#2563EB] text-white shadow-sm'
                  : 'text-[#475569] hover:text-[#2563EB] hover:bg-[#EFF6FF] border border-transparent'
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
