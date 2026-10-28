const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const BASE = 'http://localhost:5175';
const OUT = path.join(__dirname, '..', 'docs', 'screenshots');
fs.mkdirSync(OUT, { recursive: true });

async function login(page, email, password) {
  await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' });
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL('**-dashboard', { timeout: 15000 });
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(700);
}

async function shot(page, name, fullPage = false) {
  await page.screenshot({ path: path.join(OUT, name), fullPage });
  console.log('saved', name);
}

(async () => {
  const browser = await chromium.launch(
    process.env.PLAYWRIGHT_CHROMIUM_PATH
      ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH }
      : {}
  );
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();

  // Public login page
  await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  await shot(page, '01-login.png');

  // Admin
  await login(page, 'admin@clinic.com', 'Admin@123');
  await shot(page, '02-admin-dashboard.png');

  const adminPages = [
    ['admin-manage-doctors', '03-manage-doctors.png'],
    ['admin-manage-appointments', '04-manage-appointments.png'],
    ['admin-manage-schedules', '05-manage-schedules.png'],
    ['admin-manage-patients', '06-manage-patients.png'],
    ['admin-reports', '07-reports.png'],
  ];
  for (const [route, name] of adminPages) {
    await page.goto(`${BASE}/${route}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(900);
    if (route === 'admin-reports') {
      const generate = page.getByRole('button', { name: /generate report/i });
      if (await generate.count()) {
        await generate.first().click();
        await page.waitForTimeout(1200);
      }
    }
    await shot(page, name);
  }

  // Doctor
  await context.clearCookies();
  await page.evaluate(() => localStorage.clear());
  await login(page, 'doctor@clinic.com', 'Doctor@123');
  await shot(page, '08-doctor-dashboard.png');

  // Patient
  await page.evaluate(() => localStorage.clear());
  await login(page, 'patient@clinic.com', 'Patient@123');
  await shot(page, '09-patient-dashboard.png');
  await page.goto(`${BASE}/book-appointment`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(700);
  const specialtySelect = page.locator('select').first();
  if (await specialtySelect.count()) {
    await specialtySelect.selectOption({ label: 'Cardiology' });
    await page.waitForTimeout(1200);
  }
  await shot(page, '10-book-appointment.png');

  await browser.close();
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
