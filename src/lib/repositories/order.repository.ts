import { createClient } from "@/lib/supabase/server";
import type { GetOrdersParams } from "@/types/order";

const SORT_MAP: Record<string, string> = {
  createdAt: "created_at",
  total: "total",
  code: "code",
  customerName: "customer_name",
};

/**
 * TRUY VẤN DANH SÁCH ĐƠN HÀNG (Kèm tìm kiếm và bộ lọc)
 */
export async function getOrders(params: GetOrdersParams) {
  const supabase = await createClient();

  const { search, status, page = 1, pageSize = 10, sortBy = "createdAt", sortOrder = "desc" } = params;

  const activeStatus = status || (params as any).orderStatus;
  const dbSortColumn = SORT_MAP[sortBy] || "created_at";

  let query = supabase.from("orders").select(
    `
      id,
      code,
      customerName:customer_name,
      total,
      orderStatus:order_status,
      createdAt:created_at
    `,
    { count: "exact" },
  );

  if (search && search.trim() !== "") {
    const cleanSearch = search.trim();
    query = query.or(`code.ilike.*${cleanSearch}*,customer_name.ilike.*${cleanSearch}*`);
  }

  if (activeStatus && activeStatus !== "all") {
    query = query.eq("order_status", activeStatus);
  }

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await query.order(dbSortColumn, { ascending: sortOrder === "asc" }).range(from, to);

  if (error) {
    console.error("[ORDER_REPOSITORY_ERROR]", error);
    throw new Error(error.message);
  }

  return {
    data: data ?? [],
    count: count ?? 0,
  };
}

/**
 * TRUY VẤN CHI TIẾT 1 ĐƠN HÀNG
 */
export async function getOrderWithDetails(orderId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .select(
      `
      id,
      code,
      customerName:customer_name,
      customerEmail:customer_email,
      total,
      orderStatus:order_status,
      paymentStatus:payment_status,
      createdAt:created_at,
      order_items!order_items_order_id_fkey (
        id,
        quantity,
        unit_price,
        total_price,
        unitPrice:unit_price,
        totalPrice:total_price,
        products (name, images)
      )
    `,
    )
    .eq("id", orderId)
    .single();

  if (error) {
    console.error("Lỗi lấy chi tiết đơn hàng:", error);
    return null;
  }
  return data;
}

/**
 * XÓA ĐƠN HÀNG THEO ID
 */
export async function deleteOrder(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("orders").delete().eq("id", id);
  if (error) throw error;
  return true;
}

/**
 * THỐNG KÊ TÀI CHÍNH NÂNG CAO ĐỒNG BỘ CHO GIAO DIỆN
 */
export async function getFinancialStats() {
  const supabase = await createClient();

  const { data: orders, error: ordersError } = await supabase
    .from("orders")
    .select("id, code, customer_name, total, order_status, created_at")
    .neq("order_status", "Cancelled")
    .order("created_at", { ascending: false });

  if (ordersError) {
    console.error("Lỗi lấy đơn hàng tính doanh thu:", ordersError);
    throw ordersError;
  }

  const grossRevenue = orders?.reduce((sum, o) => sum + Number(o.total), 0) || 0;

  const recentOrders = (orders || []).slice(0, 5).map((o) => ({
    id: o.id,
    code: o.code,
    customerName: o.customer_name,
    total: Number(o.total || 0),
    orderStatus: o.order_status,
    createdAt: o.created_at,
  }));

  const { data: items, error: itemsError } = await supabase.from("order_items").select(`
      quantity,
      total_price,
      products (
        cost_price,
        categories (
          name
        )
      )
    `);

  if (itemsError) {
    console.error("Lỗi lấy chi tiết giá vốn sản phẩm:", itemsError);
    throw itemsError;
  }

  let totalCogs = 0;
  const categoryMap: Record<string, number> = {};

  if (items) {
    for (const item of items) {
      const product = item.products as any;
      if (!product) continue;

      const qty = Number(item.quantity || 0);
      const costPrice = Number(product.cost_price || 0);
      const rev = Number(item.total_price || 0);

      totalCogs += qty * costPrice;

      const categoryName = product.categories?.name || "Chưa phân loại";
      categoryMap[categoryName] = (categoryMap[categoryName] || 0) + rev;
    }
  }

  const categoryBreakdown = Object.entries(categoryMap).map(([name, value]) => ({
    name,
    value,
  }));

  const netProfit = grossRevenue - totalCogs;
  const profitMargin = grossRevenue > 0 ? Math.round((netProfit / grossRevenue) * 100) : 0;

  return {
    grossRevenue,
    totalCogs,
    netProfit,
    profitMargin,
    recentOrders,
    categoryBreakdown,
  };
}

