-- ==============================================================================
-- CareNavigator: Memorial Health System Clinical Database Schema (PostgreSQL / Supabase)
-- Modeled according to US Core FHIR (Fast Healthcare Interoperability Resources)
-- ==============================================================================

-- 1. Patients Table
CREATE TABLE IF NOT EXISTS public.patients (
    id TEXT PRIMARY KEY,
    mrn TEXT UNIQUE NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    dob DATE NOT NULL,
    gender TEXT,
    primary_doctor TEXT NOT NULL,
    insurance_provider TEXT NOT NULL,
    accessibility_mobility TEXT DEFAULT 'Wheelchair Step-Free Ramp & Wide Corridors',
    accessibility_sensory TEXT DEFAULT 'Low Sensory Stimulation & Quiet Waiting Room',
    accessibility_communication TEXT DEFAULT 'Screen Reader & Audible Verification Enabled',
    allergies TEXT[] DEFAULT ARRAY['Penicillin (Severe)', 'Latex (Mild)'],
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. Practitioners & Accessible Clinics
CREATE TABLE IF NOT EXISTS public.practitioners (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    title TEXT NOT NULL,
    specialty TEXT NOT NULL,
    facility_name TEXT NOT NULL,
    facility_address TEXT NOT NULL,
    distance TEXT NOT NULL,
    accommodations TEXT[] NOT NULL,
    available_slots TEXT[] NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. Patient Appointments
CREATE TABLE IF NOT EXISTS public.appointments (
    id TEXT PRIMARY KEY,
    patient_id TEXT REFERENCES public.patients(id) ON DELETE CASCADE,
    practitioner_id TEXT REFERENCES public.practitioners(id) ON DELETE SET NULL,
    doctor_name TEXT NOT NULL,
    facility_name TEXT NOT NULL,
    appointment_date TEXT NOT NULL,
    time_slot TEXT NOT NULL,
    status TEXT DEFAULT 'confirmed' NOT NULL,
    accommodation_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. Active Prescriptions (MedicationRequests)
CREATE TABLE IF NOT EXISTS public.prescriptions (
    id TEXT PRIMARY KEY,
    patient_id TEXT REFERENCES public.patients(id) ON DELETE CASCADE,
    medication_name TEXT NOT NULL,
    strength TEXT NOT NULL,
    rx_number TEXT UNIQUE NOT NULL,
    refills_remaining INT DEFAULT 1 NOT NULL,
    prescribed_by TEXT NOT NULL,
    pharmacy_name TEXT NOT NULL,
    copay TEXT NOT NULL,
    status TEXT DEFAULT 'active' NOT NULL,
    last_filled DATE,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 5. Pharmacy Refill Orders
CREATE TABLE IF NOT EXISTS public.refill_orders (
    id TEXT PRIMARY KEY,
    prescription_id TEXT REFERENCES public.prescriptions(id) ON DELETE CASCADE,
    patient_id TEXT REFERENCES public.patients(id) ON DELETE CASCADE,
    medication_name TEXT NOT NULL,
    dosage TEXT NOT NULL,
    pharmacy_id TEXT NOT NULL,
    pharmacy_name TEXT NOT NULL,
    status TEXT DEFAULT 'submitted' NOT NULL,
    ready_time TEXT NOT NULL,
    copay TEXT NOT NULL,
    requested_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 6. Clinical Triage Assessments
CREATE TABLE IF NOT EXISTS public.triage_assessments (
    id TEXT PRIMARY KEY,
    patient_id TEXT REFERENCES public.patients(id) ON DELETE CASCADE,
    symptoms TEXT NOT NULL,
    body_region TEXT DEFAULT 'Musculoskeletal',
    pain_level INT NOT NULL,
    urgency TEXT NOT NULL,
    recommended_specialty TEXT NOT NULL,
    clinical_advice TEXT NOT NULL,
    recommended_clinic TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 7. Patient Vitals History
CREATE TABLE IF NOT EXISTS public.patient_vitals (
    id TEXT PRIMARY KEY,
    patient_id TEXT REFERENCES public.patients(id) ON DELETE CASCADE,
    blood_pressure TEXT NOT NULL,
    heart_rate INT NOT NULL,
    oxygen_saturation INT NOT NULL,
    respiratory_rate INT NOT NULL,
    recorded_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.practitioners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.refill_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.triage_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_vitals ENABLE ROW LEVEL SECURITY;

-- Allow public reads and writes for the portal application
CREATE POLICY "Allow public read access to patients" ON public.patients FOR SELECT USING (true);
CREATE POLICY "Allow public update access to patients" ON public.patients FOR UPDATE USING (true);

CREATE POLICY "Allow public read access to practitioners" ON public.practitioners FOR SELECT USING (true);

CREATE POLICY "Allow public all access to appointments" ON public.appointments FOR ALL USING (true);
CREATE POLICY "Allow public all access to prescriptions" ON public.prescriptions FOR ALL USING (true);
CREATE POLICY "Allow public all access to refill_orders" ON public.refill_orders FOR ALL USING (true);
CREATE POLICY "Allow public all access to triage_assessments" ON public.triage_assessments FOR ALL USING (true);
CREATE POLICY "Allow public all access to patient_vitals" ON public.patient_vitals FOR ALL USING (true);

-- ==============================================================================
-- Seed Data: Sarah Jenkins (#MH-88291)
-- ==============================================================================

INSERT INTO public.patients (
    id, mrn, first_name, last_name, dob, gender, primary_doctor, insurance_provider,
    accessibility_mobility, accessibility_sensory, accessibility_communication, allergies
) VALUES (
    'pt-sarah-jenkins',
    '#MH-88291',
    'Sarah',
    'Jenkins',
    '1984-11-14',
    'Female',
    'Dr. Elena Chen, MD (Internal Medicine)',
    'BlueCross BlueShield PPO (#BC-994120)',
    'Wheelchair Step-Free Ramp & Wide Corridors',
    'Low Sensory Stimulation & Quiet Waiting Room',
    'Screen Reader & Audible Verification Enabled',
    ARRAY['Penicillin (Severe Anaphylaxis)', 'Latex (Mild Contact Dermatitis)']
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.practitioners (
    id, name, title, specialty, facility_name, facility_address, distance, accommodations, available_slots
) VALUES 
(
    'oakwood-rehab',
    'Dr. Marcus Vance, MD',
    'Board Certified Orthopedic Specialist',
    'Orthopedic Physical Therapy',
    'Memorial Pavilion & Physical Rehabilitation',
    '1200 Healthcare Way, Suite 4B, Metro',
    '0.8 miles away',
    ARRAY['Wheelchair Step-Free', 'Sensory Quiet Room', 'ASL Interpreter on site', 'Braille Signage'],
    ARRAY['Friday, Sep 18 at 10:30 AM', 'Friday, Sep 18 at 2:00 PM', 'Monday, Sep 21 at 9:00 AM']
),
(
    'westside-wellness',
    'Dr. Sarah Al-Mansoor, MD',
    'Chief of Physical Medicine',
    'Physical Medicine & Rehabilitation',
    'Westside Orthopedic & Joint Wellness Center',
    '840 West End Blvd, Building C',
    '2.4 miles away',
    ARRAY['Wheelchair Step-Free', 'Braille & Tactile Wayfinding', 'Quiet Examination Suites'],
    ARRAY['Monday, Sep 21 at 2:15 PM', 'Tuesday, Sep 22 at 11:00 AM']
),
(
    'memorial-pulmonary',
    'Dr. Aris Thorne, MD',
    'Pulmonologist & Respiratory Specialist',
    'Pulmonology & Asthma Care',
    'Memorial Respiratory Care Center',
    '1200 Healthcare Way, Suite 2A, Metro',
    '0.8 miles away',
    ARRAY['Wheelchair Step-Free', 'Oxygen Equipment Ready', 'Sensory Quiet Room'],
    ARRAY['Thursday, Sep 24 at 1:30 PM', 'Friday, Sep 25 at 10:00 AM']
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.appointments (
    id, patient_id, practitioner_id, doctor_name, facility_name, appointment_date, time_slot, status, accommodation_notes
) VALUES (
    'appt-init-01',
    'pt-sarah-jenkins',
    'oakwood-rehab',
    'Dr. Marcus Vance, MD',
    'Memorial Pavilion & Physical Rehabilitation',
    'Friday, Sep 18, 2026',
    '10:30 AM',
    'confirmed',
    'Wheelchair Step-Free Ramp, 36" Examination Table, Quiet Waiting Room'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.prescriptions (
    id, patient_id, medication_name, strength, rx_number, refills_remaining, prescribed_by, pharmacy_name, copay, status, last_filled
) VALUES 
(
    'rx-albuterol',
    'pt-sarah-jenkins',
    'Albuterol Sulfate HFA Inhalation Aerosol',
    '90 mcg/actuation (200 Inhalations)',
    'RX-99210-4A',
    1,
    'Dr. Elena Chen, MD',
    'Memorial Health Outpatient Pharmacy',
    '$15.00',
    'refill_due',
    '2026-08-01'
),
(
    'rx-prednisone',
    'pt-sarah-jenkins',
    'Prednisone Oral Tablets',
    '20 mg (30-day oral taper)',
    'RX-88410-2B',
    2,
    'Dr. Elena Chen, MD',
    'Memorial Health Outpatient Pharmacy',
    '$8.00',
    'active',
    '2026-08-15'
),
(
    'rx-lisinopril',
    'pt-sarah-jenkins',
    'Lisinopril Oral Tablets',
    '10 mg (90-day maintenance)',
    'RX-77192-1C',
    3,
    'Dr. Elena Chen, MD',
    'CVS Pharmacy #4102',
    '$10.00',
    'active',
    '2026-07-10'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.patient_vitals (
    id, patient_id, blood_pressure, heart_rate, oxygen_saturation, respiratory_rate
) VALUES (
    'vitals-latest',
    'pt-sarah-jenkins',
    '118/76 mmHg',
    72,
    99,
    16
) ON CONFLICT (id) DO NOTHING;
