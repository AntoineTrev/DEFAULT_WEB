// PocketBase hooks for the `users` collection (loaded from *.pb.js).
//
// - lastLogin is refreshed on every successful authentication.
// - Blocked accounts cannot authenticate or refresh their token.
// - Public registration can never set privileged fields (role, blocked, verified).
// - Non-superusers cannot escalate or unblock/self-verify their own record.
// - A non-empty `name` cannot be reassigned to another record on PATCH: the
//   conditional unique index only protects INSERT, not partial updates.
//
// NOTE: PocketBase JSVM hook handlers run in their own scope and cannot call
// function declarations defined at the top level of this file. All logic is
// inlined inside each hook.

onRecordAuthRequest((e) => {
    e.record.set("lastLogin", new Date().toISOString());
    e.app.save(e.record);
    e.next();
}, "users");

onRecordAuthWithPasswordRequest((e) => {
    if (e.record && e.record.getBool("blocked")) {
        throw new ForbiddenError("Account is blocked.");
    }
    e.next();
}, "users");

onRecordAuthRefreshRequest((e) => {
    if (e.record && e.record.getBool("blocked")) {
        throw new ForbiddenError("Account is blocked.");
    }
    e.next();
}, "users");

onRecordCreateRequest((e) => {
    const request = e.requestInfo();
    if (!request.hasSuperuserAuth()) {
        e.record.set("role", "user");
        e.record.set("blocked", false);
        e.record.set("verified", false);
    }
    e.next();
}, "users");

onRecordUpdateRequest((e) => {
    const request = e.requestInfo();
    const submittedName = request.data && String(request.data.name || "");

    if (submittedName) {
        const existing = e.app.findRecordsByFilter(
            "users",
            "name = {:name} && id != {:id}",
            "id",
            1,
            0,
            { name: submittedName, id: e.record.id || "" },
        )[0];
        if (existing) {
            throw new BadRequestError("Value must be unique.", {
                name: {
                    code: "validation_not_unique",
                    message: "Value must be unique.",
                },
            });
        }
    }

    if (!request.hasSuperuserAuth()) {
        const original = e.record.original();
        e.record.set("role", original.getString("role"));
        e.record.set("blocked", original.getBool("blocked"));
        e.record.set("verified", original.getBool("verified"));
    }
    e.next();
}, "users");
