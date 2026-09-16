import { test, expect } from '@playwright/test';

test('overview renders and task completion persists', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Good morning, Avery.' })).toBeVisible();
  const task = page.getByRole('button', { name: /^Mark .* complete$/ }).first();
  const label = await task.getAttribute('aria-label');
  await task.click();
  await page.reload();
  await expect(
    page.getByRole('button', { name: label!.replace(/ complete$/, ' incomplete') }),
  ).toHaveAttribute('aria-pressed', 'true');
});
test('inbox bulk-read updates navigation and survives refresh', async ({ page }) => {
  await page.goto('/notifications');
  await page.getByRole('button', { name: 'Mark all as read' }).click();
  await expect(page.getByRole('button', { name: 'Mark all as read' })).toBeDisabled();
  await page.reload();
  await expect(page.getByRole('link', { name: 'Inbox, 0 unread' })).toBeVisible();
  await page.getByRole('button', { name: 'Unread (0)', exact: true }).click();
  await expect(page.getByRole('heading', { name: "You're all caught up" })).toBeVisible();
});
test('project search, empty state and creation', async ({ page }) => {
  await page.goto('/projects');
  await page.getByRole('textbox', { name: 'Filter projects' }).fill('no such project');
  await expect(page.getByRole('heading', { name: 'No projects found' })).toBeVisible();
  await page.getByRole('button', { name: '+ New project', exact: true }).click();
  await page.getByLabel('Project name', { exact: true }).fill('Customer onboarding');
  await page.getByLabel('Description', { exact: true }).fill('A thoughtful first-run experience.');
  await page.getByRole('button', { name: 'Create project', exact: true }).click();
  await expect(
    page.getByRole('heading', { name: 'Customer onboarding', exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole('heading', { name: 'Customer onboarding', exact: true }),
  ).toBeVisible();
});
test('preferences update greeting and theme across reload', async ({ page }) => {
  await page.goto('/settings');
  await page.getByLabel('Display name', { exact: true }).fill('Taylor Reed');
  await page.getByLabel('Appearance', { exact: true }).selectOption('dark');
  await page.getByRole('button', { name: 'Save changes' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Good morning, Taylor.' })).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
});
test('corrupt persisted data falls back safely', async ({ page }) => {
  await page.addInitScript(() =>
    localStorage.setItem('titan.workspace.v1', '{"version":1,"projects":"broken"}'),
  );
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Good morning, Avery.' })).toBeVisible();
});
test('mobile navigation and no horizontal overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Open navigation' }).click();
  await page
    .getByRole('navigation', { name: 'Workspace' })
    .getByRole('link', { name: 'Projects', exact: true })
    .click();
  await expect(page.getByRole('heading', { name: 'Projects', exact: true })).toBeVisible();
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
  ).toBeTruthy();
});
test('no uncaught errors on any route', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  for (const route of ['/', '/projects', '/notifications', '/settings']) {
    await page.goto(route);
    await expect(page.locator('h1')).toBeVisible();
  }
  expect(errors).toEqual([]);
});
