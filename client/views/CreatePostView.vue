<script setup lang="ts">
import CreatePostComponent from "@/components/Post/CreatePostComponent.vue";
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";

const { isLoggedIn } = storeToRefs(useUserStore());
</script>

<template>
  <main>
    <h1>New Post</h1>
    <section v-if="isLoggedIn">
      <CreatePostComponent />
    </section>
    <h1 v-else>Please login!</h1>
  </main>
</template>

<style scoped>
h1 {
  text-align: center;
}
</style>
