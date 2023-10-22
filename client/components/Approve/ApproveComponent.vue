<script setup lang="ts">
import { storeToRefs } from "pinia";
import { onBeforeMount, ref } from "vue";
import { useUserStore } from "../../stores/user";
import { fetchy } from "../../utils/fetchy";

const props = defineProps(["post"]);
const { currentUsername } = storeToRefs(useUserStore());
const emit = defineEmits(["refreshPosts"]);
const requiresApproval = ref(false);

async function approvePost() {
  try {
    await fetchy(`/api/posts/${props.post._id}/approve`, "PUT");
  } catch {
    return;
  }
  requiresApproval.value = false;
  emit("refreshPosts");
}

async function rejectPost() {
  try {
    await fetchy(`/api/posts/${props.post._id}/reject`, "PUT");
  } catch {
    return;
  }
  emit("refreshPosts");
}

onBeforeMount(async () => {
  const user = await fetchy(`/api/users/${currentUsername.value}`, "GET");
  for (const approver of props.post.requiresApproval) {
    if (approver === user._id) {
      requiresApproval.value = true;
      break;
    }
  }
});
</script>

<template>
  <p>{{ props.post.requiresApproval.length }} users still need to approve this post!</p>
  <section v-if="requiresApproval">
    <button @click="approvePost">Approve</button>
    <button @click="rejectPost">Reject</button>
  </section>
  <p v-else>Approved!</p>
</template>

<style scoped></style>
