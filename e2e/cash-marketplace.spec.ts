import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { test, expect, request as createRequest, type APIRequestContext, type APIResponse } from '@playwright/test';

interface FixtureData {
  password: string;
  users: {
    seeker: { id: string; email: string };
    provider: { id: string; email: string };
    admin: { id: string; email: string };
  };
  categoryId: string;
  directServiceId: string;
  offerServiceId: string;
}

const backendDirectory = path.resolve(process.cwd(), '../SERVICEHUB-BACKEND');
const npmCli = process.env.npm_execpath;
let fixtures: FixtureData;
let seekerApi: APIRequestContext;
let providerApi: APIRequestContext;
let adminApi: APIRequestContext;

function runFixtures(...args: string[]) {
  if (!npmCli) throw new Error('npm_execpath is unavailable to the Playwright worker');
  return execFileSync(process.execPath, [npmCli, 'run', 'test:e2e-fixtures', '--', ...args], {
    cwd: backendDirectory,
    encoding: 'utf8',
    env: { ...process.env, NODE_ENV: 'test' },
  });
}

async function authenticatedApi(email: string, password: string) {
  const loginContext = await createRequest.newContext({ baseURL: 'http://localhost:3101/api/' });
  const response = await loginContext.post('auth/login', { data: { email, password } });
  expect(response.ok(), await response.text()).toBeTruthy();
  const body = await response.json();
  const accessToken = body.data?.accessToken ?? body.accessToken;
  expect(accessToken).toBeTruthy();
  await loginContext.dispose();
  return createRequest.newContext({
    baseURL: 'http://localhost:3101/api/',
    extraHTTPHeaders: { Authorization: `Bearer ${accessToken}` },
  });
}

async function expectOk(response: APIResponse) {
  expect(response.ok(), await response.text()).toBeTruthy();
  return response.json();
}

test.beforeAll(async () => {
  const output = runFixtures();
  const jsonLine = output.trim().split(/\r?\n/).findLast((line) => line.startsWith('{'));
  if (!jsonLine) throw new Error(`Fixture setup returned no JSON: ${output}`);
  fixtures = JSON.parse(jsonLine) as FixtureData;
  seekerApi = await authenticatedApi(fixtures.users.seeker.email, fixtures.password);
  providerApi = await authenticatedApi(fixtures.users.provider.email, fixtures.password);
  adminApi = await authenticatedApi(fixtures.users.admin.email, fixtures.password);
});

test.afterAll(async () => {
  await seekerApi?.dispose();
  await providerApi?.dispose();
  await adminApi?.dispose();
  runFixtures('cleanup');
});

test('password login reaches the seeker workspace without an authentication request loop', async ({ page }) => {
  const failedApiResponses: string[] = [];
  page.on('response', (response) => {
    if (response.url().includes(':3101/api/') && response.status() >= 400) {
      failedApiResponses.push(`${response.status()} ${new URL(response.url()).pathname}`);
    }
  });

  await page.goto('/login');
  await page.getByPlaceholder('Enter your email').fill(fixtures.users.seeker.email);
  await page.getByPlaceholder('Enter your password').fill(fixtures.password);
  await page.getByRole('button', { name: 'Sign In', exact: true }).click();
  await expect(page).toHaveURL(/\/seeker(?:\/|$)/);
  await expect(page.getByText('SEEKER WORKSPACE').first()).toBeVisible();
  expect(failedApiResponses).toEqual([]);
});

test('Flow A onsite cash completes end to end and remains outside the online queue', async () => {
  const direct = await expectOk(await seekerApi.post('bookings/direct', { data: {
    serviceId: fixtures.directServiceId,
    schedule: 'E2E proposal only',
    message: 'E2E direct cash request',
  } }));
  const accepted = await expectOk(await providerApi.patch(`bookings/direct/${direct.data.id}/respond`, { data: { accept: true } }));
  const bookingId = accepted.data.id as string;
  await expectOk(await providerApi.patch(`bookings/queue/${bookingId}/start`));
  await expectOk(await providerApi.patch(`bookings/queue/${bookingId}/complete`));
  const completed = await expectOk(await seekerApi.post(`bookings/${bookingId}/confirm`));
  expect(completed.data.paymentStatus).toBe('CASH_CONFIRMED');

  const engagements = await expectOk(await seekerApi.get('bookings/my-engagements'));
  const record = engagements.data.bookings.find((item: { id: string }) => item.id === bookingId);
  expect(record.status).toBe('COMPLETED');
  expect(record.queue).toBeFalsy();
});

