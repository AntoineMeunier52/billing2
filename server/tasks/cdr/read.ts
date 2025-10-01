export default defineTask({
  meta: {
    name: "cdr:read",
    description: "read the monthly cdr from sewan",
  },
  async run(_event) {
    console.log("[CDR Monthly] Starting CDR read task...");

    try {
      const internalToken = process.env.INTERNAL_API_TOKEN;
      if (!internalToken) {
        throw new Error("INTERNAL_API_TOKEN not configured");
      }

      const res = await $fetch("http://localhost:3000/api/cdr/generate", {
        method: "POST",
        headers: {
          "x-internal-token": internalToken,
        },
      });

      console.log("[CDR Monthly] customer reports created with success", res);
      return { result: res };
    } catch (err) {
      console.error("[CDR Monthly] error", err);
      return { result: { ok: false, error: String(err) } };
    }
  },
});
