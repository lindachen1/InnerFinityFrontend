<script setup lang="ts">
import PostComponent from "@/components/Post/PostComponent.vue";
import router from "@/router";
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";
import { onBeforeMount, ref } from "vue";
import RequestedAccess from "../components/Profile/RequestedAccess.vue";
import UpdateUserForm from "../components/Profile/UpdateUserForm.vue";
import { fetchy } from "../utils/fetchy";

const { currentUsername } = storeToRefs(useUserStore());
const { logoutUser, deleteUser } = useUserStore();

const loaded = ref(false);
let posts = ref<Array<Record<string, string>>>([]);

async function getPosts() {
  let query: Record<string, string> = { author: currentUsername.value };
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

async function logout() {
  await logoutUser();
  void router.push({ name: "Login" });
}

async function delete_() {
  var result = confirm("Are you sure you want to delete this account? (Deleting is irreversible!)");
  if (!result) {
    return;
  }
  await deleteUser();
  void router.push({ name: "Login" });
}
</script>

<template>
  <div class="row">
    <main class="col-md-4">
      <div v-if="loaded" class="center">
        <h1>{{ currentUsername }}</h1>
        <button class="pure-button pure-button-primary" @click="logout">Logout</button>
        <button class="button-error pure-button" @click="delete_">Delete User</button>
        <UpdateUserForm />
      </div>
      <p v-else>Loading...</p>
    </main>
    <div class="column col-md-8 posts">
      <h3 style="margin: 0; padding: 0">Your Posts</h3>
      <section class="posts" v-if="loaded && posts.length !== 0">
        <article v-for="post in posts" :key="post._id">
          <div class="row">
            <div class="col-md-7">
              <PostComponent :post="post" :hideAccess="true" @refreshPosts="getPosts" />
            </div>
            <div class="col-md-5">
              <h5>Requested Access:</h5>
              <RequestedAccess :post="post" />
            </div>
          </div>
        </article>
      </section>
      <p v-else-if="loaded">No posts found</p>
      <p v-else>Loading...</p>
    </div>
  </div>
</template>

<style scoped>
section {
  display: flex;
  flex-direction: column;
  gap: 1em;
}

.center {
  height: 80vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-evenly;
}

article {
  background-color: var(--base-bg);
  border-radius: 1em;
  display: flex;
  flex-direction: column;
  gap: 0.5em;
  padding: 1em 0;
}

.posts {
  padding: 1em;
  max-height: 88vh;
  overflow-y: auto;
}

.row {
  display: flex;
  justify-content: center;
  margin: 0 auto;
  max-width: 95%;
}
</style>
