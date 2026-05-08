-- TrackFlow TMS — Seed Data (Demo)
-- Run AFTER schema.sql
-- Uses hardcoded UUIDs for predictable demo data

-- Company
insert into public.companies (id, name, type, mc_number, dot_number, phone, email, city, state)
values ('00000000-0000-0000-0000-000000000001', 'TrackFlow Logistics', 'broker',
        'MC-123456', 'DOT-789012', '404-555-0100', 'ops@trackflow.com', 'Atlanta', 'GA')
on conflict (id) do nothing;

-- Customers
insert into public.customers (id, company_id, name, contact, email, phone, city, state) values
('10000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000001','Peach State Grocers','Tom Bradley','tbradley@psgrocers.com','404-555-0201','Atlanta','GA'),
('10000000-0000-0000-0000-000000000002','00000000-0000-0000-0000-000000000001','Southern Auto Parts','Maria Chen','mchen@southernauto.com','678-555-0202','Marietta','GA'),
('10000000-0000-0000-0000-000000000003','00000000-0000-0000-0000-000000000001','Delta Steel Inc','James Wilson','jwilson@deltasteel.com','770-555-0203','Smyrna','GA'),
('10000000-0000-0000-0000-000000000004','00000000-0000-0000-0000-000000000001','Blue Ridge Retail','Sarah Johnson','sjohnson@blueridge.com','706-555-0204','Dalton','GA'),
('10000000-0000-0000-0000-000000000005','00000000-0000-0000-0000-000000000001','Coastal Distributors','Mike Thompson','mthompson@coastaldist.com','912-555-0205','Savannah','GA')
on conflict (id) do nothing;

-- Carriers
insert into public.carriers (id, company_id, name, mc_number, dot_number, contact, email, phone, is_active) values
('20000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000001','Eagle Transport LLC','MC-654321','DOT-111222','Bob Eagle','bob@eagletransport.com','404-555-0301',true),
('20000000-0000-0000-0000-000000000002','00000000-0000-0000-0000-000000000001','Swift Carriers Inc','MC-789456','DOT-333444','Amy Swift','amy@swiftcarriers.com','678-555-0302',true),
('20000000-0000-0000-0000-000000000003','00000000-0000-0000-0000-000000000001','Blue Ridge Hauling','MC-321654','DOT-555666','Carlos Ridge','carlos@blueridgehauling.com','770-555-0303',true),
('20000000-0000-0000-0000-000000000004','00000000-0000-0000-0000-000000000001','Southern Star Freight','MC-456123','DOT-777888','Lisa Star','lisa@southernstar.com','706-555-0304',true),
('20000000-0000-0000-0000-000000000005','00000000-0000-0000-0000-000000000001','Peach State Trucking','MC-159753','DOT-999000','David Peach','david@peachtrucking.com','912-555-0305',true)
on conflict (id) do nothing;

-- Drivers
insert into public.drivers (id, carrier_id, full_name, phone, email) values
('30000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000001','John Smith','404-555-0401','jsmith@eagletransport.com'),
('30000000-0000-0000-0000-000000000002','20000000-0000-0000-0000-000000000001','Mike Johnson','404-555-0402','mjohnson@eagletransport.com'),
('30000000-0000-0000-0000-000000000003','20000000-0000-0000-0000-000000000002','Carlos Rivera','678-555-0403','crivera@swiftcarriers.com'),
('30000000-0000-0000-0000-000000000004','20000000-0000-0000-0000-000000000002','Tony Williams','678-555-0404','twilliams@swiftcarriers.com'),
('30000000-0000-0000-0000-000000000005','20000000-0000-0000-0000-000000000003','James Davis','770-555-0405','jdavis@blueridgehauling.com'),
('30000000-0000-0000-0000-000000000006','20000000-0000-0000-0000-000000000003','Robert Brown','770-555-0406','rbrown@blueridgehauling.com'),
('30000000-0000-0000-0000-000000000007','20000000-0000-0000-0000-000000000004','Kevin Martinez','706-555-0407','kmartinez@southernstar.com'),
('30000000-0000-0000-0000-000000000008','20000000-0000-0000-0000-000000000004','Brian Lee','706-555-0408','blee@southernstar.com'),
('30000000-0000-0000-0000-000000000009','20000000-0000-0000-0000-000000000005','Alex Garcia','912-555-0409','agarcia@peachtrucking.com'),
('30000000-0000-0000-0000-000000000010','20000000-0000-0000-0000-000000000005','Steve White','912-555-0410','swhite@peachtrucking.com')
on conflict (id) do nothing;

