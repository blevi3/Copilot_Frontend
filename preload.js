const { contextBridge, ipcRenderer } = require('electron');


contextBridge.exposeInMainWorld('electron', {
    openDirectory: () => ipcRenderer.invoke('dialog:openDirectory'),
    readFileContent: (filePath) =>
        new Promise((resolve, reject) => {
            fs.readFile(filePath, 'utf-8', (err, data) => {
                if (err) reject(err);
                else resolve(data);
            });
        }),
});
