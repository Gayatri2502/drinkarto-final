ALTER TABLE "Product" ADD CONSTRAINT "stock_non_negative" CHECK ("physical" >= 0 AND "reserved" >= 0 AND "damaged" >= 0 AND "physical" >= "reserved" + "damaged");
ALTER TABLE "Product" ADD CONSTRAINT "product_price_positive" CHECK ("unitPrice" > 0);
ALTER TABLE "Retailer" ADD CONSTRAINT "credit_non_negative" CHECK ("creditLimit" >= 0 AND "outstanding" >= 0);
ALTER TABLE "OrderItem" ADD CONSTRAINT "order_quantity_positive" CHECK ("quantity" > 0);
ALTER TABLE "Member" ADD CONSTRAINT "known_role" CHECK ("role" IN ('OWNER','MANAGER','SALES','WAREHOUSE','ACCOUNTS'));
ALTER TABLE "Order" ADD CONSTRAINT "known_status" CHECK ("status" IN ('SUBMITTED','PENDING_APPROVAL','CANCELLED'));
CREATE FUNCTION reject_audit_mutation() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'Audit logs are append only'; END; $$;
CREATE TRIGGER audit_append_only BEFORE UPDATE OR DELETE ON "AuditLog" FOR EACH ROW EXECUTE FUNCTION reject_audit_mutation();
