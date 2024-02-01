const fs = require('fs');
const path = require('path');
const QRCode = require('qrcode');
const pkg = require('./package.json')

fs.readdir('.', { withFileTypes: true }, (err, files) => {
    if (err) {
        console.error('Error reading directory:', err);
        return;
    }
    const readmeItem = []
    const directories = files
        .filter((dirent) => dirent.isDirectory())
        .filter((dirent) => {
            return fs.existsSync(path.join(__dirname, dirent.name, 'app.json'))
        }).map(i => {
            const appConfigPath = path.join(__dirname, i.name, 'app.json')
            const data = require(appConfigPath)
            const url = `https://share.dagouzhi.com/#/pages/index/index?data=${encodeURIComponent(JSON.stringify(data))}`

            readmeItem.push(`| [${data.name}](${url})  | [![小程序码](./${i.name}/qrcode.png)](${url}) |`)
            QRCode.toFile(path.join(path.dirname(appConfigPath), 'qrcode.png'), url, {
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
            return appConfigPath
        })
    const rawUrl = `https://raw.gitmirror.com/htyf-mp-community/demo/main/apps.json`
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
    fs.writeFileSync(path.join(__dirname, 'README.md'), `
# 小程序app源

## [红糖云服app下载 https://mp.dagouzhi.com/ ](https://mp.dagouzhi.com/)

### 使用红糖云服app 加小程序源

> ![](./public/qrcode.png)
>
> ${rawUrl}

### 使用方法
| 1. 首页点加号  | 2. 系统管理 | 3. 源管理 |
| ------------- | ------------- | ------------- |
| ![](./public/IMG_5076.png) | ![](./public/IMG_5077.png) | ![](./public/IMG_5078.png)

## 此源包含小程序列表
| 小程序  | 二维码 |
| ------------- | ------------- |
${readmeItem.join('\n')}
`, 'utf-8')

    console.log('当前目录下的文件夹有：', directories);
});

