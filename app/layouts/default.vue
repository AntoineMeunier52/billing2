<template>
  <div>
    <nav class="flex justify-between items-center h-[70px] shadow-md mb-[20px]">
      <h1 class="ml-[30px] text-2xl font-bold">BILLING</h1>
      <div class="flex items-center gap-6 mr-[30px]">
        <ul
          class="flex [&>li]:mx-[10px] [&>li]:hover:text-blue-500 [&>li]:hover:underline"
        >
          <li><NuxtLink to="/customer">Customers</NuxtLink></li>
          <li><NuxtLink to="/generator">Generator</NuxtLink></li>
          <li><NuxtLink to="/user">Users</NuxtLink></li>
        </ul>
        <UButton
          icon="i-lucide-log-out"
          color="error"
          size="sm"
          @click="handleLogout"
          label="Logout"
        />
      </div>
    </nav>
    <slot />
  </div>
</template>

<script lang="ts" setup>
import { useAuthStore } from "~/store/auth";

const authStore = useAuthStore();

async function handleLogout() {
  await authStore.logout();
}
</script>

<style></style>
