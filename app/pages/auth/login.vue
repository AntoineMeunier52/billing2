<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
    <div class="w-full max-w-md space-y-4">
      <AuthForm :loading="loading" @submit="handleLogin" title="Sign in" />

      <UCard class="text-center">
        <NuxtLink to="/auth/forgot-password" class="text-sm text-primary hover:underline">
          Forgot password?
        </NuxtLink>
      </UCard>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useAuthStore } from '~/store/auth';

definePageMeta({
  middleware: 'guest',
  layout: false,
});

const loading = ref(false);
const router = useRouter();
const authStore = useAuthStore();
const toast = useToast();

const handleLogin = async (body: { email: string; password: string }) => {
  loading.value = true;
  try {
    const success = await authStore.login(body.email, body.password);

    if (success) {
      toast.add({
        title: 'Success',
        description: 'Logged in successfully',
        color: 'success',
      });
      await router.push('/');
    } else {
      toast.add({
        title: 'Error',
        description: 'Invalid credentials',
        color: 'error',
      });
    }
  } catch (error: any) {
    toast.add({
      title: 'Error',
      description: error?.data?.statusMessage || 'Login failed',
      color: 'error',
    });
  } finally {
    loading.value = false;
  }
};
</script>
