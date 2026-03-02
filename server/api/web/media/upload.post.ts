/**
 * 上传图片到素材库 API
 * 文档：https://developers.weixin.qq.com/doc/offiaccount/Asset_Management/New_temporary_materials.html
 */

import { getTokenFromStore } from '~/server/utils/CookieStore';
import { proxyMpRequest } from '~/server/utils/proxy-request';

export interface MediaUploadResponse {
  base_resp?: {
    ret: number;
    err_msg: string;
  };
  media_id?: string;
  url?: string;
  errcode?: number;
  errmsg?: string;
}

export default defineEventHandler(async event): Promise<MediaUploadResponse> => {
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

    const formData = await readFormData(event);
    const file = formData.get('file');

    if (!file || !(file instanceof File)) {
      return {
        base_resp: {
          ret: -2,
          err_msg: '请选择要上传的文件',
        },
      };
    }

    // 验证文件类型
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/bmp'];
    const fileType = file.type;
    
    if (!validTypes.includes(fileType)) {
      return {
        base_resp: {
          ret: -3,
          err_msg: '不支持的文件类型，仅支持 jpg/png/gif/bmp',
        },
      };
    }

    // 验证文件大小（不超过 2MB）
    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
      return {
        base_resp: {
          ret: -4,
          err_msg: '文件大小不能超过 2MB',
        },
      };
    }

    // 使用 FormData 上传图片
    const uploadFormData = new FormData();
    uploadFormData.append('media', file);

    const response = await fetch(
      `https://api.weixin.qq.com/cgi-bin/media/uploadimg?access_token=${token}`,
      {
        method: 'POST',
        body: uploadFormData,
      }
    );

    const result = await response.json();
    
    // 检查错误
    if (result.errcode) {
      return {
        base_resp: {
          ret: result.errcode,
          err_msg: result.errmsg || '上传失败',
        },
      };
    }

    return {
      media_id: result.media_id,
      url: result.url,
    };
  } catch (error) {
    console.error('上传图片失败:', error);
    return {
      base_resp: {
        ret: -100,
        err_msg: '服务器内部错误：' + (error as Error).message,
      },
    };
  }
});
