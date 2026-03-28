<template>
  <section class="admin-panel page">
    <div class="toolbar">
      <h1>公告管理</h1>
      <el-button type="primary" @click="openCreate">新增公告</el-button>
    </div>
    <el-table v-loading="loading" :data="rows">
      <el-table-column prop="title" label="标题" min-width="220" />
      <el-table-column prop="level" label="等级" width="120" />
      <el-table-column prop="sort" label="排序" width="100" />
      <el-table-column prop="pinned" label="置顶" width="100">
        <template #default="{ row }">{{ row.pinned === 1 ? '是' : '否' }}</template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="100">
        <template #default="{ row }">{{ row.status === 1 ? '启用' : '停用' }}</template>
      </el-table-column>
      <el-table-column label="操作" width="140">
        <template #default="{ row }">
          <el-button link type="primary" @click="openEdit(row)">编辑</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="dialogVisible" :title="editingId ? '编辑公告' : '新增公告'" width="50%" min-width="500px" append-to-body>
      <el-form :model="form" label-width="100px">
        <el-form-item label="标题"><el-input v-model="form.title" /></el-form-item>
        <el-form-item label="内容"><el-input v-model="form.content" type="textarea" :rows="4" /></el-form-item>
        <el-form-item label="链接"><el-input v-model="form.link" /></el-form-item>
        <el-form-item label="等级">
          <el-select v-model="form.level" style="width:100%">
            <el-option label="信息" value="info" />
            <el-option label="成功" value="success" />
            <el-option label="警告" value="warning" />
            <el-option label="危险" value="danger" />
          </el-select>
        </el-form-item>
        <el-form-item label="排序"><el-input-number v-model="form.sort" :min="0" /></el-form-item>
        <el-form-item label="置顶"><el-switch v-model="pinnedSwitch" /></el-form-item>
        <el-form-item label="启用"><el-switch v-model="statusSwitch" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveAnnouncement">保存</el-button>
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
const dialogVisible = ref(false)
const editingId = ref<number | null>(null)
const pinnedSwitch = ref(false)
const statusSwitch = ref(true)
const form = reactive({ title: '', content: '', link: '', level: 'info', sort: 0, pinned: 0, status: 1, start_at: '', end_at: '' })

function resetForm() {
  Object.assign(form, { title: '', content: '', link: '', level: 'info', sort: 0, pinned: 0, status: 1, start_at: '', end_at: '' })
  editingId.value = null
  pinnedSwitch.value = false
  statusSwitch.value = true
}

async function loadAnnouncements() {
  loading.value = true
  try {
    const res = await http.get('/admin/announcements', { params: { page: 1, page_size: 50 } })
    rows.value = res.data.list
  } finally {
    loading.value = false
  }
}

function openCreate() {
  resetForm()
  dialogVisible.value = true
}

function openEdit(row: any) {
  editingId.value = row.id
  Object.assign(form, { title: row.title, content: row.content, link: row.link, level: row.level, sort: row.sort, start_at: row.start_at || '', end_at: row.end_at || '' })
  pinnedSwitch.value = row.pinned === 1
  statusSwitch.value = row.status === 1
  dialogVisible.value = true
}

async function saveAnnouncement() {
  const payload = { ...form, pinned: pinnedSwitch.value ? 1 : 0, status: statusSwitch.value ? 1 : 0 }
  if (editingId.value) {
    await http.put(`/admin/announcements/${editingId.value}`, payload)
    ElMessage.success('公告更新成功')
  } else {
    await http.post('/admin/announcements', payload)
    ElMessage.success('公告创建成功')
  }
  dialogVisible.value = false
  await loadAnnouncements()
}

onMounted(loadAnnouncements)
</script>
<style scoped>
.page { padding: 24px; }
.toolbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px; }
</style>
