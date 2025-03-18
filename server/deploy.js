const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 部署配置
const config = {
  // 需要复制的文件和目录
  filesToCopy: [
    'index.js',
    'package.json',
    'package-lock.json',
    '.env',
    'models',
    'routes',
    'controllers',
    'config',
    'middleware'
  ],
  // 部署目录
  deployDir: path.join(__dirname, 'deploy'),
  // 是否安装依赖
  installDependencies: true,
  // 是否创建生产环境的.env文件
  createProdEnv: true,
  // 是否打包前端
  buildFrontend: false,
  // 前端目录
  frontendDir: path.join(__dirname, '..', 'blog'),
  // 是否将前端静态文件集成到后端
  integrateFrontend: false
};

// 清空部署目录
const cleanDeployDir = () => {
  console.log('清理部署目录...');
  if (fs.existsSync(config.deployDir)) {
    fs.rmSync(config.deployDir, { recursive: true, force: true });
  }
  fs.mkdirSync(config.deployDir, { recursive: true });
};

// 复制文件和目录
const copyFiles = () => {
  console.log('复制文件到部署目录...');
  
  config.filesToCopy.forEach(item => {
    const sourcePath = path.join(__dirname, item);
    const destPath = path.join(config.deployDir, item);
    
    if (!fs.existsSync(sourcePath)) {
      console.log(`警告: ${item} 不存在，已跳过`);
      return;
    }
    
    if (fs.lstatSync(sourcePath).isDirectory()) {
      // 复制目录
      fs.mkdirSync(destPath, { recursive: true });
      copyDir(sourcePath, destPath);
    } else {
      // 复制文件
      fs.copyFileSync(sourcePath, destPath);
    }
  });
};

// 递归复制目录
const copyDir = (source, destination) => {
  const files = fs.readdirSync(source);
  
  files.forEach(file => {
    const sourcePath = path.join(source, file);
    const destPath = path.join(destination, file);
    
    if (fs.lstatSync(sourcePath).isDirectory()) {
      fs.mkdirSync(destPath, { recursive: true });
      copyDir(sourcePath, destPath);
    } else {
      fs.copyFileSync(sourcePath, destPath);
    }
  });
};

// 创建生产环境的.env文件
const createProdEnvFile = () => {
  if (!config.createProdEnv) return;
  
  console.log('创建生产环境.env文件...');
  
  // 读取现有的.env文件
  const envPath = path.join(__dirname, '.env');
  if (!fs.existsSync(envPath)) {
    console.log('警告: .env文件不存在，跳过创建生产环境配置');
    return;
  }
  
  const envContent = fs.readFileSync(envPath, 'utf8');
  
  // 创建生产环境的.env文件
  // 这里可以根据需要修改环境变量
  const prodEnvContent = envContent
    .replace(/PORT=.*/g, 'PORT=5000')
    .replace(/NODE_ENV=.*/g, 'NODE_ENV=production');
  
  fs.writeFileSync(path.join(config.deployDir, '.env'), prodEnvContent);
};

// 安装生产依赖
const installDeps = () => {
  if (!config.installDependencies) return;
  
  console.log('安装生产依赖...');
  process.chdir(config.deployDir);
  execSync('npm install --production', { stdio: 'inherit' });
};

// 创建启动脚本
const createStartScript = () => {
  console.log('创建启动脚本...');
  
  // Windows批处理文件
  const batchContent = `@echo off
node index.js
pause`;
  fs.writeFileSync(path.join(config.deployDir, 'start.bat'), batchContent);
  
  // Linux/Mac shell脚本
  const shellContent = `#!/bin/bash
node index.js`;
  fs.writeFileSync(path.join(config.deployDir, 'start.sh'), shellContent);
  
  // 设置Linux/Mac脚本的执行权限
  try {
    execSync(`chmod +x "${path.join(config.deployDir, 'start.sh')}"`);
  } catch (error) {
    console.log('注意: 无法设置start.sh的执行权限，可能是在Windows系统上运行');
  }
};

// 创建PM2配置文件
const createPM2Config = () => {
  console.log('创建PM2配置文件...');
  
  const pm2Config = {
    apps: [{
      name: "jyang-blog-server",
      script: "index.js",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production"
      }
    }]
  };
  
  fs.writeFileSync(
    path.join(config.deployDir, 'ecosystem.config.js'),
    `module.exports = ${JSON.stringify(pm2Config, null, 2)}`
  );
};

// 打包前端
const buildFrontend = () => {
  if (!config.buildFrontend) return;
  
  console.log('打包前端应用...');
  
  if (!fs.existsSync(config.frontendDir)) {
    console.log('警告: 前端目录不存在，跳过前端打包');
    return;
  }
  
  try {
    // 保存当前目录
    const currentDir = process.cwd();
    
    // 切换到前端目录
    process.chdir(config.frontendDir);
    
    // 安装依赖并构建
    console.log('安装前端依赖...');
    execSync('npm install', { stdio: 'inherit' });
    
    console.log('构建前端应用...');
    execSync('npm run build', { stdio: 'inherit' });
    
    // 如果需要集成前端到后端
    if (config.integrateFrontend) {
      console.log('集成前端到后端...');
      
      // 创建静态文件目录
      const publicDir = path.join(config.deployDir, 'public');
      if (!fs.existsSync(publicDir)) {
        fs.mkdirSync(publicDir, { recursive: true });
      }
      
      // 复制前端构建文件到后端的public目录
      const distDir = path.join(config.frontendDir, 'dist');
      if (fs.existsSync(distDir)) {
        copyDir(distDir, publicDir);
        
        // 修改后端代码以提供静态文件
        updateServerForStaticFiles();
      } else {
        console.log('警告: 前端构建目录不存在，跳过集成');
      }
    }
    
    // 恢复当前目录
    process.chdir(currentDir);
  } catch (error) {
    console.error('前端打包失败:', error);
  }
};

