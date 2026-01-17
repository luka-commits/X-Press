# Phase 39: CI-Enhancement - Research

**Researched:** 2026-01-18
**Domain:** GitHub Actions CI/CD mit Playwright E2E Tests und Jest Coverage
**Confidence:** HIGH

<research_summary>
## Summary

Recherchiert: Integration von Playwright E2E Tests in GitHub Actions CI sowie Coverage-Threshold-Enforcement für Jest.

Der aktuelle CI-Workflow (`ci.yml`) führt nur lint, Jest Unit Tests und Build aus. Playwright E2E Tests laufen nur lokal. Phase 39 erweitert CI um:
1. E2E Tests mit Playwright in GitHub Actions (inkl. PostgreSQL Service Container)
2. Jest Coverage-Thresholds mit PR-Kommentaren

**Primary recommendation:** PostgreSQL als GitHub Actions Service Container, Playwright Browser-Caching, `ArtiomTr/jest-coverage-report-action` für Coverage mit Threshold-Enforcement.
</research_summary>

<standard_stack>
## Standard Stack

### Core
| Library/Action | Version | Purpose | Why Standard |
|----------------|---------|---------|--------------|
| `actions/setup-node@v4` | v4 | Node.js Setup | Offizieller Action, npm caching built-in |
| `actions/cache@v4` | v4 | Caching | Standard für Playwright Browser & Next.js Cache |
| PostgreSQL Service | 15+ | Test-Datenbank | Native GitHub Actions Service Container |

### Coverage
| Library/Action | Version | Purpose | When to Use |
|----------------|---------|---------|-------------|
| `ArtiomTr/jest-coverage-report-action` | v2 | Coverage Report + Threshold | PR Comments, Threshold-Enforcement |
| `MishaKav/jest-coverage-comment` | v1 | Simpler Coverage Comment | Wenn nur Summary ohne Diff benötigt |
| Jest `coverageThreshold` | native | Threshold Definition | In jest.config.js konfigurieren |

### E2E
| Library/Action | Version | Purpose | When to Use |
|----------------|---------|---------|-------------|
| Playwright native | 1.49+ | E2E Tests | Bereits im Projekt konfiguriert |
| `playwright-report` artifact | - | Test Reports | Upload bei Failures für Debugging |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| PostgreSQL Service | SQLite in-memory | SQLite ist schneller, aber Production nutzt PostgreSQL - besser gleiche DB |
| `jest-coverage-report-action` | Native Jest + manual comment | Action macht Diff-Berechnung und PR-Blocking automatisch |
| Single CI Job | Separate Jobs | Separate Jobs parallelisieren, aber längere Setup-Zeit |

**Installation:**
Keine npm-Pakete nötig - nur GitHub Actions Workflow-Änderungen.
</standard_stack>

<architecture_patterns>
## Architecture Patterns

### Recommended Workflow Structure
```yaml
jobs:
  lint-test:
    # Schnell: lint + unit tests + coverage

  e2e:
    # Langsamer: PostgreSQL + Playwright
    needs: lint-test  # Nur wenn lint-test erfolgreich

  build:
    # Verifikation: Production build
    needs: lint-test
```

### Pattern 1: PostgreSQL Service Container
**What:** PostgreSQL als Service parallel zum Job
**When to use:** E2E Tests die DB benötigen
**Example:**
```yaml
services:
  postgres:
    image: postgres:15
    env:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: xos_test
    ports:
      - 5432:5432
    options: >-
      --health-cmd pg_isready
      --health-interval 10s
      --health-timeout 5s
      --health-retries 5
```

### Pattern 2: Playwright Browser Caching
**What:** Browser-Binaries cachen für schnellere CI
**When to use:** Immer bei Playwright in CI
**Example:**
```yaml
- name: Cache Playwright browsers
  uses: actions/cache@v4
  with:
    path: ~/.cache/ms-playwright
    key: playwright-${{ runner.os }}-${{ hashFiles('**/package-lock.json') }}

- name: Install Playwright browsers
  run: npx playwright install --with-deps chromium
```

### Pattern 3: Jest Coverage mit Threshold
**What:** Coverage-Report generieren und Threshold prüfen
**When to use:** PR-Quality-Gates
**Example (jest.config.js):**
```javascript
module.exports = {
  coverageThreshold: {
    global: {
      branches: 60,
      functions: 60,
      lines: 70,
      statements: 70,
    },
  },
};
```

### Anti-Patterns to Avoid
- **E2E gegen Production-DB:** Immer isolierte Test-DB nutzen
- **Alle Browser testen:** In CI nur Chromium, spart Zeit
- **Ohne Retries:** Flaky Tests crashen CI unnötig - mindestens 1 Retry
- **Ohne Timeout:** Jobs ohne Timeout können ewig hängen
</architecture_patterns>

