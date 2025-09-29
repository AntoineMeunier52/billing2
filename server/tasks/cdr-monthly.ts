export default defineTask({
  meta: {
    name: "cdr:read",
    description: "read the monthly cdr from sewan",
  },
  async run(_event) {
    try {
      const res = await $fetch("/api/cdr/monthly", { method: "POST" });
      console.log("[CDR Monthly] agrégats générés avec succès", res);
      return { result: res };
    } catch (err) {
      console.error("[CDR Monthly] error", err);
      return { result: { ok: false, error: String(err) } };
    }
  },
});
