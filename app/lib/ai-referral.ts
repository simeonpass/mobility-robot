/** Recognise only known source hosts; never send arbitrary URL values to analytics. */
export function getAiReferralSource(href: string, referrer: string): string | null {
  const sources: Record<string, string> = {"chatgpt.com": "chatgpt", "chat.openai.com": "chatgpt", "perplexity.ai": "perplexity", "claude.ai": "claude", "gemini.google.com": "gemini", "copilot.microsoft.com": "copilot"};
  try {
    const tagged = new URL(href).searchParams.get("utm_source")?.toLowerCase();
    if (tagged && sources[tagged]) return sources[tagged];
    if (!referrer) return null;
    const host = new URL(referrer).hostname.toLowerCase();
    return Object.entries(sources).find(([domain]) => host === domain || host.endsWith(`.${domain}`))?.[1] ?? null;
  } catch { return null; }
}
