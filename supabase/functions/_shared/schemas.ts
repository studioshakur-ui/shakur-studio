export const offerSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['valueProposition', 'targetAudience', 'offerAngle', 'landingStructure', 'callToAction', 'nextStep'],
  properties: {
    valueProposition: { type: 'string', minLength: 10, maxLength: 240 },
    targetAudience: { type: 'string', minLength: 10, maxLength: 240 },
    offerAngle: { type: 'string', minLength: 10, maxLength: 240 },
    landingStructure: {
      type: 'array',
      minItems: 4,
      maxItems: 6,
      items: { type: 'string', minLength: 10, maxLength: 160 }
    },
    callToAction: { type: 'string', minLength: 4, maxLength: 120 },
    nextStep: { type: 'string', minLength: 10, maxLength: 240 }
  }
} as const;

export const auditSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['clarityScore', 'trustScore', 'conversionRisk', 'frictionPoints', 'priorityFixes', 'cncsSuggestion'],
  properties: {
    clarityScore: { type: 'integer', minimum: 0, maximum: 100 },
    trustScore: { type: 'integer', minimum: 0, maximum: 100 },
    conversionRisk: { type: 'string', enum: ['low', 'medium', 'high'] },
    frictionPoints: {
      type: 'array',
      minItems: 2,
      maxItems: 5,
      items: { type: 'string', minLength: 10, maxLength: 200 }
    },
    priorityFixes: {
      type: 'array',
      minItems: 2,
      maxItems: 5,
      items: { type: 'string', minLength: 10, maxLength: 200 }
    },
    cncsSuggestion: { type: 'string', minLength: 10, maxLength: 240 }
  }
} as const;

export const automationSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['input', 'logic', 'steps', 'integrations', 'output', 'roadmap'],
  properties: {
    input: { type: 'string', minLength: 10, maxLength: 240 },
    logic: { type: 'string', minLength: 10, maxLength: 240 },
    steps: {
      type: 'array',
      minItems: 3,
      maxItems: 6,
      items: { type: 'string', minLength: 10, maxLength: 200 }
    },
    integrations: {
      type: 'array',
      minItems: 2,
      maxItems: 6,
      items: { type: 'string', minLength: 2, maxLength: 80 }
    },
    output: { type: 'string', minLength: 10, maxLength: 240 },
    roadmap: {
      type: 'array',
      minItems: 3,
      maxItems: 5,
      items: { type: 'string', minLength: 10, maxLength: 200 }
    }
  }
} as const;
