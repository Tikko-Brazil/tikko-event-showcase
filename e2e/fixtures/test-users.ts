const runId = (process.env.GITHUB_RUN_ID || `local-${Date.now()}`).replace(/[^a-zA-Z0-9-]/g, '-');
const configuredEmail = process.env.SMOKE_TEST_USER_EMAIL;

export const TEST_USER = {
  email: configuredEmail || `smoke-test+${runId}@tikko.com.br`,
  password: process.env.SMOKE_TEST_USER_PASSWORD || '',
  fullName: `Smoke Test ${runId}`,
  phone: process.env.SMOKE_TEST_USER_PHONE || '+5511999999999',
  identification: process.env.SMOKE_TEST_USER_IDENTIFICATION || '12345678909',
  birthdate: process.env.SMOKE_TEST_USER_BIRTHDATE || '01/01/1990',
};

export const requireTestUserCredentials = () => {
  if (!TEST_USER.password) {
    throw new Error('SMOKE_TEST_USER_PASSWORD must be configured for smoke tests');
  }
  return TEST_USER;
};
