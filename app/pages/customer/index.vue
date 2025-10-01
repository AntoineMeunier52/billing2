<template>
  <UContainer>
    <p class="text-2xl">Customers</p>
    <USeparator class="pb-[12px]" />
    <ClientOnly>
      <CustomerView />
    </ClientOnly>
    <USeparator class="pt-[12px]" />
    <ClientOnly>
      <CustomerAddButton />
    </ClientOnly>
  </UContainer>
</template>

<script lang="ts" setup>
definePageMeta({
  middleware: 'protected',
});
</script>

<style></style>
