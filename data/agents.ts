export type AgentConfig = {
  id: string;
  name: string;
  description: string;
  icon: string;
};

export const AGENTS: Record<string, AgentConfig> = {
  linkedin: {
    id: "linkedin",
    name: "LinkedIn Skribent",
    description: "Skriver stærke LinkedIn opslag og optimerer tekst.",
    icon: "✏️",
  },

  business: {
    id: "business",
    name: "Business Agent",
    description: "Forretningsanalyse og rådgivning.",
    icon: "📊",
  },
};
