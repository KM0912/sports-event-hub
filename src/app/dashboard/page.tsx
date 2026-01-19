import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ja } from "date-fns/locale";
import { formatInTimeZone } from "date-fns-tz";
import { EVENT_STATUS, LEVELS, LevelKey } from "@/lib/constants";
import {
  Plus,
  Calendar,
  MapPin,
  Users,
  Clock,
  Edit,
  Eye,
  UserCheck,
  Copy,
} from "lucide-react";
import clsx from "clsx";
import { Metadata } from "next";
import { NavigationLink } from "@/components/navigation/NavigationLink";

export const metadata: Metadata = {
  title: "主催者ダッシュボード",
  description: "練習会の作成・管理、参加申請の確認ができる主催者専用ページ。",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login?redirectTo=/dashboard");
  }

  // Get user's events with pending application count
  const { data: events } = await supabase
    .from("events")
    .select(
      `
      *,
      applications(count)
    `
    )
    .eq("host_user_id", user.id)
    .order("start_at", { ascending: false });

  // Get pending applications count for each event
  const eventsWithCounts = await Promise.all(
    (events || []).map(async (event) => {
      const { count: pendingCount } = await supabase
        .from("applications")
        .select("*", { count: "exact", head: true })
        .eq("event_id", event.id)
        .eq("status", "pending");

      const { count: approvedCount } = await supabase
        .from("applications")
        .select("*", { count: "exact", head: true })
        .eq("event_id", event.id)
        .eq("status", "approved");

      return {
        ...event,
        pendingCount: pendingCount ?? 0,
        approvedCount: approvedCount ?? 0,
        remainingSpots: event.visitor_capacity - (approvedCount ?? 0),
      };
    })
  );

  const upcomingEvents = eventsWithCounts.filter(
    (e) => new Date(e.start_at) >= new Date() && e.status !== "canceled"
  );
  const pastEvents = eventsWithCounts.filter(
    (e) => new Date(e.start_at) < new Date() || e.status === "canceled"
  );

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 md:mb-8 lg:mb-10">
        <div>
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900">
            主催者ダッシュボード
          </h1>
          <p className="text-sm md:text-base lg:text-lg text-muted mt-1 md:mt-2">
            練習会の管理・参加申請の確認
          </p>
        </div>
        <NavigationLink
          href="/events/new"
          className="btn btn-primary w-full sm:w-auto text-base min-h-[48px] sm:min-h-[44px]"
        >
          <Plus className="w-5 h-5 md:w-4 md:h-4" />
          練習会を作成
        </NavigationLink>
      </div>

      {/* Upcoming Events */}
      <section className="mb-12">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" />
          開催予定の練習会
          {upcomingEvents.length > 0 && (
            <span className="badge badge-primary">{upcomingEvents.length}</span>
          )}
        </h2>

        {upcomingEvents.length === 0 ? (
          <div className="card text-center py-12">
            <Calendar className="w-12 h-12 mx-auto text-muted mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              開催予定の練習会はありません
            </h3>
            <p className="text-muted">
              新しい練習会を作成してビジターを募集しましょう
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            {upcomingEvents.map((event, index) => (
              <div
                key={event.id}
                className={`card animate-fade-in stagger-${Math.min(
                  index + 1,
                  5
                )}`}
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={clsx("badge", {
                        "badge-success": event.remainingSpots > 0,
                        "badge-warning": event.remainingSpots <= 0,
                      })}
                    >
                      {event.remainingSpots > 0
                        ? EVENT_STATUS.published
                        : "満員"}
                    </span>
                    <span className="badge badge-primary">
                      {LEVELS[event.level as LevelKey]}
                    </span>
                    {event.pendingCount > 0 && (
                      <span className="badge badge-warning animate-pulse-soft">
                        {event.pendingCount}件の申請待ち
                      </span>
                    )}
                  </div>
                  <div className="flex items-center">
                    <NavigationLink
                      href={`/events/${event.id}`}
                      className="flex flex-col items-center px-2 py-1 text-muted hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      <span className="text-[10px] whitespace-nowrap">詳細</span>
                    </NavigationLink>
                    <NavigationLink
                      href={`/events/${event.id}/edit`}
                      className="flex flex-col items-center px-2 py-1 text-muted hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                      <span className="text-[10px] whitespace-nowrap">編集</span>
                    </NavigationLink>
                    <NavigationLink
                      href={`/events/new?copy=${event.id}`}
                      className="flex flex-col items-center px-2 py-1 text-muted hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <Copy className="w-4 h-4" />
                      <span className="text-[10px] whitespace-nowrap">コピー</span>
                    </NavigationLink>
                  </div>
                </div>
                <NavigationLink
                  href={`/events/${event.id}`}
                  className="block hover:text-primary transition-colors"
                >
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {event.title}
                  </h3>
                </NavigationLink>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted mb-4">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {formatInTimeZone(
                      new Date(event.start_at),
                      "Asia/Tokyo",
                      "M/d(E) HH:mm",
                      { locale: ja }
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {event.venue_name}
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {event.approvedCount}/{event.visitor_capacity}人
                  </div>
                </div>
                <NavigationLink
                  href={`/events/${event.id}/applications`}
                  className={clsx(
                    "btn w-full",
                    event.pendingCount > 0 ? "btn-primary" : "btn-secondary"
                  )}
                >
                  <UserCheck className="w-4 h-4" />
                  申請管理
                  {event.pendingCount > 0 && (
                    <span className="ml-1 font-bold">
                      ({event.pendingCount})
                    </span>
                  )}
                </NavigationLink>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Past Events */}
      {pastEvents.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-muted" />
            過去の練習会
          </h2>
          <div className="space-y-3">
            {pastEvents.slice(0, 5).map((event) => (
              <div key={event.id} className="card opacity-70">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {event.status === "canceled" ? (
                        <span className="badge badge-error">中止</span>
                      ) : (
                        <span className="badge badge-muted">終了</span>
                      )}
                    </div>
                    <h3 className="font-medium text-gray-700 truncate">{event.title}</h3>
                    <p className="text-sm text-muted">
                      {formatInTimeZone(
                        new Date(event.start_at),
                        "Asia/Tokyo",
                        "yyyy/M/d(E)",
                        { locale: ja }
                      )}
                      {" · "}
                      参加者{event.approvedCount}人
                    </p>
                  </div>
                  <div className="flex items-center flex-shrink-0">
                    <NavigationLink
                      href={`/events/${event.id}`}
                      className="flex flex-col items-center px-2 py-1 text-muted hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      <span className="text-[10px] whitespace-nowrap">詳細</span>
                    </NavigationLink>
                    <NavigationLink
                      href={`/events/new?copy=${event.id}`}
                      className="flex flex-col items-center px-2 py-1 text-muted hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <Copy className="w-4 h-4" />
                      <span className="text-[10px] whitespace-nowrap">コピー</span>
                    </NavigationLink>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
