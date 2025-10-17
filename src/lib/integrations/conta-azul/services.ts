const LOG_PREFIX = "[integrations/conta-azul/services]";

import { getContaAzulConfig } from "../conta-azul";

function logDebug(message: string, meta?: Record<string, unknown>) {
  if (process.env.NODE_ENV === "production") return;
  if (meta && Object.keys(meta).length > 0) {
    console.debug(`${LOG_PREFIX} ${message}`, meta);
    return;
  }
  console.debug(`${LOG_PREFIX} ${message}`);
}

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

  logDebug("Fetching Conta Azul services page", {
    page,
    pageSize,
    hasSearch: Boolean(search),
  });

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
    logDebug("Conta Azul returned non-ok status for services", {
      status: response.status,
    });
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

    items.push(...pageItems);

    totalPages = pagination.totalPages ?? totalPages;

    if (totalPages !== null && page >= totalPages) {
      break;
    }

    if (pageItems.length < pageSize) {
      break;
    }

    page += 1;
  }

  if (page > maxPages) {
    logDebug("Reached max pages while fetching Conta Azul services", {
      maxPages,
    });
  }

  return items;
}

