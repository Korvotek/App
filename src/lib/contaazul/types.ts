// Tipos para integração com ContaAzul API

export interface ContaAzulConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  baseUrl: string;
}

export interface ContaAzulToken {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
  expires_at: number;
}

export interface ContaAzulCustomer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  document?: string;
  address?: {
    street?: string;
    number?: string;
    complement?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
    zipCode?: string;
  };
  created_at: string;
  updated_at: string;
}

export interface ContaAzulProduct {
  id: string;
  name: string;
  description?: string;
  price: number;
  cost?: number;
  sku?: string;
  category?: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ContaAzulSale {
  id: string;
  customer_id: string;
  customer?: ContaAzulCustomer;
  items: Array<{
    product_id: string;
    product?: ContaAzulProduct;
    quantity: number;
    unit_price: number;
    total_price: number;
  }>;
  total_amount: number;
  status: 'draft' | 'pending' | 'paid' | 'cancelled';
  payment_method?: string;
  created_at: string;
  updated_at: string;
}

export interface ContaAzulIntegration {
  id: string;
  tenant_id: string;
  client_id: string;
  client_secret: string;
  access_token?: string;
  refresh_token?: string;
  expires_at?: number;
  scope?: string;
  active: boolean;
  last_sync_at?: string;
  created_at: string;
  updated_at: string;
}

export interface ContaAzulSyncResult {
  success: boolean;
  message: string;
  data?: {
    customers?: number;
    products?: number;
    sales?: number;
  };
  error?: string;
}
