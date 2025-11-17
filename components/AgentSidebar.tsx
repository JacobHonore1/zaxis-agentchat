'use client';

import { AgentId, agents } from '../config/agents';

type Props = {
  currentAgentId: AgentId;
  onSelectAgent: (id: AgentId) => void;
};

export default function AgentSidebar({ currentAgentId, onSelectAgent }: Props) {
  return (
    <div
      style={{
        width: 240,
        background: 'linear-gradient(180deg, #011a26, #023047)',
        borderRight: '1px solid rgba(255,255,255,0.08)',
        padding: 12,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
      }}
    >
      <div
        style={{
          fontSize: '0.8rem',
          textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.6)',
          marginBottom: 6,
          letterSpacing: '0.08em',
        }}
      >
        AI agenter
      </div>

      {Object.values(agents).map((agent) => {
        const isActive = agent.id === currentAgentId;

        return (
          <button
            key={agent.id}
            onClick={() => onSelectAgent(agent.id)}
            style={{
              width: '100%',
              textAlign: 'left',
              borderRadius: 12,
              border: 'none',
              padding: '10px 12px',
              display: 'flex',
              gap: 10,
              alignItems: 'center',
              cursor: 'pointer',
              background: isActive
                ? 'rgba(255,255,255,0.16)'
                : 'rgba(255,255,255,0.06)',
              outline: isActive ? `1px solid ${agent.accentColor}` : 'none',
              color: '#ffffff',
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 999,
                background: 'rgba(0,0,0,0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 18,
              }}
            >
              {agent.iconEmoji}
            </div>

            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  marginBottom: 2,
                }}
              >
                {agent.name}
              </div>

              <div
                style={{
                  fontSize: '0.75rem',
                  color: 'rgba(255,255,255,0.7)',
                }}
              >
                {agent.description}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