-- Loads (mix of statuses)
insert into public.loads (
  id, load_number, company_id, customer_id, carrier_id, driver_id,
  pickup_city, pickup_state, pickup_lat, pickup_lng, pickup_scheduled,
  delivery_city, delivery_state, delivery_lat, delivery_lng, delivery_scheduled,
  commodity, weight_lbs, trailer_type, rate_usd, carrier_pay_usd,
  status, risk_level
) values
-- In Transit
('40000000-0000-0000-0000-000000000001','TF-2024-0001','00000000-0000-0000-0000-000000000001',
 '10000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000001','30000000-0000-0000-0000-000000000001',
 'Atlanta','GA',33.7490,-84.3880,now() - interval '4 hours',
 'Charlotte','NC',35.2271,-80.8431,now() + interval '2 hours',
 'Frozen Groceries',42000,'Reefer',2800,2100,'in_transit','on_time'),

-- At Risk
('40000000-0000-0000-0000-000000000002','TF-2024-0002','00000000-0000-0000-0000-000000000001',
 '10000000-0000-0000-0000-000000000002','20000000-0000-0000-0000-000000000002','30000000-0000-0000-0000-000000000003',
 'Marietta','GA',33.9526,-84.5499,now() - interval '6 hours',
 'Nashville','TN',36.1627,-86.7816,now() - interval '1 hour',
 'Auto Parts',38000,'Dry Van',3200,2400,'in_transit','at_risk'),

-- Delivered
('40000000-0000-0000-0000-000000000003','TF-2024-0003','00000000-0000-0000-0000-000000000001',
 '10000000-0000-0000-0000-000000000003','20000000-0000-0000-0000-000000000003','30000000-0000-0000-0000-000000000005',
 'Smyrna','GA',33.8840,-84.5144,now() - interval '12 hours',
 'Birmingham','AL',33.5186,-86.8104,now() - interval '3 hours',
 'Steel Coils',44000,'Flatbed',2500,1900,'delivered','on_time'),

-- Booked
('40000000-0000-0000-0000-000000000004','TF-2024-0004','00000000-0000-0000-0000-000000000001',
 '10000000-0000-0000-0000-000000000004','20000000-0000-0000-0000-000000000004','30000000-0000-0000-0000-000000000007',
 'Dalton','GA',34.7698,-84.9702,now() + interval '3 hours',
 'Knoxville','TN',35.9606,-83.9207,now() + interval '8 hours',
 'Carpet Rolls',36000,'Dry Van',1800,1400,'booked','on_time'),

-- Dispatched
('40000000-0000-0000-0000-000000000005','TF-2024-0005','00000000-0000-0000-0000-000000000001',
 '10000000-0000-0000-0000-000000000005','20000000-0000-0000-0000-000000000005','30000000-0000-0000-0000-000000000009',
 'Savannah','GA',32.0835,-81.0998,now() + interval '1 hour',
 'Jacksonville','FL',30.3322,-81.6557,now() + interval '5 hours',
 'Consumer Goods',40000,'Dry Van',1600,1200,'dispatched','on_time'),

-- Exception
('40000000-0000-0000-0000-000000000006','TF-2024-0006','00000000-0000-0000-0000-000000000001',
 '10000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000001','30000000-0000-0000-0000-000000000002',
 'Atlanta','GA',33.7490,-84.3880,now() - interval '8 hours',
 'Memphis','TN',35.1495,-90.0490,now() - interval '2 hours',
 'Electronics',28000,'Dry Van',3800,2900,'exception','late'),

-- POD Uploaded
('40000000-0000-0000-0000-000000000007','TF-2024-0007','00000000-0000-0000-0000-000000000001',
 '10000000-0000-0000-0000-000000000002','20000000-0000-0000-0000-000000000002','30000000-0000-0000-0000-000000000004',
 'Marietta','GA',33.9526,-84.5499,now() - interval '16 hours',
 'Columbia','SC',34.0007,-81.0348,now() - interval '6 hours',
 'Auto Parts',35000,'Dry Van',2200,1700,'pod_uploaded','on_time'),

