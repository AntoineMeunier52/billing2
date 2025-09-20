<template>
  <div class="container-input-form">
    <label :for="props.id">{{ props.label }}</label>
    <div>
      <Icon v-if="props.icon" :name="props.icon" style="color: black" />
      <input
        :id="props.id"
        :type="currentType"
        v-model="modelValue"
        :class="errorStyle"
      />
      <button class="button-input-form" v-if="canBeHide" @click="showAndHide">
        <Icon v-if="showText" name="lucide:eye"></Icon>
        <Icon v-else name="lucide:eye-off"></Icon>
      </button>
    </div>
    <div class="error-input-form">
      <p v-if="props.error">{{ props.error }}</p>
    </div>
  </div>
</template>

<script lang="ts" setup>
const props = defineProps({
  id: { type: String, required: true },
  inputType: { type: String, default: "text" },
  label: { type: String, required: true },
  error: { type: String, default: "" },
  hideOption: { type: Boolean, default: false },
  icon: { type: String, default: "" },
});

const modelValue = defineModel<string | number>();

const errorStyle = computed(() => {
  props.error ? "input-form border-red" : "input-form border-blue";
});

/////////////////////////
///show and hide logic///
/////////////////////////

const currentType = ref(props.inputType);

//available only on password input if option hide is on true
const canBeHide = computed(
  () => props.hideOption && props.inputType === "password"
);

const showText = ref(false);
function showAndHide() {
  if (canBeHide.value) {
    showText.value = !showText.value;
    currentType.value = showText.value ? "text" : "password";
  }
}
</script>

<style></style>
