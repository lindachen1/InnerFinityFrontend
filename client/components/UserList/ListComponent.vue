<script setup lang="ts">
import EditMembers from "@/components/UserList/EditMembers.vue";
import { ref } from "vue";
import { fetchy } from "../../utils/fetchy";

const props = defineProps(["list"]);
const emit = defineEmits(["refreshLists"]);
const editing = ref(false);
const editingMembers = ref(false);
const listName = ref(props.list.name);
const listMembers = ref<Array<string>>(props.list.members);

async function editName(name: string) {
  try {
    await fetchy(`/api/userLists/${props.list._id}`, "PATCH", {
      body: { name },
    });
  } catch (_) {
    return;
  }
  editing.value = false;
}

async function removeMember(user: string) {
  try {
    await fetchy(`/api/userLists/${props.list._id}/members/${user}`, "DELETE");
  } catch (_) {
    return;
  }
  listMembers.value.splice(listMembers.value.indexOf(user), 1);
  return;
}

async function deleteList() {
  try {
    await fetchy(`/api/userLists/${props.list._id}`, "DELETE");
  } catch (_) {
    return;
  }
  emit("refreshLists");
}

async function addMembers(members: Array<string>) {
  try {
    await fetchy(`/api/userLists/${props.list._id}/members`, "POST", {
      body: { users: members },
    });
  } catch (_) {
    return;
  }
  listMembers.value.push(...members);
  editingMembers.value = false;
  return;
}

function toggleEditing() {
  editing.value = true;
}

function toggleAddMembers() {
  editingMembers.value = true;
}
</script>

<template>
  <section v-if="editing">
    <button class="editButton" @click="editName(listName)">Done</button>
    <input class="name" type="text" v-model="listName" required />
  </section>
  <section v-else>
    <button class="editButton" @click="toggleEditing">Edit</button>
    <span class="name">{{ listName }}</span>
  </section>

  <div class="members">
    <h3>Members:</h3>
    <div v-for="member in listMembers" :key="member">
      {{ member }}
      <button @click="removeMember(member)">Remove</button>
    </div>
    <button @click="toggleAddMembers">Add Members</button>
    <EditMembers :members="listMembers" v-if="editingMembers" @addedMembers="addMembers" />
  </div>

  <menu>
    <li><button class="button-error btn-small pure-button" @click="deleteList">Delete</button></li>
  </menu>
</template>

<style scoped>
.name {
  font-size: 1.5em;
  font-weight: bold;
}
.editButton {
  width: 4em;
  margin-right: 1em;
}

.editMemberButton {
  width: 12em;
}

menu {
  list-style-type: none;
  display: flex;
  flex-direction: row;
  gap: 1em;
  padding: 0;
  margin: 0;
}
</style>
