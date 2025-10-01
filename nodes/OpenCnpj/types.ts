export type OpenCnpjCredentials = {
	// No credentials needed for OpenCNPJ API
};

export type GetAdditionalOptions = {
	simplify?: boolean;
};

export type LoadedResource = {
	id: number;
	name: string;
	type?: string;
};

export type CompanyData = {
	cnpj: string;
	razao_social: string;
	nome_fantasia: string;
	situacao_cadastral: string;
	data_situacao_cadastral: string;
	porte: string;
	natureza_juridica: string;
	capital_social: string;
	logradouro: string;
	numero: string;
	complemento: string;
	bairro: string;
	cep: string;
	municipio: string;
	uf: string;
	telefone1: string;
	email: string;
	atividade_principal: Array<{
		codigo: string;
		descricao: string;
	}>;
	data_inicio_atividade: string;
	[key: string]: any;
};

export type SimplifiedCompanyData = {
	cnpj: string;
	razao_social: string;
	nome_fantasia: string;
	situacao_cadastral: string;
	data_situacao_cadastral: string;
	porte: string;
	natureza_juridica: string;
	capital_social: string;
	endereco: {
		logradouro: string;
		numero: string;
		complemento: string;
		bairro: string;
		cep: string;
		municipio: string;
		uf: string;
	};
	telefone: string;
	email: string;
	atividade_principal: Array<{
		codigo: string;
		descricao: string;
	}>;
	data_inicio_atividade: string;
};

export type Operation = 'get';

export type Resource = 'company';