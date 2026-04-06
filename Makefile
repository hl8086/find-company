APP_NAME := find-job
PORT ?= 3000

.PHONY: install dev build start db-seed sync-static preview-static docker-build docker-run

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

sync-static:
	node site-static/scripts/sync-data.mjs

preview-static: sync-static
	python3 -m http.server 4173 -d site-static

docker-build:
	docker build -t $(APP_NAME):latest .

docker-run:
	docker run --rm -p $(PORT):3000 $(APP_NAME):latest
