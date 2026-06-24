import { describe, it, expect } from 'vitest';
import { buildDiscoverOpener } from '../discover-opener';

// Real sampled descriptions from the catalogue, used to lock behaviour.
const CONSTRUCTION_PM =
  'Run construction projects end-to-end — from planning and procurement to site coordination, safety, and handover. Work closely with architects, engineers, contractors and clients to bring buildings in on time, on budget, and compliant with Norwegian building regulations.';
const CONSTRUCTION_PM_FIRST =
  'Run construction projects end-to-end — from planning and procurement to site coordination, safety, and handover.';

const DATA_SCIENTIST =
  'Turn messy data into clear business answers — use statistics, ML, and storytelling to help organisations make evidence-based decisions.';

const CARPENTER = 'Build and repair wooden structures and frameworks for buildings.';

const POLICE =
  'Maintain public safety, enforce laws, investigate crimes, and assist communities across Norway. In Norway, police officers must complete a 3-year bachelor\'s degree at Politihøgskolen. Entry is highly competitive.';
const POLICE_FIRST =
  'Maintain public safety, enforce laws, investigate crimes, and assist communities across Norway.';

const TRADE_TRAITS = [
  'Practical, hands-on people who like seeing real results',
  'Those who enjoy physical work and problem-solving',
  'People who take pride in doing a job properly',
];

