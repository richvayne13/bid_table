@echo off
chcp 65001 > nul
echo ========================================================
echo   셀프바이어 (selfbuyer) 온라인 배포 스크립트
echo ========================================================
echo.

echo [1/4] Next.js 정적 사이트 최적화 빌드 중...
call npm run build
if %errorlevel% neq 0 (
    echo [!] 빌드 실패! 코드를 점검해주세요.
    pause
    exit /b 1
)

echo.
echo [2/4] .nojekyll 보호 파일 생성...
copy /y nul out\.nojekyll > nul

echo.
echo [3/4] gh-pages 브랜치에 온라인 배포본 푸시 중...
powershell -Command "$outDir = '%~dp0out'; git --work-tree=$outDir add --all; $tree = git --work-tree=$outDir write-tree; $commit = git commit-tree $tree -m 'Deploy update to gh-pages: %date% %time%'; git update-ref refs/heads/gh-pages $commit; git push origin gh-pages --force"

echo.
echo [4/4] main 소스코드 저장소 푸시 중...
git add .
git commit -m "Update source: %date% %time%"
git push origin main

echo.
echo ========================================================
echo  [성공] 온라인 배포 푸시가 완료되었습니다!
echo  접속 주소: https://richvayne13.github.io/selfbuyer/
echo ========================================================
echo.
pause
