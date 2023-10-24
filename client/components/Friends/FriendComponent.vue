<script setup lang="ts">
import { fetchy } from "../../utils/fetchy";

const props = defineProps(["friend"]);
const emit = defineEmits(["refreshFriends"]);

async function removeFriend(friend: string) {
  try {
    await fetchy(`/api/friends/${friend}`, "DELETE");
  } catch {
    return;
  }
  emit("refreshFriends");
}
</script>

<template>
  <section>
    {{ props.friend }}
    <button @click="removeFriend(props.friend)" class="button-error btn-small pure-button">Remove</button>
  </section>
</template>

<style scoped>
section {
  display: flex;
  width: 100%;
  justify-content: space-between;
}

section:hover {
  background-color: var(--light-blue);
}
</style>
