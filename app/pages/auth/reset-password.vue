<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
    <div class="w-full max-w-md space-y-4">
      <UCard>
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <h1 class="text-2xl font-bold text-center mb-6">Reset Password</h1>

          <div v-if="!token" class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
            <div class="flex gap-2">
              <UIcon name="i-lucide-alert-circle" class="text-red-600 dark:text-red-400 mt-0.5" />
              <div class="text-sm text-red-700 dark:text-red-300">
                <p class="font-medium">Invalid Reset Link</p>
                <p class="text-xs mt-1">This password reset link is invalid or has expired.</p>
              </div>
            </div>
          </div>

          <template v-else>
            <UFormGroup label="New Password" name="password" required>
              <UInput
                v-model="password"
                type="password"
                placeholder="Enter new password"
                :disabled="loading"
                required
              />
            </UFormGroup>

            <UFormGroup label="Confirm Password" name="confirmPassword" required>
              <UInput
                v-model="confirmPassword"
                type="password"
                placeholder="Confirm new password"
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
              {{ loading ? 'Resetting...' : 'Reset Password' }}
            </UButton>
          </template>

          <div class="text-center pt-2">
            <NuxtLink to="/auth/login" class="text-sm text-primary hover:underline">
              Back to Login
            </NuxtLink>
          </div>
        </form>
      </UCard>
    </div>
  </div>
</template>

<script lang="ts" setup>
definePageMeta({
  middleware: 'guest',
  layout: false,
});

const route = useRoute();
const router = useRouter();
const toast = useToast();

const token = ref(route.query.token as string || '');
const password = ref('');
const confirmPassword = ref('');
const loading = ref(false);

async function handleSubmit() {
  if (!token.value) {
    toast.add({
      title: 'Error',
      description: 'Invalid reset token',
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
    await $fetch('/api/auth/reset-password', {
      method: 'POST',
      body: {
        token: token.value,
        password: password.value,
      },
    });

    toast.add({
      title: 'Success',
      description: 'Password reset successfully',
      color: 'success',
    });

    // Redirect to login after 2 seconds
    setTimeout(() => {
      router.push('/auth/login');
    }, 2000);
  } catch (error: any) {
    toast.add({
      title: 'Error',
      description: error?.data?.statusMessage || 'Failed to reset password',
      color: 'error',
    });
  } finally {
    loading.value = false;
  }
}
</script>