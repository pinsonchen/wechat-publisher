<template>
  <div class="draft-page">
    <div class="header">
      <h1>草稿箱</h1>
      <UButton to="/draft/create" color="primary" icon="i-heroicons-plus">
        新建草稿
      </UButton>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading">
      <UProgress animation="bounce" />
      <p>加载中...</p>
    </div>

    <!-- 草稿列表 -->
    <div v-else-if="drafts.length > 0" class="draft-list">
      <UCard v-for="draft in drafts" :key="draft.media_id" class="draft-item">
        <template #header>
          <div class="draft-header">
            <h3 class="draft-title">{{ draft.content?.news_item?.[0]?.title || '无标题' }}</h3>
            <div class="draft-actions">
              <UButton color="white" variant="ghost" icon="i-heroicons-eye" @click="preview(draft)">
                预览
              </UButton>
              <UButton color="primary" variant="solid" icon="i-heroicons-paper-airplane" @click="publish(draft)">
                群发
              </UButton>
              <UButton color="white" variant="ghost" icon="i-heroicons-pencil" @click="edit(draft)">
                编辑
              </UButton>
              <UButton color="red" variant="ghost" icon="i-heroicons-trash" @click="deleteDraft(draft)">
                删除
              </UButton>
            </div>
          </div>
        </template>

        <div class="draft-content">
          <p class="draft-author">
            <span class="label">作者:</span>
            {{ draft.content?.news_item?.[0]?.author || '未设置' }}
          </p>
          <p class="draft-digest">
            <span class="label">摘要:</span>
            {{ draft.content?.news_item?.[0]?.digest || '无摘要' }}
          </p>
          <p class="draft-time">
            <span class="label">更新时间:</span>
            {{ formatTime(draft.update_time) }}
          </p>
        </div>
      </UCard>

      <!-- 分页 -->
      <div class="pagination">
        <UButton
          color="white"
          variant="outline"
          :disabled="offset === 0"
          @click="loadDrafts(offset - count)"
        >
          上一页
        </UButton>
        <span class="page-info">第 {{ Math.floor(offset / count) + 1 }} 页</span>
        <UButton
          color="white"
          variant="outline"
          :disabled="drafts.length < count"
          @click="loadDrafts(offset + count)"
        >
          下一页
        </UButton>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else class="empty">
      <UIcon name="i-heroicons-document-text" class="empty-icon" />
      <p>暂无草稿</p>
      <UButton to="/draft/create" color="primary">
        创建第一篇草稿
      </UButton>
    </div>

    <!-- 群发确认弹窗 -->
    <UModal v-model="showPublishModal">
      <UCard>
        <template #header>
          <h3>确认群发</h3>
        </template>
        <p>确定要群发这篇文章吗？</p>
        <p class="text-sm text-gray-500 mt-2">
          群发后无法撤回，请谨慎操作
        </p>
        <template #footer>
          <div class="flex gap-2">
            <UButton color="white" variant="outline" @click="showPublishModal = false">
              取消
            </UButton>
            <UButton color="primary" :loading="publishing" @click="confirmPublish">
              确认群发
            </UButton>
          </div>
        </template>
      </UCard>
    </UModal>
  </div>
</template>

<script setup lang="ts">
interface DraftItem {
  media_id: string;
  content: {
    news_item: Array<{
      title: string;
      author: string;
      digest: string;
      thumb_url: string;
    }>;
  };
  update_time: number;
}

const loading = ref(true);
const drafts = ref<DraftItem[]>([]);
const offset = ref(0);
const count = ref(20);
const showPublishModal = ref(false);
const publishing = ref(false);
const currentDraft = ref<DraftItem | null>(null);

// 加载草稿列表
async function loadDrafts(newOffset?: number) {
  loading.value = true;
  if (newOffset !== undefined) {
    offset.value = newOffset;
  }

  try {
    const resp = await fetch('/api/web/draft/batchget', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        offset: offset.value,
        count: count.value,
        no_content: 0,
      }),
    });

    const data = await resp.json();
    if (data.base_resp?.ret === 0) {
      drafts.value = data.item || [];
    } else {
      alert('加载失败：' + (data.base_resp?.err_msg || '未知错误'));
    }
  } catch (error) {
    console.error('加载草稿失败:', error);
    alert('加载失败，请稍后重试');
  } finally {
    loading.value = false;
  }
}

// 预览草稿
function preview(draft: DraftItem) {
  // TODO: 实现预览功能
  alert('预览功能开发中...');
}

// 编辑草稿
function edit(draft: DraftItem) {
  // TODO: 跳转到编辑页面
  alert('编辑功能开发中...');
}

// 群发
async function publish(draft: DraftItem) {
  currentDraft.value = draft;
  showPublishModal.value = true;
}

// 确认群发
async function confirmPublish() {
  if (!currentDraft.value) return;

  publishing.value = true;
  try {
    const resp = await fetch('/api/web/publish/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        media_id: currentDraft.value.media_id,
      }),
    });

    const result = await resp.json();
    if (result.base_resp?.ret === 0) {
      alert('群发成功！');
      showPublishModal.value = false;
      loadDrafts(); // 刷新列表
    } else {
      alert('群发失败：' + (result.base_resp?.err_msg || '未知错误'));
    }
  } catch (error) {
    console.error('群发失败:', error);
    alert('群发失败，请稍后重试');
  } finally {
    publishing.value = false;
  }
}

// 删除草稿
async function deleteDraft(draft: DraftItem) {
  if (!confirm(`确定要删除"${draft.content?.news_item?.[0]?.title}"吗？`)) {
    return;
  }

  try {
    const resp = await fetch('/api/web/draft/delete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        media_id: draft.media_id,
      }),
    });

    const result = await resp.json();
    if (result.base_resp?.ret === 0) {
      alert('删除成功');
      loadDrafts(); // 刷新列表
    } else {
      alert('删除失败：' + (result.base_resp?.err_msg || '未知错误'));
    }
  } catch (error) {
    console.error('删除失败:', error);
    alert('删除失败，请稍后重试');
  }
}

// 格式化时间
function formatTime(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  return date.toLocaleString('zh-CN');
}

// 页面加载时获取草稿列表
onMounted(() => {
  loadDrafts();
});
</script>

<style scoped>
.draft-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.header h1 {
  font-size: 24px;
  font-weight: 600;
}

.loading {
  text-align: center;
  padding: 60px 20px;
}

.loading p {
  margin-top: 10px;
  color: #666;
}

.draft-list {
  display: grid;
  gap: 20px;
}

.draft-item {
  transition: box-shadow 0.2s;
}

.draft-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.draft-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.draft-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
}

.draft-actions {
  display: flex;
  gap: 10px;
}

.draft-content {
  color: #666;
}

.draft-content p {
  margin: 8px 0;
}

.label {
  font-weight: 500;
  color: #333;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  margin-top: 30px;
}

.page-info {
  color: #666;
}

.empty {
  text-align: center;
  padding: 60px 20px;
}

.empty-icon {
  font-size: 64px;
  color: #ccc;
  margin-bottom: 20px;
}

.empty p {
  color: #999;
  margin-bottom: 20px;
}
</style>
