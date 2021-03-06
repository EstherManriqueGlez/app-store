export interface Details {
  orderId: number;
  quantity: number;
  productName: string;
}

export interface Order {
  id: number;
  name: string;
  date: string;
  shippingAddress: string;
  city: string;
  isDelivery: boolean;
}

export interface DetailsOrder {
  details: Details[];
  orderId: number;
}