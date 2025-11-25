import React from "react";
import { AGENTS } from "../data/agents";

export default function AgentSidebar() {
  return (
    <div
      style={{
        padding: "20px",
        background: "rgba(255,255,255,0.06)",
        height: "100%",
        borderRadius: "12px",
      }}
    >
      <h3 style={{ color: "#fff", marginBottom: "16px" }}>Assistenter</h3>

      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {Object.values(AGENTS).map((agent) => (
          <div
            key={agent.id}
            style={{
              background: "rgba(255,255,255,0.1)",
              borderRadius: "12px",
              padding: "14px",
              color: "#fff",
              display: "flex",
              gap: "12px",
              alignItems: "center",
            }}
          >
            <div style={{ fontSize: "22px" }}>{agent.icon}</div>
            <div>
              <strong>{agent.name}</strong>
              <div style={{ opacity: 0.7, fontSize: "13px" }}>
                {agent.description}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
