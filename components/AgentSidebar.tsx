"use client";

import { AgentId, agents } from "../config/agents";

export default function AgentSidebar({
  currentAgentId,
  onSelectAgent,
}: {
  currentAgentId: AgentId;
  onSelectAgent: (id: AgentId) => void;
}) {
  const agentList = Object.values(agents);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: "rgba(255,255,255,0.04)",
        borderRadius: 16,
        padding: 20,
        color: "white",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <h3
        style={{
          marginTop: 0,
          marginBottom: 20,
          fontSize: "1rem",
          fontWeight: 600,
          opacity: 0.9,
        }}
      >
        Assistenter
      </h3>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {agentList.map((agent) => {
          const isActive = agent.id === currentAgentId;

          return (
            <div
              key={agent.id}
              onClick={() => onSelectAgent(agent.id)}
              style={{
                padding: 14,
                borderRadius: 12,
                cursor: "pointer",
                background: isActive
                  ? "rgba(56,189,248,0.25)"
                  : "rgba(255,255,255,0.07)",
                boxShadow: isActive
                  ? "0 0 10px rgba(56,189,248,0.4)"
                  : "none",
                transition: "0.15s",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "999px",
                    background: "rgba(0,0,0,0.25)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 18,
                  }}
                >
                  {agent.icon || "🤖"}
                </div>
                <div>
                  <strong
                    style={{
                      fontSize: "0.95rem",
                      display: "block",
                    }}
                  >
                    {agent.name}
                  </strong>
                  <span
                    style={{
                      fontSize: "0.78rem",
                      opacity: 0.7,
                      display: "block",
                      marginTop: 2,
                    }}
                  >
                    {agent.description}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
