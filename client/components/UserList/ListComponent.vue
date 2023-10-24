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
  var result = confirm("If you delete this list, users may lose access to posts that are shared to this list. Are you sure you want to delete this list?");
  if (!result) {
    return;
  }
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
    <input class="name" type="text" v-model="listName" required />
    <button class="pure-button-primary pure-button" @click="editName(listName)">done</button>
  </section>
  <section v-else @click="toggleEditing" id="nameAndEdit">
    <span class="name">{{ listName }}</span>
    <span class="material-symbols-outlined" style="padding-left: 0.5em">edit</span>
  </section>

  <div class="members">
    <h5><b>Members:</b></h5>
    <div class="user" v-for="member in listMembers" :key="member">
      {{ member }}
      <button class="button-error btn-small pure-button" @click="removeMember(member)">Remove</button>
    </div>
  </div>

  <div>
    <button v-if="editingMembers" class="pure-button-primary pure-button" disabled="true">Add Members</button>
    <button v-else class="pure-button-primary pure-button" @click="toggleAddMembers">Add Members</button>
    <EditMembers :members="listMembers" v-if="editingMembers" @addedMembers="addMembers" />
  </div>

  <menu>
    <li><button class="button-error btn-small pure-button" @click="deleteList">Delete</button></li>
  </menu>
</template>

<style scoped>
#nameAndEdit:hover {
  border-style: solid;
  border-width: 1px;
  border-radius: 4px;
}

section {
  width: fit-content;
  display: flex;
  align-items: center;
}

.name {
  font-size: 1.5em;
  font-weight: bold;
}

menu {
  list-style-type: none;
  display: flex;
  flex-direction: row;
  gap: 1em;
  padding: 0;
  margin: 0;
}

.members {
  display: flex;
  flex-direction: column;
  gap: 1em;
}
.user {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
}

.user:hover {
  background-color: var(--light-blue);
}
</style>
