import {
  BadgePercent, // Thêm icon Mã giảm giá
  Banknote,
  Boxes, // Thêm icon Tồn kho
  Building2,
  Calendar,
  ChartBar,
  CheckSquare,
  FolderTree,
  Forklift,
  Gauge,
  Kanban,
  LayoutDashboard,
  ListTodo,
  type LucideIcon,
  Mail,
  MessageSquare,
  Package,
  ReceiptText,
  ShoppingBag,
  Users,
} from "lucide-react";

export type NavBadge = "new" | "soon";

export interface NavSubItem {
  id: string;
  title: string;
  url: string;
  icon?: LucideIcon;
  badge?: NavBadge;
  disabled?: boolean;
  newTab?: boolean;
}

interface NavItemBase {
  id: string;
  title: string;
  icon?: LucideIcon;
  badge?: NavBadge;
  disabled?: boolean;
  newTab?: boolean;
}

export interface NavMainLinkItem extends NavItemBase {
  url: string;
  subItems?: never;
}

export interface NavMainParentItem extends NavItemBase {
  subItems: NavSubItem[];
}

export type NavMainItem = NavMainLinkItem | NavMainParentItem;

export interface NavGroup {
  id: number;
  label?: string;
  items: NavMainItem[];
}

export const sidebarItems: NavGroup[] = [
  // ==========================================================
  // BẢNG ĐIỀU KHIỂN (DASHBOARD)
  // ==========================================================
  {
    id: 1,
    label: "Bảng điều khiển",
    items: [
      {
        id: "overview",
        title: "Tổng quan",
        url: "/dashboard/default",
        icon: LayoutDashboard,
      },
      {
        id: "ecommerce",
        title: "Thương mại",
        url: "/dashboard/ecommerce",
        icon: ShoppingBag,
      },
      {
        id: "analytics",
        title: "Phân tích truy cập",
        url: "/dashboard/analytics",
        icon: Gauge,
      },
      {
        id: "finance",
        title: "Tài chính",
        url: "/dashboard/finance",
        icon: Banknote,
      },
    ],
  },

  // ==========================================================
  // BÁN HÀNG & KHUYẾN MÃI (SALES)
  // ==========================================================
  {
    id: 2,
    label: "Kinh doanh",
    items: [
      {
        id: "orders",
        title: "Đơn hàng",
        url: "/dashboard/orders",
        icon: ReceiptText,
        badge: "new",
      },
      {
        id: "coupons",
        title: "Mã giảm giá (Coupons)",
        url: "/dashboard/coupons",
        icon: BadgePercent,
      },
    ],
  },

  // ==========================================================
  // DANH MỤC & KHO HÀNG (CATALOG)
  // ==========================================================
  {
    id: 3,
    label: "Danh mục",
    items: [
      {
        id: "catalog",
        title: "Phân loại kho",
        icon: Package,
        subItems: [
          {
            id: "products",
            title: "Sản phẩm",
            url: "/dashboard/products",
            icon: Package,
          },
          {
            id: "inventory",
            title: "Tồn kho xưởng in",
            url: "/dashboard/inventory",
            icon: Boxes,
          },
          {
            id: "categories",
            title: "Nhóm danh mục",
            url: "/dashboard/categories",
            icon: FolderTree,
          },
          {
            id: "brands",
            title: "Thương hiệu",
            url: "/dashboard/brands",
            icon: Building2,
          },
        ],
      },
    ],
  },

  // ==========================================================
  // KHÁCH HÀNG (CUSTOMERS)
  // ==========================================================
  {
    id: 4,
    label: "Khách hàng",
    items: [
      {
        id: "users",
        title: "Thành viên",
        url: "/dashboard/users",
        icon: Users,
      },
      {
        id: "crm",
        title: "Quản lý cơ hội (CRM)",
        url: "/dashboard/crm",
        icon: ChartBar,
      },
    ],
  },

  // ==========================================================
  // VẬN HÀNH (OPERATIONS)
  // ==========================================================
  {
    id: 5,
    label: "Vận hành",
    items: [
      {
        id: "logistics",
        title: "Vận chuyển",
        url: "/dashboard/logistics",
        icon: Forklift,
      },
      {
        id: "calendar",
        title: "Lịch trình xưởng",
        url: "/dashboard/calendar",
        icon: Calendar,
      },
      {
        id: "kanban",
        title: "Bảng kéo thả (Kanban)",
        url: "/dashboard/kanban",
        icon: Kanban,
      },
      {
        id: "tasks",
        title: "Nhiệm vụ",
        url: "/dashboard/tasks",
        icon: CheckSquare,
        badge: "new",
      },
      {
        id: "productivity",
        title: "Hiệu suất công việc",
        url: "/dashboard/productivity",
        icon: ListTodo,
      },
    ],
  },

  // ==========================================================
  // TƯƠNG TÁC (COMMUNICATION)
  // ==========================================================
  {
    id: 6,
    label: "Tương tác",
    items: [
      {
        id: "mail",
        title: "Hòm thư chung",
        url: "/dashboard/mail",
        icon: Mail,
      },
      {
        id: "chat",
        title: "Trò chuyện",
        url: "/dashboard/chat",
        icon: MessageSquare,
      },
    ],
  },
];
