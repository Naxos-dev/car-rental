<template>
  <AppHeader />
  <RouterView />
  <AppFooter />
</template>

<script setup>
import AppHeader from "./components/AppHeader.vue";
import AppFooter from "./components/AppFooter.vue";
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
body {
  font-family: "Segoe UI", system-ui, sans-serif;
  background: #fff;
  color: #1a1a2e;
}
</style>
