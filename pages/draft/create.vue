<template>
  <div class="create-draft-page">
    <div class="header">
      <h1>新建草稿</h1>
      <UButton to="/draft" color="white" variant="ghost">
        返回列表
      </UButton>
    </div>

    <UCard>
      <UForm :state="form" @submit="onSubmit">
        <!-- 标题 -->
        <UFormGroup label="文章标题" required class="form-group">
          <UInput
            v-model="form.title"
            placeholder="请输入标题（最多 64 字）"
            maxlength="64"
            size="xl"
          />
        </UFormGroup>

        <!-- 作者 -->
        <UFormGroup label="作者" class="form-group">
          <UInput
            v-model="form.author"
            placeholder="请输入作者名"
          />
        </UFormGroup>

        <!-- 摘要 -->
        <UFormGroup label="摘要" class="form-group">
          <UTextarea
            v-model="form.digest"
            placeholder="请输入摘要（选填，最多 120 字）"
            maxlength="120"
            :rows="3"
          />
        </UFormGroup>

        <!-- 封面图片 -->
        <UFormGroup label="封面图片" required class="form-group">
          <div class="upload-area">
            <input
              ref="fileInput"
              type="file"
              accept="image/*"
              class="file-input"
              @change="onFileChange"
            />
            <div v-if="!coverPreview" class="upload-placeholder" @click="triggerFileInput">
              <UIcon name="i-heroicons-cloud-arrow-up" class="upload-icon" />
              <p>点击上传图片</p>
              <p class="hint">支持 jpg/png/gif/bmp，不超过 2MB</p>
            </div>
            <div v-else class="cover-preview">
              <img :src="coverPreview" alt="封面预览" />
              <UButton color="red" variant="ghost" icon="i-heroicons-trash" @click="removeCover">
                删除
              </UButton>
            </div>
          </div>
        </UFormGroup>

        <!-- 内容 -->
        <UFormGroup label="正文内容" required class="form-group">
          <div class="editor-toolbar">
            <UButton
              v-for="tool in editorTools"
              :key="tool.name"
              color="white"
              variant="ghost"
              :icon="tool.icon"
              @click="applyFormat(tool.format)"
            />
          </div>
          <UTextarea
            v-model="form.content"
            placeholder="请输入文章内容（支持 HTML 格式）"
            :rows="20"
            class="editor-content"
          />
          <p class="hint">支持 HTML 标签，或使用上方工具栏快速格式化</p>
        </UFormGroup>

        <!-- 原文链接 -->
        <UFormGroup label="原文链接" class="form-group">
          <UInput
            v-model="form.contentSourceUrl"
            placeholder="选填，文章原文链接"
          />
        </UFormGroup>

        <!-- 提交按钮 -->
        <div class="form-actions">
          <UButton type="submit" color="primary" :loading="submitting" size="lg">
            {{ submitting ? '提交中...' : '保存到草稿箱' }}
          </UButton>
          <UButton color="white" variant="outline" @click="onSaveAsDraft">
            存为草稿
          </UButton>
        </div>
      </UForm>
    </UCard>

    <!-- 上传弹窗 -->
    <UModal v-model="showUploadModal">
      <UCard>
        <template #header>
          <h3>上传图片</h3>
        </template>
        <div v-if="uploading" class="uploading">
          <UProgress animation="bounce" />
          <p>上传中...</p>
        </div>
        <div v-else-if="uploadResult" class="upload-result">
          <p>上传成功！</p>
          <img :src="uploadResult.url" alt="预览" class="uploaded-image" />
        </div>
      </UCard>
    </UModal>
  </div>
</template>

<script setup lang="ts">
interface DraftForm {
  title: string;
  author: string;
  digest: string;
  content: string;
  contentSourceUrl: string;
}

const form = ref<DraftForm>({
  title: '',
  author: '',
  digest: '',
  content: '',
  contentSourceUrl: '',
});

const submitting = ref(false);
const coverFile = ref<File | null>(null);
const coverPreview = ref<string>('');
const coverMediaId = ref<string>('');
const showUploadModal = ref(false);
const uploading = ref(false);
const uploadResult = ref<{ url: string; media_id: string } | null>(null);

const fileInput = ref<HTMLInputElement | null>(null);

