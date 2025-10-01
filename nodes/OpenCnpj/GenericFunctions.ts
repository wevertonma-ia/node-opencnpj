import type {
	IDataObject,
	IExecuteFunctions,
	IHttpRequestMethods,
	ILoadOptionsFunctions,
	IRequestOptions,
	JsonObject,
} from 'n8n-workflow';
import { NodeApiError } from 'n8n-workflow';

import type { CompanyData, SimplifiedCompanyData } from './types';

/**
 * Make a request to OpenCNPJ API.
 */
export async function openCnpjApiRequest(
	this: IExecuteFunctions | ILoadOptionsFunctions,
	method: IHttpRequestMethods,
	endpoint: string,
	body: IDataObject = {},
	qs: IDataObject = {},
) {
	// Generate unique identifiers to prevent caching
	const timestamp = Date.now();
	const randomId = Math.random().toString(36).substring(7);

	// Add cache-busting query parameters
	const separator = endpoint.includes('?') ? '&' : '?';
	const cacheBustingEndpoint = `${endpoint}${separator}_t=${timestamp}&_r=${randomId}`;

	const options: IRequestOptions = {
		headers: {
			'Accept': 'application/json',
			'User-Agent': `n8n-nodes-opencnpj/0.2.2-${timestamp}`,
			'Cache-Control': 'no-cache, no-store, must-revalidate',
			'Pragma': 'no-cache',
			'Expires': '0',
			'X-Requested-With': 'XMLHttpRequest',
		},
		method,
		body,
		qs,
		uri: `https://publica.cnpj.ws${cacheBustingEndpoint}`,
		json: true,
		timeout: 30000, // 30 seconds timeout
	};

	if (Object.keys(qs).length === 0) {
		delete options.qs;
	}

	if (Object.keys(body).length === 0) {
		delete options.body;
	}

	try {
		return await this.helpers.request(options);
	} catch (error) {
		throw new NodeApiError(this.getNode(), error as JsonObject);
	}
}

/**
 * Clean CNPJ by removing all non-numeric characters
 */
export function cleanCnpj(cnpj: string): string {
	return cnpj.replace(/\D/g, '');
}

/**
 * Validate CNPJ using the official Brazilian algorithm
 */
export function isValidCnpj(cnpj: string): boolean {
	// Check if CNPJ has exactly 14 digits
	if (cnpj.length !== 14) {
		return false;
	}

	// Check if all digits are the same (invalid CNPJs)
	if (/^(\d)\1{13}$/.test(cnpj)) {
		return false;
	}

	// Validate CNPJ check digits
	let sum = 0;
	let weight = 2;

	// First check digit
	for (let i = 11; i >= 0; i--) {
		sum += parseInt(cnpj.charAt(i)) * weight;
		weight = weight === 9 ? 2 : weight + 1;
	}

	let checkDigit1 = sum % 11 < 2 ? 0 : 11 - (sum % 11);
	if (checkDigit1 !== parseInt(cnpj.charAt(12))) {
		return false;
	}

	// Second check digit
	sum = 0;
	weight = 2;
	for (let i = 12; i >= 0; i--) {
		sum += parseInt(cnpj.charAt(i)) * weight;
		weight = weight === 9 ? 2 : weight + 1;
	}

	let checkDigit2 = sum % 11 < 2 ? 0 : 11 - (sum % 11);
	return checkDigit2 === parseInt(cnpj.charAt(13));
}

/**
 * Simplify the OpenCNPJ API response to return only the most relevant fields
 */
export function simplifyResponse(response: CompanyData): SimplifiedCompanyData {
	return {
		cnpj: response.cnpj,
		razao_social: response.razao_social,
		nome_fantasia: response.nome_fantasia,
		situacao_cadastral: response.situacao_cadastral,
		data_situacao_cadastral: response.data_situacao_cadastral,
		porte: response.porte,
		natureza_juridica: response.natureza_juridica,
		capital_social: response.capital_social,
		endereco: {
			logradouro: response.logradouro,
			numero: response.numero,
			complemento: response.complemento,
			bairro: response.bairro,
			cep: response.cep,
			municipio: response.municipio,
			uf: response.uf,
		},
		telefone: response.telefone1,
		email: response.email,
		atividade_principal: response.atividade_principal,
		data_inicio_atividade: response.data_inicio_atividade,
	};
}

export const toOptions = (items: any[]) =>
	items.map(({ name, id }) => ({ name, value: id }));