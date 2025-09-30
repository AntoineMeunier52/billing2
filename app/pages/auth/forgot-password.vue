<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
    <div class="w-full max-w-md space-y-4">
      <UCard>
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <h1 class="text-2xl font-bold text-center mb-6">Forgot Password</h1>

          <p class="text-sm text-gray-600 dark:text-gray-400 text-center mb-4">
            Enter your email address and we'll send you a link to reset your password.
          </p>

          <UFormGroup label="Email" name="email" required>
            <UInput
              v-model="email"
              type="email"
              placeholder="Enter your email"
              :disabled="loading || success"
              required
            />
          </UFormGroup>

          <UButton
            type="submit"
            block
            :loading="loading"
            :disabled="loading || success"
          >
            {{ loading ? 'Sending...' : success ? 'Email Sent!' : 'Send Reset Link' }}
          </UButton>

          <div v-if="success" class="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
            <div class="flex gap-2">
              <UIcon name="i-lucide-check-circle" class="text-green-600 dark:text-green-400 mt-0.5" />
              <div class="text-sm text-green-700 dark:text-green-300">
                <p class="font-medium">Check your email</p>
                <p class="text-xs mt-1">
                  If an account exists with this email, we've sent a password reset link.
                </p>
              </div>
            </div>
          </div>

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

const email = ref('');
const loading = ref(false);
const success = ref(false);
const toast = useToast();

async function handleSubmit() {
  loading.value = true;
  success.value = false;

  try {
    await $fetch('/api/auth/forgot-password', {
      method: 'POST',
      body: { email: email.value },
    });

    success.value = true;
    toast.add({
      title: 'Email Sent',
      description: 'Check your email for password reset instructions',
      color: 'success',
    });
  } catch (error: any) {
    // Even on error, show success message for security
    success.value = true;
    toast.add({
      title: 'Request Submitted',
      description: 'If an account exists, you will receive an email',
      color: 'success',
    });
  } finally {
    loading.value = false;
  }
}
</script>