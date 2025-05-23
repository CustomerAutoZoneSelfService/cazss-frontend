import ApiWrapper from '$lib/ApiWrapper';
import type { Service, DetailedService } from './types/ApiWrapper';
//import type { HistoryService } from './types/ApiWrapper';
import type { ServiceResponse } from './types/ServiceResponse';

export function replaceWithMock(mockApi: ApiWrapper): void {
	mockApi.getAllServices = async function (): Promise<Service[]> {
		return [
			{ endpointId: 1, name: 'getById', description: 'Example description' },
			{ endpointId: 2, name: 'getByName', description: 'Example description 2' },
			{ endpointId: 3, name: 'clearCache', description: 'Example description 3' },
			{ endpointId: 4, name: 'resetSomething', description: 'Example description 4' },
			{ endpointId: 5, name: 'pdfMockData', description: 'Example pdf endpoint' }
		];
	};

	mockApi.getServiceById = async function (id: number): Promise<DetailedService> {
		if (id.toString() !== '5') {
			return {
				id: 1,
				name: 'Get PNA by SKU',
				description: 'This endpoint retrieves the PNA by SKU.',
				active: true,
				method: 'GET',
				url: 'https:blabla',
				responses: [
					{
						status: 20,
						description: 'OK'
					}
				],
				filters: [],
				variables: [
					{
						requestVariableId: 1,
						type: 'HEADER',
						keyName: 'CLIENT ID',
						defaultValue: '',
						customizable: true,
						description: 'The id of the client'
					},
					{
						requestVariableId: 2,
						type: 'BODY',
						keyName: 'SKU',
						defaultValue: '00000',
						customizable: true,
						description: 'The SKU of the product'
					}
				],
				requestBody: 'Template'
			};
		} else {
			return {
				id: 5,
				name: 'Pdf Demo',
				description: 'This endpoint tests the pdf functionality',
				active: true,
				method: 'GET',
				url: 'https:blabla',
				responses: [
					{
						status: 20,
						description: 'OK'
					}
				],
				filters: [],
				variables: [],
				requestBody: 'Template'
			};
		}
	};

	mockApi.executeService = async function (id: number): Promise<ServiceResponse> {
		if (id.toString() !== '5') {
			return {
				status: {
					code: 200,
					description: 'Success'
				},
				response: [
					{
						firstName: ['John'],
						lastName: ['Doe'],
						age: ['30']
					},
					{
						productName: ['Laptop'],
						price: ['1200'],
						features: ['Intel Core i7', '16GB RAM', '512GB SSD']
					},
					{
						city: ['Chihuahua'],
						country: ['Mexico']
					}
				]
			};
		} else {
			let textContent = '';
			const res = await fetch('/test_pdf.txt');
			textContent = await res.text();

			return {
				status: {
					code: 200,
					description: 'Success'
				},
				response: [
					{
						content: [textContent]
					}
				]
			};
		}
	};

	/*mockApi.getHistoryAdmin = async function (): Promise<HistoryService[]> {
		return Array.from({ length: 12 }, (_, i) => {
			const dayOffset = Math.floor(i / 3); // Each 3 elements changes day
			const date = new Date();
			date.setDate(date.getDate() - dayOffset); // Subtract days by group

			// To differentiate them a bit, add some seconds
			date.setSeconds(date.getSeconds() + (i % 3) * 10);

			return {
				historyId: i + 2,
				email: `user${i + 1}@example.com`,
				endpointName: 'Get TEST',
				endpointDescription:
					'Descripción de un endpoint para obtener un recurso y así poder ver el resultado',
				createdAt: date.toISOString()
			};
		});
	};*/
}
