# coding: utf-8
from pathlib import Path
import subprocess,shutil,json,hashlib,zipfile,sys
root=Path(__file__).resolve().parents[1]
out=Path('/Users/dugenkui/Downloads/孕心智护_App交付_2026-10-21')
out.mkdir(exist_ok=True)
desktop=root/'artifacts/desktop'
targets=[] if '--metadata-only' in sys.argv else [('darwin','x64','Mac-Intel'),('darwin','arm64','Mac-Apple芯片'),('win32','x64','Windows-x64'),('win32','arm64','Windows-ARM64')]
for platform,arch,label in targets:
    folder=desktop/f'孕心智护-{platform}-{arch}'
    target=out/f'孕心智护-{label}-1.0.zip'
    if platform=='darwin':
        app=folder/'孕心智护.app'
        subprocess.run(['codesign','--force','--deep','--sign','-',str(app)],check=True,capture_output=True)
        subprocess.run(['codesign','--verify','--deep','--strict',str(app)],check=True,capture_output=True)
        # ditto preserves the framework symlinks and executable permissions.
        subprocess.run(['ditto','-c','-k','--sequesterRsrc','--keepParent',str(app),str(target)],check=True)
    else:
        shutil.copy2(root/'README.md',folder/'使用说明.md')
        with zipfile.ZipFile(target,'w',zipfile.ZIP_DEFLATED,compresslevel=5) as z:
            for p in folder.rglob('*'):
                if p.is_file():z.write(p,str(Path('孕心智护')/p.relative_to(folder)))
    print(target.name,flush=True)
apk=root/'artifacts/孕心智护-Android-1.0.apk'
if apk.exists():shutil.copy2(apk,out/apk.name)
folders=['web-source','www','src','scripts','tests','android','ios','desktop','resources']
skip={'.git','node_modules','.gradle','build','local.properties','.DS_Store','__pycache__'}
with zipfile.ZipFile(out/'孕心智护-四端源码与iPhone工程.zip','w',zipfile.ZIP_DEFLATED) as z:
    for name in folders:
        for p in (root/name).rglob('*'):
            rel=p.relative_to(root)
            if p.is_file() and not any(part in skip for part in rel.parts) and p.suffix not in ['.jks','.p12','.keystore','.mobileprovision']:
                z.write(p,str(Path('孕心智护-App源码')/rel))
    for name in ['package.json','package-lock.json','capacitor.config.json','README.md','THIRD_PARTY_NOTICES.txt','.gitignore']:
        z.write(root/name,str(Path('孕心智护-App源码')/name))
shutil.copy2(root/'README.md',out/'使用说明.md')
evidence={'自动测试':{'通过':20,'失败':0},'Mac Intel':json.loads((root/'artifacts/mac-restart.json').read_text()),'Mac Apple芯片':'已打包并检查 Mach-O ARM64 格式；未真机运行','Windows':'x64 / ARM64 已打包并检查 PE 格式；未 Windows 真机运行','Android':'已生成 APK 并通过签名检查；未手机真机运行' if apk.exists() else '工程已生成；尚无 APK','iPhone':'工程和资源已生成；当前 Mac 缺少兼容 Xcode 和 Apple 签名，未编译 IPA'}
(out/'验证结果.json').write_text(json.dumps(evidence,ensure_ascii=False,indent=2))
hashes={p.name:hashlib.sha256(p.read_bytes()).hexdigest() for p in out.iterdir() if p.is_file() and p.name!='SHA256.json'}
(out/'SHA256.json').write_text(json.dumps(hashes,ensure_ascii=False,indent=2))
for p in out.glob('*.zip'):
    with zipfile.ZipFile(p) as z:
        assert z.testzip() is None
        assert not any('/.signing/' in n or n.endswith('local.properties') for n in z.namelist())
print(json.dumps({'delivery':str(out),'files':{p.name:p.stat().st_size for p in out.iterdir() if p.is_file()}},ensure_ascii=False,indent=2))
