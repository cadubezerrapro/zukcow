import React from 'react';
import { getAgentById, getSquadById } from '../data/agents';

export default function AgentPanel({ agentId, onClose, onCallAgent, onOpenChat }) {
  const agent = getAgentById(agentId);
  if (!agent) return null;

  const squad = getSquadById(agent.squad);

  return (
    <div style={{
      position: 'fixed',
      right: 0,
      top: 0,
      bottom: 0,
      width: '360px',
      background: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)',
      borderLeft: '2px solid rgba(139, 92, 246, 0.3)',
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
      color: '#e2e8f0',
      fontFamily: 'Inter, system-ui, sans-serif',
      boxShadow: '-4px 0 24px rgba(0,0,0,0.5)',
      animation: 'slideInRight 0.3s ease-out',
    }}>
      {/* Header */}
      <div style={{
        padding: '20px',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            {squad && (
              <span style={{
                background: squad.color || '#8B5CF6',
                color: '#fff',
                fontSize: '10px',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: '4px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}>
                {squad.name}
              </span>
            )}
          </div>
          <h2 style={{ margin: '8px 0 4px', fontSize: '22px', fontWeight: 700 }}>
            {agent.name}
          </h2>
          <p style={{ margin: 0, fontSize: '14px', color: '#a78bfa', fontWeight: 500 }}>
            {agent.role}
          </p>
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'rgba(255,255,255,0.1)',
            border: 'none',
            color: '#94a3b8',
            fontSize: '20px',
            cursor: 'pointer',
            padding: '4px 8px',
            borderRadius: '6px',
            lineHeight: 1,
          }}
        >
          ✕
        </button>
      </div>

      {/* Greeting */}
      <div style={{
        padding: '16px 20px',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
      }}>
        <div style={{
          background: 'rgba(139, 92, 246, 0.1)',
          border: '1px solid rgba(139, 92, 246, 0.2)',
          borderRadius: '12px',
          padding: '14px 16px',
          fontSize: '14px',
          lineHeight: 1.5,
          fontStyle: 'italic',
          color: '#c4b5fd',
        }}>
          "{agent.greeting}"
        </div>
      </div>

      {/* Expertise */}
      {agent.expertise && agent.expertise.length > 0 && (
        <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <h3 style={{ margin: '0 0 10px', fontSize: '12px', textTransform: 'uppercase', color: '#64748b', letterSpacing: '1px' }}>
            Expertise
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {agent.expertise.map((tag, i) => (
              <span key={i} style={{
                background: 'rgba(99, 102, 241, 0.15)',
                color: '#a5b4fc',
                fontSize: '12px',
                padding: '4px 10px',
                borderRadius: '6px',
                border: '1px solid rgba(99, 102, 241, 0.2)',
              }}>
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Personality */}
      {agent.personality && (
        <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <h3 style={{ margin: '0 0 10px', fontSize: '12px', textTransform: 'uppercase', color: '#64748b', letterSpacing: '1px' }}>
            Personalidade
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              { label: 'Energia', value: agent.personality.energy },
              { label: 'Sociabilidade', value: agent.personality.sociability },
              { label: 'Foco', value: agent.personality.focus },
            ].map(({ label, value }) => (
              <div key={label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '3px' }}>
                  <span style={{ color: '#94a3b8' }}>{label}</span>
                  <span style={{ color: '#a5b4fc' }}>{Math.round(value * 100)}%</span>
                </div>
                <div style={{ height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    width: `${value * 100}%`,
                    background: 'linear-gradient(90deg, #8b5cf6, #6366f1)',
                    borderRadius: '2px',
                    transition: 'width 0.3s ease',
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div style={{ padding: '20px', marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <button
          onClick={() => onOpenChat && onOpenChat(agent.id)}
          style={{
            width: '100%', padding: '12px',
            background: '#8b5cf6', border: 'none', borderRadius: '10px',
            color: '#fff', fontSize: '14px', fontWeight: 600, cursor: 'pointer',
          }}
        >
          💬 Chat com {agent.name}
        </button>
        <button
          onClick={() => onCallAgent && onCallAgent(agent.id)}
          style={{
            width: '100%', padding: '12px',
            background: 'rgba(99, 102, 241, 0.2)', border: '1px solid rgba(99, 102, 241, 0.3)',
            borderRadius: '10px', color: '#a5b4fc', fontSize: '14px', fontWeight: 600, cursor: 'pointer',
          }}
        >
          📍 Chamar até mim
        </button>
      </div>
    </div>
  );
}
