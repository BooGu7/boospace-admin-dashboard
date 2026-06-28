# Database Design

## Mục tiêu

Thiết kế cơ sở dữ liệu tối ưu cho Boospace Admin sử dụng Supabase
PostgreSQL.

## Bảng chính

-   products
-   categories
-   brands
-   customers
-   orders
-   order_items
-   product_images

## Quan hệ

categories 1---\* products

brands 1---\* products

orders 1---\* order_items

products 1---\* order_items

customers 1---\* orders

## Quy ước

-   UUID làm khóa chính
-   created_at, updated_at
-   soft delete khi cần
-   snake_case cho cột
-   index cho slug, email, status

## RLS

-   Admin toàn quyền
-   Customer chỉ xem dữ liệu của mình

## Migration

-   Mỗi thay đổi DB phải có migration.
