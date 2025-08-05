'use client';

import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, User as UserIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AIChatbotProps {
  userData?: any;
  onClose: () => void;
}

export default function AIChatbot({ userData, onClose }: AIChatbotProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I&apos;m here to answer any questions you have about TimeBack&apos;s educational approach. How can I help you today?',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Create assistant message placeholder
    const assistantId = Date.now().toString() + '-assistant';
    const assistantMessage: Message = {
      id: assistantId,
      role: 'assistant',
      content: '',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, assistantMessage]);

    try {
      const response = await fetch('/api/ai/chat-tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content
          })),
          userData,
          context: 'timeback-whitepaper'
        })
      });

      if (!response.ok) throw new Error('Failed to get response');

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No reader available');

      const decoder = new TextDecoder();
      let content = '';

      let done = false;
      while (!done) {
        const { done: isDone, value } = await reader.read();
        done = isDone;
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.content) {
                content += data.content;
                setMessages(prev => prev.map(msg => 
                  msg.id === assistantId 
                    ? { ...msg, content } 
                    : msg
                ));
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }
    } catch (error) {
      console.error('[AIChatbot] Error:', error);
      setMessages(prev => prev.map(msg => 
        msg.id === assistantId 
          ? { ...msg, content: 'I apologize, but I encountered an error. Please try again.' } 
          : msg
      ));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-timeback-primary bg-timeback-bg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-timeback-primary rounded-full flex items-center justify-center">
            <Bot className="w-6 h-6 text-white font-cal" />
          </div>
          <div>
            <h3 className="font-semibold text-timeback-primary font-cal">TimeBack AI Assistant</h3>
            <p className="text-sm text-timeback-primary font-cal">Ask me anything about our approach</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-timeback-primary hover:text-timeback-primary transition-colors font-cal"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "flex gap-3",
              message.role === 'user' ? "justify-end" : "justify-start"
            )}
          >
            {message.role === 'assistant' && (
              <div className="w-8 h-8 bg-timeback-bg rounded-full flex items-center justify-center flex-shrink-0">
                <Bot className="w-5 h-5 text-timeback-primary font-cal" />
              </div>
            )}
            <div
              className={cn(
                "max-w-[80%] rounded-xl px-4 py-2",
                message.role === 'user'
                  ? "bg-timeback-primary text-white"
                  : "bg-timeback-bg text-timeback-primary"
              )}
            >
              {message.role === 'user' ? (
                <p className="text-sm whitespace-pre-wrap font-cal">{message.content}</p>
              ) : (
                <ReactMarkdown 
                  components={{
                    h1: ({children}) => <h1 className="text-base font-bold mb-2 font-cal">{children}</h1>,
                    h2: ({children}) => <h2 className="text-sm font-semibold mb-2 font-cal">{children}</h2>,
                    h3: ({children}) => <h3 className="text-sm font-semibold mb-1 font-cal">{children}</h3>,
                    p: ({children}) => <p className="leading-relaxed mb-2 last:mb-0">{children}</p>,
                    ul: ({children}) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
                    ol: ({children}) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
                    li: ({children}) => <li>{children}</li>,
                    strong: ({children}) => <strong className="font-semibold font-cal">{children}</strong>,
                    em: ({children}) => <em className="italic">{children}</em>,
                    code: ({children}) => <code className="bg-timeback-bg text-timeback-primary px-1 py-0.5 rounded text-xs font-mono font-cal">{children}</code>,
                    blockquote: ({children}) => <blockquote className="border-l-2 border-timeback-primary pl-2 my-2">{children}</blockquote>,
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              )}
            </div>
            {message.role === 'user' && (
              <div className="w-8 h-8 bg-timeback-primary rounded-full flex items-center justify-center flex-shrink-0">
                <UserIcon className="w-5 h-5 text-white font-cal" />
              </div>
            )}
          </div>
        ))}
        {isLoading && messages[messages.length - 1]?.content === '' && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 bg-timeback-bg rounded-full flex items-center justify-center flex-shrink-0">
              <Bot className="w-5 h-5 text-timeback-primary font-cal" />
            </div>
            <div className="bg-timeback-bg rounded-xl px-4 py-2">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-timeback-primary rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-timeback-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                <div className="w-2 h-2 bg-timeback-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-timeback-primary">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex gap-2"
        >
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about our learning approach..."
            className="flex-1 px-4 py-2 border border-timeback-primary rounded-xl focus:ring-2 focus:ring-timeback-primary focus:border-transparent"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="px-4 py-2 bg-timeback-primary text-white rounded-xl hover:bg-timeback-primary disabled:opacity-50 disabled:cursor-not-allowed font-cal"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
}