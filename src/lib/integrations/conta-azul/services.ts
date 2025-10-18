import { getContaAzulConfig } from "../conta-azul";

export interface ContaAzulService {
  id: string;
  id_servico?: number | null;
  id_externo?: string | null;
  codigo?: string | null;
  descricao?: string | null;
  tipo_servico?: string | null;
  status?: string | null;
  preco?: number | null;
  custo?: number | null;
  codigo_cnae?: string | null;
  codigo_municipio_servico?: string | null;
  lei_116?: string | null;
  [key: string]: unknown;
}

interface ContaAzulServicesResponse {
  itens?: ContaAzulService[];
  paginacao?: {
    pagina_atual?: number;
    tamanho_pagina?: number;
    total_paginas?: number;
    total_itens?: number;
  };
}

export interface FetchServicesOptions {
  page?: number;
  pageSize?: number;
  search?: string;
  signal?: AbortSignal;
}

export async function fetchContaAzulServices(
  accessToken: string,
  options: FetchServicesOptions = {},
) {
  const {
    page = 1,
    pageSize = 100,
    search,
    signal,
  } = options;

  const config = getContaAzulConfig();
  const baseUrl = config.apiBaseUrl.replace(/\/+$/, "");
  const endpoint = new URL("/v1/servicos", `${baseUrl}/`);

  endpoint.searchParams.set("pagina", String(page));
  endpoint.searchParams.set("tamanho_pagina", String(pageSize));
  if (search && search.trim() !== "") {
    endpoint.searchParams.set("busca_textual", search.trim());
  }

  const response = await fetch(endpoint, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
      "User-Agent": "Sigelo/ContaAzulIntegration (+https://sigelo.app)",
    },
    cache: "no-store",
    signal,
  });

  if (response.status === 401) {
    throw new Error("Token da Conta Azul expirado ou inválido");
  }

  if (response.status === 403) {
    throw new Error("Acesso negado ao recurso de serviços da Conta Azul");
  }

  if (response.status === 429) {
    throw new Error("Limite de requisições da Conta Azul atingido");
  }

  if (!response.ok) {
    throw new Error(
      `Falha ao buscar serviços na Conta Azul (status ${response.status})`,
    );
  }

  const payload = (await response.json()) as ContaAzulServicesResponse;

  const itens = payload.itens ?? [];
  const paginacao = payload.paginacao ?? {};

  return {
    items: itens,
    pagination: {
      currentPage: paginacao.pagina_atual ?? page,
      pageSize: paginacao.tamanho_pagina ?? pageSize,
      totalPages: paginacao.total_paginas ?? null,
      totalItems: paginacao.total_itens ?? null,
    },
  };
}

export interface FetchAllServicesOptions {
  pageSize?: number;
  search?: string;
  maxPages?: number;
  signal?: AbortSignal;
  serviceTypeFilter?: string | string[];
}

export async function fetchAllContaAzulServices(
  accessToken: string,
  options: FetchAllServicesOptions = {},
) {
  const items: ContaAzulService[] = [];
  const pageSize = options.pageSize ?? 100;
  const maxPages = options.maxPages ?? 50;

  let page = 1;
  let totalPages: number | null = null;

  while (page <= maxPages) {
    const { items: pageItems, pagination } = await fetchContaAzulServices(
      accessToken,
      {
        page,
        pageSize,
        search: options.search,
        signal: options.signal,
      },
    );

    const filteredItems =
      options.serviceTypeFilter === undefined
        ? pageItems
        : pageItems.filter((service) => {
            const value =
              typeof service.tipo_servico === "string"
                ? service.tipo_servico.toUpperCase()
                : null;

            if (!value) return false;

            if (Array.isArray(options.serviceTypeFilter)) {
              return options.serviceTypeFilter
                .map((entry) => entry.toUpperCase())
                .includes(value);
            }

            return value === options.serviceTypeFilter?.toUpperCase();
          });

    items.push(...filteredItems);

    totalPages = pagination.totalPages ?? totalPages;

    if (totalPages !== null && page >= totalPages) {
      break;
    }

    if (pageItems.length < pageSize) {
      break;
    }

    page += 1;
  }

  return items;
}
