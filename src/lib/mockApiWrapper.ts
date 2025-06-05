import ApiWrapper from '$lib/ApiWrapper';
import type { Service, DetailedService } from './types/ApiWrapper';
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

	mockApi.executeService = async function (id: number): Promise<ServiceResponse> {
		if (id.toString() !== '5') {
			return {
				status: {
					code: 200,
					description: 'OK'
				},
				response: {
					0: ['Example response variable'],
					1: ['Second example response variable']
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
					0: [textContent]
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
			name: 'test endpoint',
			description: 'This is a test endpoint'
		};
	};
}
