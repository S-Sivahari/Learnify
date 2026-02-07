import { Brain, Target, Zap, Trophy, BookOpen, Users, Calendar, Clock, TrendingUp, Award, LayoutGrid, Sparkles, Globe, ArrowRight, Flame, Plus, X, Code, FileText, GraduationCap, Bell, User, Play, Music, MessageCircle, Link2, Star, Gift, LogOut } from 'lucide-react';
import XPProgressBar from '@/components/gamification/XPProgressBar';
import StreakCounter from '@/components/gamification/StreakCounter';
import BadgeCard from '@/components/gamification/BadgeCard';
import LevelBadge from '@/components/gamification/LevelBadge';
import DailyQuest from '@/components/gamification/DailyQuest';
import { useUserStore } from '@/store/userStore';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ExamCountdownWidget } from '@/components/ExamCountdownWidget';
import { SpotifyMiniPlayer } from '@/components/integrations/SpotifyMiniPlayer';
import { MOCK_ANALYTICS, MOCK_ACTIVITY_LOG, MOCK_TASKS, USE_MOCK_DATA, MOCK_GAME_LEADERBOARD } from '@/mocks';
import { MOCK_GAMES, MOCK_PLAYER_PROFILE } from '@/mocks/gameHub';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { TranslatedText } from '@/components/TranslatedText';
import { EmptyWorkspaceState } from '@/components/dashboard/EmptyWorkspaceState';
import { OnboardingTour } from '@/components/dashboard/OnboardingTour';
import { HabitTracker } from '@/components/habits/HabitTracker';

type Workspace = {
  id: string;
  name: string;
  type: 'frontend' | 'backend' | 'ml' | 'datascience' | 'cybersecurity' | 'custom';
  isActive: boolean;
  tools: string[];
};

const ROADMAP_OPTIONS = [
  { id: 'frontend', name: 'Frontend', icon: <Code className="w-4 h-4" />, color: 'neon' },
  { id: 'backend', name: 'Backend', icon: <Globe className="w-4 h-4" />, color: 'purple' },
  { id: 'ml', name: 'ML', icon: <Brain className="w-4 h-4" />, color: 'blue' },
  { id: 'datascience', name: 'Data Science', icon: <TrendingUp className="w-4 h-4" />, color: 'neon' },
  { id: 'cybersecurity', name: 'Security', icon: <Award className="w-4 h-4" />, color: 'purple' },
  { id: 'classroom', name: 'School', icon: <GraduationCap className="w-4 h-4" />, color: 'purple', special: true },
];

const INSTITUTION_TASKS = [
  { id: 1, title: 'Physics Assignment', type: 'assignment', deadline: 'Dec 15', priority: 'high' },
  { id: 2, title: 'Math Final Exam', type: 'exam', deadline: 'Dec 20', priority: 'high' },
  { id: 3, title: 'History Project', type: 'project', deadline: 'Dec 18', priority: 'medium' },
];

// Recent activity for Resume Learning
const RECENT_ACTIVITY = {
  type: 'course' as const,
  title: 'React Basics',
  progress: 68,
  path: '/courses/react-basics',
  lastAccessed: '2 hours ago',
};

// AI insight micro-text
const AI_INSIGHTS = [
  "You focus best between 7–9 PM.",
  "Your streak is on fire! Keep going.",
  "Try reviewing notes before bed for better retention.",
];

