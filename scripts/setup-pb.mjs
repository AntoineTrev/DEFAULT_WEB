/**
 * Idempotent PocketBase setup for DEFAULT_WEB: fields, index, identity,
 * collection rules and the app admin user.
 *
 * Env: PB_URL (default http://localhost:${BACKEND_PORT:-8090}),
 *      BACKEND_ADMIN_EMAIL / BACKEND_ADMIN_PASSWORD (PocketBase superuser),
 *      ADMIN_NAME / ADMIN_EMAIL / ADMIN_PASSWORD (app admin user, dev defaults).
 */
const PB_URL = (
    process.env.PB_URL ?? `http://localhost:${process.env.BACKEND_PORT || "8090"}`
).replace(/\/+$/, "");
const BACKEND_ADMIN_EMAIL = process.env.BACKEND_ADMIN_EMAIL ?? "";
const BACKEND_ADMIN_PASSWORD = process.env.BACKEND_ADMIN_PASSWORD ?? "";
const ADMIN_NAME = process.env.ADMIN_NAME ?? "admin";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "admin@default-web.local";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "dev-admin-1234";
const USERS = "users";

if (!BACKEND_ADMIN_EMAIL || !BACKEND_ADMIN_PASSWORD) {
    console.error("BACKEND_ADMIN_EMAIL and BACKEND_ADMIN_PASSWORD are required.");
    process.exit(1);
}

async function api(path, { method = "GET", token, body } = {}) {
    const headers = { "Content-Type": "application/json" };
    if (token) {
        headers.Authorization = token;
    }
    const response = await fetch(`${PB_URL}${path}`, {
        method,
        headers,
        ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    });
    if (!response.ok) {
        // Never include the response body: it may echo submitted credentials.
        throw new Error(`${method} ${path.split("?")[0]} failed (${response.status})`);
    }
    return response.status === 204 ? null : response.json();
}

async function getSuperToken() {
    const data = await api("/api/collections/_superusers/auth-with-password", {
        method: "POST",
        body: { identity: BACKEND_ADMIN_EMAIL, password: BACKEND_ADMIN_PASSWORD },
    });
    if (!data?.token) {
        throw new Error("Superuser authentication failed.");
    }
    return data.token;
}

async function patchUsers(token, body) {
    await api(`/api/collections/${USERS}`, { method: "PATCH", token, body });
}

async function configureUsers(token) {
    console.log(`  configuring "${USERS}" collection`);
    let collection = await api(`/api/collections/${USERS}`, { token });
    let fields = Array.isArray(collection.fields) ? [...collection.fields] : [];
    let indexes = Array.isArray(collection.indexes) ? [...collection.indexes] : [];

    // PocketBase rejects adding several new fields in a single PATCH.
    for (const field of [
        {
            name: "role",
            type: "text",
            extra: {
                autogeneratePattern: "",
                help: "",
                hidden: false,
                max: 0,
                min: 0,
                pattern: "",
                presentable: false,
                primaryKey: false,
                required: false,
                system: false,
            },
        },
        {
            name: "blocked",
            type: "bool",
            extra: { help: "", hidden: false, presentable: false, required: false, system: false },
        },
        {
            name: "lastLogin",
            type: "date",
            extra: { help: "", hidden: false, presentable: false, required: false, system: false },
        },
    ]) {
        if (fields.some((item) => item.name === field.name)) {
            console.log(`  = field "${field.name}" already present`);
            continue;
        }
        fields = [...fields, { name: field.name, type: field.type, ...field.extra }];
        await patchUsers(token, { fields });
        console.log(`  + added field "${field.name}"`);
    }

    // SQLite string literals must use double quotes in a PocketBase index expression.
    const nameIndex = `CREATE UNIQUE INDEX \`idx_name__pb_${USERS}\` ON \`${USERS}\` (\`name\`) WHERE \`name\` != ""`;
    if (!indexes.includes(nameIndex)) {
        indexes = [...indexes, nameIndex];
        await patchUsers(token, { indexes });
        console.log('  + added UNIQUE index on "name"');
    } else {
        console.log('  = UNIQUE index on "name" already present');
    }

    const passwordAuth = { ...(collection.passwordAuth ?? {}) };
    const identityFields = Array.isArray(passwordAuth.identityFields) ? passwordAuth.identityFields : [];
    if (!identityFields.includes("name")) {
        await patchUsers(token, {
            passwordAuth: { ...passwordAuth, enabled: true, identityFields: [...new Set([...identityFields, "name"])] },
        });
        console.log('  + added "name" to passwordAuth identity fields');
    } else {
        console.log('  = "name" already a passwordAuth identity');
    }

    const ownRecord = "id = @request.auth.id";
    if (
        collection.listRule !== ownRecord ||
        collection.viewRule !== ownRecord ||
        collection.updateRule !== ownRecord ||
        collection.createRule !== "" ||
        collection.deleteRule !== null
    ) {
        await patchUsers(token, {
            listRule: ownRecord,
            viewRule: ownRecord,
            createRule: "",
            updateRule: ownRecord,
            deleteRule: null,
        });
        console.log("  + aligned collection rules (own record only, registration open)");
    }

    console.log(`  ✓ collection "${USERS}" configured`);
}

async function ensureAdminUser(token) {
    console.log("  ensuring app admin user");
    const escaped = ADMIN_EMAIL.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
    const filter = `email="${escaped}"`;
    const list = await api(
        `/api/collections/${USERS}/records?filter=${encodeURIComponent(filter)}&perPage=1`,
        { token },
    );
    const existing = Array.isArray(list?.items) ? list.items[0] : null;

    if (existing) {
        if (existing.role === "admin") {
            console.log("  = app admin user already present");
            return;
        }
        await api(`/api/collections/${USERS}/records/${encodeURIComponent(existing.id)}`, {
            method: "PATCH",
            token,
            body: { role: "admin" },
        });
        console.log("  + admin role updated");
        return;
    }

    // Authenticated as superuser: the create hook keeps `role` from the
    // payload only for superusers.
    await api(`/api/collections/${USERS}/records`, {
        method: "POST",
        token,
        body: {
            name: ADMIN_NAME,
            email: ADMIN_EMAIL,
            password: ADMIN_PASSWORD,
            passwordConfirm: ADMIN_PASSWORD,
            role: "admin",
        },
    });
    console.log("  + app admin user created");
}

async function main() {
    console.log(`PocketBase setup — ${PB_URL}`);
    const token = await getSuperToken();
    await configureUsers(token);
    await ensureAdminUser(token);
    console.log("✓ PocketBase setup complete");
}

main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
});
