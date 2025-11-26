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
        overflow: "hidden",
      }}
    >
      {/* Overskrift */}
      <div
        style={{
          color: "#ffffff",
          fontSize: 18,
          fontWeight: 600,
          marginBottom: 16,
        }}
      >
        Assistenter
      </div>

      {/* Liste med assistenter */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          paddingRight: 4,
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        {Object.values(AGENTS).map((agent: AgentConfig) => {
          const isActive = agent.id === active;

          return (
            <div
              key={agent.id}
              onClick={() => setActive(agent.id)}
              style={{
                padding: 14,
                borderRadius: 10,
                backgroundColor: isActive
                  ? "rgba(0, 130, 185, 0.7)"
                  : "rgba(255,255,255,0.06)",
                cursor: "pointer",
                transition: "background-color 0.15s ease, transform 0.1s ease",
                display: "flex",
                flexDirection: "row",
                gap: 10,
                alignItems: "flex-start",
                boxShadow: isActive
                  ? "0 0 10px rgba(0, 130, 185, 0.7)"
                  : "0 0 6px rgba(0,0,0,0.4)",
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
