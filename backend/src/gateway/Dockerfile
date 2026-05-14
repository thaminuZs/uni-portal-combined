FROM oven/bun:1

WORKDIR /app

COPY *.json .
COPY bun.lock .

RUN bun install

COPY . .

EXPOSE 8080

CMD [ "bun", "run", "start" ]