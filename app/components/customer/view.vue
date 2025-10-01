<template>
  <div v-if="status == 'pending'">Loading...</div>
  <div v-else>
    <div
      v-for="(item, idx) in customers?.customers"
      :key="item.id ?? idx"
      class="group grid grid-cols-6 gap-2 my-1 h-6 px-3 rounded-full items-center hover:bg-gray-100"
      @dblclick="handleDblClick(item)"
    >
      <p class="truncate">{{ item.name }}</p>
      <p>Natio. Mob. {{ item.natioMobPourcent }} %</p>
      <p>Natio. Fix. {{ item.natioFixPourcent }} %</p>
      <p>Inter. Mob. {{ item.interMobPourcent }} %</p>
      <p>Inter. Fix. {{ item.interFixPourcent }} %</p>
      <p class="group-hover:hidden">Ddi Price {{ item.ddiPrice }} €</p>

      <!-- only visible when hover the parent div (work with tailwind group) -->
      <p
        class="ml-auto text-xs text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-150 select-none pointer-events-none"
      >
        Double click to edit
      </p>
    </div>

    <!-- Edit Modal -->
    <UModal
      v-model:open="isEditOpen"
      title="Edit Customer"
      :dismissible="false"
      size="xl"
      :ui="{
        footer: 'justify-end gap-2',
        header: 'border-b border-neutral-200 dark:border-neutral-800',
        body: 'p-0',
      }"
    >
      <template #body>
        <!-- Scroll container -->
        <div class="max-h-[70vh] overflow-y-auto px-4 pb-4 custom-scroll">
          <UForm :state="editForm" class="space-y-8">
            <!-- ========== Infos de base ========== -->
            <section
              class="rounded-2xl border border-neutral-200/70 dark:border-neutral-800/70 bg-white/70 dark:bg-neutral-900/50 shadow-sm backdrop-blur-sm"
            >
              <header
                class="px-4 py-3 border-b border-neutral-200 dark:border-neutral-800"
              >
                <h3
                  class="text-sm font-semibold tracking-wide text-neutral-700 dark:text-neutral-200"
                >
                  Global Infomations
                </h3>
              </header>

              <div class="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <UFormField label="Name" name="name" class="md:col-span-1">
                  <UInput v-model="editForm.name" placeholder="Axians T&N" />
                </UFormField>

                <UFormField label="Address" name="address" class="md:col-span-2">
                  <UInput
                    v-model="editForm.address"
                    placeholder="Rue de la Gloire 26"
                  />
                </UFormField>

                <UFormField label="City" name="city">
                  <UInput v-model="editForm.city" placeholder="Charlouse" />
                </UFormField>

                <UFormField label="Province" name="province">
                  <UInput v-model="editForm.province" placeholder="Hainault" />
                </UFormField>

                <UFormField label="Postal Code" name="postalCode">
                  <UInput
                    v-model="editForm.postalCode"
                    placeholder="1000"
                    type="number"
                  />
                </UFormField>
              </div>
            </section>

            <!-- ========== Tarification ========== -->
            <section
              class="rounded-2xl border border-neutral-200/70 dark:border-neutral-800/70 bg-white/70 dark:bg-neutral-900/50 shadow-sm backdrop-blur-sm"
            >
              <header
                class="px-4 py-3 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between"
              >
                <h3
                  class="text-sm font-semibold tracking-wide text-neutral-700 dark:text-neutral-200"
                >
                  Global Price
                </h3>
              </header>

              <div class="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <UFormField
                  label="Pourcent Mobil national"
                  name="natioMobPourcent"
                >
                  <UInput
                    v-model="editForm.natioMobPourcent"
                    placeholder="0.00"
                    type="number"
                    step="0.01"
                  />
                </UFormField>

                <UFormField label="Pourcent Fix national" name="natioFixPourcent">
                  <UInput
                    v-model="editForm.natioFixPourcent"
                    placeholder="0.00"
                    type="number"
                    step="0.01"
                  />
                </UFormField>

                <UFormField label="Ddi Price" name="ddiPrice">
                  <UInput
                    v-model="editForm.ddiPrice"
                    placeholder="10.00"
                    type="number"
                    step="0.01"
                  />
                </UFormField>

                <UFormField
                  label="Pourcent Mobil International"
                  name="interMobPourcent"
                >
                  <UInput
                    v-model="editForm.interMobPourcent"
                    placeholder="0.00"
                    type="number"
                    step="0.01"
                  />
                </UFormField>

                <UFormField
                  label="Pourcent Fix International"
                  name="interFixPourcent"
                >
                  <UInput
                    v-model="editForm.interFixPourcent"
                    placeholder="0.00"
                    type="number"
                    step="0.01"
                  />
                </UFormField>

                <div class="hidden md:block"></div>
              </div>
            </section>

            <!-- ========== Subscriptions ========== -->
            <section
              class="rounded-2xl border border-neutral-200/70 dark:border-neutral-800/70 bg-white/70 dark:bg-neutral-900/50 shadow-sm backdrop-blur-sm"
            >
              <header
                class="px-4 py-3 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between"
              >
                <h3
                  class="text-sm font-semibold tracking-wide text-neutral-700 dark:text-neutral-200"
                >
                  Subscriptions
                </h3>
                <UButton
                  color="neutral"
                  variant="subtle"
                  size="sm"
                  class="rounded-xl"
                  @click="addSubscription()"
                >
                  <UIcon name="i-lucide-plus" class="mr-2 h-4 w-4" />
                  Add Subscription
                </UButton>
              </header>

              <div class="p-4 space-y-3">
                <UForm
                  v-for="(item, count) in editForm.subscriptions"
                  :key="count"
                  :state="item"
                  attach
                  class="flex items-center justify-between bg-neutral-50/60 dark:bg-neutral-800/40 border border-neutral-200/70 dark:border-neutral-800/70 rounded-xl p-3"
                >
                  <div>
                    <UFormField
                      :label="!count ? 'Description' : undefined"
                      name="definition"
                      class="mb-2"
                    >
                      <UInput v-model="item.definition" />
                    </UFormField>

                    <UFormField
                      :label="!count ? 'Price' : undefined"
                      name="price"
                      class="w-20"
                    >
                      <UInput v-model="item.price" type="number" step="0.01" />
                    </UFormField>
                  </div>

                  <div class="">
                    <UButton
                      color="error"
                      variant="outline"
                      size="sm"
                      class="rounded-xl"
                      @click="removeSubscription(count)"
                    >
                      <UIcon name="i-lucide-trash-2" class="mr-2 h-4 w-4" />
                      Remove
                    </UButton>
                  </div>
                </UForm>
              </div>
            </section>

            <!-- ========== SIP Lines ========== -->
            <section
              class="rounded-2xl border border-neutral-200/70 dark:border-neutral-800/70 bg-white/70 dark:bg-neutral-900/50 shadow-sm backdrop-blur-sm"
            >
              <header
                class="px-4 py-3 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between"
              >
                <h3
                  class="text-sm font-semibold tracking-wide text-neutral-700 dark:text-neutral-200"
                >
                  SIP Lines
                </h3>
                <UButton
                  color="neutral"
                  variant="subtle"
                  size="sm"
                  class="rounded-xl"
                  @click="addSipLine()"
                >
                  <UIcon name="i-lucide-plus" class="mr-2 h-4 w-4" />
                  Add Sip Line
                </UButton>
              </header>

              <div class="p-4 space-y-3">
                <UForm
                  v-for="(item, count) in editForm.sipLine"
                  :key="count"
                  :state="item"
                  attach
                  class="flex items-center justify-between bg-neutral-50/60 dark:bg-neutral-800/40 border border-neutral-200/70 dark:border-neutral-800/70 rounded-xl p-3"
                >
                  <UFormField
                    :label="!count ? 'Description Name' : undefined"
                    name="descriptionName"
                  >
                    <UInput v-model="item.descriptionName" />
                  </UFormField>

                  <div class="">
                    <UButton
                      color="error"
                      variant="outline"
                      size="sm"
                      class="rounded-xl"
                      @click="removeSipLine(count)"
                    >
                      <UIcon name="i-lucide-trash-2" class="mr-2 h-4 w-4" />
                      Remove
                    </UButton>
                  </div>
                </UForm>
              </div>
            </section>

            <!-- ========== Ddi Names ========== -->
            <section
              class="rounded-2xl border border-neutral-200/70 dark:border-neutral-800/70 bg-white/70 dark:bg-neutral-900/50 shadow-sm backdrop-blur-sm"
            >
              <header
                class="px-4 py-3 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between"
              >
                <h3
                  class="text-sm font-semibold tracking-wide text-neutral-700 dark:text-neutral-200"
                >
                  Ddi Names
                </h3>
                <UButton
                  color="neutral"
                  variant="subtle"
                  size="sm"
                  class="rounded-xl"
                  @click="addDdiName()"
                >
                  <UIcon name="i-lucide-plus" class="mr-2 h-4 w-4" />
                  Add Ddi Names
                </UButton>
              </header>

              <div class="p-4 space-y-3">
                <UForm
                  v-for="(item, count) in editForm.ddiName"
                  :key="count"
                  :state="item"
                  attach
                  class="flex items-center justify-between bg-neutral-50/60 dark:bg-neutral-800/40 border border-neutral-200/70 dark:border-neutral-800/70 rounded-xl p-3"
                >
                  <UFormField
                    :label="!count ? 'Description Name' : undefined"
                    name="descriptionName"
                  >
                    <UInput v-model="item.descriptionName" />
                  </UFormField>

                  <div class="">
                    <UButton
                      color="error"
                      variant="outline"
                      size="sm"
                      class="rounded-xl"
                      @click="removeDdiName(count)"
                    >
                      <UIcon name="i-lucide-trash-2" class="mr-2 h-4 w-4" />
                      Remove
                    </UButton>
                  </div>
                </UForm>
              </div>
            </section>
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
const token = ref<string | null>(null);
const loading = ref(false);
const isEditOpen = ref(false);
const toast = useToast();

