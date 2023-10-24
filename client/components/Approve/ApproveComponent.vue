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
  var result = confirm("Are you sure you want to reject this post? (Doing so will delete the post!)");
  if (!result) {
    return;
  }
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
  <section>
    <p>{{ props.post.requiresApproval.length }} users still need to approve this post!</p>
    <span v-if="requiresApproval">
      <button @click="approvePost" class="button-success pure-button">Approve</button>
      <button @click="rejectPost" class="button-error pure-button">Reject</button>
    </span>
    <p v-else>Approved!</p>
  </section>
</template>

<style scoped>
section {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

button {
  margin: 1em;
}
</style>
