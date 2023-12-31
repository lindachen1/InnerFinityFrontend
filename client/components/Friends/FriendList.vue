<script setup lang="ts">
import AddFriend from "@/components/Friends/AddFriend.vue";
import FriendComponent from "@/components/Friends/FriendComponent.vue";
import FriendRequests from "@/components/Friends/FriendRequests.vue";
import { onBeforeMount, ref } from "vue";
import { fetchy } from "../../utils/fetchy";

const loaded = ref(false);
let friends = ref<Array<string>>([]);
const requestChildComponent = ref<InstanceType<typeof FriendRequests> | null>(null);

async function getFriends() {
  let friendResults;
  try {
    friendResults = await fetchy(`/api/friends`, "GET");
  } catch {
    return;
  }
  friends.value = friendResults;
}

async function refreshRequests() {
  if (requestChildComponent.value) {
    await requestChildComponent.value.getOutgoingFriendRequests();
  }
  return;
}

onBeforeMount(async () => {
  await getFriends();
  loaded.value = true;
});
</script>

<template>
  <div class="row">
    <div class="col-md-4 friends">
      <h1>Friends</h1>
      <article v-if="loaded">
        <p v-if="friends.length === 0">No friends yet!</p>
        <p v-for="friend in friends" :key="friend">
          <FriendComponent :friend="friend" @refreshFriends="getFriends" />
        </p>
      </article>
    </div>
    <div class="col-md-8">
      <section>
        <h1>Add Friend</h1>
        <AddFriend @refreshRequests="refreshRequests" />
      </section>
      <section>
        <FriendRequests ref="requestChildComponent" @refreshFriends="getFriends" />
      </section>
    </div>
  </div>
</template>

<style scoped>
h1 {
  text-align: center;
}

.friends {
  height: calc(100vh - 7em);
  border-style: double;
  border-width: 0 2px 0 0;
  border-color: gray;
}

article {
  background-color: var(--base-bg);
  border-radius: 1em;
  display: flex;
  flex-direction: column;
  padding: 1em 1em 0;
  margin: 0 1em 0 0;
  max-height: 60vh;
  overflow-y: auto;
}
</style>