describe('buildDiscoverOpener', () => {
  it('leads with the job essence, then 2 traits, then growth (normal case)', () => {
    const out = buildDiscoverOpener({
      description: CONSTRUCTION_PM,
      whoThisIsGoodFor: TRADE_TRAITS,
      growthOutlook: 'high',
    });
    // essence is only the first sentence
    expect(out.startsWith(CONSTRUCTION_PM_FIRST)).toBe(true);
    // does NOT include the second sentence of the description
    expect(out).not.toContain('Work closely with architects');
    // character clause: embedded-"who" noun phrase kept verbatim (lc), subject-
    // relative "Those who …" kept verbatim, top 2 traits joined.
    expect(out).toContain('It suits practical, hands-on people who like seeing real results and those who enjoy physical work and problem-solving.');
    // growth suffix
    expect(out.endsWith('Demand is high and growing.')).toBe(true);
  });

  it('does not split on an em-dash (no false sentence break)', () => {
    const out = buildDiscoverOpener({
      description: DATA_SCIENTIST,
      whoThisIsGoodFor: [],
      growthOutlook: 'medium',
    });
    expect(out).toContain('Turn messy data into clear business answers — use statistics, ML, and storytelling to help organisations make evidence-based decisions.');
    expect(out.endsWith('The field is growing steadily.')).toBe(true);
  });

  it('uses the whole description when it is a single short sentence', () => {
    const out = buildDiscoverOpener({
      description: CARPENTER,
      whoThisIsGoodFor: [],
      growthOutlook: 'high',
    });
    expect(out).toBe('Build and repair wooden structures and frameworks for buildings. Demand is high and growing.');
  });

  it('uses only the first sentence of a multi-sentence description', () => {
    const out = buildDiscoverOpener({
      description: POLICE,
      whoThisIsGoodFor: [],
      growthOutlook: 'low',
    });
    expect(out.startsWith(POLICE_FIRST)).toBe(true);
    expect(out).not.toContain('Politihøgskolen');
    expect(out).not.toContain('highly competitive');
    expect(out.endsWith('This is a stable career.')).toBe(true);
  });

  it('falls back to legacy "This role suits…" phrasing when description is missing', () => {
    const out = buildDiscoverOpener({
      description: undefined,
      whoThisIsGoodFor: ['People who are calm under pressure', 'Those who are detail-oriented'],
      growthOutlook: 'high',
    });
    expect(out).toBe('This role suits people who are calm under pressure and those who are detail-oriented. Demand is high and growing.');
  });

  it('renders essence + growth only when there are no traits', () => {
    const out = buildDiscoverOpener({
      description: CARPENTER,
      whoThisIsGoodFor: null,
      growthOutlook: 'medium',
    });
    expect(out).toBe('Build and repair wooden structures and frameworks for buildings. The field is growing steadily.');
  });

  it('handles a single trait', () => {
    const out = buildDiscoverOpener({
      description: CARPENTER,
      whoThisIsGoodFor: ['People who are patient'],
      growthOutlook: 'high',
    });
    expect(out).toBe('Build and repair wooden structures and frameworks for buildings. It suits people who are patient. Demand is high and growing.');
  });

  it('turns a bare adjective/noun trait into a grammatical "people who are …" clause', () => {
    const out = buildDiscoverOpener({
      description: CARPENTER,
      whoThisIsGoodFor: ['Practical.'],
      growthOutlook: 'high',
    });
    expect(out).toContain('It suits people who are practical.');
  });

  it('rebuilds a verb-initial trait as a relative clause with the base verb', () => {
    // "Enjoys solving …" must not render as "It suits enjoys solving …".
    const out = buildDiscoverOpener({
      description: CARPENTER,
      whoThisIsGoodFor: ['Enjoys solving practical problems', 'Loves working with their hands'],
      growthOutlook: 'high',
    });
    expect(out).toContain('It suits people who enjoy solving practical problems and love working with their hands.');
  });

  it('keeps an embedded-"who" noun phrase verbatim (no double "people who")', () => {
    const out = buildDiscoverOpener({
      description: CARPENTER,
      whoThisIsGoodFor: ['Hands-on people who like building things'],
      growthOutlook: 'high',
    });
    expect(out).toContain('It suits hands-on people who like building things.');
  });

  it('keeps a noun phrase as "people who are …" rather than dangling', () => {
    const out = buildDiscoverOpener({
      description: CARPENTER,
      whoThisIsGoodFor: ['Visual thinkers', 'Good at working in teams'],
      growthOutlook: 'high',
    });
    expect(out).toContain('It suits people who are visual thinkers and good at working in teams.');
  });

  it('dedupes a shared "people who" subject across both traits', () => {
    const out = buildDiscoverOpener({
      description: CARPENTER,
      whoThisIsGoodFor: ['People who love precision', 'People who notice details others miss'],
      growthOutlook: 'high',
    });
    expect(out).toContain('It suits people who love precision and notice details others miss.');
    expect(out).not.toContain('and people who');
  });

  it('does NOT dedupe when the two subjects differ ("people who" vs "those who")', () => {
    const out = buildDiscoverOpener({
      description: CARPENTER,
      whoThisIsGoodFor: ['People who love precision', 'Those who stay calm under pressure'],
      growthOutlook: 'high',
    });
    expect(out).toContain('It suits people who love precision and those who stay calm under pressure.');
  });

  it('does not double the subject when a trait already has one', () => {
    // "Those comfortable …" (pronoun, no "who") and "… people" (head-noun) must
    // not become "people who are those …" / "people who are … people".
    const out = buildDiscoverOpener({
      description: CARPENTER,
      whoThisIsGoodFor: ['Those comfortable with physical work', 'Organised, methodical people'],
      growthOutlook: 'high',
    });
    expect(out).toContain('It suits those comfortable with physical work and organised, methodical people.');
    expect(out).not.toContain('people who are those');
    expect(out).not.toContain('people who are organised, methodical people');
  });

  it('adds a trailing period when the first sentence lacks one', () => {
    const out = buildDiscoverOpener({
      description: 'Build things that last',
      whoThisIsGoodFor: [],
      growthOutlook: 'high',
    });
    expect(out).toBe('Build things that last. Demand is high and growing.');
  });

  it('drops empty/whitespace traits before counting to two', () => {
    const out = buildDiscoverOpener({
      description: CARPENTER,
      whoThisIsGoodFor: ['   ', 'People who are precise', 'Those who are reliable', 'People who are calm'],
      growthOutlook: 'high',
    });
    // first entry is empty after cleaning → top 2 real traits used
    expect(out).toContain('It suits people who are precise and those who are reliable.');
    expect(out).not.toContain('calm');
  });

  it('returns growth only in the degenerate no-description no-traits case', () => {
    const out = buildDiscoverOpener({
      description: '',
      whoThisIsGoodFor: [],
      growthOutlook: 'medium',
    });
    expect(out).toBe('The field is growing steadily.');
  });
});
