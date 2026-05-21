export type AgentLanguage = 'fr' | 'it' | 'en';

export type AgentTone = 'expert' | 'direct' | 'premium' | 'friendly';

export const AGENT_LANGUAGES: AgentLanguage[] = ['fr', 'it', 'en'];
export const AGENT_TONES: AgentTone[] = ['expert', 'direct', 'premium', 'friendly'];

export interface OfferAgentInput {
  activity: string;
  audience?: string;
  goal?: string;
  tone?: AgentTone;
  language: AgentLanguage;
}

export interface OfferAgentOutput {
  valueProposition: string;
  targetAudience: string;
  offerAngle: string;
  landingStructure: string[];
  callToAction: string;
  nextStep: string;
}

export interface AuditAgentInput {
  subject: string;
  audience?: string;
  objective?: string;
  language: AgentLanguage;
}

export interface AuditAgentOutput {
  clarityScore: number;
  trustScore: number;
  conversionRisk: 'low' | 'medium' | 'high';
  frictionPoints: string[];
  priorityFixes: string[];
  cncsSuggestion: string;
}

export interface AutomationAgentInput {
  workflow: string;
  tools?: string;
  desiredResult?: string;
  language: AgentLanguage;
}

export interface AutomationAgentOutput {
  input: string;
  logic: string;
  steps: string[];
  integrations: string[];
  output: string;
  roadmap: string[];
}

export interface AgentEnvelope<T> {
  agent: 'offer' | 'audit' | 'automation';
  mode: 'live' | 'demo';
  language: AgentLanguage;
  result: T;
}
