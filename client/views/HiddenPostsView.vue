<script setup lang="ts">
import HiddenPostList from "@/components/Hidden/HiddenPostList.vue";
import router from "@/router";
</script>

<template>
  <main>
    <h1>Hidden Posts</h1>
    <p>Request access to hidden posts to notify the author(s) of your request. Once the author(s) approve your request, you will be able to see the post!</p>
    <p class="link" @click="router.push('/profile')">Approve/deny access requests on your posts</p>
    <HiddenPostList />
  </main>
</template>

<style scoped>
main {
  text-align: center;
}

.link {
  cursor: pointer;
  color: var(--mid-blue);
}

.link:hover {
  color: var(--semidark-blue);
  text-decoration: underline;
}
</style>
