@echo off
chcp 65001 >nul
echo ========================================
echo   微信开发者工具缓存彻底清理脚本
echo ========================================
echo.
echo 请确保已关闭微信开发者工具！
echo 如果没有关闭，请先关闭后按任意键继续
echo.
pause

set "CACHE_ROOT=C:\Users\19909\AppData\Local\微信开发者工具\User Data\2064a8d71f3a5c188fa62bd97ab197ad"

echo 正在清理缓存...

rd /s /q "%CACHE_ROOT%\WeappCache" 2>nul && echo [OK] WeappCache || echo [SKIP] WeappCache
rd /s /q "%CACHE_ROOT%\WeappCode" 2>nul && echo [OK] WeappCode || echo [SKIP] WeappCode
rd /s /q "%CACHE_ROOT%\WeappMiniCode" 2>nul && echo [OK] WeappMiniCode || echo [SKIP] WeappMiniCode
rd /s /q "%CACHE_ROOT%\WeappSimulator" 2>nul && echo [OK] WeappSimulator || echo [SKIP] WeappSimulator
rd /s /q "%CACHE_ROOT%\WeappPureSimulatorCache" 2>nul && echo [OK] WeappPureSimulatorCache || echo [SKIP] WeappPureSimulatorCache
rd /s /q "%CACHE_ROOT%\WeappLocalData" 2>nul && echo [OK] WeappLocalData || echo [SKIP] WeappLocalData
rd /s /q "%CACHE_ROOT%\ShaderCache" 2>nul && echo [OK] ShaderCache || echo [SKIP] ShaderCache
rd /s /q "%CACHE_ROOT%\GrShaderCache" 2>nul && echo [OK] GrShaderCache || echo [SKIP] GrShaderCache
rd /s /q "%CACHE_ROOT%\WeappAITemplateCache" 2>nul && echo [OK] WeappAITemplateCache || echo [SKIP] WeappAITemplateCache

echo.
echo 正在清理 Chromium 缓存...
rd /s /q "%CACHE_ROOT%\Default\Cache" 2>nul && echo [OK] Default\Cache || echo [SKIP] Default\Cache
rd /s /q "%CACHE_ROOT%\Default\Code Cache" 2>nul && echo [OK] Default\Code Cache || echo [SKIP] Default\Code Cache
rd /s /q "%CACHE_ROOT%\Default\GPUCache" 2>nul && echo [OK] Default\GPUCache || echo [SKIP] Default\GPUCache
rd /s /q "%CACHE_ROOT%\Default\Service Worker" 2>nul && echo [OK] Default\Service Worker || echo [SKIP] Default\Service Worker
rd /s /q "%CACHE_ROOT%\Default\optimization_guide_hint_cache_store" 2>nul && echo [OK] Default\optimization_cache || echo [SKIP] Default\optimization_cache

echo.
echo 正在清理项目编译缓存...
rd /s /q "%CACHE_ROOT%\WeappCache\bufferUrlCache" 2>nul
rd /s /q "%CACHE_ROOT%\WeappCache\dirCache" 2>nul
rd /s /q "%CACHE_ROOT%\WeappCache\ProxyCache" 2>nul
rd /s /q "%CACHE_ROOT%\WeappCache\requireCache" 2>nul
rd /s /q "%CACHE_ROOT%\WeappCache\skeletonCache" 2>nul
rd /s /q "%CACHE_ROOT%\WeappCache\WeappCompileCache" 2>nul
rd /s /q "%CACHE_ROOT%\WeappCache\WeappPluginCache" 2>nul
rd /s /q "%CACHE_ROOT%\WeappSimulator\WeappFileCache" 2>nul
echo [OK] 项目编译缓存

echo.
echo ========================================
echo   缓存彻底清理完成！
echo.
echo   下一步操作：
echo   1. 重新打开微信开发者工具
echo   2. 打开项目
echo   3. 点击"编译"按钮
echo ========================================
echo.
pause
