"use client";

import { AgentId } from "../config/agents";

export default function AgentSidebar({
  currentAgentId,
  onSelectAgent,
}: {
  currentAgentId: AgentId;
  onSelectAgent: (id: AgentId) => void;
}) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: "rgba(255,255,255,0.03)",
        borderRadius: 16,
        padding: 16,
        color: "white",
        display: "flex",
        flexDirection: "column",
        gap: 20,
      }}
    >
      {/* Overskrift ændret */}
      <h3
        style={{
          fontSize: "1rem",
          fontWeight: 600,
          margin: 0,
          opacity: 0.9,
        }}
      >
        Assistenter
      </h3>

      {/* Dine eksisterende agent‐cards */}
      {/** … resten af componenten bevares præcis som før **/}
    </div>
  );
}
