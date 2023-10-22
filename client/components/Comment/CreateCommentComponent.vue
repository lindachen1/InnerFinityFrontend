<script setup lang="ts">
import { onBeforeMount, ref } from "vue";
import { fetchy } from "../../utils/fetchy";

const props = defineProps(["post"]);
const emit = defineEmits(["refreshComments"]);
const loaded = ref(false);
const friends = ref<Array<string>>([]);
const lists = ref<Array<Record<string, any>>>([]);
const content = ref("");
const audience_users = ref<Array<string>>([]);
const audience_lists = ref<Array<string>>([]);

async function getFriends() {
  let friendResults;
  try {
    friendResults = await fetchy(`/api/friends`, "GET");
  } catch {
    return;
  }
  friends.value = friendResults;
}

async function getLists() {
  let listResults;
  try {
    listResults = await fetchy(`/api/userLists`, "GET");
  } catch {
    return;
  }
  lists.value = listResults;
}

async function createComment(content: string, shareWithUsers: Array<string>, shareWithLists: Array<string>) {
  try {
    await fetchy(`/api/posts/${props.post._id}/comments`, "POST", {
      body: { content, shareWithUsers, shareWithLists },
    });
  } catch (_) {
    return;
  }
  emptyForm();
  emit("refreshComments");
}

const emptyForm = () => {
  content.value = "";
  audience_users.value = [];
  audience_lists.value = [];
};

onBeforeMount(async () => {
  await getFriends();
  await getLists();
  loaded.value = true;
});
</script>

<template>
  <form @submit.prevent="createComment(content, audience_users, audience_lists)">
    <label for="content">Comment:</label>
    <textarea id="content" v-model="content" placeholder="Enter comment content!" required> </textarea>

    <section v-if="loaded">
      <p>Choose audience (users):</p>
      <p v-if="friends.length === 0">No friends to choose from!</p>
      <div v-for="user in friends" :key="user">
        <input type="checkbox" :id="user" :value="user" v-model="audience_users" />
        <label for="checkbox">{{ user }}</label>
      </div>
    </section>

    <section v-if="loaded">
      <p>Choose audience (lists):</p>
      <div v-for="list in lists" :key="list._id">
        <input type="checkbox" :id="list._id" :value="list.name" v-model="audience_lists" />
        <label for="checkbox">
          {{ list.name }}
          <div class="truncate">
            {{ list.members.join(", ") }}
          </div>
        </label>
      </div>
    </section>

    <button type="submit" class="pure-button-primary pure-button">Post Comment</button>
  </form>
</template>

<style scoped>
form {
  background-color: var(--base-bg);
  border-radius: 1em;
  display: flex;
  flex-direction: column;
  gap: 0.5em;
  padding: 1em;
  width: 80%;
  margin: auto;
}

textarea {
  font-family: inherit;
  font-size: inherit;
  height: 2em;
  padding: 0.5em;
  border-radius: 4px;
  resize: none;
}

.truncate {
  display: inline-block;
  font-size: 0.6em;
  width: 50%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
