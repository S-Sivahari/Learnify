import { useState, useEffect } from 'react';
import { friendsService, Friendship, UserProfile } from '@/services/friendsService';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Users, UserPlus, Inbox, Search, Flame, Check, X, MessageCircle, Phone, Video, Trophy, TrendingUp, Medal, Hash, Plus } from 'lucide-react';
import { studyGroupsService, type StudyGroup } from '@/services/studyGroupsService';
import { messagingService } from '@/services/messagingService';
import GroupChat from '@/components/studyGroups/GroupChat';
import CreateGroupModal from '@/components/studyGroups/CreateGroupModal';
import { useNavigate } from 'react-router-dom';
import { createCallSession, updateParticipantStatus, type CallSession } from '@/services/callingService';
import { CallInterface } from '@/components/calling/CallInterface';
import { IncomingCallModal } from '@/components/calling/IncomingCallModal';
import { useToast } from '@/hooks/use-toast';
import { useCallNotifications } from '@/hooks/useCallNotifications';
import { supabase } from '@/lib/supabase';
import { NotificationCenter } from '@/components/NotificationCenter';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { callSignalingService } from '@/services/callSignalingService';
import { webrtcService } from '@/services/webrtcService';
import { motion } from 'framer-motion';

export default function Friends() {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [friends, setFriends] = useState<UserProfile[]>([]);
    const [onlineFriends, setOnlineFriends] = useState<UserProfile[]>([]);
    const [pendingRequests, setPendingRequests] = useState<Friendship[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [groups, setGroups] = useState<StudyGroup[]>([]);
    const [selectedGroup, setSelectedGroup] = useState<StudyGroup | null>(null);
    const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [activeCall, setActiveCall] = useState<CallSession | null>(null);
    const [isInitiatingCall, setIsInitiatingCall] = useState(false);
    const [currentRecipientId, setCurrentRecipientId] = useState<string>('');
    const [showFullRankings, setShowFullRankings] = useState(false);

    // Use the call notifications hook
    const { incomingCall, callerName, currentOffer, callerId, clearIncomingCall } = useCallNotifications();

    // Track online status
    useOnlineStatus();

    useEffect(() => {
        loadFriendsData();
    }, []);

    const loadFriendsData = async () => {
        try {
            const [allFriends, online, requests] = await Promise.all([
                friendsService.getFriends(),
                friendsService.getOnlineFriends(),
                friendsService.getPendingRequests()
            ]);

            // Add mock data for demonstration
            const mockFriends: UserProfile[] = [
                {
                    id: 'mock-1',
                    username: 'alex_learns',
                    display_name: 'Alex Johnson',
                    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex',
                    status: 'online',
                    streak: 45,
                    level: 12,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                },
                {
                    id: 'mock-2',
                    username: 'sarah_study',
                    display_name: 'Sarah Williams',
                    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
                    status: 'online',
                    streak: 38,
                    level: 10,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                },
                {
                    id: 'mock-3',
                    username: 'mike_master',
                    display_name: 'Mike Chen',
                    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mike',
                    status: 'online',
                    streak: 52,
                    level: 15,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                },
                {
                    id: 'mock-4',
                    username: 'emma_ace',
                    display_name: 'Emma Davis',
                    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=emma',
                    status: 'offline',
                    streak: 28,
                    level: 8,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                },
                {
                    id: 'mock-5',
                    username: 'james_swift',
                    display_name: 'James Martinez',
                    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=james',
                    status: 'online',
                    streak: 67,
                    level: 18,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                },
                {
                    id: 'mock-6',
                    username: 'lisa_bright',
                    display_name: 'Lisa Anderson',
                    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lisa',
                    status: 'online',
                    streak: 21,
                    level: 6,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                },
                {
                    id: 'mock-7',
                    username: 'kevin_pro',
                    display_name: 'Kevin Taylor',
                    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=kevin',
                    status: 'offline',
                    streak: 15,
                    level: 5,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                },
                {
                    id: 'mock-8',
                    username: 'nina_genius',
                    display_name: 'Nina Patel',
                    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=nina',
                    status: 'online',
                    streak: 33,
                    level: 9,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                },
                {
                    id: 'mock-9',
                    username: 'ryan_scholar',
                    display_name: 'Ryan Lee',
                    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ryan',
                    status: 'offline',
                    streak: 12,
                    level: 4,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                },
                {
                    id: 'mock-10',
                    username: 'sophia_star',
                    display_name: 'Sophia Brown',
                    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sophia',
                    status: 'online',
                    streak: 41,
                    level: 11,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                },
                {
                    id: 'mock-11',
                    username: 'david_elite',
                    display_name: 'David Wilson',
                    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=david',
                    status: 'offline',
                    streak: 8,
                    level: 3,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                },
                {
                    id: 'mock-12',
                    username: 'olivia_focus',
                    display_name: 'Olivia Garcia',
                    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=olivia',
                    status: 'online',
                    streak: 19,
                    level: 7,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                }
            ];

            const combinedFriends = [...allFriends, ...mockFriends];
            setFriends(combinedFriends);
            
            const mockOnline = mockFriends.filter(f => f.status === 'online');
            setOnlineFriends([...online, ...mockOnline]);
            
            setPendingRequests(requests);

            // Load study groups
            try {
                const groupsData = await studyGroupsService.getMyGroups();
                setGroups(groupsData);
                
                // Load unread counts for each group
                const counts: Record<string, number> = {};
                for (const group of groupsData) {
                    try {
                        const count = await messagingService.getUnreadCount(group.id);
                        counts[group.id] = count;
                    } catch (error) {
                        counts[group.id] = 0;
                    }
                }
                setUnreadCounts(counts);
            } catch (error) {
                console.error('Error loading groups:', error);
            }
        } catch (error) {
            console.error('Error loading friends:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAcceptRequest = async (requestId: string) => {
        await friendsService.acceptFriendRequest(requestId);
        await loadFriendsData();
    };

    const handleRejectRequest = async (requestId: string) => {
        await friendsService.rejectFriendRequest(requestId);
        await loadFriendsData();
    };

    const handleSendEncouragement = async (friendId: string, type: 'fire' | 'clap' | 'star' | 'thumbs_up') => {
        // await friendsService.sendEncouragement(friendId, type);
        console.log('Encouragement sent:', type);
    };

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;
        const results = await friendsService.searchUsers(searchQuery);
        // Show results in modal or list
        console.log('Search results:', results);
    };

    const handleStartDM = async (friendId: string) => {
        try {
            const group = await studyGroupsService.startDirectMessage(friendId);
            // Navigate to study groups with this DM selected
            navigate(`/study-groups?dm=${group.id}`);
        } catch (error) {
            console.error('Error starting DM:', error);
        }
    };

    const handleStartCall = async (friendId: string, callType: 'audio' | 'video') => {
        try {
            setIsInitiatingCall(true);
            setCurrentRecipientId(friendId);

            // Step 1: Get local media stream
            const stream = await webrtcService.getLocalStream({
                audio: true,
                video: callType === 'video',
            });

            console.log('[Friends] Local stream obtained:', {
                audioTracks: stream.getAudioTracks().length,
                videoTracks: stream.getVideoTracks().length,
            });

            // Step 2: Get current user
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('User not authenticated');

            // Step 3: Create call session FIRST to get callId
            const { session: newCallSession, error: sessionError } = await createCallSession(
                callType,
                [friendId]
            );

            if (sessionError || !newCallSession) {
                throw sessionError || new Error('Failed to create call session');
            }

            const callId = newCallSession.id;
            console.log('[Friends] Call session created:', callId);

            // Step 4: Set active call state immediately so we have callId for ICE candidates
            setActiveCall({
                id: callId,
                call_type: callType,
                room_id: newCallSession.room_id,
                initiator_id: user.id,
                status: 'ringing',
                started_at: new Date().toISOString(),
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            } as CallSession);

            // Step 5: Now initialize peer connection with the correct callId
            webrtcService.initializePeerConnection(
                // Handle ICE candidates - callId is now available
                async (candidate) => {
                    console.log('[Friends] Sending ICE candidate for call:', callId);
                    await callSignalingService.sendIceCandidate(friendId, callId, candidate);
                },
                // Handle remote stream
                (remoteStream) => {
                    console.log('[Friends] Remote stream received');

                    // DEBUG: Check audio tracks
                    const audioTracks = remoteStream.getAudioTracks();
                    const videoTracks = remoteStream.getVideoTracks();
                    console.log('[Friends] Audio tracks:', audioTracks.length, audioTracks);
                    console.log('[Friends] Video tracks:', videoTracks.length, videoTracks);

                    if (audioTracks.length > 0) {
                        audioTracks.forEach((track, i) => {
                            console.log(`[Friends] Audio track ${i} BEFORE unmute:`, {
                                enabled: track.enabled,
                                muted: track.muted,
                                readyState: track.readyState,
                                label: track.label
                            });

                            // CRITICAL FIX: Tracks often arrive muted, need to unmute them
                            // Note: track.muted is read-only, but we ensure track.enabled = true
                            track.enabled = true;

                            console.log(`[Friends] Audio track ${i} AFTER fix, enabled:`, track.enabled);
                        });
                    } else {
                        console.error('[Friends] ⚠️ NO AUDIO TRACKS in remote stream!');
                    }
                }
            );

            // Step 6: Add local stream to peer connection
            webrtcService.addLocalStream(stream);
            console.log('[Friends] Local stream added to peer connection');

            // Step 7: Create WebRTC offer
            const offer = await webrtcService.createOffer();
            console.log('[Friends] WebRTC offer created');

            // Step 8: Get caller profile for the signaling message
            const { data: callerProfile } = await supabase
                .from('user_profiles')
                .select('display_name, username')
                .eq('id', user.id)
                .single();

            // Step 9: Send call offer via signaling (manually, since we already created the session)
            await callSignalingService.sendSignal(friendId, {
                type: 'call-offer',
                callId: callId,
                from: user.id,
                to: friendId,
                data: {
                    callId: callId,
                    callType: callType,
                    offer: offer,
                    caller: {
                        id: user.id,
                        name: callerProfile?.display_name || callerProfile?.username || 'Unknown'
                    }
                }
            });

            console.log('[Friends] Call offer sent');

            toast({
                title: `${callType === 'video' ? 'Video' : 'Audio'} Call Started`,
                description: 'Calling...',
            });

            // Step 10: Listen for call answer
            await callSignalingService.initializePersonalChannel(
                () => { },
                async (answer) => {
                    console.log('[Friends] Call answered, setting remote description');
                    await webrtcService.setRemoteDescription(answer.answer);
                    setActiveCall(prev => prev ? { ...prev, status: 'active' } : null);
                },
                async (candidate) => {
                    console.log('[Friends] Remote ICE candidate received');
                    await webrtcService.addIceCandidate(candidate);
                },
                () => {
                    handleEndCall();
                },
                () => {
                    toast({
                        title: 'Call Declined',
                        description: 'The recipient declined your call',
                        variant: 'destructive',
                    });
                    handleEndCall();
                }
            );
        } catch (error: any) {
            console.error('Error starting call:', error);
            toast({
                title: 'Call Failed',
                description: error.message || 'Failed to start call',
                variant: 'destructive',
            });
            setIsInitiatingCall(false);
            setCurrentRecipientId('');
        }
    };

    const handleEndCall = async () => {
        if (activeCall) {
            await callSignalingService.endCall(activeCall.id, currentRecipientId);
        }
        webrtcService.cleanup();
        setActiveCall(null);
        setIsInitiatingCall(false);
        setCurrentRecipientId('');
        clearIncomingCall();
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6">
                <div className="max-w-6xl mx-auto">
                    <div className="animate-pulse space-y-4">
                        <div className="h-12 bg-obsidian rounded"></div>
                        <div className="h-64 bg-obsidian rounded"></div>
                    </div>
                </div>
            </div>
        );
    }

    // Separate DMs from regular groups
    const directMessages = groups.filter(g => g.max_members === 2);
    const regularGroups = groups.filter(g => g.max_members !== 2);

    // Sort friends by performance score
    const rankedFriends = [...friends].sort((a, b) => {
        const scoreA = (a.streak || 0) * 10 + ((a.level || 1) * 100);
        const scoreB = (b.streak || 0) * 10 + ((b.level || 1) * 100);
        return scoreB - scoreA;
    });

    return (
        <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black p-6">
            <div className="max-w-[1800px] mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-3xl font-black text-primary flex items-center gap-3">
                            <Users className="h-8 w-8" />
                            SOCIAL HUB
                        </h1>
                        <p className="text-gray-400 mt-1 text-sm">
                            {onlineFriends.length} of {friends.length} friends online
                        </p>
                    </div>
                </div>

                {/* Main Layout: 2 Columns */}
                <div className="flex gap-4 h-[calc(100vh-140px)]">
                    {/* LEFT COLUMN - Performance + Friends List */}
                    <div className="w-[25%] flex flex-col gap-4 h-full flex-shrink-0">
                        {/* Top Performers Section */}
                        <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/10 border-2 border-yellow-500/30 flex-shrink-0">
                            <div className="p-3">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <Trophy className="w-5 h-5 text-yellow-500" />
                                        <h2 className="text-sm font-black uppercase text-yellow-500">
                                            {showFullRankings ? 'RANKINGS' : 'TOP 3'}
                                        </h2>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setShowFullRankings(!showFullRankings)}
                                        className="text-yellow-500 hover:text-yellow-400 font-bold h-6 px-2 text-xs"
                                    >
                                        {showFullRankings ? 'Less' : 'All'}
                                    </Button>
                                </div>

                                <div className="space-y-2">
                                    {(showFullRankings ? rankedFriends : rankedFriends.slice(0, 3)).map((friend, index) => {
                                        const score = (friend.streak || 0) * 10 + ((friend.level || 1) * 100);
                                        const tier = index < 3 ? 'BEST' : index < 8 ? 'MID' : 'GROW';

                                        return (
                                            <motion.div
                                                key={friend.id}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: index * 0.03 }}
                                                className="flex items-center gap-2 p-2 bg-black/40 rounded-lg"
                                            >
                                                {/* Rank */}
                                                <div className={`flex items-center justify-center w-6 h-6 rounded-full font-black text-xs ${
                                                    index < 3 ? 'bg-gradient-to-br from-yellow-500 to-yellow-600 text-black' : 'bg-slate-700 text-white'
                                                }`}>
                                                    {index + 1}
                                                </div>

                                                {/* Avatar */}
                                                <img
                                                    src={friend.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${friend.username}`}
                                                    alt={friend.display_name || friend.username}
                                                    className="h-8 w-8 rounded-full border border-yellow-500/30"
                                                />

                                                {/* Info */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-1">
                                                        <h3 className="font-bold text-white text-xs truncate">
                                                            {friend.display_name || friend.username}
                                                        </h3>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-xs text-gray-400">
                                                        <span className="flex items-center gap-1">
                                                            <Flame className="w-3 h-3 text-orange-500" />
                                                            {friend.streak || 0}
                                                        </span>
                                                        <span className="text-gray-600">•</span>
                                                        <span>{tier}</span>
                                                    </div>
                                                </div>

                                                {/* Score */}
                                                <div className="text-right">
                                                    <div className="text-sm font-black text-primary">{score}</div>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            </div>
                        </Card>

                        {/* Friends List */}
                        <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-2 border-primary/30 flex-1 overflow-hidden">
                            <div className="p-3 h-full flex flex-col">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <Users className="w-5 h-5 text-primary" />
                                        <h2 className="text-sm font-black uppercase text-primary">FRIENDS</h2>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {pendingRequests.length > 0 && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-6 w-6 p-0 relative"
                                            >
                                                <Inbox className="w-4 h-4 text-primary" />
                                                <span className="absolute -top-1 -right-1 bg-pink text-white text-xs font-black px-1.5 rounded-full min-w-[16px] h-4 flex items-center justify-center">
                                                    {pendingRequests.length}
                                                </span>
                                            </Button>
                                        )}
                                        <span className="text-xs font-bold text-gray-400">{friends.length}</span>
                                    </div>
                                </div>

                                {/* Search */}
                                <div className="mb-3">
                                    <Input
                                        placeholder="Search..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="bg-black/40 border-primary/20 text-white text-xs h-8"
                                    />
                                </div>

                                {/* Friends List */}
                                <ScrollArea className="h-[calc(100vh-500px)]">
                                    <div className="space-y-1">
                                        {friends.map((friend) => (
                                            <motion.div
                                                key={friend.id}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                whileHover={{ x: 2 }}
                                                className="flex items-center gap-2 p-2 rounded-lg hover:bg-black/40 transition-all cursor-pointer"
                                            >
                                                {/* Avatar with online status */}
                                                <div className="relative">
                                                    <img
                                                        src={friend.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${friend.username}`}
                                                        alt={friend.display_name || friend.username}
                                                        className="h-8 w-8 rounded-full border border-primary/30"
                                                    />
                                                    {friend.status === 'online' ? (
                                                        <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-black" />
                                                    ) : (
                                                        <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-gray-600 border-2 border-black" />
                                                    )}
                                                </div>

                                                {/* Info */}
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-bold text-white text-xs truncate">
                                                        {friend.display_name || friend.username}
                                                    </h3>
                                                    <div className="flex items-center gap-2 text-xs">
                                                        <span className="text-gray-400">Lvl {friend.level || 1}</span>
                                                        <span className="text-gray-600">•</span>
                                                        <span className="flex items-center gap-1 text-orange-500">
                                                            <Flame className="w-3 h-3" />
                                                            {friend.streak || 0}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Message Button */}
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => handleStartDM(friend.id)}
                                                    className="h-6 w-6 p-0 hover:bg-pink/20"
                                                >
                                                    <MessageCircle className="h-3 w-3 text-pink" />
                                                </Button>
                                            </motion.div>
                                        ))}
                                    </div>
                                </ScrollArea>
                            </div>
                        </Card>
                    </div>

                    {/* RIGHT COLUMN - Messages/Chats */}
                    <div className="flex-1">
                        <Card className="bg-gradient-to-br from-pink/10 to-accent/10 border-2 border-pink/30 h-full">
                            <div className="p-4 flex flex-col h-full">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <MessageCircle className="w-6 h-6 text-pink" />
                                        <h2 className="text-xl font-black uppercase text-pink">MESSAGES</h2>
                                    </div>
                                    <Button
                                        onClick={() => setIsCreateModalOpen(true)}
                                        size="sm"
                                        className="bg-primary hover:bg-primary/90 text-black font-bold h-8"
                                    >
                                        <Plus className="w-4 h-4 mr-2" />
                                        Create Group
                                    </Button>
                                </div>

                                <ScrollArea className="flex-1">
                                    <div className="space-y-2">
                                        {/* Direct Messages */}
                                        {directMessages.length > 0 && (
                                            <>
                                                <p className="text-xs font-bold text-gray-400 uppercase mb-2 px-2">Direct Messages</p>
                                                {directMessages.map((dm) => (
                                                    <motion.div
                                                        key={dm.id}
                                                        whileHover={{ scale: 1.01, x: 4 }}
                                                        className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                                                            selectedGroup?.id === dm.id 
                                                                ? 'bg-pink/20 border-2 border-pink' 
                                                                : 'bg-black/40 hover:bg-black/60 border-2 border-transparent'
                                                        }`}
                                                        onClick={() => setSelectedGroup(dm)}
                                                    >
                                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink to-accent flex items-center justify-center">
                                                            <MessageCircle className="w-5 h-5 text-white" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <h3 className="font-bold text-white text-sm truncate">{dm.name}</h3>
                                                            <p className="text-xs text-gray-400 truncate">Direct Message</p>
                                                        </div>
                                                        {unreadCounts[dm.id] > 0 && (
                                                            <span className="bg-pink text-white text-xs font-black px-2 py-1 rounded-full">
                                                                {unreadCounts[dm.id]}
                                                            </span>
                                                        )}
                                                    </motion.div>
                                                ))}
                                            </>
                                        )}

                                        {/* Study Groups */}
                                        {regularGroups.length > 0 && (
                                            <>
                                                <p className="text-xs font-bold text-gray-400 uppercase mb-2 mt-4 px-2">Study Groups</p>
                                                {regularGroups.map((group) => (
                                                    <motion.div
                                                        key={group.id}
                                                        whileHover={{ scale: 1.01, x: 4 }}
                                                        className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                                                            selectedGroup?.id === group.id 
                                                                ? 'bg-primary/20 border-2 border-primary' 
                                                                : 'bg-black/40 hover:bg-black/60 border-2 border-transparent'
                                                        }`}
                                                        onClick={() => setSelectedGroup(group)}
                                                    >
                                                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                                                            <Hash className="w-5 h-5 text-black font-bold" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <h3 className="font-bold text-white text-sm truncate">{group.name}</h3>
                                                            <p className="text-xs text-gray-400 truncate">{group.subject || 'Study Group'}</p>
                                                        </div>
                                                        {unreadCounts[group.id] > 0 && (
                                                            <span className="bg-primary text-black text-xs font-black px-2 py-1 rounded-full">
                                                                {unreadCounts[group.id]}
                                                            </span>
                                                        )}
                                                    </motion.div>
                                                ))}
                                            </>
                                        )}

                                        {directMessages.length === 0 && regularGroups.length === 0 && (
                                            <div className="text-center py-12">
                                                <MessageCircle className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                                                <p className="text-gray-400 text-sm">No messages yet</p>
                                                <p className="text-gray-500 text-xs">Start a conversation with friends</p>
                                            </div>
                                        )}
                                    </div>
                                </ScrollArea>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Active Call Interface */}
            {activeCall && (
                <CallInterface
                    callSession={activeCall}
                    participants={[]}
                    onEndCall={handleEndCall}
                />
            )}

            {/* Incoming Call Modal */}
            {incomingCall && currentOffer && (
                <IncomingCallModal
                    callSession={incomingCall}
                    callerName={callerName}
                    offer={currentOffer}
                    callerId={callerId}
                    onAccept={async (answer) => {
                        // Send answer back to caller
                        await callSignalingService.answerCall(incomingCall.id, callerId, answer);
                        setActiveCall(incomingCall);
                        clearIncomingCall();
                    }}
                    onDecline={async () => {
                        await callSignalingService.declineCall(incomingCall.id, callerId);
                        clearIncomingCall();
                    }}
                />
            )}

            {/* Group Chat Modal */}
            {selectedGroup && (
                <GroupChat
                    group={selectedGroup}
                    onClose={() => setSelectedGroup(null)}
                />
            )}

            {/* Create Group Modal */}
            <CreateGroupModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onGroupCreated={async () => {
                    await loadFriendsData();
                    setIsCreateModalOpen(false);
                }}
            />
        </div>
    );
}
