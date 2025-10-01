import type { INodeProperties } from 'n8n-workflow';

export const operationFields: INodeProperties[] = [
	// ----------------------------------
	//               get
	// ----------------------------------
	{
		displayName: 'CNPJ',
		name: 'cnpj',
		type: 'string',
		displayOptions: {
			show: {
				operation: ['get'],
			},
		},
		default: '',
		required: true,
		placeholder: 'e.g. 11.222.333/0001-81',
		description: 'Brazilian company CNPJ (14 digits, with or without punctuation)',
	},

	// ----------------------------------
	//             options
	// ----------------------------------
	{
		displayName: 'Options',
		name: 'additionalOptions',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
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
];
