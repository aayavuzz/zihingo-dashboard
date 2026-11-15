"use client";

import { useEffect, useState } from "react";
import { Bell, BellOff } from "lucide-react";
import { subscribeToPush, unsubscribeFromPush } from "@/app/(app)/profil/actions";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) outputArray[i] = rawData.charCodeAt(i);
  return outputArray;
}

type Status = "checking" | "unsupported" | "denied" | "off" | "on" | "busy";

export function PushSubscribe({ vapidPublicKey }: { vapidPublicKey: string }) {
  const [status, setStatus] = useState<Status>("checking");

  useEffect(() => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      setStatus("unsupported");
      return;
    }
    if (Notification.permission === "denied") {
      setStatus("denied");
      return;
    }
    navigator.serviceWorker.ready.then(async (reg) => {
      const sub = await reg.pushManager.getSubscription();
      setStatus(sub ? "on" : "off");
    });
  }, []);

  async function handleSubscribe() {
    setStatus("busy");
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      setStatus(permission === "denied" ? "denied" : "off");
      return;
    }
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey) as BufferSource,
    });
    await subscribeToPush(sub.toJSON() as { endpoint: string; keys: { p256dh: string; auth: string } });
    setStatus("on");
  }

  async function handleUnsubscribe() {
    setStatus("busy");
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    if (sub) {
      await sub.unsubscribe();
      await unsubscribeFromPush(sub.endpoint);
    }
    setStatus("off");
  }

  if (status === "checking" || status === "unsupported") return null;

  return (
    <div className="flex items-center justify-between gap-3 mt-5 pt-5 border-t border-slate-100">
      <div className="flex items-center gap-2.5">
        {status === "on" ? (
          <Bell size={16} className="text-brand-600 shrink-0" />
        ) : (
          <BellOff size={16} className="text-slate-400 shrink-0" />
        )}
        <div>
          <div className="text-sm font-medium text-slate-700">Bildirimler</div>
          <div className="text-xs text-slate-400">
            {status === "denied"
              ? "Tarayıcı ayarlarından bildirim izni engellenmiş"
              : status === "on"
                ? "Arama saati yaklaşan talepler için bildirim açık"
                : "Arama saati yaklaşan talepler için bildirim al"}
          </div>
        </div>
      </div>
      {status !== "denied" && (
        <button
          type="button"
          disabled={status === "busy"}
          onClick={status === "on" ? handleUnsubscribe : handleSubscribe}
          className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-50 ${
            status === "on"
              ? "bg-slate-100 text-slate-600 hover:bg-slate-200"
              : "bg-brand-600 text-white hover:bg-brand-700"
          }`}
        >
          {status === "on" ? "Kapat" : "Aç"}
        </button>
      )}
    </div>
  );
}
