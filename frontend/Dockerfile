# ---- build stage ----
FROM node:24-alpine AS build
WORKDIR /app
# NEXT_PUBLIC_* vars are inlined into the client bundle at BUILD time.
ARG NEXT_PUBLIC_API_URL=http://localhost:4000
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# ---- runtime stage ----
FROM node:24-alpine
ENV NODE_ENV=production
WORKDIR /app
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public
EXPOSE 3000
ENV PORT=3000 HOSTNAME=0.0.0.0
USER node
CMD ["node", "server.js"]
