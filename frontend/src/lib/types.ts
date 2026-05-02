export type Product = {
  id: number;
  product_name: string;
  category: string;
  subcategory: string;
  price: number;
  desc: string;
  pub_date: string;
  image: string | null;
};

export type CatalogSection = {
  category: string;
  products: Product[];
};

export type TokenResponse = {
  access: string;
  refresh: string;
  username: string;
};

export type RegisterResponse = {
  detail: string;
  email: string;
  mail_sent: boolean;
  dev_activation_url?: string;
};
