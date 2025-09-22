<template>
  <div v-if="status == 'pending'">Loading...</div>
  <div v-else>
    <div
      v-for="(item, idx) in customers?.customers"
      :key="item.id ?? idx"
      class="group grid grid-cols-6 gap-2 my-1 h-6 px-3 rounded-full items-center hover:bg-gray-100"
      @dblclick="handleDblClick()"
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
  </div>
</template>

<script lang="ts" setup>
const loading = ref(false);

const { status, data: customers } = await useFetch("/api/customer/getAll", {
  lazy: true,
});

function handleDblClick() {
  console.log("DBLclick work");
}
</script>

<style></style>
