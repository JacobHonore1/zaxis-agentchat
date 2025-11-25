"use client";

import AgentSidebar from "../components/AgentSidebar";
import KnowledgeSidebar from "../components/KnowledgeSidebar";
import ChatPane from "../components/ChatPane";

export default function Page() {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        background: "linear-gradient(135deg, #002233, #003b4d)",
        overflow: "hidden",
        fontFamily: "Inter, sans-serif",
      }}
    >
      {/* Top Bar */}
      <div
        style={{
          padding: "20px 40px 10px 40px",
          fontSize: "24px",
          fontWeight: 600,
          color: "#fff",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexShrink: 0,
        }}
      >
        Virtuo Assistent MVP 0.13a

        <button
          style={{
            padding: "8px 18px",
            backgroundColor: "#005f8a",
            color: "#fff",
            borderRadius: "8px",
            border: "none",
            cursor: "pointer",
          }}
        >
          Reset chat
        </button>
      </div>

      {/* Main Layout */}
      <div
        style={{
          flex: 1,
          display: "flex",
          gap: "32px",
          padding: "0 40px 40px 40px",
          overflow: "hidden",
          alignItems: "stretch",
        }}
      >
        {/* Assistenter Sidebar */}
        <div
          style={{
            width: "300px",
            flexShrink: 0,
            height: "100%",
            position: "relative",
            zIndex: 3,
          }}
        >
          <AgentSidebar />
        </div>

        {/* Chat */}
        <div
          style={{
            flex: 1,
            minWidth: 0, // stopper overflow i flexbox
            height: "100%",
            borderRadius: "14px",
            background: "rgba(0,0,0,0.22)",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            position: "relative",
            zIndex: 2,
          }}
        >
          <ChatPane />
        </div>

        {/* Vidensbank */}
        <div
          style={{
            width: "340px",
            flexShrink: 0,
            height: "100%",
            paddingBottom: "6px", // luft i bunden
            paddingLeft: "8px", // luft til venstre
            boxSizing: "border-box",
            position: "relative",
            zIndex: 2,
          }}
        >
          <KnowledgeSidebar />
        </div>
      </div>
    </div>
  );
}
