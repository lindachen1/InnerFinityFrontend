import { storeToRefs } from "pinia";
import { createRouter, createWebHistory } from "vue-router";

import { useUserStore } from "@/stores/user";
import ApprovePostsView from "../views/ApprovePostsView.vue";
import CreatePostView from "../views/CreatePostView.vue";
import FriendsView from "../views/FriendsView.vue";
import HomeView from "../views/HomeView.vue";
import ListsView from "../views/ListsView.vue";
import LoginView from "../views/LoginView.vue";
import NotFoundView from "../views/NotFoundView.vue";
import ProfileView from "../views/ProfileView.vue";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      name: "Home",
      component: HomeView,
    },
    {
      path: "/post",
      name: "Post",
      component: CreatePostView,
    },
    {
      path: "/friends",
      name: "Friends",
      component: FriendsView,
    },
    {
      path: "/lists",
      name: "User Lists",
      component: ListsView,
    },
    {
      path: "/approve",
      name: "Approve Posts",
      component: ApprovePostsView,
    },
    {
      path: "/profile",
      name: "Profile",
      component: ProfileView,
      meta: { requiresAuth: true },
    },
    {
      path: "/login",
      name: "Login",
      component: LoginView,
      meta: { requiresAuth: false },
      beforeEnter: (to, from) => {
        const { isLoggedIn } = storeToRefs(useUserStore());
        if (isLoggedIn.value) {
          return { name: "Profile" };
        }
      },
    },
    {
      path: "/:catchAll(.*)",
      name: "not-found",
      component: NotFoundView,
    },
  ],
});

/**
 * Navigation guards to prevent user from accessing wrong pages.
 */
router.beforeEach((to, from) => {
  const { isLoggedIn } = storeToRefs(useUserStore());

  if (to.meta.requiresAuth && !isLoggedIn.value) {
    return { name: "Login" };
  }
});

export default router;
