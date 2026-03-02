/**
 * 创建草稿 API
 * 文档：https://developers.weixin.qq.com/doc/offiaccount/Draft_Box/Add_draft.html
 */

import { getTokenFromStore } from '~/server/utils/CookieStore';
import { proxyMpRequest } from '~/server/utils/proxy-request';

export interface DraftArticle {
  title: string;
  author?: string;
  digest?: string;
  content: string;
  thumb_media_id: string;
  show_cover_pic?: number;
  content_source_url?: string;
  need_open_comment?: number;
  only_fans_can_comment?: number;
}

export interface DraftAddRequest {
  articles: DraftArticle[];
}

export interface DraftAddResponse {
  base_resp: {
    ret: number;
    err_msg: string;
  };
  media_id?: string;
}

export default defineEventHandler(async event): Promise<DraftAddResponse> => {
  try {
    const token = await getTokenFromStore(event);
    if (!token) {
      return {
        base_resp: {
          ret: -1,
          err_msg: '未登录，请先登录',
        },
      };
    }

    const body = await readBody<DraftAddRequest>(event);

    // 参数验证
    if (!body.articles || !Array.isArray(body.articles) || body.articles.length === 0) {
      return {
        base_resp: {
          ret: -2,
          err_msg: '文章列表不能为空',
        },
      };
    }

    // 验证必填字段
    for (const article of body.articles) {
      if (!article.title) {
        return {
          base_resp: {
            ret: -3,
            err_msg: '文章标题不能为空',
          },
        };
      }
      if (!article.content) {
        return {
          base_resp: {
            ret: -4,
            err_msg: '文章内容不能为空',
          },
        };
      }
      if (!article.thumb_media_id) {
        return {
          base_resp: {
            ret: -5,
            err_msg: '封面图片 ID 不能为空',
          },
        };
      }
    }

    const payload = {
      articles: body.articles.map(article => ({
        title: article.title,
        author: article.author || '',
        digest: article.digest || '',
        content: article.content,
        thumb_media_id: article.thumb_media_id,
        show_cover_pic: article.show_cover_pic || 0,
        content_source_url: article.content_source_url || '',
        need_open_comment: article.need_open_comment || 0,
        only_fans_can_comment: article.only_fans_can_comment || 0,
      })),
      token: token,
      lang: 'zh_CN',
      f: 'json',
      ajax: 1,
    };

    const response = await proxyMpRequest({
      event: event,
      method: 'POST',
      endpoint: 'https://mp.weixin.qq.com/cgi-bin/draft/add',
      body: payload,
      parseJson: true,
    });

    const result = await response.json();
    return result as DraftAddResponse;
  } catch (error) {
    console.error('创建草稿失败:', error);
    return {
      base_resp: {
        ret: -100,
        err_msg: '服务器内部错误：' + (error as Error).message,
      },
    };
  }
});
