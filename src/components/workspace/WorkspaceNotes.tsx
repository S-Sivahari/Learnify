/**
 * WorkspaceNotes - Google Keep-style notes tool for workspaces
 * 
 * Features:
 * - Color-coded notes (yellow, blue, green, pink, purple, white)
 * - Pin/unpin notes
 * - Archive notes
 * - Auto-save to Supabase
 * - Masonry grid layout
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import {
    Plus,
    Pin,
    PinOff,
    Trash2,
    Palette,
    Archive,
    ArchiveRestore,
    MoreVertical,
    StickyNote,
} from 'lucide-react';

interface Note {
    id: string;
    workspace_id: string;
    user_id: string;
    title: string;
    content: string;
    color: 'yellow' | 'blue' | 'green' | 'pink' | 'purple' | 'white';
    is_pinned: boolean;
    is_archived: boolean;
    tags: string[];
    created_at: string;
    updated_at: string;
}

interface WorkspaceNotesProps {
    workspaceId: string;
    userId: string;
}

const COLOR_OPTIONS: Array<{
    id: Note['color'];
    bg: string;
    border: string;
    text: string;
}> = [
        { id: 'yellow', bg: 'bg-yellow-100', border: 'border-yellow-300', text: 'text-yellow-900' },
        { id: 'blue', bg: 'bg-blue-100', border: 'border-blue-300', text: 'text-blue-900' },
        { id: 'green', bg: 'bg-green-100', border: 'border-green-300', text: 'text-green-900' },
        { id: 'pink', bg: 'bg-pink-100', border: 'border-pink-300', text: 'text-pink-900' },
        { id: 'purple', bg: 'bg-purple-100', border: 'border-purple-300', text: 'text-purple-900' },
        { id: 'white', bg: 'bg-white', border: 'border-slate-300', text: 'text-slate-900' },
    ];

export default function WorkspaceNotes({ workspaceId, userId }: WorkspaceNotesProps) {
    const { toast } = useToast();
    const [notes, setNotes] = useState<Note[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showArchived, setShowArchived] = useState(false);
    const [editingNote, setEditingNote] = useState<Note | null>(null);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [newNote, setNewNote] = useState({
        title: '',
        content: '',
        color: 'yellow' as Note['color'],
    });

    // Fetch notes from Supabase
    const fetchNotes = useCallback(async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('workspace_notes')
                .select('*')
                .eq('workspace_id', workspaceId)
                .eq('user_id', userId)
                .order('is_pinned', { ascending: false })
                .order('updated_at', { ascending: false });

            if (error) throw error;
            setNotes(data || []);
        } catch (error) {
            console.error('Failed to fetch notes:', error);
            toast({
                title: 'Error',
                description: 'Failed to load notes.',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    }, [workspaceId, userId, toast]);

    useEffect(() => {
        fetchNotes();
    }, [fetchNotes]);

    // Create new note
    const handleCreateNote = async () => {
        if (!newNote.title.trim() && !newNote.content.trim()) {
            toast({
                title: 'Empty Note',
                description: 'Please add a title or content.',
                variant: 'destructive',
            });
            return;
        }

        try {
            const { data, error } = await supabase
                .from('workspace_notes')
                .insert({
                    workspace_id: workspaceId,
                    user_id: userId,
                    title: newNote.title,
                    content: newNote.content,
                    color: newNote.color,
                })
                .select()
                .single();

            if (error) throw error;

            setNotes([data, ...notes]);
            setNewNote({ title: '', content: '', color: 'yellow' });
            setIsCreateDialogOpen(false);

            toast({
                title: 'Note Created',
                description: 'Your note has been saved.',
            });
        } catch (error) {
            console.error('Failed to create note:', error);
            toast({
                title: 'Error',
                description: 'Failed to create note.',
                variant: 'destructive',
            });
        }
    };

    // Update note
    const handleUpdateNote = async (note: Note) => {
        try {
            const { error } = await supabase
                .from('workspace_notes')
                .update({
                    title: note.title,
                    content: note.content,
                    color: note.color,
                    is_pinned: note.is_pinned,
                    is_archived: note.is_archived,
                })
                .eq('id', note.id);

            if (error) throw error;

            setNotes(notes.map((n) => (n.id === note.id ? note : n)));
            setEditingNote(null);
        } catch (error) {
            console.error('Failed to update note:', error);
            toast({
                title: 'Error',
                description: 'Failed to update note.',
                variant: 'destructive',
            });
        }
    };

    // Toggle pin
    const handleTogglePin = async (note: Note) => {
        const updated = { ...note, is_pinned: !note.is_pinned };
        await handleUpdateNote(updated);
    };

    // Toggle archive  
    const handleToggleArchive = async (note: Note) => {
        const updated = { ...note, is_archived: !note.is_archived };
        await handleUpdateNote(updated);
        toast({
            title: note.is_archived ? 'Note Restored' : 'Note Archived',
            description: note.is_archived
                ? 'Note has been restored.'
                : 'Note has been archived.',
        });
    };

    // Change color
    const handleColorChange = async (note: Note, color: Note['color']) => {
        const updated = { ...note, color };
        await handleUpdateNote(updated);
    };

    // Delete note
    const handleDeleteNote = async (noteId: string) => {
        try {
            const { error } = await supabase
                .from('workspace_notes')
                .delete()
                .eq('id', noteId);

            if (error) throw error;

            setNotes(notes.filter((n) => n.id !== noteId));
            toast({
                title: 'Note Deleted',
                description: 'Note has been permanently deleted.',
            });
        } catch (error) {
            console.error('Failed to delete note:', error);
            toast({
                title: 'Error',
                description: 'Failed to delete note.',
                variant: 'destructive',
            });
        }
    };

    const getColorClasses = (color: Note['color']) => {
        const colorOption = COLOR_OPTIONS.find((c) => c.id === color);
        return colorOption || COLOR_OPTIONS[0];
    };

    const filteredNotes = notes.filter((note) => note.is_archived === showArchived);
    const pinnedNotes = filteredNotes.filter((note) => note.is_pinned);
    const unpinnedNotes = filteredNotes.filter((note) => !note.is_pinned);

    return (
        <div className="h-full flex flex-col bg-slate-900 p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <StickyNote className="h-6 w-6 text-primary" />
                    <h2 className="text-xl font-black uppercase text-white">Notes</h2>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant={showArchived ? 'secondary' : 'outline'}
                        size="sm"
                        onClick={() => setShowArchived(!showArchived)}
                        className="text-white border-slate-700 hover:bg-white/10"
                    >
                        <Archive className="h-4 w-4 mr-2" />
                        {showArchived ? 'Show Active' : 'Archived'}
                    </Button>
                    <Button
                        onClick={() => setIsCreateDialogOpen(true)}
                        className="bg-primary text-black hover:bg-primary/90 font-bold"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        New Note
                    </Button>
                </div>
            </div>

            {/* Notes Grid */}
            <div className="flex-1 overflow-y-auto">
                {isLoading ? (
                    <div className="flex items-center justify-center h-40">
                        <div className="text-white/60">Loading notes...</div>
                    </div>
                ) : filteredNotes.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-40 text-center">
                        <StickyNote className="h-12 w-12 text-white/30 mb-4" />
                        <p className="text-white/60 font-medium">
                            {showArchived ? 'No archived notes' : 'No notes yet'}
                        </p>
                        {!showArchived && (
                            <Button
                                variant="outline"
                                className="mt-4 border-slate-700 text-white hover:bg-white/10"
                                onClick={() => setIsCreateDialogOpen(true)}
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Create your first note
                            </Button>
                        )}
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Pinned Notes */}
                        {pinnedNotes.length > 0 && (
                            <div>
                                <h3 className="text-sm font-bold text-white/60 uppercase mb-3 flex items-center gap-2">
                                    <Pin className="h-4 w-4" />
                                    Pinned
                                </h3>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                    <AnimatePresence>
                                        {pinnedNotes.map((note) => (
                                            <NoteCard
                                                key={note.id}
                                                note={note}
                                                onEdit={() => setEditingNote(note)}
                                                onTogglePin={() => handleTogglePin(note)}
                                                onToggleArchive={() => handleToggleArchive(note)}
                                                onColorChange={(color) => handleColorChange(note, color)}
                                                onDelete={() => handleDeleteNote(note.id)}
                                                getColorClasses={getColorClasses}
                                            />
                                        ))}
                                    </AnimatePresence>
                                </div>
                            </div>
                        )}

                        {/* Other Notes */}
                        {unpinnedNotes.length > 0 && (
                            <div>
                                {pinnedNotes.length > 0 && (
                                    <h3 className="text-sm font-bold text-white/60 uppercase mb-3">
                                        Others
                                    </h3>
                                )}
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                    <AnimatePresence>
                                        {unpinnedNotes.map((note) => (
                                            <NoteCard
                                                key={note.id}
                                                note={note}
                                                onEdit={() => setEditingNote(note)}
                                                onTogglePin={() => handleTogglePin(note)}
                                                onToggleArchive={() => handleToggleArchive(note)}
                                                onColorChange={(color) => handleColorChange(note, color)}
                                                onDelete={() => handleDeleteNote(note.id)}
                                                getColorClasses={getColorClasses}
                                            />
                                        ))}
                                    </AnimatePresence>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Create Note Dialog */}
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogContent className="bg-slate-800 border-slate-700 max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-white font-black uppercase">
                            Create Note
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <Input
                            placeholder="Title"
                            value={newNote.title}
                            onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                            className="bg-slate-700 border-slate-600 text-white"
                        />
                        <Textarea
                            placeholder="Write your note..."
                            value={newNote.content}
                            onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                            className="bg-slate-700 border-slate-600 text-white min-h-32"
                        />
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-white/60 font-medium">Color:</span>
                            {COLOR_OPTIONS.map((color) => (
                                <button
                                    key={color.id}
                                    onClick={() => setNewNote({ ...newNote, color: color.id })}
                                    className={`w-6 h-6 rounded-full ${color.bg} ${newNote.color === color.id
                                            ? 'ring-2 ring-offset-2 ring-primary ring-offset-slate-800'
                                            : ''
                                        }`}
                                />
                            ))}
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button
                                variant="outline"
                                onClick={() => setIsCreateDialogOpen(false)}
                                className="border-slate-600 text-white hover:bg-slate-700"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleCreateNote}
                                className="bg-primary text-black hover:bg-primary/90 font-bold"
                            >
                                Create
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Edit Note Dialog */}
            <Dialog open={!!editingNote} onOpenChange={() => setEditingNote(null)}>
                <DialogContent className="bg-slate-800 border-slate-700 max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-white font-black uppercase">
                            Edit Note
                        </DialogTitle>
                    </DialogHeader>
                    {editingNote && (
                        <div className="space-y-4">
                            <Input
                                placeholder="Title"
                                value={editingNote.title}
                                onChange={(e) =>
                                    setEditingNote({ ...editingNote, title: e.target.value })
                                }
                                className="bg-slate-700 border-slate-600 text-white"
                            />
                            <Textarea
                                placeholder="Write your note..."
                                value={editingNote.content}
                                onChange={(e) =>
                                    setEditingNote({ ...editingNote, content: e.target.value })
                                }
                                className="bg-slate-700 border-slate-600 text-white min-h-32"
                            />
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-white/60 font-medium">Color:</span>
                                {COLOR_OPTIONS.map((color) => (
                                    <button
                                        key={color.id}
                                        onClick={() =>
                                            setEditingNote({ ...editingNote, color: color.id })
                                        }
                                        className={`w-6 h-6 rounded-full ${color.bg} ${editingNote.color === color.id
                                                ? 'ring-2 ring-offset-2 ring-primary ring-offset-slate-800'
                                                : ''
                                            }`}
                                    />
                                ))}
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => setEditingNote(null)}
                                    className="border-slate-600 text-white hover:bg-slate-700"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={() => handleUpdateNote(editingNote)}
                                    className="bg-primary text-black hover:bg-primary/90 font-bold"
                                >
                                    Save
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}

