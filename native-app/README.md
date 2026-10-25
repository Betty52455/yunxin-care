# 孕心智护 · 手机与桌面 App

本工程基于 `mobile2` 手机版，保留日记本界面、心情与孕期记录、情绪花园、小暖装扮、家庭协作、每周翻页/连续阅读简报及数据备份。

## 使用与数据

- Android：安装交付目录中的已签名 APK。它是直接分发的版本，尚未提交应用商店。
- Mac（macOS 13 或更新）：解压对应芯片的压缩包，将“孕心智护.app”移到“应用程序”，双击打开。
- Windows（64 位 Windows 10/11）：完整解压对应架构的压缩包，双击“孕心智护.exe”。必须保留旁边的资源和 DLL 文件；可右键创建快捷方式。
- iPhone（工程目标 iOS 16+）：当前交付的是 Xcode 工程，不是可安装 IPA。需在满足要求的 Mac 上使用 Xcode 26+，配置自己的 Apple 签名团队，再真机运行或经 TestFlight / App Store 分发。

桌面程序自带运行环境，无需安装 Python、Node 或 Codex；基础功能不需要联网。
各应用和原网页使用不同的本地存储空间。迁移时，在旧端“我的”导出备份，再在新端恢复。
记录、草稿不会自动同步到另一台设备。家庭视角也不是联网发送。
卸载应用、清除应用数据或设备损坏可能丢失记录，定期导出备份。
手机备份通过系统分享/保存窗口导出，请自己确认保存到了文件管理器；关闭分享窗口不等于备份成功。
导出的 JSON 含个人记录且未加密，请保管好。草稿不包含在正式备份内。
内置视角验证为本地功能，不是云账号；初始演示账号 `yunxin`，初始密码 `123456`，可以在“我的”修改。

## 编译状态与限制

最终成功产物、文件哈希和实际验证结果以交付目录中的 `验证结果.json` 为准。
Mac、Windows 版本没有购买开发者签名/公证证书，系统可能提示开发者无法识别；仅在确认来源后使用系统单次允许运行功能，不要关闭系统安全保护。
Windows 与 Apple 芯片版为跨平台打包，没有对应真机实测；安卓和 iPhone 需要进行实体手机适配验收。
当前开发机 macOS 14.7 无 Xcode，不满足 Capacitor 8 的 Xcode 26 要求，因此不能在这台电脑上完成 iPhone 编译或签名。没有伪造或改名生成 IPA。

## 源码布局

- `web-source/`：可以编辑的完整页面源码，基于已交付的手机版。
- `src/native.js`：手机原生备份分享和返回键。
- `scripts/build-web.cjs`：生成 App 专用 `www/`；不启用网页 Service Worker，避免旧缓存覆盖应用升级。
- `android/`：Android Studio / Gradle 工程。
- `ios/App/App.xcodeproj`：Xcode 工程，使用 Swift Package Manager。
- `desktop/`：Electron 独立桌面窗口、本地静态服务和菜单。
- `tests/`：原生备份交互、资源完整性和桌面服务边界测试。
- `package-lock.json`：锁定本次使用的开源依赖版本。

## 后续开发

需要 Node.js 22+，Android 使用 JDK 21、Android SDK 36 和 Build Tools 36；iOS 使用满足 Apple 要求的 macOS 与 Xcode 26+。

```sh
npm ci
npm run build:web
npx cap sync
npm test
```

修改界面通常只需要改 `web-source`，再执行上面的构建和同步。平台图标/启动图可通过 `python3 scripts/prepare-platforms.py` 在 Mac 生成。
Android：进入 `android`，配置自己的 `local.properties`，运行 `./gradlew assembleRelease`，再用自己的发布密钥签名。
iPhone：打开 `ios/App/App.xcodeproj`，在 Signing & Capabilities 选择自己的 Team。应用 ID 为 `com.betty52455.yunxincare`，如冲突，需要在全部相关平台配置中一致修改。
桌面：`node scripts/package-desktop.mjs` 生成 Mac Intel/Apple 芯片及 Windows x64/ARM64 目录。

APK 升级必须使用同一个发布密钥和应用 ID，并提高 versionCode。此次密钥仅保存在开发项目 `.signing/` 中，不包含在公开源码和分享包里；请项目所有者单独保管。

## 开源基础与官方说明

- Capacitor：https://github.com/ionic-team/capacitor
- Electron：https://github.com/electron/electron
- Electron Packager：https://github.com/electron/packager
- StPageFlip 的 MIT 许可见 `web-source/vendor/page-flip/LICENSE`。
- 环境要求：https://capacitorjs.com/docs/getting-started/environment-setup
- Xcode 要求：https://developer.apple.com/xcode/system-requirements
- Apple 分发计划：https://developer.apple.com/programs/enroll/

生成的应用保留 Electron 随附的许可文件；其他直接依赖许可见 `THIRD_PARTY_NOTICES.txt`。本工程不加入统计、广告、云端记录上传或应用商店发布。
