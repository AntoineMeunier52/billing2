export default defineTask({
  meta: {
    name: "cdr:read",
    description: "read the monthly cdr from sewan",
  },
  async run(_event) {
    try {
      const res = await $fetch("http://localhost:3000/api/cdr/generate", {
        method: "POST",
      });
      console.log("[CDR Monthly] customer rapports create with success", res);
      return { result: res };
    } catch (err) {
      console.error("[CDR Monthly] error", err);
      return { result: { ok: false, error: String(err) } };
    }
  },
});
