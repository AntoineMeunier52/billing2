<template>
  <UContainer>
    <p class="text-2xl">Users</p>
    <USeparator class="pb-[12px]" />
    <ClientOnly>
      <UserView />
    </ClientOnly>
    <USeparator class="pt-[12px]" />
    <ClientOnly>
      <UserAddButton />
    </ClientOnly>
  </UContainer>
</template>

<script lang="ts" setup>
definePageMeta({
  middleware: 'protected',
});
</script>