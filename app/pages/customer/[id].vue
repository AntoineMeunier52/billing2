<template>
  <div>
    <p>{{ $route.params.id }}</p>
  </div>
</template>

<script lang="ts" setup>
definePageMeta({
  middleware: 'protected',
});

const route = useRoute();

if (route.params.id) {
  console.log(route.params.id);
}
</script>

<style></style>
