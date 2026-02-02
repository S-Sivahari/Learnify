import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Edit2, Trash2, Plus, X } from 'lucide-react';
import { ExamEntry } from '@/mocks/studyPlanner';
import { useExamCountdown } from '@/hooks/useExamCountdown';
import { ExamSchedule } from '@/types/examNotifications';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

interface ExamCalendarProps {
  exams: ExamEntry[];
  onDateSelect: (date: string) => void;
  selectedDate: string | null;
  onEditTask?: (date: string, taskId: string, updatedTask: Partial<ExamEntry>) => void;
  onDeleteTask?: (date: string, taskId: string) => void;
  onAddTask?: (date: string, task: Partial<ExamEntry>) => void;
}

export default function ExamCalendar({ exams, onDateSelect, selectedDate, onEditTask, onDeleteTask, onAddTask }: ExamCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const { allExams: dbExams } = useExamCountdown();
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<ExamEntry | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [taskForm, setTaskForm] = useState<Partial<ExamEntry>>({});

  // Merge database exams with mock exams (database exams take priority)
  const [mergedExams, setMergedExams] = useState<ExamEntry[]>(exams);

  useEffect(() => {
    if (dbExams && dbExams.length > 0) {
      // Convert database exams to ExamEntry format and merge
      const convertedDbExams: ExamEntry[] = dbExams.map((exam, index) => ({
        id: exam.id || `db-${index}`,
        subject: exam.subject || exam.exam_name,
        date: exam.exam_date,
        time: exam.exam_time || '',
        duration: exam.duration_minutes || 0,
        location: exam.location || '',
        color: exam.color || '#C9B458',
        topics: exam.topics || [],
        importance: 'high' as const,
      }));

      // Combine with mock exams, prioritizing database exams
      const combined: ExamEntry[] = [...convertedDbExams, ...exams.filter(
        mockExam => !dbExams.some(dbExam => dbExam.exam_date === mockExam.date)
      )];

      setMergedExams(combined);
    } else {
      setMergedExams(exams);
    }
  }, [dbExams, exams]);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentMonth);

  const getExamForDate = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return mergedExams.find(exam => exam.date === dateStr);
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      today.getDate() === day &&
      today.getMonth() === month &&
      today.getFullYear() === year
    );
  };

  const isSelected = (day: number) => {
    if (!selectedDate) return false;
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return selectedDate === dateStr;
  };

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1));
  };

  const handleOpenTaskModal = (date: string, exam?: ExamEntry) => {
    if (exam) {
      setSelectedTask(exam);
      setTaskForm(exam);
      setIsEditing(true);
    } else {
      setSelectedTask(null);
      setTaskForm({ date, color: '#C9B458', importance: 'medium' });
      setIsEditing(false);
    }
    setShowTaskModal(true);
  };

  const handleCloseModal = () => {
    setShowTaskModal(false);
    setSelectedTask(null);
    setTaskForm({});
    setIsEditing(false);
  };

  const handleSaveTask = () => {
    if (!taskForm.subject || !taskForm.date) return;

    if (isEditing && selectedTask) {
      onEditTask?.(selectedTask.date, selectedTask.id, taskForm);
    } else {
      onAddTask?.(taskForm.date!, taskForm);
    }
    handleCloseModal();
  };

  const handleDeleteTask = (date: string, taskId: string) => {
    onDeleteTask?.(date, taskId);
    handleCloseModal();
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl p-3 border border-slate-200 dark:border-slate-700">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-4 h-4 text-primary" />
          <h3 className="text-lg font-bold text-white">
            {monthNames[month]} {year}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevMonth}
            className="p-1 rounded-lg bg-white/5 hover:bg-white/10 border border-slate-200 dark:border-slate-700 transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-white" />
          </button>
          <button
            onClick={handleNextMonth}
            className="p-1 rounded-lg bg-white/5 hover:bg-white/10 border border-slate-200 dark:border-slate-700 transition-colors"
          >
            <ChevronRight className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>

      {/* Day names */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map(day => (
          <div key={day} className="text-center text-xs font-bold text-gray-400 py-1">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Empty cells before month starts */}
        {Array.from({ length: startingDayOfWeek }).map((_, i) => (
          <div key={`empty-${i}`} className="h-12" />
        ))}

        {/* Days of month */}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const exam = getExamForDate(day);
          const today = isToday(day);
          const selected = isSelected(day);
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

          return (
            <div key={day} className="relative group">
              <motion.button
                onClick={() => onDateSelect(dateStr)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`
                  w-full h-12 rounded-lg p-1 relative transition-all
                  ${exam ? 'border-2' : 'border border-slate-200 dark:border-slate-700'}
                  ${today ? 'ring-2 ring-neon ring-offset-1 ring-offset-[#0F1115]' : ''}
                  ${selected ? 'bg-white/20' : 'bg-white/5'}
                  ${exam ? `hover:shadow-lg` : 'hover:bg-white/10'}
                `}
                style={{
                  borderColor: exam ? exam.color : undefined,
                  boxShadow: exam ? `0 0 20px ${exam.color}40` : undefined,
                }}
              >
                <div className="flex flex-col items-center justify-center h-full">
                  <span className={`text-xs font-bold ${exam ? 'text-white' : 'text-gray-300'}`}>
                    {day}
                  </span>
                  {exam && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div
                        className="w-2 h-2 rounded-full animate-pulse"
                        style={{ backgroundColor: exam.color }}
                      />
                    </div>
                  )}
                </div>
              </motion.button>

              {/* Task Action Buttons */}
              <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 z-10">
                {exam ? (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenTaskModal(dateStr, exam);
                      }}
                      className="p-1 bg-blue-500 hover:bg-blue-600 rounded text-white"
                      title="Edit task"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm('Delete this task?')) {
                          handleDeleteTask(dateStr, exam.id);
                        }
                      }}
                      className="p-1 bg-red-500 hover:bg-red-600 rounded text-white"
                      title="Delete task"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </>
                ) : (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenTaskModal(dateStr);
                    }}
                    className="p-1 bg-primary hover:bg-primary/90 rounded text-black"
                    title="Add task"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
        <p className="text-xs text-gray-400 mb-3 font-semibold">EXAM SUBJECTS</p>
        <div className="flex flex-wrap gap-2">
          {mergedExams.map((exam, index) => (
            <div
              key={exam.id || `exam-${index}`}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-slate-200 dark:border-slate-700"
            >
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: exam.color || '#C9B458' }}
              />
              <span className="text-xs font-medium text-white">
                {exam.subject}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Task Edit/Add Modal */}
      <Dialog open={showTaskModal} onOpenChange={handleCloseModal}>
        <DialogContent className="bg-gradient-to-br from-[#161B22] to-[#0D1117] border-2 border-primary/30 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-primary">
              {isEditing ? 'EDIT TASK' : 'ADD TASK'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-bold text-gray-300 mb-2 block">Subject / Title</label>
              <Input
                value={taskForm.subject || ''}
                onChange={(e) => setTaskForm({ ...taskForm, subject: e.target.value })}
                placeholder="e.g., Mathematics Exam"
                className="bg-white/10 border-white/20 text-white"
              />
            </div>

            <div>
              <label className="text-sm font-bold text-gray-300 mb-2 block">Date</label>
              <Input
                type="date"
                value={taskForm.date || ''}
                onChange={(e) => setTaskForm({ ...taskForm, date: e.target.value })}
                className="bg-white/10 border-white/20 text-white"
              />
            </div>

            <div>
              <label className="text-sm font-bold text-gray-300 mb-2 block">Time (optional)</label>
              <Input
                type="time"
                value={taskForm.time || ''}
                onChange={(e) => setTaskForm({ ...taskForm, time: e.target.value })}
                className="bg-white/10 border-white/20 text-white"
              />
            </div>

            <div>
              <label className="text-sm font-bold text-gray-300 mb-2 block">Location (optional)</label>
              <Input
                value={taskForm.location || ''}
                onChange={(e) => setTaskForm({ ...taskForm, location: e.target.value })}
                placeholder="e.g., Room 301"
                className="bg-white/10 border-white/20 text-white"
              />
            </div>

            <div>
              <label className="text-sm font-bold text-gray-300 mb-2 block">Duration (minutes)</label>
              <Input
                type="number"
                value={taskForm.duration || ''}
                onChange={(e) => setTaskForm({ ...taskForm, duration: parseInt(e.target.value) })}
                placeholder="e.g., 120"
                className="bg-white/10 border-white/20 text-white"
              />
            </div>

            <div>
              <label className="text-sm font-bold text-gray-300 mb-2 block">Color</label>
              <div className="flex gap-2 flex-wrap">
                {['#C9B458', '#6DAEDB', '#9D84B7', '#F87171', '#34D399', '#FBBF24', '#FB923C'].map(color => (
                  <button
                    key={color}
                    onClick={() => setTaskForm({ ...taskForm, color })}
                    className={`w-8 h-8 rounded-lg border-2 transition-all ${
                      taskForm.color === color ? 'border-white scale-110' : 'border-white/30'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>

          <DialogFooter className="flex gap-2">
            {isEditing && (
              <Button
                onClick={() => selectedTask && handleDeleteTask(selectedTask.date, selectedTask.id)}
                variant="destructive"
                className="bg-red-500 hover:bg-red-600 flex-1"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            )}
            <Button
              onClick={handleCloseModal}
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10 flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveTask}
              className="bg-primary hover:bg-primary/90 text-black font-bold flex-1"
              disabled={!taskForm.subject || !taskForm.date}
            >
              {isEditing ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
