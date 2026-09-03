-- ==============================================================================
-- CareNavigator seed data (idempotent — safe for `supabase db reset` and
-- `supabase db push --include-seed`). The canonical schema + baseline seed
-- live in supabase/migrations/20260903000000_init_carenavigator.sql, which is
-- already applied to the linked project (see `bunx supabase migration list`).
-- This file mirrors that seed with ON CONFLICT DO NOTHING so local resets
-- reproduce the same Sarah Jenkins (#MH-88291) demo dataset.
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
