'use client';

import { AgentId, agents } from '../config/agents';

type Props = {
  currentAgentId: AgentId;
  onSelectAgent: (id: AgentId) => void;
};

export default function AgentSidebar({ currentAgentId, onSelectAgent }: Props) {
  return (
    <div style={{
      height: "100%",
      padding: 16,
      color: "white",
      display: "flex",
      flexDirection: "column",
      gap: 12
    }}>
      <div style={{
        fontSize: "0.8rem",
        opacity: 0.7,
        letterSpacing: "0.07em"
      }}>
        AI agenter
      </div>

      {Object.values(agents).map(agent => {
        const active = agent.id === currentAgentId;
        return (
          <button
            key={agent.id}
            onClick={() => onSelectAgent(agent.id)}
            style={{
              width: "100%",
              textAlign: "left",
              padding: "12px",
              background: active ? "rgba(255,255,255,0.14)" : "rgba(255,255,255,0.06)",
              borderRadius: 10,
              border: active ? `1px solid ${agent.accentColor}` : "none",
              color: "white",
              cursor: "pointer",
              display: "flex",
              gap: 10,
              alignItems: "center",
            }}
          >
            <div style={{
              width: 32,
              height: 32,
              borderRadius: 999,
              background: "rgba(0,0,0,0.25)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 18
            }}>
              {agent.iconEmoji}
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600 }}>{agent.name}</div>
              <div style={{ fontSize: "0.75rem", opacity: 0.8 }}>
                {agent.description}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
