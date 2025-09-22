<template>
  <UModal
    v-model:open="open"
    title="Create Customer"
    :dismissible="false"
    size="xl"
    :ui="{
      footer: 'justify-end gap-2',
      header: 'border-b border-neutral-200 dark:border-neutral-800',
      body: 'p-0',
    }"
  >
    <div class="p-4">
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
      <!-- Scroll container -->
      <div class="max-h-[70vh] overflow-y-auto px-4 pb-4 custom-scroll">
        <UForm :state="customer" class="space-y-8">
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
                <UInput v-model="customer.name" placeholder="Axians T&N" />
              </UFormField>

              <UFormField label="Address" name="address" class="md:col-span-2">
                <UInput
                  v-model="customer.address"
                  placeholder="Rue de la Gloire 26"
                />
              </UFormField>

              <UFormField label="City" name="city">
                <UInput v-model="customer.city" placeholder="Charlouse" />
              </UFormField>

              <UFormField label="Province" name="province">
                <UInput v-model="customer.province" placeholder="Hainault" />
              </UFormField>

              <UFormField label="Postal Code" name="postalCode">
                <UInput
                  v-model="customer.postalCode"
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
                  v-model="customer.natioMobPourcent"
                  placeholder="0.00"
                  type="number"
                  step="0.01"
                />
              </UFormField>

              <UFormField label="Pourcent Fix national" name="natioFixPourcent">
                <UInput
                  v-model="customer.natioFixPourcent"
                  placeholder="0.00"
                  type="number"
                  step="0.01"
                />
              </UFormField>

              <UFormField label="Ddi Price" name="ddiPrice">
                <UInput
                  v-model="customer.ddiPrice"
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
                  v-model="customer.interMobPourcent"
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
                  v-model="customer.interFixPourcent"
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
                v-for="(item, count) in customer.subscriptions"
                :key="count"
                :state="item"
                attach
                class="flex items-center justify-between bg-neutral-50/60 dark:bg-neutral-800/40 border border-neutral-200/70 dark:border-neutral-800/70 rounded-xl p-3"
              >
                <div>
                  <UFormField
                    :label="!count ? 'Description' : undefined"
                    name="desciption"
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
                v-for="(item, count) in customer.sipLine"
                key="count"
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
                v-for="(item, count) in customer.ddiName"
                key="count"
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
        label="Cancel"
        color="neutral"
        variant="outline"
        class="rounded-xl"
        @click="close"
      />
      <UButton
        label="Submit"
        color="neutral"
        class="rounded-xl"
        @click="handleSubmit"
        :loading="loading"
      />
    </template>
  </UModal>
</template>

<script lang="ts" setup>
import { custom } from "zod";

const toast = useToast();

const open = ref(false);
const loading = ref(false);

const customer: Customers = reactive({
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
  subscriptions: [],
  sipLine: [],
  ddiName: [],
});

function addSubscription() {
  if (!customer.subscriptions) {
    customer.subscriptions = [];
  }
  customer.subscriptions.push({ definition: "", price: 0 });
}

function removeSubscription(count: number) {
  customer.subscriptions.splice(count, 1);
}

function addSipLine() {
  if (!customer.sipLine) {
    customer.sipLine = [];
  }
  customer.sipLine.push({ descriptionName: "" });
}

function removeSipLine(count: number) {
  customer.sipLine.splice(count, 1);
}

function addDdiName() {
  if (!customer.ddiName) {
    customer.ddiName = [];
  }
  customer.ddiName.push({ descriptionName: "" });
}

function removeDdiName(count: number) {
  customer.ddiName.splice(count, 1);
}

async function handleSubmit() {
  try {
    loading.value = true;
    await $fetch("/api/customer/create", {
      method: "POST",
      body: customer,
    });
    toast.add({ title: "Customer created", icon: "lucide:check" });
    open.value = false;

    customer.name = "";
    customer.address = "";
    customer.city = "";
    customer.province = "";
    customer.postalCode = 0;
    customer.natioMobPourcent = 0;
    customer.natioFixPourcent = 0;
    customer.interMobPourcent = 0;
    customer.interFixPourcent = 0;
    customer.ddiPrice = 0;
    customer.subscriptions = [];
    customer.sipLine = [];
    customer.ddiName = [];
  } catch (err: any) {
    const msg =
      err?.data?.message || err?.message || "Failed to create customer";
    toast.add({
      title: "Error",
      description: msg,
      color: "error",
      icon: "lucides:alert-triangle",
    });
    console.error(err);
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
  border-radius: 9999px;
}
.custom-scroll::-webkit-scrollbar-thumb:hover {
  background: rgba(125, 125, 125, 0.45);
}
</style>
