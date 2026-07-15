import { Orders } from "@/features/orders/orders";

export const revalidate = 0; // ĐỒNG BỘ: Ép buộc Next.js dọn Cache và tải mới dữ liệu thực tế từ Supabase khi F5

export default function Page() {
  return <Orders />;
}
