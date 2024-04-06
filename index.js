const fs = require('fs');
const path = require('path');
const QRCode = require('qrcode');
const pkg = require('./package.json')
const rawUrl = `https://raw.githubusercontent.com/htyf-mp-community/demo/main/apps.json`

fs.readdir('.', { withFileTypes: true }, (err, files) => {
    if (err) {
        console.error('Error reading directory:', err);
        return;
    }
    const readmeItem = []
    const readmeSource = []
    const directories = files
        .filter((dirent) => dirent.isDirectory())
        .filter((dirent) => {
            return fs.existsSync(path.join(__dirname, dirent.name, 'app.json'))
        }).map(i => {
            const appConfigPath = path.join(__dirname, i.name, 'app.json')
            const data = require(appConfigPath)
            const url = `https://share.dagouzhi.com/#/pages/index/index?data=${encodeURIComponent(JSON.stringify(data))}`

            readmeItem.push(`| [${data.name}](${url})  | [![小程序码](./${i.name}/qrcode.png)](${url}) |`)
            readmeSource.push(data)
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

## 免责

1. 本项目所有数据信息均来自站长资源网站，本软件相当于浏览器，用户只是从网页中获取数据

2. 本项目承诺不保存任何第三方用户信息

3. 本项目代码仅供学习交流，不得用于商业用途，若侵权请联系

## 投食

开发迭代不易，觉得 App 好用的，有能力的请投喂一下，也可以给个星星

| 微信  | 支付宝 |
| ------------- | ------------- |
| ![小程序码](./public/IMG_5087.jpg)  | ![小程序码](./public/IMG_5088.jpg) |
`, 'utf-8')
fs.writeFileSync(path.join(__dirname, 'apps.json'), JSON.stringify({
    name: pkg.name,
    version: pkg.version,
    source: rawUrl,
    list: readmeSource,
}), 'utf-8')
    console.log('当前目录下的文件夹有：', directories);
});