const editorTools = [
  { name: 'bold', icon: 'i-heroicons-text-bold', format: 'bold' },
  { name: 'italic', icon: 'i-heroicons-text-italic', format: 'italic' },
  { name: 'h2', icon: 'i-heroicons-h2', format: 'h2' },
  { name: 'link', icon: 'i-heroicons-link', format: 'link' },
];

// 触发文件选择
function triggerFileInput() {
  fileInput.value?.click();
}

// 文件选择处理
function onFileChange(event: Event) {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  // 验证文件
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/bmp'];
  if (!validTypes.includes(file.type)) {
    alert('不支持的文件类型');
    return;
  }

  if (file.size > 2 * 1024 * 1024) {
    alert('文件大小不能超过 2MB');
    return;
  }

  coverFile.value = file;
  coverPreview.value = URL.createObjectURL(file);
  uploadCover(file);
}

// 上传封面
async function uploadCover(file: File) {
  uploading.value = true;
  showUploadModal.value = true;

  try {
    const formData = new FormData();
    formData.append('file', file);

    const resp = await fetch('/api/web/media/upload', {
      method: 'POST',
      body: formData,
    });

    const result = await resp.json();
    if (result.base_resp?.ret === 0) {
      coverMediaId.value = result.media_id;
      uploadResult.value = { url: result.url, media_id: result.media_id };
    } else {
      alert('上传失败：' + (result.base_resp?.err_msg || '未知错误'));
      removeCover();
    }
  } catch (error) {
    console.error('上传失败:', error);
    alert('上传失败，请稍后重试');
    removeCover();
  } finally {
    uploading.value = false;
  }
}

// 删除封面
function removeCover() {
  coverFile.value = null;
  coverPreview.value = '';
  coverMediaId.value = '';
  uploadResult.value = null;
  if (fileInput.value) {
    fileInput.value.value = '';
  }
}

// 应用格式
function applyFormat(format: string) {
  // TODO: 实现编辑器格式化
  alert('格式化功能开发中...');
}

// 提交表单
async function onSubmit() {
  // 验证必填字段
  if (!form.value.title) {
    alert('请输入标题');
    return;
  }
  if (!coverMediaId.value) {
    alert('请上传封面图片');
    return;
  }
  if (!form.value.content) {
    alert('请输入内容');
    return;
  }

  submitting.value = true;

  try {
    const resp = await fetch('/api/web/draft/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        articles: [{
          title: form.value.title,
          author: form.value.author,
          digest: form.value.digest,
          content: form.value.content,
          thumb_media_id: coverMediaId.value,
          content_source_url: form.value.contentSourceUrl,
        }],
      }),
    });

    const result = await resp.json();
    if (result.base_resp?.ret === 0) {
      alert('保存成功！');
      navigateTo('/draft');
    } else {
      alert('保存失败：' + (result.base_resp?.err_msg || '未知错误'));
    }
  } catch (error) {
    console.error('保存失败:', error);
    alert('保存失败，请稍后重试');
  } finally {
    submitting.value = false;
  }
}

// 存为草稿（简化版）
async function onSaveAsDraft() {
  onSubmit();
}
</script>

<style scoped>
.create-draft-page {
  max-width: 900px;
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

.form-group {
  margin-bottom: 24px;
}

.upload-area {
  border: 2px dashed #ddd;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
}

.file-input {
  display: none;
}

.upload-placeholder {
  cursor: pointer;
  padding: 40px 20px;
}

.upload-placeholder:hover {
  background: #f5f5f5;
}

.upload-icon {
  font-size: 48px;
  color: #999;
  margin-bottom: 10px;
}

.hint {
  font-size: 12px;
  color: #999;
  margin-top: 8px;
}

.cover-preview {
  display: flex;
  align-items: center;
  gap: 20px;
}

.cover-preview img {
  max-width: 200px;
  border-radius: 8px;
}

.editor-toolbar {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
  padding: 8px;
  background: #f5f5f5;
  border-radius: 4px;
}

.editor-content {
  font-family: monospace;
}

.form-actions {
  display: flex;
  gap: 12px;
  margin-top: 30px;
}

.uploading {
  text-align: center;
  padding: 40px 20px;
}

.upload-result {
  text-align: center;
}

.uploaded-image {
  max-width: 400px;
  margin-top: 20px;
  border-radius: 8px;
}
</style>
