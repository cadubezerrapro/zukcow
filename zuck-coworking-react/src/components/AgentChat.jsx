import React, { useState, useRef, useEffect } from 'react';
import { getAgentById } from '../data/agents';

export default function AgentChat({ agentIds, onClose, onAddAgent, onRemoveAgent }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const agents = agentIds.map(id => getAgentById(id)).filter(Boolean);
  const isMulti = agents.length > 1;

  // Auto-greet on first open
  useEffect(() => {
    if (agents.length > 0 && messages.length === 0) {
      const greetings = agents.map(agent => ({
        id: Date.now() + Math.random(),
        agentId: agent.id,
        agentName: agent.name,
        agentColor: agent.squadColor,
        text: agent.greeting || `Olá! Eu sou ${agent.name}, ${agent.role}. Como posso ajudar?`,
        isAgent: true,
        timestamp: new Date(),
      }));
      setMessages(greetings);
    }
  }, [agentIds.join(',')]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const sendMessage = () => {
    if (!input.trim()) return;

    const userMsg = {
      id: Date.now(),
      text: input.trim(),
      isAgent: false,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');

    // Simulate agent responses (future: real AI API)
    setTimeout(() => {
      const responses = agents.map(agent => ({
        id: Date.now() + Math.random(),
        agentId: agent.id,
        agentName: agent.name,
        agentColor: agent.squadColor,
        text: generateResponse(agent, input.trim()),
        isAgent: true,
        timestamp: new Date(),
      }));

      // Stagger multi-agent responses
      if (isMulti) {
        responses.forEach((resp, i) => {
          setTimeout(() => {
            setMessages(prev => [...prev, resp]);
          }, i * 800);
        });
      } else {
        setMessages(prev => [...prev, ...responses]);
      }
    }, 500 + Math.random() * 1000);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div style={{
      position: 'fixed', right: 0, top: 0, bottom: 0, width: '420px',
      background: 'linear-gradient(180deg, #0f0f1a 0%, #1a1a2e 100%)',
      borderLeft: '2px solid rgba(139, 92, 246, 0.2)',
      zIndex: 1000, display: 'flex', flexDirection: 'column',
      color: '#e2e8f0', fontFamily: 'Inter, system-ui, sans-serif',
      boxShadow: '-4px 0 24px rgba(0,0,0,0.5)',
    }}>
      {/* Header */}
      <div style={{
        padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.1)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 700 }}>
            {isMulti ? `Chat Multi-Agente (${agents.length})` : `Chat com ${agents[0]?.name}`}
          </h2>
          <div style={{ display: 'flex', gap: '4px', marginTop: '4px', flexWrap: 'wrap' }}>
            {agents.map(a => (
              <span key={a.id} style={{
                background: a.squadColor, color: '#fff', fontSize: '9px',
                fontWeight: 700, padding: '1px 6px', borderRadius: '3px',
                display: 'flex', alignItems: 'center', gap: '3px',
              }}>
                {a.name}
                {isMulti && (
                  <span
                    onClick={() => onRemoveAgent(a.id)}
                    style={{ cursor: 'pointer', fontSize: '10px', opacity: 0.7 }}
                  >✕</span>
                )}
              </span>
            ))}
            <button
              onClick={onAddAgent}
              style={{
                background: 'rgba(255,255,255,0.1)', border: 'none', color: '#64748b',
                fontSize: '10px', padding: '1px 6px', borderRadius: '3px', cursor: 'pointer',
              }}
            >+ Adicionar</button>
          </div>
        </div>
        <button onClick={onClose} style={{
          background: 'rgba(255,255,255,0.1)', border: 'none', color: '#94a3b8',
          fontSize: '18px', cursor: 'pointer', padding: '4px 8px', borderRadius: '6px',
        }}>✕</button>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px' }}>
        {messages.map(msg => (
          <div key={msg.id} style={{
            marginBottom: '10px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: msg.isAgent ? 'flex-start' : 'flex-end',
          }}>
            {msg.isAgent && (
              <span style={{
                fontSize: '10px', fontWeight: 700, color: msg.agentColor || '#8b5cf6',
                marginBottom: '2px', marginLeft: '4px',
              }}>{msg.agentName}</span>
            )}
            <div style={{
              maxWidth: '85%', padding: '10px 14px', borderRadius: '12px',
              fontSize: '13px', lineHeight: 1.5,
              background: msg.isAgent ? 'rgba(139,92,246,0.12)' : 'rgba(99,102,241,0.25)',
              border: msg.isAgent ? '1px solid rgba(139,92,246,0.2)' : '1px solid rgba(99,102,241,0.3)',
              color: msg.isAgent ? '#c4b5fd' : '#e2e8f0',
            }}>
              {msg.text}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div style={{
        padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.1)',
        display: 'flex', gap: '8px',
      }}>
        <textarea
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isMulti ? 'Mensagem para todos os agentes...' : `Mensagem para ${agents[0]?.name}...`}
          rows={1}
          style={{
            flex: 1, padding: '10px 14px', background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px',
            color: '#e2e8f0', fontSize: '13px', outline: 'none', resize: 'none',
            fontFamily: 'Inter, system-ui, sans-serif',
          }}
        />
        <button
          onClick={sendMessage}
          style={{
            padding: '10px 16px', background: '#8b5cf6', border: 'none',
            borderRadius: '10px', color: '#fff', fontSize: '13px', fontWeight: 600,
            cursor: 'pointer', flexShrink: 0,
          }}
        >Enviar</button>
      </div>
    </div>
  );
}

// Temporary simulated response (will be replaced with real AI)
function generateResponse(agent, userMessage) {
  const expertise = (agent.expertise || []).join(', ');
  const responses = [
    `Com base na minha experiência em ${expertise}, posso te ajudar com isso. Me conta mais detalhes sobre o que precisa.`,
    `Ótima pergunta! Na minha área de ${expertise}, a abordagem ideal seria focar nos pontos principais. Quer que eu elabore?`,
    `Entendi sua necessidade. Como ${agent.role}, recomendo começarmos analisando a estratégia atual. Pode me dar mais contexto?`,
    `Isso é exatamente o que eu faço melhor! Vamos trabalhar juntos nisso. Qual é o seu objetivo principal?`,
    `Perfeito, vou usar minha expertise em ${expertise} para te ajudar. Primeiro, me fala: qual é seu público-alvo?`,
  ];
  return responses[Math.floor(Math.random() * responses.length)];
}
