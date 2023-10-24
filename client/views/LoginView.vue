<script setup lang="ts">
import LoginForm from "@/components/Login/LoginForm.vue";
import RegisterForm from "@/components/Login/RegisterForm.vue";
</script>

<template>
  <main class="row">
    <div class="col-md-6 column" style="color: var(--dark-blue)">
      <h1>Welcome to InnerFinity</h1>
      <span class="material-symbols-outlined" style="font-size: 6em">all_inclusive</span>
    </div>
    <div class="col-md-6 column">
      <LoginForm />
      <RegisterForm />
    </div>
  </main>
</template>

<style scoped>
main {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: linear-gradient(white, var(--light-blue));
}
</style>
