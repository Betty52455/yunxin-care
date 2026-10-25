import { packager } from '@electron/packager';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const version=JSON.parse(fs.readFileSync(path.join(root,'node_modules/electron/package.json'))).version;
fs.cpSync(path.join(root,'www'),path.join(root,'desktop/www'),{recursive:true});
for(const [platform,arch] of [['darwin','x64'],['darwin','arm64'],['win32','x64'],['win32','arm64']]){
  console.log(`Packaging ${platform} ${arch} with Electron ${version}`);
  const paths=await packager({dir:path.join(root,'desktop'),out:path.join(root,'artifacts/desktop'),name:'孕心智护',platform,arch,electronVersion:version,appBundleId:'com.betty52455.yunxincare.desktop',appVersion:'1.0.0',asar:true,overwrite:true,prune:false,
    icon:path.join(root,'resources',platform==='darwin'?'app.icns':'app.ico'),
    download:{cacheRoot:path.join(root,'.tools/electron-cache')},
    osxSign:false,windowsSign:false});
  console.log(JSON.stringify(paths));
}