onMounted(() => {
  token.value = localStorage.getItem("token");
});

const { status, data: customers, refresh } = await useFetch("/api/customer/getAll", {
  lazy: true,
  headers: computed(() => ({
    Authorization: token.value ? `Bearer ${token.value}` : "",
  })),
});

const editForm = ref({
  id: 0,
  name: "",
  address: "",
  city: "",
  province: "",
  postalCode: 0,
  natioFixPourcent: 0,
  natioMobPourcent: 0,
  interFixPourcent: 0,
  interMobPourcent: 0,
  ddiPrice: 0,
  subscriptions: [] as any[],
  sipLine: [] as any[],
  ddiName: [] as any[],
});

function handleDblClick(customer: any) {
  editForm.value = {
    id: customer.id,
    name: customer.name,
    address: customer.address,
    city: customer.city,
    province: customer.province,
    postalCode: customer.postalCode,
    natioFixPourcent: customer.natioFixPourcent,
    natioMobPourcent: customer.natioMobPourcent,
    interFixPourcent: customer.interFixPourcent,
    interMobPourcent: customer.interMobPourcent,
    ddiPrice: customer.ddiPrice,
    subscriptions: customer.subscriptions ? [...customer.subscriptions.map((s: any) => ({
      definition: s.definition,
      price: s.price,
    }))] : [],
    sipLine: customer.sipLine ? [...customer.sipLine.map((s: any) => ({
      descriptionName: s.descriptionName,
    }))] : [],
    ddiName: customer.ddiName ? [...customer.ddiName.map((d: any) => ({
      descriptionName: d.descriptionName,
    }))] : [],
  };
  isEditOpen.value = true;
}

