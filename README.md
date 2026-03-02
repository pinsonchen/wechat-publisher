# WeChat Publisher - 微信公众号自动发布工具

> 基于 [wechat-article-exporter](https://github.com/wechat-article/wechat-article-exporter) 项目扩展的完整自动发布解决方案

## ✨ 功能特性

### 📝 草稿箱管理
- ✅ 创建草稿 - 支持标题、作者、摘要、HTML 内容、封面图片
- ✅ 编辑草稿 - 更新已有草稿内容
- ✅ 删除草稿 - 删除不需要的草稿
- ✅ 批量获取 - 分页加载草稿列表
- ✅ 单个获取 - 获取指定草稿详情

### 🚀 群发功能
- ✅ 从草稿群发 - 一键发布草稿到公众号
- ✅ 状态查询 - 查询群发消息的发送状态
- ✅ 发布管理 - 查看已发布文章列表

### 🖼️ 素材管理
- ✅ 图片上传 - 上传图片到微信素材库
- ✅ 自动压缩 - 自动处理图片大小和格式
- ✅ 格式支持 - jpg/png/gif/bmp，最大 2MB

### 🎨 用户界面
- ✅ 草稿管理页面 - 列表展示、预览、编辑、删除、群发
- ✅ 创建草稿页面 - 可视化编辑器、图片上传
- ✅ 发布管理页面 - 已发布列表、统计信息
- ✅ 响应式设计 - 支持桌面和移动端

## 🛠️ 技术栈

- **框架**: Nuxt 3.12 + Vue 3.5
- **UI**: Nuxt UI (基于 Tailwind CSS)
- **语言**: TypeScript 5.5
- **构建**: Vite + Nitro
- **部署**: Docker / Cloudflare Pages / Node.js

## 📦 安装部署

### 方式 1：Docker 部署（推荐）

```bash
# 构建镜像
docker build -t wechat-publisher .

# 运行容器
docker run -d \
  -p 3000:3000 \
  -e NUXT_SESSION_PASSWORD=your-secret-password \
  wechat-publisher
```

### 方式 2：Node.js 部署

```bash
# 克隆项目
git clone https://github.com/pinsonchen/wechat-publisher.git
cd wechat-publisher

# 安装依赖
yarn install

# 开发模式
yarn dev

# 生产构建
yarn build
yarn preview
```

### 方式 3：Cloudflare Pages

```bash
# 构建
yarn build

# 部署到 Cloudflare Pages
npx wrangler pages deploy dist
```

## 🚀 快速开始

### 1. 启动服务

```bash
yarn dev
# 访问 http://localhost:3000
```

### 2. 登录公众号

- 访问 `/login` 页面
- 使用公众号管理员微信扫码
- 登录成功后会自动存储 cookie 和 token

### 3. 创建草稿

- 访问 `/draft/create` 页面
- 填写标题、作者、摘要
- 上传封面图片（自动上传到微信素材库）
- 编辑正文内容（支持 HTML）
- 点击"保存到草稿箱"

### 4. 管理草稿

- 访问 `/draft` 页面
- 查看所有草稿列表
- 支持预览、编辑、删除
- 点击"群发"按钮发布

### 5. 查看发布记录

- 访问 `/publish` 页面
- 查看已发布文章列表
- 查看发布统计信息

## 📚 API 文档

### 草稿箱 API

#### 创建草稿
```http
POST /api/web/draft/add
Content-Type: application/json

{
  "articles": [{
    "title": "文章标题",
    "author": "作者",
    "digest": "摘要",
    "content": "<p>HTML 内容</p>",
    "thumb_media_id": "封面图片 ID"
  }]
}
```

#### 批量获取草稿
```http
POST /api/web/draft/batchget
Content-Type: application/json

{
  "offset": 0,
  "count": 20,
  "no_content": 0
}
```

#### 删除草稿
```http
POST /api/web/draft/delete
Content-Type: application/json

{
  "media_id": "草稿 ID"
}
```

#### 更新草稿
```http
POST /api/web/draft/update
Content-Type: application/json

{
  "media_id": "草稿 ID",
  "articles": [{...}]
}
```

### 群发 API

#### 从草稿群发
```http
POST /api/web/publish/send
Content-Type: application/json

{
  "media_id": "草稿 ID"
}
```

#### 查询发布状态
```http
POST /api/web/publish/status
Content-Type: application/json

{
  "publish_id": 12345
}
```

### 素材 API

#### 上传图片
```http
POST /api/web/media/upload
Content-Type: multipart/form-data

file: [图片文件]
```

## ⚠️ 注意事项

### 账号要求
- ✅ 个人订阅号 - 部分功能受限
- ✅ 企业订阅号 - 完整功能支持
- ✅ 服务号 - 完整功能支持

### 发布限制
- **订阅号**: 每天可群发 1 次
- **服务号**: 每月可群发 4 次
- **草稿箱**: 无数量限制

### Cookie 有效期
- 登录态有效期：**4 天**
- 建议：每天检查一次登录状态
- 过期后需要重新扫码登录

### 图片要求
- 格式：jpg/png/gif/bmp
- 大小：不超过 2MB
- 建议：使用压缩后的图片

## 🔧 开发指南

### 项目结构

```
wechat-publisher/
├── server/api/web/
│   ├── draft/          # 草稿箱 API
│   ├── publish/        # 群发 API
│   ├── media/          # 素材 API
│   ├── login/          # 登录 API（复用原有）
│   └── mp/             # 公众号 API（复用原有）
├── pages/
│   ├── draft/          # 草稿管理页面
│   ├── publish/        # 发布管理页面
│   └── login/          # 登录页面（复用原有）
├── server/utils/
│   ├── CookieStore.ts  # Cookie 管理（复用原有）
│   └── proxy-request.ts # 请求代理（复用原有）
└── ...
```

### 添加新 API

1. 在 `server/api/web/` 下创建文件
2. 导入 `getTokenFromStore` 和 `proxyMpRequest`
3. 实现业务逻辑
4. 返回标准化响应

示例：
```typescript
import { getTokenFromStore } from '~/server/utils/CookieStore';
import { proxyMpRequest } from '~/server/utils/proxy-request';

export default defineEventHandler(async event => {
  const token = await getTokenFromStore(event);
  
  return proxyMpRequest({
    event,
    method: 'POST',
    endpoint: 'https://mp.weixin.qq.com/cgi-bin/xxx',
    body: { token, ... },
  });
});
```

### 添加新页面

1. 在 `pages/` 下创建 `.vue` 文件
2. 使用 Nuxt UI 组件
3. 调用后端 API

## 🐛 常见问题

### 1. 登录失败
**问题**: 扫码后提示登录失败  
**解决**: 
- 检查是否是公众号管理员
- 检查网络连接
- 清除浏览器缓存后重试

### 2. 图片上传失败
**问题**: 上传图片提示失败  
**解决**:
- 检查图片格式（仅支持 jpg/png/gif/bmp）
- 检查图片大小（不超过 2MB）
- 检查登录态是否过期

### 3. 群发失败
**问题**: 点击群发没有反应  
**解决**:
- 检查是否超过每日发布次数限制
- 检查草稿是否包含违规内容
- 查看浏览器控制台错误信息

### 4. Cookie 过期
**问题**: 操作时提示未登录  
**解决**:
- Cookie 有效期为 4 天
- 需要重新扫码登录
- 建议定期登录保持活跃

## 📝 更新日志

### v1.0.0 (2026-03-02)
- ✨ 初始版本发布
- ✅ 草稿箱完整 CRUD 功能
- ✅ 群发功能
- ✅ 图片上传功能
- ✅ 前端管理界面

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

1. Fork 本项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 提交 Pull Request

## 📄 许可证

MIT License - 基于原项目 [wechat-article-exporter](https://github.com/wechat-article/wechat-article-exporter) 扩展

## 🙏 致谢

- 感谢 [wechat-article-exporter](https://github.com/wechat-article/wechat-article-exporter) 项目提供的登录和 Cookie 管理功能
- 感谢微信开放平台提供的 API 支持

## 📞 联系方式

- 项目地址：https://github.com/pinsonchen/wechat-publisher
- 问题反馈：https://github.com/pinsonchen/wechat-publisher/issues

---

**让微信公众号运营更高效！** 🚀
