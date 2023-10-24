<script setup lang="ts">
import RequestedAccess from "@/components/Approve/RequestedAccess.vue";
import PostComponent from "@/components/Post/PostComponent.vue";
import { onBeforeMount, ref } from "vue";
import { fetchy } from "../../utils/fetchy";

const loaded = ref(false);
let posts = ref<Array<Record<string, string>>>([]);

async function getPosts() {
  let query: Record<string, string> = { type: "myHidden" };
  let postResults;
  try {
    postResults = await fetchy("/api/posts", "GET", { query });
  } catch (_) {
    return;
  }
  posts.value = postResults;
}

onBeforeMount(async () => {
  await getPosts();
  loaded.value = true;
});
</script>

<template>
  <section class="posts" v-if="loaded && posts.length !== 0">
    <article v-for="post in posts" :key="post._id">
      <div class="row">
        <div class="col-md-6">
          <PostComponent :post="post" :hideAccess="true" @refreshPosts="getPosts" />
        </div>
        <div class="col-md-6">
          <h5>Requested Access:</h5>
          <RequestedAccess :post="post" />
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
  padding: 1em 0;
}

.row {
  display: flex;
  justify-content: center;
  margin: 0 auto;
  width: 60em;
}
</style>
