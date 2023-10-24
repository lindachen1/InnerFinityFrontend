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
    <div class="input">
      <label for="name">List Name:</label>
      <input type="text" id="name" v-model="listName" placeholder="Enter a List Name!" required />
    </div>

    <section v-if="loaded">
      <br />
      <b>Choose members:</b>
      <div class="list">
        <p v-if="friends.length === 0">No friends to choose from!</p>
        <div v-for="user in friends" :key="user">
          <label class="checkboxLabel">
            <input type="checkbox" class="checkbox" :id="user" :value="user" v-model="listMembers" />
            {{ user }}
          </label>
        </div>
      </div>
    </section>
    <p v-else>Loading...</p>

    <button type="submit" class="pure-button-primary pure-button">Create</button>
  </form>
</template>

<style scoped>
.list {
  max-height: 35vh;
  overflow-y: auto;
  background-color: white;
  border-radius: 1em;
  padding: 1em;
  margin: 1em 0;
}
.input {
  display: flex;
}

.input label {
  width: 120px;
}
.input input {
  flex: 1;
}

h1 {
  text-align: center;
}

form {
  background-color: var(--base-bg);
  border-radius: 1em;
  padding: 1em;
}
</style>
