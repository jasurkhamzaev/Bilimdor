import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { PaperPlaneRight, Robot, X, ChatTeardropDots } from '@phosphor-icons/react';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const AITutorChat = ({ context }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Salom! Men Hashimjonman 👋 Senga qanday yordam bera olaman?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setInput('');
    setLoading(true);

    try {
      const { data } = await axios.post(
        `${API}/ai/tutor`,
        { message: userMessage, sessionId, context },
        { withCredentials: true }
      );
      
      setSessionId(data.sessionId);
      setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
    } catch (error) {
      toast.error('AI bilan bog\'lanishda xatolik');
      console.error(error);
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

  return (
    <>
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full bg-gradient-to-br from-primaryPurple to-primaryPink shadow-2xl flex items-center justify-center"
        data-testid="ai-tutor-toggle"
      >
        {isOpen ? <X weight="bold" size={28} className="text-white" /> : <ChatTeardropDots weight="fill" size={28} className="text-white" />}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="fixed bottom-24 right-6 z-50 w-[400px] max-w-[calc(100vw-3rem)] h-[600px] max-h-[calc(100vh-8rem)] bg-white dark:bg-backgroundDark rounded-3xl shadow-2xl border-2 border-primaryPurple flex flex-col"
            data-testid="ai-tutor-chat"
          >
            <div className="bg-gradient-to-r from-primaryPurple to-primaryPink p-4 rounded-t-3xl flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <Robot weight="fill" size={24} className="text-white" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-white">Hashimjon AI</h3>
                <p className="font-body text-xs text-white/80">O'qituvchi yordamchisi</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  data-testid={`message-${idx}`}
                >
                  <div className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                    msg.role === 'user'
                      ? 'bg-primaryPurple text-white'
                      : 'bg-muted text-neutralTextLight dark:text-neutralTextDark'
                  }`}>
                    <p className="font-body text-sm whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </motion.div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-2xl px-4 py-2">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-primaryPurple rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-primaryPurple rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-primaryPurple rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t-2 border-primaryPurple/20">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Savolingizni yozing..."
                  className="flex-1 h-12 px-4 rounded-2xl border-2 border-primaryPurple/30 focus:border-primaryPurple outline-none bg-background"
                  disabled={loading}
                  data-testid="chat-input"
                />
                <button
                  onClick={sendMessage}
                  disabled={loading || !input.trim()}
                  className="w-12 h-12 rounded-2xl bg-primaryPurple text-white flex items-center justify-center disabled:opacity-50 hover:bg-primaryPink transition-colors"
                  data-testid="send-message-button"
                >
                  <PaperPlaneRight weight="fill" size={20} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AITutorChat;
