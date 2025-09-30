<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
    <div class="w-full max-w-md space-y-4">
      <UCard>
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <h1 class="text-2xl font-bold text-center mb-6">Activate Your Account</h1>

          <div v-if="!token" class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
            <div class="flex gap-2">
              <UIcon name="i-lucide-alert-circle" class="text-red-600 dark:text-red-400 mt-0.5" />
              <div class="text-sm text-red-700 dark:text-red-300">
                <p class="font-medium">Invalid Activation Link</p>
                <p class="text-xs mt-1">This activation link is invalid.</p>
              </div>
            </div>
          </div>

          <template v-else>
            <p class="text-sm text-gray-600 dark:text-gray-400 text-center mb-4">
              Create a password for your account to get started.
            </p>

            <UFormGroup label="New Password" name="password" required>
              <UInput
                v-model="password"
                type="password"
                placeholder="Enter your password"
                :disabled="loading"
                required
              />
            </UFormGroup>

            <UFormGroup label="Confirm Password" name="confirmPassword" required>
              <UInput
                v-model="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                :disabled="loading"
                required
              />
            </UFormGroup>

            <div v-if="password && password.length < 8" class="text-sm text-orange-600 dark:text-orange-400">
              Password must be at least 8 characters
            </div>

            <div v-if="password && confirmPassword && password !== confirmPassword" class="text-sm text-red-600 dark:text-red-400">
              Passwords do not match
            </div>

            <UButton
              type="submit"
              block
              :loading="loading"
              :disabled="loading || !password || !confirmPassword || password !== confirmPassword || password.length < 8"
            >
              {{ loading ? 'Activating...' : 'Activate Account' }}
            </UButton>
          </template>
        </form>
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

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const toast = useToast();

const token = ref(route.query.token as string || '');
const password = ref('');
const confirmPassword = ref('');
const loading = ref(false);

async function handleSubmit() {
  if (!token.value) {
    toast.add({
      title: 'Error',
      description: 'Invalid activation token',
      color: 'error',
    });
    return;
  }

  if (password.value !== confirmPassword.value) {
    toast.add({
      title: 'Error',
      description: 'Passwords do not match',
      color: 'error',
    });
    return;
  }

  loading.value = true;

  try {
    const response = await $fetch<{ token: string; user: any }>('/api/auth/activate', {
      method: 'POST',
      body: {
        token: token.value,
        password: password.value,
      },
    });

    // Auto-login: store token and user
    authStore.setToken(response.token);
    authStore.setUser(response.user);

    toast.add({
      title: 'Success',
      description: 'Account activated successfully!',
      color: 'success',
    });

    // Redirect to home
    await router.push('/');
  } catch (error: any) {
    toast.add({
      title: 'Error',
      description: error?.data?.statusMessage || 'Failed to activate account',
      color: 'error',
    });
  } finally {
    loading.value = false;
  }
}
</script>