import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';
import { Client } from 'pg';

interface CognitoPostConfirmationEvent {
  request: { userAttributes: { sub: string; email: string } };
  [key: string]: unknown;
}

interface DbSecret {
  username: string;
  password: string;
  host: string;
  port: number;
  dbname: string;
}

const secretsClient = new SecretsManagerClient({});

/**
 * Fetches database credentials from Secrets Manager.
 */
async function getDbCredentials(): Promise<DbSecret> {
  const secretArn = process.env.RDS_SECRET_ARN;
  if (!secretArn) {
    throw new Error('RDS_SECRET_ARN environment variable is not set');
  }

  const response = await secretsClient.send(new GetSecretValueCommand({ SecretId: secretArn }));

  if (!response.SecretString) {
    throw new Error('Secret value is empty');
  }

  return JSON.parse(response.SecretString) as DbSecret;
}

/**
 * Cognito Post-Confirmation trigger.
 *
 * Creates a user record, a personal organisation, and the owner membership
 * in the RDS PostgreSQL database. All inserts use ON CONFLICT DO NOTHING
 * for idempotency (Cognito may retry the trigger).
 *
 * Requires the `pg` package to be available in the Lambda layer/bundle.
 */
export const handler = async (event: CognitoPostConfirmationEvent) => {
  const { sub, email } = event.request.userAttributes;
  console.log(`Post-confirmation: provisioning user ${email} (sub: ${sub})`);

  let client: Client | undefined;

  try {
    const creds = await getDbCredentials();

    client = new Client({
      host: creds.host,
      port: creds.port,
      database: creds.dbname,
      user: creds.username,
      password: creds.password,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 5000,
    });

    await client.connect();

    // Use a single transaction for atomicity
    await client.query('BEGIN');

    // 1. Insert user record
    await client.query(
      `INSERT INTO users (id, email, created_at, updated_at)
       VALUES ($1, $2, NOW(), NOW())
       ON CONFLICT (id) DO NOTHING`,
      [sub, email]
    );

    // 2. Create personal organisation
    const orgId = `org_${sub}`;
    await client.query(
      `INSERT INTO organisations (id, name, owner_id, personal, created_at, updated_at)
       VALUES ($1, $2, $3, true, NOW(), NOW())
       ON CONFLICT (id) DO NOTHING`,
      [orgId, `${email}'s Org`, sub]
    );

    // 3. Create owner membership
    await client.query(
      `INSERT INTO memberships (user_id, organisation_id, role, created_at, updated_at)
       VALUES ($1, $2, 'owner', NOW(), NOW())
       ON CONFLICT (user_id, organisation_id) DO NOTHING`,
      [sub, orgId]
    );

    await client.query('COMMIT');

    console.log(`Post-confirmation: successfully provisioned user ${email}, org ${orgId}`);
  } catch (error) {
    if (client) {
      try {
        await client.query('ROLLBACK');
      } catch {
        // Swallow rollback errors; the original error is more important
      }
    }
    console.error('Post-confirmation: failed to provision user', error);
    throw error;
  } finally {
    if (client) {
      try {
        await client.end();
      } catch {
        // Swallow disconnect errors
      }
    }
  }

  return event;
};
