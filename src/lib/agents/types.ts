import { Language } from '../../i18n/translations';

export type AgentKind = 'offer' | 'audit' | 'automation';

export type AgentTone = 'expert' | 'direct' | 'premium' | 'friendly';

export interface OfferAgentInput {
  activity: string;
  audience?: string;
  goal?: string;
  tone?: AgentTone;
  language: Language;
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
  language: Language;
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
  language: Language;
}

export interface AutomationAgentOutput {
  input: string;
  logic: string;
  steps: string[];
  integrations: string[];
  output: string;
  roadmap: string[];
}

export type AgentOutputByKind = {
  offer: OfferAgentOutput;
  audit: AuditAgentOutput;
  automation: AutomationAgentOutput;
};

export type AgentInputByKind = {
  offer: OfferAgentInput;
  audit: AuditAgentInput;
  automation: AutomationAgentInput;
};

export interface AgentEnvelope<K extends AgentKind> {
  agent: K;
  mode: 'live' | 'demo';
  language: Language;
  result: AgentOutputByKind[K];
}

export interface AgentErrorPayload {
  code: string;
  message: string;
}
