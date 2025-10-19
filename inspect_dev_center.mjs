import { chromium } from '@playwright/test';

async function inspectDevCenter() {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    
    try {
        // Navigate to dev server
        await page.goto('http://localhost:15175', { waitUntil: 'networkidle', timeout: 10000 });
        
        // Get page title
        const title = await page.title();
        console.log('\n📄 Page Title:', title);
        
        // Get all navigation/menu items
        const navItems = await page.evaluate(() => {
            const items = [];
            document.querySelectorAll('nav a, [role="navigation"] a, .nav-item, .menu-item').forEach(el => {
                items.push({
                    text: el.textContent.trim(),
                    href: el.getAttribute('href')
                });
            });
            return items;
        });
        console.log('\n🧭 Navigation Items:');
        navItems.forEach(item => console.log(`  - ${item.text} → ${item.href}`));
        
        // Get main headings
        const headings = await page.evaluate(() => {
            const h = [];
            document.querySelectorAll('h1, h2, h3').forEach(el => {
                h.push(`${el.tagName}: ${el.textContent.trim()}`);
            });
            return h;
        });
        console.log('\n📋 Main Headings:');
        headings.forEach(h => console.log(`  ${h}`));
        
        // Get buttons/actions
        const buttons = await page.evaluate(() => {
            const btns = [];
            document.querySelectorAll('button').forEach(el => {
                btns.push(el.textContent.trim());
            });
            return btns;
        });
        console.log('\n🔘 Buttons/Actions:');
        buttons.slice(0, 10).forEach(btn => console.log(`  - ${btn}`));
        
        // Take screenshot
        await page.screenshot({ path: 'dev_center_screenshot.png', fullPage: true });
        console.log('\n📸 Screenshot saved: dev_center_screenshot.png');
        
        // Get page structure
        const structure = await page.evaluate(() => {
            return {
                bodyClasses: document.body.className,
                mainSections: Array.from(document.querySelectorAll('main > *, [role="main"] > *')).map(el => ({
                    tag: el.tagName,
                    classes: el.className,
                    id: el.id
                }))
            };
        });
        console.log('\n🏗️  Page Structure:');
        console.log(JSON.stringify(structure, null, 2));
        
    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await browser.close();
    }
}

inspectDevCenter();

