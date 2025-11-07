const fs = require('fs');
const path = require('path');
const QRCode = require('qrcode');
const pkg = require('./package.json')
const rawUrl = `https://raw.githubusercontent.com/htyf-mp-community/demo/main/apps.json`

// 处理单个 app.json 文件
function processApp(appConfigPath, relativePath) {
    const data = require(appConfigPath)
    const url = `https://share.dagouzhi.com/#/pages/index/index?data=${encodeURIComponent(JSON.stringify(data))}`
    const qrcodePath = path.join(path.dirname(appConfigPath), 'qrcode.png')
    
    QRCode.toFile(qrcodePath, url, {
        margin: 1,
        width: 256,
        color: {
            dark: '#000000FF',
            light: '#FFFFFFFF'
        }
    }, function (err) {
        if (err) throw err;
        console.log('QR code saved:', qrcodePath);
    });
    
    return {
        data,
        url,
        relativePath,
        qrcodePath: `./${relativePath}/qrcode.png`
    }
}

fs.readdir('.', { withFileTypes: true }, (err, files) => {
    if (err) {
        console.error('Error reading directory:', err);
        return;
    }
    
    const readmeV2Items = []
    const readmeV2Source = []
    const readmeV1Items = []
    const readmeV1Source = []
    
    // 处理 v2 版本
    const v2Path = path.join(__dirname, 'v2')
    if (fs.existsSync(v2Path)) {
        const v2Dirs = fs.readdirSync(v2Path, { withFileTypes: true })
            .filter((dirent) => dirent.isDirectory())
        
        v2Dirs.forEach(v2Dir => {
            const latestPath = path.join(v2Path, v2Dir.name, 'latest', 'app.json')
            if (fs.existsSync(latestPath)) {
                const result = processApp(latestPath, `v2/${v2Dir.name}/latest`)
                readmeV2Items.push(`| [${result.data.name}](${result.url})  | [![小程序码](${result.qrcodePath})](${result.url}) |`)
                readmeV2Source.push(result.data)
            }
        })
    }
    
    // 处理 v1 版本（根目录下的旧版本）
    const directories = files
        .filter((dirent) => dirent.isDirectory())
        .filter((dirent) => dirent.name !== 'v2' && dirent.name !== 'node_modules' && dirent.name !== 'public')
        .filter((dirent) => {
            return fs.existsSync(path.join(__dirname, dirent.name, 'app.json'))
        }).map(i => {
            const appConfigPath = path.join(__dirname, i.name, 'app.json')
            const result = processApp(appConfigPath, i.name)
            readmeV1Items.push(`| [${result.data.name}](${result.url})  | [![小程序码](${result.qrcodePath})](${result.url}) |`)
            readmeV1Source.push(result.data)
            return appConfigPath
        })

    QRCode.toFile(path.join(__dirname, './public/qrcode.png'), rawUrl, {
        margin: 1,
        width: 256,
        color: {
            dark: '#000000FF',
            light: '#FFFFFFFF'
        }
    }, function (err) {
        if (err) throw err;
        console.log('QR code saved!');
    });
    
    // 合并所有源数据（v2 优先）
    const allSource = [...readmeV2Source, ...readmeV1Source]
    
    // 生成 README 内容
    // 判断是否只有 v2 版本
    const onlyV2 = readmeV2Items.length > 0 && readmeV1Items.length === 0
    
    let appsSection = ''
    if (onlyV2) {
        // 只有 v2 版本时，直接显示列表，不需要版本区分
        appsSection = `## 此源包含小程序列表

| 小程序  | 二维码 |
| ------------- | ------------- |
${readmeV2Items.join('\n')}

`
    } else {
        // 有 v1 和 v2 版本时，显示版本区分
        appsSection = `## 此源包含小程序列表

${readmeV2Items.length > 0 ? `### ⭐ 推荐使用 v2 版本（最新版本，功能更强大）

> **提示：** 以下 v2 版本小程序使用最新的引擎架构，性能更好，功能更丰富，建议优先使用！

| 小程序  | 二维码 |
| ------------- | ------------- |
${readmeV2Items.join('\n')}

` : ''}${readmeV1Items.length > 0 ? `### v1 版本（旧版本，已停止更新）

| 小程序  | 二维码 |
| ------------- | ------------- |
${readmeV1Items.join('\n')}

` : ''}`
    }
    
    let readmeContent = `# 小程序app源

## [红糖云服app下载 https://mp.dagouzhi.com/ ](https://mp.dagouzhi.com/)

### 使用红糖云服app 加小程序源

> ![](./public/qrcode.png)
>
> ${rawUrl}

### 使用方法
| 1. 首页点加号  | 2. 系统管理 | 3. 源管理 |
| ------------- | ------------- | ------------- |
| ![](./public/IMG_5076.png) | ![](./public/IMG_5077.png) | ![](./public/IMG_5078.png)

${appsSection}## 免责

1. 本项目所有数据信息均来自站长资源网站，本软件相当于浏览器，用户只是从网页中获取数据

2. 本项目承诺不保存任何第三方用户信息

3. 本项目代码仅供学习交流，不得用于商业用途，若侵权请联系

## 投食

开发迭代不易，觉得 App 好用的，有能力的请投喂一下，也可以给个星星

| 微信  | 支付宝 |
| ------------- | ------------- |
| ![小程序码](./public/IMG_5087.jpg)  | ![小程序码](./public/IMG_5088.jpg) |
`
    
    fs.writeFileSync(path.join(__dirname, 'README.md'), readmeContent, 'utf-8')
    fs.writeFileSync(path.join(__dirname, 'apps.json'), JSON.stringify({
        name: pkg.name,
        version: pkg.version,
        source: rawUrl,
        list: allSource,
    }), 'utf-8')
    console.log('当前目录下的文件夹有：', directories);
    console.log('v2 版本小程序数量：', readmeV2Items.length);
    console.log('v1 版本小程序数量：', readmeV1Items.length);
});

