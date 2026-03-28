<template>
  <div class="login-shell">
    <div class="login-card glass-panel fade-in-up">
      <div class="login-header">
        <span class="badge-chip">{{ $t('login.badge') }}</span>
        <h1 class="login-title">{{ $t('login.title') }}</h1>
        <p class="login-desc">{{ $t('login.desc') }}</p>
      </div>
      
      <el-form :model="form" @submit.prevent="handleLogin" label-position="top" class="login-form">
        <el-form-item :label="$t('login.email')">
          <el-input v-model="form.identifier" placeholder="demo@devstore.local" size="large" />
        </el-form-item>
        <el-form-item :label="$t('login.password')">
          <el-input v-model="form.password" type="password" show-password placeholder="Admin@123456" size="large" />
        </el-form-item>
        <button type="submit" class="login-btn hover-float" @click.prevent="handleLogin">
          {{ $t('login.loginBtn') }} →
        </button>
        <button type="button" class="oauth-btn hover-float" @click="handleLinuxDOLogin">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="oauth-icon"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M13.8 12H3"/></svg>
          {{ $t('login.oauthBtn') }}
        </button>
      </el-form>

      <!-- Locale Toggle -->
      <div class="login-footer">
        <button class="locale-switch" @click="switchLocale">
          {{ locale === 'zh-CN' ? 'English' : '中文' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import http from '@/api/http'
import { useAuthStore } from '@/stores/auth'
import { toggleLocale, currentLocale } from '@/i18n'

const router = useRouter()
const auth = useAuthStore()
const form = reactive({ identifier: 'demo@devstore.local', password: 'Admin@123456' })
const locale = ref(currentLocale())

function switchLocale() {
  toggleLocale()
  locale.value = currentLocale()
}

async function handleLogin() {
  const res = await http.post<{ token: string }>('/auth/login', form)
  auth.setToken(res.data.token)
  await auth.fetchProfile().catch(() => undefined)
  router.push('/')
}

async function handleLinuxDOLogin() {
  const res = await http.get<{ authorize_url: string }>('/auth/oauth/linux-do/authorize')
  window.location.href = res.data.authorize_url
}
</script>

<style scoped>
.login-shell { 
  min-height: 100vh; display: grid; place-items: center; padding: 20px; 
  background: var(--bg-page);
}

.login-card { 
  width: min(480px, 100%); padding: 48px; display: flex; flex-direction: column; gap: 32px; 
}

.login-header { display: flex; flex-direction: column; gap: 16px; }

.badge-chip {
  display: inline-block; width: max-content;
  padding: 6px 14px; border-radius: 999px; font-size: 12px; font-weight: 700;
  background: rgba(16, 185, 129, 0.08); color: var(--primary-strong);
  text-transform: uppercase; letter-spacing: 0.05em;
}

.login-title { 
  margin: 0; font-size: 36px; font-weight: 800; letter-spacing: -0.03em; line-height: 1.1; 
}

.login-desc { 
  margin: 0; color: var(--text-secondary); line-height: 1.6; font-size: 15px; 
}

.login-form { display: flex; flex-direction: column; gap: 8px; }

.login-btn {
  width: 100%; height: 52px; border-radius: 16px; border: none;
  background: var(--btn-primary-bg); color: var(--btn-primary-text);
  font-size: 16px; font-weight: 700; cursor: pointer;
  transition: all 0.2s;
  margin-top: 8px;
}
.login-btn:hover { background: var(--btn-primary-bg); filter: brightness(0.9); transform: translateY(-2px); box-shadow: 0 12px 24px rgba(0,0,0,0.15); }

.oauth-btn {
  width: 100%; height: 52px; border-radius: 16px;
  background: var(--bg-glass); border: 1px solid var(--border);
  font-size: 15px; font-weight: 600; cursor: pointer; color: var(--text-main);
  transition: all 0.2s;
  display: flex; align-items: center; justify-content: center; gap: 10px;
}
.oauth-btn:hover { background: var(--bg-elevated); }
.oauth-icon { width: 20px; height: 20px; }

.login-footer { display: flex; justify-content: center; }
.locale-switch {
  background: none; border: none; color: var(--text-secondary); font-size: 14px;
  cursor: pointer; text-decoration: underline; text-underline-offset: 4px;
  transition: color 0.2s;
}
.locale-switch:hover { color: var(--text-main); }

@media (max-width: 640px) {
  .login-card { padding: 32px 24px; }
  .login-title { font-size: 28px; }
}
</style>
