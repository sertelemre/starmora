import { getRequestLocale, translate } from "./locale";
export type Birth = {
  date: string;
  time: string;
  place: string;
  timezone: string;
};
export type Activation = { gate: number; line: number; longitude?: number };
export type Result = {
  type: string;
  strategy: string;
  authority: string;
  profile: string;
  definition: string;
  cross: string;
  centers: string[];
  gates: number[];
  channels: string[];
  personality: Record<string, Activation>;
  design: Record<string, Activation>;
  engine?: string;
  birthUtc?: string;
  designUtc?: string;
  nodeMethod?: string;
  warnings?: string[];
};
export type Chart = {
  id: string;
  name: string;
  birth: Birth;
  result: Result;
  provider: string;
  createdAt: string;
};
export type ReadingSection = {
  id: string;
  title: string;
  subtitle?: string;
  evidence: string[];
  paragraphs: string[];
  practice?: string;
  question?: string;
};
export type Reading = {
  version: string;
  introduction: string;
  summary: string;
  sections: ReadingSection[];
  centers: ReadingSection[];
  channels: ReadingSection[];
  gates: ReadingSection[];
  practice: string[];
  sources: { title: string; url: string }[];
};
export type User = { id: string; name: string; email: string };
export type Session = {
  user: User | null;
  providerReady: boolean;
  provider: string;
};
export type Location = { value: string; timezone: string };
export async function api<T>(path: string, options?: RequestInit): Promise<T> {
  const controller = new AbortController();
  const cancel = () => controller.abort();
  if (options?.signal?.aborted) cancel();
  else options?.signal?.addEventListener("abort", cancel, { once: true });
  const timer = setTimeout(cancel, 30_000);
  try {
    const response = await fetch("/api" + path, {
      ...options,
      signal: controller.signal,
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json",
        "Accept-Language": getRequestLocale(),
        ...options?.headers,
      },
    });
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      throw new Error(
        translate(
          body.errorKey ||
            body.error ||
            "Bağlantı kurulamadı. Lütfen tekrar deneyin.",
        ),
      );
    }
    if (response.status === 204) return undefined as T;
    return response.json();
  } catch (error) {
    if (controller.signal.aborted && !options?.signal?.aborted) {
      throw new Error(
        translate(
          "İstek zaman aşımına uğradı. Bağlantını kontrol edip tekrar dene.",
        ),
      );
    }
    if (error instanceof TypeError)
      throw new Error(
        translate("Sunucuya ulaşılamadı. Bağlantını kontrol edip tekrar dene."),
      );
    throw error;
  } finally {
    clearTimeout(timer);
    options?.signal?.removeEventListener("abort", cancel);
  }
}
// Deliberately static UI preview. Never calculated from or saved as user data.
export const preview: Result = {
  type: "Manifesting Generator",
  strategy: "To Respond",
  authority: "Emotional - Solar Plexus",
  profile: "2 / 4",
  definition: "Split Definition",
  cross: "",
  centers: ["ajna", "throat", "solar plexus", "sacral", "root"],
  gates: [
    1, 2, 3, 7, 10, 11, 12, 13, 22, 23, 26, 27, 30, 42, 49, 51, 53, 54, 56, 60,
    61, 63,
  ],
  channels: ["11-56", "12-22", "42-53", "3-60"],
  personality: {
    Sun: { gate: 2, line: 2 },
    Earth: { gate: 1, line: 2 },
    Moon: { gate: 23, line: 2 },
    Mercury: { gate: 3, line: 2 },
    Venus: { gate: 51, line: 3 },
    Mars: { gate: 12, line: 1 },
  },
  design: {
    Sun: { gate: 13, line: 4 },
    Earth: { gate: 7, line: 4 },
    Moon: { gate: 30, line: 2 },
    Mercury: { gate: 49, line: 3 },
    Venus: { gate: 10, line: 5 },
    Mars: { gate: 42, line: 4 },
  },
};
