export default function Home() {
	return (
		<main style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
			<h1>Partner Portal</h1>
			<p>Welcome to the B2B Partner Portal for Booking Management</p>

			<section style={{ marginTop: '2rem' }}>
				<h2>Getting Started</h2>
				<ul>
					<li>
						Backend API: <a href="http://localhost:3001/health">http://localhost:3001/health</a>
					</li>
					<li>
						API Documentation: <a href="http://localhost:3001/docs">http://localhost:3001/docs</a>
					</li>
					<li>
						OpenAPI Spec: <a href="/openapi/openapi.yaml">/openapi/openapi.yaml</a>
					</li>
				</ul>
			</section>

			<section style={{ marginTop: '2rem' }}>
				<h2>Features</h2>
				<ul>
					<li>✅ Fastify Backend with Hexagonal Architecture</li>
					<li>✅ Next.js React Frontend</li>
					<li>✅ PostgreSQL / SQLite Database Support</li>
					<li>✅ OpenAPI Specification</li>
					<li>✅ TypeScript Support</li>
				</ul>
			</section>
		</main>
	);
}
