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
  {{ props.friend }}
  <button @click="removeFriend(props.friend)">Remove</button>
</template>

<style scoped></style>
