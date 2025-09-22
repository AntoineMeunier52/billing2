export default defineEventHandler(async (event) => {
  try {
    return { success: true, message: "Customer change successfully" };
  } catch (err: any) {
    return { success: false, message: err };
  }
});
