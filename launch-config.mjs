// Public example inputs and interface labels. Simulation runs on the service.
export const ARCHETYPES = Object.freeze({
  visual: { name: 'Visual creator', label: 'Aesthetic & creative visual creators', role: 'Make the finished result worth stopping for.', content: 'Visual concept, campaign kit, moodboard to final output', source: 'Illustrative creator role' },
  workflow: { name: 'Workflow educator', label: 'Workflow educators & creative process experts', role: 'Make the result understandable and repeatable.', content: 'Idea-to-output breakdown, tool comparison, recreation tutorial', source: 'Illustrative creator role' },
  business: { name: 'Scenario creator', label: 'Personal IP / scenario creators', role: 'Show a real job the audience needs to finish.', content: 'Product launch visuals, small-business makeover, ecommerce kit', source: 'Illustrative creator role' },
  brand: { name: 'Brand account', label: 'Owned product account', role: 'State the launch clearly and answer product questions.', content: 'Launch post, product thread and direct trial link', source: 'Illustrative creator role' },
  specialist: { name: 'Industry creator', label: 'AI / design / developer specialist', role: 'Add a creator perspective and a specific use case.', content: 'Native demo, contextual quote post or concise thread', source: 'Illustrative creator role' },
});

export const PRESETS = [
  { id: 'capcut', title: 'Launch a whole creative workflow', product: 'CapCut', description: 'One product photo. Five launch assets. Three kinds of creator.', prompt: 'Launch CapCut Design Studio in the United States with $50k over 7 days on Instagram and X. Compare a workflow-led creator mix with a hero-led reveal. Optimize for signups.' },
  { id: 'trae', title: 'Make the product build itself', product: 'TRAE', description: 'Developer walkthroughs versus a polished product reveal.', prompt: 'Launch TRAE SOLO in the United States with $35k over 7 days on Instagram and X. Show developers going from a brief to a working product. Optimize for trials with a workflow-led approach.' },
  { id: 'manus', title: 'Rehearse a creator-led launch', product: 'Manus', description: 'Explore an RPN concept post and the rest of the launch mix.', prompt: 'Rehearse a Manus launch with RPN in the United States, $40k over 7 days on Instagram and X. Show one task becoming a finished deliverable. Optimize for signups.' },
  { id: 'custom', title: 'Try your own launch', product: 'Your product', description: 'Describe the audience, budget, channels and desired outcome.', prompt: 'Launch my product in the United States with $25k over 7 days on Instagram and X. Compare a visual reveal with a practical walkthrough. Optimize for signups.' },
];

export function defaultCampaign(product = 'CapCut') {
  return { product, goal: 'signups', budget: 50000, currency: 'USD', days: 7, market: 'United States', platforms: ['instagram','x'], strategy: 'proof', creatorMix: 'mixed', ctr: .012, cvr: .08, competition: .25, seed: 20261014, creators: [], postOverrides: {} };
}

