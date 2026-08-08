const runId = (process.env.GITHUB_RUN_ID || `local-${Date.now()}`).replace(/[^a-zA-Z0-9-]/g, '-');
const configuredEmail = process.env.SMOKE_TEST_USER_EMAIL;
const uniqueConfiguredEmail = configuredEmail
  ? (() => {
      const [localPart, domain] = configuredEmail.split('@');
      return `${localPart}+smoke-${runId}@${domain}`;
    })()
  : undefined;

export const TEST_USER = {
  email: uniqueConfiguredEmail || `smoke-test+${runId}@tikko.com.br`,
  password: process.env.SMOKE_TEST_USER_PASSWORD || '',
  fullName: 'Smoke Test User',
  phone: process.env.SMOKE_TEST_USER_PHONE || '+55 (11) 99999-9999',
  identification: process.env.SMOKE_TEST_USER_IDENTIFICATION || '12345678909',
  birthdate: process.env.SMOKE_TEST_USER_BIRTHDATE || '01/01/1990',
  // Required by the checkout user-info step (Instagram *).
  instagram: process.env.SMOKE_TEST_USER_INSTAGRAM || 'smoke_test',
};

// A participation is unique per (user, event), so two checkouts against the
// same event — the two TC-01 cases, or TC-01 racing the TC-04 job inside the
// same workflow run — need distinct users. Only the email has to vary; the
// CPF is reused across runs today without conflict.
export const uniqueTestEmail = (suffix: string) => {
  const safeSuffix = suffix.replace(/[^a-zA-Z0-9-]/g, '-').slice(0, 40);
  const [localPart, domain] = TEST_USER.email.split('@');
  return `${localPart}-${safeSuffix}@${domain}`;
};

// A checkout that goes through leaves an invite the backend refuses to create
// twice, so a Playwright retry of a test that already paid would fail with a
// duplicate instead of reproducing the original problem. Vary the address per
// attempt, and remember every address so `afterAll` can clean all of them.
const issuedEmails = new Set<string>();

export const smokeEmail = (prefix: string, attempt = 0) => {
  const email = uniqueTestEmail(attempt > 0 ? `${prefix}-retry${attempt}` : prefix);
  issuedEmails.add(email);
  return email;
};

export const issuedSmokeEmails = () => [...issuedEmails];

export const requireTestUserCredentials = () => {
  if (!TEST_USER.password) {
    throw new Error('SMOKE_TEST_USER_PASSWORD must be configured for smoke tests');
  }
  return TEST_USER;
};
