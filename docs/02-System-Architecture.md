# System Architecture

``` text
Browser
  ↓
Next.js App Router
  ↓
Server Actions
  ↓
Service Layer
  ↓
Repository Layer
  ↓
Supabase
```

## Nguyên tắc

-   UI không truy cập DB trực tiếp.
-   Repository chỉ thao tác dữ liệu.
-   Service xử lý business logic.
