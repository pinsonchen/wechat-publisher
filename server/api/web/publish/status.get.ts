/**
 * 查询群发状态 API
 * 文档：https://developers.weixin.qq.com/doc/offiaccount/Publish_Submit/Check_publish_status.html
 */

import { getTokenFromStore } from '~/server/utils/CookieStore';
import { proxyMpRequest } from '~/server/utils/proxy-request';

export interface PublishStatusRequest {
  publish_id: number;
}

export interface PublishStatusResponse {
  base_resp: {
    ret: number;
    err_msg: string;
  };
  msg_status?: string;
  article_id?: string;
  article_url?: string;
}

export default defineEventHandler(async event): Promise<PublishStatusResponse> => {
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

    const body = await readBody<PublishStatusRequest>(event);

    // 参数验证
    if (!body.publish_id) {
      return {
        base_resp: {
          ret: -2,
          err_msg: 'publish_id 不能为空',
        },
      };
    }

    const payload = {
      publish_id: body.publish_id,
      token: token,
      lang: 'zh_CN',
      f: 'json',
      ajax: 1,
    };

    const response = await proxyMpRequest({
      event: event,
      method: 'POST',
      endpoint: 'https://mp.weixin.qq.com/cgi-bin/freepublish/get',
      body: payload,
      parseJson: true,
    });

    const result = await response.json();
    return result as PublishStatusResponse;
  } catch (error) {
    console.error('查询发布状态失败:', error);
    return {
      base_resp: {
        ret: -100,
        err_msg: '服务器内部错误：' + (error as Error).message,
      },
    };
  }
});
