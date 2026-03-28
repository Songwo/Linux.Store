<template>
  <div class="login-shell">
    <div class="login-card admin-panel">
      <div>
        <div class="tag">DevStore Admin</div>
        <h1>登录后台</h1>
        <p>默认账号为 admin / Admin@123456，后续可接 RBAC 与 Casbin。</p>
      </div>
      <el-form :model="form" label-position="top">
        <el-form-item label="用户名">
          <el-input v-model="form.username" size="large" />
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="form.password" size="large" type="password" show-password />
        </el-form-item>
        <el-button type="primary" size="large" round style="width: 100%;" @click="submit">登录后台</el-button>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAdminStore } from '@/stores/admin'
const router = useRouter()
const store = useAdminStore()
const form = reactive({ username: '', password: '' })
async function submit() { await store.login(form); router.push('/') }
</script>

<style scoped>
.login-shell { min-height: 100vh; display: grid; place-items: center; padding: 20px; }
.login-card { width: min(440px, 100%); padding: 34px; }
.tag { display: inline-flex; padding: 8px 12px; border-radius: 999px; background: rgba(20,184,166,.12); color: #0f766e; font-weight: 700; }
h1 { margin: 18px 0 8px; font-size: 40px; }
p { color: #64748b; line-height: 1.8; }
</style>
