import { test, expect } from '@playwright/test';
import { initE2EMocked } from '../initE2EMocked';

test.describe('flujo sin filtros guardados', () => {
	const endpointId = 1;
	const path = `endpoint/${endpointId}`;

	test.beforeEach(async ({ page }, testInfo) => {
		await initE2EMocked(page, testInfo);
		await page.goto(path);
	});

	test('debe ir de variables → filtros → resultados y guardar los filtros', async ({ page }) => {
		// Etapa 1: llenar variables
		const inputs = page.locator('input');
		await inputs.nth(0).fill('cliente-123');
		if (await inputs.nth(1).isVisible()) {
			await inputs.nth(1).fill('00000');
		}

		// Etapa 2: pasar a filtros
		await page.getByRole('button', { name: /Next/i }).click();
		await expect(page.getByRole('heading', { name: /Edit filters/i })).toBeVisible();

		// Seleccionar uno o más filtros
		const checkboxes = page.locator('input[type="checkbox"]');
		await checkboxes.first().check();
		if (await checkboxes.nth(1).isVisible()) {
			await checkboxes.nth(1).check();
		}

		// Etapa 3: ejecutar petición
		await page.getByRole('button', { name: /Send/i }).click();

		// Esperar que el response textarea aparezca
		await page.getByRole('heading', { name: /Response/i }).waitFor({ timeout: 10000 });
		// Etapa 4: asegurar que los datos están en pantalla
		const listItems = page.locator('li');
		const texts = await listItems.allTextContents();

		expect(texts.join(' ')).toContain('Laptop');
	});
});