/**
 * LẤY DỮ LIỆU TỔNG HỢP CHO TRANG CHỦ OVERVIEW
 */
export async function getDashboardStats() {
  const supabase = await createClient();

  const { data: orders } = await supabase
    .from("orders")
    .select("total, order_status, created_at")
    .neq("order_status", "Cancelled");

  const [productsRes, categoriesRes, profilesRes] = await Promise.all([
    supabase.from("products").select("id", { count: "exact", head: true }),
    supabase.from("categories").select("id", { count: "exact", head: true }),
    supabase.from("profiles").select("*").order("created_at", { ascending: false }).limit(10),
  ]);

  const totalRevenue = orders?.reduce((sum, order) => sum + Number(order.total), 0) || 0;
  const totalOrders = orders?.length || 0;
  const pendingOrders = orders?.filter((o) => o.order_status === "Pending").length || 0;

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toISOString().split("T")[0];
  }).reverse();

  const chartData = last7Days.map((dateStr) => {
    const dayOrders = orders?.filter((o) => o.created_at?.startsWith(dateStr)) || [];
    const revenue = dayOrders.reduce((sum, o) => sum + Number(o.total), 0);
    const orderCount = dayOrders.length;

    return {
      date: new Date(dateStr).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
      }),
      newCustomers: revenue > 0 ? Math.round(revenue / 100000) : 0,
      activeAccounts: orderCount * 15,
      returningUsers: orderCount * 8,
    };
  });

  const maxDailyRevenue = Math.max(...chartData.map((d) => d.newCustomers), 1);

  return {
    totalRevenue,
    totalOrders,
    pendingOrders,
    productCount: productsRes.count || 0,
    categoryCount: categoriesRes.count || 0,
    chartData,
    maxDailyRevenue,
    recentCustomers: (profilesRes.data || []).map((p: any) => ({
      id: p.id,
      name: p.name || "Khách hàng mới",
      email: p.email,
      plan: "Store Member",
      status: "Subscribed",
      billing: "Paid",
      joined: p.created_at ? p.created_at.split("T")[0] : new Date().toISOString().split("T")[0],
    })),
  };
}

/**
 * THỐNG KÊ CHI TIẾT HIỆU SUẤT BÁN LẺ DÀNH RIÊNG CHO CÁC COMPONENT
 */
