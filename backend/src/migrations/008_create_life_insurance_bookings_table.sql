-- Create life_insurance_bookings table for storing complete booking information

CREATE TABLE IF NOT EXISTS life_insurance_bookings (
    id SERIAL PRIMARY KEY,
    confirmation_number VARCHAR(100) UNIQUE NOT NULL,
    type VARCHAR(50) DEFAULT 'life_insurance' CHECK (type IN ('life_insurance')),
    status VARCHAR(50) DEFAULT 'confirmed' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),

    -- Customer Information
    customer_info JSONB NOT NULL DEFAULT '{}',
    -- Example: { "firstName": "John", "lastName": "Doe", "email": "john@example.com", "phone": "+352..." }

    -- Service Information
    service JSONB NOT NULL DEFAULT '{}',
    -- Example: { "id": "whole-life-insurance", "title": "Whole Life Insurance", "price": 349 }

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
CREATE INDEX IF NOT EXISTS idx_life_insurance_bookings_confirmation_number
ON life_insurance_bookings(confirmation_number);

-- Create index on customer email (extracted from JSONB)
CREATE INDEX IF NOT EXISTS idx_life_insurance_bookings_customer_email
ON life_insurance_bookings((customer_info->>'email'));

-- Create index on status
CREATE INDEX IF NOT EXISTS idx_life_insurance_bookings_status
ON life_insurance_bookings(status);

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_life_insurance_bookings_created_at
ON life_insurance_bookings(created_at DESC);

-- Create index on service type (extracted from JSONB)
CREATE INDEX IF NOT EXISTS idx_life_insurance_bookings_service_id
ON life_insurance_bookings((service->>'id'));

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_life_insurance_bookings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_life_insurance_bookings_updated_at
    BEFORE UPDATE ON life_insurance_bookings
    FOR EACH ROW
    EXECUTE FUNCTION update_life_insurance_bookings_updated_at();

-- Insert sample data for testing
-- This can be removed in production
INSERT INTO life_insurance_bookings (
    confirmation_number,
    type,
    status,
    customer_info,
    service,
    appointment,
    payment
) VALUES (
    'LIFE-SAMPLE-001',
    'life_insurance',
    'confirmed',
    '{"firstName": "John", "lastName": "Doe", "email": "john.doe@example.com", "phone": "+352 123 456 789"}',
    '{"id": "whole-life-insurance", "title": "Whole Life Insurance", "price": 349}',
    '{"date": "2025-11-10T14:00:00Z", "time": "2:00 PM", "calendlyEventUrl": "https://calendly.com/example", "calendlyInviteeUrl": "https://calendly.com/invitee/example"}',
    '{"method": "paypal", "orderId": "ORDER-123456", "status": "COMPLETED", "payer": {"email": "john.doe@example.com"}}'
) ON CONFLICT (confirmation_number) DO NOTHING;

COMMENT ON TABLE life_insurance_bookings IS 'Stores complete life insurance consultation bookings with customer info, service details, appointment scheduling, and payment information';
COMMENT ON COLUMN life_insurance_bookings.confirmation_number IS 'Unique confirmation number for the booking (e.g., LIFE-ABC123)';
COMMENT ON COLUMN life_insurance_bookings.customer_info IS 'Customer contact information (firstName, lastName, email, phone)';
COMMENT ON COLUMN life_insurance_bookings.service IS 'Selected life insurance service details (id, title, price)';
COMMENT ON COLUMN life_insurance_bookings.appointment IS 'Calendly appointment details (date, time, urls)';
COMMENT ON COLUMN life_insurance_bookings.payment IS 'PayPal payment details (method, orderId, status, payer)';
