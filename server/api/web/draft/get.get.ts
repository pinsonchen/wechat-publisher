/**
 * 获取单个草稿 API
 * 文档：https://developers.weixin.qq.com/doc/offiaccount/Draft_Box/Get_draft.html
 */

import { getTokenFromStore } from '~/server/utils/CookieStore';
import { proxyMpRequest } from '~/server/utils/proxy-request';

export interface DraftGetResponse {
  base_resp: {
    ret: number;
    err_msg: string;
  };
  media_id?: string;
  content?: {
    news_item: Array<{
      title: string;
      author: string;
      digest: string;
      content: string;
      thumb_media_id: string;
      show_cover_pic: number;
      content_source_url: string;
      need_open_comment: number;
      only_fans_can_comment: number;
    }>;
  };
  update_time?: number;
}

export default defineEventHandler(async event): Promise<DraftGetResponse> => {
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

    const { media_id } = getQuery(event);

    // 参数验证
    if (!media_id || typeof media_id !== 'string') {
      return {
        base_resp: {
          ret: -2,
          err_msg: 'media_id 参数不能为空',
        },
      };
    }

    const payload = {
      media_id: media_id,
      token: token,
      lang: 'zh_CN',
      f: 'json',
      ajax: 1,
    };

    const response = await proxyMpRequest({
      event: event,
      method: 'POST',
      endpoint: 'https://mp.weixin.qq.com/cgi-bin/draft/get',
      body: payload,
      parseJson: true,
    });

    const result = await response.json();
    return result as DraftGetResponse;
  } catch (error) {
    console.error('获取草稿失败:', error);
    return {
      base_resp: {
        ret: -100,
        err_msg: '服务器内部错误：' + (error as Error).message,
      },
    };
  }
});
