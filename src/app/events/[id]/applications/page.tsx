import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { formatInTimeZone } from "date-fns-tz";
import { APPLICATION_STATUS } from "@/lib/constants";
import { ApplicationActions } from "@/components/applications/ApplicationActions";
import {
  ArrowLeft,
  Calendar,
  Users,
  CheckCircle,
  Clock,
  XCircle,
  Ban,
} from "lucide-react";
import clsx from "clsx";
import { NavigationLink } from "@/components/navigation/NavigationLink";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function ApplicationsPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect(`/login?redirectTo=/events/${id}/applications`);
  }

  // Get event
  const { data: event, error } = await supabase
    .from("events")
    .select("*")
    .eq("id", id)
    .eq("host_user_id", user.id)
    .single();

  if (error || !event) {
    notFound();
  }

  // Get applications with user profiles
  const { data: applications } = await supabase
    .from("applications")
    .select(
      `
      *,
      profiles:user_id(display_name)
    `
    )
    .eq("event_id", id)
    .order("created_at", { ascending: false });

  // Get blocked users
  const { data: blockedUsers } = await supabase
    .from("host_blocks")
    .select("blocked_user_id")
    .eq("host_user_id", user.id);

  const blockedUserIds = new Set(
    blockedUsers?.map((b) => b.blocked_user_id) || []
  );

  // Get approved count
  const approvedCount =
    applications?.filter((a) => a.status === "approved").length || 0;
  const remainingSpots = event.visitor_capacity - approvedCount;

  const pendingApps = applications?.filter((a) => a.status === "pending") || [];
  const approvedApps =
    applications?.filter((a) => a.status === "approved") || [];
  const otherApps =
    applications?.filter((a) => ["rejected", "canceled"].includes(a.status)) ||
    [];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Breadcrumb */}
      <NavigationLink
        href="/dashboard"
        className="inline-flex items-center gap-2 text-muted hover:text-primary mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        ダッシュボードに戻る
      </NavigationLink>

      {/* Header */}
      <div className="card mb-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">申請管理</h1>
            <p className="text-muted">{event.title}</p>
            <div className="flex items-center gap-4 mt-2 text-sm text-muted">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {formatInTimeZone(
                  new Date(event.start_at),
                  "Asia/Tokyo",
                  "M月d日(E) HH:mm",
                  { locale: ja }
                )}
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                {approvedCount}/{event.visitor_capacity}人
                <span
                  className={clsx(
                    "ml-1",
                    remainingSpots > 0 ? "text-success" : "text-warning"
                  )}
                >
                  (残り{remainingSpots}枠)
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pending Applications */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-warning" />
          申請待ち
          {pendingApps.length > 0 && (
            <span className="badge badge-warning">{pendingApps.length}</span>
          )}
        </h2>

        {pendingApps.length === 0 ? (
          <div className="card text-center py-8 text-muted">
            現在申請待ちはありません
          </div>
        ) : (
          <div className="space-y-3">
            {pendingApps.map((app) => (
              <div key={app.id} className="card">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-gray-900">
                        {(app.profiles as { display_name: string })
                          ?.display_name || "名前なし"}
                      </span>
                      {blockedUserIds.has(app.user_id) && (
                        <span className="badge badge-error text-xs">
                          ブロック中
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted">
                      申請日:{" "}
                      {format(new Date(app.created_at), "M/d HH:mm", {
                        locale: ja,
                      })}
                    </p>
                    {app.comment && (
                      <p className="mt-2 text-sm text-gray-700 bg-muted-bg p-2 rounded">
                        {app.comment}
                      </p>
                    )}
                  </div>
                  <ApplicationActions
                    applicationId={app.id}
                    userId={app.user_id}
                    isBlocked={blockedUserIds.has(app.user_id)}
                    remainingSpots={remainingSpots}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Approved Applications */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-success" />
          承認済み（参加者名簿）
          {approvedApps.length > 0 && (
            <span className="badge badge-success">{approvedApps.length}</span>
          )}
        </h2>

        {approvedApps.length === 0 ? (
          <div className="card text-center py-8 text-muted">
            まだ承認済みの参加者はいません
          </div>
        ) : (
          <div className="card">
            <div className="divide-y divide-border">
              {approvedApps.map((app) => (
                <div
                  key={app.id}
                  className="py-3 first:pt-0 last:pb-0 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">
                      {(app.profiles as { display_name: string })
                        ?.display_name || "名前なし"}
                    </span>
                  </div>
                  <NavigationLink
                    href={`/events/${id}/chat/${app.user_id}`}
                    className="text-sm text-primary hover:underline"
                  >
                    連絡する
                  </NavigationLink>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Other Applications */}
      {otherApps.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <XCircle className="w-5 h-5 text-muted" />
            その他
          </h2>
          <div className="card">
            <div className="divide-y divide-border">
              {otherApps.map((app) => (
                <div
                  key={app.id}
                  className="py-3 first:pt-0 last:pb-0 flex items-center justify-between text-muted"
                >
                  <div>
                    <span>
                      {(app.profiles as { display_name: string })
                        ?.display_name || "名前なし"}
                    </span>
                    <span className="mx-2">·</span>
                    <span className="badge badge-muted text-xs">
                      {
                        APPLICATION_STATUS[
                          app.status as keyof typeof APPLICATION_STATUS
                        ]
                      }
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