export default function DashboardGold() {
  const user = useUserStore((state) => state.user);
  const navigate = useNavigate();

  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeWorkspace, setActiveWorkspace] = useState<string | null>(null);
  const [showAddWorkspace, setShowAddWorkspace] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [streakDaysToBonus] = useState(3);
  const [lastWorkspaceTime] = useState('Yesterday, 4:32 PM');

  // Check if user is new (first time on dashboard)
  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');
    if (!hasSeenOnboarding) {
      setShowOnboarding(true);
    }
  }, []);

  // Load workspaces from localStorage on mount
  useEffect(() => {
    const savedWorkspaces = localStorage.getItem('userWorkspaces');
    if (savedWorkspaces) {
      try {
        const parsed = JSON.parse(savedWorkspaces);
        setWorkspaces(parsed);
        if (parsed.length > 0) {
          setActiveWorkspace(parsed[0].id);
        }
      } catch (e) {
        console.error('Failed to load workspaces:', e);
      }
    }
  }, []);

  // Save workspaces to localStorage whenever they change
  useEffect(() => {
    if (workspaces.length > 0) {
      localStorage.setItem('userWorkspaces', JSON.stringify(workspaces));
    }
  }, [workspaces]);

  const handleOnboardingComplete = () => {
    localStorage.setItem('hasSeenOnboarding', 'true');
    setShowOnboarding(false);
  };

  const addWorkspace = (type: string) => {
    // Create the workspace and make it active
    const newWorkspace: Workspace = {
      id: `ws-${Date.now()}`,
      name: (ROADMAP_OPTIONS.find(r => r.id === type)?.name || 'New') + ' Workspace',
      type: type as Workspace['type'],
      isActive: true,
      tools: ['ai-tutor', 'notes', 'focus-room'],
    };

    // Update state - workspace will now appear immediately
    setWorkspaces(prev => {
      const updated = [...prev, newWorkspace];
      // Also save to localStorage immediately
      localStorage.setItem('userWorkspaces', JSON.stringify(updated));
      return updated;
    });
    setActiveWorkspace(newWorkspace.id);
    setShowAddWorkspace(false);

    // Navigate directly to the workspace
    setTimeout(() => {
      navigate(`/workspace/${type}`);
    }, 300);
  };

  const handleOpenWorkspace = (type: string) => {
    if (type === 'classroom') {
      navigate('/classroom-workspace');
    } else {
      navigate(`/workspace/${type}`);
    }
  };

  const removeWorkspace = (id: string) => {
    setWorkspaces(workspaces.filter(w => w.id !== id));
    if (activeWorkspace === id) {
      const remaining = workspaces.filter(w => w.id !== id);
      setActiveWorkspace(remaining[0]?.id || null);
    }
  };

  return (
    <div className="relative min-h-screen text-foreground overflow-auto" style={{ backgroundColor: '#14171e' }}>
      {showOnboarding && <OnboardingTour onComplete={handleOnboardingComplete} />}

      {/* Modern Cosmic Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0" style={{ backgroundColor: '#14171e' }} />
        <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-primary/5 via-transparent to-transparent" />
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: `linear-gradient(rgba(218, 253, 120, 0.1) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(218, 253, 120, 0.1) 1px, transparent 1px)`,
          backgroundSize: '100px 100px'
        }} />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* HEADER ROW */}
        <div className="border-b border-border backdrop-blur-xl px-6 py-4 space-y-4" style={{ backgroundColor: '#0b0e17' }}>
          <div className="flex items-center justify-between">
            {/* Left: Welcome */}
            <div>
              <h1 className="text-2xl font-bold">
                <TranslatedText text="Welcome back," /> <span className="text-white">{user?.name || 'Learner'}!</span>
              </h1>
              <p className="text-sm text-muted-foreground">Ready for your next learning adventure?</p>
            </div>

            {/* Right: Stats + Actions */}
            <div className="flex items-center gap-6">
              {/* Stats Row */}
              <div className="flex items-center gap-5">
                <div className="text-center px-3 py-1.5 bg-[#1f2229] rounded-lg border border-border">
                  <p className="text-lg font-bold text-foreground">{workspaces.length}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Spaces</p>
                </div>
                <div className="text-center px-3 py-1.5 rounded-lg border" style={{ backgroundColor: '#d9fd7720', borderColor: '#d9fd7750' }}>
                  <p className="text-lg font-bold" style={{ color: '#d9fd77' }}>{user?.xp || 0}</p>
                  <p className="text-[10px] uppercase tracking-wide" style={{ color: '#d9fd77AA' }}>XP</p>
                </div>
                <div className="text-center px-3 py-1.5 bg-secondary/10 rounded-lg border border-secondary/30">
                  <p className="text-lg font-bold text-secondary">Lvl {user?.level || 1}</p>
                  <p className="text-[10px] text-secondary/70 uppercase tracking-wide">Level</p>
                </div>
                <div className="text-center relative group px-3 py-1.5 bg-orange-500/10 rounded-lg border border-orange-500/30">
                  <p className="text-lg font-bold text-orange-400 flex items-center gap-1"><Flame className="w-4 h-4" />7</p>
                  <p className="text-[10px] text-orange-400/70 uppercase tracking-wide">Streak</p>
                  <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-popover border border-border rounded-lg px-3 py-2 text-xs text-primary whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-50 shadow-lg">
                    🔥 {streakDaysToBonus} more days to earn bonus XP!
                  </div>
                </div>
              </div>

              {/* Action Icons - Grouped on right side */}
              <div className="flex items-center gap-1 bg-[#1f2229] rounded-xl p-1 border border-border">
                {/* Notifications */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative hover:bg-accent rounded-lg h-9 w-9"
                  onClick={() => { }}
                  title="Notifications"
                >
                  <Bell className="w-4 h-4 text-muted-foreground" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full"></span>
                </Button>
                {/* Profile */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:bg-accent rounded-lg h-9 w-9"
                  onClick={() => navigate('/profile')}
                  title="Profile"
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                    <User className="w-3 h-3 text-primary-foreground" />
                  </div>
                </Button>
              </div>
            </div>
          </div>

          {/* XP Progress Bar */}
          <XPProgressBar
            currentXP={user?.xp || 0}
            requiredXP={1000}
            level={user?.level || 1}
            showDetails={true}
          />
        </div>

        {/* MAIN CONTENT - 2 Rows x 4 Columns Grid */}
        <div className="flex-1 p-6 overflow-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 min-h-0">

            {/* Grid 1: Resume Learning */}
            <Card className="border border-border backdrop-blur-sm rounded-2xl" style={{ backgroundColor: '#171a21' }}>
              <CardHeader className="pb-3 pt-5 px-5">
                <CardTitle className="text-base font-bold text-primary flex items-center gap-2">
                  <Play className="w-5 h-5" />
                  Resume Learning
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 pt-3 space-y-4">
                {RECENT_ACTIVITY && (
                  <div className="space-y-4">
                    <p className="text-base font-bold text-foreground">{RECENT_ACTIVITY.title}</p>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-2.5 bg-muted rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ backgroundColor: '#d9fd77', width: `${RECENT_ACTIVITY.progress}%` }} />
                      </div>
                      <span className="text-sm font-bold text-primary">{RECENT_ACTIVITY.progress}%</span>
                    </div>
                    <Button
                      onClick={() => navigate(RECENT_ACTIVITY.path)}
                      className="w-full font-bold text-sm h-10 text-black transition-opacity"
                      style={{ backgroundColor: '#d9fd77' }}
                    >
                      <Play className="w-4 h-4 mr-2" /> Continue
                    </Button>
                  </div>
                )}
                <div className="mt-2 pt-4 border-t border-border grid grid-cols-2 gap-2">
                  <Button
                    onClick={() => navigate('/study-planner')}
                    variant="outline"
                    className="border-border bg-[#1f2229] text-foreground hover:bg-accent h-9 text-xs font-semibold"
                  >
                    <Calendar className="w-3.5 h-3.5 mr-1.5" />
                    Calendar
                  </Button>
                  <Button
                    onClick={() => navigate('/ai-bot')}
                    variant="outline"
                    className="border-border bg-[#1f2229] text-foreground hover:bg-accent h-9 text-xs font-semibold"
                  >
                    <Brain className="w-3.5 h-3.5 mr-1.5" />
                    AI Chat
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Grid 2: Workspace (Combined - Active + New) */}
            <Card className="border border-border backdrop-blur-sm rounded-2xl" style={{ backgroundColor: '#171a21' }}>
              <CardHeader className="pb-3 pt-5 px-5">
                <CardTitle className="text-base font-bold flex items-center gap-2" style={{ color: '#d9fd77' }}>
                  <LayoutGrid className="w-5 h-5" />
                  My Workspaces
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 pt-3 space-y-3">
                {/* Active Workspace Section */}
                {activeWorkspace ? (
                  <div className="space-y-3 p-3 bg-primary/10 rounded-xl border border-primary/30">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-primary uppercase tracking-wide flex items-center gap-1">
                        <span className="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
                        Currently Active
                      </span>
                      <button
                        onClick={() => removeWorkspace(activeWorkspace)}
                        className="text-muted-foreground hover:text-destructive text-sm px-2 py-0.5 rounded hover:bg-destructive/10 transition-colors"
                        title="Remove workspace"
                      >✕</button>
                    </div>
                    <p className="text-base font-bold text-foreground">{workspaces.find(w => w.id === activeWorkspace)?.name}</p>
                    <p className="text-xs text-muted-foreground">Last opened: {lastWorkspaceTime}</p>
                    <Button
                      onClick={() => handleOpenWorkspace(workspaces.find(w => w.id === activeWorkspace)?.type || 'frontend')}
                      className="w-full font-bold text-sm h-10 text-black transition-opacity"
                      style={{ backgroundColor: '#d9fd77' }}
                    >
                      <Play className="w-4 h-4 mr-2" /> Continue Learning
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-6 px-3 bg-popover rounded-xl border-2 border-dashed border-border">
                    <LayoutGrid className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                    <p className="text-sm font-medium text-foreground mb-1">No workspace yet</p>
                    <p className="text-xs text-muted-foreground">Create your first learning space below ↓</p>
                  </div>
                )}

                {/* Other Workspaces */}
                {workspaces.filter(w => w.id !== activeWorkspace).length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Other Workspaces</p>
                    {workspaces.filter(w => w.id !== activeWorkspace).slice(0, 2).map((ws) => (
                      <div
                        key={ws.id}
                        onClick={() => setActiveWorkspace(ws.id)}
                        className="p-2.5 rounded-lg cursor-pointer transition-all flex items-center justify-between bg-popover hover:bg-accent hover:border-primary/30 text-foreground border border-transparent"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 bg-secondary rounded-full"></span>
                          <span className="text-sm font-semibold">{ws.name}</span>
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); removeWorkspace(ws.id); }}
                          className="text-muted-foreground hover:text-destructive text-sm px-2 py-0.5 rounded hover:bg-destructive/10"
                        >✕</button>
                      </div>
                    ))}
                  </div>
                )}

                {/* New Workspace Button */}
                <div className="pt-3 border-t border-border">
                  <Button
                    onClick={() => setShowAddWorkspace(!showAddWorkspace)}
                    variant="outline"
                    className={`w-full border-primary/50 text-primary hover:bg-primary hover:text-primary-foreground font-bold text-sm h-10 transition-all ${showAddWorkspace ? 'bg-primary/10' : ''}`}
                  >
                    <Plus className={`w-4 h-4 mr-2 transition-transform ${showAddWorkspace ? 'rotate-45' : ''}`} />
                    {showAddWorkspace ? 'Cancel' : 'Create New Workspace'}
                  </Button>
                </div>

                {/* Roadmap Options */}
                {showAddWorkspace && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-3 bg-popover rounded-xl p-3 border border-border"
                  >
                    <p className="text-xs font-bold text-foreground uppercase tracking-wide">Choose a Learning Path</p>
                    <p className="text-xs text-muted-foreground -mt-2">Pick a roadmap to start your journey</p>
                    <div className="grid grid-cols-2 gap-2">
                      {ROADMAP_OPTIONS.map((r) => (
                        <Button
                          key={r.id}
                          variant="ghost"
                          onClick={() => addWorkspace(r.id)}
                          className="text-xs justify-start gap-2 h-10 hover:bg-primary/20 hover:text-primary font-semibold border border-border hover:border-primary/50 transition-all"
                        >
                          {r.icon}
                          {r.name}
                        </Button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </CardContent>
            </Card>

            {/* Grid 3: Tasks */}
            <Card className="border border-border backdrop-blur-sm rounded-2xl" style={{ backgroundColor: '#171a21' }}>
              <CardHeader className="pb-3 pt-5 px-5">
                <CardTitle className="text-base font-bold text-primary flex items-center gap-2">
                  <GraduationCap className="w-5 h-5" />
                  Tasks
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 pt-3 space-y-3">
                {INSTITUTION_TASKS.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-popover hover:bg-accent cursor-pointer transition-colors"
                    onClick={() => navigate('/workspace/frontend')}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-2 h-2 rounded-full ${task.priority === 'high' ? 'bg-destructive' : 'bg-warning'}`} />
                      <span className="text-sm font-semibold text-foreground">{task.title}</span>
                    </div>
                    <Badge variant="outline" className="text-xs px-2 py-0.5 border-border">{task.deadline}</Badge>
                  </div>
                ))}
                <Button
                  variant="ghost"
                  className="w-full text-sm text-primary hover:text-primary hover:bg-primary/20 font-semibold h-9"
                  onClick={() => navigate('/study-planner')}
                >
                  View All <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            {/* Grid 4: Spotify & Discord */}
            <Card className="border border-border backdrop-blur-sm rounded-2xl" style={{ backgroundColor: '#171a21' }}>
              <CardHeader className="pb-3 pt-5 px-5">
                <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                  <Music className="w-5 h-5 text-[#1DB954]" />
                  Integrations
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 pt-3 space-y-3">
                {/* Spotify */}
                <div className="flex items-center justify-between p-3 rounded-xl border border-border hover:bg-[#1f2329] transition-colors" style={{ backgroundColor: '#171a21' }}>
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-[#1DB954]/20 flex items-center justify-center">
                      <Music className="w-4 h-4 text-[#1DB954]" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">Spotify</p>
                      <p className="text-xs text-muted-foreground">Music while studying</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    className="font-bold h-8 text-xs text-foreground transition-colors"
                    style={{ backgroundColor: '#171a21', border: '1px solid #444' }}
                  >
                    <Link2 className="w-3.5 h-3.5 mr-1" />
                    Connect
                  </Button>
                </div>

                {/* Discord */}
                <div className="flex items-center justify-between p-3 rounded-xl border border-border hover:bg-[#1f2329] transition-colors" style={{ backgroundColor: '#171a21' }}>
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-[#5865F2]/20 flex items-center justify-center">
                      <MessageCircle className="w-4 h-4 text-[#5865F2]" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">Discord</p>
                      <p className="text-xs text-muted-foreground">Study community</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    className="font-bold h-8 text-xs text-foreground transition-colors"
                    style={{ backgroundColor: '#171a21', border: '1px solid #444' }}
                  >
                    <Link2 className="w-3.5 h-3.5 mr-1" />
                    Connect
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Grid 5: Daily Progress & Goals */}
            <Card className="border border-border backdrop-blur-sm rounded-2xl" style={{ backgroundColor: '#171a21' }}>
              <CardHeader className="pb-3 pt-5 px-5">
                <CardTitle className="text-base font-bold flex items-center gap-2" style={{ color: '#d9fd77' }}>
                  <Target className="w-5 h-5" />
                  Daily Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 pt-3 space-y-4">
                {/* Daily Quest Section */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-foreground">Complete 3 Learning Sessions</h4>
                    <div className="flex items-center gap-1 px-2 py-1 rounded-full" style={{ backgroundColor: '#d9fd7720', border: '1px solid #d9fd7750' }}>
                      <Zap className="w-3.5 h-3.5" style={{ color: '#d9fd77' }} />
                      <span className="text-xs font-bold" style={{ color: '#d9fd77' }}>+500 XP</span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">Study for at least 25 minutes in 3 different subjects today</p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-foreground font-medium">2 / 3 Completed</span>
                      <span style={{ color: '#d9fd77' }} className="font-semibold">67%</span>
                    </div>
                    <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ backgroundColor: '#d9fd77', width: '67%' }} />
                    </div>
                  </div>
                </div>

                {/* Exam Countdown Section */}
                <div className="pt-3 border-t border-border space-y-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <h4 className="text-sm font-semibold text-foreground">No Upcoming Exams</h4>
                  </div>
                  <p className="text-xs text-muted-foreground">Import your exam schedule</p>
                  <Button
                    onClick={() => navigate('/study-planner')}
                    className="w-full font-bold text-sm h-9 text-black transition-opacity"
                    style={{ backgroundColor: '#d9fd77' }}
                  >
                    Add Exams
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Grid 6: Achievements Preview */}
            <Card className="border border-border backdrop-blur-sm rounded-2xl" style={{ backgroundColor: '#171a21' }}>
              <CardHeader className="pb-3 pt-5 px-5">
                <CardTitle className="text-base font-bold flex items-center gap-2" style={{ color: '#d9fd77' }}>
                  <Trophy className="w-5 h-5" />
                  Recent Achievements
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 pt-3">
                <div className="grid grid-cols-3 gap-2">
                  <BadgeCard
                    title="First Steps"
                    description="Complete your first lesson"
                    icon={Star}
                    unlocked={true}
                    rarity="common"
                  />
                  <BadgeCard
                    title="On Fire!"
                    description="Maintain a 7-day streak"
                    icon={Flame}
                    unlocked={true}
                    rarity="rare"
                  />
                  <BadgeCard
                    title="Scholar"
                    description="Reach level 10"
                    icon={GraduationCap}
                    unlocked={false}
                    progress={70}
                    rarity="epic"
                  />
                </div>
                <Button
                  variant="ghost"
                  className="w-full mt-3 text-sm hover:bg-opacity-20 font-semibold h-9"
                  style={{ color: '#d9fd77' }}
                  onClick={() => navigate('/achievements')}
                >
                  View All <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            {/* Grid 7: Daily Habits */}
            <Card className="border border-border backdrop-blur-sm rounded-2xl" style={{ backgroundColor: '#171a21' }}>
              <CardHeader className="pb-3 pt-5 px-5">
                <CardTitle className="text-base font-bold flex items-center gap-2" style={{ color: '#d9fd77' }}>
                  <Target className="w-5 h-5" />
                  Daily Habits
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 pt-3">
                {user?.id && <HabitTracker userId={user.id} />}
              </CardContent>
            </Card>

          </div>
        </div>
      </div>
    </div>
  );
}