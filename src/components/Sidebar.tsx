import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  BookOpen,
  BrainCircuit,
  Map,
  Users,
  User,
  StickyNote,
  Glasses,
  Calendar,
  Trophy,
  Target,
  Gamepad2,
  Hand,
  ChevronLeft,
  ChevronRight,
  Rocket,
  Clock,
  Monitor,
  MessageCircle,
  Globe
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSidebarStore } from '@/store/sidebarStore';

interface MenuItem {
  path: string;
  label: string;
  icon: React.ElementType;
}

const menuItems: MenuItem[] = [
  { path: '/dashboard', label: 'Dashboard', icon: Home },
  { path: '/workspaces', label: 'Workspaces', icon: Monitor },
  { path: '/courses', label: 'Courses', icon: BookOpen },
  { path: '/ai-bot', label: 'AI Tutor', icon: BrainCircuit },
  { path: '/roadmap', label: 'Roadmap', icon: Map },
  { path: '/notes', label: 'Notes', icon: StickyNote },
  { path: '/study-planner', label: 'Calendar', icon: Calendar },
  { path: '/focus-room', label: 'Focus Room', icon: Clock },
  { path: '/opportunities', label: 'Opportunities', icon: Target },
  { path: '/sign-language', label: 'Sign Language', icon: Hand },
  { path: '/game-hub', label: 'Game Center', icon: Gamepad2 },
  { path: '/study-vr', label: 'VR Study', icon: Glasses },
  { path: '/friends', label: 'Friends', icon: Users },
  { path: '/profile', label: 'Profile', icon: User },
];

interface SidebarProps {
  className?: string;
}

export default function Sidebar({ className }: SidebarProps) {
  const location = useLocation();
  const { isCollapsed, toggleSidebar } = useSidebarStore();

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-screen z-50 flex flex-col border-r border-slate-800 transition-all duration-300",
        isCollapsed ? "w-16" : "w-64",
        className
      )}
      style={{ position: 'fixed', height: '100vh', overflowY: 'auto', backgroundColor: '#14171e' }}
    >
      {/* Logo */}
      <div className={cn(
        "flex items-center gap-2 p-4 border-b border-slate-800",
        isCollapsed ? "justify-center" : "justify-start"
      )}>
        <Rocket className="h-8 w-8 text-[#DAFD78] flex-shrink-0" />
        {!isCollapsed && (
          <Link to="/dashboard" className="font-bold text-base">
            <span className="text-[#DAFD78]">Learn</span><span className="text-[#6C5BA6]">ify</span>
          </Link>
        )}
      </div>

      {/* Navigation - Scrollable */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
        <div className="flex flex-col gap-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            // Dynamic route matching - exact match or starts with path (for nested routes)
            const isActive = location.pathname === item.path ||
              (item.path !== '/dashboard' && location.pathname.startsWith(item.path + '/')) ||
              (item.path === '/workspaces' && location.pathname.startsWith('/workspace/')) ||
              (item.path === '/workspaces' && location.pathname === '/unified-os');

            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group",
                  isActive
                    ? "font-semibold text-black"
                    : "text-gray-400 hover:bg-slate-800/30 hover:text-white"
                )}
                style={isActive ? { backgroundColor: '#d9fd77' } : {}}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon className={cn(
                  "w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-110",
                  isActive ? "text-black" : "text-gray-500"
                )} />
                {!isCollapsed && (
                  <span className="text-sm truncate">{item.label}</span>
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Collapse Toggle */}
      <button
        onClick={toggleSidebar}
        className="flex items-center justify-center p-3 border-t border-border text-muted-foreground hover:text-primary hover:bg-muted transition-colors"
        title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {isCollapsed ? (
          <ChevronRight className="w-5 h-5" />
        ) : (
          <ChevronLeft className="w-5 h-5" />
        )}
      </button>
    </aside>
  );
}
