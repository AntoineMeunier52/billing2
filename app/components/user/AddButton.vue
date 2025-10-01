<template>
  <UModal
    v-model:open="open"
    title="Create User"
    :dismissible="false"
    size="md"
    :ui="{
      footer: 'justify-end gap-2',
      header: 'border-b border-neutral-200 dark:border-neutral-800',
      body: 'p-0',
    }"
  >
    <div class="py-4">
      <UButton
        class="h-[16px] w-full flex rounded-xl"
        color="neutral"
        variant="ghost"
      >
        <USkeleton class="h-[16px] flex-1 min-w-0 rounded-full"></USkeleton>
        <UIcon name="i-lucide-plus" class="text-[16px] mx-[8px] shrink-0" />
        <USkeleton class="h-[16px] flex-1 min-w-0 rounded-full"></USkeleton>
      </UButton>
    </div>

    <template #body>
      <div class="px-4 pb-4">
        <UForm :state="user" class="space-y-4">
          <UFormField label="Name" name="name">
            <UInput v-model="user.name" placeholder="John Doe" />
          </UFormField>

          <UFormField label="Email" name="email">
            <UInput
              v-model="user.email"
              type="email"
              placeholder="john@example.com"
            />
          </UFormField>

          <div
            class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3"
          >
            <div class="flex gap-2">
              <UIcon
                name="i-lucide-info"
                class="text-blue-600 dark:text-blue-400 mt-0.5"
              />
              <div class="text-sm text-blue-700 dark:text-blue-300">
                <p class="font-medium">Email will be sent automatically</p>
                <p class="text-xs">
                  User will receive an email with a link to set their password.
                </p>
              </div>
            </div>
          </div>
        </UForm>
      </div>
    </template>

    <template #footer="{ close }">
      <UButton
        label="Cancel"
        color="neutral"
        variant="outline"
        class="rounded-xl"
        @click="close"
      />
      <UButton
        label="Create"
        color="neutral"
        class="rounded-xl"
        @click="handleSubmit"
        :loading="loading"
      />
    </template>
  </UModal>
</template>

<script lang="ts" setup>
const toast = useToast();

const open = ref(false);
const loading = ref(false);

const user = reactive({
  name: "",
  email: "",
  role: "ADMIN", // Tous les utilisateurs sont admin
});

async function handleSubmit() {
  try {
    loading.value = true;

    const token = process.client ? localStorage.getItem("token") : null;
    if (!token) {
      throw new Error("Not authenticated");
    }

    await $fetch("/api/users", {
      method: "POST",
      body: user,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    toast.add({
      title: "User created",
      description: "Welcome email sent to user",
      icon: "lucide:check",
    });

    open.value = false;

    // Reset form
    user.name = "";
    user.email = "";

    // Refresh users list
    await refreshNuxtData();
  } catch (err: any) {
    const msg =
      err?.data?.statusMessage || err?.message || "Failed to create user";
    toast.add({
      title: "Error",
      description: msg,
      color: "error",
      icon: "lucide:alert-triangle",
    });
    console.error(err);
  } finally {
    loading.value = false;
  }
}
</script>