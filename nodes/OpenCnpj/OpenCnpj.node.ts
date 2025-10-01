import { INodeType, INodeTypeDescription } from 'n8n-workflow';

export class OpenCnpj implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'OpenCNPJ',
		name: 'openCnpj',
		icon: 'file:opencnpj.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: 'Consult Brazilian company data by CNPJ using OpenCNPJ API',
		defaults: {
			name: 'OpenCNPJ',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [],
		requestDefaults: {
			baseURL: 'https://api.opencnpj.org',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
		},
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Company',
						value: 'company',
					},
				],
				default: 'company',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['company'],
					},
				},
				options: [
					{
						name: 'Get',
						value: 'get',
						action: 'Get company data',
						description: 'Retrieve Brazilian company data by CNPJ',
						routing: {
							request: {
								method: 'GET',
								url: '={{$parameter["cnpj"]}}',
							},
						},
					},
				],
				default: 'get',
			},
			{
				displayName: 'CNPJ',
				name: 'cnpj',
				type: 'string',
				required: true,
				default: '',
				placeholder: 'e.g. 11222333000181',
				description: 'Brazilian company CNPJ (14 digits, with or without punctuation)',
				displayOptions: {
					show: {
						resource: ['company'],
						operation: ['get'],
					},
				},
			},
			{
				displayName: 'Options',
				name: 'options',
				type: 'collection',
				placeholder: 'Add Option',
				default: {},
				displayOptions: {
					show: {
						resource: ['company'],
						operation: ['get'],
					},
				},
				options: [
					{
						displayName: 'Simplify',
						name: 'simplify',
						type: 'boolean',
						default: false,
						description: 'Whether to return a simplified version of the response instead of the raw data',
					},
				],
			},
		]
	};
}
