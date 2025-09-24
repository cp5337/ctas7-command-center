import React, { useState } from 'react';
import { Task } from '../types';
import {
  Clock,
  User,
  AlertTriangle,
  CheckCircle,
  Plus,
  Edit3,
  Trash2,
  Search,
  Filter,
  Calendar,
  Tag,
  Users,
  X,
  Save,
  Code,
  GitBranch,
  Database,
  Cloud,
  Zap,
  Shield,
  Cpu,
  Network,
  Activity
} from 'lucide-react';

interface KanbanBoardProps {
  tasks: Task[];
  onTaskUpdate: (taskId: string, updates: Partial<Task>) => void;
}

interface NewTaskForm {
  title: string;
  description: string;
  priority: Task['priority'];
  assignedTo: string;
  dueDate: string;
  tags: string[];
  status: Task['status'];
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({ tasks, onTaskUpdate }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState<Task['priority'] | 'all'>('all');
  const [filterAssignee, setFilterAssignee] = useState<string>('all');
  const [showNewTaskForm, setShowNewTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState<string | null>(null);
  const [draggedTask, setDraggedTask] = useState<string | null>(null);

  const [newTaskForm, setNewTaskForm] = useState<NewTaskForm>({
    title: '',
    description: '',
    priority: 'medium',
    assignedTo: '',
    dueDate: '',
    tags: [],
    status: 'todo'
  });

  const columns = [
    { id: 'todo', title: 'To Do', status: 'todo' as const, color: 'border-slate-500' },
    { id: 'in-progress', title: 'In Progress', status: 'in-progress' as const, color: 'border-blue-500' },
    { id: 'review', title: 'Review', status: 'review' as const, color: 'border-yellow-500' },
    { id: 'done', title: 'Done', status: 'done' as const, color: 'border-green-500' },
  ];

  const priorityColors = {
    critical: 'border-l-red-500 bg-red-500/10',
    high: 'border-l-orange-500 bg-orange-500/10',
    medium: 'border-l-yellow-500 bg-yellow-500/10',
    low: 'border-l-green-500 bg-green-500/10',
  };

  const priorityIcons = {
    critical: <AlertTriangle size={14} className="text-red-500" />,
    high: <AlertTriangle size={14} className="text-orange-500" />,
    medium: <Clock size={14} className="text-yellow-500" />,
    low: <CheckCircle size={14} className="text-green-500" />,
  };

  // Get filtered tasks
  const getFilteredTasks = () => {
    return tasks.filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           task.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           task.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
      const matchesAssignee = filterAssignee === 'all' || task.assignedTo === filterAssignee;

      return matchesSearch && matchesPriority && matchesAssignee;
    });
  };

  const getTasksByStatus = (status: Task['status']) => {
    return getFilteredTasks().filter(task => task.status === status);
  };

