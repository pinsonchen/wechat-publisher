/**
 * 删除草稿 API
 * 文档：https://developers.weixin.qq.com/doc/offiaccount/Draft_Box/Delete_draft.html
 */

import { getTokenFromStore } from '~/server/utils/CookieStore';
import { proxyMpRequest } from '~/server/utils/proxy-request';

export interface DraftDeleteRequest {
  media_id: string;
}

export interface DraftDeleteResponse {
  base_resp: {
    ret: number;
    err_msg: string;
  };
}

export default defineEventHandler(async event): Promise<DraftDeleteResponse> => {
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

    const body = await readBody<DraftDeleteRequest>(event);

    // 参数验证
    if (!body.media_id) {
      return {
        base_resp: {
          ret: -2,
          err_msg: 'media_id 不能为空',
        },
      };
    }

    const payload = {
      media_id: body.media_id,
      token: token,
      lang: 'zh_CN',
      f: 'json',
      ajax: 1,
    };

    const response = await proxyMpRequest({
      event: event,
      method: 'POST',
      endpoint: 'https://mp.weixin.qq.com/cgi-bin/draft/delete',
      body: payload,
      parseJson: true,
    });

    const result = await response.json();
    return result as DraftDeleteResponse;
  } catch (error) {
    console.error('删除草稿失败:', error);
    return {
      base_resp: {
        ret: -100,
        err_msg: '服务器内部错误：' + (error as Error).message,
      },
    };
  }
});
