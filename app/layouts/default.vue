<template>
  <div>
    <nav class="flex justify-between items-center h-[70px] shadow-md">
      <h1 class="ml-[30px] text-2xl font-bold">BILLING</h1>
      <ul
        class="flex mr-[30px] [&>li]:mx-[10px] [&>li]:hover:text-blue-500 [&>li]:hover:underline"
      >
        <li><NuxtLink to="/customer">Customers</NuxtLink></li>
        <li><NuxtLink to="/generator">Generator</NuxtLink></li>
        <li><NuxtLink to="/user">Users</NuxtLink></li>
      </ul>
    </nav>
    <slot />
  </div>
</template>

<script lang="ts" setup></script>

<style></style>
