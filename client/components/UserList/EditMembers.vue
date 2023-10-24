<script setup lang="ts">
import { onBeforeMount, ref } from "vue";
import { fetchy } from "../../utils/fetchy";

const loaded = ref(false);
const friends = ref<Array<string>>([]);
const emit = defineEmits(["addedMembers"]);
const props = defineProps(["members"]);
const added = ref<Array<string>>([]);

async function getFriends() {
  let friendResults;
  try {
    friendResults = await fetchy(`/api/friends`, "GET");
  } catch {
    return;
  }
  friends.value = friendResults;
}

onBeforeMount(async () => {
  await getFriends();
  loaded.value = true;
});
</script>

<template>
  <form @submit.prevent="emit('addedMembers', added)">
    <section v-if="loaded">
      <p v-if="friends.length === 0">No friends to choose from!</p>
      <div v-for="user in friends" :key="user">
        <label class="checkboxLabel">
          <input class="checkbox" v-if="props.members.includes(user)" type="checkbox" disabled="true" checked="true" />
          <input class="checkbox" v-else type="checkbox" :id="user" :value="user" v-model="added" />
          {{ user }}
        </label>
      </div>
    </section>
    <p v-else>Loading...</p>

    <button type="submit" class="pure-button-primary pure-button">Confirm</button>
  </form>
</template>

<style scoped></style>
