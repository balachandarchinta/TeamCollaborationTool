"use client";

import React, { useState, useEffect } from 'react';
import { TaskBoard, Task } from '@/components/TaskBoard';
import { MessageInput } from '@/components/MessageInput';
import { socket } from '@/lib/socket';
import axios from 'axios';
import { Zap, Layout, Bell, Settings } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    // Fetch initial tasks
    const fetchTasks = async () => {
      try {
        const response = await axios.get(`${API_URL}/tasks`);
        setTasks(response.data);
      } catch (error) {
        console.error('Failed to fetch tasks', error);
      }
    };

    fetchTasks();

    // Listen for real-time updates
    socket.on('task_update', (newTask: Task) => {
      setTasks(prev => [newTask, ...prev]);
      setNotification(newTask.userNotification);
      setTimeout(() => setNotification(null), 5000);
    });

    return () => {
      socket.off('task_update');
    };
  }, []);

  const handleProcessMessage = async (message: string) => {
    setIsLoading(true);
    try {
      await axios.post(`${API_URL}/tasks`, { message });
    } catch (error) {
      console.error('Failed to process message', error);
      alert('Error processing message. Check if backend is running.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-100">
      {/* Sidebar (Fixed Desktop) */}
      <div className="fixed left-0 top-0 bottom-0 w-20 bg-white border-r border-slate-200 flex flex-col items-center py-8 gap-8 hidden md:flex">
        <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
          <Zap className="w-6 h-6 text-white fill-white" />
        </div>
        <div className="flex flex-col gap-6 text-slate-400">
          <Layout className="w-6 h-6 text-blue-600 cursor-pointer" />
          <Bell className="w-6 h-6 hover:text-slate-600 cursor-pointer transition-colors" />
          <Settings className="w-6 h-6 hover:text-slate-600 cursor-pointer transition-colors" />
        </div>
      </div>

      <div className="md:pl-20 flex flex-col min-h-screen">
        {/* Header */}
        <header className="h-20 bg-white/80 backdrop-blur-md sticky top-0 z-10 px-8 flex items-center justify-between border-b border-slate-200">
          <div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">Visibility Dashboard</h1>
            <p className="text-xs text-slate-400 font-medium">Real-time Task Orchestration Engine</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-sm font-semibold text-slate-700">Team Space</span>
              <span className="text-[10px] text-emerald-500 flex items-center gap-1 font-bold uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Sync
              </span>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 border-2 border-white shadow-md" />
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 flex flex-col p-8 gap-8">
          {/* Notification Toast */}
          {notification && (
            <div className="fixed top-24 right-8 z-50 animate-in slide-in-from-right fade-in duration-300">
              <div className="bg-blue-600 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border border-blue-400 max-w-sm">
                <Bell className="w-5 h-5 fill-white/20" />
                <p className="text-sm font-medium leading-tight">{notification}</p>
              </div>
            </div>
          )}

          {/* AI Input Section */}
          <section>
            <div className="mb-6">
              <h2 className="text-sm font-bold text-slate-500 uppercase tracking-[0.2em] mb-1 ml-1">Ingest Communication</h2>
            </div>
            <MessageInput onSend={handleProcessMessage} isLoading={isLoading} />
          </section>

          {/* Task Board Section */}
          <section className="flex-1 flex flex-col min-h-0">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-500 uppercase tracking-[0.2em] ml-1">Project Roadmap</h2>
              <div className="flex gap-2">
                <button className="px-4 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold hover:bg-slate-50 transition-colors">Filters</button>
                <button className="px-4 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold hover:bg-slate-50 transition-colors">Sort by Priority</button>
              </div>
            </div>
            <div className="flex-1 min-h-0">
              <TaskBoard tasks={tasks} />
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
