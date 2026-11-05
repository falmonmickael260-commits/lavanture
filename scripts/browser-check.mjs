import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const browser = await chromium.launch({
  headless: true,
  executablePath: process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  args: ['--no-sandbox']
});
try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: 'fr-FR' });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle' });
  await page.getByRole('heading', { name: /Bonjour Nour/ }).waitFor();
  await page.screenshot({ path: '/tmp/nour-desktop.png', fullPage: true });

  await page.getByRole('button', { name: /Continuer mon aventure/ }).click();
  await page.getByRole('heading', { name: /Touche toutes les voyelles/ }).waitFor();
  for (const letter of ['A','E','I','O','U']) await page.locator('.activity-panel').getByRole('button', { name: letter, exact: true }).click();
  await page.getByRole('button', { name: 'Valider ma récolte' }).click();
  await page.getByRole('heading', { name: 'Quelle lettre est une voyelle ?' }).waitFor();
  await page.locator('.activity-panel .choice').filter({ hasText: /^E$/ }).click();
  await page.getByRole('heading', { name: /Relie chaque voyelle/ }).waitFor();
  await page.reload({ waitUntil: 'networkidle' });
  await page.getByRole('heading', { name: /Bonjour Nour/ }).waitFor();
  await page.getByRole('button', { name: /Continuer mon aventure/ }).click();
  await page.getByRole('heading', { name: /Relie chaque voyelle/ }).waitFor();
  await page.getByRole('button', { name: /Réécouter la consigne/ }).click();

  await page.getByRole('button', { name: /Quitter la mission/ }).click();
  await page.getByRole('button', { name: /Grande carte/ }).click();
  assert.equal(await page.locator('.card-numbers').isDisabled(), true);
  assert.equal(await page.locator('.card-castle').isDisabled(), true);

  for (const [name,width,height] of [['tablet',820,1180],['mobile',390,844]]) {
    await page.setViewportSize({ width, height });
    await page.getByRole('button', { name: /Accueil/ }).last().click();
    await page.screenshot({ path: `/tmp/nour-${name}.png`, fullPage: true });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    assert.ok(overflow <= 2, `${name}: débordement horizontal de ${overflow}px`);
    await page.getByRole('button', { name: /Choisir un monde/ }).click();
    const mapOverflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    assert.ok(mapOverflow <= 2, `${name}: carte trop large de ${mapOverflow}px`);
    if (name === 'mobile') {
      await page.screenshot({ path: '/tmp/nour-map-mobile.png', fullPage: true });
      await page.getByRole('button', { name: /Accueil/ }).last().click();
      await page.getByRole('button', { name: /Continuer mon aventure/ }).click();
      await page.getByRole('heading', { name: /Relie chaque voyelle/ }).waitFor();
      await page.screenshot({ path: '/tmp/nour-mission-mobile.png', fullPage: true });
      const missionOverflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      assert.ok(missionOverflow <= 2, `mobile: mission trop large de ${missionOverflow}px`);
    }
  }
  await page.getByRole('button', { name: 'Espace parent' }).click();
  await page.getByRole('dialog').getByRole('textbox', { name: /Réponse au calcul/ }).fill('43');
  await page.getByRole('button', { name: 'Entrer' }).click();
  await page.getByRole('heading', { name: /Suivre Nour/ }).waitFor();
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Exporter' }).click();
  const download = await downloadPromise;
  assert.match(download.suggestedFilename(), /sauvegarde\.json$/);
  assert.deepEqual(errors, []);
  console.log('Navigateur : reprise au 3e exercice, verrouillage, audio, export parent et tailles desktop/tablette/mobile OK.');
} finally {
  await browser.close();
}
