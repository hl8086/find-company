APP_NAME := find-company
PORT ?= 3000

.PHONY: install dev build start db-seed jobs-discover jobs-crawl sync-static preview-static docker-build docker-build-amd64 docker-run

install:
	npm install

dev:
	npm run dev

build:
	npm run build

start:
	npm run start

db-seed:
	npm run db:seed

jobs-discover:
	npm run jobs:discover

jobs-crawl:
	npm run jobs:crawl

sync-static:
	node site-static/scripts/sync-data.mjs

preview-static: sync-static
	python3 -m http.server 4173 -d site-static

docker-build:
	docker build -t $(APP_NAME):latest .

docker-build-amd64:
	docker buildx build --platform linux/amd64 -t $(APP_NAME):amd64 --load .

docker-run:
	docker run --rm -p $(PORT):3000 $(APP_NAME):latest