export async function getEcommerceDashboardStats() {
  const supabase = await createClient();

  const { data: orders, error: ordersError } = await supabase
    .from("orders")
    .select("id, code, customer_name, total, order_status, payment_status, created_at")
    .order("created_at", { ascending: false });

  if (ordersError) throw ordersError;

  const activeOrders = orders?.filter((o) => o.order_status !== "Cancelled") || [];
  const totalRevenue = activeOrders.reduce((sum, o) => sum + Number(o.total || 0), 0) || 0;
  const totalOrders = activeOrders.length || 0;
  const averageOrder = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;
  const cancelledOrders = orders?.filter((o) => o.order_status === "Cancelled").length || 0;
  const pendingOrders = orders?.filter((o) => o.order_status === "Pending").length || 0;

  const recentOrders = (orders || []).slice(0, 10).map((o) => ({
    id: o.id,
    date: o.created_at,
    customer: o.customer_name || "Khách hàng mới",
    payment: o.payment_status === "Paid" ? "Paid" : o.payment_status === "Refunded" ? "Refunded" : "Pending",
    total: new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(o.total || 0),
    items: "Sản phẩm 3D / DIY Custom",
    fulfillment:
      o.order_status === "Delivered" ? "Fulfilled" : o.order_status === "Cancelled" ? "Returned" : "Unfulfilled",
  }));

  const { data: dbProducts } = await supabase.from("products").select("id, stock, name, images, category_id");

  const totalProducts = dbProducts?.length || 0;
  const inStockCount = dbProducts?.filter((p) => Number(p.stock || 0) > 10).length || 0;
  const lowStockCount = dbProducts?.filter((p) => Number(p.stock || 0) > 0 && Number(p.stock || 0) <= 10).length || 0;
  const outOfStockCount = totalProducts - inStockCount - lowStockCount;
  const availablePercent = totalProducts > 0 ? Math.round((inStockCount / totalProducts) * 100) : 0;

  const [_categoriesRes, profilesRes] = await Promise.all([
    supabase.from("categories").select("id", { count: "exact", head: true }),
    supabase.from("profiles").select("*", { count: "exact" }).order("created_at", { ascending: false }).limit(10),
  ]);

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toISOString().split("T")[0];
  }).reverse();

  const chartData = last7Days.map((dateStr) => {
    const dayOrders = activeOrders.filter((o) => o.created_at?.startsWith(dateStr)) || [];
    const revenue = dayOrders.reduce((sum, o) => sum + Number(o.total), 0);
    const profit = Math.round(revenue * 0.26);

    return {
      period: new Date(dateStr).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
      }),
      revenue,
      profit,
    };
  });

  const maxDailyRevenue = Math.max(...chartData.map((d) => d.revenue), 1);

  const { data: items, error: itemsError } = await supabase.from("order_items").select(`
      quantity,
      total_price,
      orders!order_items_order_id_fkey ( order_status ),
      products (
        id,
        name,
        category_id,
        categories (name)
      )
    `);

  if (itemsError) throw itemsError;

  let totalItemsSold = 0;
  const productStatsMap: Record<string, { name: string; category: string; quantity: number; revenue: number }> = {};
  const categorySalesMap: Record<string, number> = {};

  if (items) {
    for (const item of items) {
      const orderStatus = (item.orders as any)?.order_status;
      if (orderStatus === "Cancelled") continue;
      const product = item.products as any;
      if (!product) continue;

      const qty = Number(item.quantity || 0);
      const rev = Number(item.total_price || 0);
      totalItemsSold += qty;

      if (!productStatsMap[product.id]) {
        productStatsMap[product.id] = {
          name: product.name,
          category: product.categories?.name || "Chưa phân loại",
          quantity: 0,
          revenue: 0,
        };
      }
      productStatsMap[product.id].quantity += qty;
      productStatsMap[product.id].revenue += rev;

      const catName = product.categories?.name || "Chưa phân loại";
      categorySalesMap[catName] = (categorySalesMap[catName] || 0) + rev;
    }
  }

  const topProducts = Object.values(productStatsMap)
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 3)
    .map((p) => ({
      name: p.name,
      category: p.category,
      share: totalItemsSold > 0 ? `${Math.round((p.quantity / totalItemsSold) * 100)}%` : "0%",
      sales: new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
        maximumFractionDigits: 0,
      }).format(p.revenue),
    }));

  const colors = ["var(--chart-3)", "var(--chart-2)", "var(--chart-1)"];
  const categoriesBreakdown = Object.entries(categorySalesMap).map(([name, value], index) => {
    const share = totalRevenue > 0 ? Math.round((value / totalRevenue) * 100) : 0;
    return {
      name,
      value,
      share,
      color: colors[index % colors.length] || "var(--chart-1)",
    };
  });

  return {
    totalRevenue,
    totalOrders,
    pendingOrders,
    customerGrowth: profilesRes.count || 0,
    averageOrder,
    cancelledOrders,
    stockAccuracy: 97,
    chartData,
    maxDailyRevenue,
    recentOrders,
    topProducts,
    categoriesBreakdown,
    inventory: {
      inStock: inStockCount,
      lowStock: lowStockCount,
      outOfStock: outOfStockCount,
      availablePercent,
    },
    recentCustomers: (profilesRes.data || []).map((p: any) => ({
      id: p.id,
      name: p.name || "Khách hàng mới",
      email: p.email,
      plan: "Store Member",
      status: "Subscribed",
      billing: "Paid",
      joined: p.created_at ? p.created_at.split("T")[0] : new Date().toISOString().split("T")[0],
    })),
  };
}

/**
 * THỐNG KÊ PHÂN TÍCH TOÀN DIỆN CHO TRANG ANALYTICS
 */
