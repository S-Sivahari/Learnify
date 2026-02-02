import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Calendar,
  CalendarDays,
  Upload,
  RefreshCw,
  Sparkles,
  LayoutGrid,
  TrendingUp,
  Target,
  Clock,
  AlertCircle,
  Mail
} from 'lucide-react';
// TODO [Phase 35]: Integrate AI-powered study plan generation
// import { useAIContext } from '@/hooks/useAIContext';
// const aiContext = useAIContext({ contextType: 'planner' });
// Use aiContext.sendMessage() to generate personalized study plans
import ExamCalendar from '@/components/smartPlanner/ExamCalendar';
import { useExamCountdown } from '@/hooks/useExamCountdown';
import {
  getMockExamTimetable,
  getMockDailyStudyPlans,
  getMockWorkloadCalendar,
  DailyStudyPlan
} from '@/mocks/studyPlanner';

export default function StudyPlanner() {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [hasImportedExams, setHasImportedExams] = useState(true); // Set to true to show mock data
  const [examsList, setExamsList] = useState(getMockExamTimetable());

  const { upcomingExams, allCountdowns, nearestExam, hasExamToday, hasExamTomorrow } = useExamCountdown();

  const dailyPlans = getMockDailyStudyPlans();

  const handleEditTask = (date: string, taskId: string, updatedTask: Partial<any>) => {
    setExamsList(prev => prev.map(exam => 
      exam.id === taskId ? { ...exam, ...updatedTask } : exam
    ));
  };

  const handleDeleteTask = (date: string, taskId: string) => {
    setExamsList(prev => prev.filter(exam => exam.id !== taskId));
  };

  const handleAddTask = (date: string, task: Partial<any>) => {
    const newTask = {
      id: `task-${Date.now()}`,
      subject: task.subject || '',
      date: task.date || date,
      time: task.time || '',
      duration: task.duration || 0,
      location: task.location || '',
      color: task.color || '#C9B458',
      topics: task.topics || [],
      importance: task.importance || 'medium',
    };
    setExamsList(prev => [...prev, newTask as any]);
  };

  const selectedPlan: DailyStudyPlan | null = selectedDate
    ? dailyPlans.find(plan => plan.date === selectedDate) || null
    : null;

  return (
    <div className="relative min-h-screen bg-slate-50 dark:bg-slate-900 text-white pb-24">
      {/* Cosmic Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0D1117] via-[#161B22] to-[#0D1117]" />
        <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-primary/5 via-transparent to-transparent" />
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: `linear-gradient(rgba(190, 255, 0, 0.1) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(190, 255, 0, 0.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }} />
      </div>

      <div className="relative z-10 container mx-auto px-6 pt-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 border-b border-neon/30 pb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-6xl font-black uppercase mb-4">
                <span className="text-primary">Smart</span>
                <span className="text-accent ml-4">Calendar</span>
              </h1>
              <p className="text-xl text-white/70 font-bold">
                AI-POWERED STUDY PLANNING & EXAM PREPARATION
              </p>
            </div>
          </div>
        </motion.div>

        {!hasImportedExams ? (
          // Empty State
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-20"
          >
            <Calendar className="w-24 h-24 text-gray-500 mb-6" />
            <h2 className="text-3xl font-bold text-white mb-3">No Exam Timetable Yet</h2>
            <p className="text-lg text-gray-400 mb-8 max-w-md text-center">
              Add exams and tasks directly on the calendar
            </p>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {/* Exam Countdown Banner */}
              {upcomingExams.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-r from-primary/20 via-purple/20 to-primary/20 backdrop-blur-xl rounded-2xl p-6 border-2 border-neon/30"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-gradient-to-br from-primary to-accent rounded-xl">
                      <AlertCircle className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-primary" />
                        Upcoming Exams - Next 7 Days
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {upcomingExams.map((countdown, index) => {
                          const getUrgencyColor = () => {
                            if (countdown.urgencyLevel === 'critical') return 'from-red-500/20 to-red-600/20 border-red-500';
                            if (countdown.urgencyLevel === 'urgent') return 'from-orange-500/20 to-orange-600/20 border-orange-500';
                            if (countdown.urgencyLevel === 'moderate') return 'from-yellow-500/20 to-yellow-600/20 border-yellow-500';
                            return 'from-primary/20 to-accent/20 border-neon';
                          };

                          const getBadgeColor = () => {
                            if (countdown.urgencyLevel === 'critical') return 'bg-red-500';
                            if (countdown.urgencyLevel === 'urgent') return 'bg-orange-500';
                            if (countdown.urgencyLevel === 'moderate') return 'bg-yellow-500';
                            return 'bg-primary';
                          };

                          return (
                            <motion.div
                              key={countdown.exam.id}
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: index * 0.1 }}
                              className={`bg-gradient-to-br ${getUrgencyColor()} backdrop-blur-sm rounded-xl p-4 border-2`}
                            >
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                  <h4 className="font-bold text-white text-sm mb-1">
                                    {countdown.exam.exam_name}
                                  </h4>
                                  {countdown.exam.subject && (
                                    <p className="text-xs text-white/70">{countdown.exam.subject}</p>
                                  )}
                                </div>
                                <div className={`${getBadgeColor()} ${countdown.urgencyLevel === 'critical' ? 'animate-pulse' : ''} px-2 py-1 rounded-lg`}>
                                  <span className="text-white font-black text-lg">
                                    {countdown.daysLeft}
                                  </span>
                                  <span className="text-white text-xs ml-1">
                                    {countdown.daysLeft === 1 ? 'day' : 'days'}
                                  </span>
                                </div>
                              </div>
                              <p className="text-white/90 text-xs font-medium">{countdown.message}</p>
                              <div className="mt-2 text-xs text-white/60">
                                📅 {new Date(countdown.exam.exam_date).toLocaleDateString('en-US', {
                                  weekday: 'short',
                                  month: 'short',
                                  day: 'numeric'
                                })}
                                {countdown.exam.exam_time && ` • ⏰ ${countdown.exam.exam_time}`}
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              <div className="grid grid-cols-1 gap-6">
                <div>
                  <ExamCalendar
                    exams={examsList}
                    onDateSelect={setSelectedDate}
                    selectedDate={selectedDate}
                    onEditTask={handleEditTask}
                    onDeleteTask={handleDeleteTask}
                    onAddTask={handleAddTask}
                  />
                </div>
              </div>
          </div>
        )}
      </div>
    </div>
  );
}

