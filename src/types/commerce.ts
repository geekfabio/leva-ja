export type Merchant = {
  id: string;
  name: string;
  category: string;
  rating: number;
  eta: string;
  image: string;
  accent: string;
};

export type Product = {
  id: string;
  merchantId: string;
  name: string;
  description: string;
  price: number;
  image: string;
  tag?: string;
};

export type CartLine = Product & { quantity: number };
