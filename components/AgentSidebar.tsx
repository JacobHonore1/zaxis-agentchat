"use client";

import { useState } from "react";
import { AGENTS, AgentConfig } from "../data/agents";

export default function AgentSidebar() {
  const [active, setActive] = useState<string>("linkedin");

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        padding: 20,
        overflowY: "auto", // kun scroll inde i panelet
      }}
    >
      <div
        style={{
          color: "#fff",
          fontSize: 16,
          marginBottom: 16,
          opacity: 0.9,
        }}
      >
        Assistenter
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {Object.values(AGENTS).map((agent: AgentConfig) => {
          const isActive = agent.id === active;

          return (
            <div
              key={agent.id}
              onClick={() => setActive(agent.id)}
              style={{
                padding: 14,
                borderRadius: 8,
                backgroundColor: isActive
                  ? "rgba(0, 130, 185, 0.6)"
                  : "rgba(255,255,255,0.06)",
                cursor: "pointer",
                transition: "0.15s",
                display: "flex",
                flexDirection: "row",
                gap: 10,
                alignItems: "flex-start",
              }}
            >
              <div style={{ fontSize: 22 }}>{agent.icon}</div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <strong style={{ color: "#fff", fontSize: 15 }}>
                  {agent.name}
                </strong>
                <span
                  style={{
                    color: "#c7d4dd",
                    fontSize: 13,
                    marginTop: 4,
                    opacity: 0.9,
                  }}
                >
                  {agent.description}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
