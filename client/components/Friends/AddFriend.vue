<script setup lang="ts">
import { ref } from "vue";
import { fetchy } from "../../utils/fetchy";

const user = ref("");
let searchedUser = ref("");
const emit = defineEmits(["refreshRequests"]);

async function requestFriend(user: string) {
  try {
    await fetchy(`/api/friend/requests/${user}`, "POST");
  } catch {
    return;
  }
  emit("refreshRequests");
}

async function search(user: string) {
  try {
    searchedUser.value = (await fetchy(`/api/users/${user}`, "GET")).username;
  } catch {
    return;
  }
}
</script>

<template>
  <main>
    <form @submit.prevent="search(user)" class="pure-form">
      <label for="search">Username:</label>
      <div>
        <input id="search" type="text" v-model="user" placeholder="Username" required />
        <button type="submit" @click="search(user)" class="pure-button pure-button-primary">Search</button>
      </div>
    </form>
    <section class="addFriend" v-if="searchedUser">
      <p>{{ searchedUser }}</p>
      <p><button class="pure-button pure-button-primary" @click="requestFriend(searchedUser)">Request</button></p>
    </section>
  </main>
  <hr />
</template>

<style scoped>
main {
  display: flex;
  flex-direction: column;
  align-items: center;
}

label {
  font-weight: bold;
}

form {
  display: flex;
  width: 100%;
  justify-content: center;
  gap: 1em;
  padding: 1em;
  align-items: center;
}

section {
  display: flex;
  width: 28em;
  padding: 1em 1em 0 1em;
  background-color: var(--base-bg);
  border-radius: 1em;
  justify-content: space-between;
  align-items: center;
}
</style>
