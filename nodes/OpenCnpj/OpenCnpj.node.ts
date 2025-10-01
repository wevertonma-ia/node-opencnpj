import {
	type IExecuteFunctions,
	type INodeExecutionData,
	type INodeType,
	type INodeTypeDescription,
	NodeConnectionTypes,
	NodeOperationError,
} from 'n8n-workflow';

import {
	openCnpjApiRequest,
	cleanCnpj,
	isValidCnpj,
	simplifyResponse,
} from './GenericFunctions';
import { operationFields } from './OperationDescription';
import type {
	GetAdditionalOptions,
	Operation,
	Resource,
	CompanyData,
} from './types';

export class OpenCnpj implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'OpenCNPJ',
		name: 'openCnpj',
		icon: 'file:opencnpj.svg',
		group: ['transform'],
		version: 1,
		description: 'Consult Brazilian company data by CNPJ using OpenCNPJ API',
		subtitle: '={{$parameter["operation"] + ":" + $parameter["resource"]}}',
		defaults: {
			name: 'OpenCNPJ',
		},
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		usableAsTool: true,
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
						description: 'Retrieve Brazilian company data by CNPJ',
						action: 'Get company data',
					},
				],
				default: 'get',
			},
			...operationFields,
		],
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
					const additionalOptions = this.getNodeParameter('additionalOptions', i) as GetAdditionalOptions;

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

					// Create fresh response data object to prevent reference sharing
					let responseData: CompanyData | any = JSON.parse(JSON.stringify(response));

					// Apply simplification if requested
					if (additionalOptions.simplify) {
						responseData = simplifyResponse(responseData);
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
						[{ json: { error: error.message, itemIndex: i, timestamp: Date.now() } }],
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
