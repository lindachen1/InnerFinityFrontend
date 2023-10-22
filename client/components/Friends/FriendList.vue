<script setup lang="ts">
import AddFriend from "@/components/Friends/AddFriend.vue";
import FriendComponent from "@/components/Friends/FriendComponent.vue";
import FriendRequests from "@/components/Friends/FriendRequests.vue";
import { onBeforeMount, ref } from "vue";
import { fetchy } from "../../utils/fetchy";

const loaded = ref(false);
let friends = ref<Array<string>>([]);
const requestChildComponent = ref<InstanceType<typeof FriendRequests> | null>(null);

async function getFriends() {
  let friendResults;
  try {
    friendResults = await fetchy(`/api/friends`, "GET");
  } catch {
    return;
  }
  friends.value = friendResults;
}

async function refreshRequests() {
  if (requestChildComponent.value) {
    await requestChildComponent.value.getOutgoingFriendRequests();
  }
  return;
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
    <AddFriend @refreshRequests="refreshRequests" />
  </section>
  <section class="friendRequests">
    <FriendRequests ref="requestChildComponent" @refreshFriends="getFriends" />
  </section>
</template>

<style scoped></style>
