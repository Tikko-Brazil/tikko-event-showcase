# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/dd0bccfd-ccd1-4744-8cda-f492efcf48d1

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/dd0bccfd-ccd1-4744-8cda-f492efcf48d1) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## Playwright smoke workflow

The suite is split in two, because most cases that *pay* are not *about* paying:

| suite | cases | who waits for it |
| --- | --- | --- |
| `gate` | TC-04 coupon, TC-06 accept, TC-07 reject, TC-08 refund, TC-09 management errors | the tikko-backend deploy and the Vercel production deploy — this is the deploy gate |
| `mercado_pago` | TC-01 credit card, TC-02 Pix, TC-05 card failures | nobody. Daily schedule, alert only |

The gate runs against an organization on the **fake payment provider**
(`organization.payment_provider = 'fake'`, see `SECURITY.md` in tikko-backend):
TC-06, TC-07 and TC-08 only need a paid participant to exist, and buying it
through the Mercado Pago sandbox is what used to make the gate as reliable as
that sandbox was on the day (TIK-34). No payment call leaves the backend for
these events; the browser still tokenizes at Mercado Pago, which is the one
piece of that dependency the split does not remove.

The `mercado_pago` suite keeps the real integration covered — it just stopped
deciding whether a deploy ships. It runs from `smoke-tests-mercado-pago.yml`
(daily at 06:30 America/Sao_Paulo, or by hand) and pays for real against the
sandbox account.

Both are the same workflow, selected with the `suite` input
(`gate` | `mercado_pago` | `all`); `gate` is the default. A spec added later
joins the gate automatically — only TC-01, TC-02 and TC-05 are listed as
Mercado Pago cases.

It uses the `SMOKE_TEST_BASE_URL` secret when available, or starts Vite on `http://127.0.0.1:4173`; provide a different `frontend_url` to override it.

Configure these GitHub Actions repository variables or secrets before dispatching it (the workflow accepts either):

- `SMOKE_TEST_API_BASE_URL`
- `SMOKE_TEST_EVENT_SLUG`, `SMOKE_TEST_EVENT_ID`, `SMOKE_TEST_TICKET_PRICING_ID`
- `SMOKE_TEST_MANUAL_APPROVAL_EVENT_SLUG`, `SMOKE_TEST_MANUAL_APPROVAL_EVENT_ID`, `SMOKE_TEST_MANUAL_APPROVAL_TICKET_PRICING_ID`
- `SMOKE_TEST_COUPON_CODE`, `SMOKE_TEST_CLEANUP_URL`
- `SMOKE_TEST_USER_EMAIL`, `SMOKE_TEST_USER_PHONE`, `SMOKE_TEST_USER_IDENTIFICATION`, `SMOKE_TEST_USER_BIRTHDATE`

The `mercado_pago` suite needs its own event fixtures, from a second test
organization that still has `payment_provider = 'mercado_pago'`. They have no
fallback on purpose: with these unset the cases are reported as skipped, rather
than quietly running against the fake provider and reporting Mercado Pago
coverage that no longer exists.

- `SMOKE_TEST_MP_EVENT_SLUG`, `SMOKE_TEST_MP_EVENT_ID`, `SMOKE_TEST_MP_TICKET_PRICING_ID`
- `SMOKE_TEST_MP_MANUAL_APPROVAL_EVENT_SLUG`, `SMOKE_TEST_MP_MANUAL_APPROVAL_EVENT_ID`, `SMOKE_TEST_MP_MANUAL_APPROVAL_TICKET_PRICING_ID`
- `SMOKE_TEST_MP_COUPON_CODE` (optional; falls back to `SMOKE_TEST_COUPON_CODE`)

`SMOKE_TEST_USER_PASSWORD` and `SMOKE_TEST_ADMIN_PASSWORD` must be repository secrets. Event slugs and IDs are configuration values, not source-controlled test data. Failed runs upload the Playwright report, traces, screenshots, videos, test results, and the captured smoke log for 14 days.

### Mercado Pago test cards

Card numbers are never committed. Mercado Pago decides the sandbox outcome from the **cardholder name**, so a single card covers every status code (`APRO`, `OTHE`, `CONT`, `CALL`, `FUND`, `SECU`, `EXPI`, `FORM`): `SMOKE_TEST_MP_APPROVED_NUMBER` / `_SECURITY_CODE`, with `SMOKE_TEST_MP_CARD_EXPIRATION_MONTH` / `_YEAR`.

The brand matrix needs one card per brand, from the private Mercado Pago fixture, as repository secrets:

- `SMOKE_TEST_MP_MASTERCARD_NUMBER` / `_SECURITY_CODE`
- `SMOKE_TEST_MP_VISA_NUMBER` / `_SECURITY_CODE`
- `SMOKE_TEST_MP_AMEX_NUMBER` / `_SECURITY_CODE`
- `SMOKE_TEST_MP_ELO_DEBIT_NUMBER` / `_SECURITY_CODE`

A brand with no secret is reported as skipped (with the missing variable named) rather than silently passing.

The same cardholder-name convention drives the fake provider on the gate events. The backend never sees what is inside a card token, so for a **test organization** the checkout sends the cardholder name on as `payment.simulated_outcome`, and an organization on `payment_provider = 'fake'` reads its result from it — `APRO`, `CONT`, `FUND`, and so on, exactly as the sandbox would. A real organization ignores the field server-side, and the checkout does not send it for one.

### Cleanup

`SMOKE_TEST_CLEANUP_URL` points at `POST /private/smoke-test/cleanup` on the backend, which removes the tickets, participations, invites and user row a run created for one address, and gives back the coupon uses it consumed. `afterAll` calls it once per e-mail the run issued. While the URL is unset, cleanup is a logged no-op and every run leaves records in production — which is why each case derives a unique e-mail from `GITHUB_RUN_ID`.

The endpoint is authenticated, not secret-guarded: the suite logs in as the standard test user (`SMOKE_TEST_USER_EMAIL` / `SMOKE_TEST_USER_PASSWORD` — the account every `+smoke-<run id>` buyer is an alias of, and the only one in the suite with a password) and sends that bearer token. **That account must have `user.role = 1` (ADMIN)**: the backend re-reads the role from the database on every request and answers 403 to anyone who is not an admin, so the token by itself grants nothing. It also answers 401 without a session, and refuses the call anyway for any event outside an `is_test` organization and for any address that is not a smoke address. There is no `SMOKE_TEST_CLEANUP_TOKEN` any more; if it is still set on either side, it is unused and can be deleted.

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/dd0bccfd-ccd1-4744-8cda-f492efcf48d1) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
