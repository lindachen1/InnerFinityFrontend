<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { formatDate } from "@/utils/formatDate";
import { storeToRefs } from "pinia";
import { onBeforeMount, ref } from "vue";
import { fetchy } from "../../utils/fetchy";

const props = defineProps(["post", "hideAccess"]);
const loaded = ref(false);
const emit = defineEmits(["refreshPosts"]);
const { currentUsername } = storeToRefs(useUserStore());
const sharedWith = ref(Array<string>());

const deletePost = async () => {
  var result = confirm("Are you sure you want to delete this post? (Deleting is irreversible!)");
  if (!result) {
    return;
  }
  try {
    await fetchy(`/api/posts/${props.post._id}`, "DELETE");
  } catch {
    return;
  }
  emit("refreshPosts");
};

const getSharing = async () => {
  let sharingResults;
  try {
    sharingResults = await fetchy(`/api/sharing/posts/${props.post._id}/members`, "GET");
  } catch {
    return;
  }
  sharedWith.value = sharingResults;
};

onBeforeMount(async () => {
  if (props.post.authors.includes(currentUsername.value)) {
    await getSharing();
  }
  loaded.value = true;
});
</script>

<template>
  <p class="author">{{ props.post.authors.join(", ") }}</p>
  <img v-bind:src="props.post.content.image" v-bind:alt="props.post.content.altText" />
  <p class="caption">{{ props.post.content.caption }}</p>
  <hr />
  <div class="base">
    <article class="timestamp">
      <p>Created on: {{ formatDate(props.post.dateCreated) }}</p>
    </article>
    <p class="truncate" v-if="props.post.authors.includes(currentUsername) && loaded && !props.hideAccess"><b>Users with access:</b> {{ sharedWith.join(", ") }}</p>
    <br />
    <button v-if="props.post.authors.includes(currentUsername)" class="button-error btn-small pure-button" @click="deletePost">Delete</button>
  </div>
</template>

<style scoped>
hr {
  border: 0;
  clear: both;
  display: block;
  width: 96%;
  background-color: gray;
  height: 1px;
}

p {
  margin: 0em;
}

img {
  width: 100%;
}

.author {
  font-size: 1.5em;
  text-align: center;
}

.caption {
  text-align: center;
}

.base {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
}

.base article:only-child {
  margin-left: auto;
}

.truncate {
  vertical-align: middle;
  max-width: 30vw;
  font-size: 0.9em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.truncate:hover {
  overflow: visible;
  white-space: normal;
  height: auto;
}
</style>