function addSubscription() {
  if (!editForm.value.subscriptions) {
    editForm.value.subscriptions = [];
  }
  editForm.value.subscriptions.push({ definition: "", price: 0 });
}

function removeSubscription(count: number) {
  editForm.value.subscriptions.splice(count, 1);
}

function addSipLine() {
  if (!editForm.value.sipLine) {
    editForm.value.sipLine = [];
  }
  editForm.value.sipLine.push({ descriptionName: "" });
}

function removeSipLine(count: number) {
  editForm.value.sipLine.splice(count, 1);
}

function addDdiName() {
  if (!editForm.value.ddiName) {
    editForm.value.ddiName = [];
  }
  editForm.value.ddiName.push({ descriptionName: "" });
}

function removeDdiName(count: number) {
  editForm.value.ddiName.splice(count, 1);
}

async function handleUpdate() {
  loading.value = true;
  try {
    const token = localStorage.getItem("token");
    await $fetch(`/api/customer/${editForm.value.id}`, {
      method: "PATCH",
      body: {
        name: editForm.value.name,
        address: editForm.value.address,
        city: editForm.value.city,
        province: editForm.value.province,
        postalCode: editForm.value.postalCode,
        natioFixPourcent: editForm.value.natioFixPourcent,
        natioMobPourcent: editForm.value.natioMobPourcent,
        interFixPourcent: editForm.value.interFixPourcent,
        interMobPourcent: editForm.value.interMobPourcent,
        ddiPrice: editForm.value.ddiPrice,
        subscriptions: editForm.value.subscriptions,
        sipLine: editForm.value.sipLine,
        ddiName: editForm.value.ddiName,
      },
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
    });

    toast.add({
      title: "Customer updated",
      description: "Customer updated successfully",
      icon: "lucide:check",
    });

    isEditOpen.value = false;
    await refresh();
  } catch (error: any) {
    toast.add({
      title: "Error",
      description: error?.data?.message || "Failed to update customer",
      color: "error",
      icon: "lucide:alert-triangle",
    });
  } finally {
    loading.value = false;
  }
}

async function handleDelete() {
  if (!confirm("Are you sure you want to delete this customer? All associated data will be deleted.")) return;

  loading.value = true;
  try {
    const token = localStorage.getItem("token");
    await $fetch(`/api/customer/${editForm.value.id}`, {
      method: "DELETE",
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
    });

    toast.add({
      title: "Customer deleted",
      description: "Customer deleted successfully",
      icon: "lucide:check",
    });

    isEditOpen.value = false;
    await refresh();
  } catch (error: any) {
    toast.add({
      title: "Error",
      description: error?.data?.message || "Failed to delete customer",
      color: "error",
      icon: "lucide:alert-triangle",
    });
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.custom-scroll::-webkit-scrollbar {
  width: 10px;
}
.custom-scroll::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scroll::-webkit-scrollbar-thumb {
  background: rgba(125, 125, 125, 0.3);
}
.custom-scroll::-webkit-scrollbar-thumb:hover {
  background: rgba(125, 125, 125, 0.45);
}
</style>
