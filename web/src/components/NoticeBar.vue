<template>
  <div v-if="announcements.length > 0" class="notice-bar-container">
    <div class="notice-bar glass-panel">
      <div class="notice-icon">📢</div>
      <div class="notice-content">
        <div class="notice-track" :style="{ animationDuration: `${announcements.length * 10}s` }">
          <div v-for="item in displayAnnouncements" :key="item.id" class="notice-item" @click="showDetail(item)">
            <span class="notice-tag" :class="item.level">{{ item.level.toUpperCase() }}</span>
            <span class="notice-text">{{ item.title }}</span>
          </div>
        </div>
      </div>
      <div class="notice-actions">
        <button class="notice-close" @click="visible = false">✕</button>
      </div>
    </div>

    <!-- Detail Dialog -->
    <el-dialog v-model="detailVisible" :title="currentNotice?.title" width="500px" center class="glass-dialog" append-to-body>
      <div class="notice-detail">
        <p class="notice-body">{{ currentNotice?.content }}</p>
        <div v-if="currentNotice?.link" class="notice-link">
          <a :href="currentNotice.link" target="_blank" class="primary-link">{{ $t('common.viewMore') }} →</a>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { AnnouncementItem } from '@/api/mall'

const props = defineProps<{
  announcements: AnnouncementItem[]
}>()

const visible = ref(true)
const detailVisible = ref(false)
const currentNotice = ref<AnnouncementItem | null>(null)

const displayAnnouncements = computed(() => {
  // Triple the list to ensure smooth scrolling
  return [...props.announcements, ...props.announcements, ...props.announcements]
})

function showDetail(item: AnnouncementItem) {
  currentNotice.value = item
  detailVisible.value = true
}
</script>

<style scoped>
.notice-bar-container {
  margin-bottom: 24px;
}
.notice-bar {
  display: flex; align-items: center; gap: 16px;
  padding: 12px 24px; border-radius: 999px;
  overflow: hidden; position: relative;
}

.notice-icon { font-size: 18px; flex-shrink: 0; }

.notice-content {
  flex: 1; overflow: hidden; position: relative;
  height: 24px;
}

.notice-track {
  display: flex; align-items: center; gap: 40px;
  white-space: nowrap;
  animation: marquee linear infinite;
}

.notice-item {
  display: flex; align-items: center; gap: 8px;
  cursor: pointer; transition: opacity 0.2s;
}
.notice-item:hover { opacity: 0.8; }

.notice-tag {
  font-size: 10px; font-weight: 800; padding: 2px 6px; border-radius: 4px;
  background: rgba(0,0,0,0.05); color: var(--text-secondary);
}
.notice-tag.info { background: #dcfce7; color: #166534; }
.notice-tag.warn { background: #fef9c3; color: #854d0e; }
.notice-tag.error { background: #fee2e2; color: #991b1b; }

.notice-text { font-size: 14px; font-weight: 500; color: var(--text-main); }

.notice-actions { flex-shrink: 0; }
.notice-close {
  background: transparent; border: none; font-size: 16px;
  color: var(--text-muted); cursor: pointer; padding: 4px;
}

@keyframes marquee {
  0% { transform: translateX(0); }
  100% { transform: translateX(-33.33%); }
}

.notice-detail { padding: 12px 0; }
.notice-body { font-size: 15px; line-height: 1.6; color: var(--text-secondary); white-space: pre-wrap; }
.notice-link { margin-top: 24px; text-align: right; }
.primary-link { color: var(--primary-strong); font-weight: 600; text-decoration: none; }
</style>
