/**
 * Fresh User Scenario — tests that require zero existing habits.
 *
 * Strategy:
 *  1. Before the suite: archive ALL current habits via Supabase REST API
 *  2. Run onboarding + suggested habit tests against the "empty" state
 *  3. After the suite: restore all habits (unarchive) and delete test-created ones
 */
import { test, expect, type Page } from '@playwright/test';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const TEST_EMAIL = process.env.E2E_EMAIL || 'erenkeles2005@outlook.com';
const TEST_PASSWORD = process.env.E2E_PASSWORD || 'Keles3461!';

const SUPABASE_URL = 'https://pglfjtuwnocqtdwebvvh.supabase.co';
const SUPABASE_ANON_KEY =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBnbGZqdHV3bm9jcXRkd2VidnZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA0NTc5MDgsImV4cCI6MjA4NjAzMzkwOH0.wf0N6JxFRBx9SCEOutUG7UnNKtmx5CYNlfbmrP_M0bM';

let supabase: SupabaseClient;
let archivedIds: string[] = [];

// ── Helpers ────────────────────────────────

async function login(page: Page) {
    await page.goto('/#/login');
    await page.fill('#email', TEST_EMAIL);
    await page.fill('#password', TEST_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/#/', { timeout: 10000 });
}

async function goToHabits(page: Page) {
    await page.goto('/#/habits');
    await page.waitForSelector('.habits-page', { timeout: 5000 });
}

// ── Setup & Teardown ───────────────────────

test.describe('Fresh User Scenario', () => {
    test.describe.configure({ mode: 'serial' });

    test.beforeAll(async () => {
        supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        const { error: authErr } = await supabase.auth.signInWithPassword({
            email: TEST_EMAIL,
            password: TEST_PASSWORD,
        });
        if (authErr) throw new Error(`Supabase auth failed: ${authErr.message}`);

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('No user after auth');

        // Archive all existing unarchived habits
        const { data: habits } = await supabase
            .from('habits')
            .select('id')
            .eq('user_id', user.id)
            .eq('archived', false);

        archivedIds = (habits || []).map(h => h.id);

        if (archivedIds.length > 0) {
            await supabase
                .from('habits')
                .update({ archived: true })
                .in('id', archivedIds);
        }
    });

    test.afterAll(async () => {
        // Restore previously-archived habits
        if (archivedIds.length > 0) {
            await supabase
                .from('habits')
                .update({ archived: false })
                .in('id', archivedIds);
        }

        // Delete any habits created during the test
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            await supabase
                .from('habits')
                .delete()
                .eq('user_id', user.id)
                .eq('is_core', true)
                .not('id', 'in', `(${archivedIds.join(',')})`);
        }
    });

    // ── Test 1: Onboarding ─────────────────

    test('onboarding appears when user has no habits', async ({ page }) => {
        await login(page);
        await page.evaluate(() => localStorage.removeItem('habit_onboarding_seen'));
        await goToHabits(page);

        // With all habits archived, onboarding should be visible
        const onboarding = page.locator('.onboarding-container');
        await expect(onboarding).toBeVisible({ timeout: 5000 });
        await expect(page.locator('.onboarding-title')).toHaveText('Start with core habits');

        // Should have 3 core habit cards
        const cards = page.locator('.onboarding-card');
        await expect(cards).toHaveCount(3);

        // Start button disabled until a card is selected
        const startBtn = page.locator('.onboarding-start-btn');
        await expect(startBtn).toBeDisabled();

        // Select first card → button becomes enabled
        await cards.first().click();
        await expect(cards.first()).toHaveClass(/selected/);
        await expect(startBtn).toBeEnabled();

        // Select all three
        await cards.nth(1).click();
        await cards.nth(2).click();

        // Click Start → habits should be created
        await startBtn.click();
        await page.waitForTimeout(2000);

        // Onboarding should disappear, habit cards should show
        await expect(onboarding).not.toBeVisible({ timeout: 3000 });
        const habitCards = page.locator('.habit-card');
        const count = await habitCards.count();
        expect(count).toBeGreaterThanOrEqual(1);
    });

    // ── Test 2: Skip onboarding ────────────

    test('skip onboarding sets the localStorage flag', async ({ page }) => {
        await login(page);
        await page.evaluate(() => localStorage.removeItem('habit_onboarding_seen'));

        // Delete the core habits created by the previous test so onboarding appears again
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            await supabase
                .from('habits')
                .delete()
                .eq('user_id', user.id)
                .eq('is_core', true)
                .not('id', 'in', `(${archivedIds.join(',')})`);
        }

        await goToHabits(page);

        const skipBtn = page.locator('.onboarding-skip-btn');
        await expect(skipBtn).toBeVisible({ timeout: 5000 });
        await skipBtn.click();

        // Flag should be set
        const flag = await page.evaluate(() => localStorage.getItem('habit_onboarding_seen'));
        expect(flag).toBe('1');

        // Onboarding should disappear
        await expect(page.locator('.onboarding-container')).not.toBeVisible({ timeout: 3000 });
    });

    // ── Test 3: Suggested habits in modal ──

    test('add modal shows all 3 suggested core habits', async ({ page }) => {
        await login(page);
        await goToHabits(page);
        await page.waitForTimeout(1000);

        await page.click('.habits-add-btn');
        await page.waitForTimeout(500);

        // With zero habits of any automation_type, all 3 core should appear
        const suggestedCards = page.locator('.suggested-habit-card');
        await expect(suggestedCards).toHaveCount(3, { timeout: 3000 });

        // Should show the "or create custom" divider
        const divider = page.locator('.habit-modal-divider');
        await expect(divider).toBeVisible();
        await expect(divider).toContainText('or create custom');
    });

    // ── Test 4: Add a suggested habit ──────

    test('clicking a suggested card adds it and removes it from suggestions', async ({ page }) => {
        await login(page);
        await goToHabits(page);
        await page.waitForTimeout(1000);

        await page.click('.habits-add-btn');
        await page.waitForTimeout(500);

        const firstCard = page.locator('.suggested-habit-card').first();
        const habitName = await firstCard.locator('.suggested-habit-name').innerText();
        await firstCard.click();

        // Modal closes, habit appears in list
        await expect(page.locator('.habit-modal')).not.toBeVisible({ timeout: 3000 });
        await goToHabits(page);
        const newHabit = page.getByText(habitName).first();
        await expect(newHabit).toBeAttached({ timeout: 10000 });

        // Re-open modal — should now show only 2 suggested
        await page.click('.habits-add-btn');
        await page.waitForTimeout(500);
        const remaining = page.locator('.suggested-habit-card');
        await expect(remaining).toHaveCount(2, { timeout: 3000 });
    });
});
