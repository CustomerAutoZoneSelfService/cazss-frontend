import type {
	Service,
	DetailedService,
	HistoryService,
	DetailedHistoryService
} from './types/ApiWrapper';
import type { RequestService } from './types/RequestService';
import type { ServiceResponse } from './types/ServiceResponse';
import type { RequestUserFilterDTO, UserFilterDTO } from './types/Filter';

const BASE_URL = 'http://localhost:8080';

export default class ApiWrapper {
	static getHistoryUser(): HistoryService[] | PromiseLike<HistoryService[]> {
		throw new Error('Method not implemented.');
	}

	constructor(
		private baseUrl: string = BASE_URL,
		private headers: Record<string, string> = {}
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

	private delete<T>(path: string) {
		return this.request<T>(path, { method: 'DELETE' });
	}

	// Endpoints
	public getAllServices() {
		return this.get<Service[]>('/services');
	}

	public getServiceById(id: number) {
		return this.get<DetailedService>(`/services/${id}`);
	}

	public executeService(id: number, body: RequestService) {
		return this.post<ServiceResponse>(`/services/${id}/execute`, body);
	}

	public createService(service: CreateService) {
		return this.post<Service>(`/services`, service);
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

	public getDetailedHistory(id: number) {
		return this.get<DetailedHistoryService>(`/services/history/${id}`);
	}

	public getUserFilters(endpointId: number): Promise<UserFilterDTO[]> {
		return this.get<UserFilterDTO[]>(`/responses/${endpointId}/user-filters`);
	}

	public createUserFilters(
		endpointId: number,
		body: RequestUserFilterDTO
	): Promise<UserFilterDTO[]> {
		return this.post<UserFilterDTO[]>(`/responses/${endpointId}/user-filters`, body);
	}

	public updateUserFilters(
		endpointId: number,
		body: RequestUserFilterDTO
	): Promise<UserFilterDTO[]> {
		return this.put<UserFilterDTO[]>(`/responses/${endpointId}/user-filters`, body);
	}

	public deleteUserFilter(endpointId: number, patternId: number): Promise<void> {
		return this.delete<void>(`/responses/${endpointId}/user-filters/${patternId}`);
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
}
