"use client";

import React, { useState } from 'react';
import { Send, Loader2, Sparkles } from 'lucide-react';

interface MessageInputProps {
  onSend: (message: string) => Promise<void>;
  isLoading: boolean;
}

export const MessageInput: React.FC<MessageInputProps> = ({ onSend, isLoading }) => {
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;
    await onSend(message);
    setMessage('');
  };

  return (
    <div className="bg-white/80 backdrop-blur-md border border-slate-200 rounded-2xl p-4 shadow-xl max-w-3xl mx-auto w-full">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="relative">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Paste team communication here (e.g. 'Hey @Sarah, can you finish the API docs by Friday?')"
            className="w-full min-h-[100px] p-4 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-blue-500/20 text-slate-700 placeholder-slate-400 resize-none transition-all outline-none"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.metaKey) handleSubmit(e);
            }}
          />
          <div className="absolute top-3 right-3 opacity-20 pointer-events-none">
            <Sparkles className="w-5 h-5 text-blue-500" />
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <p className="text-[10px] text-slate-400 font-medium ml-1 italic">
            Press CMD+Enter to send
          </p>
          <button
            type="submit"
            disabled={isLoading || !message.trim()}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-xl font-semibold transition-all shadow-lg shadow-blue-500/20 active:scale-95"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Process Message
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
