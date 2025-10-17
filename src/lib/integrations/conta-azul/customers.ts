const LOG_PREFIX = "[integrations/conta-azul/customers]";

import { getContaAzulConfig } from "../conta-azul";

function logDebug(message: string, meta?: Record<string, unknown>) {
  if (process.env.NODE_ENV === "production") return;
  if (meta && Object.keys(meta).length > 0) {
    console.debug(`${LOG_PREFIX} ${message}`, meta);
    return;
  }
  console.debug(`${LOG_PREFIX} ${message}`);
}

export interface ContaAzulCustomerAddress {
  bairro?: string | null;
  cep?: string | null;
  cidade?: string | null;
  complemento?: string | null;
  estado?: string | null;
  id?: string | null;
  id_cidade?: number | null;
  logradouro?: string | null;
  numero?: string | null;
  pais?: string | null;
}

export interface ContaAzulCustomer {
  id: string;
  nome?: string | null;
  nome_fantasia?: string | null;
  documento?: string | null;
  email?: string | null;
  telefone?: string | null;
  ativo?: boolean | null;
  tipo_pessoa?: string | null;
  endereco?: ContaAzulCustomerAddress | null;
  perfis?: string[] | null;
  [key: string]: unknown;
}

interface ContaAzulCustomersResponse {
  items?: ContaAzulCustomer[];
  totalItems?: number;
}

export interface FetchCustomersOptions {
  page?: number;
  pageSize?: number;
  profile?: string;
  includeAddress?: boolean;
  search?: string;
  signal?: AbortSignal;
}

export async function fetchContaAzulCustomers(
  accessToken: string,
  options: FetchCustomersOptions = {},
) {
  const {
    page = 1,
    pageSize = 100,
    profile = "Cliente",
    includeAddress = true,
    search,
    signal,
  } = options;

  const config = getContaAzulConfig();

  const baseUrl = config.apiBaseUrl.replace(/\/+$/, "");
  const endpoint = new URL("/v1/pessoas", `${baseUrl}/`);
  endpoint.searchParams.set("pagina", String(page));
  endpoint.searchParams.set("tamanho_pagina", String(pageSize));
  endpoint.searchParams.set("tipo_perfil", profile);

  if (includeAddress) {
    endpoint.searchParams.set("com_endereco", "true");
  }
  if (search && search.trim() !== "") {
    endpoint.searchParams.set("busca", search.trim());
  }

  logDebug("Fetching Conta Azul customers page", {
    page,
    pageSize,
    profile,
    includeAddress,
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
    throw new Error("Acesso negado ao recurso de clientes da Conta Azul");
  }

  if (response.status === 429) {
    throw new Error("Limite de requisições da Conta Azul atingido");
  }

  if (!response.ok) {
    logDebug("Conta Azul returned non-ok status", {
      status: response.status,
    });
    throw new Error(
      `Falha ao buscar clientes na Conta Azul (status ${response.status})`,
    );
  }

  const payload = (await response.json()) as ContaAzulCustomersResponse;

  return {
    items: payload.items ?? [],
    totalItems: payload.totalItems ?? null,
  };
}

export interface FetchAllCustomersOptions {
  pageSize?: number;
  profile?: string;
  includeAddress?: boolean;
  maxPages?: number;
  signal?: AbortSignal;
}

export async function fetchAllContaAzulCustomers(
  accessToken: string,
  options: FetchAllCustomersOptions = {},
) {
  const items: ContaAzulCustomer[] = [];
  const pageSize = options.pageSize ?? 100;
  const profile = options.profile ?? "Cliente";
  const includeAddress = options.includeAddress ?? true;
  const maxPages = options.maxPages ?? 50;

  let page = 1;
  let totalItems: number | null = null;

  while (page <= maxPages) {
    const { items: pageItems, totalItems: apiTotal } =
      await fetchContaAzulCustomers(accessToken, {
        page,
        pageSize,
        profile,
        includeAddress,
        signal: options.signal,
      });

    items.push(...pageItems);

    if (apiTotal !== null) {
      totalItems = apiTotal;
    }

    if (pageItems.length < pageSize) {
      break;
    }

    if (totalItems !== null && items.length >= totalItems) {
      break;
    }

    page += 1;
  }

  if (page > maxPages) {
    logDebug("Reached max pages while fetching Conta Azul customers", {
      maxPages,
    });
  }

  return items;
}

