---

## I. Trạng thái Biên dịch & DX (Build & Lint Status)

- **Máy chủ phát triển (`pnpm dev`)**: Hoạt động ổn định, nạp nóng giao diện nhanh nhờ cấu hình Next.js 16 (Turbopack).
- **Trình linter Biome**: Dọn sạch hoàn toàn các cảnh báo dư thừa và tự động định dạng mã nguồn chuẩn hóa.
- **Đóng gói sản phẩm (`pnpm build`)**: Vượt qua tất cả các bộ lọc kiểm tra kiểu tĩnh khắt khe của TypeScript và React 19, biên dịch thành công 100% ra các trang tĩnh/động mà không gặp bất kỳ lỗi crash nào.

---

## II. Bản đồ đồng bộ hóa các Tệp tin chính (File Matrix)

Dưới đây là danh sách các tệp tin cốt lõi đã được xây dựng lại hoàn chỉnh để kết nối trực tiếp với cơ sở dữ liệu Supabase:

### 1. Phân hệ Khách hàng & Thành viên (`/dashboard/users`)

- **`src/actions/user.actions.ts`**: Xử lý nạp danh sách, tự động đồng bộ hóa email khách mua hàng vãng lai thành Profile thành viên, giải mã đối tượng JSONB `data` để lấy Tên/SĐT, và xử lý khóa tài khoản qua `toggleUserBlockAction`.
- **`src/app/(main)/dashboard/users/page.tsx`**: Server Component nạp dữ liệu động từ máy chủ, kiểm tra bảo mật session và khử cache Next.js bằng `revalidate = 0`.
- **`src/app/(main)/dashboard/users/_components/users.tsx`**: Client Component bọc ô tìm kiếm nhanh, lọc theo phân hạng (Bronze, Silver, Gold, Platinum) và lọc theo trạng thái (Đã đăng ký, Khách vãng lai). Gỡ bỏ hoàn toàn nút CSV dư thừa.
- **`src/app/(main)/dashboard/users/_components/users-columns.tsx`**: Định nghĩa 9 cột hiển thị chi tiết. Sử dụng thẻ ảnh `<img>` tiêu chuẩn cho avatar của người dùng để tránh lỗi chặn tên miền và hiển thị nhãn khóa tài khoản.
- **`src/app/(main)/dashboard/users/_components/users-table.tsx`**: Render bảng dữ liệu và bọc **Notion-style Timeline Dialog** hiển thị chi tiết lịch sử mua hàng, đính kèm cả **Địa chỉ bưu cục** và **Phương thức thanh toán** của từng đơn hàng.

### 2. Phân hệ Đơn hàng thương mại (`/dashboard/orders`)

- **`src/actions/order.actions.ts`**: Xử lý phê duyệt đơn, gửi email bọc try/catch chống sập ứng dụng qua Resend, xác nhận đã thanh toán (Paid), bàn giao bưu tá vận chuyển và giao thành công.
- **`src/lib/repositories/order.repository.ts`**: Đọc dữ liệu thật từ bảng `orders` của Supabase, tự động ánh xạ cột `payment_method` sang đối tượng `paymentMethod` và chứa mảng dữ liệu dự phòng.
- **`src/app/(main)/dashboard/orders/[id]/page.tsx`**: Server Component hiển thị chi tiết hóa đơn. Chứa thuật toán **Tự phục hồi dữ liệu sai lệch (Database Self-Healing)** tự sửa tiền đơn hàng và trục thời gian Timeline 2 cột đối xứng.
- **`src/features/orders/orders.tsx`**: Giao diện chính bọc bảng dữ liệu orders nạp Supabase.
- **`src/features/orders/_components/orders-table.tsx`**: Tích hợp bộ phân trang cục bộ (Inline Pagination) hoàn toàn độc lập giúp dọn sạch lỗi type import.
- **`src/features/orders/_components/columns.tsx`**: Cấu hình 9 cột giao dịch (Ngày tạo đưa lên cột thứ 2, hiển thị Số điện thoại và Địa chỉ giao nhận thực tế).
- **`src/features/orders/_components/delete-order.tsx`**: Hộp thoại cảnh báo xóa đơn hàng chuẩn mẫu xác nhận `AlertDialog` của Shadcn UI.
- **`src/features/orders/_components/toolbar.tsx`**: Chứa nút Làm mới hoạt động thực tế gọi lệnh `router.refresh()` và thay thế `Cross2Icon` lỗi bằng icon `X` của Lucide.

