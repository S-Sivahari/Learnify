/**
 * Workspaces - Main Hub Page
 * 
 * Shows existing workspaces and allows creating new ones.
 * Redesigned to match dashboard aesthetic.
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useUnifiedOSStore } from '@/store/unifiedOSStore';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import {
  Plus,
  Search,
  BookOpen,
  Clock,
  TrendingUp,
  Archive,
  ArchiveRestore,
  MoreVertical,
  ExternalLink,
  LayoutGrid,
  Pencil,
  Trash2,
} from 'lucide-react';
import type { Space } from '@/types/unifiedOS';

// Mock data for initial development
const MOCK_SPACES: Space[] = [
  {
    id: '1',
    user_id: 'user-1',
    name: 'Advanced Calculus',
    subject: 'Mathematics',
    learning_goal: 'Master integration and differentiation techniques',
    level: 'advanced',
    duration_weeks: 12,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    last_accessed_at: new Date().toISOString(),
    progress_percentage: 67,
    is_archived: false,
  },
  {
    id: '2',
    user_id: 'user-1',
    name: 'Web Development Fundamentals',
    subject: 'Computer Science',
    learning_goal: 'Build modern web applications with React',
    level: 'intermediate',
    duration_weeks: 8,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    last_accessed_at: new Date(Date.now() - 86400000).toISOString(),
    progress_percentage: 45,
    is_archived: false,
  },
];

export default function UnifiedOS() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const spaces = useUnifiedOSStore((state) => state.spaces);
  const setSpaces = useUnifiedOSStore((state) => state.setSpaces);
  const setActiveSpace = useUnifiedOSStore((state) => state.setActiveSpace);
  const [searchQuery, setSearchQuery] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [spaceToDelete, setSpaceToDelete] = useState<Space | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load spaces on mount
  useEffect(() => {
    // TODO: Load from Supabase
    setSpaces(MOCK_SPACES);
  }, [setSpaces]);

  const filteredSpaces = spaces
    .filter((space) => space.is_archived === showArchived)
    .filter((space) =>
      searchQuery
        ? space.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        space.subject.toLowerCase().includes(searchQuery.toLowerCase())
        : true
    )
    .sort((a, b) => {
      const dateA = new Date(a.last_accessed_at || a.created_at).getTime();
      const dateB = new Date(b.last_accessed_at || b.created_at).getTime();
      return dateB - dateA;
    });

  const handleOpenSpace = (space: Space) => {
    setActiveSpace(space);
    navigate(`/unified-os/workspace/${space.id}`);
  };

  const handleCreateSpace = () => {
    navigate('/unified-os/create');
  };

  const handleEditSpace = (e: React.MouseEvent, space: Space) => {
    e.stopPropagation();
    navigate(`/unified-os/edit/${space.id}`);
  };

  const handleArchiveSpace = async (e: React.MouseEvent, space: Space) => {
    e.stopPropagation();
    try {
      const { error } = await supabase
        .from('workspaces')
        .update({ is_archived: !space.is_archived })
        .eq('id', space.id);

      if (error) throw error;

      // Update local state
      setSpaces(
        spaces.map((s) =>
          s.id === space.id ? { ...s, is_archived: !s.is_archived } : s
        )
      );

      toast({
        title: space.is_archived ? 'Workspace Restored' : 'Workspace Archived',
        description: space.is_archived
          ? `"${space.name}" has been restored.`
          : `"${space.name}" has been archived.`,
      });
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to update workspace.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteClick = (e: React.MouseEvent, space: Space) => {
    e.stopPropagation();
    setSpaceToDelete(space);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!spaceToDelete) return;

    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('workspaces')
        .delete()
        .eq('id', spaceToDelete.id);

      if (error) throw error;

      // Update local state
      setSpaces(spaces.filter((s) => s.id !== spaceToDelete.id));

      toast({
        title: 'Workspace Deleted',
        description: `"${spaceToDelete.name}" has been permanently deleted.`,
      });
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to delete workspace.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setSpaceToDelete(null);
    }
  };

  const getLevelColor = (level: Space['level']) => {
    switch (level) {
      case 'beginner':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'intermediate':
        return 'bg-blue/20 text-blue border-blue/30';
      case 'advanced':
        return 'bg-accent/20 text-accent border-purple/30';
    }
  };

  const getTimeAgo = (date: string) => {
    const now = Date.now();
    const then = new Date(date).getTime();
    const diff = now - then;
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="relative min-h-screen bg-black text-white">
      <div className="relative z-10">
        {/* Header */}
        <div className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-xl px-6 py-6 mt-4 mx-6 rounded-2xl border border-slate-700/30 shadow-2xl">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <LayoutGrid className="h-8 w-8 text-[#DAFD78]" />
                <h1 className="text-4xl font-black uppercase tracking-tight">
                  <span style={{ color: '#d9fd77' }}>Work</span>
                  <span style={{ color: '#6C5BA6' }}>spaces</span>
                </h1>
              </div>
              <p className="text-base font-bold text-gray-500 uppercase tracking-widest">
                Your personalized learning environments
              </p>
            </div>

            <Button
              onClick={handleCreateSpace}
              className="bg-[#DAFD78] text-black hover:bg-[#DAFD78]/90 font-black uppercase text-base h-12 px-6 rounded-xl shadow-[0_0_20px_rgba(218,253,120,0.2)] transition-all hover:scale-105"
              size="lg"
            >
              <Plus className="h-5 w-5 mr-2" />
              Create Workspace
            </Button>
          </div>

          {/* Search & Filters */}
          <div className="mt-6 flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/50" />
              <Input
                placeholder="Search workspaces..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-11 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-primary/50 text-white h-12 text-base"
              />
            </div>

            <Button
              variant={showArchived ? 'secondary' : 'outline'}
              onClick={() => setShowArchived(!showArchived)}
              className="text-white border-slate-200 dark:border-slate-700 hover:bg-white/10 h-12 font-semibold"
            >
              <Archive className="h-4 w-4 mr-2" />
              {showArchived ? 'Show Active' : 'Show Archived'}
            </Button>
          </div>
        </div>

        {/* Workspaces Grid */}
        <div className="px-6 py-8">
          <div className="mb-6">
            <h2 className="text-2xl font-black uppercase text-white">
              {showArchived ? 'Archived Workspaces' : 'My Workspaces'}
            </h2>
            <p className="text-sm font-medium text-white/60 mt-1">
              {filteredSpaces.length} workspace{filteredSpaces.length !== 1 ? 's' : ''}
            </p>
          </div>

          {filteredSpaces.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20"
            >
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-white/5 mb-6 border border-slate-200 dark:border-slate-700">
                <BookOpen className="h-12 w-12 text-primary" />
              </div>
              <h3 className="text-2xl font-black uppercase text-white mb-2">
                {searchQuery
                  ? 'No workspaces found'
                  : showArchived
                    ? 'No archived workspaces'
                    : 'No workspaces yet'}
              </h3>
              <p className="text-white/60 font-medium mb-8 text-base">
                {searchQuery
                  ? 'Try adjusting your search'
                  : 'Create your first workspace to get started'}
              </p>
              {!searchQuery && !showArchived && (
                <Button
                  onClick={handleCreateSpace}
                  className="bg-primary text-black hover:bg-primary/90 font-black uppercase"
                  size="lg"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Create Workspace
                </Button>
              )}
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence mode="popLayout">
                {filteredSpaces.map((space, index) => (
                  <motion.div
                    key={space.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card
                      className="bg-white dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-700 hover:border-neon/50 transition-all cursor-pointer group overflow-hidden"
                      onClick={() => handleOpenSpace(space)}
                    >
                      <div className="p-6">
                        {/* Header */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="font-black text-xl text-white mb-2 group-hover:text-primary transition-colors uppercase">
                              {space.name}
                            </h3>
                            <p className="text-sm font-semibold text-white/60 uppercase">
                              {space.subject}
                            </p>
                          </div>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/10"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <MoreVertical className="h-5 w-5" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align="end"
                              className="bg-slate-800 border-slate-700 shadow-xl"
                            >
                              <DropdownMenuItem
                                onClick={(e) => handleEditSpace(e, space)}
                                className="text-white hover:bg-slate-700 cursor-pointer"
                              >
                                <Pencil className="h-4 w-4 mr-2" />
                                Edit Workspace
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={(e) => handleArchiveSpace(e, space)}
                                className="text-white hover:bg-slate-700 cursor-pointer"
                              >
                                {space.is_archived ? (
                                  <>
                                    <ArchiveRestore className="h-4 w-4 mr-2" />
                                    Restore
                                  </>
                                ) : (
                                  <>
                                    <Archive className="h-4 w-4 mr-2" />
                                    Archive
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={(e) => handleDeleteClick(e, space)}
                                className="text-red-400 hover:bg-red-500/20 hover:text-red-400 cursor-pointer"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        {/* Goal */}
                        <p className="text-sm text-white/70 font-medium mb-4 line-clamp-2">
                          {space.learning_goal}
                        </p>

                        {/* Metadata */}
                        <div className="flex items-center gap-2 mb-4">
                          <Badge
                            variant="outline"
                            className={`${getLevelColor(space.level)} font-bold uppercase text-xs`}
                          >
                            {space.level}
                          </Badge>

                          <div className="flex items-center gap-1.5 text-sm text-white/50 font-medium">
                            <Clock className="h-4 w-4" />
                            {space.duration_weeks} weeks
                          </div>
                        </div>

                        {/* Progress */}
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-white/60 font-medium">Progress</span>
                            <span className="text-primary font-black text-base">
                              {space.progress_percentage}%
                            </span>
                          </div>
                          <Progress
                            value={space.progress_percentage}
                            className="h-2 bg-white/10"
                          />
                        </div>

                        {/* Footer */}
                        <div className="pt-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-sm text-white/50">
                          <div className="flex items-center gap-1.5 font-medium">
                            <TrendingUp className="h-4 w-4" />
                            {getTimeAgo(space.last_accessed_at || space.created_at)}
                          </div>

                          <ExternalLink className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-slate-800 border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white font-black uppercase flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-red-500" />
              Delete Workspace
            </AlertDialogTitle>
            <AlertDialogDescription className="text-white/70">
              Are you sure you want to delete{' '}
              <span className="font-bold text-white">"{spaceToDelete?.name}"</span>?
              <br />
              <span className="text-red-400 font-medium">
                This action cannot be undone.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-slate-700 text-white border-slate-600 hover:bg-slate-600">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-red-600 text-white hover:bg-red-700 font-black"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
