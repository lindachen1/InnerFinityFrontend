<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { fetchy } from "@/utils/fetchy";
import { storeToRefs } from "pinia";
import { onBeforeMount, ref } from "vue";
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
  var result = confirm("Are you sure you want to delete this comment? (Deleting is irreversible!)");
  if (!result) {
    return;
  }
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
  <h3>Comments</h3>
  <section class="comments">
    <div v-if="loaded && comments.length !== 0">
      <div v-for="comment in comments" :key="comment._id">
        <b>{{ comment.author }}:</b> {{ comment.content }}
        <button class="button-error btn-small pure-button delete" v-if="currentUsername === comment.author" @click="deleteComment(comment._id)">Delete</button>
        <hr style="margin: 0.5em" />
      </div>
    </div>
    <p v-else-if="loaded">No comments yet!</p>
    <p v-else>Loading...</p>
  </section>

  <CreateCommentComponent :post="props.post" @refreshComments="getComments" />
</template>

<style scoped>
.comments {
  background-color: white;
  display: flex;
  flex-direction: column;
  gap: 0.5em;
  max-height: 40vh;
  overflow-y: auto;
  padding: 0.5em;
  border-radius: 4px;
}

.delete {
  float: right;
}
</style>
