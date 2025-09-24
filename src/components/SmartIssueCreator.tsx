import React, { useState } from 'react';
import {
  Sparkles,
  Send,
  Brain
} from 'lucide-react';

interface SmartIssueCreatorProps {
  onCreateIssue: (issue: any) => void;
  onClose: () => void;
}

export const SmartIssueCreator: React.FC<SmartIssueCreatorProps> = ({
  onCreateIssue,
  onClose
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [aiMode, setAiMode] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const issue = {
      id: `issue-${Date.now()}`,
      title,
      description,
      priority,
      status: 'open',
      assignee: '',
      tags: [],
      createdAt: new Date().toISOString()
    };

    onCreateIssue(issue);

    // Reset form
    setTitle('');
    setDescription('');
    setPriority('medium');
  };

  return (
    <div className="w-full">
      <div className="bg-slate-700 rounded-lg p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 gap-2">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <h3 className="text-sm sm:text-md font-semibold text-slate-100">Issue Creator</h3>
          </div>
          <div className="flex items-center space-x-1">
            <input
              type="checkbox"
              id="ai-mode"
              checked={aiMode}
              onChange={(e) => setAiMode(e.target.checked)}
              className="w-3 h-3 rounded"
            />
            <label htmlFor="ai-mode" className="text-xs text-slate-300">AI</label>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-1">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Brief issue description..."
              className="w-full px-2 py-2 text-sm bg-slate-600 border border-slate-500 rounded text-slate-100 placeholder-slate-400 focus:border-cyan-400 focus:outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-1">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Details..."
                rows={2}
                className="w-full px-2 py-2 text-sm bg-slate-600 border border-slate-500 rounded text-slate-100 placeholder-slate-400 focus:border-cyan-400 focus:outline-none resize-none"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-1">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full px-2 py-2 text-sm bg-slate-600 border border-slate-500 rounded text-slate-100 focus:border-cyan-400 focus:outline-none"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded text-xs sm:text-sm transition-colors flex items-center space-x-1"
            >
              <Send className="w-3 h-3" />
              <span>Create</span>
            </button>
          </div>
        </form>

        {aiMode && (
          <div className="mt-4 p-3 bg-slate-600 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Brain className="w-4 h-4 text-purple-400" />
              <span className="text-sm text-purple-300">AI Assistant</span>
            </div>
            <p className="text-xs text-slate-400">
              AI mode enabled. Suggestions will appear as you type.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};