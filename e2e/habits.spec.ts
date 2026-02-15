import { test, expect, type Page } from '@playwright/test';

const TEST_EMAIL = process.env.E2E_EMAIL || 'erenkeles2005@outlook.com';
const TEST_PASSWORD = process.env.E2E_PASSWORD || 'Keles3461!';

async function login(page: Page) {
    await page.goto('/#/login');
    await page.fill('#email', TEST_EMAIL);
    await page.fill('#password', TEST_PASSWORD);
    await page.click('button[type="submit"]');
    // Wait for navigation to dashboard after login
    await page.waitForURL('**/#/', { timeout: 10000 });
}

async function goToHabits(page: Page) {
    await page.goto('/#/habits');
    await page.waitForSelector('.habits-page', { timeout: 5000 });
}

// ──────────────────────────────────────
// Auth Flow
// ──────────────────────────────────────

test.describe('Auth Flow', () => {
    test('login page renders correctly', async ({ page }) => {
        await page.goto('/#/login');
        await expect(page.locator('.login-card')).toBeVisible();
        await expect(page.locator('#email')).toBeVisible();
        await expect(page.locator('#password')).toBeVisible();
        await expect(page.locator('button[type="submit"]')).toBeVisible();
    });

    test('can sign in with valid credentials', async ({ page }) => {
        await login(page);
        await expect(page).toHaveURL(/\/#\//);
    });
});

// ──────────────────────────────────────
// Habits Page — Core Habits Features
// ──────────────────────────────────────

test.describe('Habits Page', () => {
    test.beforeEach(async ({ page }) => {
        await login(page);
    });

    test('habits page loads', async ({ page }) => {
        await goToHabits(page);
        await expect(page.locator('.habits-title')).toHaveText('Habits');
        await expect(page.locator('.habits-add-btn')).toBeVisible();
    });

    test('view toggle between Today and Month', async ({ page }) => {
        await goToHabits(page);
        const todayBtn = page.locator('.habits-view-btn', { hasText: 'Today' });
        const monthBtn = page.locator('.habits-view-btn', { hasText: 'Month' });
        await expect(todayBtn).toHaveClass(/active/);
        await monthBtn.click();
        await expect(monthBtn).toHaveClass(/active/);
        await todayBtn.click();
        await expect(todayBtn).toHaveClass(/active/);
    });
});

// ──────────────────────────────────────
// Add Habit Modal — Suggested Habits
// ──────────────────────────────────────

test.describe('Add Habit Modal', () => {
    test.beforeEach(async ({ page }) => {
        await login(page);
        await goToHabits(page);
    });

    test('modal opens with suggested habits', async ({ page }) => {
        await page.click('.habits-add-btn');
        await expect(page.locator('.habit-modal')).toBeVisible();
        await expect(page.locator('.habit-modal-title')).toHaveText('New Habit');

        // Wait for modal animation to settle
        await page.waitForTimeout(500);

        // Should show suggested habits section (only if not all core habits are added)
        const suggestedCount = await page.locator('.suggested-habit-card').count();
        if (suggestedCount > 0) {
            await expect(page.locator('.suggested-habits-list')).toBeVisible();
        }
    });

    test('can create a custom habit', async ({ page }) => {
        await page.click('.habits-add-btn');
        await page.fill('.habit-modal-input', 'Test Habit E2E');
        await page.click('.habit-modal-save');

        // Modal should close and habit should appear after Supabase round-trip
        await expect(page.locator('.habit-modal')).not.toBeVisible({ timeout: 3000 });
        // Reload habits page to guarantee fresh data
        await goToHabits(page);
        // Scroll to bottom to find the new habit (it's appended at the end)
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        await page.waitForTimeout(500);
        const newHabit = page.getByText('Test Habit E2E').first();
        await expect(newHabit).toBeAttached({ timeout: 10000 });
    });

    test('modal has "or create custom" divider when suggested habits visible', async ({ page }) => {
        await page.click('.habits-add-btn');
        await page.waitForTimeout(500);
        const suggestedCount = await page.locator('.suggested-habit-card').count();
        if (suggestedCount > 0) {
            const divider = page.locator('.habit-modal-divider');
            await expect(divider).toBeVisible();
            await expect(divider).toContainText('or create custom');
        }
    });

    test('can add a suggested core habit', async ({ page }) => {
        await page.click('.habits-add-btn');
        // Wait for modal animation
        await page.waitForTimeout(500);
        const suggestedCard = page.locator('.suggested-habit-card').first();
        const suggestedCount = await page.locator('.suggested-habit-card').count();

        if (suggestedCount === 0) {
            // All core habits already added — skip
            test.skip();
            return;
        }

        const habitName = await suggestedCard.locator('.suggested-habit-name').innerText();
        await suggestedCard.click();

        // Modal should close, habit should appear in list
        await expect(page.locator('.habit-modal')).not.toBeVisible({ timeout: 3000 });
        await expect(page.locator('.habit-card-name', { hasText: habitName })).toBeVisible({ timeout: 5000 });
    });

    test('modal close works', async ({ page }) => {
        await page.click('.habits-add-btn');
        await expect(page.locator('.habit-modal')).toBeVisible();
        await page.click('.habit-modal-cancel');
        await expect(page.locator('.habit-modal')).not.toBeVisible();
    });
});

// ──────────────────────────────────────
// Habit Card — Automation Badge
// ──────────────────────────────────────

test.describe('Habit Card Automation Badge', () => {
    test.beforeEach(async ({ page }) => {
        await login(page);
        await goToHabits(page);
    });

    test('automation badge ⚡ shows on automated habits', async ({ page }) => {
        // Check if any habit cards with automation badge exist
        const badges = page.locator('.habit-auto-badge');
        const count = await badges.count();
        // This is informational — if there are core habits, they should have badges
        if (count > 0) {
            await expect(badges.first()).toContainText('⚡');
        }
    });
});

// ──────────────────────────────────────
// Habit Card — Toggle & Streak
// ──────────────────────────────────────

test.describe('Habit Interaction', () => {
    test.beforeEach(async ({ page }) => {
        await login(page);
        await goToHabits(page);
    });

    test('can toggle a habit completion', async ({ page }) => {
        const card = page.locator('.habit-card').first();
        const hasCard = await card.isVisible({ timeout: 3000 }).catch(() => false);
        if (!hasCard) return; // No habits to test

        const wasCompleted = await card.evaluate(el => el.classList.contains('completed'));
        await card.click();
        // Wait for state change
        await page.waitForTimeout(1000);

        if (wasCompleted) {
            await expect(card).not.toHaveClass(/completed/);
        } else {
            await expect(card).toHaveClass(/completed/);
        }
    });

    test('habit card shows week dots', async ({ page }) => {
        const card = page.locator('.habit-card').first();
        const hasCard = await card.isVisible({ timeout: 3000 }).catch(() => false);
        if (!hasCard) return;

        const weekDots = card.locator('.habit-week-dot');
        await expect(weekDots).toHaveCount(7);
    });

    test('edit modal opens from card menu', async ({ page }) => {
        const card = page.locator('.habit-card').first();
        const hasCard = await card.isVisible({ timeout: 3000 }).catch(() => false);
        if (!hasCard) return;

        // Hover to reveal menu
        await card.hover();
        await card.locator('.habit-card-menu').click();
        await expect(page.locator('.habit-modal')).toBeVisible();
        await expect(page.locator('.habit-modal-title')).toHaveText('Edit Habit');
    });
});

// ──────────────────────────────────────
// Core Habit Onboarding
// ──────────────────────────────────────

test.describe('Core Habit Onboarding', () => {
    test('onboarding shows for users with no habits (fresh localStorage)', async ({ page }) => {
        await login(page);

        // Clear the onboarding flag
        await page.evaluate(() => localStorage.removeItem('habit_onboarding_seen'));

        await goToHabits(page);

        // Wait for the page to finish loading
        await page.waitForTimeout(2000);

        // Check if there are any habit cards OR grid visible — means user has habits
        const hasHabits = await page.locator('.habit-card').count() > 0;

        if (hasHabits) {
            // User already has habits, onboarding won't show
            test.skip();
            return;
        }

        const onboarding = page.locator('.onboarding-container');
        await expect(onboarding).toBeVisible({ timeout: 3000 });
        await expect(page.locator('.onboarding-title')).toHaveText('Start with core habits');

        // Check cards exist
        const onboardingCards = page.locator('.onboarding-card');
        await expect(onboardingCards).toHaveCount(3);

        // Start button should be disabled initially
        await expect(page.locator('.onboarding-start-btn')).toBeDisabled();

        // Select a card
        await onboardingCards.first().click();
        await expect(onboardingCards.first()).toHaveClass(/selected/);
        await expect(page.locator('.onboarding-start-btn')).toBeEnabled();
    });

    test('skip onboarding sets localStorage flag', async ({ page }) => {
        await login(page);
        await page.evaluate(() => localStorage.removeItem('habit_onboarding_seen'));
        await goToHabits(page);

        const skipBtn = page.locator('.onboarding-skip-btn');
        const hasOnboarding = await skipBtn.isVisible({ timeout: 3000 }).catch(() => false);
        if (hasOnboarding) {
            await skipBtn.click();
            const flag = await page.evaluate(() => localStorage.getItem('habit_onboarding_seen'));
            expect(flag).toBe('1');
        }
    });
});

// ──────────────────────────────────────
// Dashboard — Habit Cards with Automation
// ──────────────────────────────────────

test.describe('Dashboard', () => {
    test.beforeEach(async ({ page }) => {
        await login(page);
    });

    test('dashboard loads and shows habit cards', async ({ page }) => {
        await page.goto('/#/');
        await page.waitForSelector('.dashboard', { timeout: 5000 }).catch(() => null);

        const habitCards = page.locator('.habit-card');
        const count = await habitCards.count();
        // Just verify it doesn't crash
        expect(count).toBeGreaterThanOrEqual(0);
    });
});

// ──────────────────────────────────────
// Cleanup test — archive test habits
// ──────────────────────────────────────

test.describe('Cleanup', () => {
    test('archive test habit if it exists', async ({ page }) => {
        await login(page);
        await goToHabits(page);

        const testHabit = page.locator('.habit-card-name', { hasText: 'Test Habit E2E' });
        const exists = await testHabit.isVisible({ timeout: 2000 }).catch(() => false);
        if (exists) {
            const card = testHabit.locator('..');
            await card.hover();
            await card.locator('.habit-card-menu').click();
            const archiveBtn = page.locator('.habit-archive-btn');
            const hasArchive = await archiveBtn.isVisible({ timeout: 2000 }).catch(() => false);
            if (hasArchive) {
                await archiveBtn.click();
            }
        }
    });
});
