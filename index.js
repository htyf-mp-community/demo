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
            readmeItem.push(`| ${data.name}  | ![小程序码](./${i.name}/qrcode.png) |`)
            return appConfigPath
        })
    for (const key in directories) {
        const element = directories[key];
        const data = require(element)
        const url = `https://share.dagouzhi.com/#/pages/index/index?data=${encodeURIComponent(JSON.stringify(data))}`
        QRCode.toFile(path.join(path.dirname(element), 'qrcode.png'), url, {
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
    }
    fs.writeFileSync(path.join(__dirname, 'README.md'), `
## [红糖云服app下载 https://mp.dagouzhi.com/ ](https://mp.dagouzhi.com/)

## 小程序demo列表
| 小程序  | 二维码 |
| ------------- | ------------- |
${readmeItem.join('\n')}
`, 'utf-8')

    console.log('当前目录下的文件夹有：', directories);
});

