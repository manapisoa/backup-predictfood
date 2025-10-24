import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Loader2 } from 'lucide-react';

export default function ChatBot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [isSetup, setIsSetup] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSetupApiKey = () => {
    if (apiKey.trim()) {
      setIsSetup(true);
    }
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: messages.concat(userMessage),
          max_tokens: 1024,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Erreur API Groq');
      }

      const data = await response.json();
      const assistantMessage = {
        role: 'assistant',
        content: data.choices[0].message.content,
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage = {
        role: 'assistant',
        content: `Erreur: ${error.message}`,
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !loading) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!isSetup) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Card className="w-full max-w-md p-6">
          <h1 className="text-2xl font-bold mb-4 text-center text-gray-800">ChatBot Groq</h1>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Clé API Groq
              </label>
              <Input
                type="password"
                placeholder="Entrez votre clé API Groq"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSetupApiKey();
                }}
              />
              <p className="text-xs text-gray-500 mt-2">
                Obtenez une clé API gratuite sur{' '}
                <a href="https://console.groq.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  console.groq.com
                </a>
              </p>
            </div>
            <Button onClick={handleSetupApiKey} className="w-full" disabled={!apiKey.trim()}>
              Commencer
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 shadow-lg">
        <h1 className="text-2xl font-bold">ChatBot Groq</h1>
        <p className="text-sm opacity-90">Alimenté par Mixtral 8x7B</p>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4 max-w-4xl mx-auto">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-400">
              <p className="text-center">Commencez une conversation...</p>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <Card
                  className={`max-w-md lg:max-w-xl px-4 py-3 ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-900'
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                </Card>
              </div>
            ))
          )}
          {loading && (
            <div className="flex justify-start">
              <Card className="bg-gray-200 px-4 py-3">
                <Loader2 className="w-5 h-5 animate-spin text-gray-600" />
              </Card>
            </div>
          )}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      <div className="border-t bg-white p-4 shadow-lg">
        <div className="max-w-4xl mx-auto flex gap-2">
          <Input
            type="text"
            placeholder="Écrivez votre message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            className="flex-1"
            onKeyDown={handleKeyDown}
          />
          <Button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
          <Button
            onClick={() => {
              setIsSetup(false);
              setMessages([]);
              setInput('');
              setApiKey('');
            }}
            variant="outline"
          >
            Réinitialiser
          </Button>
        </div>
      </div>
    </div>
  );
}