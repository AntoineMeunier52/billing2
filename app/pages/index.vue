<script lang="ts" setup>
definePageMeta({
  middleware: 'protected',
});

// Redirect to /customer by default
await navigateTo('/customer');
</script>
