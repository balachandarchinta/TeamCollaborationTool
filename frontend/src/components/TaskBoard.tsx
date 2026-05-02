"use client";

import React from 'react';
import { AlertCircle, Clock, CheckCircle2, AlertTriangle, User } from 'lucide-react';

export interface Task {
  id: number;
  taskName: string;
  action: string;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  status: string;
  assignee?: string;
  dueDate?: string;
  dependency?: string;
  userNotification: string;
}

interface TaskBoardProps {
  tasks: Task[];
}

const PriorityBadge = ({ priority }: { priority: string }) => {
  const styles = {
    Urgent: "bg-red-500/10 text-red-500 border-red-500/20",
    High: "bg-orange-500/10 text-orange-500 border-orange-500/20",
    Medium: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    Low: "bg-slate-500/10 text-slate-500 border-slate-500/20",
  }[priority] || "bg-slate-500/10 text-slate-500 border-slate-500/20";

  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${styles}`}>
      {priority}
    </span>
  );
};

export const TaskBoard: React.FC<TaskBoardProps> = ({ tasks }) => {
  const columns = ['Pending', 'In Progress', 'Feedback Received', 'Done'];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 h-full overflow-hidden p-4">
      {columns.map((col) => (
        <div key={col} className="flex flex-col gap-4 bg-slate-50/50 rounded-2xl p-4 border border-slate-100">
          <div className="flex items-center justify-between px-2">
            <h3 className="font-semibold text-slate-700 flex items-center gap-2">
              {col === 'Pending' && <Clock className="w-4 h-4 text-slate-400" />}
              {col === 'In Progress' && <AlertCircle className="w-4 h-4 text-blue-400" />}
              {col === 'Feedback Received' && <AlertTriangle className="w-4 h-4 text-orange-400" />}
              {col === 'Done' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
              {col}
            </h3>
            <span className="bg-white px-2 py-0.5 rounded-md text-xs text-slate-400 border border-slate-100 font-medium">
              {tasks.filter(t => t.status === col || (col === 'Pending' && !t.status)).length}
            </span>
          </div>

          <div className="flex flex-col gap-3 overflow-y-auto max-h-[calc(100vh-300px)] scrollbar-hide">
            {tasks
              .filter(t => t.status === col || (col === 'Pending' && !t.status))
              .map((task) => (
                <div
                  key={task.id}
                  className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
                >
                  <div className="flex flex-col gap-2">
                    <div className="flex items-start justify-between">
                      <PriorityBadge priority={task.priority} />
                      <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                        {task.action}
                      </span>
                    </div>
                    <h4 className="font-medium text-slate-800 group-hover:text-blue-600 transition-colors">
                      {task.taskName}
                    </h4>
                    
                    {task.assignee && (
                      <div className="flex items-center gap-1.5 mt-1">
                        <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center">
                          <User className="w-3 h-3 text-slate-500" />
                        </div>
                        <span className="text-xs text-slate-500">{task.assignee}</span>
                      </div>
                    )}

                    {task.dueDate && (
                      <div className="flex items-center gap-1.5 text-xs text-slate-400">
                        <Clock className="w-3 h-3" />
                        <span>Due {task.dueDate}</span>
                      </div>
                    )}

                    {task.dependency && (
                      <div className="mt-2 p-2 bg-red-50/50 rounded-lg border border-red-100 flex items-start gap-2">
                        <AlertTriangle className="w-3 h-3 text-red-400 mt-0.5 shrink-0" />
                        <span className="text-[10px] text-red-600 leading-tight">
                          {task.dependency}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
};
