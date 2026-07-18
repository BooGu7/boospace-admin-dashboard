# QUY TẮC VIẾT CODE (RULE CODING) - BOOSPACE ADMIN

Tài liệu này quy định các tiêu chuẩn bắt buộc về thiết kế kiến trúc, nguyên tắc quản lý dữ liệu, kiểm soát bảo mật Supabase, chuẩn hóa TypeScript và quy trình xử lý giao diện đối với hệ thống BooSpace Admin Dashboard.

---

## 1. Nguyên tắc Phản hồi & DX (Developer Experience)

- **Ngắn gọn, trực diện**: Đi thẳng vào nguyên nhân lỗi, chỉ rõ tệp tin và dòng code phát sinh vấn đề, đưa ra giải pháp kỹ thuật ngay lập tức. Tránh giải thích lý thuyết dài dòng.
- **Viết Full Code**: Luôn cung cấp mã nguồn đầy đủ của tệp tin sau khi chỉnh sửa. Tuyệt đối không viết tắt, không sử dụng các dòng chú thích chờ (`// ...`). Mã nguồn cung cấp phải ở trạng thái sẵn sàng để sao chép và dán đè (copy-paste) là chạy được ngay.
- **Chủ động đề xuất**: Luôn xem xét và chủ động đưa ra các giải pháp tối ưu hóa hiệu năng hoặc nâng cấp trải nghiệm người dùng (UX) khi phát hiện các điểm nghẽn logic.

---

## 2. Triết lý Quản lý Dữ liệu tuyệt đối (Supabase Only - Zero In-Code Mock Data)

- **Tuyệt đối không lưu dữ liệu giả lập trong code**: Không khai báo các mảng dữ liệu mẫu, dữ liệu cứng hoặc mảng dự phòng tĩnh (như `MOCK_ORDERS`, `MOCK_TASKS`, `MOCK_USERS`) bên trong bất kỳ tệp tin Next.js nào.
- **Dữ liệu hoàn toàn trên Supabase**: Mọi dữ liệu hiển thị trên giao diện bắt buộc phải được truy vấn động thời gian thực từ cơ sở dữ liệu Supabase.
- **Khởi tạo dữ liệu mẫu bằng SQL Editor**: Trong quá trình thiết kế hoặc phát triển tính năng, nếu yêu cầu nạp dữ liệu mẫu để kiểm thử, AI bắt buộc phải cung cấp **kịch bản SQL (`INSERT INTO...`)** để Boo Space tự nạp trực tiếp qua Supabase SQL Editor. Tuyệt đối không viết hàm tự động sinh dữ liệu mẫu (Auto-Seeding) chạy trong mã nguồn Next.js.

---

## 3. Kiến trúc Next.js App Router & React 19

- **Server Component làm gốc**: Giữ các trang chính và trang chi tiết (`page.tsx`) là async Server Component để truy vấn dữ liệu trực tiếp từ Repositories, bảo mật thông tin kết nối và tránh lỗi biên dịch `next/headers`.
- **Vận hành qua Server Actions**: Sử dụng các Server Actions đặt trong thư mục `src/actions/` để thao tác cập nhật dữ liệu. Luôn gọi hàm `revalidatePath(path)` trước khi trả về kết quả để tự động dọn cache tĩnh Next.js và làm mới trang bưu cục.
- **Kiểu trả về của Form Action trong React 19**:
  - Thuộc tính `action` của thẻ HTML `<form>` chỉ chấp nhận các hàm có kiểu trả về rỗng (`void` hoặc `Promise<void>`).
  - Không gán trực tiếp các Server Actions trả về đối tượng `{ success, error }` vào thuộc tính `action` của `<form>`. Hãy bọc chúng qua các hàm trung gian (wrappers) trả về rỗng trên máy chủ:
    ```typescript
    const handleActionWrapper = async () => {
      "use server";
      await serverAction(data.id);
    };
    ```
- **Hạn chế Client Component**: Chỉ khai báo chỉ thị `"use client"` cho các thành phần giao diện nhỏ cần tương tác động (như kéo thả Kanban, Dialog Modal, Switch Toggle, hoặc ô tìm kiếm lọc thời gian thực).
- **Đồng bộ thư viện**: Chỉ sử dụng các biểu tượng (icons) có sẵn trong thư viện `lucide-react`, loại bỏ hoàn toàn các thư viện ngoài chưa cài đặt để tránh lỗi biên dịch.

---

## 4. Tiêu chuẩn TypeScript & Biome Linter

- **Kiểu dữ liệu chặt chẽ (Strict Typing)**: Định nghĩa đầy đủ kiểu dữ liệu cho toàn bộ các biến, tham số hàm. Tuyệt đối không gán mảng rỗng `[]` tự suy luận kiểu `never[]` gây lỗi kiểm duyệt kiểu tĩnh khi đóng gói sản phẩm (`build`). Định nghĩa đầy đủ `SortingState`, `ColumnFiltersState` cho bảng.
- **Lập chỉ mục động an toàn (Dynamic Indexing)**: Khi xử lý dữ liệu của các bảng có cấu trúc cột động tải từ database (như bảng Kanban), hãy định nghĩa kiểu dữ liệu dạng bản ghi chuỗi động để tránh lỗi biên dịch:
  ```typescript
  export type BoardState = Record<string, Task[]>;
  ```
- **Tối ưu hóa Avatar từ mạng xã hội ngoài**: Sử dụng thẻ ảnh tiêu chuẩn **`<img>`** cho các khung ảnh đại diện (Avatar) nhỏ nạp từ Google Auth (`lh3.googleusercontent.com`) hoặc Facebook. Việc này giúp bypass hoàn toàn lỗi chặn tên miền ngoài của Next.js (`unconfigured host on next/image`) mà không buộc người dùng phải sửa tệp cấu hình `next.config.mjs` thủ công.
- **Tham chiếu tĩnh**: Bọc các hàm callback truyền vào mảng phụ thuộc của React Hooks bằng `React.useCallback`.

---

## 5. Quản lý Cache & Phiên đăng nhập (Caching & Persistence)

- **Khử cache tĩnh Next.js**: Luôn khai báo chỉ thị **`export const revalidate = 0;`** trực tiếp trên đầu các trang danh sách hoặc chi tiết nạp dữ liệu Supabase để buộc máy chủ Next.js dọn dẹp cache và tải mới dữ liệu thực tế mỗi khi F5 làm mới trình duyệt.
- **Phiên đăng nhập bên ngoài (OAuth Persistence)**: Lưu trữ Access Token của các API bên ngoài (như Gmail API, Meta API) vào `localStorage` của máy khách để duy trì phiên đăng nhập bền bỉ, tránh gây ra luồng lặp tải lại trang (iframe loops).
