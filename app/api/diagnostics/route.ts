import { NextResponse } from "next/server";

function maskKey(key: string | undefined) {
  if (!key) return undefined;
  if (key.length <= 8) return key[0] + "***";
  return key.slice(0, 4) + "…" + key.slice(-4);
}

function parseChannelInput(input?: string | null): { kind: "id" | "url" | "handle" | "unknown"; value?: string } {
  if (!input) return { kind: "unknown" };
  const s = input.trim();
  if (/^UC[\w-]{20,}$/.test(s)) return { kind: "id", value: s };
  if (/^https?:\/\//i.test(s)) return { kind: "url", value: s };
  if (/^@/.test(s)) return { kind: "handle", value: s };
  return { kind: "unknown", value: s };
}

async function resolveChannelId(raw: string, key: string): Promise<{ id?: string; title?: string; url?: string }> {
  const parsed = parseChannelInput(raw);
  let id: string | undefined;
  let title: string | undefined;
  let url: string | undefined;

  if (parsed.kind === "id" && parsed.value) {
    id = parsed.value;
  } else if (parsed.kind === "url" && parsed.value) {
    // Try to extract UC… from /channel/UC…
    const m = parsed.value.match(/\/channel\/(UC[\w-]{20,})/i);
    if (m) id = m[1];
  }

  if (!id) {
    // Fallback: search the handle or string as a channel query
    const q = encodeURIComponent(raw);
    const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&maxResults=5&q=${q}&key=${key}`;
    const resp = await fetch(searchUrl, { cache: "no-store" });
    if (resp.ok) {
      const data = await resp.json();
      const item = data?.items?.[0];
      if (item?.snippet && item?.id?.channelId) {
        id = item.id.channelId;
        title = item.snippet.channelTitle;
        url = `https://www.youtube.com/channel/${id}`;
      }
    }
  }

  if (id && !title) {
    // Fetch channel snippet for title/url
    const chUrl = `https://www.googleapis.com/youtube/v3/channels?part=snippet&id=${id}&key=${key}`;
    const r = await fetch(chUrl, { cache: "no-store" });
    if (r.ok) {
      const data = await r.json();
      const item = data?.items?.[0];
      title = item?.snippet?.title;
      url = `https://www.youtube.com/channel/${id}`;
    }
  }

  return { id, title, url };
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const channelInput = searchParams.get("channel") || "UC-sgxA1fdoxteLNzRAUHIxA"; // Town of Nantucket
  const overrideKey = searchParams.get("ytkey") || undefined;
  const key = overrideKey || process.env.YT_API_KEY;

  const checks = {
    hasEnvKey: !!process.env.YT_API_KEY,
    youtubeApiReachable: false,
    channelFound: false
  };

  if (!key) {
    return NextResponse.json(
      {
        ok: false,
        checks,
        error: "No API key provided. Set YT_API_KEY on the server or pass ?ytkey=… for testing."
      },
      { status: 200 }
    );
  }

  let channel = { id: undefined as string | undefined, title: undefined as string | undefined, url: undefined as string | undefined };
  let debug: any = {};

  try {
    // Verify API reachable with a lightweight call
    const pingUrl = `https://www.googleapis.com/youtube/v3/channels?part=id&id=UC_x5XG1OV2P6uZZ5FSM9Ttw&key=${key}`; // Google Developers channel
    const pingResp = await fetch(pingUrl, { cache: "no-store" });
    checks.youtubeApiReachable = pingResp.ok;

    // Resolve channel id/title
    channel = await resolveChannelId(channelInput, key);
    checks.channelFound = !!channel.id;
    debug = { resolvedChannel: channel };
  } catch (e: any) {
    return NextResponse.json(
      {
        ok: false,
        checks,
        error: e?.message || "Unknown error during diagnostics",
        keyMasked: maskKey(key),
        usedOverrideKey: !!overrideKey
      },
      { status: 200 }
    );
  }

  return NextResponse.json(
    {
      ok: checks.hasEnvKey || !!overrideKey,
      checks,
      channel,
      keyMasked: maskKey(key),
      usedOverrideKey: !!overrideKey,
      debug
    },
    { status: 200 }
  );
}