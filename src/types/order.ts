export type SortOrder = "asc" | "desc";

export type GetOrdersParams = {
  search?: string;
  status?: string;
  payment?: string;
  shipping?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: SortOrder;
};

export interface Order {
  id: string;
  code: string;
  customerName: string;
  itemCount: number;
  total: number;
  paymentStatus: string;
  orderStatus: string;
  shippingStatus: string;
  createdAt: string;
}
