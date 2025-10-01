<template>
  <div v-if="status == 'pending'">Loading...</div>
  <div v-else>
    <div
      v-for="(item, idx) in users?.users"
      :key="item.id ?? idx"
      class="group grid grid-cols-3 gap-2 my-1 h-6 px-3 rounded-full items-center hover:bg-gray-100"
      @dblclick="handleDblClick(item)"
    >
      <p class="truncate">{{ item.name }}</p>
      <p class="truncate">{{ item.email }}</p>
      <ClientOnly>
        <p class="group-hover:hidden text-xs text-gray-500">
          {{ formatDate(item.createdAt) }}
        </p>
      </ClientOnly>

      <!-- only visible when hover the parent div -->
      <p
        class="ml-auto text-xs text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-150 select-none pointer-events-none"
      >
        Double click to edit
      </p>
    </div>

    <!-- Edit Modal -->
    <UModal
      v-model:open="isEditOpen"
      title="Edit User"
      :dismissible="false"
      size="md"
      :ui="{
        footer: 'justify-end gap-2',
        header: 'border-b border-neutral-200 dark:border-neutral-800',
        body: 'p-0',
      }"
    >
      <template #body>
        <div class="px-4 pb-4">
          <UForm :state="editForm" class="space-y-4">
            <UFormField label="Name" name="name">
              <UInput v-model="editForm.name" placeholder="John Doe" />
            </UFormField>

            <UFormField label="Email" name="email">
              <UInput
                v-model="editForm.email"
                type="email"
                placeholder="john@example.com"
              />
            </UFormField>
          </UForm>
        </div>
      </template>

      <template #footer="{ close }">
        <UButton
          label="Delete"
          color="error"
          variant="outline"
          class="rounded-xl"
          @click="handleDelete"
          :loading="loading"
        />
        <UButton
          label="Cancel"
          color="neutral"
          variant="outline"
          class="rounded-xl"
          @click="close"
        />
        <UButton
          label="Update"
          color="neutral"
          class="rounded-xl"
          @click="handleUpdate"
          :loading="loading"
        />
      </template>
    </UModal>
  </div>
</template>

<script lang="ts" setup>
const isEditOpen = ref(false);
const loading = ref(false);
const toast = useToast();
const users = ref<any>(null);
const status = ref<"idle" | "pending" | "success" | "error">("idle");

const editForm = ref({
  id: 0,
  name: "",
  email: "",
});

async function fetchUsers() {
  status.value = "pending";
  try {
    const token = process.client ? localStorage.getItem("token") : null;
    const response = await $fetch("/api/users", {
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
    });
    users.value = response;
    status.value = "success";
  } catch (error) {
    console.error("Error fetching users:", error);
    status.value = "error";
  }
}

async function refresh() {
  await fetchUsers();
}

onMounted(() => {
  fetchUsers();
});

function handleDblClick(user: any) {
  editForm.value = {
    id: user.id,
    name: user.name,
    email: user.email,
  };
  isEditOpen.value = true;
}

async function handleUpdate() {
  loading.value = true;
  try {
    const token = process.client ? localStorage.getItem("token") : null;
    await $fetch(`/api/users/${editForm.value.id}`, {
      method: "PATCH",
      body: {
        name: editForm.value.name,
        email: editForm.value.email,
      },
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
    });

    toast.add({
      title: "User updated",
      description: "User information updated successfully",
      icon: "lucide:check",
    });

    isEditOpen.value = false;
    await refresh();
  } catch (error: any) {
    toast.add({
      title: "Error",
      description: error?.data?.statusMessage || "Failed to update user",
      color: "error",
      icon: "lucide:alert-triangle",
    });
  } finally {
    loading.value = false;
  }
}

async function handleDelete() {
  if (!confirm("Are you sure you want to delete this user?")) return;

  loading.value = true;
  try {
    const token = process.client ? localStorage.getItem("token") : null;
    await $fetch(`/api/users/${editForm.value.id}`, {
      method: "DELETE",
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
    });

    toast.add({
      title: "User deleted",
      description: "User deleted successfully",
      icon: "lucide:check",
    });

    isEditOpen.value = false;
    await refresh();
  } catch (error: any) {
    toast.add({
      title: "Error",
      description: error?.data?.statusMessage || "Failed to delete user",
      color: "error",
      icon: "lucide:alert-triangle",
    });
  } finally {
    loading.value = false;
  }
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
</script>
