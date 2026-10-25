from pathlib import Path
import subprocess, plistlib, struct
root=Path(__file__).resolve().parents[1]
icon=root/'web-source/assets/app-icon.png'
res=root/'resources';res.mkdir(exist_ok=True)
iconset=res/'app.iconset';iconset.mkdir(exist_ok=True)
def resize(dest,size):
    dest.parent.mkdir(parents=True,exist_ok=True)
    subprocess.run(['sips','-z',str(size),str(size),str(icon),'--out',str(dest)],check=True,stdout=subprocess.DEVNULL)
for size in (16,32,128,256,512):
    resize(iconset/f'icon_{size}x{size}.png',size)
    resize(iconset/f'icon_{size}x{size}@2x.png',size*2)
subprocess.run(['iconutil','-c','icns',str(iconset),'-o',str(res/'app.icns')],check=True)
png=icon.read_bytes()
(res/'app.ico').write_bytes(struct.pack('<HHH',0,1,1)+struct.pack('<BBBBHHII',0,0,0,0,1,32,len(png),22)+png)
for dpi,size,fg in [('mdpi',48,108),('hdpi',72,162),('xhdpi',96,216),('xxhdpi',144,324),('xxxhdpi',192,432)]:
    directory=root/'android/app/src/main/res'/f'mipmap-{dpi}'
    resize(directory/'ic_launcher.png',size)
    resize(directory/'ic_launcher_round.png',size)
    resize(directory/'ic_launcher_foreground.png',fg)
resize(root/'ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png',1024)
manifest=root/'android/app/src/main/AndroidManifest.xml'
manifest.write_text(manifest.read_text().replace('android:allowBackup="true"','android:allowBackup="false"'))
(root/'android/app/src/main/res/xml/file_paths.xml').write_text('''<?xml version="1.0" encoding="utf-8"?>
<paths xmlns:android="http://schemas.android.com/apk/res/android">
  <cache-path name="backup_exports" path="exports/" />
</paths>''')
# Replace template branding with the existing app logo, keeping a quiet launch screen.
for directory in (root/'android/app/src/main/res').glob('drawable*'):
    splash=directory/'splash.png'
    if splash.exists():
        resize(splash,160)
        subprocess.run(['sips','-p','800','800','--padColor','F6F7F0',str(splash)],check=True,stdout=subprocess.DEVNULL)
for splash in (root/'ios/App/App/Assets.xcassets/Splash.imageset').glob('*.png'):
    resize(splash,320)
    subprocess.run(['sips','-p','2732','2732','--padColor','F6F7F0',str(splash)],check=True,stdout=subprocess.DEVNULL)
privacy=root/'ios/App/App/PrivacyInfo.xcprivacy'
privacy.write_bytes(plistlib.dumps({'NSPrivacyTracking':False,'NSPrivacyCollectedDataTypes':[], 'NSPrivacyAccessedAPITypes':[{'NSPrivacyAccessedAPIType':'NSPrivacyAccessedAPICategoryFileTimestamp','NSPrivacyAccessedAPITypeReasons':['C617.1']}]}))
pbx=root/'ios/App/App.xcodeproj/project.pbxproj'
s=pbx.read_text()
if 'PrivacyInfo.xcprivacy' not in s:
    s=s.replace('/* Begin PBXBuildFile section */','/* Begin PBXBuildFile section */\n\t\tA10000000000000000000001 /* PrivacyInfo.xcprivacy in Resources */ = {isa = PBXBuildFile; fileRef = A10000000000000000000002 /* PrivacyInfo.xcprivacy */; };')
    s=s.replace('/* Begin PBXFileReference section */','/* Begin PBXFileReference section */\n\t\tA10000000000000000000002 /* PrivacyInfo.xcprivacy */ = {isa = PBXFileReference; lastKnownFileType = text.xml; path = PrivacyInfo.xcprivacy; sourceTree = "<group>"; };')
    s=s.replace('504EC3071FED79650016851F /* AppDelegate.swift */,','A10000000000000000000002 /* PrivacyInfo.xcprivacy */,\n\t\t\t\t504EC3071FED79650016851F /* AppDelegate.swift */,')
    s=s.replace('504EC30F1FED79650016851F /* Assets.xcassets in Resources */,','A10000000000000000000001 /* PrivacyInfo.xcprivacy in Resources */,\n\t\t\t\t504EC30F1FED79650016851F /* Assets.xcassets in Resources */,')
pbx.write_text(s)
print('Platform icons, local-only Android backup policy and iOS privacy manifest prepared')
