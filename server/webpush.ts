import webpush from "web-push";
import { ENV } from "./_core/env";

let initialized = false;

function ensureInit() {
  if (initialized) return;
  if (!ENV.vapidPublicKey || !ENV.vapidPrivateKey) {
    console.warn("[WebPush] VAPID keys not set — push notifications disabled");
    return;
  }
  webpush.setVapidDetails(
    "mailto:syllibai@gmail.com",
    ENV.vapidPublicKey,
    ENV.vapidPrivateKey
  );
  initialized = true;
}

export interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export async function sendPushNotification(
  subscription: PushSubscriptionData,
  payload: {
    title: string;
    body: string;
    icon?: string;
    badge?: string;
    tag?: string;
    url?: string;
  }
): Promise<void> {
  ensureInit();
  if (!initialized) return;

  await webpush.sendNotification(
    subscription as webpush.PushSubscription,
    JSON.stringify(payload),
    { TTL: 86400 } // 24 hours
  );
}

export async function sendDeadlinePushNotifications(
  subscriptions: PushSubscriptionData[],
  deadlines: Array<{ title: string; dueDate: number; subject?: string }>
): Promise<void> {
  ensureInit();
  if (!initialized || subscriptions.length === 0) return;

  const count = deadlines.length;
  const first = deadlines[0];
  const title = count === 1 ? `📚 Deadline: ${first.title}` : `📚 ${count} upcoming deadlines`;
  const body =
    count === 1
      ? `${first.subject ? `[${first.subject}] ` : ""}Due ${new Date(first.dueDate).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}`
      : deadlines
          .slice(0, 3)
          .map((d) => `• ${d.title}`)
          .join("\n") + (count > 3 ? `\n…and ${count - 3} more` : "");

  await Promise.allSettled(
    subscriptions.map((sub) =>
      sendPushNotification(sub, {
        title,
        body,
        icon: "/favicon.ico",
        badge: "/favicon.ico",
        tag: "deadline-reminder",
        url: "/planner",
      })
    )
  );
}
