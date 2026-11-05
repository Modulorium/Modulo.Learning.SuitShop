
start:
	cd deploy-local && docker compose down && docker compose build && docker compose up -d

restart:
	cd deploy-local && docker compose down && docker compose build --no-cache && docker compose up -d

down:
	cd deploy-local && docker compose down

clear:
	cd deploy-local && docker compose down -v
