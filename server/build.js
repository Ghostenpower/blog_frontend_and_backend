const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Enable console logging for debugging
console.log('Starting build process...');
console.log(`Current directory: ${__dirname}`);

try {
  // Create dist directory
  const distDir = path.join(__dirname, 'dist');
  console.log(`Creating dist directory at: ${distDir}`);

  if (fs.existsSync(distDir)) {
    console.log('Cleaning existing dist directory...');
    fs.rmSync(distDir, { recursive: true, force: true });
  }

  console.log('Creating dist directory...');
  fs.mkdirSync(distDir, { recursive: true });

  // Files and folders to copy
  const itemsToCopy = [
    'index.js',
    'routes',
    'controllers',
    'models',
    'config',
    '.env',
    'package.json',
    'package-lock.json',
    'README.md'
  ];

  // Copy files
  console.log('Copying files to dist directory...');
  itemsToCopy.forEach(item => {
    const srcPath = path.join(__dirname, item);
    const destPath = path.join(distDir, item);
    
    console.log(`Checking ${srcPath}`);
    if (fs.existsSync(srcPath)) {
      if (fs.lstatSync(srcPath).isDirectory()) {
        // Copy directory recursively
        console.log(`Creating directory: ${destPath}`);
        fs.mkdirSync(destPath, { recursive: true });
        copyFolderRecursive(srcPath, destPath);
      } else {
        // Copy file
        console.log(`Copying file: ${item}`);
        fs.copyFileSync(srcPath, destPath);
      }
      console.log(`Copied ${item}`);
    } else {
      console.warn(`Warning: ${item} not found at ${srcPath}`);
    }
  });

  // Create a simplified package.json for production
  console.log('Creating production package.json...');
  const packageJson = require('./package.json');
  const prodPackageJson = {
    name: packageJson.name,
    version: packageJson.version,
    description: packageJson.description,
    main: packageJson.main,
    scripts: {
      start: 'node index.js'
    },
    dependencies: packageJson.dependencies
  };
  
  fs.writeFileSync(
    path.join(distDir, 'package.json'), 
    JSON.stringify(prodPackageJson, null, 2)
  );

  // Install production dependencies
  console.log('Installing production dependencies...');
  try {
    execSync('npm install --production', { 
      cwd: distDir,
      stdio: 'inherit'
    });
    console.log('Production dependencies installed successfully');
  } catch (error) {
    console.error('Failed to install dependencies:', error);
    process.exit(1);
  }

  console.log('Build completed successfully! Server code is packaged in the dist directory.');
} catch (error) {
  console.error('Error during build process:', error);
  process.exit(1);
}

// Helper function to copy directory recursively
function copyFolderRecursive(src, dest) {
  try {
    const entries = fs.readdirSync(src, { withFileTypes: true });
    
    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);
      
      try {
        if (entry.isDirectory()) {
          fs.mkdirSync(destPath, { recursive: true });
          copyFolderRecursive(srcPath, destPath);
        } else {
          fs.copyFileSync(srcPath, destPath);
        }
      } catch (err) {
        console.error(`Error copying ${srcPath} to ${destPath}:`, err);
      }
    }
  } catch (err) {
    console.error(`Error reading directory ${src}:`, err);
  }
} 