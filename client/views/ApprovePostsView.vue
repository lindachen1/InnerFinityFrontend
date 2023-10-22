<script setup lang="ts">
import ApprovePostList from "@/components/Approve/ApprovePostList.vue";
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";

const { isLoggedIn } = storeToRefs(useUserStore());
</script>

<template>
  <main>
    <h1>Approve Posts</h1>

    <ApprovePostList v-if="isLoggedIn" />
    <h1 v-else>Please login!</h1>
  </main>
</template>

<style scoped>
h1 {
  text-align: center;
}
</style>
