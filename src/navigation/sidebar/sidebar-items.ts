import {
  Banknote,
  Calendar,
  ChartBar,
  CheckSquare,
  Forklift,
  Gauge,
  Kanban,
  LayoutDashboard,
  ListTodo,
  Lock,
  type LucideIcon,
  Mail,
  MessageSquare,
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
  // CATALOG
  // ==========================================================
  {
    id: 2,
    label: "Catalog",
    items: [
      {
        id: "catalog",
        title: "Catalog",
        icon: ShoppingBag,
        subItems: [
          {
            id: "products",
            title: "Products",
            url: "/dashboard/products",
          },

          // Future
          // {
          //   id: "categories",
          //   title: "Categories",
          //   url: "/dashboard/categories",
          // },
          // {
          //   id: "brands",
          //   title: "Brands",
          //   url: "/dashboard/brands",
          // },
          // {
          //   id: "inventory",
          //   title: "Inventory",
          //   url: "/dashboard/inventory",
          // },
        ],
      },
    ],
  },

  // ==========================================================
  // CUSTOMERS
  // ==========================================================
  {
    id: 3,
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
    id: 4,
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
    id: 5,
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
    id: 6,
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
