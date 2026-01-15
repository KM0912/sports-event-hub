import { ImageResponse } from "next/og";
import { createClient } from "@/lib/supabase/server";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { LEVELS, LevelKey } from "@/lib/constants";

export const runtime = "edge";
export const alt = "バドミントン練習会";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: event } = await supabase
    .from("events_with_spots")
    .select("*")
    .eq("id", id)
    .single();

  if (!event) {
    // デフォルト画像を返す
    return new ImageResponse(
      (
        <div
          style={{
            background: "linear-gradient(135deg, #16a34a 0%, #15803d 100%)",
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontSize: "48px",
          }}
        >
          練習会が見つかりません
        </div>
      ),
      { ...size }
    );
  }

  const eventDate = format(new Date(event.start_at!), "M月d日(E)", {
    locale: ja,
  });
  const eventTime = `${format(new Date(event.start_at!), "HH:mm")} - ${format(
    new Date(event.end_at!),
    "HH:mm"
  )}`;
  const levelText = LEVELS[event.level as LevelKey] || event.level;
  const isFull = (event.remaining_spots ?? 0) <= 0;
  const isCanceled = event.status === "canceled";

  return new ImageResponse(
    (
      <div
        style={{
          background:
            "linear-gradient(135deg, #16a34a 0%, #15803d 50%, #166534 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          padding: "60px",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "60px",
                height: "60px",
                borderRadius: "12px",
                background: "rgba(255, 255, 255, 0.2)",
                fontSize: "32px",
              }}
            >
              🏸
            </div>
            <div
              style={{ color: "rgba(255, 255, 255, 0.9)", fontSize: "24px" }}
            >
              宮城バドミントン練習会
            </div>
          </div>

          {/* Status Badge */}
          <div
            style={{
              padding: "12px 24px",
              borderRadius: "999px",
              background: isCanceled
                ? "#ef4444"
                : isFull
                ? "#f59e0b"
                : "rgba(255, 255, 255, 0.2)",
              color: "white",
              fontSize: "24px",
              fontWeight: "bold",
            }}
          >
            {isCanceled ? "中止" : isFull ? "満員" : "募集中"}
          </div>
        </div>

        {/* Main Content */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: "24px",
          }}
        >
          <div
            style={{
              fontSize: "56px",
              fontWeight: "bold",
              color: "white",
              lineHeight: 1.2,
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {event.title}
          </div>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "16px",
              marginTop: "16px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "12px 20px",
                background: "rgba(255, 255, 255, 0.15)",
                borderRadius: "12px",
                color: "white",
                fontSize: "24px",
              }}
            >
              📅 {eventDate}
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "12px 20px",
                background: "rgba(255, 255, 255, 0.15)",
                borderRadius: "12px",
                color: "white",
                fontSize: "24px",
              }}
            >
              🕐 {eventTime}
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "12px 20px",
                background: "rgba(255, 255, 255, 0.15)",
                borderRadius: "12px",
                color: "white",
                fontSize: "24px",
              }}
            >
              📍 {event.venue_name}
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "12px 20px",
                background: "rgba(255, 255, 255, 0.15)",
                borderRadius: "12px",
                color: "white",
                fontSize: "24px",
              }}
            >
              🎯 {levelText}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
          }}
        >
          <div style={{ color: "rgba(255, 255, 255, 0.8)", fontSize: "24px" }}>
            参加費: ¥{event.fee?.toLocaleString()}
          </div>
          <div style={{ color: "rgba(255, 255, 255, 0.8)", fontSize: "24px" }}>
            残り {event.remaining_spots ?? 0} / {event.visitor_capacity} 枠
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