export async function getAnalyticsStats() {
  const supabase = await createClient();

  const { data: orders } = await supabase
    .from("orders")
    .select("id, code, customer_name, total, order_status, created_at")
    .neq("order_status", "Cancelled");

  const { count: customerCount } = await supabase.from("profiles").select("id", { count: "exact", head: true });

  const totalOrders = orders?.length || 0;
  const activeCustomers = customerCount || 0;

  const { data: items, error: itemsError } = await supabase.from("order_items").select(`
      quantity,
      total_price,
      products (
        name,
        slug
      )
    `);

  if (itemsError) throw itemsError;

  let totalPageviews = 0;
  const pageStatsMap: Record<string, { path: string; views: number; time: string; bounce: string }> = {};

  if (items) {
    for (const item of items) {
      const product = item.products as any;
      if (!product) continue;

      const qty = Number(item.quantity || 0);
      const mockViews = qty * 45;
      totalPageviews += mockViews;

      const path = `/shop/${product.slug}`;

      if (!pageStatsMap[path]) {
        pageStatsMap[path] = {
          path: path,
          views: 0,
          time: `${Math.floor(2 + Math.random() * 3)}m ${Math.floor(10 + Math.random() * 45)}s`,
          bounce: `${Math.floor(18 + Math.random() * 25)}%`,
        };
      }
      pageStatsMap[path].views += mockViews;
    }
  }

  const topPages = Object.values(pageStatsMap)
    .sort((a, b) => b.views - a.views)
    .slice(0, 5)
    .map((p) => {
      const formattedViews = p.views >= 1000 ? `${(p.views / 1000).toFixed(1)}k` : `${p.views}`;
      return {
        ...p,
        views: formattedViews,
        percentage: totalPageviews > 0 ? Math.round((p.views / totalPageviews) * 100) : 0,
      };
    });

  const finalPageviews = totalPageviews > 0 ? totalPageviews : 12450;
  const conversionRate = activeCustomers > 0 ? ((totalOrders / activeCustomers) * 100).toFixed(1) : "0.0";
  const uniqueVisitors = activeCustomers > 0 ? activeCustomers * 18 : 213100;
  const totalSessions = Math.round(uniqueVisitors * 1.15);

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toISOString().split("T")[0];
  }).reverse();

  const trafficQualityData = last7Days.map((dateStr, index) => {
    const dayOrders = orders?.filter((o) => o.created_at?.startsWith(dateStr)) || [];
    const actualSales = dayOrders.reduce((sum, o) => sum + Number(o.total), 0);
    const baselineSales = 8000000;

    const actualPercentage =
      baselineSales > 0 ? Number((((actualSales - baselineSales) / baselineSales) * 100).toFixed(1)) : 0;

    return {
      date: new Date(dateStr).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
      }),
      actualQuality: actualSales > 0 ? Math.min(actualPercentage, 100) : -100,
      baselineQuality: 0,
      dayIndex: index + 1,
    };
  });

  const formatLabel = (v: number) => {
    return v >= 1000 ? `${(v / 1000).toFixed(1)}k` : `${v}`;
  };

  const sourcesData = [
    {
      label: formatLabel(Math.round(finalPageviews * 0.45)),
      source: "Organic Search",
      visitors: Math.round(finalPageviews * 0.45),
    },
    {
      label: formatLabel(Math.round(finalPageviews * 0.25)),
      source: "Direct",
      visitors: Math.round(finalPageviews * 0.25),
    },
    {
      label: formatLabel(Math.round(finalPageviews * 0.15)),
      source: "Social",
      visitors: Math.round(finalPageviews * 0.15),
    },
    {
      label: formatLabel(Math.round(finalPageviews * 0.1)),
      source: "Referral",
      visitors: Math.round(finalPageviews * 0.1),
    },
    {
      label: formatLabel(Math.round(finalPageviews * 0.05)),
      source: "Paid",
      visitors: Math.round(finalPageviews * 0.05),
    },
  ];

  const campaignsData = [
    {
      label: formatLabel(Math.round(finalPageviews * 0.35)),
      source: "Summer Launch",
      visitors: Math.round(finalPageviews * 0.35),
    },
    {
      label: formatLabel(Math.round(finalPageviews * 0.25)),
      source: "Newsletter",
      visitors: Math.round(finalPageviews * 0.25),
    },
    {
      label: formatLabel(Math.round(finalPageviews * 0.18)),
      source: "Retargeting",
      visitors: Math.round(finalPageviews * 0.18),
    },
    {
      label: formatLabel(Math.round(finalPageviews * 0.12)),
      source: "Brand Search",
      visitors: Math.round(finalPageviews * 0.12),
    },
    {
      label: formatLabel(Math.round(finalPageviews * 0.1)),
      source: "Partners",
      visitors: Math.round(finalPageviews * 0.1),
    },
  ];

  const referrersData = [
    {
      label: formatLabel(Math.round(finalPageviews * 0.4)),
      source: "Google",
      visitors: Math.round(finalPageviews * 0.4),
    },
    {
      label: formatLabel(Math.round(finalPageviews * 0.2)),
      source: "LinkedIn",
      visitors: Math.round(finalPageviews * 0.2),
    },
    {
      label: formatLabel(Math.round(finalPageviews * 0.18)),
      source: "Product Hunt",
      visitors: Math.round(finalPageviews * 0.18),
    },
    {
      label: formatLabel(Math.round(finalPageviews * 0.12)),
      source: "GitHub",
      visitors: Math.round(finalPageviews * 0.12),
    },
    {
      label: formatLabel(Math.round(finalPageviews * 0.1)),
      source: "Medium",
      visitors: Math.round(finalPageviews * 0.1),
    },
  ];

  return {
    uniqueVisitors,
    totalSessions,
    totalPageviews: finalPageviews,
    conversionRate,
    topPages,
    activeCustomers,
    trafficQualityData,
    sourcesData,
    campaignsData,
    referrersData,
  };
}
