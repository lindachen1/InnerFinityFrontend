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
    <label for="image">Post Image:</label>
    <input type="url" id="image" v-model="imageURL" placeholder="Enter an image URL!" required />

    <label for="caption">Post Caption:</label>
    <textarea id="caption" v-model="caption" placeholder="Enter a caption!" required> </textarea>

    <label for="altText">Alt Text:</label>
    <textarea id="altText" v-model="altText" placeholder="Enter alt text for the image!" required> </textarea>

    <section v-if="loaded">
      <p>Choose authors:</p>
      <div v-for="user in friends" :key="user">
        <input type="checkbox" :id="user" :value="user" v-model="authors" />
        <label for="checkbox">{{ user }}</label>
      </div>
    </section>

    <section v-if="loaded">
      <p>Choose audience (users):</p>
      <div v-for="user in friends" :key="user">
        <input type="checkbox" :id="user" :value="user" v-model="audience_users" />
        <label for="checkbox">{{ user }}</label>
      </div>
    </section>

    <section v-if="loaded">
      <p>Choose audience (lists):</p>
      <div v-for="list in lists" :key="list._id">
        <input type="checkbox" :id="list._id" :value="list.name" v-model="audience_lists" />
        <label for="checkbox"
          >{{ list.name }} <span style="font-size: 0.6em">{{ list.members.join(", ") }}</span></label
        >
      </div>
    </section>

    <section>
      <input type="checkbox" v-model="allowRequests" />
      <label for="checkbox">Show as hidden post to all other users.</label>
    </section>

    <button type="submit" class="pure-button-primary pure-button">Create Post</button>
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
}

textarea {
  font-family: inherit;
  font-size: inherit;
  height: 2em;
  padding: 0.5em;
  border-radius: 4px;
  resize: none;
}
</style>
