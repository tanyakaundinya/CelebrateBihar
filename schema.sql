-- Celebrate Bihar Database Schema (PostgreSQL / Supabase)
-- Execute this script in your Supabase SQL Editor or PostgreSQL Database

-- 1. Bookings Table
CREATE TABLE IF NOT EXISTS bookings (
  id VARCHAR(64) PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  customer_name VARCHAR(255) NOT NULL,
  phone_number VARCHAR(32) NOT NULL,
  alternate_phone VARCHAR(32),
  email VARCHAR(255),
  district VARCHAR(100) NOT NULL,
  address TEXT NOT NULL,
  landmark TEXT,
  pincode VARCHAR(20),
  service_category VARCHAR(100),
  service_name VARCHAR(255) NOT NULL,
  appliance_detail TEXT NOT NULL,
  unit_count INT NOT NULL DEFAULT 1,
  slot VARCHAR(255) NOT NULL,
  special_notes TEXT,
  advance_fee NUMERIC(10, 2) NOT NULL DEFAULT 99.00,
  payment_status VARCHAR(64) NOT NULL DEFAULT 'PAID_ADVANCE_99',
  payee_upi VARCHAR(255) NOT NULL DEFAULT '2dhirajkumar4726@okhdfcbank',
  payee_name VARCHAR(255) NOT NULL DEFAULT 'Dhiraj Kumar',
  payer_name VARCHAR(255) NOT NULL,
  payer_upi_id VARCHAR(255),
  payment_app_used VARCHAR(100) NOT NULL DEFAULT 'Google Pay',
  utr_number VARCHAR(100) NOT NULL,
  payment_screenshot TEXT,
  payment_screenshot_name VARCHAR(255),
  payment_screenshot_size VARCHAR(64),
  status VARCHAR(64) NOT NULL DEFAULT 'NEW_PENDING_DISPATCH',
  assigned_technician JSONB,
  admin_notes TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexing for fast search and filter queries
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_district ON bookings(district);
CREATE INDEX IF NOT EXISTS idx_bookings_created_at ON bookings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bookings_phone ON bookings(phone_number);
CREATE INDEX IF NOT EXISTS idx_bookings_utr ON bookings(utr_number);

-- 2. Consultations Table (Institutional & Bank Setups)
CREATE TABLE IF NOT EXISTS consultations (
  id VARCHAR(64) PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  customer_name VARCHAR(255) NOT NULL,
  phone_number VARCHAR(32) NOT NULL,
  org_name VARCHAR(255),
  facility_type VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  district VARCHAR(100) NOT NULL,
  address TEXT NOT NULL,
  category VARCHAR(255) NOT NULL,
  scale VARCHAR(255) NOT NULL,
  preferred_slot VARCHAR(255) NOT NULL,
  project_overview TEXT NOT NULL,
  status VARCHAR(64) NOT NULL DEFAULT 'NEW',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_consultations_created_at ON consultations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_consultations_district ON consultations(district);
