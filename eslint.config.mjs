// ESLint flat config (ESLint 9 / Next 16).
//
// Next 16 removed the `next lint` command, so we invoke ESLint directly
// (`npm run lint` → `eslint .`). This restores the ruleset the project
// used previously via `next lint`'s zero-config default:
// `eslint-config-next/core-web-vitals`, which is shipped as a flat config
// by eslint-config-next@16.
//
// See: https://nextjs.org/docs/app/api-reference/config/eslint
import coreWebVitals from "eslint-config-next/core-web-vitals";

// ESLint flat config scopes plugins PER config object: a rules-only object
// cannot reference `react/*`, `react-hooks/*`, `@next/next/*` or `import/*`
// unless those plugins are declared in the SAME object. Re-export the exact
// plugin instances registered by eslint-config-next so our severity-override
// object below can address their rules. (Merging every plugin map keeps this
// resilient to eslint-config-next reshuffling which object owns which plugin.)
const nextPlugins = Object.assign(
  {},
  ...coreWebVitals.map((c) => c.plugins).filter(Boolean),
);

export default [
  // Global ignores — build output, deps, generated files, migrations.
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "dist/**",
      "build/**",
      "coverage/**",
      "out/**",
      "next-env.d.ts",
      "prisma/migrations/**",
      "**/*.config.js",
      "public/**",
    ],
  },
  ...coreWebVitals,

  // Severity calibration to the project's historical baseline.
  //
  // The Next 16 / eslint-config-next 16 upgrade pulled in a much newer
  // eslint-plugin-react-hooks whose React-Compiler-era rules never ran
  // under the project's previous Next 14 tooling. Surfacing ~200 brand-new
  // violations as build-breaking errors would block CI on debt that was
  // never enforced. We downgrade those (and the cosmetic unescaped-entities
  // rule) to warnings so they're visible but non-blocking, while KEEPING the
  // genuinely important correctness rules as errors. Burn the warnings down
  // over time; do not add new ones.
  {
    plugins: nextPlugins,
    rules: {
      // Cosmetic: unescaped ' / " in JSX text.
      "react/no-unescaped-entities": "warn",
      // React-Compiler-era rules — new in this tooling, never enforced before.
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/purity": "warn",
      "react-hooks/preserve-manual-memoization": "warn",
      "react-hooks/error-boundaries": "warn",
      "react-hooks/static-components": "warn",
      "react-hooks/immutability": "warn",
      "react-hooks/exhaustive-deps": "warn",
      // Pre-existing, low-risk.
      "@next/next/no-img-element": "warn",
      "import/no-anonymous-default-export": "warn",
      // Kept as ERROR (real correctness): react-hooks/rules-of-hooks,
      // @next/next/no-assign-module-variable, @next/next/no-html-link-for-pages.
    },
  },
];
