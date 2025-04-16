const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const archiver = require('archiver');

// 构建配置
const config = {
  // 源代码目录
  sourceDir: __dirname,
  // 构建输出目录
  outputDir: path.join(__dirname, 'dist'),
  // 打包输出目录
  packageDir: path.join(__dirname, 'package'),
  // 需要复制的文件和目录
  includes: [
    'index.js',
    'package.json',
    'package-lock.json',
    '.env',
    'models',
    'routes',
    'controllers',
    'config',
    'socket',
    'utils'
  ],
  // 排除的文件和目录
  excludes: [
    'node_modules',
    '.git',
    'dist',
    'package',
    'logs',
    '*.log'
  ],
  // 环境变量配置
  env: {
    NODE_ENV: 'production',
    PORT: 5000
  }
};

// 清理目录
function cleanDir(dir) {
  console.log(`清理目录: ${dir}`);
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
  fs.mkdirSync(dir, { recursive: true });
}

// 复制文件或目录
function copy(src, dest) {
  if (!fs.existsSync(src)) {
    console.warn(`警告: ${src} 不存在，已跳过`);
    return;
  }

  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    copyDir(src, dest);
  } else {
    fs.copyFileSync(src, dest);
  }
}

// 复制目录
function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src);

  for (const entry of entries) {
    const srcPath = path.join(src, entry);
    const destPath = path.join(dest, entry);
    
    // 检查是否在排除列表中
    if (config.excludes.some(pattern => {
      if (pattern.includes('*')) {
        return new RegExp(pattern.replace('*', '.*')).test(entry);
      }
      return entry === pattern;
    })) {
      continue;
    }

    copy(srcPath, destPath);
  }
}

// 创建生产环境配置文件
function createEnvFile() {
  console.log('创建生产环境配置文件...');
  const envPath = path.join(config.sourceDir, '.env');
  let envContent = '';

  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
    // 替换环境变量
    for (const [key, value] of Object.entries(config.env)) {
      const regex = new RegExp(`${key}=.*`, 'g');
      if (envContent.match(regex)) {
        envContent = envContent.replace(regex, `${key}=${value}`);
      } else {
        envContent += `\n${key}=${value}`;
      }
    }
  } else {
    // 创建新的环境配置文件
    envContent = Object.entries(config.env)
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');
  }

  fs.writeFileSync(path.join(config.outputDir, '.env'), envContent);
}

// 创建启动脚本
function createStartScripts() {
  console.log('创建启动脚本...');
  
  // Windows 启动脚本
  const batchContent = `@echo off
echo Starting server in production mode...
node index.js
pause`;
  fs.writeFileSync(path.join(config.outputDir, 'start.bat'), batchContent);

  // Linux/Mac 启动脚本
  const shellContent = `#!/bin/bash
echo "Starting server in production mode..."
node index.js`;
  fs.writeFileSync(path.join(config.outputDir, 'start.sh'), shellContent);

  try {
    execSync(`chmod +x "${path.join(config.outputDir, 'start.sh')}"`);
  } catch (error) {
    console.log('注意: 无法设置start.sh的执行权限，可能是在Windows系统上运行');
  }
}

// 创建PM2配置文件
function createPM2Config() {
  console.log('创建PM2配置文件...');
  
  const pm2Config = {
    apps: [{
      name: 'jyang-blog-server',
      script: 'index.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: config.env.PORT
      }
    }]
  };

  fs.writeFileSync(
    path.join(config.outputDir, 'ecosystem.config.js'),
    `module.exports = ${JSON.stringify(pm2Config, null, 2)}`
  );
}

// 安装生产依赖
function installDependencies() {
  console.log('安装生产依赖...');
  process.chdir(config.outputDir);
  execSync('npm install --production', { stdio: 'inherit' });
  process.chdir(config.sourceDir);
}

// 创建部署文档
function createDeployDocs() {
  console.log('创建部署文档...');
  
  const readmeContent = `# Jyang Blog Server 部署说明

## 部署要求
- Node.js >= 14.x
- NPM >= 6.x
- MongoDB >= 4.x

## 快速启动

### Windows
双击运行 \`start.bat\`

### Linux/Mac
1. 添加执行权限：\`chmod +x start.sh\`
2. 运行：\`./start.sh\`

### 使用PM2启动（推荐）
1. 全局安装PM2：\`npm install -g pm2\`
2. 启动服务：\`pm2 start ecosystem.config.js\`

## 环境配置
配置文件：\`.env\`

主要配置项：
- PORT: 服务器端口号
- MONGODB_URI: MongoDB连接地址
- JWT_SECRET: JWT密钥
- NODE_ENV: 运行环境

## 目录结构
- \`index.js\`: 主程序入口
- \`routes/\`: 路由定义
- \`controllers/\`: 控制器
- \`models/\`: 数据模型
- \`config/\`: 配置文件
- \`socket/\`: WebSocket相关
- \`utils/\`: 工具函数

## 常见问题
1. 端口被占用
   - 修改 \`.env\` 中的 PORT 配置

2. 数据库连接失败
   - 检查 MongoDB 服务是否启动
   - 验证 \`.env\` 中的 MONGODB_URI 配置

## 日志查看
- PM2日志：\`pm2 logs\`
- 查看错误日志：\`pm2 logs --err\`

## 服务管理
- 重启服务：\`pm2 restart jyang-blog-server\`
- 停止服务：\`pm2 stop jyang-blog-server\`
- 删除服务：\`pm2 delete jyang-blog-server\`

## 支持与帮助
如有问题，请联系管理员或提交 Issue。
`;

  fs.writeFileSync(path.join(config.outputDir, 'README.md'), readmeContent);
}

// 创建ZIP压缩包
async function createZipArchive() {
  console.log('创建部署压缩包...');
  
  const zipPath = path.join(config.packageDir, 'jyang-blog-server.zip');
  if (!fs.existsSync(config.packageDir)) {
    fs.mkdirSync(config.packageDir, { recursive: true });
  }

  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(zipPath);
    const archive = archiver('zip', {
      zlib: { level: 9 }
    });

    output.on('close', () => {
      console.log(`部署包已创建: ${zipPath}`);
      console.log(`压缩包大小: ${(archive.pointer() / 1024 / 1024).toFixed(2)} MB`);
      resolve();
    });

    archive.on('error', (err) => {
      reject(err);
    });

    archive.pipe(output);
    archive.directory(config.outputDir, false);
    archive.finalize();
  });
}

// 主构建流程
async function build() {
  try {
    console.log('开始构建...');
    
    // 清理输出目录
    cleanDir(config.outputDir);
    cleanDir(config.packageDir);
    
    // 复制文件
    console.log('复制项目文件...');
    for (const item of config.includes) {
      const src = path.join(config.sourceDir, item);
      const dest = path.join(config.outputDir, item);
      copy(src, dest);
    }
    
    // 创建必要文件
    createEnvFile();
    createStartScripts();
    createPM2Config();
    createDeployDocs();
    
    // 安装依赖
    installDependencies();
    
    // 创建压缩包
    await createZipArchive();
    
    console.log('\n构建完成！');
    console.log(`- 构建目录: ${config.outputDir}`);
    console.log(`- 部署包: ${path.join(config.packageDir, 'jyang-blog-server.zip')}`);
    
  } catch (error) {
    console.error('构建失败:', error);
    process.exit(1);
  }
}

// 启动构建
build(); 