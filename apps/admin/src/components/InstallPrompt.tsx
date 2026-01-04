"use client";

import { useEffect, useMemo, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

function isIOS() {
  if (typeof window === "undefined") return false;
  const ua = window.navigator.userAgent.toLowerCase();
  return /iphone|ipad|ipod/.test(ua);
}

function isStandalone() {
  if (typeof window === "undefined") return false;
  // iOS Safari
  const nav: any = window.navigator;
  if (typeof nav.standalone === "boolean") return nav.standalone;
  // Modern browsers
  return window.matchMedia?.("(display-mode: standalone)")?.matches ?? false;
}

export default function InstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  const ios = useMemo(() => isIOS(), []);
  const standalone = useMemo(() => isStandalone(), []);

  useEffect(() => {
    if (standalone) return;

    const dismissed = localStorage.getItem("dinein_admin_install_dismissed");
    if (dismissed === "true") return;

    // Android/Desktop: real install prompt event
    const onBIP = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      setVisible(true);
    };

    window.addEventListener("beforeinstallprompt", onBIP);

    // iOS: no beforeinstallprompt; show helper sheet
    if (ios) {
      setVisible(true);
    }

    return () => window.removeEventListener("beforeinstallprompt", onBIP);
  }, [ios, standalone]);

  const dismiss = () => {
    localStorage.setItem("dinein_admin_install_dismissed", "true");
    setVisible(false);
  };

  const install = async () => {
    if (!deferred) return;
    await deferred.prompt();
    try {
      const choice = await deferred.userChoice;
      // Hide regardless; user can re-open via browser UI if needed
      setDeferred(null);
      setVisible(false);
      localStorage.setItem("dinein_admin_install_dismissed", "true");
      void choice;
    } catch {
      // ignore
      setDeferred(null);
      setVisible(false);
    }
  };

  if (!visible || standalone) return null;

  const showInstallButton = !!deferred;

  return (
    <div className="fixed bottom-6 left-0 right-0 z-[9999] px-4">
      <div className="mx-auto max-w-md rounded-3xl border border-white/10 bg-black/60 backdrop-blur-xl p-4 shadow-2xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-base font-semibold text-white">Install DineIn Admin</div>
            {ios ? (
              <div className="mt-1 text-sm text-white/80">
                On iPhone/iPad: tap <span className="font-semibold">Share</span> →{" "}
                <span className="font-semibold">Add to Home Screen</span>.
              </div>
            ) : (
              <div className="mt-1 text-sm text-white/80">
                Get a faster, app-like experience. Works offline for basic shell.
              </div>
            )}
          </div>

          <button
            onClick={dismiss}
            className="rounded-full px-3 py-1 text-sm text-white/70 hover:text-white hover:bg-white/10"
            aria-label="Dismiss"
          >
            ✕
          </button>
        </div>

        <div className="mt-4 flex gap-2">
          {showInstallButton ? (
            <button
              onClick={install}
              className="flex-1 rounded-2xl bg-white text-black px-4 py-3 text-sm font-semibold hover:opacity-90"
            >
              Install
            </button>
          ) : (
            <button
              onClick={dismiss}
              className="flex-1 rounded-2xl bg-white/10 text-white px-4 py-3 text-sm font-semibold hover:bg-white/15"
            >
              OK
            </button>
          )}

          <button
            onClick={dismiss}
            className="rounded-2xl bg-white/10 text-white px-4 py-3 text-sm font-semibold hover:bg-white/15"
          >
            Not now
          </button>
        </div>
      </div>
    </div>
  );
}