  const getUniqueAssignees = () => {
    return Array.from(new Set(tasks.map(task => task.assignedTo))).filter(Boolean);
  };

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('text/plain', taskId);
    setDraggedTask(taskId);
  };

  const handleDragEnd = () => {
    setDraggedTask(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, newStatus: Task['status']) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');
    onTaskUpdate(taskId, { status: newStatus });
    setDraggedTask(null);
  };

  const handleCreateTask = () => {
    const newTask: Task = {
      id: `task-${Date.now()}`,
      title: newTaskForm.title,
      description: newTaskForm.description,
      status: newTaskForm.status,
      priority: newTaskForm.priority,
      assignedTo: newTaskForm.assignedTo,
      dueDate: newTaskForm.dueDate,
      tags: newTaskForm.tags,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Simulate adding task (in real app, would call onTaskCreate prop)
    console.log('Creating new task:', newTask);

    // Reset form
    setNewTaskForm({
      title: '',
      description: '',
      priority: 'medium',
      assignedTo: '',
      dueDate: '',
      tags: [],
      status: 'todo'
    });
    setShowNewTaskForm(false);
  };

  const handleDeleteTask = (taskId: string) => {
    // In real app, would call onTaskDelete prop
    console.log('Deleting task:', taskId);
  };

  const addTag = (tag: string) => {
    if (tag && !newTaskForm.tags.includes(tag)) {
      setNewTaskForm(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
    }
  };

  const removeTag = (tagToRemove: string) => {
    setNewTaskForm(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  return (
    <div className="space-y-4">
      {/* Header with Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-slate-800/50 rounded-lg p-4">
        <div className="flex items-center space-x-4 flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
          </div>

          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value as Task['priority'] | 'all')}
            className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            <option value="all">All Priorities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          <select
            value={filterAssignee}
            onChange={(e) => setFilterAssignee(e.target.value)}
            className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            <option value="all">All Assignees</option>
            {getUniqueAssignees().map(assignee => (
              <option key={assignee} value={assignee}>{assignee}</option>
            ))}
          </select>
        </div>

        <button
          onClick={() => setShowNewTaskForm(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>New Task</span>
        </button>
      </div>

      {/* New Task Form Modal */}
      {showNewTaskForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-100">Create New Task</h3>
              <button
                onClick={() => setShowNewTaskForm(false)}
                className="text-slate-400 hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Title</label>
                <input
                  type="text"
                  value={newTaskForm.title}
                  onChange={(e) => setNewTaskForm(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder="Enter task title..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
                <textarea
                  value={newTaskForm.description}
                  onChange={(e) => setNewTaskForm(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder="Enter task description..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Priority</label>
                  <select
                    value={newTaskForm.priority}
                    onChange={(e) => setNewTaskForm(prev => ({ ...prev, priority: e.target.value as Task['priority'] }))}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Status</label>
                  <select
                    value={newTaskForm.status}
                    onChange={(e) => setNewTaskForm(prev => ({ ...prev, status: e.target.value as Task['status'] }))}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    <option value="todo">To Do</option>
                    <option value="in-progress">In Progress</option>
                    <option value="review">Review</option>
                    <option value="done">Done</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Assigned To</label>
                  <input
                    type="text"
                    value={newTaskForm.assignedTo}
                    onChange={(e) => setNewTaskForm(prev => ({ ...prev, assignedTo: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    placeholder="Enter assignee name..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Due Date</label>
                  <input
                    type="date"
                    value={newTaskForm.dueDate}
                    onChange={(e) => setNewTaskForm(prev => ({ ...prev, dueDate: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Tags</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {newTaskForm.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="bg-cyan-600 text-white text-sm px-2 py-1 rounded-full flex items-center space-x-1"
                    >
                      <span>{tag}</span>
                      <button
                        onClick={() => removeTag(tag)}
                        className="text-cyan-200 hover:text-white"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder="Add tag and press Enter..."
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const input = e.target as HTMLInputElement;
                      addTag(input.value.trim());
                      input.value = '';
                    }
                  }}
                  onFocus={(e) => {
                    // Auto-suggest cutting-edge dev tags
                    const suggestions = ['rust', 'webassembly', 'kubernetes', 'graphql', 'typescript', 'microservices', 'containerization', 'ci/cd', 'terraform', 'monitoring', 'observability', 'edge-computing', 'serverless', 'blockchain', 'ai/ml', 'quantum', 'cybersecurity', 'zero-trust', 'devsecops', 'gitops'];
                    e.target.placeholder = `Try: ${suggestions[Math.floor(Math.random() * suggestions.length)]}`;
                  }}
                />
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={handleCreateTask}
                  disabled={!newTaskForm.title.trim()}
                  className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                >
                  <Save className="w-4 h-4" />
                  <span>Create Task</span>
                </button>
                <button
                  onClick={() => setShowNewTaskForm(false)}
                  className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 h-full">
        {columns.map((column) => (
          <div
            key={column.id}
            className={`bg-slate-800/50 rounded-lg p-4 min-h-96 border-t-4 ${column.color} transition-all ${
              draggedTask ? 'ring-2 ring-cyan-500/50' : ''
            }`}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, column.status)}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-slate-100 font-semibold flex items-center space-x-2">
                <span>{column.title}</span>
              </h3>
              <span className="bg-slate-700 text-slate-300 text-xs px-2 py-1 rounded-full">
                {getTasksByStatus(column.status).length}
              </span>
            </div>

            <div className="space-y-3">
              {getTasksByStatus(column.status).map((task) => (
                <div
                  key={task.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, task.id)}
                  onDragEnd={handleDragEnd}
                  className={`bg-slate-700 border-l-4 rounded p-3 cursor-move transition-all hover:bg-slate-600 hover:shadow-lg group ${
                    priorityColors[task.priority]
                  } ${draggedTask === task.id ? 'opacity-50 rotate-2 scale-105' : ''}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="text-slate-100 font-medium text-sm flex-1 pr-2">{task.title}</h4>
                    <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {priorityIcons[task.priority]}
                      <button
                        onClick={() => setEditingTask(task.id)}
                        className="text-slate-400 hover:text-blue-400 transition-colors"
                      >
                        <Edit3 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="text-slate-400 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  <p className="text-slate-400 text-xs mb-3 line-clamp-2">
                    {task.description}
                  </p>

                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-1">
                      <User size={12} className="text-slate-500" />
                      <span className="text-slate-400 text-xs">{task.assignedTo}</span>
                    </div>

                    <div className="flex items-center space-x-1">
                      <Calendar size={12} className="text-slate-500" />
                      <span className="text-slate-400 text-xs">
                        {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {task.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {task.tags.slice(0, 3).map((tag, index) => {
                        // Cutting-edge tech tag styling
                        const getTagStyle = (tag: string) => {
                          const techTags = {
                            'rust': 'bg-orange-600 text-white',
                            'webassembly': 'bg-purple-600 text-white',
                            'kubernetes': 'bg-blue-600 text-white',
                            'graphql': 'bg-pink-600 text-white',
                            'typescript': 'bg-blue-500 text-white',
                            'microservices': 'bg-green-600 text-white',
                            'ci/cd': 'bg-indigo-600 text-white',
                            'terraform': 'bg-purple-500 text-white',
                            'monitoring': 'bg-yellow-600 text-black',
                            'observability': 'bg-teal-600 text-white',
                            'edge-computing': 'bg-red-600 text-white',
                            'serverless': 'bg-yellow-500 text-black',
                            'blockchain': 'bg-gray-600 text-white',
                            'ai/ml': 'bg-emerald-600 text-white',
                            'quantum': 'bg-violet-600 text-white',
                            'cybersecurity': 'bg-red-500 text-white',
                            'zero-trust': 'bg-gray-700 text-white',
                            'devsecops': 'bg-orange-500 text-white',
                            'gitops': 'bg-green-500 text-white'
                          };
                          return techTags[tag.toLowerCase()] || 'bg-slate-800 text-slate-300';
                        };

                        const getTagIcon = (tag: string) => {
                          const iconMap = {
                            'rust': <Code className="w-3 h-3" />,
                            'webassembly': <Cpu className="w-3 h-3" />,
                            'kubernetes': <Cloud className="w-3 h-3" />,
                            'graphql': <Database className="w-3 h-3" />,
                            'typescript': <Code className="w-3 h-3" />,
                            'microservices': <Network className="w-3 h-3" />,
                            'ci/cd': <GitBranch className="w-3 h-3" />,
                            'terraform': <Cloud className="w-3 h-3" />,
                            'monitoring': <Activity className="w-3 h-3" />,
                            'observability': <Activity className="w-3 h-3" />,
                            'cybersecurity': <Shield className="w-3 h-3" />,
                            'zero-trust': <Shield className="w-3 h-3" />,
                            'devsecops': <Shield className="w-3 h-3" />,
                            'gitops': <GitBranch className="w-3 h-3" />
                          };
                          return iconMap[tag.toLowerCase()] || <Tag className="w-3 h-3" />;
                        };

                        return (
                          <span
                            key={index}
                            className={`${getTagStyle(tag)} text-xs px-2 py-1 rounded-full flex items-center space-x-1 font-medium`}
                          >
                            {getTagIcon(tag)}
                            <span>{tag}</span>
                          </span>
                        );
                      })}
                      {task.tags.length > 3 && (
                        <span className="text-slate-400 text-xs bg-slate-600 px-2 py-1 rounded-full">
                          +{task.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {/* Drop zone indicator */}
              {getTasksByStatus(column.status).length === 0 && (
                <div className="border-2 border-dashed border-slate-600 rounded-lg p-8 text-center">
                  <div className="text-slate-500 text-sm">
                    Drop tasks here or click "New Task" to add
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Task Statistics */}
      <div className="bg-slate-800/50 rounded-lg p-4">
        <h4 className="text-md font-semibold text-slate-100 mb-4">Board Statistics</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-slate-400">{getFilteredTasks().length}</div>
            <div className="text-sm text-slate-500">Total Tasks</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">{getTasksByStatus('in-progress').length}</div>
            <div className="text-sm text-slate-500">In Progress</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">{getTasksByStatus('done').length}</div>
            <div className="text-sm text-slate-500">Completed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-400">
              {getFilteredTasks().filter(task =>
                task.priority === 'critical' || task.priority === 'high'
              ).length}
            </div>
            <div className="text-sm text-slate-500">High Priority</div>
          </div>
        </div>
      </div>
    </div>
  );
};