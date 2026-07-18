# Hệ thống Quản trị Doanh nghiệp & Vận hành Xưởng in 3D BooSpace

**BooSpace Admin** là hệ thống quản trị ERP/CRM chuyên biệt được thiết kế và tối ưu hóa riêng cho quy trình quản lý đơn hàng, hạch toán tài chính và giám sát dây chuyền in 3D/chế tác DIY. Hệ thống được phát triển trên nền tảng Next.js 16 (App Router), Tailwind CSS v4, Shadcn UI kết hợp cơ sở dữ liệu thời gian thực **Supabase (Database, Auth, Storage)** và các dịch vụ tự động hóa cổng ngoài.

---

## I. Công nghệ sử dụng & DX (Tech Stack)

- **Framework**: Next.js 16 (App Router), TypeScript, Tailwind CSS v4
- **UI Components**: Shadcn UI (Radix Primitives)
- **Cơ sở dữ liệu & Xác thực**: Supabase (Database, Auth, Storage)
- **Gửi Email tự động**: Resend Email API
- **Thanh toán ngân hàng**: VietQR API (MB Bank)
- **Đồng bộ hòm thư**: Google Gmail API (OAuth 2.0 Implicit Flow)
- **Quản lý trạng thái**: Zustand & React Transition
- **Linter & Formatter**: Biome (Sạch bóng 100% cảnh báo biên dịch)

---

## II. Sơ đồ Thiết kế Cơ sở dữ liệu Supabase (Database Schema)

Dưới đây là cấu trúc chi tiết các bảng vật lý đang vận hành hệ thống của bạn trên Supabase:

### 1. Bảng `profiles` (Thông tin thành viên & Khách hàng)

Lưu trữ thông tin người dùng được liên kết tự động khi phát sinh đơn hàng hoặc đăng ký tài khoản.

- `id` (uuid, Khóa chính)
- `first_name` (text, cho phép null)
- `last_name` (text, cho phép null)
- `name` (text, cho phép null)
- `email` (text, duy nhất)
- `phone` (text, cho phép null)
- `avatar_url` (text, cho phép null)
- `role` (text, cho phép null) - 'user' | 'admin'
- `active` (bool, cho phép null)
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

### 2. Bảng `orders` (Đơn hàng thương mại)

Quản lý vòng đời đơn hàng, bưu tá vận chuyển và hạch toán dòng tiền.

- `id` (uuid, Khóa chính)
- `code` (text, duy nhất) - Mã đơn hàng (Ví dụ: `BOO-14550`)
- `customer_id` (uuid, liên kết sang profiles.id)
- `customer_name` (text)
- `customer_email` (text)
- `customer_phone` (text)
- `notes` (text, ghi chú kỹ thuật in 3D của khách)
- `total` (numeric, tổng thanh toán sau chiết khấu và phí bưu tá)
- `order_status` (text) - 'Pending' | 'Confirmed' | 'Shipped' | 'Delivered' | 'Cancelled'
- `payment_status` (text) - 'Pending' | 'Paid' | 'Refunded'
- `shipping_status` (text) - 'Unshipped' | 'Shipping' | 'Delivered'
- `applied_coupon_id` (uuid, liên kết coupons.id)
- `created_at` (timestamptz)

### 3. Bảng `order_items` (Chi tiết vật phẩm đơn hàng)

- `id` (uuid, Khóa chính)
- `order_id` (uuid, liên kết orders.id)
- `product_id` (uuid, liên kết products.id)
- `quantity` (int4, số lượng đặt mua)
- `price` (numeric, tổng giá dòng)
- `unit_price` (numeric, đơn giá sản phẩm)
- `total_price` (numeric, thành tiền)

### 4. Bảng `products` (Kho sản phẩm & phôi in)

- `id` (uuid, Khóa chính)
- `category_id` (uuid, liên kết categories.id)
- `brand_id` (uuid, liên kết brands.id)
- `name` (text, tên sản phẩm)
- `slug` (text, duy nhất)
- `sku` (text, mã định danh kho)
- `price` (numeric, giá bán)
- `compare_price` (numeric, giá gốc chưa giảm)
- `cost_price` (numeric, giá vốn sợi nhựa/máy in)
- `stock` (int4, tồn kho khả dụng)
- `images` (mảng text, chứa danh sách URL hình ảnh)
- `published` (bool, trạng thái công khai trên Web Store)
- `featured` (bool, trạng thái ghim nổi bật)
- `attributes` (jsonb, chứa các thuộc tính in như Infill, Layer Height, Filament)
- `created_at` / `updated_at` (timestamptz)

### 5. Bảng `coupons` (Mã giảm giá thời hạn)

