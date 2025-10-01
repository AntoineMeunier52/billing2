export default defineTask({
  meta: {
    name: "pdf:create",
    description: "create monthly pdf",
  },
  async run(_event) {
    try {
      const res = await $fetch("http://localhost:3000/api/cdr/legacy-monthly", {
        method: "POST",
      });
      console.log("[PDF Monthly] pdf create with success", res);
      return { result: res };
    } catch (err) {
      console.error("[PDF Monthly] error", err);
      return { result: { ok: false, error: String(err) } };
    }
  },
});
