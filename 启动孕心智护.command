#!/bin/zsh
# 解压后双击即可启动；不安装软件包、不联网。
cd "${0:A:h}" || exit 1
app_python=""
python_candidates=("$(command -v python3 2>/dev/null)" "/usr/local/bin/python3" "/opt/homebrew/bin/python3" "/usr/bin/python3" "$HOME/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3")
for candidate in "${python_candidates[@]}"; do
  if [[ -x "$candidate" ]] && "$candidate" -c 'import sys; sys.exit(0 if sys.version_info >= (3, 9) else 1)' >/dev/null 2>&1; then
    app_python="$candidate"
    break
  fi
done
if [[ -z "$app_python" ]]; then
  print "没有找到 Python 3.9 或更高版本。"
  print "请先按《运行环境与启动说明.txt》安装 Python，再重新打开。"
  read -r "reply?按回车关闭窗口"
  exit 1
fi
print "正在使用：$app_python"
"$app_python" launcher.py
if [[ $? -ne 0 ]]; then
  read -r "reply?按回车关闭窗口"
fi
