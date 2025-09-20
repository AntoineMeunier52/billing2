<template>
  <div class="login">
    <AuthForm :loading="loading" @submit="login" title="Sign in" />
    <p class="login__text">
      New here?
      <nuxt-link :to="{ name: 'signup' }">Sign up</nuxt-link>
    </p>
  </div>
</template>

<script lang="ts" setup>
const loading = ref(false);
const router = useRouter();

const login = async (body) => {
  loading.value = true;
  try {
    await $fetch("/api/auth/login", {
      method: "POST",
      body,
    });
    router.push({ name: "Dashboard" });
    loading.value = false;
  } catch (error) {
    console.log({ error });
    if (
      typeof error === "object" &&
      error !== null &&
      "statusMessage" in error
    ) {
      alert((error as { statusMessage?: string }).statusMessage);
    } else {
      alert(String(error));
    }
    loading.value = false;
  }
};
</script>

<style></style>
