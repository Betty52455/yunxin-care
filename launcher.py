"""一键启动器：重复启动时打开已有实例，不切换端口或数据位置。"""
import json
import subprocess
import sys
import time
import urllib.request
import urllib.error
import webbrowser
from pathlib import Path

ROOT = Path(__file__).resolve().parent
URL = "http://127.0.0.1:8765"


def healthy():
    try:
        # 绕过系统代理：数据仅在本机回环地址之间传递。
        opener = urllib.request.build_opener(urllib.request.ProxyHandler({}))
        with opener.open(URL + "/api/health", timeout=1) as response:
            return json.load(response).get("app") == "yunxin-local"
    except (OSError, ValueError):
        return False


if healthy():
    print("孕心智护已在运行，正在打开浏览器。")
    webbrowser.open(URL)
else:
    process = subprocess.Popen([sys.executable, str(ROOT / "server.py")], cwd=ROOT)
    try:
        for _ in range(30):
            if process.poll() is not None:
                raise RuntimeError("未能启动。8765 端口可能被其他程序使用，请保留此提示联系开发者。")
            if healthy():
                webbrowser.open(URL)
                print("浏览器已打开。这个窗口用于本地保存，请在使用期间保持打开。\n停止使用后可以关闭窗口，下次仍从同一个启动文件打开。", flush=True)
                break
            time.sleep(0.1)
        else:
            raise RuntimeError("本地服务没有及时启动，请重试。")
        process.wait()
    except KeyboardInterrupt:
        pass
    except RuntimeError as exc:
        print(str(exc))
        sys.exit(1)
    finally:
        if process.poll() is None:
            process.terminate()
            process.wait(timeout=5)
