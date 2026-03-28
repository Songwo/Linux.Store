<template>
  <section class="admin-panel page">
    <div class="toolbar">
      <h1>用户管理</h1>
      <div class="actions">
        <el-input v-model="keyword" placeholder="搜索昵称 / 邮箱" style="width: 280px;" clearable @keyup.enter="loadUsers" />
        <el-button type="primary" @click="loadUsers">查询</el-button>
      </div>
    </div>
    <el-table v-loading="loading" :data="rows">
      <el-table-column prop="id" label="ID" width="90" />
      <el-table-column prop="nickname" label="昵称" min-width="180" />
      <el-table-column prop="email" label="邮箱" min-width="220" />
      <el-table-column prop="balance" label="余额" width="120" />
      <el-table-column prop="points" label="积分" width="120" />
      <el-table-column prop="source" label="来源" width="120" />
      <el-table-column prop="status" label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="row.status === 1 ? 'success' : 'danger'">{{ row.status === 1 ? '启用' : '禁用' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="created_at" label="注册时间" min-width="180" />
      <el-table-column label="操作" width="140">
        <template #default="{ row }">
          <el-button link type="primary" @click="openAdjust(row)">调整钱包</el-button>
        </template>
      </el-table-column>
    </el-table>
    <div class="pager">
      <el-pagination v-model:current-page="page" v-model:page-size="pageSize" layout="total, prev, pager, next" :total="total" @current-change="loadUsers" />
    </div>

    <el-dialog v-model="adjustVisible" title="调整用户钱包" width="520px" append-to-body>
      <el-form :model="adjustForm" label-width="100px">
        <el-form-item label="用户">
          <div>{{ currentUser?.nickname }} / {{ currentUser?.email }}</div>
        </el-form-item>
        <el-form-item label="调整金额">
          <el-input-number v-model="adjustForm.amount" :precision="2" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="adjustForm.remark" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="adjustVisible = false">取消</el-button>
        <el-button type="primary" @click="submitAdjust">确认</el-button>
      </template>
    </el-dialog>
  </section>
</template>
<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import http from '@/api/http'

const loading = ref(false)
const rows = ref<any[]>([])
const keyword = ref('')
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)
const adjustVisible = ref(false)
const currentUser = ref<any | null>(null)
const adjustForm = reactive({ amount: 0, remark: '' })

async function loadUsers() {
  loading.value = true
  try {
    const res = await http.get('/admin/users', { params: { keyword: keyword.value, page: page.value, page_size: pageSize.value } })
    rows.value = res.data.list
    total.value = res.data.total
  } finally {
    loading.value = false
  }
}

function openAdjust(row: any) {
  currentUser.value = row
  adjustForm.amount = 0
  adjustForm.remark = ''
  adjustVisible.value = true
}

async function submitAdjust() {
  if (!currentUser.value) return
  await http.post(`/admin/users/${currentUser.value.id}/wallet/adjust`, adjustForm)
  ElMessage.success('钱包调整成功')
  adjustVisible.value = false
  await loadUsers()
}

onMounted(loadUsers)
</script>
<style scoped>
.page { padding: 24px; }
.toolbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px; gap: 12px; }
.actions { display: flex; gap: 12px; }
.pager { display: flex; justify-content: flex-end; margin-top: 18px; }
</style>
