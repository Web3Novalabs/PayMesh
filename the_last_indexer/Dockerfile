FROM node:18-slim

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

RUN npm install -g pnpm

COPY . .

RUN pnpm install
RUN pnpm run build

CMD ["sh", "-c", "pnpm start --indexer paymesh-starknet && pnpm start --indexer crowdfunding"]