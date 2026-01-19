import Fastify from 'fastify';
import swagger from '@fastify/swagger';
import { writeFileSync, readFileSync } from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { setupRoutes } from '../infrastructure/adapters/http/routes.js';

async function generateOpenApi() {
  const fastify = Fastify();

  await fastify.register(swagger, {
    openapi: {
      info: {
        title: 'Partner Portal API (Generated)',
        version: '1.0.0',
      },
    },
  });

  // Register routes so swagger can detect them
  setupRoutes(fastify);

  await fastify.ready();

  const generatedSpec = fastify.swagger();
  
  // Path to the additional details file
  const additionalSpecPath = path.resolve(__dirname, '../../../../openapi/openapi-additional.yaml');
  const outputPath = path.resolve(__dirname, '../../../../openapi/openapi.yaml');

  let finalSpec = generatedSpec;

  try {
    const additionalSpec = yaml.load(readFileSync(additionalSpecPath, 'utf8')) as any;
    // Basic merge strategy: deep merge objects
    finalSpec = mergeOpenApiSpecs(generatedSpec, additionalSpec);
  } catch (error) {
    console.warn('Could not load additional OpenAPI details, using generated spec only.', error);
  }

  writeFileSync(outputPath, yaml.dump(finalSpec));
  console.log(`OpenAPI specification generated and merged at ${outputPath}`);
  process.exit(0);
}

function mergeOpenApiSpecs(base: any, additional: any): any {
  const merged = { ...base };
  
  if (additional.info) {
    merged.info = { ...merged.info, ...additional.info };
  }
  
  if (additional.tags) {
    // Merge tags by name
    const tagMap = new Map(merged.tags?.map((t: any) => [t.name, t]) || []);
    additional.tags.forEach((tag: any) => tagMap.set(tag.name, tag));
    merged.tags = Array.from(tagMap.values());
  }

  if (additional.components) {
    merged.components = merged.components || {};
    for (const key in additional.components) {
      merged.components[key] = { ...(merged.components[key] || {}), ...additional.components[key] };
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
