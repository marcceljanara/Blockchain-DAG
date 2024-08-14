@echo off
:start
node check-balance.js
node create-nft.js
timeout /t 10
goto start
