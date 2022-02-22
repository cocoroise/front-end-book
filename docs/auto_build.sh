git reset --hard origin/master
git clean -f
git pull origin master
pm2 reload ./pull.js