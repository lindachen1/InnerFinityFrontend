<script setup lang="ts">
import { onBeforeMount, ref } from "vue";
import { fetchy } from "../../utils/fetchy";

const emit = defineEmits(["refreshFriends"]);
const loaded = ref(false);
let incomingRequests = ref<Array<Record<string, string>>>([]);
let outgoingRequests = ref<Array<Record<string, string>>>([]);

async function getIncomingFriendRequests() {
  let requestResults;
  try {
    requestResults = await fetchy(`/api/friend/incomingRequests`, "GET");
  } catch {
    return;
  }
  incomingRequests.value = requestResults;
}

async function getOutgoingFriendRequests() {
  let requestResults;
  try {
    requestResults = await fetchy(`/api/friend/outgoingRequests`, "GET");
  } catch {
    return;
  }
  outgoingRequests.value = requestResults;
}

defineExpose({ getOutgoingFriendRequests });

async function acceptRequest(friend: string) {
  try {
    await fetchy(`/api/friend/accept/${friend}`, "PUT");
  } catch {
    return;
  }
  emit("refreshFriends");
  await getIncomingFriendRequests();
}

async function rejectRequest(friend: string) {
  try {
    await fetchy(`/api/friend/reject/${friend}`, "PUT");
  } catch {
    return;
  }
  await getIncomingFriendRequests();
}

async function removeRequest(friend: string) {
  try {
    await fetchy(`/api/friend/requests/${friend}`, "DELETE");
  } catch {
    return;
  }
  await getOutgoingFriendRequests();
}

onBeforeMount(async () => {
  await getIncomingFriendRequests();
  await getOutgoingFriendRequests();
  loaded.value = true;
});
</script>

<template>
  <section v-if="loaded">
    <h1>Incoming Friend Requests</h1>
    <p v-for="request in incomingRequests" :key="request._id">
      {{ request.from }}
      <button @click="acceptRequest(request.from)">Accept</button>
      <button @click="rejectRequest(request.from)">Reject</button>
    </p>

    <h1>Outgoing Friend Requests</h1>
    <p v-for="request in outgoingRequests" :key="request._id">
      {{ request.to }}
      <button @click="removeRequest(request.to)">Remove</button>
    </p>
  </section>
</template>

<style scoped></style>
