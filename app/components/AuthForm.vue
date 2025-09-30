<template>
  <UCard class="max-w-md w-full">
    <form @submit.prevent="submit" class="space-y-4">
      <h1 class="text-2xl font-bold text-center mb-6">{{ title }}</h1>

      <UFormGroup v-if="showName" label="Name" name="name" required>
        <UInput
          v-model="name"
          type="text"
          placeholder="Enter your name"
          :disabled="loading"
          required
        />
      </UFormGroup>

      <UFormGroup label="Email" name="email" required>
        <UInput
          v-model="email"
          type="email"
          placeholder="Enter your email"
          :disabled="loading"
          required
        />
      </UFormGroup>

      <UFormGroup label="Password" name="password" required>
        <UInput
          v-model="password"
          type="password"
          placeholder="Enter your password"
          :disabled="loading"
          required
        />
      </UFormGroup>

      <UButton
        type="submit"
        block
        :loading="loading"
        :disabled="loading"
      >
        {{ loading ? 'Please wait...' : title }}
      </UButton>
    </form>
  </UCard>
</template>

<script setup lang="ts">
const name = ref("");
const email = ref("");
const password = ref("");

const props = defineProps({
  loading: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    required: true,
  },
  showName: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["submit"]);

const submit = () => {
  const payload: Record<string, string> = {
    email: email.value,
    password: password.value,
  };

  if (props.showName) {
    payload.name = name.value;
  }

  emit("submit", payload);
};
</script>
