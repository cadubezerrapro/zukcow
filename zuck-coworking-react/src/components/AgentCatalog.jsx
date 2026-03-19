import React, { useState, useMemo } from 'react';
import { getAllAgents, getAllSquads, getAgentsBySquad } from '../data/agents';
import eventBus from '../utils/eventBus';

export default function AgentCatalog({ onClose, onCallAgent, onOpenChat, activeChat }) {
  const [search, setSearch] = useState('');
  const [selectedSquad, setSelectedSquad] = useState(null);
  const squads = useMemo(() => getAllSquads(), []);

  const filteredAgents = useMemo(() => {
    let agents = selectedSquad ? getAgentsBySquad(selectedSquad) : getAllAgents();
    if (search.trim()) {
      const q = search.toLowerCase();
      agents = agents.filter(a =>
        a.name.toLowerCase().includes(q) ||
        a.role.toLowerCase().includes(q) ||
        (a.expertise || []).some(e => e.toLowerCase().includes(q))
      );
    }
    return agents;
  }, [search, selectedSquad]);

  return (
    <div style={{
      position: 'fixed', left: 0, top: 0, bottom: 0, width: '380px',
      background: 'linear-gradient(180deg, #0f0f1a 0%, #1a1a2e 100%)',
      borderRight: '2px solid rgba(139, 92, 246, 0.2)',
      zIndex: 999, display: 'flex', flexDirection: 'column',
      color: '#e2e8f0', fontFamily: 'Inter, system-ui, sans-serif',
      boxShadow: '4px 0 24px rgba(0,0,0,0.5)',
    }}>
      {/* Header */}
      <div style={{
        padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.1)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>Agentes IA</h2>
          <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#64748b' }}>
            {filteredAgents.length} agentes disponíveis
          </p>
        </div>
        <button onClick={onClose} style={{
          background: 'rgba(255,255,255,0.1)', border: 'none', color: '#94a3b8',
          fontSize: '18px', cursor: 'pointer', padding: '4px 8px', borderRadius: '6px',
        }}>✕</button>
      </div>

      {/* Search */}
      <div style={{ padding: '12px 16px' }}>
        <input
          type="text"
          placeholder="Buscar agente, skill, expertise..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px',
            color: '#e2e8f0', fontSize: '13px', outline: 'none',
            boxSizing: 'border-box',
          }}
        />
      </div>

      {/* Squad filters */}
      <div style={{
        padding: '0 16px 12px', display: 'flex', flexWrap: 'wrap', gap: '6px',
      }}>
        <button
          onClick={() => setSelectedSquad(null)}
          style={{
            padding: '4px 10px', borderRadius: '12px', border: 'none', cursor: 'pointer',
            fontSize: '11px', fontWeight: 600,
            background: !selectedSquad ? '#8b5cf6' : 'rgba(255,255,255,0.08)',
            color: !selectedSquad ? '#fff' : '#94a3b8',
          }}
        >Todos</button>
        {squads.map(s => (
          <button
            key={s.id}
            onClick={() => setSelectedSquad(s.id === selectedSquad ? null : s.id)}
            style={{
              padding: '4px 10px', borderRadius: '12px', border: 'none', cursor: 'pointer',
              fontSize: '11px', fontWeight: 600,
              background: selectedSquad === s.id ? s.color : 'rgba(255,255,255,0.08)',
              color: selectedSquad === s.id ? '#fff' : '#94a3b8',
            }}
          >{s.name.replace('Squad de ', '').replace('Squad ', '').replace('Mestres de ', '')}</button>
        ))}
      </div>

      {/* Agent list */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 12px' }}>
        {filteredAgents.map(agent => (
          <div key={agent.id} style={{
            padding: '10px 12px', marginBottom: '6px',
            background: 'rgba(255,255,255,0.03)', borderRadius: '10px',
            border: '1px solid rgba(255,255,255,0.06)',
            transition: 'background 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(139,92,246,0.1)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
                  <span style={{
                    background: agent.squadColor, color: '#fff', fontSize: '9px',
                    fontWeight: 700, padding: '1px 6px', borderRadius: '3px',
                  }}>{agent.squadName.replace('Squad de ', '').replace('Squad ', '').replace('Mestres de ', '')}</span>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#e2e8f0' }}>
                    {agent.name}
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: '11px', color: '#64748b' }}>{agent.role}</p>
              </div>
              <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                <button
                  onClick={() => onCallAgent(agent.id)}
                  style={{
                    padding: '5px 10px', background: '#8b5cf6', border: 'none',
                    borderRadius: '6px', color: '#fff', fontSize: '11px', fontWeight: 600,
                    cursor: 'pointer', whiteSpace: 'nowrap',
                  }}
                >Chamar</button>
                <button
                  onClick={() => onOpenChat(agent.id)}
                  style={{
                    padding: '5px 10px', background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.3)',
                    borderRadius: '6px', color: '#a5b4fc', fontSize: '11px', fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >Chat</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
