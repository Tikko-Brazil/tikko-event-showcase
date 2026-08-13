import { test } from '@playwright/test';
import { missingEventConfiguration, type SmokeEventFixture } from '../fixtures/test-events';

type FixtureRequirement = {
  event: SmokeEventFixture;
  variables: { slug: string; id: string; ticketPricing: string };
};

/**
 * Guards a case that is *about* Mercado Pago (TC-01, TC-02, TC-05).
 *
 * These run against an organization that still charges through Mercado Pago,
 * configured on its own `SMOKE_TEST_MP_*` variables. The deploy gate's events
 * are on the fake payment provider, so falling back to them would leave the
 * case green while Mercado Pago went untouched — the failure this whole split
 * exists to avoid. With the variables unset the case is skipped and the gap is
 * printed, which the workflow turns into a warning.
 */
export function requireMercadoPagoFixtures(caseName: string, requirements: FixtureRequirement[]) {
  const missing = requirements.flatMap(({ event, variables }) =>
    missingEventConfiguration(event, variables),
  );

  if (missing.length) {
    // Printed unconditionally so the workflow log names the gap; a skipped test
    // alone reads like coverage.
    console.log(
      `[${caseName}] ${missing.join(', ')} are not configured, so the Mercado Pago payment path was not exercised`,
    );
  }

  test.skip(
    missing.length > 0,
    `${missing.join(', ')} are not configured, so ${caseName} was not exercised`,
  );
}
