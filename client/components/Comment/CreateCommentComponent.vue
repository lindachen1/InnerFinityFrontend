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
    <div class="input">
      <label for="content"><b>Comment:</b></label>
      <input type="text" id="content" v-model="content" placeholder="Enter comment content!" required />
    </div>

    <div v-if="loaded" class="row">
      <div class="col-md-6">
        <b>Share with (users):</b>
        <span class="tool-tip">
          <span class="material-symbols-outlined" style="vertical-align: middle">info</span>
          <span class="tool-tip-text">Comments must be viewable by the author(s) of the post. Only users who have access to the parent post <b>and</b> the comment can view your comment.</span>
        </span>
        <div class="list">
          <p v-if="friends.length === 0">No friends to choose from!</p>
          <div v-for="user in friends" :key="user">
            <label class="checkboxLabel">
              <input v-if="props.post.authors.includes(user)" class="checkbox" type="checkbox" disabled="true" checked="true" />
              <input v-else type="checkbox" class="checkbox" :id="user" :value="user" v-model="audience_users" />
              {{ user }}
            </label>
          </div>
        </div>
      </div>
      <div class="col-md-6">
        <b>Share with (lists):</b>
        <span class="tool-tip">
          <span class="material-symbols-outlined" style="vertical-align: middle">info</span>
          <span class="tool-tip-text">Sharing permissions for this comment will be changed if the User List members are updated.</span>
        </span>
        <div class="list">
          <div v-for="list in lists" :key="list._id">
            <label class="checkboxLabel">
              <input type="checkbox" class="checkbox" :id="list._id" :value="list.name" v-model="audience_lists" />
              {{ list.name }}
            </label>
          </div>
        </div>
      </div>
    </div>

    <button type="submit" class="pure-button-primary pure-button btn-small">Post Comment</button>
  </form>
</template>

<style scoped>
form {
  margin-top: 0.5em;
  padding: 0.5em;
  border-style: solid;
  border-width: 1px;
  border-radius: 4px;
}

b {
  font-size: 0.9em;
}
.list {
  max-height: 20vh;
  font-size: 0.8em;
  overflow-y: auto;
  margin-bottom: 0.5em;
  background-color: white;
  padding: 0.5em 0 0 0.5em;
  border-radius: 0.5em;
}

.input {
  display: flex;
  gap: 0.5em;
  align-items: center;
}

#content {
  flex: 1;
}
</style>
