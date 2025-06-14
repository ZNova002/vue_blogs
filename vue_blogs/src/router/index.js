import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import CategoriesView from '../views/CategoriesView.vue';
import BlogView from '../views/BlogView.vue';
import PostDetail from '../views/PostDetail.vue';
import AboutView from '../views/AboutView.vue';
import ContactView from '../views/ContactView.vue';
import CreatePost from '../views/CreatePost.vue';
import LoginView from '../components/LoginView.vue';
import ProfileView from '../views/ProfileView.vue';
import TagManage from '../views/TagManage.vue';
import ManagePosts from '../views/ManagePosts.vue';
import EditPost from '../views/EditPost.vue';
import ManageComments from '../views/ManageComments.vue';
import ManageContacts from '../views/ManageContacts.vue';
import { useAuthStore } from '../stores/auth';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'Home', component: HomeView },
    { path: '/blog', name: 'Blog', component: BlogView },
    { path: '/post/:id', name: 'Post', component: PostDetail },
    { path: '/about', name: 'About', component: AboutView },
    { path: '/contact', name: 'Contact', component: ContactView },
    { path: '/createpost', name: 'CreatePost', component: CreatePost, meta: { requiresAuth: true }},
    { path: '/login', name: 'Login', component: LoginView },
    { path: '/profile', name: 'Profile', component: ProfileView, meta: { requiresAuth: true }},
    { path: '/category', name: 'Category', component: CategoriesView, meta: { requiresAuth: true }},
    { path: '/tags', name: 'TagManage', component: TagManage, meta: { requiresAuth: true } },
    { path: '/manage-posts', name: 'ManagePosts', component: ManagePosts, meta: { requiresAuth: true }},
    { path: '/edit-post/:id', name: 'EditPost', component: EditPost, meta: { requiresAuth: true }},
    { path: '/manage-comments', name: 'ManageComments', component: ManageComments ,meta: { requiresAuth: true }},
    { path: '/managecontacts', name: 'ManageContacts', component: ManageContacts, meta: { requiresAuth: true }},
    { path: '/:pathMatch(.*)*', name: 'NotFound', redirect: '/' },
  ],
});

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    try {
      if (authStore.token) {
        await authStore.fetchUser();
        if (authStore.isAuthenticated) {
          next();
        } else {
          next('/login');
        }
      } else {
        next('/login');
      }
    } catch (error) {
      console.error('Authentication check failed:', error);
      next('/login');
    }
  } else if (authStore.isAuthenticated && to.path === '/login') {
    next('/');
  } else {
    next();
  }
});

export default router;
