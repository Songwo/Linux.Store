import { defineStore } from 'pinia';
import http from '@/api/http';
export const useAuthStore = defineStore('auth', {
    state: () => ({
        token: localStorage.getItem('devstore_user_token') || '',
        profile: null,
    }),
    getters: {
        isLoggedIn: (state) => Boolean(state.token),
    },
    actions: {
        setToken(token) {
            this.token = token;
            localStorage.setItem('devstore_user_token', token);
        },
        logout() {
            this.token = '';
            this.profile = null;
            localStorage.removeItem('devstore_user_token');
        },
        async fetchProfile() {
            if (!this.token) {
                this.profile = null;
                return null;
            }
            const res = await http.get('/user/profile');
            this.profile = res.data;
            return this.profile;
        },
    },
});
//# sourceMappingURL=auth.js.map