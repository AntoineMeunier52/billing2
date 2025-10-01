<template>
  <UContainer>
    <div class="space-y-6">
      <div>
        <p class="text-2xl font-semibold">CDR Generator</p>
        <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Generate CDR reports and PDF invoices
        </p>
      </div>

      <USeparator />

      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold">Generate Reports</h3>
        </template>

        <div class="space-y-4">
          <div class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <div>
              <p class="font-medium">Monthly CDR Processing</p>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                Read CDR data and generate PDF invoices
              </p>
              <p class="text-xs text-orange-600 dark:text-orange-400 mt-1">
                ⚠️ This process may take several minutes
              </p>
            </div>
            <UButton
              size="lg"
              :loading="loading"
              :disabled="loading"
              @click="handleGenerate"
              class="rounded-xl"
            >
              <UIcon name="i-lucide-play" class="mr-2" />
              {{ loading ? 'Processing...' : 'Start Generation' }}
            </UButton>
          </div>

          <!-- Progress / Status -->
          <div v-if="loading" class="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div class="flex items-start gap-3">
              <UIcon name="i-lucide-loader-2" class="text-blue-600 dark:text-blue-400 animate-spin mt-0.5" />
              <div class="flex-1">
                <p class="font-medium text-blue-900 dark:text-blue-100">Processing CDR data...</p>
                <p class="text-sm text-blue-700 dark:text-blue-300 mt-1">
                  Reading call records and generating invoices. Please wait, this may take several minutes.
                </p>
                <div class="mt-3">
                  <div class="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2">
                    <div class="bg-blue-600 h-2 rounded-full animate-pulse" style="width: 100%"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Success Message -->
          <div v-if="result" class="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <div class="flex items-start gap-3">
              <UIcon name="i-lucide-check-circle" class="text-green-600 dark:text-green-400 mt-0.5" />
              <div class="flex-1">
                <p class="font-medium text-green-900 dark:text-green-100">Generation completed successfully!</p>
                <div class="text-sm text-green-700 dark:text-green-300 mt-2 space-y-1">
                  <p><strong>Message:</strong> {{ result.message }}</p>

                  <div class="mt-3 pt-3 border-t border-green-200 dark:border-green-800">
                    <p class="font-medium mb-1">📊 CDR Processing:</p>
                    <p class="ml-4"><strong>Month:</strong> {{ result.cdr?.month }}</p>
                    <p class="ml-4"><strong>Total CDR:</strong> {{ result.cdr?.totalCdr }}</p>
                    <p class="ml-4"><strong>Outbound CDR:</strong> {{ result.cdr?.outboundCdr }}</p>
                    <p class="ml-4"><strong>Customers aggregated:</strong> {{ result.cdr?.customersAggregated }}</p>
                  </div>

                  <div class="mt-3 pt-3 border-t border-green-200 dark:border-green-800">
                    <p class="font-medium mb-1">📄 PDF Generation:</p>
                    <p class="ml-4"><strong>PDFs generated:</strong> {{ result.pdf?.generatedCount }}</p>
                    <p class="ml-4"><strong>Output directory:</strong> {{ result.pdf?.outDir }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Error Message -->
          <div v-if="error" class="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div class="flex items-start gap-3">
              <UIcon name="i-lucide-alert-circle" class="text-red-600 dark:text-red-400 mt-0.5" />
              <div class="flex-1">
                <p class="font-medium text-red-900 dark:text-red-100">Generation failed</p>
                <p class="text-sm text-red-700 dark:text-red-300 mt-1">{{ error }}</p>
              </div>
            </div>
          </div>
        </div>
      </UCard>
    </div>
  </UContainer>
</template>

<script lang="ts" setup>
definePageMeta({
  middleware: 'protected',
});

const loading = ref(false);
const result = ref<any>(null);
const error = ref<string | null>(null);
const toast = useToast();

async function handleGenerate() {
  loading.value = true;
  result.value = null;
  error.value = null;

  try {
    const token = localStorage.getItem("token");
    const response = await $fetch('/api/cdr/generate-with-pdf', {
      method: 'POST',
      timeout: 600000, // 10 minutes timeout
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
    });

    result.value = response;

    toast.add({
      title: 'Success',
      description: 'CDR processing and PDF generation completed successfully',
      icon: 'lucide:check',
      color: 'success',
    });
  } catch (err: any) {
    const errorMessage = err?.data?.message || err?.message || 'Failed to generate CDR reports and PDFs';
    error.value = errorMessage;

    toast.add({
      title: 'Error',
      description: errorMessage,
      icon: 'lucide:alert-triangle',
      color: 'error',
    });
  } finally {
    loading.value = false;
  }
}
</script>
