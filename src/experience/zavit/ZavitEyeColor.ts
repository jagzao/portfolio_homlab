export type ZavitState = 'idle' | 'noticing' | 'greeting'

/** Eye color communicates state without relying on color alone elsewhere — paired with the greeting text/UI. */
export function eyeColorForState(state: ZavitState): string {
  switch (state) {
    case 'idle':
      return '#4caf7d' // green: active/working, per ART_DIRECTION's green = nature/active
    case 'noticing':
      return '#c9a24b' // gold: attention/transition
    case 'greeting':
      return '#e8e6df' // white: information, ready to speak
  }
}
