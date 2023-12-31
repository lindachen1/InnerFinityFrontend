<script setup lang="ts">
import ApproveComponent from "@/components/Approve/ApproveComponent.vue";
import PostComponent from "@/components/Post/PostComponent.vue";
import { fetchy } from "@/utils/fetchy";
import { onBeforeMount, ref } from "vue";

const loaded = ref(false);
let posts = ref<Array<Record<string, string>>>([]);

async function getPendingPosts() {
  let postResults;
  try {
    postResults = await fetchy("/api/posts", "GET", { query: { type: "pending" } });
  } catch (_) {
    return;
  }
  posts.value = postResults;
}

onBeforeMount(async () => {
  await getPendingPosts();
  loaded.value = true;
});
</script>

<template>
  <section class="posts" v-if="loaded && posts.length !== 0">
    <article v-for="post in posts" :key="post._id">
      <div class="row">
        <div class="col-md-6">
          <PostComponent :post="post" @refreshPosts="getPendingPosts()" />
        </div>
        <div class="col-md-6">
          <ApproveComponent :post="post" @refreshPosts="getPendingPosts()" />
        </div>
      </div>
    </article>
  </section>
  <p v-else-if="loaded">No posts found</p>
  <p v-else>Loading...</p>
</template>

<style scoped>
p {
  text-align: center;
  padding-top: 2em;
}
section {
  margin-top: 1em;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1em;
}

article {
  background-color: var(--base-bg);
  border-radius: 1em;
  display: flex;
  flex-direction: column;
  gap: 0.5em;
  padding: 1em;
}

.posts {
  padding: 1em;
}

.row {
  display: flex;
  justify-content: space-between;
  margin: 0 auto;
  width: 60em;
}
</style>
