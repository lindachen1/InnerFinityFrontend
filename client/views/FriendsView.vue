<script setup lang="ts">
import FriendList from "@/components/Friends/FriendList.vue";

import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";

const { currentUsername, isLoggedIn } = storeToRefs(useUserStore());
</script>

<template>
  <main>
    <section>
      <h1 v-if="isLoggedIn">{{ currentUsername }}'s Friend List!</h1>
      <h1 v-else>Please login!</h1>
      <FriendList />
    </section>
  </main>
</template>

<style scoped>
h1 {
  text-align: center;
}
</style>
