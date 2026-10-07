import { useEffect, useState } from "react";
import { Auth, BirthForm, ChartView } from "./App";
import { api } from "./types";
import type { Chart, Session } from "./types";
import { useLocale } from "./locale";

export default function HomeCalculator() {
  const { locale, t } = useLocale();
  const [session, setSession] = useState<Session | null>(null);
  const [chart, setChart] = useState<Chart | null>(null);
  const [auth, setAuth] = useState(false);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    api<Session>("/session", { signal: controller.signal })
      .then(setSession)
      .catch((e: Error) => {
        if (!controller.signal.aborted) setError(e.message);
      });
    return () => controller.abort();
  }, [attempt]);
  return (
    <>
      {error && (
        <p className="error" role="alert">
          {t(error)}{" "}
          <button
            className="text-link"
            onClick={() => {
              setError("");
              setAttempt((value) => value + 1);
            }}
          >
            {t("Tekrar dene")}
          </button>
        </p>
      )}
      <div className="workspace-grid home-workspace">
        <BirthForm
          ready={!!session?.providerReady}
          provider={session?.provider}
          onCreated={setChart}
          openRegister={() => setAuth(true)}
          signedIn={!!session?.user}
        />
        <ChartView chart={chart} />
      </div>
      <p className="home-workspace-link">
        <a
          className="button"
          href={locale === "en" ? "/en/chart/#charts" : "/tr/harita/#charts"}
        >
          {t("Haritalarım")} →
        </a>
      </p>
      {auth && (
        <Auth
          mode="register"
          close={() => setAuth(false)}
          onSuccess={(user) => {
            setSession((old) => (old ? { ...old, user } : null));
          }}
        />
      )}
    </>
  );
}
