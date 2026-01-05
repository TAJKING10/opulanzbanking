-- Create tax_advisory_bookings table for storing complete booking information

CREATE TABLE IF NOT EXISTS tax_advisory_bookings (
    id SERIAL PRIMARY KEY,
    confirmation_number VARCHAR(100) UNIQUE NOT NULL,
    type VARCHAR(50) DEFAULT 'tax_advisory' CHECK (type IN ('tax_advisory')),
    status VARCHAR(50) DEFAULT 'confirmed' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),

    -- Customer Information
    customer_info JSONB NOT NULL DEFAULT '{}',
    -- Example: { "firstName": "John", "lastName": "Doe", "email": "john@example.com", "phone": "+352..." }

    -- Service Information
    service JSONB NOT NULL DEFAULT '{}',
    -- Example: { "id": "tax-return-preparation", "title": "Tax Return Preparation", "price": 299 }

    -- Appointment Information (from Calendly)
    appointment JSONB DEFAULT '{}',
    -- Example: { "date": "2025-11-05T10:00:00Z", "time": "10:00 AM", "calendlyEventUrl": "...", "calendlyInviteeUrl": "..." }

    -- Payment Information (from PayPal)
    payment JSONB DEFAULT '{}',
    -- Example: { "method": "paypal", "orderId": "...", "status": "COMPLETED", "payer": {...} }

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    cancelled_at TIMESTAMP
);

-- Create index on confirmation_number for quick lookups
CREATE INDEX IF NOT EXISTS idx_tax_advisory_bookings_confirmation_number
ON tax_advisory_bookings(confirmation_number);

-- Create index on customer email (extracted from JSONB)
CREATE INDEX IF NOT EXISTS idx_tax_advisory_bookings_customer_email
ON tax_advisory_bookings((customer_info->>'email'));

-- Create index on status
CREATE INDEX IF NOT EXISTS idx_tax_advisory_bookings_status
ON tax_advisory_bookings(status);

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_tax_advisory_bookings_created_at
ON tax_advisory_bookings(created_at DESC);

-- Create index on service type (extracted from JSONB)
CREATE INDEX IF NOT EXISTS idx_tax_advisory_bookings_service_id
ON tax_advisory_bookings((service->>'id'));

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_tax_advisory_bookings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_tax_advisory_bookings_updated_at
    BEFORE UPDATE ON tax_advisory_bookings
    FOR EACH ROW
    EXECUTE FUNCTION update_tax_advisory_bookings_updated_at();

-- Insert sample data for testing
-- This can be removed in production
INSERT INTO tax_advisory_bookings (
    confirmation_number,
    type,
    status,
    customer_info,
    service,
    appointment,
    payment
) VALUES (
    'TAX-SAMPLE-001',
    'tax_advisory',
    'confirmed',
    '{"firstName": "John", "lastName": "Doe", "email": "john.doe@example.com", "phone": "+352 123 456 789"}',
    '{"id": "personal-tax-advisory", "title": "Personal Tax Advisory", "price": 100}',
    '{"date": "2025-11-10T14:00:00Z", "time": "2:00 PM", "calendlyEventUrl": "https://calendly.com/example", "calendlyInviteeUrl": "https://calendly.com/invitee/example"}',
    '{"method": "paypal", "orderId": "ORDER-123456", "status": "COMPLETED", "payer": {"email": "john.doe@example.com"}}'
) ON CONFLICT (confirmation_number) DO NOTHING;

COMMENT ON TABLE tax_advisory_bookings IS 'Stores complete tax advisory service bookings with customer info, service details, appointment scheduling, and payment information';
COMMENT ON COLUMN tax_advisory_bookings.confirmation_number IS 'Unique confirmation number for the booking (e.g., TAX-ABC123)';
COMMENT ON COLUMN tax_advisory_bookings.customer_info IS 'Customer contact information (firstName, lastName, email, phone)';
COMMENT ON COLUMN tax_advisory_bookings.service IS 'Selected tax advisory service details (id, title, price)';
COMMENT ON COLUMN tax_advisory_bookings.appointment IS 'Calendly appointment details (date, time, urls)';
COMMENT ON COLUMN tax_advisory_bookings.payment IS 'PayPal payment details (method, orderId, status, payer)';
