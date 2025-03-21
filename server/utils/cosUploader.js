const COS = require('cos-nodejs-sdk-v5');
const path = require('path');
const crypto = require('crypto');
const dotenv = require('dotenv');

// 加载环境变量
dotenv.config();

// 创建COS实例
const cos = new COS({
  SecretId: process.env.COS_SECRET_ID,
  SecretKey: process.env.COS_SECRET_KEY
});

// COS配置
const COS_CONFIG = {
  Bucket: 'megajam-1301211650',
  Region: 'ap-guangzhou',
  StorageClass: 'STANDARD',
};

/**
 * 对字符串进行安全编码，使其可用于HTTP头
 * @param {string} str - 要编码的字符串
 * @returns {string} 编码后的字符串
 */
function encodeMetadata(str) {
  if (!str) return '';
  // 对传入的字符串进行Base64编码，确保HTTP头安全
  return Buffer.from(String(str)).toString('base64');
}

/**
 * 从Base64字符串上传文件到COS
 * @param {string} base64Data - Base64编码的图片数据(可含有头部信息)
 * @param {string} fileName - 可选的文件名（不含扩展名）
 * @param {Object} metadata - 可选的元数据，如用户ID、聊天室等
 * @returns {Promise<string>} 返回上传后的文件URL
 */
async function uploadFromBase64(base64Data, fileName = null, metadata = {}) {
  try {
    // 检查Base64字符串
    if (!base64Data) {
      throw new Error('Missing Base64 data');
    }

    // 提取Base64头部信息和实际内容
    let fileExtension = 'png';
    let base64Content = base64Data;

    if (base64Data.includes(';base64,')) {
      // 改进MIME类型检测，特别注意处理SVG格式
      const mimeMatch = base64Data.match(/^data:([^;]+);base64,(.+)$/);
      if (mimeMatch && mimeMatch.length === 3) {
        const mimeType = mimeMatch[1];
        base64Content = mimeMatch[2];
        
        // 处理不同的MIME类型并设置正确的文件扩展名
        if (mimeType === 'image/svg+xml') {
          fileExtension = 'svg';
        } else if (mimeType.startsWith('image/')) {
          // 从MIME类型中提取扩展名
          fileExtension = mimeType.split('/')[1];
        }
      }
    } else {
      // 尝试从内容本身判断是否为SVG（检查XML标记和SVG标签）
      try {
        const decodedStart = Buffer.from(base64Data.substring(0, 100), 'base64').toString('utf8');
        if (decodedStart.includes('<svg') || decodedStart.includes('<?xml') && decodedStart.toLowerCase().includes('svg')) {
          fileExtension = 'svg';
        }
      } catch (e) {
        // 解析失败，使用默认扩展名
        console.log('无法从内容判断文件类型，使用默认扩展名');
      }
    }

    // 将Base64转换为Buffer
    const fileBuffer = Buffer.from(base64Content, 'base64');

    // 生成唯一文件名
    const timestamp = Date.now();
    const randomString = crypto.randomBytes(8).toString('hex');
    
    // 使用元数据增强文件名唯一性，但只使用安全字符
    const userId = metadata.userId ? `-${String(metadata.userId).replace(/[^\w-]/g, '')}` : '';
    const room = metadata.room ? `-${String(metadata.room).replace(/[^\w-]/g, '')}` : '';
    
    const uniqueFileName = fileName || 
      `${timestamp}${userId}${room}-${randomString}`;
      
    // 构建云存储路径（按日期和聊天室分类）
    const date = new Date(timestamp);
    const dateString = `${date.getFullYear()}${(date.getMonth()+1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}`;
    
    const chatRoom = metadata.room ? String(metadata.room).replace(/[^\w-]/g, 'general') : 'general';
    
    const key = `chat/${dateString}/${chatRoom}/${uniqueFileName}.${fileExtension}`;

    // 对元数据进行编码
    const encodedMetadata = {
      userId: encodeMetadata(metadata.userId || ''),
      username: encodeMetadata(metadata.username || ''),
      room: encodeMetadata(metadata.room || '')
    };

    // 添加文件扩展名到元数据
    encodedMetadata.fileType = encodeMetadata(fileExtension);

    // 确定内容类型
    let contentType = 'image/png';
    if (fileExtension === 'svg') {
      contentType = 'image/svg+xml';
    } else if (fileExtension === 'jpg' || fileExtension === 'jpeg') {
      contentType = 'image/jpeg';
    } else if (fileExtension === 'gif') {
      contentType = 'image/gif';
    }

    // 上传到COS
    const result = await new Promise((resolve, reject) => {
      cos.putObject({
        Bucket: COS_CONFIG.Bucket,
        Region: COS_CONFIG.Region,
        Key: key,
        StorageClass: COS_CONFIG.StorageClass,
        Body: fileBuffer,
        ContentType: contentType, // 明确设置内容类型
        // 添加Base64编码后的元数据
        'x-cos-meta-userid': encodedMetadata.userId,
        'x-cos-meta-username': encodedMetadata.username,
        'x-cos-meta-room': encodedMetadata.room,
        'x-cos-meta-filetype': encodedMetadata.fileType
      }, function(err, data) {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });

    // 返回文件URL
    return `https://${COS_CONFIG.Bucket}.cos.${COS_CONFIG.Region}.myqcloud.com/${key}`;
  } catch (error) {
    console.error('COS upload error:', error);
    throw error;
  }
}

module.exports = {
  uploadFromBase64
}; 