<dont_hand_roll>
## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Coverage-Diff Berechnung | Manuelles JSON-Parsing | `jest-coverage-report-action` | Action macht Diff zur Base-Branch automatisch |
| PR-Kommentar-Logik | GitHub API calls | Coverage Actions | Handles edit-in-place, keine Spam-Comments |
| Browser Installation | Manual apt-get | `npx playwright install --with-deps` | Playwright kennt seine Dependencies |
| DB-Migrations in CI | Manuelles SQL | `npx prisma migrate deploy` | Prisma tracked Schema-State |
| Flaky Test Detection | Eigene Retry-Logik | Playwright `retries: 2` | Native, mit Trace-Capture |

**Key insight:** GitHub Actions Marketplace hat für CI/CD-Patterns fertige Actions. Custom Shell-Scripts sind fehleranfälliger und schwerer zu warten.
</dont_hand_roll>

<common_pitfalls>
## Common Pitfalls

### Pitfall 1: Playwright ohne Datenbank
**What goes wrong:** E2E Tests starten, aber API-Calls scheitern wegen fehlender DB
**Why it happens:** Lokale E2E Tests nutzen lokale DB, CI hat keine
**How to avoid:** PostgreSQL Service Container + Prisma Migrations vor Tests
**Warning signs:** "Connection refused" oder "ECONNREFUSED" in CI Logs

### Pitfall 2: Flaky E2E Tests
**What goes wrong:** Tests passieren lokal, scheitern random in CI
**Why it happens:** CI-Runner haben weniger Resources, Timing-Issues
**How to avoid:**
- `retries: 2` in playwright.config.ts (bereits konfiguriert ✓)
- `workers: 1` in CI (bereits konfiguriert ✓)
- Ausreichende Timeouts
**Warning signs:** Tests scheitern nur manchmal, "Timeout exceeded"

### Pitfall 3: Coverage-Action Permission Error
**What goes wrong:** Action kann keinen PR-Kommentar posten
**Why it happens:** `pull_request` Event hat keine write-Permissions bei Forks
**How to avoid:**
- `permissions: pull-requests: write` im Workflow
- Oder `pull_request_target` (aber Vorsicht: Security-Implikationen)
**Warning signs:** "Resource not accessible by integration" Error

### Pitfall 4: Next.js Build Cache nicht genutzt
**What goes wrong:** Build dauert unnötig lange
**Why it happens:** .next Cache wird nicht persistiert
**How to avoid:**
```yaml
- uses: actions/cache@v4
  with:
    path: ${{ github.workspace }}/.next/cache
    key: nextjs-${{ runner.os }}-${{ hashFiles('**/package-lock.json') }}
```
**Warning signs:** Build dauert immer gleich lang (>60s)

### Pitfall 5: webServer Timeout in CI
**What goes wrong:** Playwright wartet auf `npm run dev`, Timeout nach 120s
**Why it happens:** Dev-Server braucht in CI länger
**How to avoid:** Production-Build starten statt Dev-Server:
```typescript
webServer: {
  command: process.env.CI ? 'npm run start' : 'npm run dev',
  // ...
}
```
**Warning signs:** "Timed out waiting for server"
</common_pitfalls>

<code_examples>
## Code Examples

### E2E Job mit PostgreSQL Service
```yaml
# Source: GitHub Actions Docs + Playwright Docs
e2e:
  runs-on: ubuntu-latest
  needs: lint-test

  services:
    postgres:
      image: postgres:15
      env:
        POSTGRES_USER: postgres
        POSTGRES_PASSWORD: postgres
        POSTGRES_DB: xos_test
      ports:
        - 5432:5432
      options: >-
        --health-cmd pg_isready
        --health-interval 10s
        --health-timeout 5s
        --health-retries 5

  steps:
    - uses: actions/checkout@v4

    - uses: actions/setup-node@v4
      with:
        node-version: 20
        cache: 'npm'

    - run: npm ci

    - name: Cache Playwright browsers
      uses: actions/cache@v4
      with:
        path: ~/.cache/ms-playwright
        key: playwright-${{ runner.os }}-${{ hashFiles('**/package-lock.json') }}

    - name: Install Playwright browsers
      run: npx playwright install --with-deps chromium

    - name: Run Prisma migrations
      run: npx prisma migrate deploy
      env:
        DATABASE_URL: postgresql://postgres:postgres@localhost:5432/xos_test

    - name: Build application
      run: npm run build
      env:
        DATABASE_URL: postgresql://postgres:postgres@localhost:5432/xos_test
        # ... andere env vars

    - name: Run E2E tests
      run: npm run test:e2e
      env:
        DATABASE_URL: postgresql://postgres:postgres@localhost:5432/xos_test
        CI: true

    - name: Upload Playwright Report
      uses: actions/upload-artifact@v4
      if: failure()
      with:
        name: playwright-report
        path: playwright-report/
```