### 3. Phân hệ Bảng kéo thả Kanban sản xuất (`/dashboard/kanban`)

- **`src/actions/kanban.actions.ts`**: Xử lý cập nhật cột khi kéo thả, tạo nhiệm vụ in 3D mới, xóa nhiệm vụ, lưu trữ nhiệm vụ (`archive`) và nạp nhanh mẫu chế tác/bảo dưỡng máy in.
- **`src/app/(main)/dashboard/kanban/page.tsx`**: Server Component tải các cột động từ `kanban_columns`, nạp các bưu tá đơn từ `kanban_tasks` và chứa cơ chế tự tạo phôi dữ liệu mẫu nếu database trống.
- **`src/app/(main)/dashboard/kanban/_components/types.ts`**: Tối ưu hóa kiểu dữ liệu lập chỉ mục động `BoardState` dạng `Record<string, Task[]>` giúp dọn sạch lỗi TypeScript tĩnh khi build.
- **`src/app/(main)/dashboard/kanban/_components/kanban.tsx`**: Chứa bộ xử lý kéo thả của `@dnd-kit`, bọc các mốc thời gian Từ ngày - Đến ngày và tích hợp thêm **Tab thứ 4: Kho lưu trữ (Archive Bin)** độc lập kèm nút khôi phục bưu bưu tá.
- **`src/app/(main)/dashboard/kanban/_components/task-card.tsx`**: Hiển thị song song Ngày bắt đầu - Ngày kết thúc, tích hợp nút xóa nhanh (Thùng rác đỏ) khi hover và cổng đính kèm file phôi in trực tiếp lên **Supabase Storage**.
- **`src/app/(main)/dashboard/kanban/_components/kanban-column.tsx`**: Bọc nút cộng `+` thêm việc nhanh đầu cột và menu xóa cột công đoạn.
- **`src/app/(main)/dashboard/kanban/_components/utils.ts`**: Sửa sạch lỗi ép kiểu của hàm kiểm tra `isColumnId` và tìm kiếm task.

### 4. Phân hệ Tài chính (`/dashboard/finance`)

- **`src/actions/finance.actions.ts`**: Đọc/ghi cấu hình ví Mb Bank, MoMo, PayPal và đơn giá duy trì server cloud.
- **`src/app/(main)/dashboard/finance/_components/finance-toolbar-actions.tsx`**: Khử sạch lỗi biên dịch bằng việc dọn thuộc tính `size="sm"` sai kiểu trên các thẻ `<Input>`.
- **`src/app/(main)/dashboard/finance/_components/quick-actions.tsx`**: Tối ưu hóa nạp ảnh mã QR nhận tiền động bằng thẻ `<Image />` đăng ký host an toàn.

---

## III. Hướng dẫn Bảo trì Cơ sở dữ liệu Supabase định kỳ

Để khôi phục hoặc dọn dẹp môi trường thử nghiệm của bạn về trạng thái sạch sẽ nhất:

1.  **Làm sạch dữ liệu cũ**: Chạy kịch bản SQL dọn dẹp theo đúng thứ tự phân cấp:
    ```sql
    DELETE FROM public.order_items;
    DELETE FROM public.reviews;
    DELETE FROM public.orders;
    DELETE FROM public.products;
    DELETE FROM public.users;
    ```
2.  **Kích hoạt bảo mật an toàn**: Đảm bảo RLS đã được bật và nạp đầy đủ các chính sách mở cho ứng dụng:
    ```sql
    ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.kanban_tasks ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "Allow all actions for coupons" ON public.coupons FOR ALL USING (true) WITH CHECK (true);
    CREATE POLICY "Allow all actions for kanban_tasks" ON public.kanban_tasks FOR ALL USING (true) WITH CHECK (true);
    ```
