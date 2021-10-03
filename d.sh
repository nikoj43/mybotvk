pm2 stop bot
rm -r mybotvk
git clone https://github.com/nikoj43/mybotvk.git
npm i
npm i needle
pm2 start bot.js