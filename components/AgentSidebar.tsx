"use client";

import { agents } from "../data/agents";   // <-- FIXED
import { useState } from "react";

export default function AgentSidebar() {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: "rgba(0,0,0,0.35)",
        borderRadius: "12px",
        padding: "20px",
        color: "#fff",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
      }}
    >
      <div style={{ fontSize: "15px", opacity: 0.8 }}>Assistent</div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {Object.values(agents).map((agent) => {
          const active = selected === agent.id;

          return (
            <div
              key={agent.id}
              onClick={() => setSelected(agent.id)}
              style={{
                padding: "16px",
                borderRadius: "12px",
                cursor: "pointer",
                background: active
                  ? "rgba(0,140,200,0.4)"
                  : "rgba(255,255,255,0.07)",
                boxShadow: active
                  ? "0 0 12px rgba(0,140,200,0.4)"
                  : "none",
                border: active ? "1px solid #00aaff" : "1px solid transparent",
                transition: "0.15s",
              }}
            >
              <div style={{ fontSize: "18px", marginBottom: 4 }}>
                {agent.icon} {agent.name}
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
