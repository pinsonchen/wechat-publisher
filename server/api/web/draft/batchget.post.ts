/**
 * 批量获取草稿 API
 * 文档：https://developers.weixin.qq.com/doc/offiaccount/Draft_Box/Get_draft_list.html
 */

import { getTokenFromStore } from '~/server/utils/CookieStore';
import { proxyMpRequest } from '~/server/utils/proxy-request';

export interface DraftBatchGetRequest {
  offset?: number;
  count?: number;
  no_content?: number;
}

export interface DraftItem {
  media_id: string;
  content: {
    news_item: Array<{
      title: string;
      author: string;
      digest: string;
      content: string;
      thumb_url: string;
      show_cover_pic: number;
      content_source_url: string;
      need_open_comment: number;
      only_fans_can_comment: number;
    }>;
  };
  update_time: number;
}

export interface DraftBatchGetResponse {
  base_resp: {
    ret: number;
    err_msg: string;
  };
  item?: DraftItem[];
  total_count?: number;
  item_count?: number;
}

export default defineEventHandler(async event): Promise<DraftBatchGetResponse> => {
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

    const body = await readBody<DraftBatchGetRequest>(event);
    
    const offset = body?.offset || 0;
    const count = body?.count || 20;
    const no_content = body?.no_content || 0;

    // 参数验证
    if (offset < 0) {
      return {
        base_resp: {
          ret: -2,
          err_msg: 'offset 不能为负数',
        },
      };
    }
    if (count <= 0 || count > 20) {
      return {
        base_resp: {
          ret: -3,
          err_msg: 'count 范围为 1-20',
        },
      };
    }

    const payload = {
      offset: offset,
      count: count,
      no_content: no_content,
      token: token,
      lang: 'zh_CN',
      f: 'json',
      ajax: 1,
    };

    const response = await proxyMpRequest({
      event: event,
      method: 'POST',
      endpoint: 'https://mp.weixin.qq.com/cgi-bin/draft/batchget',
      body: payload,
      parseJson: true,
    });

    const result = await response.json();
    return result as DraftBatchGetResponse;
  } catch (error) {
    console.error('批量获取草稿失败:', error);
    return {
      base_resp: {
        ret: -100,
        err_msg: '服务器内部错误：' + (error as Error).message,
      },
    };
  }
});
