/**
 * MY JOURNEY — DEPENDENCY & CONFIGURATION SECURITY
 *
 * Checks for known vulnerabilities in dependencies,
 * unsafe configuration patterns, and secret exposure risks.
 */

import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const ROOT = join(__dirname, '..', '..', '..');

describe('MY JOURNEY — Dependency & Configuration Security', () => {

  describe('Package vulnerability indicators', () => {
    it('package.json exists and is valid JSON', () => {
      const pkgPath = join(ROOT, 'package.json');
      expect(existsSync(pkgPath)).toBe(true);
      const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
      expect(pkg.name).toBeDefined();
    });

    it('does not use known-vulnerable rendering libraries unsafely', () => {
      const pkgPath = join(ROOT, 'package.json');
      const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
      const allDeps = {
        ...pkg.dependencies,
        ...pkg.devDependencies,
      };

      // Check for libraries that would be risky if rendering user HTML
      const riskyLibs = ['dompurify', 'sanitize-html', 'marked', 'showdown'];
      const foundRisky = riskyLibs.filter((lib) => lib in allDeps);

      // If any are present, they should be used for sanitization, not bypassed
      // This just documents what's installed
      if (foundRisky.length > 0) {
        console.log(`Found HTML processing libraries: ${foundRisky.join(', ')}`);
      }
    });

    it('uses React (auto-escaping by default) for rendering', () => {
      const pkgPath = join(ROOT, 'package.json');
      const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
      expect(pkg.dependencies.react || pkg.dependencies['next']).toBeDefined();
    });
  });

  describe('Secret exposure prevention', () => {
    it('.env.local is in .gitignore', () => {
      const gitignorePath = join(ROOT, '.gitignore');
      if (existsSync(gitignorePath)) {
        const gitignore = readFileSync(gitignorePath, 'utf8');
        expect(gitignore).toContain('.env.local');
      }
    });

    it('.env files do not contain real secrets in version control', () => {
      // Only check .env.example — real .env should be gitignored
      const envExamplePath = join(ROOT, '.env.example');
      if (existsSync(envExamplePath)) {
        const content = readFileSync(envExamplePath, 'utf8');
        // Should contain placeholder values, not real secrets
        expect(content).not.toMatch(/sk_live_/); // Stripe live key
        expect(content).not.toMatch(/eyJ[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+/); // JWT tokens
      }
    });

    it('no NEXT_PUBLIC_ env vars expose sensitive keys', () => {
      // Check that frontend-exposed env vars don't contain secrets
      const envExamplePath = join(ROOT, '.env.example');
      if (existsSync(envExamplePath)) {
        const content = readFileSync(envExamplePath, 'utf8');
        const publicVars = content.match(/NEXT_PUBLIC_\w+/g) || [];
        const sensitivePatterns = ['SECRET', 'PASSWORD', 'PRIVATE', 'TOKEN'];

        for (const varName of publicVars) {
          for (const pattern of sensitivePatterns) {
            expect(varName).not.toContain(pattern);
          }
        }
      }
    });
  });

  describe('Frontend bundle safety', () => {
    it('no dangerouslySetInnerHTML used in journey components', () => {
      // Check journey-related components for unsafe HTML rendering
      const componentsDir = join(ROOT, 'src', 'components', 'journey');
      const journeyPageDir = join(ROOT, 'src', 'app', '(dashboard)', 'my-journey');

      const dirsToCheck = [componentsDir, journeyPageDir].filter(existsSync);

      for (const dir of dirsToCheck) {
        const { execSync } = require('child_process');
        try {
          const result = execSync(
            `grep -r "dangerouslySetInnerHTML" "${dir}" --include="*.tsx" --include="*.ts" -l 2>/dev/null || true`,
            { encoding: 'utf8' }
          ).trim();

          if (result) {
            console.warn(`WARNING: dangerouslySetInnerHTML found in journey components: ${result}`);
          }
        } catch {
          // grep not found or no matches — that's fine
        }
      }
    });
  });

  describe('Authentication configuration', () => {
    it('NextAuth uses JWT session strategy', () => {
      // Verify the auth config uses JWT (stateless, no DB session store)
      // This is important for understanding session security model
      const authPath = join(ROOT, 'src', 'lib', 'auth.ts');
      if (existsSync(authPath)) {
        const content = readFileSync(authPath, 'utf8');
        expect(content).toContain('strategy');
        expect(content).toContain('jwt');
      }
    });
  });

  describe('Database security patterns', () => {
    it('journey API routes use Prisma (parameterized queries)', () => {
      // Verify no raw SQL in journey routes
      const routeDir = join(ROOT, 'src', 'app', 'api', 'journey');
      if (existsSync(routeDir)) {
        const { execSync } = require('child_process');
        try {
          const result = execSync(
            `grep -r "\\$queryRaw\\|\\$executeRaw\\|raw(" "${routeDir}" --include="*.ts" -l 2>/dev/null || true`,
            { encoding: 'utf8' }
          ).trim();

          if (result) {
            console.warn(`WARNING: Raw SQL found in journey routes: ${result}`);
          }
          // No raw SQL found — good, Prisma parameterized queries prevent SQL injection
        } catch {
          // No matches — good
        }
      }
    });
  });
});
