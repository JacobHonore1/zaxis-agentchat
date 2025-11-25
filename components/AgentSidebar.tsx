"use client";

import { useState } from "react";
import { AGENTS } from "../data/agents";

export default function AgentSidebar() {
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: "rgba(255,255,255,0.04)",
        borderRadius: "12px",
        padding: "20px",
        color: "#fff",
        display: "flex",
        flexDirection: "column",
        gap: "18px",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          fontSize: "15px",
          opacity: 0.85,
          fontWeight: 500,
        }}
      >
        Assistenter
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        {Object.values(AGENTS).map((agent) => {
          const active = selectedAgent === agent.id;

          return (
            <div
              key={agent.id}
              onClick={() => setSelectedAgent(agent.id)}
              style={{
                padding: "16px",
                borderRadius: "12px",
                cursor: "pointer",
                background: active
                  ? "rgba(0,150,200,0.35)"
                  : "rgba(255,255,255,0.06)",
                border: active ? "1px solid #00aaff" : "1px solid transparent",
                boxShadow: active
                  ? "0 0 14px rgba(0,150,200,0.25)"
                  : "none",
                transition: "all 0.18s ease",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  marginBottom: "4px",
                  fontSize: "18px",
                  fontWeight: 600,
                }}
              >
                <span style={{ fontSize: "22px" }}>{agent.icon}</span>
                {agent.name}
              </div>

              <div style={{ fontSize: "13px", opacity: 0.8 }}>
                {agent.description}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
