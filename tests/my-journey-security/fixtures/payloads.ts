/**
 * Security Test Fixtures — Attack Payloads
 *
 * Malicious, malformed, and edge-case payloads for security testing.
 */

// ============================================
// XSS PAYLOADS
// ============================================

export const XSS_PAYLOADS = {
  scriptTag: '<script>alert("xss")</script>',
  imgOnError: '<img src=x onerror=alert("xss")>',
  svgOnload: '<svg onload=alert("xss")>',
  javascriptUrl: 'javascript:alert("xss")',
  dataUrl: 'data:text/html,<script>alert("xss")</script>',
  eventHandler: '" onmouseover="alert(\'xss\')" data-x="',
  iframeTag: '<iframe src="javascript:alert(\'xss\')"></iframe>',
  encodedScript: '&#60;script&#62;alert("xss")&#60;/script&#62;',
  templateLiteral: '${alert("xss")}',
  nestedScript: '<<script>script>alert("xss")<</script>/script>',
  nullByte: 'test\0<script>alert("xss")</script>',
  unicodeEscape: '\u003cscript\u003ealert("xss")\u003c/script\u003e',
  angularExpression: '{{constructor.constructor("alert(1)")()}}',
  vbscriptUrl: 'vbscript:alert("xss")',
};

export const XSS_PAYLOAD_LIST = Object.values(XSS_PAYLOADS);

// ============================================
// INJECTION PAYLOADS
// ============================================

export const INJECTION_PAYLOADS = {
  sqlInjection: "'; DROP TABLE users; --",
  noSqlInjection: '{"$gt": ""}',
  commandInjection: '; rm -rf /',
  pathTraversal: '../../../etc/passwd',
  ldapInjection: '*()|%26',
  xmlInjection: '<?xml version="1.0"?><!DOCTYPE foo [<!ENTITY xxe SYSTEM "file:///etc/passwd">]>',
};

// ============================================
// MALFORMED PAYLOADS
// ============================================

export const MALFORMED_PAYLOADS = {
  emptyObject: {},
  emptyArray: [],
  nullValue: null,
  undefinedString: 'undefined',
  booleanString: 'true',
  numericString: '12345',
  negativeNumber: -1,
  float: 3.14159,
  infinity: Infinity,
  nan: NaN,
  emptyString: '',
  whitespace: '   ',
  veryLongString: 'A'.repeat(100_000),
  deeplyNested: createDeeplyNested(50),
  circularRefSafe: { a: { b: { c: 'deep' } } },
};

function createDeeplyNested(depth: number): unknown {
  let obj: Record<string, unknown> = { value: 'bottom' };
  for (let i = 0; i < depth; i++) {
    obj = { nested: obj };
  }
  return obj;
}

// ============================================
// OVERSIZED PAYLOADS
// ============================================

export const OVERSIZED_PAYLOADS = {
  /** 1MB string field */
  megabyteString: 'X'.repeat(1_000_000),
  /** Array with 10,000 items */
  hugeArray: Array.from({ length: 10_000 }, (_, i) => `item-${i}`),
  /** Object with 1,000 keys */
  manyKeys: Object.fromEntries(
    Array.from({ length: 1_000 }, (_, i) => [`key_${i}`, `value_${i}`])
  ),
};

// ============================================
// UNICODE / SPECIAL CHARACTER PAYLOADS
// ============================================

export const UNICODE_PAYLOADS = {
  rtlOverride: '\u202Ereversed text\u202C',
  zeroWidthJoiner: 'test\u200Dtext',
  zeroWidthSpace: 'test\u200Btext',
  homoglyph: '\u0410lice', // Cyrillic А instead of Latin A
  emojiOverflow: '🎉'.repeat(10_000),
  controlCharacters: 'test\x00\x01\x02\x03text',
  nullBytes: 'test\x00injected',
  bom: '\uFEFFcontent',
};

// ============================================
// JOURNEY-SPECIFIC ATTACK PAYLOADS
// ============================================

