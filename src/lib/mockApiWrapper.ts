import ApiWrapper from '$lib/ApiWrapper';
import type { Service, DetailedService } from './types/ApiWrapper';
import type { HistoryService } from './types/ApiWrapper';
import type { ServiceResponse } from './types/ServiceResponse';
import type { CreateService } from './types/CreateService';

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
				filters: [
					{
						responsePatternId: 1,
						pattern: 'PRODUCT_NAME',
						name: 'productName',
						description: 'Name of the product.'
					},
					{
						responsePatternId: 2,
						pattern: 'PRICE',
						name: 'price',
						description: 'Price of the product.'
					}
				],
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

	/**
	  "endpointId": 79,
    "name": "Mi Endpoint de Prueba (Dana)",
    "description": "Dana creó un endpoint de prueba"
	 */
	mockApi.executeService = async function (id: number): Promise<ServiceResponse> {
		if (id.toString() !== '5') {
			return {
				status: {
					code: 200,
					description: 'OK'
				},
				response: {
					content: [
						`
						<!DOCTYPE html>
							<html lang="en">
							<head>
							<meta charset="UTF-8">
							<meta name="viewport" content="width=device-width, initial-scale=1.0">
							<title>My First HTML Page</title>
							</head>
							<body>
							<h1>Hello, World!</h1>
							<p>This is a basic HTML page.</p>
							<a href="https://example.com">Visit Example.com</a>
							</body>
							</html>
					`
					]
				}
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
				response: {
					content: [textContent]
				}
			};
		}
	};


	/**
	 * 
	 {
		"code": "INTERNAL_ERROR",
		"message": "Unexpected error occurred",
		"details": "could not execute statement [Column 'name' cannot be null] [insert into Endpoints (active,category_id,description,method,name,url,user_id) values (?,?,?,?,?,?,?)]; SQL [insert into Endpoints (active,category_id,description,method,name,url,user_id) values (?,?,?,?,?,?,?)]; constraint [null]",
		"timestamp": "2025-05-29T20:56:45.4040164",
		"traceId": "1b4d45ff-f96c-42e7-9624-c7f48d96c3e6"
	}
	 */

	mockApi.createService = async function (service: CreateService): Promise<Service> {
		console.log(service);
		return {
			endpointId: 79,
			name: 'Mi Endpoint de Prueba (Dana)',
			description: 'Dana creó un endpoint de prueba'
		};
	};

	/*mockApi.getHistoryAdmin = async function (): Promise<HistoryService[]> {
		return Array.from({ length: 12 }, (_, i) => {
			const dayOffset = Math.floor(i / 3);
			const date = new Date();
			date.setDate(date.getDate() - dayOffset);
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

	};

	mockApi.getHistoryUser = async function (userId: number): Promise<HistoryService[]> {
		return Array.from({ length: 5 }, (_, i) => {
			const date = new Date();
			date.setDate(date.getDate() - i);
			return {
				historyId: i + 100,
				email: `user${userId}@example.com`,
				endpointName: 'Get TEST',
				endpointDescription: 'Historial filtrado por usuario',
				createdAt: date.toISOString()
			};
		});
	};

	mockApi.getDetailedHistory = async function (
		id: number
	): Promise<import('./types/ApiWrapper').DetailedHistoryService> {
		return {
			historyId: id,
			statusCode: 200,
			endpoint: {
				endpointId: 1,
				name: 'getById',
				description: 'Endpoint de ejemplo para detalles de historial'
			},
			historyData: {
				request: { param1: 'valor1', param2: 'valor2' },
				response: { result: 'ok', data: { foo: 'bar' } }
			}
		};
	};
}
