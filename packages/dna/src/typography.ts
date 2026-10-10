export interface TypographyPairing {
  id: string;
  name: string;
  description: string;
  displayFont: string;
  headingFont: string;
  bodyFont: string;
  monoFont: string;
  scaleRatio: number; // e.g. 1.2, 1.25, 1.333
  headingLetterSpacing: string;
  bodyLineHeight: number;
}

export const TYPOGRAPHY_PAIRINGS: TypographyPairing[] = [
  // 1. Geist System (Canonical default)
  {
    id: 'geist-system',
    name: 'Geist System',
    description: 'Precision engineering aesthetic using self-hosted Geist Sans and Geist Mono.',
    displayFont: '"Geist", Inter, system-ui, sans-serif',
    headingFont: '"Geist", Inter, system-ui, sans-serif',
    bodyFont: '"Geist", Inter, system-ui, sans-serif',
    monoFont: '"Geist Mono", "SFMono-Regular", Consolas, monospace',
    scaleRatio: 1.25,
    headingLetterSpacing: '-0.03em',
    bodyLineHeight: 1.55,
  },

  // 2. Editorial Serif + Geist
  {
    id: 'editorial-serif-geist',
    name: 'Editorial Serif + Geist',
    description: 'Literary serif headlines paired with crisp neutral Geist body text.',
    displayFont: '"Newsreader", "Charter", "Georgia", serif',
    headingFont: '"Newsreader", "Charter", "Georgia", serif',
    bodyFont: '"Geist", Inter, system-ui, sans-serif',
    monoFont: '"Geist Mono", monospace',
    scaleRatio: 1.333,
    headingLetterSpacing: '-0.02em',
    bodyLineHeight: 1.6,
  },

  // 3. Display Grotesk + Geist
  {
    id: 'display-grotesk-geist',
    name: 'Display Grotesk + Geist',
    description: 'Punchy geometric grotesk headlines over clean neutral UI body.',
    displayFont: '"Space Grotesk", "Geist", system-ui, sans-serif',
    headingFont: '"Space Grotesk", "Geist", system-ui, sans-serif',
    bodyFont: '"Geist", Inter, system-ui, sans-serif',
    monoFont: '"Geist Mono", monospace',
    scaleRatio: 1.333,
    headingLetterSpacing: '-0.035em',
    bodyLineHeight: 1.5,
  },

  // 4. Technical Mono + Geist
  {
    id: 'technical-mono-geist',
    name: 'Technical Mono + Geist',
    description: 'Monospace data headers, code-like badges, and high-readability sans body.',
    displayFont: '"Geist Mono", "JetBrains Mono", monospace',
    headingFont: '"Geist Mono", "JetBrains Mono", monospace',
    bodyFont: '"Geist", Inter, system-ui, sans-serif',
    monoFont: '"Geist Mono", monospace',
    scaleRatio: 1.2,
    headingLetterSpacing: '-0.02em',
    bodyLineHeight: 1.55,
  },

  // 5. Luxury Serif + Neutral Sans
  {
    id: 'luxury-serif-neutral-sans',
    name: 'Luxury Serif + Neutral Sans',
    description: 'High-contrast modern serif display evoking European high fashion and architecture.',
    displayFont: '"Playfair Display", "Didot", "Bodoni MT", serif',
    headingFont: '"Playfair Display", "Didot", serif',
    bodyFont: '"Geist", "Helvetica Neue", Arial, sans-serif',
    monoFont: '"Geist Mono", monospace',
    scaleRatio: 1.414,
    headingLetterSpacing: '-0.015em',
    bodyLineHeight: 1.65,
  },

  // 6. Condensed Display + Sans
  {
    id: 'condensed-display-sans',
    name: 'Condensed Display + Sans',
    description: 'Tight impactful condensed headlines for high-density editorial storytelling.',
    displayFont: '"Oswald", "Impact", "Arial Narrow", sans-serif',
    headingFont: '"Oswald", "Arial Narrow", sans-serif',
    bodyFont: '"Geist", Inter, sans-serif',
    monoFont: '"Geist Mono", monospace',
    scaleRatio: 1.333,
    headingLetterSpacing: '-0.01em',
    bodyLineHeight: 1.5,
  },

  // 7. Humanist Sans Pair
  {
    id: 'humanist-sans-pair',
    name: 'Humanist Sans Pair',
    description: 'Warm open apertures, friendly cadence, and effortless reading flow.',
    displayFont: '"Open Sans", "Segoe UI", sans-serif',
    headingFont: '"Open Sans", "Segoe UI", sans-serif',
    bodyFont: '"Open Sans", "Segoe UI", sans-serif',
    monoFont: '"Geist Mono", monospace',
    scaleRatio: 1.25,
    headingLetterSpacing: '-0.015em',
    bodyLineHeight: 1.6,
  },

  // 8. Geometric Sans Pair
  {
    id: 'geometric-sans-pair',
    name: 'Geometric Sans Pair',
    description: 'Circular Bauhaus geometry with modern tech energy.',
    displayFont: '"Poppins", "Avenir", "Century Gothic", sans-serif',
    headingFont: '"Poppins", "Avenir", sans-serif',
    bodyFont: '"Inter", "Geist", sans-serif',
    monoFont: '"Geist Mono", monospace',
    scaleRatio: 1.28,
    headingLetterSpacing: '-0.025em',
    bodyLineHeight: 1.55,
  },

  // 9. Scientific Sans + Mono
  {
    id: 'scientific-sans-mono',
    name: 'Scientific Sans + Mono',
    description: 'Unambiguous character distinctions and tabular numbers for complex charts.',
    displayFont: '"Inter", "Geist", system-ui, sans-serif',
    headingFont: '"Inter", "Geist", system-ui, sans-serif',
    bodyFont: '"Inter", "Geist", system-ui, sans-serif',
    monoFont: '"Fira Code", "Geist Mono", monospace',
    scaleRatio: 1.2,
    headingLetterSpacing: '-0.02em',
    bodyLineHeight: 1.5,
  },

  // 10. Financial Sans + Tabular Mono
  {
    id: 'financial-sans-tabular-mono',
    name: 'Financial Sans + Tabular Mono',
    description: 'Sober financial headlines paired with rigidly aligned tabular figures.',
    displayFont: '"Geist", Inter, sans-serif',
    headingFont: '"Geist", Inter, sans-serif',
    bodyFont: '"Geist", Inter, sans-serif',
    monoFont: '"Geist Mono", "Roboto Mono", monospace',
    scaleRatio: 1.2,
    headingLetterSpacing: '-0.025em',
    bodyLineHeight: 1.45,
  },

  // 11. Playful Rounded + Sans
  {
    id: 'playful-rounded-sans',
    name: 'Playful Rounded + Sans',
    description: 'Soft rounded terminals bringing warmth and delight to consumer flows.',
    displayFont: '"Quicksand", "Nunito", system-ui, sans-serif',
    headingFont: '"Quicksand", "Nunito", system-ui, sans-serif',
    bodyFont: '"Nunito", "Geist", system-ui, sans-serif',
    monoFont: '"Geist Mono", monospace',
    scaleRatio: 1.25,
    headingLetterSpacing: '-0.01em',
    bodyLineHeight: 1.55,
  },

  // 12. Fashion Display + Serif
  {
    id: 'fashion-display-serif',
    name: 'Fashion Display + Serif',
    description: 'Dramatic contrast editorial serif designed for magazine covers and lookbooks.',
    displayFont: '"Prata", "Didot", "Bodoni MT", serif',
    headingFont: '"Prata", "Didot", serif',
    bodyFont: '"Cormorant Garamond", "Georgia", serif',
    monoFont: '"Geist Mono", monospace',
    scaleRatio: 1.414,
    headingLetterSpacing: '-0.01em',
    bodyLineHeight: 1.65,
  },

  // 13. Brutalist Grotesk + Mono
  {
    id: 'brutalist-grotesk-mono',
    name: 'Brutalist Grotesk + Mono',
    description: 'Heavy architectural grotesque headings with raw monospace body text.',
    displayFont: '"Arial Black", "Impact", "Trebuchet MS", sans-serif',
    headingFont: '"Arial Black", "Trebuchet MS", sans-serif',
    bodyFont: '"Courier New", "Geist Mono", monospace',
    monoFont: '"Geist Mono", monospace',
    scaleRatio: 1.333,
    headingLetterSpacing: '0.02em',
    bodyLineHeight: 1.5,
  },

  // 14. Warm Serif + Humanist
  {
    id: 'warm-serif-humanist',
    name: 'Warm Serif + Humanist',
    description: 'Gentle bookish serifs with humanized humanist body typography.',
    displayFont: '"Lora", "Baskerville", serif',
    headingFont: '"Lora", "Baskerville", serif',
    bodyFont: '"Open Sans", "Segoe UI", sans-serif',
    monoFont: '"Geist Mono", monospace',
    scaleRatio: 1.25,
    headingLetterSpacing: '-0.015em',
    bodyLineHeight: 1.6,
  },

  // 15. Minimal Neo-Grotesk
  {
    id: 'minimal-neo-grotesk',
    name: 'Minimal Neo-Grotesk',
    description: 'Swiss style perfectionism: neutral, unadorned, and timelessly legible.',
    displayFont: '"Geist", "Helvetica Neue", Arial, sans-serif',
    headingFont: '"Geist", "Helvetica Neue", Arial, sans-serif',
    bodyFont: '"Geist", "Helvetica Neue", Arial, sans-serif',
    monoFont: '"Geist Mono", monospace',
    scaleRatio: 1.22,
    headingLetterSpacing: '-0.03em',
    bodyLineHeight: 1.55,
  },

  // 16. Variable Display + Neutral Sans
  {
    id: 'variable-display-neutral-sans',
    name: 'Variable Display + Neutral Sans',
    description: 'Extreme weight variations on hover and scroll with rock-solid neutral reading body.',
    displayFont: '"Geist", "Inter", sans-serif',
    headingFont: '"Geist", "Inter", sans-serif',
    bodyFont: '"Geist", Inter, sans-serif',
    monoFont: '"Geist Mono", monospace',
    scaleRatio: 1.333,
    headingLetterSpacing: '-0.035em',
    bodyLineHeight: 1.55,
  },
];

const PAIRINGS_BY_ID = new Map<string, TypographyPairing>(
  TYPOGRAPHY_PAIRINGS.map((p) => [p.id, p])
);

/**
 * Retrieves a typography pairing by its identifier.
 */
export function getTypographyPairing(id: string): TypographyPairing | undefined {
  return PAIRINGS_BY_ID.get(id);
}

/**
 * Retrieves all registered typography pairings.
 */
export function getAllTypographyPairings(): readonly TypographyPairing[] {
  return TYPOGRAPHY_PAIRINGS;
}
