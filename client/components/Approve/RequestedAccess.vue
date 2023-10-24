<script setup lang="ts">
import { onBeforeMount, ref } from "vue";
import { fetchy } from "../../utils/fetchy";

const props = defineProps(["post"]);
const loaded = ref(false);
const requesters = ref<Array<string>>([]);
const sharedWith = ref(Array<string>());

const getSharing = async () => {
  let sharingResults;
  try {
    sharingResults = await fetchy(`/api/sharing/posts/${props.post._id}/members`, "GET");
  } catch {
    return;
  }
  sharedWith.value = sharingResults;
};

async function getRequesters() {
  let results;
  try {
    results = await fetchy(`/api/sharing/posts/${props.post._id}/requesters`, "GET");
  } catch (_) {
    return;
  }
  requesters.value = results;
}

async function addAccess(user: string) {
  try {
    await fetchy(`/api/sharing/posts/${props.post._id}/members`, "POST", { body: { user } });
  } catch (_) {
    return;
  }
  requesters.value.splice(requesters.value.indexOf(user), 1);
  sharedWith.value.push(user);
}

async function rejectAccess(user: string) {
  try {
    await fetchy(`/api/sharing/posts/${props.post._id}/members/${user}`, "DELETE");
  } catch (_) {
    return;
  }
  requesters.value.splice(requesters.value.indexOf(user), 1);
  return;
}

onBeforeMount(async () => {
  await getRequesters();
  await getSharing();
  loaded.value = true;
});
</script>

<template>
  <div v-if="requesters.length === 0">No users have requested access!</div>
  <div class="user-wrapper">
    <div v-for="user in requesters" :key="user">
      <div class="user">
        <span>{{ user }}</span>
        <span>
          <button @click="addAccess(user)" class="button-success btn-small pure-button">Accept</button>
          <button @click="rejectAccess(user)" class="button-error btn-small pure-button">Reject</button>
        </span>
      </div>
    </div>
  </div>
  <p><b>Users with access:</b> {{ sharedWith.join(", ") }}</p>
</template>

<style scoped>
.user {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
}

.user:hover {
  background-color: var(--light-blue);
}

.user-wrapper {
  display: flex;
  flex-direction: column;
  gap: 0.5em;
}

p {
  position: absolute;
  bottom: 0px;
}

button {
  margin-left: 0.5em;
}

.approve {
  background-color: lightgreen;
}

.reject {
  background-color: lightcoral;
}

.truncate {
  vertical-align: middle;
  max-width: 30vw;
  font-size: 0.9em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.truncate:hover {
  overflow: visible;
  white-space: normal;
  height: auto;
}
</style>
