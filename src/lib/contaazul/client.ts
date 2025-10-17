import { ContaAzulToken, ContaAzulCustomer, ContaAzulProduct, ContaAzulSale } from './types';

export class ContaAzulClient {
  private baseUrl: string;
  private accessToken?: string;

  constructor(baseUrl: string = 'https://api.contaazul.com/v1') {
    this.baseUrl = baseUrl;
  }

  setAccessToken(token: string) {
    this.accessToken = token;
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    if (!this.accessToken) {
      throw new Error('Access token not set');
    }

    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `ContaAzul API error: ${response.status} - ${errorData.message || response.statusText}`
      );
    }

    return response.json();
  }

  // Autenticação OAuth2
  async exchangeCodeForToken(
    code: string,
    clientId: string,
    clientSecret: string,
    redirectUri: string
  ): Promise<ContaAzulToken> {
    const response = await fetch(`${this.baseUrl}/oauth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `Token exchange failed: ${response.status} - ${errorData.error_description || response.statusText}`
      );
    }

    const tokenData = await response.json();
    return {
      ...tokenData,
      expires_at: Date.now() + (tokenData.expires_in * 1000),
    };
  }

  async refreshToken(
    refreshToken: string,
    clientId: string,
    clientSecret: string
  ): Promise<ContaAzulToken> {
    const response = await fetch(`${this.baseUrl}/oauth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: clientId,
        client_secret: clientSecret,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `Token refresh failed: ${response.status} - ${errorData.error_description || response.statusText}`
      );
    }

    const tokenData = await response.json();
    return {
      ...tokenData,
      expires_at: Date.now() + (tokenData.expires_in * 1000),
    };
  }

  // Clientes
  async getCustomers(page: number = 1, limit: number = 50): Promise<{
    data: ContaAzulCustomer[];
    total: number;
    page: number;
    limit: number;
  }> {
    return this.makeRequest(`/customers?page=${page}&limit=${limit}`);
  }

  async getCustomer(customerId: string): Promise<ContaAzulCustomer> {
    return this.makeRequest(`/customers/${customerId}`);
  }

  async createCustomer(customer: Partial<ContaAzulCustomer>): Promise<ContaAzulCustomer> {
    return this.makeRequest('/customers', {
      method: 'POST',
      body: JSON.stringify(customer),
    });
  }

  async updateCustomer(customerId: string, customer: Partial<ContaAzulCustomer>): Promise<ContaAzulCustomer> {
    return this.makeRequest(`/customers/${customerId}`, {
      method: 'PUT',
      body: JSON.stringify(customer),
    });
  }

  // Produtos
  async getProducts(page: number = 1, limit: number = 50): Promise<{
    data: ContaAzulProduct[];
    total: number;
    page: number;
    limit: number;
  }> {
    return this.makeRequest(`/products?page=${page}&limit=${limit}`);
  }

  async getProduct(productId: string): Promise<ContaAzulProduct> {
    return this.makeRequest(`/products/${productId}`);
  }

  async createProduct(product: Partial<ContaAzulProduct>): Promise<ContaAzulProduct> {
    return this.makeRequest('/products', {
      method: 'POST',
      body: JSON.stringify(product),
    });
  }

  async updateProduct(productId: string, product: Partial<ContaAzulProduct>): Promise<ContaAzulProduct> {
    return this.makeRequest(`/products/${productId}`, {
      method: 'PUT',
      body: JSON.stringify(product),
    });
  }

  // Vendas
  async getSales(page: number = 1, limit: number = 50): Promise<{
    data: ContaAzulSale[];
    total: number;
    page: number;
    limit: number;
  }> {
    return this.makeRequest(`/sales?page=${page}&limit=${limit}`);
  }

  async getSale(saleId: string): Promise<ContaAzulSale> {
    return this.makeRequest(`/sales/${saleId}`);
  }

  async createSale(sale: Partial<ContaAzulSale>): Promise<ContaAzulSale> {
    return this.makeRequest('/sales', {
      method: 'POST',
      body: JSON.stringify(sale),
    });
  }

  async updateSale(saleId: string, sale: Partial<ContaAzulSale>): Promise<ContaAzulSale> {
    return this.makeRequest(`/sales/${saleId}`, {
      method: 'PUT',
      body: JSON.stringify(sale),
    });
  }

  // Teste de conectividade
  async testConnection(): Promise<boolean> {
    try {
      await this.makeRequest('/me');
      return true;
    } catch {
      return false;
    }
  }
}