export const FORGED_JOURNEY_PAYLOADS = {
  /** Attempt to jump directly to ACT stage */
  skipToAct: {
    action: 'transition',
    targetState: 'COMPLETE_ALIGNED_ACTION',
  },
  /** Forge progress to 100% */
  forgedProgress: {
    stepId: 'REFLECT_ON_STRENGTHS',
    data: {
      type: 'REFLECT_ON_STRENGTHS',
      topStrengths: ['a', 'b', 'c'],
      demonstratedSkills: ['d'],
      overallProgress: 100,
      lenses: {
        discover: { progress: 100, isComplete: true },
        understand: { progress: 100, isComplete: true },
        act: { progress: 100, isComplete: true },
      },
    },
  },
  /** Try to complete a locked step */
  completeLocked: {
    stepId: 'CREATE_ACTION_PLAN',
    data: {
      type: 'CREATE_ACTION_PLAN',
      plan: {
        roleTitle: 'Doctor',
        shortTermActions: ['a', 'b'],
        midTermMilestone: 'c',
        skillToBuild: 'd',
        createdAt: new Date().toISOString(),
      },
    },
  },
  /** Attempt to set an invalid journey state */
  invalidState: {
    action: 'transition',
    targetState: 'ADMIN_OVERRIDE_COMPLETE',
  },
  /** Attempt to skip a mandatory step */
  skipMandatory: {
    stepId: 'REFLECT_ON_STRENGTHS',
    reason: 'I want to skip this mandatory step',
  },
  /** Submit with wrong data type for step */
  wrongDataType: {
    stepId: 'REFLECT_ON_STRENGTHS',
    data: {
      type: 'EXPLORE_CAREERS',
      selectedCareers: ['Doctor'],
    },
  },
  /** Supply extra fields attempting mass assignment */
  massAssignment: {
    stepId: 'REFLECT_ON_STRENGTHS',
    data: {
      type: 'REFLECT_ON_STRENGTHS',
      topStrengths: ['a', 'b', 'c'],
      demonstratedSkills: ['d'],
    },
    userId: 'attacker-user-id',
    role: 'ADMIN',
    journeyState: 'EXTERNAL_FEEDBACK',
    journeyCompletedSteps: [
      'REFLECT_ON_STRENGTHS', 'EXPLORE_CAREERS', 'ROLE_DEEP_DIVE',
      'REVIEW_INDUSTRY_OUTLOOK', 'CAREER_SHADOW', 'CREATE_ACTION_PLAN',
      'COMPLETE_ALIGNED_ACTION', 'SUBMIT_ACTION_REFLECTION',
    ],
  },
  /** Goal data with forged journey state */
  forgedGoalData: {
    goalId: 'doctor',
    goalTitle: 'Doctor',
    journeyState: 'EXTERNAL_FEEDBACK',
    journeyCompletedSteps: [
      'REFLECT_ON_STRENGTHS', 'EXPLORE_CAREERS', 'ROLE_DEEP_DIVE',
      'REVIEW_INDUSTRY_OUTLOOK', 'CAREER_SHADOW', 'CREATE_ACTION_PLAN',
      'COMPLETE_ALIGNED_ACTION', 'SUBMIT_ACTION_REFLECTION',
      'UPDATE_PLAN', 'EXTERNAL_FEEDBACK',
    ],
    journeySummary: {
      strengths: ['forged'],
      overallProgress: 100,
    },
  },
  /** Attempt to use another user's goal ID */
  crossUserGoal: {
    goalId: 'stolen-goal-id',
    goalTitle: 'Stolen Career',
    journeyState: 'REFLECT_ON_STRENGTHS',
    journeyCompletedSteps: [],
  },
};

// ============================================
// URL ATTACK PAYLOADS
// ============================================

export const MALICIOUS_URLS = {
  javascript: 'javascript:alert(document.cookie)',
  data: 'data:text/html,<script>alert(1)</script>',
  vbscript: 'vbscript:MsgBox("XSS")',
  fileProtocol: 'file:///etc/passwd',
  ftpProtocol: 'ftp://evil.com/payload',
  protocolRelative: '//evil.com/steal',
  encodedJavascript: 'java\tscript:alert(1)',
  nullByteUrl: 'javascript\x00:alert(1)',
  validHttp: 'https://legitimate-article.com/career-tips',
  validHttpNoS: 'http://article.com/tips',
};
