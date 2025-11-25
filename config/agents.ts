export type AgentId = "linkedin" | "business";

export type AgentConfig = {
  id: AgentId;
  name: string;
  description: string;
  icon: string;
  systemPrompt: string;
};

export const agents: Record<AgentId, AgentConfig> = {
  linkedin: {
    id: "linkedin",
    name: "LinkedIn Skribent",
    description: "Skriver stærke LinkedIn opslag og optimerer tekst.",
    icon: "✏️",
    systemPrompt:
      "Du er en ekspert i at skrive stærke LinkedIn opslag på dansk. Du hjælper brugeren med at skrive professionelle, men menneskelige opslag, der passer til dansk erhvervskultur.",
  },
  business: {
    id: "business",
    name: "Business Agent",
    description: "Forretningsanalyse og rådgivning.",
    icon: "📊",
    systemPrompt:
      "Du er en dansk business konsulent. Du hjælper med strategi, forretningsudvikling, analyser og praktiske anbefalinger til små og mellemstore virksomheder.",
  },
};

export const defaultAgentId: AgentId = "linkedin";
