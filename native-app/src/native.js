import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';

window.YunxinNative = {
  isNative: Capacitor.isNativePlatform(),
  async exportBackup(content, filename) {
    if (!Capacitor.isNativePlatform()) return false;
    const path = `exports/${filename}`;
    const file = await Filesystem.writeFile({path, data: JSON.stringify(content, null, 2), directory: Directory.Cache, encoding: Encoding.UTF8, recursive: true});
    // Only this explicit user action opens the system share/save sheet.
    try {
      await Share.share({title: '保存孕心智护备份', files: [file.uri], dialogTitle: '将备份保存到你管理的位置'});
    } finally {
      // Keep the file briefly so a chosen share target can finish reading it.
      setTimeout(() => Filesystem.deleteFile({path, directory: Directory.Cache}).catch(() => {}), 60000);
    }
    return true;
  }
};
if (Capacitor.isNativePlatform()) {
  document.documentElement.classList.add('native-app');
  // Discard old temporary export files from previous app sessions.
  Filesystem.readdir({path: 'exports', directory: Directory.Cache}).then(({files}) =>
    Promise.all(files.map(file => Filesystem.deleteFile({path: `exports/${file.name}`, directory: Directory.Cache}).catch(() => {})))
  ).catch(() => {});
  App.addListener('backButton', () => {
    if (window.YunxinHandleBack) window.YunxinHandleBack();
  });
  window.YunxinMinimize = () => App.minimizeApp();
}
