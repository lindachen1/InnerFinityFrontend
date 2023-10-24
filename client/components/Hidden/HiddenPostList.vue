<script setup lang="ts">
import { fetchy } from "@/utils/fetchy";
import { storeToRefs } from "pinia";
import { onBeforeMount, ref } from "vue";
import { useUserStore } from "../../stores/user";

const loaded = ref(false);
const { currentUsername } = storeToRefs(useUserStore());
let posts = ref<Array<Record<string, any>>>([]);

async function getHiddenPosts() {
  let postResults;
  try {
    postResults = await fetchy("/api/posts", "GET", { query: { type: "hidden" } });
    console.log("hidden: ", postResults);
  } catch (_) {
    return;
  }
  posts.value = postResults;
}

async function requestAccess(postId: string) {
  try {
    await fetchy(`/api/sharing/posts/${postId}/requests`, "POST");
  } catch (_) {
    return;
  }
  await getHiddenPosts();
}

onBeforeMount(async () => {
  await getHiddenPosts();
  loaded.value = true;
});
</script>

<template>
  <section class="posts" v-if="loaded && posts.length !== 0">
    <div class="row">
      <article v-for="post in posts" :key="post._id">
        <div class="column">
          <p class="author">{{ post.owners.join(", ") }}</p>
          <p class="hiddenPost"><span class="material-symbols-outlined">lock</span>Hidden post</p>
          <button v-if="post.requestedAccess.includes(currentUsername)" class="pure-button pure-button-primary" disabled="true">Requested Access</button>
          <button v-else @click="requestAccess(post.resource)" class="pure-button pure-button-primary">Request Access</button>
        </div>
      </article>
    </div>
  </section>
  <p v-else-if="loaded">No hidden posts found</p>
  <p v-else>Loading...</p>
</template>

<style scoped>
.hiddenPost {
  font-size: 1em;
  text-align: center;
}

.hiddenPost span {
  font-size: 1em;
  vertical-align: middle;
}

.author {
  font-size: 1.5em;
  text-align: center;
}

article {
  background-color: var(--base-bg);
  border-radius: 1em;
  display: flex;
  flex-direction: column;
  margin: 1em;
  padding: 1em 2em;
}

.posts {
  padding: 1em;
}
</style>
