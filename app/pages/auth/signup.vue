<template>
  <div class="signup">
    <AuthForm :loading="loading" @submit="register" title="Sign up" />
    <p class="signup__text">
      Already registered?
      <nuxt-link :to="{ name: 'login' }">Log in</nuxt-link>
    </p>
  </div>
</template>

<script lang="ts" setup>
const loading = ref(false);
const router = useRouter();

const register = async (body) => {
  loading.value = true;
  try {
    await $fetch("/api/auth/signup", {
      method: "POST",
      body,
    });
    router.push({ name: "Dashboard" });
    loading.value = false;
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "statusMessage" in error
    ) {
      alert((error as any).statusMessage);
    } else {
      alert(String(error));
    }
    loading.value = false;
  }
};
</script>

<style>
.center-page-data {
  @apply w-full min-h-screen flex items-center justify-center flex-col;
}
</style>
