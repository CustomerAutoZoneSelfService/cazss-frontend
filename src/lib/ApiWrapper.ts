import type {
	Service,
	DetailedService,
	HistoryService,
	DetailedHistoryService
} from './types/ApiWrapper';
import type { ConfigureService } from './types/ConfigureService';
import type { RequestService } from './types/RequestService';
import type { ServiceResponse } from './types/ServiceResponse';
import type { Categories } from './types/Categories';

const BASE_URL = 'http://localhost:8080';

export default class ApiWrapper {
	static getHistoryUser(): HistoryService[] | PromiseLike<HistoryService[]> {
		throw new Error('Method not implemented.');
	}

	constructor(
		private readonly baseUrl: string = BASE_URL,
		private readonly headers: Record<string, string> = {}
	) {}

	// Primitives
	private async request<T>(path: string, options: RequestInit = {}) {
		const url = this.baseUrl + path;
		const response = await fetch(url, {
			...options,
			headers: {
				...this.headers,
				...options.headers
			}
		});

		if (!response.ok)
			throw new Error(
				`[API Wrapper] The request to ${url} (${options.method}) failed. Status: ${response.status} ${response.statusText}, body: ${await response.text()}`
			);
		else return (await response.json()) as T;
	}

	private get<T>(path: string) {
		return this.request<T>(path, { method: 'GET' });
	}

	private post<T>(path: string, body: object) {
		return this.request<T>(path, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(body)
		});
	}

	private put<T>(path: string, body: object) {
		return this.request<T>(path, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(body)
		});
	}

	// GET Methods
	public getAllServices() {
		return this.get<Service[]>('/services');
	}

	public getServiceById(id: number) {
		return this.get<DetailedService>(`/services/${id}`);
	}

	public getServiceByIdForEdit(id: number) {
		return this.get<ConfigureService>(`/services/${id}/edit`);
	}

	public getCategories() {
		return this.get<Categories[]>(`/services/categories`);
	}

	public getHistoryAdmin() {
		return this.get<HistoryService[]>('/services/history');
	}

	public getHistoryUser(userId: number) {
		return this.get<HistoryService[]>(`/services/history?userId=${userId}`);
	}

	public getAllHistory() {
		return this.get<HistoryService[]>('/services/history');
	}

	// POST Methods
	public executeService(id: number, body: RequestService) {
		return this.post<ServiceResponse>(`/services/${id}/execute`, body);
	}

	public getDetailedHistory(id: number) {
		return this.get<DetailedHistoryService>(`/services/history/${id}`);
	}

	public createService(service: ConfigureService) {
		return this.post<Service>(`/services`, service);
	}

	public updateService(id: number, service: ConfigureService) {
		return this.put<ConfigureService>(`/services/${id}`, service);
	}
}