test('Flow B exact-listing cash offer completes and closes its request', async () => {
  const serviceRequest = await expectOk(await seekerApi.post('requests', { data: {
    categoryId: fixtures.categoryId,
    title: 'E2E Flow B Request',
    description: 'A browser-runner request that needs an exact quoted listing.',
    budgetMin: 500,
    budgetMax: 900,
    urgency: 'medium',
  } }));
  const offer = await expectOk(await providerApi.post('offers', { data: {
    requestId: serviceRequest.data.id,
    serviceId: fixtures.offerServiceId,
    offeredPrice: 700,
    estimatedDuration: 60,
    message: 'E2E exact listing offer',
  } }));
  const booking = await expectOk(await seekerApi.post('bookings/direct-from-offer', { data: { offerId: offer.data.id } }));
  expect(Number(booking.data.agreedAmount)).toBe(700);
  expect(booking.data.paymentStatus).toBe('UNPAID');
  await expectOk(await providerApi.patch(`bookings/queue/${booking.data.id}/start`));
  await expectOk(await providerApi.patch(`bookings/queue/${booking.data.id}/complete`));
  await expectOk(await seekerApi.post(`bookings/${booking.data.id}/confirm`));
  const mine = await expectOk(await seekerApi.get('requests/mine'));
  expect(mine.data.find((item: { id: string }) => item.id === serviceRequest.data.id)?.status).toBe('CLOSED');
});

test('onsite cash supports immediate and bilateral cancellation without a transaction credit', async () => {
  const first = await expectOk(await seekerApi.post('bookings/direct', { data: { serviceId: fixtures.directServiceId } }));
  const firstBooking = await expectOk(await providerApi.patch(`bookings/direct/${first.data.id}/respond`, { data: { accept: true } }));
  const immediate = await expectOk(await seekerApi.post(`bookings/${firstBooking.data.id}/cancel`, { data: { reason: 'E2E before-start cancellation' } }));
  expect(immediate.data).toMatchObject({ cancelled: true, immediate: true });

  const second = await expectOk(await seekerApi.post('bookings/direct', { data: { serviceId: fixtures.directServiceId } }));
  const secondBooking = await expectOk(await providerApi.patch(`bookings/direct/${second.data.id}/respond`, { data: { accept: true } }));
  await expectOk(await providerApi.patch(`bookings/queue/${secondBooking.data.id}/start`));
  const requested = await expectOk(await seekerApi.post(`bookings/${secondBooking.data.id}/cancel`, { data: { reason: 'E2E after-start request' } }));
  const cancellationId = requested.data?.request?.id ?? requested.data?.id;
  expect(cancellationId).toBeTruthy();
  const resolved = await expectOk(await providerApi.patch(`bookings/cancellation-requests/${cancellationId}/respond`, { data: { approve: true, responderNote: 'E2E approved' } }));
  expect(resolved.data).toMatchObject({ resolved: true, approved: true });

  const engagements = await expectOk(await seekerApi.get('bookings/my-engagements'));
  for (const bookingId of [firstBooking.data.id, secondBooking.data.id]) {
    expect(engagements.data.bookings.find((item: { id: string }) => item.id === bookingId)?.status).toBe('CANCELED');
  }

  const transactions = await expectOk(await seekerApi.get('transactions'));
  expect(transactions.data.some((item: { relatedBookingId?: string }) =>
    [firstBooking.data.id, secondBooking.data.id].includes(item.relatedBookingId))).toBe(false);
});

test('completion escalation and dispute reach audited administrator resolution', async () => {
  const escalationDirect = await expectOk(await seekerApi.post('bookings/direct', { data: { serviceId: fixtures.directServiceId } }));
  const escalationBooking = await expectOk(await providerApi.patch(`bookings/direct/${escalationDirect.data.id}/respond`, { data: { accept: true } }));
  await expectOk(await providerApi.patch(`bookings/queue/${escalationBooking.data.id}/start`));
  await expectOk(await providerApi.patch(`bookings/queue/${escalationBooking.data.id}/complete`));
  runFixtures('age-completion', escalationBooking.data.id);
  const escalation = await expectOk(await providerApi.post(`bookings/${escalationBooking.data.id}/completion-escalations`, { data: { reason: 'E2E seeker response window elapsed' } }));
  await expectOk(await adminApi.patch(`admin/completion-escalations/${escalation.data.id}/resolve`, { data: {
    action: 'release_provider_and_complete', resolution: 'E2E evidence supports completion.',
  } }));

  const disputeDirect = await expectOk(await seekerApi.post('bookings/direct', { data: { serviceId: fixtures.directServiceId } }));
  const disputeBooking = await expectOk(await providerApi.patch(`bookings/direct/${disputeDirect.data.id}/respond`, { data: { accept: true } }));
  await expectOk(await providerApi.patch(`bookings/queue/${disputeBooking.data.id}/start`));
  await expectOk(await providerApi.patch(`bookings/queue/${disputeBooking.data.id}/complete`));
  const report = await expectOk(await seekerApi.post(`bookings/${disputeBooking.data.id}/dispute`, { data: {
    reason: 'INCOMPLETE_SERVICE', description: 'E2E dispute evidence narrative.',
  } }));
  await expectOk(await adminApi.patch(`admin/reports/${report.data.id}/resolve`, { data: {
    action: 'dismiss', adminNotes: 'E2E review found no further action was required.',
  } }));

  const audit = await expectOk(await adminApi.get('admin/audit-logs'));
  expect(audit.data.some((item: { resourceId?: string }) => item.resourceId === escalation.data.id)).toBe(true);
  expect(audit.data.some((item: { resourceId?: string }) => item.resourceId === report.data.id)).toBe(true);
});
