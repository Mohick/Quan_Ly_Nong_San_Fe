@echo off
echo.
echo =======================================================
echo           COMMITTING AND PUSHING ALL CHANGES
echo =======================================================
echo.
git add .
git commit -m "fix: resolve merge conflicts, clean up redirect, and call backend API directly"
git push
echo.
echo =======================================================
echo                   SYNC COMPLETED!
echo =======================================================
pause
