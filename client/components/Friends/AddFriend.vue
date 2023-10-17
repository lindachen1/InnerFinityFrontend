<script setup lang="ts">
import { ref } from "vue";
import { fetchy } from "../../utils/fetchy";

const user = ref("");
let searchedUser = ref("");

async function requestFriend(user: string) {
  try {
    await fetchy(`/api/friend/requests/${user}`, "POST");
  } catch {
    return;
  }
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
  <h1>Add Friends</h1>
  <section class="search">
    <legend>Username:</legend>
    <input type="text" v-model="user" placeholder="Username" required />
    <button type="submit" @click="search(user)">Search</button>
  </section>
  <section class="addFriend" v-if="searchedUser">
    <p>
      {{ searchedUser }}
      <button type="submit" class="pure-button pure-button-primary" @click="requestFriend(searchedUser)">Request</button>
    </p>
  </section>
</template>

<style scoped></style>
