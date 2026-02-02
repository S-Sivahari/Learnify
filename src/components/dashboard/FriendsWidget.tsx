import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface FriendWithPerformance {
    id: string;
    name: string;
    avatar?: string;
    streak: number;
    score: number;
    isOnline: boolean;
}

// Mock data for demonstration
const MOCK_FRIENDS: FriendWithPerformance[] = [
    { id: '1', name: 'Alex Chen', avatar: '', streak: 15, score: 180, isOnline: true },
    { id: '2', name: 'Sarah Kim', avatar: '', streak: 12, score: 145, isOnline: true },
    { id: '3', name: 'Mike Wilson', avatar: '', streak: 8, score: 92, isOnline: false },
    { id: '4', name: 'Emma Davis', avatar: '', streak: 7, score: 78, isOnline: true },
    { id: '5', name: 'James Brown', avatar: '', streak: 5, score: 65, isOnline: false },
    { id: '6', name: 'Lisa Wang', avatar: '', streak: 3, score: 41, isOnline: true },
];

export function FriendsWidget() {
    const [friends, setFriends] = useState<FriendWithPerformance[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchFriendsData = async () => {
            try {
                // TODO: Replace with real API call
                // const allFriends = await friendsService.getFriends();
                
                // Using mock data for now
                await new Promise(resolve => setTimeout(resolve, 500)); // Simulate loading
                setFriends(MOCK_FRIENDS);
            } catch (error) {
                console.error('Error fetching friends data:', error);
                // Fallback to mock data on error
                setFriends(MOCK_FRIENDS);
            } finally {
                setLoading(false);
            }
        };

        fetchFriendsData();

        // Refresh every 30 seconds
        const interval = setInterval(fetchFriendsData, 30000);

        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return (
            <Card className="border border-[#31343B]/50 bg-[#171B21] backdrop-blur-sm rounded-2xl">
                <div className="p-5 animate-pulse space-y-2">
                    <div className="h-4 bg-[#1F2229] rounded w-20"></div>
                    <div className="h-8 bg-[#1F2229] rounded"></div>
                    <div className="h-8 bg-[#1F2229] rounded"></div>
                    <div className="h-8 bg-[#1F2229] rounded"></div>
                </div>
            </Card>
        );
    }

    return (
        <Card className="border border-[#31343B]/50 bg-[#171B21] backdrop-blur-sm rounded-2xl overflow-hidden">
            <div className="p-5 space-y-3">
                {/* Header - Minimal */}
                <div className="flex items-center justify-between pb-2 border-b border-[#31343B]/30">
                    <h3 className="text-xs font-bold text-[#9FA3AE] uppercase tracking-wider flex items-center gap-2">
                        <Users className="w-3.5 h-3.5" />
                        Friends
                    </h3>
                    <button
                        onClick={() => navigate('/friends')}
                        className="text-[10px] font-medium text-[#DAFD78] hover:text-[#DAFD78]/80 uppercase tracking-wider transition-colors"
                    >
                        VIEW ALL
                    </button>
                </div>

                {/* Friends List - Valorant Style */}
                {friends.length === 0 ? (
                    <div className="py-6 text-center">
                        <p className="text-xs text-[#9FA3AE]">No friends yet</p>
                        <button
                            onClick={() => navigate('/friends')}
                            className="mt-2 text-xs text-[#DAFD78] hover:text-[#DAFD78]/80 font-medium"
                        >
                            Add friends
                        </button>
                    </div>
                ) : (
                    <div className="space-y-0.5">
                        {friends.map((friend, index) => (
                            <div
                                key={friend.id}
                                onClick={() => navigate('/friends')}
                                className="flex items-center justify-between py-2 px-2 -mx-2 hover:bg-[#1F2229] cursor-pointer transition-colors group rounded"
                            >
                                <div className="flex items-center gap-2.5 flex-1 min-w-0">
                                    {/* Rank Number */}
                                    <span className="text-[10px] font-bold text-[#9FA3AE] w-4 text-center">
                                        {index + 1}
                                    </span>

                                    {/* Avatar */}
                                    <div className="relative">
                                        {friend.avatar ? (
                                            <img
                                                src={friend.avatar}
                                                alt={friend.name}
                                                className="w-6 h-6 rounded"
                                            />
                                        ) : (
                                            <div className="w-6 h-6 rounded bg-gradient-to-br from-[#6C5BA6] to-[#DAFD78] flex items-center justify-center">
                                                <span className="text-[10px] font-bold text-[#0C0E17]">
                                                    {friend.name.charAt(0).toUpperCase()}
                                                </span>
                                            </div>
                                        )}
                                        {/* Online/Offline indicator */}
                                        <div
                                            className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-[#171B21] ${
                                                friend.isOnline ? 'bg-[#00FF94]' : 'bg-[#9FA3AE]'
                                            }`}
                                        />
                                    </div>

                                    {/* Name */}
                                    <span className="text-xs font-medium text-white truncate flex-1">
                                        {friend.name}
                                    </span>
                                </div>

                                {/* Performance Score - Minimal */}
                                <div className="flex items-center gap-2">
                                    {/* Streak */}
                                    {friend.streak > 0 && (
                                        <div className="flex items-center gap-1">
                                            <span className="text-[10px] text-[#FF4655]">🔥</span>
                                            <span className="text-[10px] font-bold text-[#FF4655]">
                                                {friend.streak}
                                            </span>
                                        </div>
                                    )}
                                    {/* Score */}
                                    <span className="text-[10px] font-bold text-[#9FA3AE] w-8 text-right">
                                        {friend.score}
                                    </span>
                                    {/* Online Status Icon */}
                                    <div className={`w-1.5 h-1.5 rounded-full ${friend.isOnline ? 'bg-[#00FF94]' : 'bg-[#9FA3AE]/30'}`} />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </Card>
    );
}