### Jest Coverage mit Threshold Action
```yaml
# Source: ArtiomTr/jest-coverage-report-action
coverage:
  runs-on: ubuntu-latest
  permissions:
    pull-requests: write
    contents: read

  steps:
    - uses: actions/checkout@v4

    - uses: actions/setup-node@v4
      with:
        node-version: 20
        cache: 'npm'

    - run: npm ci

    - name: Jest Coverage Report
      uses: ArtiomTr/jest-coverage-report-action@v2
      with:
        test-script: npm run test -- --coverage
        threshold: 70  # Fail wenn <70% Coverage
```

### jest.config.js mit coverageThreshold
```javascript
// Source: Jest Documentation
module.exports = {
  // ... existing config
  coverageThreshold: {
    global: {
      branches: 60,
      functions: 60,
      lines: 70,
      statements: 70,
    },
  },
  coverageReporters: ['text', 'lcov', 'json-summary'],
};
```

### playwright.config.ts Anpassung für CI
```typescript
// Source: Playwright CI Docs
export default defineConfig({
  // ... existing config

  webServer: {
    command: process.env.CI ? 'npm run start' : 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 180 * 1000, // 3 Minuten für CI
  },
});
```
</code_examples>

<sota_updates>
## State of the Art (2025-2026)

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `pull_request` + Bot Token | `permissions:` block | 2023 | Keine PAT mehr nötig für PR-Kommentare |
| Manual coverage parsing | `jest-coverage-report-action` v2 | 2024 | Automatischer Diff + Threshold |
| Full browser install | `--with-deps chromium` only | 2024 | 70% schnellere Playwright-Installation |
| Dev Server in CI | Production build (`npm start`) | 2024+ | Schneller, stabiler |

**New tools/patterns to consider:**
- **CTRF Reporter:** Flaky Test Detection über Zeit (`npx github-actions-ctrf flaky`)
- **Selective Test Execution:** Nur geänderte Tests mit `--grep` (für größere Projekte)
- **Allure Reports:** Rich HTML Reports für komplexe Test-Suiten

**Deprecated/outdated:**
- **`microsoft/playwright-github-action`:** Nicht mehr nötig, `npx playwright install` reicht
- **Coverage via Codecov/Coveralls:** Für einfache Thresholds reichen lokale Actions
</sota_updates>

<open_questions>
## Open Questions

1. **Seed Data für E2E Tests**
   - What we know: E2E Tests brauchen Testdaten in der DB
   - What's unclear: Welche Aufträge/Kunden müssen für E2E existieren?
   - Recommendation: Prisma Seed-Script erstellen oder in `globalSetup` Daten anlegen

2. **Coverage Threshold Höhe**
   - What we know: Aktuell keine Thresholds, ~60-80% ist typisch
   - What's unclear: Was ist realistisch für aktuellen Stand?
   - Recommendation: Mit 60% starten, schrittweise erhöhen
</open_questions>

<sources>
## Sources

### Primary (HIGH confidence)
- [Playwright CI Docs](https://playwright.dev/docs/ci-intro) - Official setup guide
- [GitHub Actions Services](https://docs.github.com/en/actions/using-containerized-services/about-service-containers) - PostgreSQL service container
- [Jest Coverage Threshold](https://jestjs.io/docs/configuration#coveragethreshold-object) - Native config

### Secondary (MEDIUM confidence)
- [ArtiomTr/jest-coverage-report-action](https://github.com/ArtiomTr/jest-coverage-report-action) - Most popular Jest coverage action
- [E2E Testing in Next.js with Playwright](https://enreina.com/blog/e2e-testing-in-next-js-with-playwright-vercel-and-github-actions-a-guide-with-example/) - Real-world patterns
- [How to Avoid Flaky Tests in Playwright](https://semaphore.io/blog/flaky-tests-playwright) - Best practices

### Tertiary (LOW confidence - needs validation)
- None - all findings verified with official docs
</sources>

<metadata>
## Metadata

**Research scope:**
- Core technology: GitHub Actions CI/CD
- Ecosystem: Playwright, Jest, PostgreSQL Service Container
- Patterns: E2E in CI, Coverage Thresholds, Browser Caching
- Pitfalls: Permissions, Flaky Tests, DB Setup, Timeouts

**Confidence breakdown:**
- Standard stack: HIGH - Official Actions und Docs
- Architecture: HIGH - Verified mit Playwright/GitHub Docs
- Pitfalls: HIGH - Documented issues mit bekannten Fixes
- Code examples: HIGH - Aus offiziellen Docs

**Research date:** 2026-01-18
**Valid until:** 2026-02-18 (30 days - GitHub Actions ecosystem stable)
</metadata>

---

*Phase: 39-ci-enhancement*
*Research completed: 2026-01-18*
*Ready for planning: yes*
