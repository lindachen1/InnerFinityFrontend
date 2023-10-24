<script setup lang="ts">
import { onBeforeMount, ref } from "vue";
import { fetchy } from "../../utils/fetchy";

const imageURL = ref("");
const caption = ref("");
const altText = ref("");
const allowRequests = ref(false);
const loaded = ref(false);
const friends = ref<Array<string>>([]);
const lists = ref<Array<Record<string, any>>>([]);
const authors = ref<Array<string>>([]);
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

const createPost = async (imageURL: string, caption: string, altText: string, authors: Array<string>, allowRequests: boolean, shareWithUsers: Array<string>, shareWithLists: Array<string>) => {
  try {
    await fetchy("/api/posts", "POST", {
      body: { imageURL, caption, altText, authors, allowRequests, shareWithUsers, shareWithLists },
    });
  } catch (_) {
    return;
  }
  emptyForm();
};

const emptyForm = () => {
  imageURL.value = "";
  caption.value = "";
  altText.value = "";
  authors.value = [];
  allowRequests.value = false;
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
  <form @submit.prevent="createPost(imageURL, caption, altText, authors, allowRequests, audience_users, audience_lists)">
    <div class="input">
      <label for="image">Post Image:</label>
      <input type="url" id="image" v-model="imageURL" placeholder="Enter an image URL!" required />
    </div>

    <div class="input">
      <label for="caption">Post Caption:</label>
      <input type="text" id="caption" v-model="caption" placeholder="Enter a caption!" required />
    </div>

    <div class="input">
      <label for="altText">Alt Text:</label>
      <input type="text" id="altText" v-model="altText" placeholder="Enter alt text for the image!" required />
    </div>

    <section v-if="loaded">
      <div class="row">
        <div class="col-md-6">
          <b>Choose authors (select none for individual post):</b>
          <div class="list">
            <p v-if="friends.length === 0">No friends to choose from!</p>
            <div v-for="user in friends" :key="user">
              <label class="checkboxLabel">
                <input type="checkbox" class="checkbox" :id="user" :value="user" v-model="authors" />
                {{ user }}
              </label>
            </div>
          </div>
        </div>
      </div>

      <div class="row">
        <div class="col-md-6">
          <b>Choose audience (users):</b>
          <div class="list">
            <p v-if="friends.length === 0">No friends to choose from!</p>
            <div v-for="user in friends" :key="user">
              <label class="checkboxLabel">
                <input type="checkbox" class="checkbox" :id="user" :value="user" v-model="audience_users" />
                {{ user }}
              </label>
            </div>
          </div>
        </div>

        <div class="col-md-6">
          <b>Choose audience (lists):</b>
          <span class="tool-tip">
            <span class="material-symbols-outlined" style="vertical-align: middle">info</span>
            <span class="tool-tip-text">Sharing permissions for this comment will be changed if the User List members are updated.</span>
          </span>
          <div class="list">
            <div v-for="list in lists" :key="list._id">
              <div class="listItem">
                <label class="checkboxLabel">
                  <input type="checkbox" class="checkbox" :id="list._id" :value="list.name" v-model="audience_lists" />
                  {{ list.name }}
                  <span class="truncate">{{ list.members.join(", ") }}</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section>
      <label class="checkboxLabel">
        <input type="checkbox" v-model="allowRequests" />
        Show as hidden post to all other friends.
      </label>
    </section>

    <button type="submit" class="pure-button-primary pure-button">Create Post</button>
  </form>
</template>

<style scoped>
.list {
  max-height: 30vh;
  overflow-y: auto;
  background-color: white;
  border-radius: 1em;
  padding: 1em;
  margin: 1em 0;
}

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

b {
  margin-right: 0.5em;
}

.input {
  display: flex;
}

.input label {
  width: 120px;
}
.input input {
  flex: 1;
}

.listItem {
  display: flex;
}
.truncate {
  display: inline-block;
  vertical-align: middle;
  font-size: 0.8em;
  max-width: 28vw;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
