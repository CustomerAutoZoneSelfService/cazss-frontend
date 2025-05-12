import { test, expect, type Page, type Locator } from '@playwright/test';

const pages = ['demo/input-table'];

for (const path of pages) {
	test.beforeEach(async ({ page }) => {
		await page.goto(`${path}`);
	});

	function getKeyPresses(keysToTest: string[], keyLimits: { [key: string]: number }) {
		const keyMovements: string[] = [];

		for (let currentKeyIndex = 0; currentKeyIndex < keysToTest.length; currentKeyIndex++) {
			let numberOfTimesKeyWasUsed = 0;
			const currentKey = keysToTest[currentKeyIndex];
			while (numberOfTimesKeyWasUsed < keyLimits[currentKey]) {
				keyMovements.push(currentKey);
				numberOfTimesKeyWasUsed++;
			}
		}

		return keyMovements;
	}

	function getExpectedMovements(keyPresses: string[], keyLimits: { [key: string]: number }) {
		const keyDirection = {
			'Alt+ArrowDown': 'row',
			'Alt+ArrowUp': 'row',
			'Alt+ArrowLeft': 'column',
			'Alt+ArrowRight': 'column',
			Enter: 'row',
			'Shift+Enter': 'row'
		};

		const keyValue = {
			'Alt+ArrowDown': 1,
			'Alt+ArrowUp': -1,
			'Alt+ArrowLeft': -1,
			'Alt+ArrowRight': 1,
			Enter: 1,
			'Shift+Enter': -1
		};

		const expectedMovements: string[] = [];

		let currentRow = 0;
		let currentCol = 0;

		for (
			let currentKeyPressIndex = 0;
			currentKeyPressIndex < keyPresses.length;
			currentKeyPressIndex++
		) {
			const currentPress = keyPresses[currentKeyPressIndex] as keyof typeof keyDirection;

			if (keyDirection[currentPress] == 'row') {
				if (keyValue[currentPress] == -1) {
					if (currentRow > 0) {
						currentRow--;
					}
				} else {
					if (currentRow < keyLimits[currentPress] - 1) {
						currentRow++;
					}
				}
			} else {
				if (keyValue[currentPress] == -1) {
					if (currentCol > 0) {
						currentCol--;
					}
				} else {
					if (currentCol < keyLimits[currentPress] - 1) {
						currentCol++;
					}
				}
			}

			expectedMovements.push(`cell-row-${currentRow}-col-${currentCol}`);
		}

		return expectedMovements;
	}

	async function testKeyMovement(
		page: Page,
		keysToTest: string[],
		keyLimits: { [key: string]: number }
	) {
		const keyPresses = getKeyPresses(keysToTest, keyLimits);
		const expectedMovements = getExpectedMovements(keyPresses, keyLimits);

		for (let currentKeyIndex = 0; currentKeyIndex < keyPresses.length; currentKeyIndex++) {
			await page.keyboard.press(`${keyPresses[currentKeyIndex]}`);
			const focusedCell = page.locator('th:has(input:focus)');
			const dataTestId = await focusedCell.getAttribute('data-testid');
			console.log(dataTestId);
			await expect(focusedCell).toHaveAttribute('data-testid', expectedMovements[currentKeyIndex]);
		}
	}

	async function deleteRowAndVerify(
		currentTable: Locator,
		row0DeleteButton: Locator,
		numberOfRows: number,
		numberOfColumns: number
	) {
		const row0DescriptionCell = currentTable.locator(
			`[data-testid="cell-row-0-col-${numberOfColumns - 1}"]`
		);
		const lastRowKeyCell = currentTable.locator(`[data-testid="cell-row-${numberOfRows}-col-0"]`);

		await row0DescriptionCell.hover();

		await expect(row0DeleteButton).toBeVisible();

		await row0DeleteButton.click();

		await expect(row0DescriptionCell.locator('input')).toHaveValue('');

		await expect(lastRowKeyCell).toHaveCount(0);
	}

	test(
		'pressing Alt + $ArrowKey moves the cursor in that direction (when possible), and pressing' +
			' Enter and Shift+Enter should work with rows the same way Tab and Shift+Tab work with columns',
		async ({ page }) => {
			// Starting the test in the cell in the value Column of the first input row
			const tables = page.locator('[data-testid="variable-table"]');
			const numberOfTables = await tables.count();

			// Purely to improve readability in the following section
			const DOWN_KEY_INDEX = 1,
				UP_KEY_INDEX = 2,
				RIGHT_KEY_INDEX = 3,
				LEFT_KEY_INDEX = 4,
				ENTER_KEY_INDEX = 5,
				SHIFT_ENTER_KEY_INDEX = 6;

			// Doesn't make sense to test the keys when there's no next/previous row/column to move to
			const MIN_NUMBER_OF_ROWS_AND_COLUMNS_FOR_KEY_TESTING = 2;
			const keysToTest = [
				'Alt+ArrowDown',
				'Alt+ArrowUp',
				'Alt+ArrowRight',
				'Alt+ArrowLeft',
				'Enter',
				'Shift+Enter'
			];

			for (let tableArrayIndex = 0; tableArrayIndex < numberOfTables; tableArrayIndex++) {
				const currentTable = tables.nth(tableArrayIndex);
				const numberOfRows = await currentTable.locator('tbody tr').count();
				const numberOfColumns = await currentTable.locator('thead th').count();

				const keyLimits = {
					'Alt+ArrowDown': numberOfRows,
					'Alt+ArrowUp': numberOfRows,
					'Alt+ArrowLeft': numberOfColumns,
					'Alt+ArrowRight': numberOfColumns,
					Enter: numberOfRows,
					'Shift+Enter': numberOfRows
				};

				const STARTING_CELL = currentTable.locator(`[data-testid="cell-row-0-col-0"]`);

				if (numberOfColumns < MIN_NUMBER_OF_ROWS_AND_COLUMNS_FOR_KEY_TESTING) {
					keysToTest.splice(LEFT_KEY_INDEX, 1);
					keysToTest.splice(RIGHT_KEY_INDEX, 1);
				}

				if (numberOfRows < MIN_NUMBER_OF_ROWS_AND_COLUMNS_FOR_KEY_TESTING) {
					keysToTest.splice(UP_KEY_INDEX, 1);
					keysToTest.splice(DOWN_KEY_INDEX, 1);
					keysToTest.splice(ENTER_KEY_INDEX, 1);
					keysToTest.splice(SHIFT_ENTER_KEY_INDEX);
				}

				if (keysToTest.length > 0) {
					await STARTING_CELL.click();
					await testKeyMovement(page, keysToTest, keyLimits);
				}
				console.log('End of table ' + tableArrayIndex + '\n');
			}
		}
	);

	test(
		'typing a character into the last empty key cell should result in the table preparing a' +
			' new cell below it',
		async ({ page }) => {
			const tables = page.locator('[data-testid="variable-table"]');
			const numberOfTables = await tables.count();

			for (let tableArrayIndex = 0; tableArrayIndex < numberOfTables; tableArrayIndex++) {
				const currentTable = tables.nth(tableArrayIndex);
				const numberOfRows = await currentTable.locator('tbody tr').count();
				const startingKeyCell = currentTable.locator(
					`[data-testid="cell-row-${numberOfRows - 1}-col-0"] input`
				);

				await startingKeyCell.fill('ExampleKey');
				await expect(
					currentTable.locator(`[data-testid="cell-row-${numberOfRows}-col-0"]`)
				).toBeVisible();
			}
		}
	);

	test(
		'hovering the mouse over the description field should show a delete button, which should' +
			' delete the hovered row',
		async ({ page }) => {
			const tables = page.locator('[data-testid="variable-table"]');
			const numberOfTables = await tables.count();

			for (let tableArrayIndex = 0; tableArrayIndex < numberOfTables; tableArrayIndex++) {
				const currentTable = tables.nth(tableArrayIndex);
				const numberOfColumns = await currentTable.locator('thead th').count();
				const numberOfRows = await currentTable.locator('tbody tr').count();
				const startingKeyCell = currentTable.locator(
					`[data-testid="cell-row-${numberOfRows - 1}-col-0"] input`
				);

				await expect(currentTable.locator('[data-testid="delete-row-0"]')).toBeHidden();

				await startingKeyCell.fill('ExampleKey');
				await expect(
					currentTable.locator(`[data-testid="cell-row-${numberOfRows}-col-0"]`)
				).toBeVisible();
				await expect(currentTable.locator('[data-testid="delete-row-1"]')).toBeHidden();
				const row0DeleteButton = currentTable.locator('[data-testid="delete-row-0"] button');
				await deleteRowAndVerify(currentTable, row0DeleteButton, numberOfRows, numberOfColumns);
			}
		}
	);

	test(
		'attempting to delete a row followed by non-empty rows should shift these rows to fill the gap' +
			' (while assigning them the appropriate cell-row-ids)',
		async ({ page }) => {
			const tables = page.locator('[data-testid="variable-table"]');
			const numberOfTables = await tables.count();

			for (let tableArrayIndex = 0; tableArrayIndex < numberOfTables; tableArrayIndex++) {
				const currentTable = tables.nth(tableArrayIndex);
				const numberOfColumns = await currentTable.locator('thead th').count();

				await expect(currentTable.locator('[data-testid="delete-row-0"]')).toBeHidden();

				const row0KeyCell = currentTable.locator('[data-testid="cell-row-0-col-0"]');
				const row0DescriptionCell = currentTable.locator(
					`[data-testid="cell-row-0-col-${numberOfColumns - 1}"]`
				);

				await row0KeyCell.locator('input').fill('First Key');

				await row0DescriptionCell.hover();

				const row0DeleteButton = currentTable.locator('[data-testid="delete-row-0"] button');

				await expect(row0DeleteButton).toBeVisible();

				const row1KeyCell = currentTable.locator(`[data-testid="cell-row-1-col-0"]`);

				await row1KeyCell.locator('input').fill('ExampleKey');

				await row0DeleteButton.click();

				// Row 0 should contain what was previously the value of row 1
				await expect(row0KeyCell.locator('input')).toHaveValue('ExampleKey');
				// Row 0 should still have it's appropriate ID
				await expect(row0KeyCell).toHaveAttribute('data-testid', 'cell-row-0-col-0');
			}
		}
	);

	test(
		'the table should always have a minimum of one row available, after which point the delete button' +
			' will not remove it',
		async ({ page }) => {
			const tables = page.locator('[data-testid="variable-table"]');
			const numberOfTables = await tables.count();

			for (let tableArrayIndex = 0; tableArrayIndex < numberOfTables; tableArrayIndex++) {
				const currentTable = tables.nth(tableArrayIndex);
				const numberOfColumns = await currentTable.locator('thead th').count();
				const numberOfRows = await currentTable.locator('tbody tr').count();

				for (let currentRow = numberOfRows; currentRow >= 0; currentRow--) {
					const row0DescriptionCell = currentTable.locator(
						`[data-testid="cell-row-0-col-${numberOfColumns - 1}"]`
					);

					await row0DescriptionCell.hover();

					const row0DeleteButton = currentTable.locator('[data-testid="delete-row-0"] button');

					await expect(row0DeleteButton).toBeVisible();

					await row0DeleteButton.click();

					await expect(row0DescriptionCell).toBeVisible();
				}
			}
		}
	);

	test('attempting to delete a bottom row should only remove its contents, but not the row itself', async ({
		page
	}) => {
		const tables = page.locator('[data-testid="variable-table"]');
		const numberOfTables = await tables.count();

		for (let tableArrayIndex = 0; tableArrayIndex < numberOfTables; tableArrayIndex++) {
			const currentTable = tables.nth(tableArrayIndex);
			const numberOfColumns = await currentTable.locator('thead th').count();
			const numberOfRows = await currentTable.locator('tbody tr').count();

			const finalRowDescriptionCell = currentTable.locator(
				`[data-testid="cell-row-${numberOfRows - 1}-col-${numberOfColumns - 1}"]`
			);
			await finalRowDescriptionCell.locator('input').fill('ExampleKey');

			await finalRowDescriptionCell.hover();

			const finalRowDeleteButton = currentTable.locator(
				`[data-testid="delete-row-${numberOfRows - 1}"] button`
			);

			await expect(finalRowDeleteButton).toBeVisible();

			await finalRowDeleteButton.click();

			await expect(finalRowDescriptionCell).toBeVisible();
			await expect(finalRowDescriptionCell.locator('input')).toHaveValue('');
		}
	});
}
