import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
} from 'n8n-workflow';

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

		for (let i = 0; i < items.length; i++) {
			try {
				const resource = this.getNodeParameter('resource', i) as string;
				const operation = this.getNodeParameter('operation', i) as string;

				if (resource === 'company' && operation === 'get') {
					const cnpj = this.getNodeParameter('cnpj', i) as string;
					const options = this.getNodeParameter('options', i) as { simplify?: boolean };

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
					const response = await this.helpers.httpRequest({
						method: 'GET',
						url: `https://publica.cnpj.ws/cnpj/${cleanedCnpj}`,
						headers: {
							'Accept': 'application/json',
							'User-Agent': 'n8n-nodes-opencnpj/1.0.0',
						},
						json: true,
					});

					let responseData = response;

					// Apply simplification if requested
					if (options.simplify) {
						responseData = simplifyResponse(response);
					}

					returnData.push({
						json: responseData,
						pairedItem: { item: i },
					});
				}
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: { error: error.message },
						pairedItem: { item: i },
					});
				} else {
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
		}

		return [returnData];
	}

}

function cleanCnpj(cnpj: string): string {
	// Remove all non-numeric characters
	return cnpj.replace(/\D/g, '');
}

function isValidCnpj(cnpj: string): boolean {
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

function simplifyResponse(response: any): any {
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
