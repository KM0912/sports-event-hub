import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { formatInTimeZone } from "date-fns-tz";
import { LEVELS, LevelKey, EVENT_STATUS } from "@/lib/constants";
import { ApplyButton } from "@/components/applications/ApplyButton";
import {
  Calendar,
  MapPin,
  Users,
  JapaneseYen,
  User,
  Clock,
  FileText,
  CheckCircle,
  Package,
  AlertTriangle,
} from "lucide-react";
import clsx from "clsx";
import { Metadata } from "next";
import { NavigationLink } from "@/components/navigation/NavigationLink";

type PageProps = {
  params: Promise<{ id: string }>;
};

// 動的メタデータ生成
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();

  const { data: event } = await supabase
    .from("events_with_spots")
    .select("*")
    .eq("id", id)
    .single();

  if (!event) {
    return {
      title: "練習会が見つかりません",
    };
  }

  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL || "https://miyagi-badminton.jp";
  const eventDate = formatInTimeZone(
    new Date(event.start_at!),
    "Asia/Tokyo",
    "yyyy年M月d日",
    { locale: ja }
  );
  const levelText = LEVELS[event.level as LevelKey] || event.level;

  const title = `${event.title} - ${eventDate}`;
  const description = `${eventDate}に${
    event.venue_name
  }で開催されるバドミントン練習会。レベル: ${levelText}、参加費: ${event.fee?.toLocaleString()}円。${
    event.description?.slice(0, 100) || ""
  }`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${baseUrl}/events/${id}`,
      type: "article",
      images: [
        {
          url: "/og-image.png",
          width: 1200,
          height: 630,
          alt: event.title || "バドミントン練習会",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    alternates: {
      canonical: `${baseUrl}/events/${id}`,
    },
  };
}

// JSON-LD 構造化データ
function EventJsonLd({
  event,
}: {
  event: {
    title: string;
    description: string | null;
    start_at: string | null;
    end_at: string | null;
    venue_name: string;
    address: string | null;
    fee: number | null;
    visitor_capacity: number;
    remaining_spots: number | null;
    host_display_name: string;
    status: string;
    id: string;
  };
}) {
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL || "https://miyagi-badminton.jp";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SportsEvent",
    name: event.title,
    description: event.description,
    startDate: event.start_at,
    endDate: event.end_at,
    location: {
      "@type": "Place",
      name: event.venue_name,
      address: {
        "@type": "PostalAddress",
        streetAddress: event.address,
        addressLocality: "宮城県",
        addressCountry: "JP",
      },
    },
    organizer: {
      "@type": "Person",
      name: event.host_display_name,
    },
    offers: {
      "@type": "Offer",
      price: event.fee,
      priceCurrency: "JPY",
      availability:
        event.status === "published" && (event.remaining_spots ?? 0) > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/SoldOut",
    },
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    eventStatus:
      event.status === "canceled"
        ? "https://schema.org/EventCancelled"
        : "https://schema.org/EventScheduled",
    sport: "Badminton",
    url: `${baseUrl}/events/${event.id}`,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export default async function EventDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  // Get event with remaining spots
  const { data: event, error } = await supabase
    .from("events_with_spots")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !event) {
    notFound();
  }

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Check if user has already applied
  let existingApplication = null;
  if (user) {
    const { data: application } = await supabase
      .from("applications")
      .select("*")
      .eq("event_id", id)
      .eq("user_id", user.id)
      .single();
    existingApplication = application;
  }

  // Check if user can apply
  let canApply = false;
  if (user) {
    const { data: canApplyResult } = await supabase.rpc("can_apply_to_event", {
      event_uuid: id,
      user_uuid: user.id,
    });
    canApply = canApplyResult ?? false;
  }

  const isRecruiting =
    event.status === "published" && (event.remaining_spots ?? 0) > 0;
  const isFull =
    event.status === "published" && (event.remaining_spots ?? 0) <= 0;
  const isCanceled = event.status === "canceled";
  const isHost = user?.id === event.host_user_id;

  return (
    <>
      <EventJsonLd
        event={{
          ...event,
          id,
          title: event.title || "",
          venue_name: event.venue_name || "",
          host_display_name: event.host_display_name || "主催者",
          visitor_capacity: event.visitor_capacity || 0,
          status: event.status || "published",
        }}
      />

      <div className="max-w-4xl mx-auto pb-20 md:pb-0">
        {/* Breadcrumb */}
        <nav className="text-sm text-muted mb-6" aria-label="パンくずリスト">
          <ol
            itemScope
            itemType="https://schema.org/BreadcrumbList"
            className="flex"
          >
            <li
              itemProp="itemListElement"
              itemScope
              itemType="https://schema.org/ListItem"
            >
              <NavigationLink href="/" itemProp="item" className="hover:text-primary">
                <span itemProp="name">練習会一覧</span>
              </NavigationLink>
              <meta itemProp="position" content="1" />
            </li>
            <span className="mx-2">/</span>
            <li
              itemProp="itemListElement"
              itemScope
              itemType="https://schema.org/ListItem"
            >
              <span itemProp="name" className="text-gray-900">
                練習会詳細
              </span>
              <meta itemProp="position" content="2" />
            </li>
          </ol>
        </nav>

        <article className="card animate-fade-in">
          {/* Header */}
          <header className="mb-6 pb-6 border-b border-border">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span
                className={clsx("badge", {
                  "badge-success": isRecruiting,
                  "badge-warning": isFull,
                  "badge-error": isCanceled,
                })}
              >
                {isCanceled
                  ? EVENT_STATUS.canceled
                  : isFull
                  ? "満員"
                  : EVENT_STATUS.published}
              </span>
              <span className="badge badge-primary">
                {LEVELS[event.level as LevelKey] || event.level}
              </span>
            </div>
            {event.level_notes && (
              <p className="text-sm text-gray-600 mb-3 pl-1">
                {event.level_notes}
              </p>
            )}
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              {event.title}
            </h1>
            <div className="flex items-center gap-2 text-muted">
              <User className="w-4 h-4" />
              <span>主催: {event.host_display_name}</span>
            </div>
          </header>

          {/* Main Info Grid */}
          <div className="grid gap-4 md:gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
            {/* Date & Time */}
            <div className="flex gap-3 md:gap-4">
              <div className="w-12 h-12 md:w-10 md:h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Calendar className="w-6 h-6 md:w-5 md:h-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm md:text-base text-muted mb-1">日時</p>
                <p className="font-medium text-base md:text-lg text-gray-900">
                  {formatInTimeZone(
                    new Date(event.start_at!),
                    "Asia/Tokyo",
                    "yyyy年M月d日(E)",
                    { locale: ja }
                  )}
                </p>
                <p className="text-gray-700 text-sm md:text-base">
                  {formatInTimeZone(
                    new Date(event.start_at!),
                    "Asia/Tokyo",
                    "HH:mm",
                    { locale: ja }
                  )}
                  {" 〜 "}
                  {formatInTimeZone(
                    new Date(event.end_at!),
                    "Asia/Tokyo",
                    "HH:mm",
                    { locale: ja }
                  )}
                </p>
              </div>
            </div>

            {/* Location */}
            <div className="flex gap-3 md:gap-4">
              <div className="w-12 h-12 md:w-10 md:h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <MapPin className="w-6 h-6 md:w-5 md:h-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm md:text-base text-muted mb-1">場所</p>
                <p className="font-medium text-base md:text-lg text-gray-900">
                  {event.venue_name}
                </p>
                <p className="text-gray-700 text-sm md:text-base">
                  {event.address}
                </p>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    event.address!
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 mt-2 px-3 py-1.5 bg-primary/10 text-primary text-sm md:text-base font-medium rounded-lg hover:bg-primary/20 transition-colors min-h-[44px]"
                >
                  <MapPin className="w-4 h-4" />
                  Google Mapで見る
                </a>
              </div>
            </div>

            {/* Fee */}
            <div className="flex gap-3 md:gap-4">
              <div className="w-12 h-12 md:w-10 md:h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <JapaneseYen className="w-6 h-6 md:w-5 md:h-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm md:text-base text-muted mb-1">参加費</p>
                <p className="font-medium text-base md:text-lg text-gray-900">
                  {event.fee?.toLocaleString()}円
                </p>
              </div>
            </div>

            {/* Capacity */}
            <div className="flex gap-3 md:gap-4">
              <div className="w-12 h-12 md:w-10 md:h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Users className="w-6 h-6 md:w-5 md:h-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm md:text-base text-muted mb-1">
                  ビジター枠
                </p>
                <p className="font-medium text-base md:text-lg text-gray-900">
                  残り{event.remaining_spots}人
                  <span className="text-muted font-normal text-sm md:text-base">
                    ／{event.visitor_capacity}人
                  </span>
                </p>
              </div>
            </div>

            {/* Deadline */}
            {event.application_deadline && (
              <div className="flex gap-3 md:gap-4">
                <div className="w-12 h-12 md:w-10 md:h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-6 h-6 md:w-5 md:h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm md:text-base text-muted mb-1">
                    募集締切
                  </p>
                  <p className="font-medium text-base md:text-lg text-gray-900">
                    {formatInTimeZone(
                      new Date(event.application_deadline),
                      "Asia/Tokyo",
                      "M月d日(E) HH:mm",
                      { locale: ja }
                    )}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          <section className="mb-6 md:mb-8">
            <h2 className="text-lg md:text-xl lg:text-2xl font-semibold text-gray-900 mb-3 md:mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 md:w-6 md:h-6 text-primary" />
              練習会について
            </h2>
            <p className="text-base md:text-lg text-gray-700 whitespace-pre-wrap leading-relaxed">
              {event.description}
            </p>
          </section>

          {/* Participation Rules */}
          <section className="mb-6 p-4 bg-primary/5 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-primary" />
              参加条件
            </h2>
            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
              {event.participation_rules}
            </p>
          </section>

          {/* Equipment */}
          {event.equipment && (
            <section className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Package className="w-5 h-5 text-primary" />
                持ち物
              </h2>
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                {event.equipment}
              </p>
            </section>
          )}

          {/* Notes */}
          {event.notes && (
            <section className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-warning" />
                注意事項
              </h2>
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                {event.notes}
              </p>
            </section>
          )}

          {/* CTA Section */}
          <div className="mt-8 pt-6 border-t border-border md:static sticky bottom-0 bg-white/95 backdrop-blur-sm pb-4 md:pb-0 -mx-4 px-4 md:mx-0 md:px-0 md:bg-transparent shadow-lg md:shadow-none">
            {isHost ? (
              <div className="flex flex-col sm:flex-row gap-3">
                <NavigationLink
                  href={`/events/${id}/edit`}
                  className="btn btn-secondary text-base min-h-[48px] md:min-h-[44px]"
                >
                  編集する
                </NavigationLink>
                <NavigationLink
                  href={`/events/${id}/applications`}
                  className="btn btn-primary text-base min-h-[48px] md:min-h-[44px]"
                >
                  申請を管理
                </NavigationLink>
              </div>
            ) : (
              <ApplyButton
                eventId={id}
                isLoggedIn={!!user}
                canApply={canApply}
                existingApplication={existingApplication}
                isCanceled={isCanceled}
                isFull={isFull}
              />
            )}
          </div>
        </article>
      </div>
    </>
  );
}
