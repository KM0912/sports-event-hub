import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ja } from "date-fns/locale";
import { formatInTimeZone } from "date-fns-tz";
import { APPLICATION_STATUS, LEVELS, LevelKey } from "@/lib/constants";
import {
  Calendar,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  MessageCircle,
  User,
  Settings,
} from "lucide-react";
import clsx from "clsx";
import { Metadata } from "next";
import { NavigationLink } from "@/components/navigation/NavigationLink";

export const metadata: Metadata = {
  title: "マイページ",
  description: "申請状況の確認、参加予定の練習会、参加履歴を確認できます。",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function MyPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login?redirectTo=/mypage");
  }

  // Get user profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", user.id)
    .single();

  // Get user's applications with event details
  const { data: applications } = await supabase
    .from("applications")
    .select(
      `
      *,
      events(
        id,
        title,
        start_at,
        end_at,
        venue_name,
        city,
        level,
        status,
        chat_expires_at,
        host_user_id,
        profiles:host_user_id(display_name)
      )
    `
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const now = new Date();

  // Separate applications by status
  const pendingApps = applications?.filter((a) => a.status === "pending") || [];
  const approvedUpcoming =
    applications?.filter(
      (a) =>
        a.status === "approved" &&
        a.events &&
        new Date(a.events.start_at) >= now
    ) || [];
  const approvedPast =
    applications?.filter(
      (a) =>
        a.status === "approved" && a.events && new Date(a.events.start_at) < now
    ) || [];
  const rejectedApps =
    applications?.filter((a) => a.status === "rejected") || [];
  const canceledApps =
    applications?.filter((a) => a.status === "canceled") || [];

  return (
    <div className="max-w-6xl mx-auto">
      {/* Profile Header */}
      <div className="card mb-6 md:mb-8 p-4 md:p-6 lg:p-8">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 md:gap-4 lg:gap-6">
            <div className="w-16 h-16 md:w-14 md:h-14 lg:w-16 lg:h-16 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <User className="w-8 h-8 md:w-7 md:h-7 lg:w-8 lg:h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900">
                {profile?.display_name || "ユーザー"}
              </h1>
              <p className="text-sm md:text-base lg:text-lg text-muted">
                マイページ
              </p>
            </div>
          </div>
          <NavigationLink
            href="/profile/edit"
            className="btn btn-ghost text-base min-h-[44px] flex-shrink-0"
          >
            <Settings className="w-5 h-5 md:w-4 md:h-4" />
            <span className="hidden sm:inline">編集</span>
          </NavigationLink>
        </div>
      </div>

      {/* Pending Applications */}
      {pendingApps.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-warning" />
            申請中
            <span className="badge badge-warning">{pendingApps.length}</span>
          </h2>
          <div className="space-y-3">
            {pendingApps.map((app) => (
              <ApplicationCard key={app.id} application={app} type="pending" />
            ))}
          </div>
        </section>
      )}

      {/* Approved Upcoming */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-success" />
          参加予定
          {approvedUpcoming.length > 0 && (
            <span className="badge badge-success">
              {approvedUpcoming.length}
            </span>
          )}
        </h2>
        {approvedUpcoming.length === 0 ? (
          <div className="card text-center py-12">
            <Calendar className="w-12 h-12 mx-auto text-muted mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              参加予定の練習会はありません
            </h3>
            <p className="text-muted mb-4">練習会を探して参加してみましょう</p>
            <NavigationLink href="/" className="btn btn-primary inline-flex">
              練習会を探す
            </NavigationLink>
          </div>
        ) : (
          <div className="space-y-3">
            {approvedUpcoming.map((app) => (
              <ApplicationCard key={app.id} application={app} type="approved" />
            ))}
          </div>
        )}
      </section>

      {/* Past Events */}
      {approvedPast.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-muted" />
            参加履歴
          </h2>
          <div className="space-y-3">
            {approvedPast.slice(0, 5).map((app) => (
              <ApplicationCard key={app.id} application={app} type="past" />
            ))}
          </div>
        </section>
      )}

      {/* Rejected Applications */}
      {rejectedApps.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <XCircle className="w-5 h-5 text-muted" />
            不参加
          </h2>
          <div className="space-y-3">
            {rejectedApps.map((app) => (
              <div key={app.id} className="card opacity-60">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-700">
                      {app.events?.title}
                    </h3>
                    <p className="text-sm text-muted mt-1">
                      今回は条件に合わなかったため参加いただけませんでした
                    </p>
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

type ApplicationCardProps = {
  application: {
    id: string;
    status: string;
    events: {
      id: string;
      title: string;
      start_at: string;
      end_at: string;
      venue_name: string;
      city: string;
      level: string;
      status: string;
      chat_expires_at: string;
      host_user_id: string;
      profiles: { display_name: string } | null;
    } | null;
  };
  type: "pending" | "approved" | "past";
};

function ApplicationCard({ application, type }: ApplicationCardProps) {
  const event = application.events;
  if (!event) return null;

  const isCanceled = event.status === "canceled";
  const canChat =
    type === "approved" && new Date() <= new Date(event.chat_expires_at);

  return (
    <div className={clsx("card", type === "past" && "opacity-70")}>
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            {isCanceled && <span className="badge badge-error">中止</span>}
            <span className="badge badge-primary">
              {LEVELS[event.level as LevelKey]}
            </span>
            {type === "pending" && (
              <span className="badge badge-warning">承認待ち</span>
            )}
          </div>
          <NavigationLink
            href={`/events/${event.id}`}
            className="font-semibold text-gray-900 hover:text-primary transition-colors"
          >
            {event.title}
          </NavigationLink>
          <div className="flex flex-wrap gap-3 mt-2 text-sm text-muted">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
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
              <User className="w-4 h-4" />
              {event.profiles?.display_name || "主催者"}
            </div>
          </div>
        </div>

        {type === "approved" && !isCanceled && (
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            {canChat && (
              <NavigationLink
                href={`/events/${event.id}/chat`}
                className="btn btn-secondary text-base min-h-[44px]"
              >
                <MessageCircle className="w-5 h-5 md:w-4 md:h-4" />
                連絡する
              </NavigationLink>
            )}
          </div>
        )}

        {type === "pending" && (
          <NavigationLink
            href={`/events/${event.id}`}
            className="btn btn-ghost text-base min-h-[44px] w-full sm:w-auto"
          >
            詳細を見る
          </NavigationLink>
        )}
      </div>
    </div>
  );
}
