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
  <section v-if="loaded" class="row">
    <div class="col-md-6">
      <h4>Incoming Requests</h4>
      <article>
        <span v-if="incomingRequests.length === 0">No requests!</span>
        <div class="user" v-for="request in incomingRequests" :key="request._id">
          <span>{{ request.from }}</span>
          <span>
            <button @click="acceptRequest(request.from)" class="button-success btn-small pure-button">Accept</button>
            <button @click="rejectRequest(request.from)" class="button-error btn-small pure-button">Reject</button>
          </span>
        </div>
      </article>
    </div>
    <div class="col-md-6">
      <h4>Outgoing Requests</h4>
      <article>
        <span v-if="outgoingRequests.length === 0">No requests!</span>
        <div class="user" v-for="request in outgoingRequests" :key="request._id">
          <span>{{ request.to }}</span>
          <button @click="removeRequest(request.to)" class="button-error btn-small pure-button">Remove</button>
        </div>
      </article>
    </div>
  </section>
</template>

<style scoped>
h4 {
  text-align: center;
}

button {
  margin-left: 1em;
}

article {
  background-color: var(--base-bg);
  border-radius: 1em;
  display: flex;
  flex-direction: column;
  padding: 1em;
  margin: 1em;
  max-height: 35vh;
  overflow-y: auto;
  gap: 0.8em;
}
.user {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
}

.user:hover {
  background-color: var(--light-blue);
}
</style>
