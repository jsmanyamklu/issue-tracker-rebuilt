const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Realistic user data
const users = [
  // Managers (3)
  { name: 'Sarah Johnson', email: 'sarah.johnson@taskforge.com', role: 'manager', provider: 'github', provider_id: '12345001', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah' },
  { name: 'Michael Chen', email: 'michael.chen@taskforge.com', role: 'manager', provider: 'github', provider_id: '12345002', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael' },
  { name: 'Emily Rodriguez', email: 'emily.rodriguez@taskforge.com', role: 'manager', provider: 'github', provider_id: '12345003', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily' },

  // Engineers (17)
  { name: 'David Kim', email: 'david.kim@taskforge.com', role: 'developer', provider: 'github', provider_id: '12345004', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David' },
  { name: 'Jennifer Martinez', email: 'jennifer.martinez@taskforge.com', role: 'developer', provider: 'github', provider_id: '12345005', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jennifer' },
  { name: 'Robert Taylor', email: 'robert.taylor@taskforge.com', role: 'developer', provider: 'github', provider_id: '12345006', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Robert' },
  { name: 'Lisa Anderson', email: 'lisa.anderson@taskforge.com', role: 'developer', provider: 'github', provider_id: '12345007', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa' },
  { name: 'James Wilson', email: 'james.wilson@taskforge.com', role: 'developer', provider: 'github', provider_id: '12345008', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=James' },
  { name: 'Maria Garcia', email: 'maria.garcia@taskforge.com', role: 'developer', provider: 'github', provider_id: '12345009', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria' },
  { name: 'Christopher Lee', email: 'christopher.lee@taskforge.com', role: 'developer', provider: 'github', provider_id: '12345010', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Christopher' },
  { name: 'Amanda White', email: 'amanda.white@taskforge.com', role: 'developer', provider: 'github', provider_id: '12345011', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Amanda' },
  { name: 'Daniel Brown', email: 'daniel.brown@taskforge.com', role: 'developer', provider: 'github', provider_id: '12345012', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Daniel' },
  { name: 'Jessica Davis', email: 'jessica.davis@taskforge.com', role: 'developer', provider: 'github', provider_id: '12345013', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jessica' },
  { name: 'Matthew Miller', email: 'matthew.miller@taskforge.com', role: 'developer', provider: 'github', provider_id: '12345014', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Matthew' },
  { name: 'Ashley Moore', email: 'ashley.moore@taskforge.com', role: 'developer', provider: 'github', provider_id: '12345015', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ashley' },
  { name: 'Joshua Thompson', email: 'joshua.thompson@taskforge.com', role: 'developer', provider: 'github', provider_id: '12345016', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Joshua' },
  { name: 'Nicole Jackson', email: 'nicole.jackson@taskforge.com', role: 'developer', provider: 'github', provider_id: '12345017', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Nicole' },
  { name: 'Andrew Harris', email: 'andrew.harris@taskforge.com', role: 'developer', provider: 'github', provider_id: '12345018', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Andrew' },
  { name: 'Rachel Clark', email: 'rachel.clark@taskforge.com', role: 'developer', provider: 'github', provider_id: '12345019', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rachel' },
  { name: 'Kevin Lewis', email: 'kevin.lewis@taskforge.com', role: 'developer', provider: 'github', provider_id: '12345020', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Kevin' },
];

// 6 Projects in different domains
const projects = [
  {
    name: 'E-Commerce Platform Redesign',
    description: 'Modern React-based e-commerce platform with Next.js 15, featuring real-time inventory management, payment integration, and advanced search capabilities.',
    domain: 'web'
  },
  {
    name: 'ARM Cortex-M7 RTL Verification',
    description: 'Complete functional verification suite for ARM Cortex-M7 processor using SystemVerilog UVM. Includes instruction set verification, cache coherency, and interrupt handling.',
    domain: 'asic'
  },
  {
    name: 'AI-Powered Content Generator',
    description: 'Machine learning pipeline for automated content generation using GPT-4 and Claude. Supports multiple formats including blog posts, social media, and technical documentation.',
    domain: 'ai'
  },
  {
    name: 'Cloud Infrastructure Automation',
    description: 'Terraform and Kubernetes-based infrastructure automation for multi-cloud deployments. Includes CI/CD pipelines, monitoring, and auto-scaling.',
    domain: 'devops'
  },
  {
    name: 'Mobile Banking Application',
    description: 'Cross-platform mobile app using React Native for iOS and Android. Features include biometric authentication, real-time transactions, and push notifications.',
    domain: 'mobile'
  },
  {
    name: 'Real-Time Data Analytics Platform',
    description: 'High-performance data processing system using Apache Kafka, Spark, and Elasticsearch. Handles 1M+ events per second with sub-second latency.',
    domain: 'data'
  }
];

// Issue templates for different domains
const issueTemplates = {
  web: [
    { title: 'Implement responsive navigation menu', type: 'feature', priority: 'high', description: 'Create a mobile-friendly navigation menu with hamburger icon and smooth animations. Should support nested menu items and work across all breakpoints.' },
    { title: 'Fix checkout page payment validation', type: 'bug', priority: 'critical', description: 'Payment form validation not working correctly for credit cards. CVV validation allows invalid characters and expiry date format is inconsistent.' },
    { title: 'Optimize product image loading', type: 'improvement', priority: 'medium', description: 'Product images loading slowly. Implement lazy loading, WebP format, and CDN integration to improve performance.' },
    { title: 'Add shopping cart persistence', type: 'feature', priority: 'high', description: 'Shopping cart items should persist across sessions. Store cart data in localStorage and sync with backend on login.' },
    { title: 'Update dependencies to latest versions', type: 'task', priority: 'medium', description: 'Update React, Next.js, and other core dependencies to latest stable versions. Ensure all tests pass after upgrade.' },
    { title: 'Implement product search with filters', type: 'feature', priority: 'high', description: 'Add advanced product search with filters for category, price range, brand, and ratings. Include autocomplete suggestions.' },
    { title: 'Fix mobile layout breaking on iOS Safari', type: 'bug', priority: 'high', description: 'Product grid layout breaks on iOS Safari 16+. Flexbox rendering issue causing overlapping cards.' },
    { title: 'Add user reviews and ratings', type: 'feature', priority: 'medium', description: 'Implement review system with star ratings, photos, and verified purchase badges. Include moderation workflow.' },
    { title: 'Improve SEO metadata', type: 'improvement', priority: 'low', description: 'Add proper meta tags, Open Graph, and structured data for better SEO. Generate dynamic sitemap.' },
    { title: 'Set up A/B testing framework', type: 'task', priority: 'low', description: 'Integrate A/B testing tool (Optimizely or Google Optimize) for conversion optimization experiments.' },
    { title: 'Fix memory leak in product carousel', type: 'bug', priority: 'medium', description: 'Product carousel component causing memory leak. Event listeners not being cleaned up properly.' },
    { title: 'Add wishlist functionality', type: 'feature', priority: 'medium', description: 'Allow users to save products to wishlist. Sync across devices and send notifications on price drops.' },
    { title: 'Implement customer support chat', type: 'feature', priority: 'high', description: 'Integrate live chat widget (Intercom or Zendesk) for real-time customer support.' },
    { title: 'Optimize bundle size', type: 'improvement', priority: 'medium', description: 'Current bundle size is 2.5MB. Implement code splitting and tree shaking to reduce to under 1MB.' },
    { title: 'Add order tracking page', type: 'feature', priority: 'high', description: 'Create order tracking page with real-time updates, shipping status, and estimated delivery date.' },
    { title: 'Fix accessibility issues', type: 'bug', priority: 'high', description: 'Multiple WCAG 2.1 AA violations found. Missing ARIA labels, keyboard navigation issues, and color contrast problems.' },
    { title: 'Implement product recommendations', type: 'feature', priority: 'medium', description: 'Add AI-powered product recommendations based on browsing history and purchase patterns.' },
    { title: 'Add multi-currency support', type: 'feature', priority: 'low', description: 'Support multiple currencies with real-time exchange rates. Store prices in base currency and convert on display.' },
    { title: 'Set up error monitoring', type: 'task', priority: 'high', description: 'Integrate Sentry for error tracking and performance monitoring in production.' },
    { title: 'Create admin dashboard', type: 'feature', priority: 'high', description: 'Build admin dashboard for order management, inventory control, and analytics reporting.' },
    { title: 'Fix CORS issues with API', type: 'bug', priority: 'critical', description: 'CORS errors blocking API requests from production domain. Configure proper CORS headers.' },
    { title: 'Implement email notifications', type: 'feature', priority: 'medium', description: 'Send email notifications for order confirmation, shipping updates, and promotional campaigns.' },
  ],
  asic: [
    { title: 'Verify instruction cache coherency', type: 'task', priority: 'critical', description: 'Create testbench to verify L1 instruction cache maintains coherency during multi-master bus transactions. Cover all MESI protocol states.' },
    { title: 'Fix data hazard detection logic', type: 'bug', priority: 'critical', description: 'Pipeline hazard detection unit not correctly identifying RAW hazards in certain instruction sequences. Causes data corruption.' },
    { title: 'Implement interrupt controller testbench', type: 'feature', priority: 'high', description: 'Develop UVM testbench for nested vectored interrupt controller (NVIC). Verify priority levels, preemption, and tail-chaining.' },
    { title: 'Add coverage for FPU operations', type: 'task', priority: 'high', description: 'Expand functional coverage model to include all FPU operations: ADD, SUB, MUL, DIV, SQRT. Cover edge cases and denormal numbers.' },
    { title: 'Debug AHB bus protocol violation', type: 'bug', priority: 'high', description: 'AHB master violating protocol during burst transfers. HBURST signal changes mid-transfer causing undefined behavior.' },
    { title: 'Create branch prediction verification suite', type: 'feature', priority: 'medium', description: 'Implement directed and random tests for 2-bit saturating counter branch predictor. Measure prediction accuracy.' },
    { title: 'Optimize simulation runtime', type: 'improvement', priority: 'medium', description: 'Current regression takes 48 hours. Implement parallel test execution and optimize memory models to reduce to under 24 hours.' },
    { title: 'Verify MPU region configurations', type: 'task', priority: 'high', description: 'Test all possible MPU region configurations: size, permissions, overlapping regions. Verify exception handling for access violations.' },
    { title: 'Fix clock gating verification', type: 'bug', priority: 'critical', description: 'Clock gating logic allowing glitches during enable/disable transitions. Causes metastability in sequential logic.' },
    { title: 'Implement low-power mode testing', type: 'feature', priority: 'high', description: 'Create tests for sleep, deep sleep, and standby modes. Verify wake-up sources and state retention.' },
    { title: 'Add assertions for pipeline stages', type: 'task', priority: 'medium', description: 'Write SVA assertions to check pipeline stage invariants: valid/ready protocol, data consistency, stall conditions.' },
    { title: 'Debug DMB instruction behavior', type: 'bug', priority: 'high', description: 'Data Memory Barrier instruction not enforcing memory ordering correctly. Loads being reordered before barrier.' },
    { title: 'Create memory controller stress tests', type: 'task', priority: 'high', description: 'Develop stress tests with maximum bandwidth utilization, random access patterns, and concurrent read/write operations.' },
    { title: 'Verify exception handling priority', type: 'task', priority: 'critical', description: 'Test exception priority mechanism: NMI, HardFault, MemManage, BusFault, UsageFault. Verify preemption and nesting.' },
    { title: 'Add code coverage metrics', type: 'improvement', priority: 'low', description: 'Integrate code coverage tools. Target: 95% line coverage, 90% branch coverage, 85% FSM coverage.' },
    { title: 'Fix DMA channel arbitration', type: 'bug', priority: 'high', description: 'DMA arbiter not correctly implementing round-robin priority when multiple channels request simultaneously.' },
    { title: 'Implement cache performance counters', type: 'feature', priority: 'medium', description: 'Add performance monitoring counters for cache hits, misses, evictions. Create verification environment to check accuracy.' },
    { title: 'Verify atomic operations', type: 'task', priority: 'critical', description: 'Test LDREX/STREX exclusive access instructions. Verify behavior in multi-master scenarios and cache coherency protocols.' },
    { title: 'Debug systick timer accuracy', type: 'bug', priority: 'medium', description: 'SysTick timer drifting over long simulation runs. Timing accuracy degrades after 1M cycles.' },
    { title: 'Create regression test suite', type: 'task', priority: 'high', description: 'Organize all tests into comprehensive regression suite. Categorize by priority (P0/P1/P2) and estimated runtime.' },
    { title: 'Fix register file read port conflict', type: 'bug', priority: 'critical', description: 'Register file allowing simultaneous read and write to same register. Violates timing constraints and causes data corruption.' },
    { title: 'Implement trace port verification', type: 'feature', priority: 'low', description: 'Create testbench for ETM trace port. Verify instruction trace, data trace, and timestamp packets.' },
  ],
  ai: [
    { title: 'Implement RAG pipeline for documentation', type: 'feature', priority: 'high', description: 'Build Retrieval-Augmented Generation pipeline using vector database (Pinecone) and LangChain. Support markdown, PDF, and code files.' },
    { title: 'Fix hallucination in model responses', type: 'bug', priority: 'critical', description: 'GPT-4 model generating factually incorrect information in 15% of responses. Implement fact-checking layer and confidence scoring.' },
    { title: 'Add fine-tuning workflow for custom models', type: 'feature', priority: 'high', description: 'Create automated pipeline for fine-tuning Claude/GPT models on domain-specific data. Include dataset preparation and evaluation metrics.' },
    { title: 'Optimize prompt engineering templates', type: 'improvement', priority: 'medium', description: 'Current prompts inefficient. Refactor to use chain-of-thought, few-shot examples, and structured output formats.' },
    { title: 'Implement content moderation filter', type: 'feature', priority: 'critical', description: 'Add AI-powered content moderation using OpenAI Moderation API. Filter toxic, offensive, and unsafe content before processing.' },
    { title: 'Fix token limit handling', type: 'bug', priority: 'high', description: 'Application crashing when input exceeds token limits. Implement chunking strategy and context window management.' },
    { title: 'Add multi-language support', type: 'feature', priority: 'medium', description: 'Support content generation in 10+ languages. Implement translation layer and language detection.' },
    { title: 'Create evaluation framework', type: 'task', priority: 'high', description: 'Build automated evaluation system using BLEU, ROUGE, and human evaluation metrics. Track model performance over time.' },
    { title: 'Implement caching layer', type: 'improvement', priority: 'high', description: 'Add Redis caching for similar prompts to reduce API costs. Implement semantic similarity search for cache hits.' },
    { title: 'Fix streaming response issues', type: 'bug', priority: 'medium', description: 'Streaming API responses breaking on special characters. Buffer management issue causing incomplete chunks.' },
    { title: 'Add usage analytics dashboard', type: 'feature', priority: 'medium', description: 'Create dashboard showing token usage, API costs, response times, and error rates. Real-time monitoring with alerts.' },
    { title: 'Implement model versioning', type: 'task', priority: 'high', description: 'Add version control for prompts and models. Support A/B testing and gradual rollout of new versions.' },
    { title: 'Fix race condition in batch processing', type: 'bug', priority: 'high', description: 'Concurrent batch requests causing race conditions. Results getting mixed between different users.' },
    { title: 'Add embeddings generation service', type: 'feature', priority: 'high', description: 'Implement service for generating text embeddings using OpenAI ada-002. Support batch processing and caching.' },
    { title: 'Optimize API rate limiting', type: 'improvement', priority: 'medium', description: 'Current rate limiting too aggressive. Implement exponential backoff and request queue management.' },
    { title: 'Create prompt injection prevention', type: 'task', priority: 'critical', description: 'Implement safeguards against prompt injection attacks. Sanitize user inputs and use instruction hierarchy.' },
    { title: 'Fix memory leak in vectorstore', type: 'bug', priority: 'high', description: 'Vector database client leaking connections. Memory usage growing unbounded during long-running operations.' },
    { title: 'Add agent orchestration framework', type: 'feature', priority: 'high', description: 'Implement multi-agent system with LangGraph. Support task decomposition, tool use, and result aggregation.' },
    { title: 'Implement cost optimization', type: 'improvement', priority: 'high', description: 'Reduce API costs by 40%. Use cheaper models for simple tasks, implement caching, and optimize prompt lengths.' },
    { title: 'Add fallback model strategy', type: 'feature', priority: 'medium', description: 'Implement fallback to alternative models when primary model unavailable. Support GPT-4, Claude, and Llama.' },
    { title: 'Fix context preservation in conversations', type: 'bug', priority: 'high', description: 'Multi-turn conversations losing context after 5-6 exchanges. Implement better conversation memory management.' },
    { title: 'Create testing framework', type: 'task', priority: 'high', description: 'Build comprehensive testing suite for AI workflows. Include unit tests, integration tests, and LLM evaluation tests.' },
  ],
  devops: [
    { title: 'Migrate to Kubernetes 1.28', type: 'task', priority: 'high', description: 'Upgrade all clusters from K8s 1.25 to 1.28. Test in staging environment first, update all deployments and custom resources.' },
    { title: 'Fix Terraform state lock issue', type: 'bug', priority: 'critical', description: 'Terraform state getting locked indefinitely. Multiple team members unable to apply changes. Investigate S3 backend locking mechanism.' },
    { title: 'Implement GitOps with ArgoCD', type: 'feature', priority: 'high', description: 'Set up ArgoCD for GitOps workflow. Configure auto-sync, health checks, and rollback strategies for all applications.' },
    { title: 'Add Prometheus monitoring', type: 'feature', priority: 'high', description: 'Deploy Prometheus stack with Grafana dashboards. Monitor CPU, memory, disk, network metrics for all services.' },
    { title: 'Fix intermittent pod crashes', type: 'bug', priority: 'critical', description: 'Random pod crashes in production every 2-3 hours. OOMKilled errors despite sufficient memory limits. Memory leak suspected.' },
    { title: 'Implement blue-green deployments', type: 'feature', priority: 'high', description: 'Set up blue-green deployment strategy for zero-downtime releases. Configure Istio traffic splitting and automated rollback.' },
    { title: 'Optimize Docker image sizes', type: 'improvement', priority: 'medium', description: 'Base images are 2GB+. Implement multi-stage builds, use Alpine Linux, and remove unnecessary dependencies.' },
    { title: 'Add disaster recovery automation', type: 'task', priority: 'critical', description: 'Automate disaster recovery procedures. Implement automated backups, cross-region replication, and restore testing.' },
    { title: 'Fix CircleCI pipeline failures', type: 'bug', priority: 'high', description: 'CI pipeline failing randomly on test stage. Flaky tests and race conditions in parallel execution.' },
    { title: 'Implement cost monitoring', type: 'feature', priority: 'medium', description: 'Set up Kubecost for Kubernetes cost allocation. Track spending by namespace, label, and service.' },
    { title: 'Add auto-scaling policies', type: 'task', priority: 'high', description: 'Configure HPA and VPA for all production workloads. Set appropriate thresholds based on historical metrics.' },
    { title: 'Fix ingress controller issues', type: 'bug', priority: 'high', description: 'NGINX ingress returning 502 errors during high traffic. Connection pool exhaustion suspected.' },
    { title: 'Implement secrets rotation', type: 'task', priority: 'critical', description: 'Automate secrets rotation for RDS, API keys, and certificates. Integrate with AWS Secrets Manager and cert-manager.' },
    { title: 'Add service mesh', type: 'feature', priority: 'high', description: 'Deploy Istio service mesh for advanced traffic management, observability, and security policies.' },
    { title: 'Optimize database connections', type: 'improvement', priority: 'medium', description: 'Application holding too many idle database connections. Implement connection pooling with PgBouncer.' },
    { title: 'Fix SSL certificate renewal', type: 'bug', priority: 'critical', description: 'Let\'s Encrypt certificates not renewing automatically. cert-manager ACME challenge failing.' },
    { title: 'Implement log aggregation', type: 'feature', priority: 'high', description: 'Deploy ELK stack (Elasticsearch, Logstash, Kibana) for centralized logging. Configure log retention policies.' },
    { title: 'Add security scanning', type: 'task', priority: 'high', description: 'Integrate Trivy for container vulnerability scanning. Fail builds on critical vulnerabilities.' },
    { title: 'Fix Redis cluster split-brain', type: 'bug', priority: 'critical', description: 'Redis cluster experiencing split-brain during network partitions. Losing cached data and causing service degradation.' },
    { title: 'Implement chaos engineering', type: 'feature', priority: 'low', description: 'Set up Chaos Mesh for resilience testing. Gradually introduce pod failures, network latency, and resource limits.' },
    { title: 'Add automated compliance checks', type: 'task', priority: 'medium', description: 'Implement OPA (Open Policy Agent) for policy enforcement. Check security policies, resource limits, and naming conventions.' },
    { title: 'Fix VPC peering configuration', type: 'bug', priority: 'high', description: 'VPC peering not routing traffic correctly between regions. Route table misconfiguration causing connection timeouts.' },
  ],
  mobile: [
    { title: 'Implement biometric authentication', type: 'feature', priority: 'critical', description: 'Add Face ID and Touch ID support for iOS, fingerprint and face unlock for Android. Fallback to PIN code.' },
    { title: 'Fix app crash on iOS 17', type: 'bug', priority: 'critical', description: 'App crashing on launch for iOS 17 users. SwiftUI navigation stack incompatibility causing immediate crash.' },
    { title: 'Add push notifications', type: 'feature', priority: 'high', description: 'Implement Firebase Cloud Messaging for push notifications. Support rich notifications with images and action buttons.' },
    { title: 'Optimize battery consumption', type: 'improvement', priority: 'high', description: 'App draining battery 20% faster than industry average. Reduce background location tracking and network polling.' },
    { title: 'Implement offline mode', type: 'feature', priority: 'high', description: 'Enable core features to work offline. Use SQLite for local storage and sync when connection restored.' },
    { title: 'Fix memory leak in transaction list', type: 'bug', priority: 'high', description: 'Transaction list screen leaking memory. Image caching not releasing properly, causing app slowdown.' },
    { title: 'Add QR code scanner', type: 'feature', priority: 'high', description: 'Implement QR code scanner for quick payments. Support camera permission handling and torch toggle.' },
    { title: 'Fix Android keyboard covering input', type: 'bug', priority: 'medium', description: 'Keyboard covering input fields on Android. KeyboardAvoidingView not working correctly in certain screens.' },
    { title: 'Implement card management', type: 'feature', priority: 'high', description: 'Add credit/debit card management. Support adding, deleting, and setting default payment methods.' },
    { title: 'Optimize app startup time', type: 'improvement', priority: 'high', description: 'App taking 4-5 seconds to launch. Lazy load non-critical modules and optimize splash screen.' },
    { title: 'Add transaction filters', type: 'feature', priority: 'medium', description: 'Implement filtering for transactions by date range, amount, category, and payment method.' },
    { title: 'Fix deep linking not working', type: 'bug', priority: 'high', description: 'Universal links (iOS) and App Links (Android) not opening app. URL scheme configuration issue.' },
    { title: 'Implement app lock with PIN', type: 'feature', priority: 'high', description: 'Add 4-6 digit PIN protection for app access. Auto-lock after configurable timeout period.' },
    { title: 'Fix animation stuttering', type: 'bug', priority: 'medium', description: 'Animations dropping frames on older devices. Optimize useNativeDriver and reduce re-renders.' },
    { title: 'Add receipt scanning', type: 'feature', priority: 'medium', description: 'Implement OCR for scanning receipts. Extract amount, merchant, and date automatically.' },
    { title: 'Fix network timeout issues', type: 'bug', priority: 'high', description: 'API requests timing out on slow networks. Implement retry logic and better error handling.' },
    { title: 'Implement account statements', type: 'feature', priority: 'high', description: 'Generate PDF account statements for any date range. Include all transactions, fees, and balance history.' },
    { title: 'Add accessibility support', type: 'improvement', priority: 'high', description: 'Improve accessibility for VoiceOver and TalkBack. Add proper labels, hints, and navigation order.' },
    { title: 'Fix camera permission crash', type: 'bug', priority: 'critical', description: 'App crashes when camera permission denied. Missing null check causing unhandled exception.' },
    { title: 'Implement budgeting features', type: 'feature', priority: 'medium', description: 'Add monthly budgets by category. Show spending trends and notifications when approaching limits.' },
    { title: 'Add multi-language support', type: 'feature', priority: 'low', description: 'Internationalize app for 10+ languages. Support RTL layouts for Arabic and Hebrew.' },
    { title: 'Fix transaction sync delays', type: 'bug', priority: 'high', description: 'New transactions taking 30+ seconds to appear. Real-time sync via WebSocket not working reliably.' },
  ],
  data: [
    { title: 'Implement real-time stream processing', type: 'feature', priority: 'critical', description: 'Build Kafka consumer group with Spark Structured Streaming. Process 1M events/second with exactly-once semantics.' },
    { title: 'Fix data loss in Kafka partition rebalance', type: 'bug', priority: 'critical', description: 'Messages being lost during consumer rebalance. Offset commit timing issue causing duplicate/lost events.' },
    { title: 'Add Elasticsearch indexing pipeline', type: 'feature', priority: 'high', description: 'Create pipeline to index processed events into Elasticsearch. Support bulk indexing with 10K docs/second throughput.' },
    { title: 'Optimize Spark job performance', type: 'improvement', priority: 'high', description: 'Current batch jobs taking 6 hours. Optimize partition strategy, enable adaptive query execution, tune memory.' },
    { title: 'Implement data quality checks', type: 'task', priority: 'high', description: 'Add Great Expectations for data validation. Check schema compliance, null values, and business rule violations.' },
    { title: 'Fix OOM errors in aggregation jobs', type: 'bug', priority: 'critical', description: 'Spark driver running out of memory during wide transformations. Broadcast join causing memory pressure.' },
    { title: 'Add data lineage tracking', type: 'feature', priority: 'medium', description: 'Implement Apache Atlas for data lineage. Track data flow from ingestion through transformations to analytics.' },
    { title: 'Implement CDC from PostgreSQL', type: 'feature', priority: 'high', description: 'Set up Change Data Capture using Debezium. Stream database changes to Kafka for real-time analytics.' },
    { title: 'Fix Parquet file corruption', type: 'bug', priority: 'high', description: 'Occasional Parquet files getting corrupted in S3. Incomplete writes during Spark task failures.' },
    { title: 'Add data retention policies', type: 'task', priority: 'high', description: 'Implement automated data retention. Archive old data to Glacier, delete after compliance period (7 years).' },
    { title: 'Implement late data handling', type: 'feature', priority: 'high', description: 'Handle late-arriving events in streaming pipeline. Configure watermarks and allowed lateness windows.' },
    { title: 'Optimize Elasticsearch queries', type: 'improvement', priority: 'medium', description: 'Dashboard queries taking 10+ seconds. Optimize index mappings, add caching, and use aggregations efficiently.' },
    { title: 'Fix Kafka consumer lag', type: 'bug', priority: 'critical', description: 'Consumer lag growing to millions of messages. Processing rate cannot keep up with ingestion rate.' },
    { title: 'Add machine learning pipeline', type: 'feature', priority: 'high', description: 'Build ML pipeline with MLflow for model training. Integrate with Spark MLlib for feature engineering.' },
    { title: 'Implement data anonymization', type: 'task', priority: 'critical', description: 'Anonymize PII data for GDPR compliance. Hash emails, mask credit cards, remove direct identifiers.' },
    { title: 'Fix Airflow DAG failures', type: 'bug', priority: 'high', description: 'Daily ETL DAGs failing intermittently. Task dependencies not waiting for upstream completion.' },
    { title: 'Add real-time dashboards', type: 'feature', priority: 'high', description: 'Create real-time Grafana dashboards. Show pipeline throughput, latency, error rates, and data volumes.' },
    { title: 'Implement schema evolution', type: 'task', priority: 'high', description: 'Support backward and forward compatible schema changes. Use Avro schema registry for version management.' },
    { title: 'Fix duplicate events', type: 'bug', priority: 'high', description: 'Same events appearing multiple times in analytics. Deduplication logic not working for out-of-order messages.' },
    { title: 'Add cost optimization', type: 'improvement', priority: 'medium', description: 'Reduce AWS costs by 30%. Use Spot instances for Spark, compress data better, optimize S3 storage tiers.' },
    { title: 'Implement data catalog', type: 'feature', priority: 'medium', description: 'Create searchable data catalog with metadata. Document datasets, schemas, owners, and update frequencies.' },
    { title: 'Fix time zone handling', type: 'bug', priority: 'high', description: 'Timestamp conversions incorrect across time zones. Daylight saving time transitions causing data gaps.' },
  ]
};

// Helper functions
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomDate(daysBack) {
  const date = new Date();
  date.setDate(date.getDate() - getRandomInt(0, daysBack));
  date.setHours(getRandomInt(8, 18), getRandomInt(0, 59), 0, 0);
  return date.toISOString();
}

function getRandomFutureDate(daysAhead) {
  const date = new Date();
  date.setDate(date.getDate() + getRandomInt(-10, daysAhead));
  return date.toISOString().split('T')[0];
}

async function seedData() {
  console.log('🌱 Starting demo data seeding...\n');

  try {
    // 1. Create users
    console.log('👥 Creating 20 users (3 managers, 17 engineers)...');
    const createdUsers = [];
    for (const user of users) {
      const result = await pool.query(
        `INSERT INTO users (name, email, role, provider, provider_id, avatar_url, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
         ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name
         RETURNING id, name, email, role`,
        [user.name, user.email, user.role, user.provider, user.provider_id, user.avatar_url]
      );
      createdUsers.push(result.rows[0]);
      console.log(`   ✓ ${user.name} (${user.role})`);
    }
    console.log(`✅ Created ${createdUsers.length} users\n`);

    // Separate managers and engineers
    const managers = createdUsers.filter(u => u.role === 'manager');
    const engineers = createdUsers.filter(u => u.role === 'developer');

    // 2. Create projects
    console.log('📁 Creating 6 projects...');
    const createdProjects = [];
    for (const project of projects) {
      const owner = getRandomElement(managers);
      const result = await pool.query(
        `INSERT INTO projects (name, description, owner_id, created_at, updated_at)
         VALUES ($1, $2, $3, NOW(), NOW())
         RETURNING id, name`,
        [project.name, project.description, owner.id]
      );
      createdProjects.push({ ...result.rows[0], domain: project.domain });
      console.log(`   ✓ ${project.name}`);
    }
    console.log(`✅ Created ${createdProjects.length} projects\n`);

    // 3. Create issues for each project
    console.log('🎯 Creating 20+ issues per project...');
    let totalIssues = 0;
    const statuses = ['open', 'in_progress', 'resolved', 'closed'];
    const priorities = ['low', 'medium', 'high', 'critical'];
    const types = ['bug', 'feature', 'task', 'improvement'];

    for (const project of createdProjects) {
      const templates = issueTemplates[project.domain];
      const numIssues = getRandomInt(20, 25);

      console.log(`\n   📊 ${project.name}: Creating ${numIssues} issues...`);

      for (let i = 0; i < numIssues; i++) {
        const template = getRandomElement(templates);
        const reporter = getRandomElement([...managers, ...engineers]);
        const assignee = Math.random() > 0.2 ? getRandomElement(engineers) : null;
        const status = getRandomElement(statuses);
        const hasDueDate = Math.random() > 0.3;
        const dueDate = hasDueDate ? getRandomFutureDate(30) : null;

        const result = await pool.query(
          `INSERT INTO issues (
            project_id, title, description, type, priority, status,
            reporter_id, assignee_id, due_date, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
          RETURNING id, title`,
          [
            project.id,
            template.title,
            template.description,
            template.type,
            template.priority,
            status,
            reporter.id,
            assignee ? assignee.id : null,
            dueDate,
            getRandomDate(60),
            getRandomDate(30)
          ]
        );

        totalIssues++;

        // Add 1-3 comments to some issues
        if (Math.random() > 0.5) {
          const numComments = getRandomInt(1, 3);
          for (let j = 0; j < numComments; j++) {
            const commenter = getRandomElement([...managers, ...engineers]);
            const comments = [
              'I\'ve started working on this. Will update soon.',
              'This is more complex than initially thought. Need additional resources.',
              'Fixed in the latest commit. Ready for review.',
              'Tested locally and works as expected. Deploying to staging.',
              'Found a related issue that we should address together.',
              'This is blocked by another task. Moving to backlog.',
              'Great work! Approved and merged.',
              'Can you provide more details about the requirements?',
              'I\'ve assigned this to the sprint. High priority.',
              'Adding design mockups to the description.'
            ];

            await pool.query(
              `INSERT INTO comments (issue_id, user_id, content, created_at, updated_at)
               VALUES ($1, $2, $3, $4, $5)`,
              [
                result.rows[0].id,
                commenter.id,
                getRandomElement(comments),
                getRandomDate(25),
                getRandomDate(20)
              ]
            );
          }
        }
      }
      console.log(`   ✅ Created ${numIssues} issues for ${project.name}`);
    }
    console.log(`\n✅ Created ${totalIssues} total issues\n`);

    // Summary
    console.log('═══════════════════════════════════════');
    console.log('🎉 Demo Data Seeding Complete!');
    console.log('═══════════════════════════════════════');
    console.log(`👥 Users: ${createdUsers.length} (${managers.length} managers, ${engineers.length} engineers)`);
    console.log(`📁 Projects: ${createdProjects.length}`);
    console.log(`🎯 Issues: ${totalIssues} (avg ${Math.round(totalIssues / createdProjects.length)} per project)`);
    console.log('═══════════════════════════════════════\n');

    console.log('📊 You can now:');
    console.log('   1. Login to http://localhost:3000');
    console.log('   2. Browse projects and issues');
    console.log('   3. View analytics at /admin/analytics');
    console.log('   4. See activity logs being generated\n');

  } catch (error) {
    console.error('❌ Error seeding data:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run seeding
seedData()
  .then(() => {
    console.log('✅ Seeding completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  });
