import z from "zod";

export const recentCustomersSchema = z.object({
  id: z.string(),
  name: z.string(),
  secondaryName: z.string().nullable().optional(), // Tên thật của khách nếu là khách vãng lai
  email: z.string(),
  plan: z.string(),
  status: z.string(),
  billing: z.string(),
  joined: z.string(),
  tier: z.string().optional(), // Phân hạng khách hàng
});

export type RecentCustomerRow = z.infer<typeof recentCustomersSchema>;