// 更新服务器代码以提供静态文件
const updateServerForStaticFiles = () => {
  console.log('更新服务器代码以提供静态文件...');
  
  const indexPath = path.join(config.deployDir, 'index.js');
  if (!fs.existsSync(indexPath)) {
    console.log('警告: index.js不存在，跳过更新');
    return;
  }
  
  let indexContent = fs.readFileSync(indexPath, 'utf8');
  
  // 检查是否已经有静态文件服务代码
  if (!indexContent.includes('express.static')) {
    // 在中间件部分添加静态文件服务
    indexContent = indexContent.replace(
      /\/\/ 中间件[\s\S]*?app\.use\(morgan\('dev'\)\);/,
      match => `${match}\n\n// 静态文件服务\napp.use(express.static(path.join(__dirname, 'public')));`
    );
    
    // 添加path模块导入
    if (!indexContent.includes('const path = require')) {
      indexContent = indexContent.replace(
        'const express = require',
        'const path = require(\'path\');\nconst express = require'
      );
    }
    
    // 添加前端路由处理（SPA应用需要）
    indexContent = indexContent.replace(
      /\/\/ 根路由[\s\S]*?res\.json\(\{ message: ['"]Welcome to Jyang Blog API['"] \}\);/,
      match => `${match}\n});`
    );
    
    // 添加前端路由处理代码
    indexContent = indexContent.replace(
      /\/\/ 连接数据库/,
      `// 处理前端路由\napp.get('*', (req, res) => {\n  res.sendFile(path.join(__dirname, 'public', 'index.html'));\n});\n\n// 连接数据库`
    );
    
    fs.writeFileSync(indexPath, indexContent);
  }
};

// 创建README文件
const createReadme = () => {
  console.log('创建部署说明文档...');
  
  const readmeContent = `# Jyang博客后端部署包

## 部署步骤

### 方法一：直接启动

1. 确保已安装Node.js (推荐v14.x或更高版本)
2. 在Windows上双击 \`start.bat\` 或在Linux/Mac上运行 \`./start.sh\`

### 方法二：使用PM2（推荐用于生产环境）

1. 全局安装PM2: \`npm install -g pm2\`
2. 使用PM2启动应用: \`pm2 start ecosystem.config.js\`
3. 设置开机自启: \`pm2 startup\` 然后按照提示操作
4. 保存PM2配置: \`pm2 save\`

## 环境变量配置

应用的配置存储在 \`.env\` 文件中，可以根据需要修改：

- PORT: 应用监听端口
- MONGO_URI: MongoDB连接字符串
- JWT_SECRET: JWT密钥（如果使用JWT认证）

## 常用PM2命令

- 查看应用状态: \`pm2 list\`
- 查看日志: \`pm2 logs jyang-blog-server\`
- 重启应用: \`pm2 restart jyang-blog-server\`
- 停止应用: \`pm2 stop jyang-blog-server\`

## Nginx配置示例

如果使用Nginx作为反向代理，可以参考以下配置：

\`\`\`nginx
server {
    listen 80;
    server_name your-domain.com;

    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
    
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
\`\`\`

## 注意事项

- 确保MongoDB服务器已启动并可访问
- 确保服务器防火墙已开放应用端口
- 生产环境建议使用Nginx等反向代理
`;
  
  fs.writeFileSync(path.join(config.deployDir, 'README.md'), readmeContent);
};

// 创建压缩包
const createZipArchive = () => {
  console.log('创建部署压缩包...');
  
  try {
    const zipFileName = 'jyang-blog-server-deploy.zip';
    const zipFilePath = path.join(__dirname, zipFileName);
    
    // 删除已存在的压缩包
    if (fs.existsSync(zipFilePath)) {
      fs.unlinkSync(zipFilePath);
    }
    
    // 创建压缩命令
    const zipCommand = process.platform === 'win32'
      ? `powershell Compress-Archive -Path "${config.deployDir}/*" -DestinationPath "${zipFilePath}"`
      : `cd "${__dirname}" && zip -r "${zipFileName}" deploy`;
    
    execSync(zipCommand, { stdio: 'inherit' });
    
    console.log(`部署压缩包已创建: ${zipFilePath}`);
  } catch (error) {
    console.log('警告: 创建压缩包失败，可能是缺少zip工具');
    console.error(error.message);
  }
};

// 执行部署流程
const deploy = () => {
  console.log('开始打包部署...');
  
  try {
    cleanDeployDir();
    copyFiles();
    createProdEnvFile();
    createStartScript();
    createPM2Config();
    createReadme();
    
    if (config.buildFrontend) {
      buildFrontend();
    }
    
    if (config.installDependencies) {
      installDeps();
    }
    
    createZipArchive();
    
    console.log('部署包创建成功！');
    console.log(`部署包位置: ${config.deployDir}`);
  } catch (error) {
    console.error('部署失败:', error);
  }
};

// 解析命令行参数
const parseArgs = () => {
  const args = process.argv.slice(2);
  
  args.forEach(arg => {
    if (arg === '--with-frontend') {
      config.buildFrontend = true;
      config.integrateFrontend = true;
    } else if (arg === '--build-frontend') {
      config.buildFrontend = true;
    } else if (arg === '--no-deps') {
      config.installDependencies = false;
    }
  });
};

// 解析命令行参数
parseArgs();

// 执行部署
deploy(); 