- `id` (uuid, Khóa chính)
- `code` (text, duy nhất)
- `discount_percent` (int4, tỷ lệ % chiết khấu)
- `active` (bool, kích hoạt sử dụng)
- `description` (text, ghi chú sự kiện áp dụng mã)
- `start_date` (timestamptz, ngày bắt đầu áp dụng)
- `end_date` (timestamptz, ngày kết thúc kỳ hạn)
- `created_at` (timestamptz)

### 6. Bảng `kanban_columns` (Mục công đoạn sản xuất)

- `id` (text, Khóa chính) - Khóa cột (ideas, planned, building, qa, shipped)
- `title` (text) - Tên công đoạn Việt hóa (Ý tưởng in, Lên lịch in, Đang in 3D, Kiểm định phôi, Đã bàn giao)
- `position` (int4, thứ tự sắp xếp cột)

### 7. Bảng `kanban_tasks` (Nhiệm vụ xưởng in)

- `id` (uuid, Khóa chính)
- `title` (text, tên công việc chế tác)
- `description` (text, mô tả kỹ thuật chi tiết)
- `priority` (text) - 'High' | 'Medium' | 'Low'
- `due_date` (text, nhãn hiển thị ngày giới hạn)
- `progress` (int4, tiến độ in 3D thực tế)
- `column_id` (text, liên kết sang kanban_columns.id)
- `team` (text, nhóm phụ trách)
- `owner_name` (text, tên thợ in)
- `owner_tone` (text, màu sắc avatar thợ in)
- `start_date` (date, ngày bắt đầu in)
- `end_date` (date, ngày kết thúc và bàn giao)
- `archived` (bool, trạng thái đưa vào kho lưu trữ)
- `created_at` (timestamptz)

### 8. Bảng `kanban_comments` (Lịch sử thảo luận nhiệm vụ)

- `id` (uuid, Khóa chính)
- `task_id` (uuid, liên kết kanban_tasks.id)
- `author_name` (text, tên thợ bình luận)
- `content` (text, nội dung trao đổi kỹ thuật)
- `created_at` (timestamptz)

### 9. Bảng `kanban_attachments` (Tệp đính kèm phôi in)

- `id` (uuid, Khóa chính)
- `task_id` (uuid, liên kết kanban_tasks.id)
- `name` (text, tên tệp phôi in `.stl` hoặc file `.gcode`)
- `url` (text, đường dẫn tải file thực tế từ Supabase Storage)
- `size` (text, dung lượng file)
- `created_at` (timestamptz)

---

## III. Các phân hệ đã hoàn thiện (Hiện tại đã làm)

### 1. Phân hệ Bảng kéo thả Kanban sản xuất (`/dashboard/kanban`)

- **Dây chuyền in 3D động**: Công đoạn in tải trực tiếp từ bảng `kanban_columns` trên Supabase. Cho phép thêm công đoạn in mới, hoặc Xóa công đoạn trực tiếp thông qua menu ba chấm `...` ở đầu mỗi cột bưu tá.
- **Tương tác kéo thả thời gian thực**: Khi bưu tá di chuyển thẻ Card, hệ thống gọi Server Action cập nhật vị trí mới thẳng lên Supabase và tự động tối ưu hóa thanh tiến độ `%` (Về 0% khi ở cột ý tưởng, lên 100% khi kéo sang cột Đã bàn giao).
- **Hộp thảo luận & Lưu trữ tệp G-code/STL thật**:
  - Tích hợp bộ tải file trực tiếp lên **Supabase Storage Public Bucket** (`kanban_attachments`). Cho phép bấm đính kèm tệp tin phôi in thật để kỹ thuật viên tải về chế tác.
  - Đồng bộ lịch sử bình luận động nạp từ bảng `kanban_comments`.
- **Hộp chỉnh sửa Task chi tiết**: Cho phép nhấp bút chì chỉnh sửa Tiêu đề, Ghi chú, thay đổi mốc ngày bắt đầu và kết thúc bằng Date Picker, thay đổi mức độ ưu tiên.
- **Thống kê và Kho lưu trữ (Notion-style)**: Nút **Lưu trữ** trên Toolbar dọn dẹp các đơn hoàn thành đưa vào kho lưu trữ riêng biệt để giữ bảng sạch sẽ, hỗ trợ khôi phục và xóa vĩnh viễn đơn cũ.
- **Giao diện Danh sách dọc gọn gàng**: Căn chỉnh chiều cao và kích thước đệm khít khao giúp hiển thị tổng quan tối ưu.

### 2. Phân hệ Đơn hàng thương mại (`/dashboard/orders` & `/dashboard/orders/[id]`)

