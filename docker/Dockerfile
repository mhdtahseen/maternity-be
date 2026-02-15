FROM node:22-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
RUN apk add --no-cache tesseract-ocr tesseract-ocr-data-eng poppler-utils
COPY --from=base /app/package*.json ./
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/dist ./dist
COPY --from=base /app/src ./src
COPY --from=base /app/tsconfig.json ./tsconfig.json
COPY --from=base /app/tsconfig.build.json ./tsconfig.build.json
COPY --from=base /app/ormconfig.ts ./ormconfig.ts
COPY --from=base /app/nest-cli.json ./nest-cli.json
EXPOSE 3000
CMD ["npm", "run", "start:prod"]
