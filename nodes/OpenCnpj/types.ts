export type Operation = 'get';

export type Resource = 'company';

export type OpenCnpjOptions = {
	simplify?: boolean;
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
	atividade_principal: any;
	data_inicio_atividade: string;
};
