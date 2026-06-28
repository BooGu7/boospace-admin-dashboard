# Boospace Admin Dashboard Documentation

> Version: Draft 1.0

## Giới thiệu

Đây là bộ tài liệu tổng hợp cho dự án **Boospace Admin Dashboard**.

## Mục tiêu

-   Xây dựng hệ thống quản trị thương mại điện tử theo phong cách
    Shopify.
-   Sử dụng Next.js App Router.
-   Supabase Auth + Database + Storage.
-   Repository Pattern + Service Layer.
-   Production-ready.

## Kiến trúc

``` text
Browser
   |
Next.js
   |
Server Actions
   |
Service Layer
   |
Repository
   |
Supabase
```

## Module hiện có

-   Dashboard
-   Products
-   Categories
-   Brands
-   Customers
-   Authentication
-   Kanban
-   Tasks

## Quy hoạch Sidebar

### Giữ lại

-   Overview
-   Orders
-   Products
-   Customers
-   Kanban
-   Tasks
-   Settings

### Ẩn

-   Analytics
-   Finance
-   Mail
-   Chat

### Loại bỏ khỏi Sidebar

-   Academy
-   Infrastructure
-   Invoice
-   Logistics
-   Productivity

## Roadmap

### Phase 1

-   Authentication
-   Products
-   Categories
-   Brands

### Phase 2

-   Orders
-   Customers
-   Inventory

### Phase 3

-   Analytics
-   Finance
-   Reviews

### Phase 4

-   Custom 3D

## Ghi chú

Đây là **khung tài liệu đầu tiên**. Phiên bản hoàn chỉnh sẽ được tách
thành nhiều file trong thư mục `docs/` với khoảng 300--500 trang tài
liệu kỹ thuật.
