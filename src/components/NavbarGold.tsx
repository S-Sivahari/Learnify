import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useUserStore } from '@/store/userStore';
import { signOut } from '@/services/authService';
import { ExamNotificationBell } from '@/components/ExamNotificationBell';
import { Rocket, Zap } from 'lucide-react';

export default function NavbarGold() {
  const isAuthenticated = useUserStore((state) => state.isAuthenticated);
  const user = useUserStore((state) => state.user);

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <nav className="sticky top-0 z-30 border-b border-slate-800 backdrop-blur-xl" style={{ backgroundColor: '#14171e' }}>
      <div className="w-full px-6 py-3">
        <div className="flex items-center justify-between">
          {/* LOGO */}
          <Link to="/dashboard" className="flex items-center gap-3 text-4xl font-black tracking-wide transform hover:scale-105 transition-transform">
            <Rocket className="h-10 w-10 text-[#DAFD78]" />
            <span><span className="text-[#DAFD78]">Learn</span><span className="text-[#6C5BA6]">ify</span></span>
          </Link>

          {/* AUTH BUTTONS */}
          <div className="flex items-center gap-3">
            {/* XP Display */}
            {isAuthenticated && user && (
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-800 border border-[#DAFD78]/30 rounded-lg">
                <Zap className="w-4 h-4 text-[#DAFD78]" />
                <span className="text-[#DAFD78] font-semibold text-sm">{user.xp || 0} XP</span>
              </div>
            )}

            {/* Exam Notification Bell - Only for authenticated users */}
            {isAuthenticated && <ExamNotificationBell />}

            {isAuthenticated ? (
              <>
                {user && (
                  <div className="hidden md:block text-white font-bold text-sm px-4 py-2 bg-slate-800 border border-[#DAFD78]/20 rounded-lg">
                    {user.name}
                  </div>
                )}
                <Button
                  onClick={handleSignOut}
                  variant="destructive"
                  size="sm"
                  className="rounded-lg font-bold"
                >
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" size="sm" asChild className="border-slate-700 text-white hover:bg-slate-800 rounded-lg">
                  <Link to="/login">Login</Link>
                </Button>
                <Button size="sm" asChild className="bg-[#DAFD78] hover:bg-[#DAFD78]/90 text-black font-bold rounded-lg">
                  <Link to="/register">Get Started</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
