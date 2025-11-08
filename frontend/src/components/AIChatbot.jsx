import { AnimatePresence, motion } from 'framer-motion';
import { Bot, Copy, Lightbulb, MessageSquare, Send, Sparkles, User } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import axiosClient from '../api/axiosClient.js';

const getSuggestedPrompts = (problem) => {
  if (!problem) return [];
  
  return [
    `Explain the approach to solve "${problem.title}"`,
    `What's the time complexity for this problem?`,
    `Show me a step-by-step solution`,
    `What data structures should I use?`,
    `Give me a hint without spoiling the solution`,
  ];
};

function AIChatbot({ problem }) {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [copiedCodeId, setCopiedCodeId] = useState(null);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  useEffect(() => {
    if (problem && messages.length === 0) {
      setMessages([
        {
          role: 'assistant',
          content: `👋 **Hello! I'm your AI coding assistant.**\n\nI'm here to help you understand and solve **"${problem.title}"**. I can:\n\n✨ Explain concepts and approaches\n💡 Provide hints and guidance\n📝 Help with code implementation\n🔍 Analyze time and space complexity\n\nWhat would you like to know?`,
          timestamp: new Date(),
        },
      ]);
    }
  }, [problem]);

  const sendMessage = async (messageText = null) => {
    const textToSend = messageText || inputMessage.trim();
    if (!textToSend || loading) return;

    const userMessage = {
      role: 'user',
      content: textToSend,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');
    setShowSuggestions(false);
    setLoading(true);

    try {
      const { data } = await axiosClient.post('/ai/chat', {
        message: userMessage.content,
        problemContext: problem
          ? {
              title: problem.title,
              description: problem.description,
              difficulty: problem.difficulty,
              tags: problem.tags || [],
            }
          : null,
      });

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: data.response || 'Sorry, I could not generate a response.',
          timestamp: new Date(),
        },
      ]);
    } catch (error) {
      console.error('AI Chat Error:', error);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            error.response?.data?.message ||
            'Sorry, there was an error getting a response. Please try again.',
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const copyToClipboard = async (text, codeId = null) => {
    try {
      await navigator.clipboard.writeText(text);
      if (codeId) {
        setCopiedCodeId(codeId);
        setTimeout(() => setCopiedCodeId(null), 2000);
      }
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const formatTime = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const suggestedPrompts = getSuggestedPrompts(problem);

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-black via-gray-950 to-black min-h-0 relative overflow-hidden">
      {}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-blue-500/5 pointer-events-none" />
      
      {}
      <div className="relative z-10 border-b border-white/10 bg-black/40 backdrop-blur-sm px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full" />
            <div className="relative bg-gradient-to-br from-emerald-500 to-emerald-600 p-2 rounded-full">
              <Bot className="h-5 w-5 text-white" />
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-white font-semibold text-sm">AI Assistant</h3>
            <p className="text-white/50 text-xs">Ready to help you solve problems</p>
          </div>
          <div className="flex items-center gap-1">
            <Sparkles className="h-4 w-4 text-emerald-400 animate-pulse" />
          </div>
        </div>
      </div>

      {}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 relative z-10">
        <AnimatePresence>
          {messages.map((msg, idx) => {
            let codeBlockIndex = 0;
            return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
              className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {}
              <div className={`flex-shrink-0 ${msg.role === 'user' ? 'order-2' : ''}`}>
                {msg.role === 'user' ? (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center border-2 border-emerald-400/30">
                    <User className="h-4 w-4 text-white" />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center border-2 border-blue-400/30 relative">
                    <Bot className="h-4 w-4 text-white" />
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-black animate-pulse" />
                  </div>
                )}
              </div>

              {}
              <div className={`flex-1 ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col gap-1 max-w-[80%]`}>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className={`rounded-2xl px-5 py-4 relative group shadow-lg ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-br from-emerald-500/25 to-emerald-600/15 text-emerald-50 border border-emerald-500/40 rounded-tr-sm shadow-emerald-500/10'
                      : 'bg-gradient-to-br from-white/8 to-white/3 text-white/95 border border-white/15 rounded-tl-sm backdrop-blur-md shadow-white/5'
                  }`}
                >
                  {}
                  <motion.button
                    onClick={() => copyToClipboard(msg.content)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-lg bg-black/50 hover:bg-black/70 border border-white/20 backdrop-blur-sm"
                    title="Copy message"
                  >
                    <Copy className="h-3.5 w-3.5 text-white/80" />
                  </motion.button>

                  {}
                  <div className="text-sm prose prose-invert prose-sm max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                    <ReactMarkdown
                      components={{
                        code: ({ node, inline, className, children, ...props }) => {
                          const match = /language-(\w+)/.exec(className || '');
                          const codeString = String(children).replace(/\n$/, '');
                          const codeId = `code-${idx}-${codeBlockIndex++}`;
                          const isCopied = copiedCodeId === codeId;
                          
                          return !inline && match ? (
                            <div className="relative my-4 group/code">
                              {}
                              <div className="flex items-center justify-between bg-black/60 rounded-t-lg px-4 py-2 border-b border-white/10">
                                <div className="flex items-center gap-2">
                                  <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                                  <span className="text-xs text-white/70 font-mono uppercase tracking-wider">
                                    {match[1]}
                                  </span>
                                </div>
                                <motion.button
                                  onClick={() => copyToClipboard(codeString, codeId)}
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  className={`text-xs px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 font-medium ${
                                    isCopied
                                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50'
                                      : 'bg-white/10 hover:bg-white/20 text-white/70 border border-white/20'
                                  }`}
                                >
                                  {isCopied ? (
                                    <>
                                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                      </svg>
                                      Copied!
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="h-3.5 w-3.5" />
                                      Copy Code
                                    </>
                                  )}
                                </motion.button>
                              </div>
                              {}
                              <div className="bg-gradient-to-br from-black/60 to-black/40 rounded-b-lg border border-white/10 border-t-0 overflow-hidden">
                                <pre className="text-sm font-mono text-white/95 leading-relaxed p-4 overflow-x-auto">
                                  <code className="text-inherit whitespace-pre">{codeString}</code>
                                </pre>
                              </div>
                            </div>
                          ) : (
                            <code className="bg-emerald-500/20 px-1.5 py-0.5 rounded text-emerald-300 font-mono text-xs border border-emerald-500/30" {...props}>
                              {children}
                            </code>
                          );
                        },
                        p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
                        ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
                        ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
                        li: ({ children }) => <li className="text-white/80">{children}</li>,
                        strong: ({ children }) => <strong className="text-white font-semibold">{children}</strong>,
                        h1: ({ children }) => <h1 className="text-lg font-bold mb-2 text-white">{children}</h1>,
                        h2: ({ children }) => <h2 className="text-base font-bold mb-2 text-white">{children}</h2>,
                        h3: ({ children }) => <h3 className="text-sm font-bold mb-1 text-white">{children}</h3>,
                      }}
                    >
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                </motion.div>
                
                {}
                <span className="text-xs text-white/30 px-1">
                  {formatTime(msg.timestamp)}
                </span>
              </div>
            </motion.div>
            );
          })}
        </AnimatePresence>

        {}
        {loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-3"
          >
            <div className="flex-shrink-0">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center border-2 border-blue-400/30">
                <Bot className="h-4 w-4 text-white" />
              </div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl rounded-tl-sm px-4 py-3 backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <motion.div
                  className="w-2 h-2 bg-emerald-400 rounded-full"
                  animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                />
                <motion.div
                  className="w-2 h-2 bg-emerald-400 rounded-full"
                  animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                />
                <motion.div
                  className="w-2 h-2 bg-emerald-400 rounded-full"
                  animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                />
                <span className="text-xs text-white/50 ml-2">AI is thinking...</span>
              </div>
            </div>
          </motion.div>
        )}

        {}
        {showSuggestions && messages.length === 1 && suggestedPrompts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2"
          >
            <div className="flex items-center gap-2 text-white/50 text-xs px-1">
              <Lightbulb className="h-3.5 w-3.5" />
              <span>Suggested questions:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {suggestedPrompts.map((prompt, idx) => (
                <motion.button
                  key={idx}
                  onClick={() => sendMessage(prompt)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-3 py-1.5 text-xs bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-white/70 hover:text-white transition-all flex items-center gap-1.5"
                >
                  <MessageSquare className="h-3 w-3" />
                  {prompt}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {}
      <div className="relative z-10 border-t border-white/10 bg-gradient-to-t from-black/80 via-black/60 to-black/40 backdrop-blur-md p-4">
        <div className="flex gap-3 items-end">
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={inputMessage}
              onChange={(e) => {
                setInputMessage(e.target.value);

                if (textareaRef.current) {
                  textareaRef.current.style.height = 'auto';
                  textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
                }
              }}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about this problem..."
              className="w-full bg-black/50 border border-white/15 rounded-xl px-4 py-3 text-white placeholder:text-white/40 resize-none focus:outline-none focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/30 transition-all text-sm"
              rows={1}
              disabled={loading}
            />
            <div className="absolute bottom-2 right-3 text-xs text-white/25 pointer-events-none">
              Enter to send
            </div>
          </div>
          <motion.button
            onClick={() => sendMessage()}
            disabled={loading || !inputMessage.trim()}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 rounded-xl text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/30 disabled:shadow-none min-w-[100px] justify-center"
          >
            <Send className="h-4 w-4" />
            <span>Send</span>
          </motion.button>
        </div>
      </div>
    </div>
  );
}

export default AIChatbot;
