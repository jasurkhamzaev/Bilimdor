import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';
import { PaperPlaneRight, ChatCircle, Users } from '@phosphor-icons/react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const ChatPage = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [connected, setConnected] = useState(false);
  const [room] = useState('global');
  const wsRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    connect();
    return () => {
      if (wsRef.current) wsRef.current.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room]);

  const connect = async () => {
    try {
      const { data } = await axios.get(`${API}/auth/ws-token`, { withCredentials: true });
      const token = data.token;
      
      const wsUrl = process.env.REACT_APP_BACKEND_URL.replace('https://', 'wss://').replace('http://', 'ws://');
      const ws = new WebSocket(`${wsUrl}/api/ws/chat/${room}?token=${token}`);
      
      ws.onopen = () => {
        setConnected(true);
        setMessages([]);
      };
      
      ws.onmessage = (event) => {
        try {
          const d = JSON.parse(event.data);
          if (d.type === 'message' || d.type === 'history') {
            setMessages((prev) => [...prev, d]);
          } else if (d.type === 'join') {
            setMessages((prev) => [...prev, { ...d, system: true, content: `${d.user} qo'shildi` }]);
          }
        } catch (e) {
          console.error(e);
        }
      };
      
      ws.onerror = () => setConnected(false);
      ws.onclose = () => setConnected(false);
      
      wsRef.current = ws;
    } catch (error) {
      console.error('WS connection failed:', error);
      setConnected(false);
    }
  };

  const sendMessage = () => {
    if (!input.trim() || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    wsRef.current.send(JSON.stringify({ content: input.trim() }));
    setInput('');
  };

  return (
    <div className="p-6 h-screen flex flex-col" data-testid="chat-page">
      <div className="mb-6">
        <h1 className="font-heading font-black text-3xl text-primaryPurple dark:text-primaryPink flex items-center gap-3">
          <ChatCircle weight="fill" size={36} />
          Global Chat
        </h1>
        <p className="font-body text-sm text-neutralTextLight dark:text-neutralTextDark">
          {connected ? <span className="text-success">● Ulandi</span> : <span className="text-warning">○ Ulanmoqda...</span>}
        </p>
      </div>

      <div className="flex-1 bg-white dark:bg-card rounded-3xl border-2 border-primaryPurple/20 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 && (
            <div className="text-center text-neutralTextLight dark:text-neutralTextDark mt-12">
              <Users weight="duotone" size={64} className="mx-auto mb-3 text-primaryPurple/30" />
              <p className="font-body">Hali xabarlar yo'q. Birinchi bo'lib yozing!</p>
            </div>
          )}
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.userId === user?.id ? 'justify-end' : 'justify-start'}`}
              data-testid={`msg-${idx}`}
            >
              {msg.system ? (
                <div className="text-center text-xs text-neutralTextLight dark:text-neutralTextDark italic w-full">{msg.content}</div>
              ) : (
                <div className={`max-w-[70%] ${msg.userId === user?.id ? 'bg-primaryPurple text-white' : 'bg-muted text-neutralTextLight dark:text-white'} rounded-2xl px-4 py-2`}>
                  {msg.userId !== user?.id && <div className="text-xs font-bold mb-1 opacity-80">{msg.userName}</div>}
                  <div className="font-body text-sm break-words">{msg.content}</div>
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 border-t-2 border-primaryPurple/20">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Xabar yozing..."
              className="flex-1 h-12 px-4 rounded-2xl border-2 border-primaryPurple/30 focus:border-primaryPurple outline-none bg-background"
              disabled={!connected}
              data-testid="chat-input"
            />
            <button
              onClick={sendMessage}
              disabled={!connected || !input.trim()}
              className="w-12 h-12 rounded-2xl bg-primaryPurple text-white flex items-center justify-center disabled:opacity-50 hover:bg-primaryPink"
              data-testid="chat-send"
            >
              <PaperPlaneRight weight="fill" size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
