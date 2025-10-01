export default defineTask({
  meta: {
    name: "pdf:create",
    description: "create monthly pdf",
  },
  async run(_event) {
    console.log("[PDF Monthly] Starting PDF creation task...");

    try {
      const internalToken = process.env.INTERNAL_API_TOKEN;
      if (!internalToken) {
        throw new Error("INTERNAL_API_TOKEN not configured");
      }

      const res = await $fetch("http://localhost:3000/api/cdr/legacy-monthly", {
        method: "POST",
        headers: {
          "x-internal-token": internalToken,
        },
      });

      console.log("[PDF Monthly] pdf created with success", res);
      return { result: res };
    } catch (err) {
      console.error("[PDF Monthly] error", err);
      return { result: { ok: false, error: String(err) } };
    }
  },
});
