"use client";

import { AGENTS } from "../data/agents";
import { useState } from "react";

export default function AgentSidebar() {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        overflowY: "auto",
        paddingRight: "6px",
      }}
    >
      <h3
        style={{
          color: "white",
          fontSize: "16px",
          marginBottom: "12px",
          opacity: 0.85,
        }}
      >
        Assistenter
      </h3>

      <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        {Object.values(AGENTS).map((agent) => {
          const isActive = selected === agent.id;

          return (
            <div
              key={agent.id}
              onClick={() => setSelected(agent.id)}
              style={{
                padding: "14px",
                borderRadius: "12px",
                cursor: "pointer",
                background: isActive
                  ? "rgba(0, 140, 180, 0.45)"
                  : "rgba(255,255,255,0.08)",
                boxShadow: isActive
                  ? "0 0 10px rgba(0,140,180,0.4)"
                  : "0 0 6px rgba(0,0,0,0.3)",
                border: isActive
                  ? "1px solid rgba(0,180,220,0.5)"
                  : "1px solid transparent",
              }}
            >
              <div style={{ fontSize: "18px" }}>{agent.icon}</div>
              <strong style={{ color: "white", fontSize: "15px" }}>
                {agent.name}
              </strong>
              <div style={{ color: "#cfd8dc", fontSize: "13px" }}>
                {agent.description}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
