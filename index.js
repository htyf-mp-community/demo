const fs = require('fs');
const path = require('path');
const QRCode = require('qrcode');
const pkg = require('./package.json')

fs.readdir('.', { withFileTypes: true }, (err, files) => {
    if (err) {
        console.error('Error reading directory:', err);
        return;
    }
    const directories = files
        .filter((dirent) => dirent.isDirectory())
        .filter((dirent) => {
            return fs.existsSync(path.join(__dirname, dirent.name, 'app.json'))
        }).map(i => {
            return path.join(__dirname, i.name, 'app.json')
        })
    for (const key in directories) {
        const element = directories[key];
        const data = require(element)
        QRCode.toFile(path.join(path.dirname(element), 'qrcode.png'), JSON.stringify(data), {
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

    console.log('当前目录下的文件夹有：', directories);
});

