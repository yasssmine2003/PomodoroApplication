export const quotes = [
  "Focus on what matters. Let go of the rest.",
  "One focused session at a time.",
  "You're closer than you think.",
  "Small progress is still progress.",
  "You showed up. That's what matters.",
  "Deep work is a superpower.",
  "Your future self is watching.",
  "Every session builds the person you're becoming.",
  "Clarity comes from action, not thought.",
  "Start before you feel ready.",
  "The best time to focus is right now.",
  "Progress is the product of showing up.",
  "Quiet the noise. Begin.",
  "The work is the reward.",
  "Consistency beats intensity every time.",
  "Rest is part of the work.",
  "Your attention is your most valuable asset.",
  "One task. Full presence.",
  "Momentum is built one session at a time.",
  "You don't need motivation — you need to start.",
  "The session in front of you is the only one that matters.",
  "Done is better than perfect. But done well is best.",
]

export function getRandomQuote(custom: string[] = []): string {
  const all = [...quotes, ...custom]
  return all[Math.floor(Math.random() * all.length)]
}
