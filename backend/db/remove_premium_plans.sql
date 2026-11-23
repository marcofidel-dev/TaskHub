-- Elimina todo lo relacionado con planes premium / suscripciones.
BEGIN;
DROP TABLE IF EXISTS feature_access;
DROP TABLE IF EXISTS subscription_transaction;
DROP TABLE IF EXISTS user_plan;
ALTER TABLE users DROP COLUMN IF EXISTS subscription_tier;
ALTER TABLE users DROP COLUMN IF EXISTS stripe_customer_id;
ALTER TABLE users DROP COLUMN IF EXISTS stripe_subscription_id;
COMMIT;
