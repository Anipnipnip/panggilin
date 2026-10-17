CREATE TABLE IF NOT EXISTS webhooks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    endpoint_id VARCHAR(64) NOT NULL DEFAULT 'default',
    method VARCHAR(10) NOT NULL,
    path TEXT NOT NULL,
    headers JSONB NOT NULL DEFAULT '{}'::jsonb,
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    remote_addr VARCHAR(64) NOT NULL,
    content_length BIGINT NOT NULL DEFAULT 0,
    response_status INT NOT NULL DEFAULT 200,
    response_body TEXT NOT NULL DEFAULT '{"status":"received"}',
    duration_ms INT NOT NULL DEFAULT 0,
    received_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_webhooks_received_at ON webhooks (received_at DESC);
CREATE INDEX IF NOT EXISTS idx_webhooks_method ON webhooks (method);
CREATE INDEX IF NOT EXISTS idx_webhooks_response_status ON webhooks (response_status);
CREATE INDEX IF NOT EXISTS idx_webhooks_endpoint_id ON webhooks (endpoint_id);
