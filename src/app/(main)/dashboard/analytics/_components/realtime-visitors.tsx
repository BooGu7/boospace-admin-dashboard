"use client";

import { type GeoPermissibleObjects, geoMercator, geoPath } from "d3-geo";
import { MapPin, Minus, Plus, RotateCcw } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { feature, mesh } from "topojson-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PROVINCE_MAP } from "@/data/data_location"; // Nhập khẩu nguồn địa danh tập trung

const WORLD_ATLAS_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

const WIDTH = 400;
const HEIGHT = 450;

interface RealtimeVisitorsProps {
  liveCount: number;
  citiesData: { name: string; value: number }[];
}

type WorldTopology = {
  objects: {
    countries: unknown;
    land: unknown;
  };
  type: "Topology";
};

// Hàm định hướng phân giải địa danh
function findProvince(cityName: string) {
  const clean = cityName.toLowerCase().trim();
  for (const [key, value] of Object.entries(PROVINCE_MAP)) {
    if (value.searchTerms.some((term) => clean.includes(term))) {
      return { key, ...value };
    }
  }
  return null;
}

export function RealtimeVisitors({ liveCount, citiesData }: RealtimeVisitorsProps) {
  const [borders, setBorders] = useState<GeoJSON.MultiLineString | null>(null);
  const [land, setLand] = useState<GeoJSON.FeatureCollection | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [zoom, setZoom] = useState(2450);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });

  // Nhận diện mốc tỉnh thành trong nước tự động
  const validCities = (citiesData || [])
    .map((c) => {
      const prov = findProvince(c.name);
      return {
        originalName: c.name,
        name: prov ? prov.name : c.name,
        value: c.value,
        isValid: prov !== null,
      };
    })
    .filter((c) => c.isValid);

  const maxCityValue = Math.max(...validCities.map((c) => c.value), 0);

  useEffect(() => {
    let cancelled = false;

    async function loadMap() {
      try {
        const response = await fetch(WORLD_ATLAS_URL);
        if (!response.ok) {
          throw new Error(`Failed to load world atlas: ${response.status}`);
        }

        const topology = (await response.json()) as WorldTopology;
        const landCollection = feature(
          topology as unknown as Parameters<typeof feature>[0],
          topology.objects.land as unknown as Parameters<typeof feature>[1],
        ) as GeoJSON.FeatureCollection;

        const countryBorders = mesh(
          topology as unknown as Parameters<typeof mesh>[0],
          topology.objects.countries as unknown as Parameters<typeof mesh>[1],
          (a, b) => a !== b,
        ) as GeoJSON.MultiLineString;

        if (!cancelled) {
          setBorders(countryBorders);
          setLand(landCollection);
          setIsLoading(false);
        }
      } catch (error) {
        console.error(error);
        setIsLoading(false);
      }
    }

    void loadMap();

    return () => {
      cancelled = true;
    };
  }, []);

  const { path, projectedPoints } = useMemo(() => {
    const projection = geoMercator()
      .center([106.4, 16.0])
      .scale(zoom)
      .translate([WIDTH / 2 + offset.x, HEIGHT / 2 + offset.y]);

    const pathGenerator = geoPath(projection);

    const points = validCities
      .map((c) => {
        const prov = findProvince(c.originalName);
        const point = prov ? projection(prov.coords) : null;
        return {
          name: prov ? prov.name : c.name,
          value: c.value,
          point: point ? [Number(point[0].toFixed(2)), Number(point[1].toFixed(2))] : null,
        };
      })
      .filter((p) => p.point !== null);

    return {
      path: pathGenerator,
      projectedPoints: points,
    };
  }, [validCities, zoom, offset]);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    dragStart.current = { x: e.clientX - offset.x, y: e.clientY - offset.y };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    setOffset({
      x: e.clientX - dragStart.current.x,
      y: e.clientY - dragStart.current.y,
    });
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
  };

  const handleResetMap = () => {
    setZoom(2450);
    setOffset({ x: 0, y: 0 });
  };

  return (
    <Card className="h-full flex flex-col justify-between shadow-xs border-slate-100">
      <CardHeader className="pb-3 border-b border-slate-50">
        <CardTitle className="font-normal text-slate-800 text-base flex items-center gap-2">
          <MapPin className="size-4.5 text-red-600 shrink-0 animate-bounce" />
          Bản đồ phân bổ khách truy cập
        </CardTitle>
      </CardHeader>

      <CardContent className="flex flex-col gap-5 pt-5 flex-1 justify-center">
        {/* Khung số lượng */}
        <div className="flex items-center justify-between border-b pb-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black tabular-nums tracking-tight text-slate-900">{liveCount}</span>
            <span className="text-muted-foreground text-[11px] font-bold">khách truy cập trong nước ghi nhận</span>
          </div>
          <div className="flex items-center gap-1.5 font-bold text-red-600 bg-red-50/80 border border-red-100 rounded-md px-2 py-0.5 uppercase tracking-widest text-[9px]">
            Bản đồ nhiệt
          </div>
        </div>

        {/* ==========================================================
            BẢN ĐỒ THẾ GIỚI TỐI GIẢN - THU NHỎ KÍCH THƯỚC (max-h-56) & ĐẬM MÀU SẮC NÉT
            ========================================================== */}
        <div
          className="relative w-full aspect-[4/3] max-h-56 rounded-2xl border border-red-200 bg-[#fefefe] dark:bg-[#1a0e10] overflow-hidden flex items-center justify-center p-2 cursor-grab active:cursor-grabbing group select-none"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUpOrLeave}
          onMouseLeave={handleMouseUpOrLeave}
        >
          {isLoading ? (
            <div className="text-xs font-bold text-red-500 animate-pulse">Đang tải bản đồ...</div>
          ) : (
            <div className="relative size-full flex items-center justify-center">
              <svg
                viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
                className="w-full h-full block opacity-95 dark:opacity-60"
                preserveAspectRatio="xMidYMid meet"
              >
                <defs>
                  {/* Bộ lọc phát sáng VÀNG HỔ PHÁCH NEON cực kỳ nổi bật */}
                  <filter id="amber-neon-glow" x="-45%" y="-45%" width="170%" height="170%">
                    <feGaussianBlur stdDeviation="5" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                {/* Bản đồ đất liền màu Đỏ đậm sắc nét */}
                {land && (
                  <path
                    d={path(land as GeoPermissibleObjects) ?? undefined}
                    className="fill-red-100/90 dark:fill-[#2d1113]/90 stroke-red-300 dark:stroke-red-900"
                    strokeWidth={1.2}
                  />
                )}

                {/* Đường biên giới quốc tế sắc nét */}
                {borders && (
                  <path
                    d={path(borders as GeoPermissibleObjects) ?? undefined}
                    className="fill-none stroke-red-200 dark:stroke-red-950"
                    strokeWidth={1.2}
                  />
                )}

                {/* Điểm nhấp nháy định vị Thành phố (Đã xóa trường value không dùng để khử cảnh báo linter) */}
                {projectedPoints.map(({ name, point }) => {
                  if (!point) return null;
                  return (
                    <g key={name} transform={`translate(${point[0]}, ${point[1]})`}>
                      <circle r={14} className="fill-amber-500/20 animate-ping" />
                      <circle r={7.5} className="fill-amber-500" filter="url(#amber-neon-glow)" />
                      <circle r={3.2} className="fill-white stroke-amber-600" strokeWidth={1.2} />
                    </g>
                  );
                })}
              </svg>

              {validCities.length === 0 && (
                <div className="absolute inset-0 bg-[#fdfefe]/30 dark:bg-[#1a0e10]/30 backdrop-blur-xs flex items-center justify-center p-4 pointer-events-none">
                  <span className="text-[10px] font-bold text-red-500 border border-dashed border-red-200 rounded-lg px-3 py-2 bg-background shadow-xs">
                    Chưa có dữ liệu địa danh ghi nhận.
                  </span>
                </div>
              )}
            </div>
          )}

          {/* BẢNG ĐIỀU KHIỂN TƯƠNG TÁC GÓC BẢN ĐỒ */}
          <div className="absolute bottom-3 right-3 flex flex-col gap-1 bg-background/95 p-1 rounded-lg border shadow-xs opacity-80 hover:opacity-100 transition-opacity">
            <button
              type="button"
              className="size-6 rounded-md hover:bg-slate-50 flex items-center justify-center text-slate-600 transition-colors border text-xs font-bold"
              onClick={(e) => {
                e.stopPropagation();
                setZoom((prev) => Math.min(6000, prev + 300));
              }}
              title="Phóng to"
            >
              <Plus className="size-3" />
            </button>
            <button
              type="button"
              className="size-6 rounded-md hover:bg-slate-50 flex items-center justify-center text-slate-600 transition-colors border text-xs font-bold"
              onClick={(e) => {
                e.stopPropagation();
                setZoom((prev) => Math.max(1000, prev - 300));
              }}
              title="Thu nhỏ"
            >
              <Minus className="size-3" />
            </button>
            <button
              type="button"
              className="size-6 rounded-md hover:bg-slate-50 flex items-center justify-center text-slate-600 transition-colors border"
              onClick={(e) => {
                e.stopPropagation();
                handleResetMap();
              }}
              title="Khôi phục"
            >
              <RotateCcw className="size-3" />
            </button>
          </div>
        </div>

        {/* KHOANH CHI TIẾT NẰM Ở DƯỚI BẢN ĐỒ (TÔNG ĐỎ) */}
        <div className="space-y-3.5 border-t border-red-50 pt-4">
          <div className="text-[11px] font-extrabold text-red-600 tracking-wider uppercase mb-1">
            Phân bổ địa danh chi tiết:
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3.5">
            {validCities.slice(0, 4).map((c, i) => {
              const percentage = maxCityValue > 0 ? Math.round((c.value / maxCityValue) * 100) : 0;
              return (
                <div key={c.name} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 font-bold text-slate-700">
                      <span className="size-4.5 rounded-full bg-red-50 text-red-700 border border-red-100 flex items-center justify-center text-[9px] font-extrabold shrink-0">
                        {i + 1}
                      </span>
                      {c.name}
                    </div>
                    <span className="font-mono font-black text-slate-900 tabular-nums">{c.value} khách</span>
                  </div>
                  <div className="h-1.5 w-full bg-red-50/50 rounded-full overflow-hidden border border-red-100/10">
                    <div
                      className="h-full bg-gradient-to-r from-red-500 to-rose-600 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          {validCities.length === 0 && (
            <div className="text-center py-6 text-muted-foreground text-xs leading-relaxed italic">
              Chưa ghi nhận lưu lượng truy cập thành phố trong nước.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
