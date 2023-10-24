<script setup lang="ts">
import { useToastStore } from "@/stores/toast";
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";
import { computed, onBeforeMount } from "vue";
import { RouterLink, RouterView, useRoute } from "vue-router";
import router from "./router";

const currentRoute = useRoute();
const currentRouteName = computed(() => currentRoute.name);
const userStore = useUserStore();
const { isLoggedIn } = storeToRefs(userStore);
const { toast } = storeToRefs(useToastStore());

// Make sure to update the session before mounting the app in case the user is already logged in
onBeforeMount(async () => {
  try {
    await userStore.updateSession();

    if (!isLoggedIn.value) {
      await router.push({ name: "Login" });
    }
  } catch {
    // User is not logged in
  }
});
</script>

<template>
  <header>
    <nav v-if="isLoggedIn">
      <div class="title">
        <span class="material-symbols-outlined" style="font-size: 3em">all_inclusive</span>
        <RouterLink :to="{ name: 'Home' }">
          <h1>InnerFinity</h1>
        </RouterLink>
      </div>
      <ul>
        <li :class="{ underline: currentRouteName == 'Home' }">
          <RouterLink :to="{ name: 'Home' }">
            <div>
              <span class="material-symbols-outlined">Home</span>
              <p>Feed</p>
            </div>
          </RouterLink>
        </li>
        <li :class="{ underline: currentRouteName == 'Post' }">
          <RouterLink :to="{ name: 'Post' }">
            <div>
              <span class="material-symbols-outlined">post_add</span>
              <p>Post</p>
            </div>
          </RouterLink>
        </li>
        <li :class="{ underline: currentRouteName == 'Approve Posts' }">
          <RouterLink :to="{ name: 'Approve Posts' }">
            <div>
              <span class="material-symbols-outlined">rule</span>
              <p>Approve</p>
            </div>
          </RouterLink>
        </li>
        <li :class="{ underline: currentRouteName == 'Friends' }">
          <RouterLink :to="{ name: 'Friends' }">
            <div>
              <span class="material-symbols-outlined">group</span>
              <p>Friends</p>
            </div>
          </RouterLink>
        </li>
        <li :class="{ underline: currentRouteName == 'User Lists' }">
          <RouterLink :to="{ name: 'User Lists' }">
            <div>
              <span class="material-symbols-outlined">patient_list</span>
              <p>Lists</p>
            </div>
          </RouterLink>
        </li>
        <li :class="{ underline: currentRouteName == 'Hidden Posts' }">
          <RouterLink :to="{ name: 'Hidden Posts' }">
            <div>
              <span class="material-symbols-outlined">lock</span>
              <p>Hidden</p>
            </div>
          </RouterLink>
        </li>
        <li :class="{ underline: currentRouteName == 'Profile' }">
          <RouterLink :to="{ name: 'Profile' }">
            <div>
              <span class="material-symbols-outlined">account_circle</span>
              <p>Profile</p>
            </div>
          </RouterLink>
        </li>
      </ul>
    </nav>
    <article v-if="toast !== null" class="toast-custom" :class="toast.style">
      <p>{{ toast.message }}</p>
    </article>
  </header>
  <RouterView />
</template>

<style scoped>
@import "./assets/toast.css";

p {
  margin: 0;
  font-size: 0.8em;
}

li {
  width: 4em;
  text-align: center;
}

li:hover {
  background-color: var(--mid-blue);
}

.underline {
  border-style: solid;
  border-width: 1px;
  border-color: var(--dark-blue);
  background-color: var(--mid-blue);
}

header {
  position: sticky;
  top: 0;
  width: 100%;
  z-index: 1;
}

nav {
  padding: 0em 2em;
  background-color: var(--light-blue);
  display: flex;
  align-items: center;
}

h1 {
  font-size: 2em;
  margin: 0;
}

.title {
  display: flex;
  align-items: center;
  gap: 0.5em;
}

img {
  height: 2em;
}

a {
  font-size: large;
  color: black;
  text-decoration: none;
}

ul {
  list-style-type: none;
  margin-left: auto;
  display: flex;
  align-items: center;
  flex-direction: row;
  gap: 1em;
  margin-top: 0.5em;
  margin-bottom: 0.5em;
}
</style>