// Note Card Component
interface NoteCardProps {
    note: Note;
    onEdit: () => void;
    onTogglePin: () => void;
    onToggleArchive: () => void;
    onColorChange: (color: Note['color']) => void;
    onDelete: () => void;
    getColorClasses: (color: Note['color']) => { bg: string; border: string; text: string };
}

function NoteCard({
    note,
    onEdit,
    onTogglePin,
    onToggleArchive,
    onColorChange,
    onDelete,
    getColorClasses,
}: NoteCardProps) {
    const colors = getColorClasses(note.color);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            layout
        >
            <Card
                className={`${colors.bg} ${colors.border} border-2 rounded-lg p-4 min-h-32 cursor-pointer group transition-all hover:shadow-lg relative`}
                onClick={onEdit}
            >
                {/* Pin indicator */}
                {note.is_pinned && (
                    <div className="absolute top-2 left-2">
                        <Pin className={`h-4 w-4 ${colors.text}`} />
                    </div>
                )}

                {/* Menu */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button
                                variant="ghost"
                                size="icon"
                                className={`h-8 w-8 ${colors.text} hover:bg-black/10`}
                            >
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            align="end"
                            className="bg-slate-800 border-slate-700"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <DropdownMenuItem
                                onClick={onTogglePin}
                                className="text-white hover:bg-slate-700 cursor-pointer"
                            >
                                {note.is_pinned ? (
                                    <>
                                        <PinOff className="h-4 w-4 mr-2" />
                                        Unpin
                                    </>
                                ) : (
                                    <>
                                        <Pin className="h-4 w-4 mr-2" />
                                        Pin
                                    </>
                                )}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={onToggleArchive}
                                className="text-white hover:bg-slate-700 cursor-pointer"
                            >
                                {note.is_archived ? (
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
                            <DropdownMenu>
                                <DropdownMenuTrigger className="flex w-full items-center px-2 py-1.5 text-sm text-white hover:bg-slate-700 cursor-pointer">
                                    <Palette className="h-4 w-4 mr-2" />
                                    Color
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    side="right"
                                    className="bg-slate-800 border-slate-700 p-2"
                                >
                                    <div className="flex gap-2">
                                        {COLOR_OPTIONS.map((color) => (
                                            <button
                                                key={color.id}
                                                onClick={() => onColorChange(color.id)}
                                                className={`w-6 h-6 rounded-full ${color.bg} ${note.color === color.id
                                                        ? 'ring-2 ring-primary'
                                                        : ''
                                                    }`}
                                            />
                                        ))}
                                    </div>
                                </DropdownMenuContent>
                            </DropdownMenu>
                            <DropdownMenuItem
                                onClick={onDelete}
                                className="text-red-400 hover:bg-red-500/20 cursor-pointer"
                            >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {/* Content */}
                <div className={`${note.is_pinned ? 'mt-6' : 'mt-2'}`}>
                    {note.title && (
                        <h3 className={`font-bold text-sm mb-2 line-clamp-1 ${colors.text}`}>
                            {note.title}
                        </h3>
                    )}
                    {note.content && (
                        <p className={`text-sm line-clamp-4 ${colors.text} opacity-80`}>
                            {note.content}
                        </p>
                    )}
                </div>
            </Card>
        </motion.div>
    );
}
