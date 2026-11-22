@echo off
chcp 65001 > nul
echo ========================================================
echo   견적식탁 (BidPlate) 온라인 GitHub Pages 자동 배포
echo ========================================================
echo.

git status > nul 2>&1
if %errorlevel% neq 0 (
    echo [1/3] Git 저장소를 초기화합니다...
    git init
    git branch -M main
) else (
    echo [1/3] Git 저장소 확인 완료.
)

echo.
echo [2/3] 변경 사항을 스테이징 및 커밋합니다...
git add .
git commit -m "Deploy BidPlate update: %date% %time%"

echo.
echo [3/3] GitHub에 푸시 중... (GitHub Actions가 온라인 자동 배포를 실행합니다)
git push origin main

if %errorlevel% equ 0 (
    echo.
    echo ========================================================
    echo  [성공] GitHub 푸시가 완료되었습니다!
    echo  온라인 배포 주소: https://richvayne13.github.io/bid_table/
    echo ========================================================
) else (
    echo.
    echo [!] 푸시 중 문제가 발생했습니다. 네트워크 및 GitHub 권한을 확인해주세요.
)

echo.
pause
