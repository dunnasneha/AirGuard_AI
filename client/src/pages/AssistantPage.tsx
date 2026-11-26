import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  Sparkles,
  Send,
  User,
  HelpCircle,
} from 'lucide-react';
import { ChatMessage, EnvironmentalContext, UserProfile } from '../types';
import { sendAIChatMessage } from '../services/api';
import { getErrorMessage } from '../utils/errorMessage';

interface AssistantPageProps {
  context: EnvironmentalContext;
  profile: UserProfile;
}

const EXAMPLE_QUESTIONS = [
  'Can I go for a run this evening?',
  'Should I keep my windows open today?',
  'What is a cleaner alternative to driving to college?',
  'How can my family reduce pollution exposure?',
  'What should I do if pollution suddenly gets worse?',
  'Create a low-emission routine for tomorrow.',
];

function renderInlineMarkdown(text: string): React.ReactNode[] {
  const tokens = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
  return tokens.map((token, idx) => {
    if (token.startsWith('**') && token.endsWith('**') && token.length > 4) {
      return <strong key={idx} className="font-bold">{token.slice(2, -2)}</strong>;
    }
    if (token.startsWith('*') && token.endsWith('*') && token.length > 2) {
      return <em key={idx} className="italic opacity-90">{token.slice(1, -1)}</em>;
    }
    return <React.Fragment key={idx}>{token}</React.Fragment>;
  });
}

function renderFormattedMessage(content: string): React.ReactNode {
  const lines = content.split('\n');
  return (
    <div className="space-y-1.5">
      {lines.map((line, i) => {
        const trimmed = line.trim();
        if (!trimmed) {
          return <div key={i} className="h-1" />;
        }
        if (trimmed.startsWith('### ')) {
          return (
            <h4 key={i} className="font-bold text-sm pt-1">
              {renderInlineMarkdown(trimmed.slice(4))}
            </h4>
          );
        }
        if (trimmed.startsWith('- ') || /^\d+\.\s/.test(trimmed)) {
          return (
            <div key={i} className="pl-2 flex items-start space-x-1.5">
              <span className="font-bold opacity-75">•</span>
              <span>{renderInlineMarkdown(trimmed.replace(/^(-\s|\d+\.\s)/, ''))}</span>
            </div>
          );
        }
        return <p key={i}>{renderInlineMarkdown(trimmed)}</p>;
      })}
    </div>
  );
}

export const AssistantPage: React.FC<AssistantPageProps> = ({ context, profile }) => {
  const buildWelcomeContent = () =>
    `Hello! I am **AirWise Assistant**.\n\nI have evaluated current environmental conditions in **${context.location.name}** (AQI **${context.airQuality.aqi}**, **${context.airQuality.category}**) and your **${profile.lifestyle}** profile.\n\nHow can I help you optimize your daily commute, outdoor workout, or indoor air quality today?`;

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      content: buildWelcomeContent(),
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === 'welcome'
          ? { ...msg, content: buildWelcomeContent() }
          : msg
      )
    );
  }, [context.location.name, context.airQuality.aqi, context.airQuality.category, profile.lifestyle]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || loading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      content: query,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await sendAIChatMessage(query, messages, profile, context);
      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        content: res.reply,
        timestamp: new Date().toISOString(),
        contextUsed: res.contextUsed,
        generatedBy: res.generatedBy,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: unknown) {
      const errorMsg: ChatMessage = {
        id: `assistant-err-${Date.now()}`,
        sender: 'assistant',
        content: getErrorMessage(
          err,
          "I'm temporarily experiencing connectivity issues with the AI endpoint. Please try re-sending your question."
        ),
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2">
          <MessageSquare className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            AirWise Assistant
          </h1>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          GenAI-powered conversational advisor answering everyday smog, commute, and indoor air questions.
        </p>
      </div>

      {/* Context Indicator Pill */}
      <div className="p-3 rounded-2xl bg-emerald-50/80 border border-emerald-200/80 dark:bg-emerald-950/40 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-200 flex flex-wrap items-center justify-between gap-2 shadow-sm">
        <div className="flex items-center space-x-2">
          <Sparkles className="h-4 w-4 text-emerald-600 shrink-0" aria-hidden="true" />
          <span>
            Context Active: <strong>{context.location.name}</strong> • AQI <strong>{context.airQuality.aqi}</strong> ({context.airQuality.category}) • PM2.5 <strong>{context.airQuality.pm2_5} µg/m³</strong> • Wind <strong>{context.weather.windSpeed} km/h</strong> • <strong>{profile.lifestyle}</strong>
          </span>
        </div>
        <span className="text-[10px] text-emerald-800 dark:text-emerald-300 font-semibold bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5 rounded-full">
          Live Sensor Context Connected
        </span>
      </div>

      {/* Chat Messages Box */}
      <div
        role="log"
        aria-live="polite"
        aria-label="AirWise Assistant conversation"
        className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm min-h-[420px] max-h-[560px] overflow-y-auto space-y-4 flex flex-col"
      >
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start space-x-3 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-white font-bold text-xs ${
                  isUser
                    ? 'bg-slate-700 dark:bg-slate-600'
                    : 'bg-gradient-to-tr from-emerald-600 to-teal-500 shadow-md shadow-emerald-500/20'
                }`}
              >
                {isUser ? <User className="h-4 w-4" aria-hidden="true" /> : <Sparkles className="h-4 w-4" aria-hidden="true" />}
              </div>

              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-xs leading-relaxed space-y-1.5 ${
                  isUser
                    ? 'bg-emerald-600 text-white rounded-tr-none'
                    : 'bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none'
                }`}
              >
                {isUser ? (
                  <div className="whitespace-pre-wrap">{msg.content}</div>
                ) : (
                  renderFormattedMessage(msg.content)
                )}
                <div
                  className={`text-[10px] pt-1 flex flex-wrap items-center justify-between gap-2 ${
                    isUser ? 'text-emerald-100 text-right' : 'text-slate-500 dark:text-slate-400 text-left'
                  }`}
                >
                  <span>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {!isUser && msg.contextUsed && (
                    <span className="text-[10px] font-medium text-emerald-700 dark:text-emerald-400">
                      Grounded: {msg.contextUsed.location} AQI {msg.contextUsed.aqi} • {msg.generatedBy === 'gemini' ? 'Gemini' : 'Rule Engine'}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shrink-0">
              <Sparkles className="h-4 w-4 animate-spin" />
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl rounded-tl-none border border-slate-200 dark:border-slate-800 text-xs text-slate-500 flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" />
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.2s]" />
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.4s]" />
              <span className="ml-2 font-medium">Analyzing environmental context...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Questions */}
      <div>
        <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">
          <HelpCircle className="h-3.5 w-3.5 text-emerald-600" />
          <span>Quick Example Questions</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {EXAMPLE_QUESTIONS.map((q) => (
            <button
              key={q}
              onClick={() => handleSend(q)}
              disabled={loading}
              className="text-xs px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium transition-colors text-left"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex items-center space-x-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`Ask AirWise Assistant about air quality in ${context.location.name}...`}
          aria-label={`Ask AirWise Assistant about air quality in ${context.location.name}`}
          disabled={loading}
          className="flex-1 px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none shadow-sm"
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="p-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl disabled:opacity-50 transition-colors shadow-md shadow-emerald-600/20"
          aria-label="Send message"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
};
