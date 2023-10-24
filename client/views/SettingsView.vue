<script setup lang="ts">
import router from "@/router";
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";
import UpdateUserForm from "../components/Setting/UpdateUserForm.vue";

const { currentUsername } = storeToRefs(useUserStore());
const { logoutUser, deleteUser } = useUserStore();

async function logout() {
  await logoutUser();
  await router.push({ name: "Login" });
}

async function delete_() {
  var result = confirm("Are you sure you want to delete this account? (Deleting is irreversible!)");
  if (!result) {
    return;
  }
  await deleteUser();
  await router.push({ name: "Login" });
}
</script>

<template>
  <main class="column">
    <h1>Settings for {{ currentUsername }}</h1>
    <button class="pure-button pure-button-primary" @click="logout">Logout</button>
    <button class="button-error pure-button" @click="delete_">Delete User</button>
    <UpdateUserForm />
  </main>
</template>

<style scoped></style>
