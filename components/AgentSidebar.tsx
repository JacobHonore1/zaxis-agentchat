"use client";

import { useState } from "react";
import { AGENTS, AgentConfig } from "../data/agents";

export default function AgentSidebar() {
  const [activeAgent, setActiveAgent] = useState<string>("linkedin");

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: "rgba(0,0,0,0.18)",
        borderRadius: "12px",
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        color: "white",
      }}
    >
      {/* Header */}
      <div
        style={{
          marginBottom: "16px",
          fontSize: "18px",
          fontWeight: 600,
          color: "white",
        }}
      >
        Assistenter
      </div>

      {/* Scrollable list */}
      <div
        style={{
          overflowY: "auto",
          paddingRight: "6px",
          display: "flex",
          flexDirection: "column",
          gap: "14px",
        }}
      >
        {Object.values(AGENTS).map((agent: AgentConfig) => {
          const isActive = agent.id === activeAgent;

          return (
            <div
              key={agent.id}
              onClick={() => setActiveAgent(agent.id)}
              style={{
                background: isActive
                  ? "rgba(0,120,160,0.45)"
                  : "rgba(255,255,255,0.06)",
                border: isActive
                  ? "1px solid #00aaff"
                  : "1px solid transparent",
                borderRadius: "10px",
                padding: "14px",
                cursor: "pointer",
                display: "flex",
                gap: "12px",
                transition: "0.2s",
              }}
            >
              {/* Icon */}
              <div
                style={{
                  fontSize: "22px",
                  width: "28px",
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                {agent.icon}
              </div>

              {/* Tekst */}
              <div style={{ display: "flex", flexDirection: "column" }}>
                <strong style={{ marginBottom: "4px" }}>{agent.name}</strong>
                <span style={{ opacity: 0.6, fontSize: "13px" }}>
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
