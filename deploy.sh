cd client && npm run build
ssh tadeus@kojima.uberspace.de rm -rf /home/tadeus/html/pocket-wiki/*
scp -r dist/* tadeus@kojima.uberspace.de:/home/tadeus/html/pocket-wiki
