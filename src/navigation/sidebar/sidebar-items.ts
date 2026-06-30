import {
  Banknote,
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
  Lock,
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
  // DASHBOARD
  // ==========================================================
  {
    id: 1,
    label: "Dashboard",
    items: [
      {
        id: "overview",
        title: "Overview",
        url: "/dashboard/default",
        icon: LayoutDashboard,
      },
      {
        id: "ecommerce",
        title: "Ecommerce",
        url: "/dashboard/ecommerce",
        icon: ShoppingBag,
      },
      {
        id: "analytics",
        title: "Analytics",
        url: "/dashboard/analytics",
        icon: Gauge,
      },
      {
        id: "finance",
        title: "Finance",
        url: "/dashboard/finance",
        icon: Banknote,
      },
    ],
  },

  // ==========================================================
  // SALES
  // ==========================================================
  {
    id: 2,
    label: "Sales",
    items: [
      {
        id: "orders",
        title: "Orders",
        url: "/dashboard/orders",
        icon: ReceiptText,
        badge: "new",
      },
    ],
  },

  // ==========================================================
  // CATALOG
  // ==========================================================
  {
    id: 3,
    label: "Catalog",
    items: [
      {
        id: "catalog",
        title: "Catalog",
        icon: Package,
        subItems: [
          {
            id: "products",
            title: "Products",
            url: "/dashboard/products",
          },
          {
            id: "categories",
            title: "Categories",
            url: "/dashboard/categories",
            icon: FolderTree,
          },
          {
            id: "brands",
            title: "Brands",
            url: "/dashboard/brands",
            icon: Building2,
          },
        ],
      },
    ],
  },

  // ==========================================================
  // CUSTOMERS
  // ==========================================================
  {
    id: 4,
    label: "Customers",
    items: [
      {
        id: "users",
        title: "Users",
        url: "/dashboard/users",
        icon: Users,
      },
      {
        id: "crm",
        title: "CRM",
        url: "/dashboard/crm",
        icon: ChartBar,
      },
    ],
  },

  // ==========================================================
  // OPERATIONS
  // ==========================================================
  {
    id: 5,
    label: "Operations",
    items: [
      {
        id: "logistics",
        title: "Logistics",
        url: "/dashboard/logistics",
        icon: Forklift,
      },
      {
        id: "calendar",
        title: "Calendar",
        url: "/dashboard/calendar",
        icon: Calendar,
      },
      {
        id: "kanban",
        title: "Kanban",
        url: "/dashboard/kanban",
        icon: Kanban,
      },
      {
        id: "tasks",
        title: "Tasks",
        url: "/dashboard/tasks",
        icon: CheckSquare,
        badge: "new",
      },
      {
        id: "productivity",
        title: "Productivity",
        url: "/dashboard/productivity",
        icon: ListTodo,
      },
    ],
  },

  // ==========================================================
  // COMMUNICATION
  // ==========================================================
  {
    id: 6,
    label: "Communication",
    items: [
      {
        id: "mail",
        title: "Mail",
        url: "/dashboard/mail",
        icon: Mail,
      },
      {
        id: "chat",
        title: "Chat",
        url: "/dashboard/chat",
        icon: MessageSquare,
      },
    ],
  },

  // ==========================================================
  // SYSTEM
  // ==========================================================
  {
    id: 7,
    label: "System",
    items: [
      {
        id: "roles",
        title: "Roles",
        url: "/dashboard/roles",
        icon: Lock,
      },
    ],
  },
];
