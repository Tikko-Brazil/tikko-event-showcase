import { apiBaseUrl } from './helpers/auth';

/**
 * Configuration that the whole suite depends on is checked once, before any
 * browser starts.
 *
 * The API origin used to be resolved lazily, and the only callers that needed
 * it early enough to notice a missing value were in `afterAll`. A run therefore
 * spent nine minutes paying for real before reporting a missing environment
 * variable as `ECONNREFUSED` on four unrelated specs. Resolving it here fails
 * the run in seconds, with the name of the variable to set.
 */
export default function globalSetup() {
  const baseUrl = apiBaseUrl();
  console.log(`[smoke] API base URL: ${baseUrl}`);
  console.log(
    `[smoke] cleanup: ${process.env.SMOKE_TEST_CLEANUP_URL ? 'enabled' : 'disabled (records will be left behind)'}`,
  );
}
