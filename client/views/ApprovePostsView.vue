<script setup lang="ts">
import ApproveAccess from "@/components/Approve/ApproveAccess.vue";
import ApprovePostList from "@/components/Approve/ApprovePostList.vue";
import { storeToRefs } from "pinia";
import { onBeforeMount, ref } from "vue";
import { useUserStore } from "../stores/user";
import { fetchy } from "../utils/fetchy";

const { currentUsername } = storeToRefs(useUserStore());
const loaded = ref(false);
let posts = ref<Array<Record<string, string>>>([]);
const groupView = ref(false);

async function getPosts() {
  let query: Record<string, string> = { author: currentUsername.value };
  let postResults;
  try {
    postResults = await fetchy("/api/posts", "GET", { query });
  } catch (_) {
    return;
  }
  posts.value = postResults;
}

function toggleView() {
  groupView.value = !groupView.value;
  return;
}

onBeforeMount(async () => {
  await getPosts();
  loaded.value = true;
});
</script>

<template>
  <section class="chooseView">
    <button v-if="groupView" @click="toggleView" class="inactive">Approve Access to Your Posts</button>
    <button v-else class="active">Approve Access to Your Posts</button>

    <button v-if="groupView" class="active">Approve Group Posts</button>
    <button v-else @click="toggleView" class="inactive">Approve Group Posts</button>
  </section>

  <div v-if="groupView">
    <ApprovePostList />
  </div>
  <div v-else>
    <ApproveAccess />
  </div>
</template>

<style scoped>
hr {
  margin-top: 0;
}
.chooseView {
  margin-top: 2em;
  display: flex;
}

button {
  padding: 1em;
  width: 50%;
  margin-bottom: 0;
  border-width: 1px 1px 1px 1px;
  background-color: lightgray;
}

.active {
  background-color: white;
  font-weight: bold;
  border-width: 1px 1px 0 1px;
}
</style>
