/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "5mb",
    },
  },
  images: {
    dangerouslyAllowSVG: true, // Kích hoạt hiển thị tệp vector mẫu SVG an toàn
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandboxed;",
    remotePatterns: [
      {
        protocol: "https",
        hostname: "amukhgkamrokbbcjgusf.supabase.co",
        port: "",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "placehold.co",
      },
      // ĐÃ BỔ SUNG: Đăng ký tên miền cổng VietQR quốc gia an toàn
      {
        protocol: "https",
        hostname: "img.vietqr.io",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/dashboard",
        destination: "/dashboard/default",
        permanent: false,
      },
      // BỔ SUNG: Tự động chuyển hướng các đường dẫn cũ về thư mục con tương ứng của dashboard
      {
        source: "/mail",
        destination: "/dashboard/mail",
        permanent: false,
      },
      {
        source: "/chat",
        destination: "/dashboard/chat",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
