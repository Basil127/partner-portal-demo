import type { FastifyInstance } from "fastify/types/instance.js";

export function setupUcpRoutes(fastify: FastifyInstance) {
    return Promise.all([
        import('./cart/routes.js').then(({ default: setupCartRoutes }) => setupCartRoutes(fastify)),
        import('./checkout/routes.js').then(({ default: setupCheckoutRoutes }) => setupCheckoutRoutes(fastify)),
    ]);
}