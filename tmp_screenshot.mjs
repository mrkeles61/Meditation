import { chromium } from 'playwright';
import path from 'path';

const outDir = 'C:\\Users\\erenk\\.gemini\\antigravity\\brain\\538eadc4-8333-43e7-8fe4-a5fcafbb3433';

(async () => {
    console.log('Launching browser...');
    const browser = await chromium.launch();
    const context = await browser.newContext({
        viewport: { width: 430, height: 932 }, // Mobile viewport for better layout testing
        deviceScaleFactor: 2,
    });
    const page = await context.newPage();

    console.log('Navigating to login...');
    await page.goto('http://localhost:5173/#/login');
    await page.waitForTimeout(1000);

    console.log('Clicking login button...');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000); // Wait for auth and redirect

    const pages = [
        { name: 'Dashboard', url: 'http://localhost:5173/#/' },
        { name: 'Meditation', url: 'http://localhost:5173/#/meditation' },
        { name: 'Habits', url: 'http://localhost:5173/#/habits' },
        { name: 'Chat', url: 'http://localhost:5173/#/chat' },
        { name: 'Profile', url: 'http://localhost:5173/#/profile' },
        { name: 'Styles', url: 'http://localhost:5173/#/styles' },
    ];

    for (const p of pages) {
        console.log(`Capturing ${p.name}...`);
        await page.goto(p.url);
        await page.waitForTimeout(2500); // Wait for PixiJS and animations to render
        const savePath = path.join(outDir, `${p.name.toLowerCase()}_screenshot_v2.png`);
        await page.screenshot({ path: savePath });
        console.log(`Saved to ${savePath}`);
    }

    await browser.close();
    console.log('Done.');
})().catch(console.error);
