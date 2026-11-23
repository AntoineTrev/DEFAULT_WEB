/**
 * Admin gateway: owns the PocketBase superuser credentials server-side and
 * exposes a narrow admin API. The caller's PocketBase token is verified with
 * `auth-refresh` and must belong to a `users` record with role `admin`.
 *
 * Env: PORT (3001), PB_URL (http://backend:8090),
 *      PB_ADMIN_EMAIL / PB_ADMIN_PASSWORD (required).
 */
import http from "node:http";

const PORT = Number(process.env.PORT ?? 3001);
const PB_URL = (process.env.PB_URL ?? "http://backend:8090").replace(/\/+$/, "");
const ADMIN_EMAIL = process.env.PB_ADMIN_EMAIL ?? "";
const ADMIN_PASSWORD = process.env.PB_ADMIN_PASSWORD ?? "";
const MAX_BODY_BYTES = 16 * 1024;
const USERS = "users";

if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    console.error("[admin-gateway] PB_ADMIN_EMAIL and PB_ADMIN_PASSWORD are required.");
    process.exit(1);
}

class HttpError extends Error {
    constructor(status, message) {
        super(message);
        this.status = status;
    }
}

function sendJson(res, status, payload) {
    res.writeHead(status, {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-store",
    });
    res.end(JSON.stringify(payload));
}

function upstreamStatus(status) {
    return status >= 400 && status < 500 ? status : 502;
}

function readJson(req) {
    return new Promise((resolve, reject) => {
        const chunks = [];
        let size = 0;
        let tooLarge = false;
        req.on("data", (chunk) => {
            size += chunk.length;
            if (size > MAX_BODY_BYTES) {
                if (!tooLarge) {
                    tooLarge = true;
                    reject(new HttpError(413, "Request body too large."));
                }
                return;
            }
            chunks.push(chunk);
        });
        req.on("end", () => {
            if (tooLarge) return;
            try {
                const text = Buffer.concat(chunks).toString("utf8");
                resolve(text ? JSON.parse(text) : {});
            } catch {
                reject(new HttpError(400, "Invalid JSON body."));
            }
        });
        req.on("error", () => {
            if (!tooLarge) reject(new HttpError(400, "Invalid request body."));
        });
    });
}

async function requireAdmin(req) {
    const match = /^Bearer\s+(\S+)$/i.exec(req.headers.authorization ?? "");
    if (!match) {
        throw new HttpError(401, "Unauthorized.");
    }
    let response;
    try {
        response = await fetch(`${PB_URL}/api/collections/${USERS}/auth-refresh`, {
            method: "POST",
            headers: { Authorization: match[1], "Content-Type": "application/json" },
        });
    } catch {
        throw new HttpError(502, "PocketBase unavailable.");
    }
    if (response.status === 403) {
        throw new HttpError(403, "Forbidden.");
    }
    if (!response.ok) {
        throw new HttpError(401, "Unauthorized.");
    }
    const data = await response.json().catch(() => null);
    if (data?.record?.role !== "admin") {
        throw new HttpError(403, "Forbidden: admin role required.");
    }
}

let superToken = "";
let superExpiresAt = 0;

async function getSuperToken(force = false) {
    if (!force && superToken && Date.now() < superExpiresAt) {
        return superToken;
    }
    let response;
    try {
        response = await fetch(`${PB_URL}/api/collections/_superusers/auth-with-password`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ identity: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
        });
    } catch {
        throw new HttpError(502, "PocketBase unavailable.");
    }
    if (!response.ok) {
        throw new HttpError(502, "PocketBase superuser authentication failed.");
    }
    const data = await response.json().catch(() => null);
    if (!data?.token) {
        throw new HttpError(502, "PocketBase superuser authentication failed.");
    }
    superToken = data.token;
    superExpiresAt = Date.now() + Math.max(1, Number(data.expiresIn) || 3600) * 1000 - 30000;
    return superToken;
}

async function superFetch(path, options = {}) {
    const send = (token) =>
        fetch(`${PB_URL}${path}`, {
            ...options,
            headers: { ...options.headers, Authorization: token },
        });
    let response;
    try {
        response = await send(await getSuperToken());
        if (response.status === 401) {
            response = await send(await getSuperToken(true));
        }
    } catch (error) {
        if (error instanceof HttpError) throw error;
        throw new HttpError(502, "PocketBase unavailable.");
    }
    return response;
}

async function listUsers() {
    const items = [];
    const perPage = 500;
    for (let page = 1; ; page += 1) {
        const response = await superFetch(
            `/api/collections/${USERS}/records?page=${page}&perPage=${perPage}`,
        );
        if (!response.ok) {
            throw new HttpError(upstreamStatus(response.status), "PocketBase request failed.");
        }
        const data = await response.json().catch(() => null);
        if (!Array.isArray(data?.items)) {
            throw new HttpError(502, "Unexpected PocketBase response.");
        }
        items.push(...data.items);
        if (data.items.length < perPage || items.length >= (data.totalItems ?? Infinity)) break;
    }
    return items;
}

async function setBlocked(id, blocked) {
    const response = await superFetch(`/api/collections/${USERS}/records/${encodeURIComponent(id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blocked }),
    });
    if (!response.ok) {
        throw new HttpError(upstreamStatus(response.status), "PocketBase request failed.");
    }
    const item = await response.json().catch(() => null);
    if (!item?.id) {
        throw new HttpError(502, "Unexpected PocketBase response.");
    }
    return item;
}

async function handleRequest(req, res) {
    const { pathname } = new URL(req.url ?? "/", "http://localhost");
    if (req.method === "GET" && pathname === "/health") {
        sendJson(res, 200, { status: "ok" });
        return;
    }

    const blockedMatch = /^\/users\/([^/]+)\/blocked$/.exec(pathname);
    if (pathname !== "/users" && !blockedMatch) {
        throw new HttpError(404, "Not found.");
    }

    await requireAdmin(req);

    if (req.method === "GET" && pathname === "/users") {
        sendJson(res, 200, { items: await listUsers() });
        return;
    }
    if (req.method === "PATCH" && blockedMatch) {
        const id = decodeURIComponent(blockedMatch[1]);
        if (!/^[\w-]+$/.test(id)) {
            throw new HttpError(400, "Invalid user id.");
        }
        const body = await readJson(req);
        if (!body || typeof body.blocked !== "boolean") {
            throw new HttpError(400, 'Expected { "blocked": boolean }.');
        }
        sendJson(res, 200, { item: await setBlocked(id, body.blocked) });
        return;
    }

    res.setHeader("Allow", blockedMatch ? "PATCH" : "GET");
    throw new HttpError(405, "Method not allowed.");
}

const server = http.createServer((req, res) => {
    handleRequest(req, res).catch((error) => {
        const known = error instanceof HttpError;
        if (res.headersSent) {
            res.end();
            return;
        }
        sendJson(res, known ? error.status : 502, {
            error: known ? error.message : "Upstream error.",
        });
    });
});

server.listen(PORT, () => {
    console.log(`[admin-gateway] listening on :${PORT}`);
});
