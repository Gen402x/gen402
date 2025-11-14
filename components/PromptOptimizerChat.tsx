'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Trash2, Plus, MessageSquare, Send, Loader2, Music, Image as ImageIcon, Video } from 'lucide-react';

interface Chat {
  id: string;
  owner_wallet: string;
  title: string;
  prompt_type: 'music' | 'image' | 'video';
  created_at: string;
  updated_at: string;
}

interface Message {
  id: string;
  chat_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  metadata?: any;
  created_at: string;
}

export default function PromptOptimizerChat() {
  const { publicKey } = useWallet();
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [newChatType, setNewChatType] = useState<'music' | 'image' | 'video'>('image');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (publicKey) {
      loadChats();
    }
  }, [publicKey]);

  useEffect(() => {
    if (selectedChat) {
      loadMessages(selectedChat.id);
    }
  }, [selectedChat]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadChats = async () => {
    if (!publicKey) return;

    try {
      const response = await fetch(`/api/prompt-optimizer?wallet=${publicKey.toBase58()}`);
      const data = await response.json();
      
      if (data.chats) {
        setChats(data.chats);
        if (data.chats.length > 0 && !selectedChat) {
          setSelectedChat(data.chats[0]);
        }
      }
    } catch (error) {
      console.error('Failed to load chats:', error);
    }
  };

  const loadMessages = async (chatId: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/prompt-optimizer/${chatId}/messages`);
      const data = await response.json();
      
      if (data.messages) {
        setMessages(data.messages);
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createNewChat = async () => {
    if (!publicKey) return;

    try {
      const response = await fetch('/api/prompt-optimizer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wallet: publicKey.toBase58(),
          promptType: newChatType,
          title: `${getTypeLabel(newChatType)} Prompts`,
        }),
      });

      const data = await response.json();
      
      if (data.chat) {
        setChats([data.chat, ...chats]);
        setSelectedChat(data.chat);
        setShowNewChatModal(false);
      }
    } catch (error) {
      console.error('Failed to create chat:', error);
    }
  };

  const deleteChat = async (chatId: string) => {
    if (!publicKey) return;
    if (!confirm('Delete this chat?')) return;

    try {
      const response = await fetch(`/api/prompt-optimizer?id=${chatId}&wallet=${publicKey.toBase58()}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setChats(chats.filter(c => c.id !== chatId));
        if (selectedChat?.id === chatId) {
          setSelectedChat(chats.find(c => c.id !== chatId) || null);
          setMessages([]);
        }
      }
    } catch (error) {
      console.error('Failed to delete chat:', error);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || !selectedChat || !publicKey) return;

    setIsSending(true);
    const userMessage = inputMessage;
    setInputMessage('');

    try {
      const response = await fetch('/api/prompt-optimizer/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatId: selectedChat.id,
          userMessage,
          promptType: selectedChat.prompt_type,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get response');
      }

      const responseData = await response.json();
      
      if (responseData.success) {
        await loadMessages(selectedChat.id);
      }

    } catch (error: any) {
      console.error('Failed to send message:', error);
      alert(`Error: ${error.message}`);
      setInputMessage(userMessage);
    } finally {
      setIsSending(false);
    }
  };

  const getTypeIcon = (type: 'music' | 'image' | 'video') => {
    switch (type) {
      case 'music': return <Music className="w-4 h-4" />;
      case 'image': return <ImageIcon className="w-4 h-4" />;
      case 'video': return <Video className="w-4 h-4" />;
    }
  };

  const getTypeLabel = (type: 'music' | 'image' | 'video') => {
    switch (type) {
      case 'music': return 'Music';
      case 'image': return 'Image';
      case 'video': return 'Video';
    }
  };

  const getTypeBadgeColor = (type: 'music' | 'image' | 'video') => {
    switch (type) {
      case 'music': return 'bg-purple-500/20 border-purple-500/30 text-purple-400';
      case 'image': return 'bg-forge-amber/20 border-forge-amber/30 text-forge-amber';
      case 'video': return 'bg-forge-red/20 border-forge-red/30 text-forge-red';
    }
  };

  if (!publicKey) {
    return (
      <div className="flex flex-col items-center justify-center h-[600px] bg-white/5 border border-white/10 rounded-2xl">
        <MessageSquare className="w-16 h-16 text-white/20 mb-6" />
        <p className="text-xl text-white/60 mb-6">Connect wallet to use Prompt Optimizer</p>
        <WalletMultiButton />
      </div>
    );
  }

  return (
    <>
      <div className="flex h-[700px] bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        {/* Sidebar */}
        <div className="w-80 bg-white/5 border-r border-white/10 flex flex-col">
          <div className="p-4 border-b border-white/10">
            <button
              onClick={() => setShowNewChatModal(true)}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-forge-orange to-forge-red text-white px-4 py-3 rounded-lg hover:opacity-90 transition-opacity font-bold text-sm"
            >
              <Plus className="w-5 h-5" />
              New Chat
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {chats.length === 0 ? (
              <div className="p-6 text-center">
                <MessageSquare className="w-12 h-12 mx-auto mb-3 text-white/20" />
                <p className="text-sm text-white/40">No chats yet</p>
              </div>
            ) : (
              <div className="p-2 space-y-1">
                {chats.map((chat) => (
                  <div
                    key={chat.id}
                    onClick={() => setSelectedChat(chat)}
                    className={`group p-3 rounded-lg cursor-pointer transition-all ${
                      selectedChat?.id === chat.id
                        ? 'bg-white/10 border border-white/20'
                        : 'bg-white/5 hover:bg-white/10 border border-transparent'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`${getTypeBadgeColor(chat.prompt_type)} px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider`}>
                            {getTypeLabel(chat.prompt_type)}
                          </span>
                        </div>
                        <p className="text-sm text-white truncate font-medium">
                          {chat.title}
                        </p>
                        <p className="text-xs text-white/40 mt-1">
                          {new Date(chat.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteChat(chat.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-black/20">
          {selectedChat ? (
            <>
              {/* Header */}
              <div className="p-4 border-b border-white/10 bg-white/5">
                <div className="flex items-center gap-3">
                  <div className={`${getTypeBadgeColor(selectedChat.prompt_type)} p-2 rounded-lg border`}>
                    {getTypeIcon(selectedChat.prompt_type)}
                  </div>
                  <div>
                    <h2 className="font-bold text-white">
                      {selectedChat.title}
                    </h2>
                    <p className="text-xs text-white/40">
                      {getTypeLabel(selectedChat.prompt_type)} Prompt Optimizer
                    </p>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {isLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="w-8 h-8 text-forge-orange animate-spin" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center max-w-md">
                      <MessageSquare className="w-16 h-16 mx-auto mb-4 text-white/20" />
                      <p className="text-white/60 mb-2">Start a conversation</p>
                      <p className="text-sm text-white/40">
                        Describe your prompt idea and get AI-powered optimization
                      </p>
                    </div>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-4 ${
                          message.role === 'user'
                            ? 'bg-gradient-to-r from-forge-orange to-forge-red text-white'
                            : 'bg-white/10 text-white border border-white/10'
                        }`}
                      >
                        <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t border-white/10 bg-white/5">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                    placeholder="Describe your prompt idea..."
                    disabled={isSending}
                    className="flex-1 bg-white/10 text-white px-4 py-3 rounded-lg border border-white/10 focus:outline-none focus:border-forge-orange transition-colors disabled:opacity-50 placeholder:text-white/30"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={isSending || !inputMessage.trim()}
                    className="bg-gradient-to-r from-forge-orange to-forge-red text-white px-6 py-3 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-bold"
                  >
                    {isSending ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-white/30 mt-2 text-center">
                  Powered by GPT-4 Turbo • Free forever
                </p>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <MessageSquare className="w-20 h-20 mx-auto mb-4 text-white/10" />
                <p className="text-lg text-white/60 mb-2">Select a chat</p>
                <p className="text-sm text-white/40">or create a new one to get started</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* New Chat Modal */}
      {showNewChatModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-black/90 border border-white/20 rounded-2xl p-8 max-w-md w-full">
            <h3 className="text-2xl font-bold text-white mb-6">New Prompt Chat</h3>
            
            <div className="space-y-3 mb-8">
              <label className="flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-lg cursor-pointer hover:bg-white/10 transition-all">
                <input
                  type="radio"
                  value="image"
                  checked={newChatType === 'image'}
                  onChange={(e) => setNewChatType(e.target.value as 'music' | 'image' | 'video')}
                  className="accent-forge-amber"
                />
                <ImageIcon className="w-5 h-5 text-forge-amber" />
                <div>
                  <div className="text-white font-bold">Image Prompts</div>
                  <div className="text-sm text-white/40">4o Image, Ideogram V3, Qwen</div>
                </div>
              </label>

              <label className="flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-lg cursor-pointer hover:bg-white/10 transition-all">
                <input
                  type="radio"
                  value="video"
                  checked={newChatType === 'video'}
                  onChange={(e) => setNewChatType(e.target.value as 'music' | 'image' | 'video')}
                  className="accent-forge-red"
                />
                <Video className="w-5 h-5 text-forge-red" />
                <div>
                  <div className="text-white font-bold">Video Prompts</div>
                  <div className="text-sm text-white/40">Sora 2, Veo 3.1, Grok Imagine</div>
                </div>
              </label>

              <label className="flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-lg cursor-pointer hover:bg-white/10 transition-all">
                <input
                  type="radio"
                  value="music"
                  checked={newChatType === 'music'}
                  onChange={(e) => setNewChatType(e.target.value as 'music' | 'image' | 'video')}
                  className="accent-purple-500"
                />
                <Music className="w-5 h-5 text-purple-400" />
                <div>
                  <div className="text-white font-bold">Music Prompts</div>
                  <div className="text-sm text-white/40">Suno V3.5, V4.5, V5</div>
                </div>
              </label>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowNewChatModal(false)}
                className="flex-1 px-4 py-3 bg-white/5 border border-white/10 text-white rounded-lg hover:bg-white/10 transition-all font-medium"
              >
                Cancel
              </button>
              <button
                onClick={createNewChat}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-forge-orange to-forge-red text-white rounded-lg hover:opacity-90 transition-opacity font-bold"
              >
                Create Chat
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
