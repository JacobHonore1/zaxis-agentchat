"use client";

import { AgentId } from "../config/agents";

export default function AgentSidebar({
  currentAgentId,
  onSelectAgent,
}: {
  currentAgentId: AgentId;
  onSelectAgent: (id: AgentId) => void;
}) {
  const agents = [
    {
      id: "linkedin",
      name: "LinkedIn Skribent",
      description: "Skriver stærke LinkedIn opslag og optimerer tekst.",
      icon: "✏️",
    },
    {
      id: "business",
      name: "Business Agent",
      description: "Forretningsanalyse og rådgivning.",
      icon: "📊",
    },
  ];

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: "rgba(255,255,255,0.04)",
        borderRadius: 16,
        padding: 20,
        display: "flex",
        flexDirection: "column",
        color: "white",
      }}
    >
      <h3
        style={{
          marginBottom: 20,
          marginTop: 0,
          fontSize: "1rem",
          fontWeight: 600,
          opacity: 0.9,
        }}
      >
        Assistenter
      </h3>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {agents.map((agent) => {
          const isActive = agent.id === currentAgentId;

          return (
            <div
              key={agent.id}
              onClick={() => onSelectAgent(agent.id as AgentId)}
              style={{
                background: isActive
                  ? "rgba(56,189,248,0.25)"
                  : "rgba(255,255,255,0.06)",
                borderRadius: 12,
                padding: 14,
                cursor: "pointer",
                transition: "0.2s",
                boxShadow: isActive
                  ? "0 0 8px rgba(56,189,248,0.4)"
                  : "0 0 0 transparent",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: "1.4rem" }}>{agent.icon}</span>
                <div>
                  <strong style={{ fontSize: "0.95rem", display: "block" }}>
                    {agent.name}
                  </strong>
                  <span
                    style={{
                      opacity: 0.7,
                      fontSize: "0.78rem",
                      display: "block",
                      marginTop: 3,
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
