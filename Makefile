.PHONY: setup fix-async-api

setup:
	npm install
	@test -f .env.local || ( \
		echo "DB_HOST=localhost" > .env.local && \
		echo "DB_PORT=5433" >> .env.local && \
		echo "DB_NAME=quicklang" >> .env.local && \
		echo "DB_USER=postgres" >> .env.local && \
		echo "DB_PASSWORD=quicklang123" >> .env.local && \
		echo "DATABASE_URL=postgresql://postgres:quicklang123@localhost:5433/quicklang" >> .env.local \
	)
	docker compose up -d

start:
	docker compose start

fix-async-api:
	npx @next/codemod@canary next-async-request-api .
