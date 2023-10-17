<script setup lang="ts">
import AddFriend from "@/components/Friends/AddFriend.vue";
import FriendComponent from "@/components/Friends/FriendComponent.vue";
import FriendRequests from "@/components/Friends/FriendRequests.vue";
import { onBeforeMount, ref } from "vue";
import { fetchy } from "../../utils/fetchy";

const loaded = ref(false);
let friends = ref<Array<string>>([]);

async function getFriends() {
  let friendResults;
  try {
    friendResults = await fetchy(`/api/friends`, "GET");
  } catch {
    return;
  }
  friends.value = friendResults;
}

onBeforeMount(async () => {
  await getFriends();
  loaded.value = true;
});
</script>

<template>
  <h1>Friends</h1>
  <section class="friends" v-if="loaded">
    <p v-for="friend in friends" :key="friend">
      <FriendComponent :friend="friend" @refreshFriends="getFriends" />
    </p>
  </section>
  <section class="addFriend">
    <AddFriend />
  </section>
  <section class="friendRequests">
    <FriendRequests @refreshFriends="getFriends" />
  </section>
</template>

<style scoped></style>
