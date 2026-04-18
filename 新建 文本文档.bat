@echo off
chcp 65001 >nul
echo ====================================
echo Hexo 自动化启动脚本
echo ====================================
echo.

:: 切换到指定目录
cd /d E:\vol
if %errorlevel% neq 0 (
    echo [错误] 无法切换到 E:\vol 目录
    pause
    exit /b 1
)

echo [1/3] 清理缓存...
call hexo clean
if %errorlevel% neq 0 (
    echo [错误] hexo clean 执行失败
    pause
    exit /b 1
)
echo.

echo [2/3] 生成静态文件...
call hexo g
if %errorlevel% neq 0 (
    echo [错误] hexo g 执行失败
    pause
    exit /b 1
)
echo.

echo [3/3] 启动本地服务器...
echo 服务器启动后将自动打开浏览器
echo 按 Ctrl+C 可停止服务器
echo.

:: 延迟3秒后打开浏览器
start "" cmd /c "timeout /t 3 /nobreak >nul && start http://localhost:4000/"

:: 启动hexo服务器
call hexo s