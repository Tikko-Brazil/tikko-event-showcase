const runId = (process.env.GITHUB_RUN_ID || `local-${Date.now()}`).replace(/[^a-zA-Z0-9-]/g, '-');
const configuredEmail = process.env.SMOKE_TEST_USER_EMAIL;
const uniqueConfiguredEmail = configuredEmail
  ? (() => {
      const [localPart, domain] = configuredEmail.split('@');
      return `${localPart}+smoke-${runId}@${domain}`;
    })()
  : undefined;

/**
 * The registered account behind `SMOKE_TEST_USER_EMAIL` — the standard test
 * user, and the only address in the suite that has a password.
 *
 * Every buyer below is a `+smoke-<run id>` alias of it, created by the checkout
 * with no password at all, so `TEST_USER.email` can never log in. Anything that
 * needs a session (the cleanup in `afterAll`) authenticates as this account.
 */
export const TEST_ACCOUNT = {
  email: configuredEmail || '',
  password: process.env.SMOKE_TEST_USER_PASSWORD || '',
};

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

// Every address a run hands out, so `afterAll` can clean all of them. An
// address that is issued but not remembered is one the cleanup cannot know
// about, and it stays in production forever — which is what TC-01 did while it
// derived its buyers with `uniqueTestEmail` and cleaned only the base address.
const issuedEmails = new Set<string>();

// A participation is unique per (user, event), so two checkouts against the
// same event — the two TC-01 cases, or TC-01 racing the TC-04 job inside the
// same workflow run — need distinct users. Only the email has to vary; the
// CPF is reused across runs today without conflict.
export const uniqueTestEmail = (suffix: string) => {
  const safeSuffix = suffix.replace(/[^a-zA-Z0-9-]/g, '-').slice(0, 40);
  const [localPart, domain] = TEST_USER.email.split('@');
  const email = `${localPart}-${safeSuffix}@${domain}`;
  issuedEmails.add(email);
  return email;
};

// A checkout that goes through leaves an invite the backend refuses to create
// twice, so a Playwright retry of a test that already paid would fail with a
// duplicate instead of reproducing the original problem. Vary the address per
// attempt.
export const smokeEmail = (prefix: string, attempt = 0) =>
  uniqueTestEmail(attempt > 0 ? `${prefix}-retry${attempt}` : prefix);

export const issuedSmokeEmails = () => [...issuedEmails];

const cpfCheckDigit = (digits: number[]) => {
  const firstWeight = digits.length + 1;
  const sum = digits.reduce((total, digit, index) => total + digit * (firstWeight - index), 0);
  const rest = (sum * 10) % 11;
  return rest >= 10 ? 0 : rest;
};

/**
 * A distinct, valid CPF per buyer.
 *
 * Every smoke checkout used to send the same document, and a run makes a dozen
 * card payments in a few minutes — same card, same payer, same amount. Mercado
 * Pago starts refusing those as duplicates, and the refusal lands on whichever
 * case runs last (the backend answers 500 and the invite never gets a payment
 * intent). Deriving the document from the e-mail makes each buyer a different
 * payer, and keeps it reproducible for a given run.
 */
export const smokeIdentification = (seed: string) => {
  let hash = 0;
  for (const character of seed) hash = (hash * 31 + character.charCodeAt(0)) % 1_000_000_007;
  const base = String(hash).padStart(9, '0').slice(-9).split('').map(Number);
  const first = cpfCheckDigit(base);
  return [...base, first, cpfCheckDigit([...base, first])].join('');
};

export const requireTestUserCredentials = () => {
  if (!TEST_ACCOUNT.email || !TEST_ACCOUNT.password) {
    throw new Error(
      'SMOKE_TEST_USER_EMAIL and SMOKE_TEST_USER_PASSWORD must be configured for smoke tests',
    );
  }
  return TEST_ACCOUNT;
};
