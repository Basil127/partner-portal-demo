import Fastify from 'fastify';
import type { FastifyInstance } from 'fastify';
import swagger from '@fastify/swagger';
import type { OpenAPIV3_1 } from 'openapi-types';
import { writeFileSync, readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import yaml from 'js-yaml';
import { setupRoutes } from '../infrastructure/adapters/http/routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function generateOpenApi(): Promise<void> {
  const fastify: FastifyInstance = Fastify();

  await fastify.register(swagger, {
    openapi: {
      openapi: '3.1.0',
      info: {
        title: 'Partner Portal API (Generated)',
        version: '0.1.0',
      },
    },
  });

  // Register routes so swagger can detect them
  setupRoutes(fastify);

  await fastify.ready();

  const generatedSpec = fastify.swagger() as OpenAPIV3_1.Document;
  
  // Path to the additional details file
  const additionalSpecPath = path.resolve(__dirname, '../../../../openapi/openapi-additional.yaml');
  const outputPath = path.resolve(__dirname, '../../../../openapi/openapi.yaml');

  let finalSpec: OpenAPIV3_1.Document = generatedSpec;

  try {
    const additionalSpec = yaml.load(readFileSync(additionalSpecPath, 'utf8')) as Partial<OpenAPIV3_1.Document>;
    // Basic merge strategy: deep merge objects
    finalSpec = mergeOpenApiSpecs(generatedSpec, additionalSpec);
  } catch (error) {
    console.warn('Could not load additional OpenAPI details, using generated spec only.', error);
  }

  writeFileSync(outputPath, yaml.dump(finalSpec));
  console.log(`OpenAPI specification generated and merged at ${outputPath}`);
  process.exit(0);
}

function mergeOpenApiSpecs(base: OpenAPIV3_1.Document, additional: Partial<OpenAPIV3_1.Document>): OpenAPIV3_1.Document {
  const merged: OpenAPIV3_1.Document = { ...base };
  
  if (additional.info) {
    merged.info = { ...merged.info, ...additional.info };
  }
  
  if (additional.tags) {
    // Merge tags by name
    const tagMap = new Map<string, OpenAPIV3_1.TagObject>(merged.tags?.map((t) => [t.name, t]) || []);
    additional.tags.forEach((tag) => tagMap.set(tag.name, tag));
    merged.tags = Array.from(tagMap.values());
  }

  if (additional.components) {
    merged.components = merged.components || {};
    for (const key in additional.components) {
      const componentKey = key as keyof OpenAPIV3_1.ComponentsObject;
      const baseComponents = (merged.components[componentKey] || {}) as Record<string, unknown>;
      const extraComponents = (additional.components[componentKey] || {}) as Record<string, unknown>;
      
      merged.components[componentKey] = { ...baseComponents, ...extraComponents } as any;
    }
  }

  // Paths are usually best handled by the generator, but we can merge them if needed
  if (additional.paths) {
    merged.paths = { ...merged.paths, ...additional.paths };
  }

  return merged;
}

generateOpenApi().catch(err => {
  console.error(err);
  process.exit(1);
});
