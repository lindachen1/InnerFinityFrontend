<script setup lang="ts">
import { onBeforeMount, ref } from "vue";
import { fetchy } from "../../utils/fetchy";

const emit = defineEmits(["refreshFriends"]);
const loaded = ref(false);
let requests = ref<Array<Record<string, string>>>([]);

async function getFriendRequests() {
  let requestResults;
  try {
    requestResults = await fetchy(`/api/friend/requests`, "GET");
  } catch {
    return;
  }
  requests.value = requestResults;
}

async function acceptRequest(friend: string) {
  try {
    await fetchy(`/api/friend/accept/${friend}`, "PUT");
  } catch {
    return;
  }
  emit("refreshFriends");
  await getFriendRequests();
}

async function rejectRequest(friend: string) {
  try {
    await fetchy(`/api/friend/reject/${friend}`, "PUT");
  } catch {
    return;
  }
  await getFriendRequests();
}

onBeforeMount(async () => {
  await getFriendRequests();
  loaded.value = true;
});
</script>

<template>
  <h1>Friend Requests</h1>
  <section v-if="loaded">
    <p v-for="request in requests" :key="request._id">
      {{ request.from }}
      <button @click="acceptRequest(request.from)">Accept</button>
      <button @click="rejectRequest(request.from)">Reject</button>
    </p>
  </section>
</template>

<style scoped></style>
