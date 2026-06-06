FROM node:20 as dependencies
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:20 as builder
WORKDIR /app
COPY . .
COPY --from=dependencies /app/node_modules ./node_modules
RUN npm run build
FROM node:20 as runner
WORKDIR /app
ENV NODE_ENV production
ENV PORT 4000
# If you are using a custom next.config.js file, uncomment this line.
COPY --from=builder /app/next.config.mjs ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/.env ./.env

EXPOSE 4000
CMD ["npm", "run", "start", "-p 4000"]

