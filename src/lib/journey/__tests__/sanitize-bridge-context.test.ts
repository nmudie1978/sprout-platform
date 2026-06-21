import { describe, it, expect } from 'vitest';
import { sanitizeBridgeContext } from '../sanitize-bridge-context';

describe('sanitizeBridgeContext', () => {
  it('keeps valid fields', () => {
    expect(
      sanitizeBridgeContext({
        previousOccupation: '  Interior designer  ',
        withNav: true,
        triedRoutes: ['course', 'applications'],
        blocker: 'no-callbacks',
      }),
    ).toEqual({
      previousOccupation: 'Interior designer',
      withNav: true,
      triedRoutes: ['course', 'applications'],
      blocker: 'no-callbacks',
    });
  });

  it('drops unknown tried routes + de-dupes into catalogue order', () => {
    expect(
      sanitizeBridgeContext({ triedRoutes: ['applications', 'bogus', 'course', 'course'] }).triedRoutes,
    ).toEqual(['course', 'applications']);
  });

  it('rejects an invalid blocker and non-boolean withNav', () => {
    const out = sanitizeBridgeContext({ blocker: 'vibes', withNav: 'yes' });
    expect(out.blocker).toBeUndefined();
    expect(out.withNav).toBeUndefined();
  });

  it('caps occupation length and omits empty', () => {
    expect(sanitizeBridgeContext({ previousOccupation: '   ' }).previousOccupation).toBeUndefined();
    expect(sanitizeBridgeContext({ previousOccupation: 'x'.repeat(200) }).previousOccupation).toHaveLength(80);
  });

  it('returns empty object for empty body', () => {
    expect(sanitizeBridgeContext({})).toEqual({});
  });
});
