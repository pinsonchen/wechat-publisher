/**
 * 从草稿群发消息 API
 * 文档：https://developers.weixin.qq.com/doc/offiaccount/Publish_Submit/Submit_publish.html
 */

import { getTokenFromStore } from '~/server/utils/CookieStore';
import { proxyMpRequest } from '~/server/utils/proxy-request';

export interface PublishSendRequest {
  media_id: string;
  send_ignore_repeat?: number;
}

export interface PublishSendResponse {
  base_resp: {
    ret: number;
    err_msg: string;
  };
  publish_id?: number;
}

export default defineEventHandler(async event): Promise<PublishSendResponse> => {
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

    const body = await readBody<PublishSendRequest>(event);

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
      send_ignore_repeat: body.send_ignore_repeat || 0,
      token: token,
      lang: 'zh_CN',
      f: 'json',
      ajax: 1,
    };

    const response = await proxyMpRequest({
      event: event,
      method: 'POST',
      endpoint: 'https://mp.weixin.qq.com/cgi-bin/freepublish/submit',
      body: payload,
      parseJson: true,
    });

    const result = await response.json();
    return result as PublishSendResponse;
  } catch (error) {
    console.error('群发消息失败:', error);
    return {
      base_resp: {
        ret: -100,
        err_msg: '服务器内部错误：' + (error as Error).message,
      },
    };
  }
});
