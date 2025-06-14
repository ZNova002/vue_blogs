<template>
    <div class="login-container">
        <h2>Đăng nhập</h2>

        <!-- Thông báo -->
        <div v-if="successMessage" class="success">{{ successMessage }}</div>
        <div v-if="error" class="error">{{ error }}</div>

        <!-- Form đăng nhập -->
        <form v-if="!isAuthenticated" @submit.prevent="login">
            <div>
                <label for="email">Email:</label>
                <input id="email" v-model="form.email" type="email" required />
            </div>
            <div>
                <label for="password">Mật khẩu:</label>
                <input id="password" v-model="form.password" type="password" required />
            </div>
            <button type="submit" :disabled="isLoading">
                {{ isLoading ? 'Đang đăng nhập...' : 'Đăng nhập' }}
            </button>
        </form>

        <!-- Đăng xuất -->
        <div v-if="isAuthenticated">
            <p>Chào {{ getUser?.name || 'Người dùng' }}</p>
            <button @click="logout" :disabled="isLoading">
                {{ isLoading ? 'Đang đăng xuất...' : 'Đăng xuất' }}
            </button>
        </div>
    </div>
</template>

<script>
import { useAuthStore } from '../stores/auth';
import { useRouter } from 'vue-router';

export default {
    name: 'LoginView',
    setup() {
        const authStore = useAuthStore();
        const router = useRouter();
        return { authStore, router };
    },
    data() {
        return {
            form: {
                email: '',
                password: '',
            },
            error: null,
            successMessage: null,
            isLoading: false,
        };
    },
    computed: {
        isAuthenticated() {
            return this.authStore.isAuthenticated;
        },
        getUser() {
            return this.authStore.getUser;
        },
    },
    methods: {
        async login() {
            this.isLoading = true;
            this.error = null;
            this.successMessage = null;
            try {
                await this.authStore.login(this.form);
                this.successMessage = 'Đăng nhập thành công!';
                this.form.email = '';
                this.form.password = '';
                setTimeout(() => {
                    this.successMessage = null;
                    this.router.push('/');
                }, 2000);
            } catch (error) {
                this.error = error.message || 'Đăng nhập thất bại';
            } finally {
                this.isLoading = false;
            }
        },
        async logout() {
            this.isLoading = true;
            this.error = null;
            this.successMessage = null;
            try {
                await this.authStore.logout();
                this.successMessage = 'Đăng xuất thành công!';
                setTimeout(() => {
                    this.successMessage = null;
                    this.router.push('/login');
                }, 2000);
            } catch (error) {
                console.error('Logout error:', error);
                this.error = 'Đăng xuất thất bại';
            } finally {
                this.isLoading = false;
            }
        },
    },
};
</script>

<style scoped>
.login-container {
    max-width: 400px;
    margin: 50px auto;
    padding: 20px;
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}
h2 {
    text-align: center;
    margin-bottom: 20px;
    color: #333;
}
.error {
    color: red;
    padding: 10px;
    background-color: #ffe6e6;
    border-radius: 4px;
    margin-bottom: 15px;
}
.success {
    color: green;
    padding: 10px;
    background-color: #e6ffe6;
    border-radius: 4px;
    margin-bottom: 15px;
}
div {
    margin-bottom: 15px;
}
label {
    display: block;
    margin-bottom: 5px;
    color: #555;
}
input {
    width: 100%;
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 4px;
    box-sizing: border-box;
}
input:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 5px rgba(0, 123, 255, 0.3);
}
button {
    width: 100%;
    padding: 10px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}
button:hover:not(:disabled) {
    background-color: #0056b3;
}
button:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
}
p {
    text-align: center;
    color: #333;
}
</style>
