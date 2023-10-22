<script setup lang="ts">
import CreateList from "@/components/UserList/CreateList.vue";
import ListComponent from "@/components/UserList/ListComponent.vue";
import { onBeforeMount, ref } from "vue";
import { fetchy } from "../../utils/fetchy";

const loaded = ref(false);
let lists = ref<Array<Record<string, string>>>([]);

async function getLists() {
  let listResults;
  try {
    listResults = await fetchy(`/api/userLists`, "GET");
  } catch {
    return;
  }
  lists.value = listResults.splice(1); // Remove first element which is the default Friends list
}

onBeforeMount(async () => {
  await getLists();
  loaded.value = true;
});
</script>

<template>
  <section class="lists" v-if="loaded">
    <article v-for="list in lists" :key="list._id">
      <ListComponent :list="list" @refreshLists="getLists" />
    </article>
  </section>

  <CreateList @refreshLists="getLists" />
</template>

<style scoped>
article {
  background-color: var(--base-bg);
  border-radius: 1em;
  display: flex;
  flex-direction: column;
  gap: 0.5em;
  padding: 1em;
  margin: 1em;
}
</style>