- **Căn chỉnh 9 cột chuẩn hóa**: Di chuyển cột Ngày tạo lên cột thứ 2, bổ sung SĐT và Địa chỉ giao hàng trực tiếp hiển thị bỏ qua cấu hình ẩn cookie cũ bằng cài đặt `enableHiding: false`.
- **Duyệt đơn nhanh**: Nút "Xác nhận & Gửi Mail" duyệt nhanh và gọi Resend tự động hóa gửi email hóa đơn.
- **Xác nhận xóa Dialog mẫu**: Nút xóa đơn hàng bọc hoàn toàn bằng bộ khung `AlertDialog` quản lý đóng mở bằng `useState` và kịch bản `useTransition` chống đóng nhầm.
- **Cổng quản lý vòng đời bưu bưu tá**: Nút bấm "Xác nhận đã nhận tiền (Paid)", "Bàn giao bưu tá vận chuyển", "Xác nhận đã giao thành công" và "Hủy đơn hàng" tự động thay đổi nhãn vận chuyển và **khóa cứng khi đơn đã bị hủy**.
- **Hạch toán Tự phục hồi (Self-Healing)**: Khi mở chi tiết đơn hàng lệch số liệu tiền gộp cũ, hệ thống tự động cập nhật lại tổng số tiền chuẩn xác (`Vật phẩm + Phí ship - Khuyến mãi`) đè lên Supabase để bảng chính đồng bộ.
- **Trục thời gian hành trình 2 cột**: Đưa mốc mốc thời gian chi tiết (Giờ:Phút - Ngày/Tháng) ra cột bên trái, hiển thị các bong bóng sự kiện bám sát vòng đời đơn.

### 3. Phân hệ Tài chính xưởng (`/dashboard/finance`)

- **Đồng bộ dòng tiền**: Nạp dòng tiền tổng thanh toán thật từ Supabase.
- **Cấu hình Gateways**: Toàn bộ STK VietQR MB Bank, ví MoMo, PayPal được cấu hình linh hoạt từ xa thông qua Dialog Settings lưu trữ trên Supabase.
- **VietQR API Quốc gia**: Tự gen mã ảnh QR nhận tiền chuẩn ngân hàng Mb Bank động theo số TK bạn cấu hình.

---

## IV. Lộ trình phát triển trong tương lai (Tương lai phát triển)

Để nâng cấp BooSpace Admin thành hệ thống nhà máy in 3D và DIY thông minh, dưới đây là định hướng các phân hệ công nghệ mở rộng:

### Giai đoạn 1: Tự động trừ kho sợi nhựa (Inventory Auto-Deduct)

- **Ý tưởng**: Khi một nhiệm vụ in chuyển sang trạng thái hoàn thành hoặc đơn hàng được giao thành công, hệ thống tự động khấu trừ số lượng sợi nhựa khả dụng trong bảng `products.stock`.
- **Triển khai**: Thêm trường `weight_grams` vào sản phẩm. Viết trigger trong database hoặc Server Action để tự động trừ kho vật liệu nhựa (PLA/PETG) tương ứng của xưởng khi đơn bưu cục chuyển giao.

### Giai đoạn 2: Tích hợp Đọc file G-code (G-code Slicer Reader)

- **Ý tưởng**: Kỹ thuật viên khi đính kèm file cắt lớp `.gcode` vào hộp thoại Kanban, hệ thống tự động phân tích file để bóc tách thời gian in dự kiến và khối lượng nhựa tiêu hao thật nhằm tự hạch toán giá vốn (COGS) chính xác từng đồng xu.
- **Triển khai**: Viết thư viện Javascript Parser phân tích chú thích file in 3D tiêu chuẩn của Cura/PrusaSlicer.

### Giai đoạn 3: Giám sát Máy in 3D thời gian thực (Bambu Lab Cluster)

- **Ý tưởng**: Livestream camera giám sát trực tiếp từ các dòng máy in chuyên dụng (Bambu Lab X1C, Creality) hiển thị trực tiếp vào trang Lịch trình xưởng (`/dashboard/calendar`) hoặc cột `building` của Kanban.
- **Triển khai**: Kết nối thông qua giao thức WebRTC/RTSP stream và tích hợp bộ lắng nghe MQTT để nhận trạng thái nhiệt độ đầu đùn, vẽ tiến độ % in thật theo máy in vật lý bên ngoài.

### Giai đoạn 4: Đồng bộ tin nhắn Meta Suite Facebook/Instagram thật

- **Ý tưởng**: Kích hoạt cổng xác thực Webhook của Meta Business để nạp trực tiếp toàn bộ hội thoại chat của khách sắm hỏi mua phôi tượng trên Fanpage Facebook/Instagram về trong trang `/dashboard/chat` giúp bạn trả lời khách tập trung một nơi.

---

## V. Hướng dẫn Khởi chạy cục bộ

1. **Cấu hình tệp tin môi trường `.env.local`** tại thư mục gốc:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://amukhgkamrokbbcjgusf.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5c...
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5c...
   RESEND_API_KEY=re_3cz1Z9tS_FQtmoNAQAF7STG1XrCH3mwHA
   ```
