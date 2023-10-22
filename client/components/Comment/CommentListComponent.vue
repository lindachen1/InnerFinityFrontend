<script setup lang="ts">
import { fetchy } from "@/utils/fetchy";
import { onBeforeMount, ref } from "vue";
import { useUserStore } from "@/stores/user";
import { formatDate } from "@/utils/formatDate";
import { storeToRefs } from "pinia";
import CreateCommentComponent from "./CreateCommentComponent.vue";

const loaded = ref(false);
const props = defineProps(["post"]);
const { currentUsername } = storeToRefs(useUserStore());
let comments = ref<Array<Record<string, string>>>([]);

async function getComments() {
  let commentResults;
  try {
    commentResults = await fetchy(`/api/posts/${props.post._id}/comments`, "GET");
  } catch (_) {
    return;
  }
  comments.value = commentResults;
}

async function deleteComment(commentId: string) {
  try {
    await fetchy(`/api/comments/${commentId}`, "DELETE");
  } catch (_) {
    return;
  }
  await getComments();
}

onBeforeMount(async () => {
  await getComments();
  loaded.value = true;
});
</script>

<template>
  <h1>Comments</h1>
  <section class="comments" v-if="loaded && comments.length !== 0">
    <div v-for="comment in comments" :key="comment._id">
      <span>
        <b>{{ comment.author }}:</b> {{ comment.content }}
      </span>
      <div class="base">
        <menu v-if="comment.author === currentUsername">
          <li><button class="button-error btn-small pure-button" @click="deleteComment(comment._id)">Delete</button></li>
        </menu>
        <article class="timestamp">
          <p>Created on: {{ formatDate(comment.dateCreated) }}</p>
        </article>
      </div>
    </div>
  </section>
  <p v-else-if="loaded">No comments yet!</p>
  <p v-else>Loading...</p>

  <CreateCommentComponent :post="props.post" @refreshComments="getComments" />
</template>

<style scoped>
section {
  display: flex;
  flex-direction: column;
  gap: 1em;
}

section,
p,
.row {
  margin: 0 auto;
  max-width: 60em;
}
.posts {
  padding: 1em;
}

.row {
  display: flex;
  justify-content: space-between;
  margin: 0 auto;
  max-width: 60em;
}
menu {
  list-style-type: none;
  display: flex;
  flex-direction: row;
  gap: 1em;
  padding: 0;
  margin: 0;
}

.timestamp {
  display: flex;
  justify-content: flex-end;
  font-size: 0.9em;
  font-style: italic;
}

.base {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.base article:only-child {
  margin-left: auto;
}
</style>
