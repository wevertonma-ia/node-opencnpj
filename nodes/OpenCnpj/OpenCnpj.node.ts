import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionTypes, NodeOperationError } from 'n8n-workflow';

import { openCnpjApiRequest, cleanCnpj, isValidCnpj, simplifyResponse } from './GenericFunctions';
import type { Operation, Resource, OpenCnpjOptions, CompanyData } from './types';

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
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [],
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
				placeholder: 'e.g. 11.222.333/0001-81',
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

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const operation = this.getNodeParameter('operation', 0) as Operation;
		const resource = this.getNodeParameter('resource', 0) as Resource;

		for (let i = 0; i < items.length; i++) {
			try {
				if (resource === 'company' && operation === 'get') {
					// ----------------------------------
					//             get
					// ----------------------------------

					const cnpj = this.getNodeParameter('cnpj', i) as string;
					const options = this.getNodeParameter('options', i) as OpenCnpjOptions;

					// Clean and validate CNPJ
					const cleanedCnpj = cleanCnpj(cnpj);
					if (!isValidCnpj(cleanedCnpj)) {
						throw new NodeOperationError(
							this.getNode(),
							`The CNPJ "${cnpj}" in parameter "CNPJ" is not valid`,
							{
								itemIndex: i,
								description: 'Please provide a valid 14-digit Brazilian CNPJ number. You can use formats like "11.222.333/0001-81" or "11222333000181"'
							}
						);
					}

					// Make API request
					const endpoint = `/cnpj/${cleanedCnpj}`;
					const response = await openCnpjApiRequest.call(this, 'GET', endpoint) as CompanyData;

					let responseData: CompanyData | any = response;

					// Apply simplification if requested
					if (options.simplify) {
						responseData = simplifyResponse(response);
					}

					const executionData = this.helpers.constructExecutionMetaData(
						this.helpers.returnJsonArray(responseData),
						{ itemData: { item: i } },
					);
					returnData.push(...executionData);
				}
			} catch (error) {
				if (this.continueOnFail()) {
					const executionData = this.helpers.constructExecutionMetaData(
						[{ json: { error: error.message } }],
						{ itemData: { item: i } },
					);
					returnData.push(...executionData);
					continue;
				}

				// Improve error messages for common HTTP errors
				if (error.response?.status === 404) {
					throw new NodeOperationError(
						this.getNode(),
						`Company with CNPJ "${this.getNodeParameter('cnpj', i)}" was not found`,
						{
							itemIndex: i,
							description: 'Please verify the CNPJ number is correct and the company is registered in Brazil'
						}
					);
				} else if (error.response?.status === 429) {
					throw new NodeOperationError(
						this.getNode(),
						'Too many requests to the OpenCNPJ API',
						{
							itemIndex: i,
							description: 'Please wait a moment before making another request'
						}
					);
				}
				throw error;
			}
		}

		return [returnData];
	}

}
