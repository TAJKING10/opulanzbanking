/**
 * Migration: Create Appointments Table
 *
 * This table stores appointment bookings from Calendly integration.
 * Can be used to track client meetings and onboarding calls.
 */

-- Create appointments table
CREATE TABLE IF NOT EXISTS appointments (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    calendly_id VARCHAR(255) UNIQUE,
    calendly_event_uri TEXT,
    meeting_type VARCHAR(100),
    status VARCHAR(50) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'completed', 'cancelled', 'no_show')),
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    timezone VARCHAR(100),
    location TEXT,
    notes TEXT,
    cancel_reason TEXT,
    cancelled_at TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_appointments_email ON appointments(email);
CREATE INDEX IF NOT EXISTS idx_appointments_calendly_id ON appointments(calendly_id);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_start_time ON appointments(start_time);
CREATE INDEX IF NOT EXISTS idx_appointments_created_at ON appointments(created_at DESC);

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_appointments_updated_at ON appointments;
CREATE TRIGGER update_appointments_updated_at
    BEFORE UPDATE ON appointments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data (optional - comment out if not needed)
INSERT INTO appointments (full_name, email, phone, calendly_id, meeting_type, status, start_time, end_time, timezone) VALUES
    ('Toufic Jandah', 'toufic@advensys-trading.lv', '+352-123-456-789', 'evt_calendly_001', 'Account Opening Consultation', 'scheduled', '2025-11-05 10:00:00', '2025-11-05 10:30:00', 'Europe/Luxembourg'),
    ('John Doe', 'john.doe@example.com', '+33-1-23-45-67-89', 'evt_calendly_002', 'Investment Advisory', 'completed', '2025-11-01 14:00:00', '2025-11-01 14:45:00', 'Europe/Paris'),
    ('Jane Smith', 'jane.smith@example.com', '+352-987-654-321', 'evt_calendly_003', 'Tax Advisory', 'confirmed', '2025-11-06 15:00:00', '2025-11-06 15:30:00', 'Europe/Luxembourg')
ON CONFLICT (calendly_id) DO NOTHING;
