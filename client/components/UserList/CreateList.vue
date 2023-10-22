<script setup lang="ts">
import { onBeforeMount, ref } from "vue";
import { fetchy } from "../../utils/fetchy";

const listName = ref("");
const listMembers = ref<Array<string>>([]);
const loaded = ref(false);
const friends = ref<Array<string>>([]);
const emit = defineEmits(["refreshLists"]);

async function getFriends() {
  let friendResults;
  try {
    friendResults = await fetchy(`/api/friends`, "GET");
  } catch {
    return;
  }
  friends.value = friendResults;
}

async function createList(name: string, members: Array<string>) {
  try {
    await fetchy("/api/userLists", "POST", {
      body: { name, members },
    });
  } catch (_) {
    return;
  }
  emptyForm();
  emit("refreshLists");
}

const emptyForm = () => {
  listName.value = "";
  listMembers.value = [];
};

onBeforeMount(async () => {
  await getFriends();
  loaded.value = true;
});
</script>

<template>
  <h1>Create New List</h1>
  <form @submit.prevent="createList(listName, listMembers)">
    <label for="name">List Name:</label>
    <input type="text" id="name" v-model="listName" placeholder="Enter a List Name!" required />

    <section v-if="loaded">
      <p>Choose members:</p>
      <p v-if="friends.length === 0">No friends to choose from!</p>
      <div v-for="user in friends" :key="user">
        <input type="checkbox" :id="user" :value="user" v-model="listMembers" />
        <label for="checkbox">{{ user }}</label>
      </div>
    </section>
    <p v-else>Loading...</p>

    <button type="submit">Create</button>
  </form>
</template>

<style scoped></style>