-- Loaded
('40000000-0000-0000-0000-000000000008','TF-2024-0008','00000000-0000-0000-0000-000000000001',
 '10000000-0000-0000-0000-000000000003','20000000-0000-0000-0000-000000000003','30000000-0000-0000-0000-000000000006',
 'Smyrna','GA',33.8840,-84.5144,now() - interval '2 hours',
 'Greenville','SC',34.8526,-82.3940,now() + interval '4 hours',
 'Steel Sheet',43000,'Flatbed',2700,2000,'loaded','on_time'),

-- At Pickup
('40000000-0000-0000-0000-000000000009','TF-2024-0009','00000000-0000-0000-0000-000000000001',
 '10000000-0000-0000-0000-000000000004','20000000-0000-0000-0000-000000000004','30000000-0000-0000-0000-000000000008',
 'Dalton','GA',34.7698,-84.9702,now() - interval '30 minutes',
 'Chattanooga','TN',35.0456,-85.3097,now() + interval '3 hours',
 'Carpet',34000,'Dry Van',1500,1150,'at_pickup','on_time'),

-- Completed
('40000000-0000-0000-0000-000000000010','TF-2024-0010','00000000-0000-0000-0000-000000000001',
 '10000000-0000-0000-0000-000000000005','20000000-0000-0000-0000-000000000005','30000000-0000-0000-0000-000000000010',
 'Savannah','GA',32.0835,-81.0998,now() - interval '2 days',
 'Orlando','FL',28.5384,-81.3789,now() - interval '1 day',
 'Consumer Goods',39000,'Dry Van',2400,1800,'completed','on_time')
on conflict (id) do nothing;

-- Fake location pings for active load TF-2024-0001 (Atlanta → Charlotte route)
insert into public.tracking_sessions (id, load_id, driver_id, consent_at, status) values
('50000000-0000-0000-0000-000000000001',
 '40000000-0000-0000-0000-000000000001',
 '30000000-0000-0000-0000-000000000001',
 now() - interval '4 hours', 'active')
on conflict (id) do nothing;

insert into public.location_pings (session_id, load_id, lat, lng, speed_mph, city, state, created_at) values
('50000000-0000-0000-0000-000000000001','40000000-0000-0000-0000-000000000001',33.7490,-84.3880,0,'Atlanta','GA',now()-interval '4 hours'),
('50000000-0000-0000-0000-000000000001','40000000-0000-0000-0000-000000000001',33.8500,-84.2000,55,'Norcross','GA',now()-interval '3 hours 30 minutes'),
('50000000-0000-0000-0000-000000000001','40000000-0000-0000-0000-000000000001',34.0100,-83.9500,62,'Gainesville','GA',now()-interval '3 hours'),
('50000000-0000-0000-0000-000000000001','40000000-0000-0000-0000-000000000001',34.2800,-83.6800,68,'Cornelia','GA',now()-interval '2 hours 30 minutes'),
('50000000-0000-0000-0000-000000000001','40000000-0000-0000-0000-000000000001',34.5500,-83.4000,65,'Clayton','GA',now()-interval '2 hours'),
('50000000-0000-0000-0000-000000000001','40000000-0000-0000-0000-000000000001',34.8800,-82.9500,70,'Brevard','NC',now()-interval '1 hour 30 minutes'),
('50000000-0000-0000-0000-000000000001','40000000-0000-0000-0000-000000000001',35.1000,-82.5000,72,'Hendersonville','NC',now()-interval '1 hour'),
('50000000-0000-0000-0000-000000000001','40000000-0000-0000-0000-000000000001',35.2271,-80.8431,45,'Charlotte','NC',now()-interval '30 minutes')
on conflict do nothing;

-- Geofences for active load
insert into public.geofences (load_id, type, lat, lng, radius_m) values
('40000000-0000-0000-0000-000000000001','pickup',33.7490,-84.3880,500),
('40000000-0000-0000-0000-000000000001','delivery',35.2271,-80.8431,500)
on conflict do nothing;
