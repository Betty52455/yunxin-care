@echo off
chcp 65001 >nul
setlocal
pushd "%~dp0"
py -3 -c "import sys; sys.exit(0 if sys.version_info >= (3, 9) else 1)" >nul 2>&1
if not errorlevel 1 goto use_py
python -c "import sys; sys.exit(0 if sys.version_info >= (3, 9) else 1)" >nul 2>&1
if not errorlevel 1 goto use_python
python3 -c "import sys; sys.exit(0 if sys.version_info >= (3, 9) else 1)" >nul 2>&1
if not errorlevel 1 goto use_python3
echo 没有找到 Python 3.9 或更高版本。
echo 请先按“运行环境与启动说明.txt”安装 Python，再重新打开。
pause
popd
exit /b 1

:use_py
py -3 launcher.py
goto finish
:use_python
python launcher.py
goto finish
:use_python3
python3 launcher.py

:finish
if errorlevel 1 pause
popd
endlocal
