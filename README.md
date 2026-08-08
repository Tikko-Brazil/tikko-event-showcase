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

The manual `Playwright smoke tests` workflow runs `e2e/tc04-coupon.spec.ts` (TC-04 and TC-04b). It uses the `SMOKE_TEST_BASE_URL` secret when available, or starts Vite on `http://127.0.0.1:4173`; provide a different `frontend_url` to override it.

Configure these GitHub Actions repository variables or secrets before dispatching it (the workflow accepts either):

- `SMOKE_TEST_API_BASE_URL`
- `SMOKE_TEST_EVENT_SLUG`, `SMOKE_TEST_EVENT_ID`, `SMOKE_TEST_TICKET_PRICING_ID`
- `SMOKE_TEST_MANUAL_APPROVAL_EVENT_SLUG`, `SMOKE_TEST_MANUAL_APPROVAL_EVENT_ID`, `SMOKE_TEST_MANUAL_APPROVAL_TICKET_PRICING_ID`
- `SMOKE_TEST_COUPON_CODE`, `SMOKE_TEST_CLEANUP_URL`
- `SMOKE_TEST_USER_EMAIL`, `SMOKE_TEST_USER_PHONE`, `SMOKE_TEST_USER_IDENTIFICATION`, `SMOKE_TEST_USER_BIRTHDATE`

`SMOKE_TEST_USER_PASSWORD` must be a repository secret. Event slugs and IDs are configuration values, not source-controlled test data. Failed runs upload the Playwright report, traces, screenshots, videos, test results, and the captured smoke log for 14 days.

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/dd0bccfd-ccd1-4744-8cda-f492efcf48d1) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
