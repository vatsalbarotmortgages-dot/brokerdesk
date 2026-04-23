-- Tasks table
create table if not exists tasks (
  id text primary key,
  deal_id text references deals(id) on delete set null,
  client_name text,
  client_email text,
  client_phone text,
  transaction_type text,
  notes text,
  due_date text,
  status text default 'To Do',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Signature settings table
create table if not exists settings (
  key text primary key,
  value text,
  updated_at timestamptz default now()
);

-- Email log table (track what emails were sent to avoid duplicates)
create table if not exists email_log (
  id uuid primary key default gen_random_uuid(),
  deal_id text,
  email_type text,
  recipient text,
  sent_at timestamptz default now()
);

-- Indexes
create index if not exists idx_tasks_status on tasks(status);
create index if not exists idx_tasks_due_date on tasks(due_date);
create index if not exists idx_tasks_deal_id on tasks(deal_id);
create index if not exists idx_email_log_deal_id on email_log(deal_id);
create index if not exists idx_email_log_type on email_log(email_type);

-- RLS
alter table tasks enable row level security;
alter table settings enable row level security;
alter table email_log enable row level security;

create policy "Allow all on tasks" on tasks for all using (true) with check (true);
create policy "Allow all on settings" on settings for all using (true) with check (true);
create policy "Allow all on email_log" on email_log for all using (true) with check (true);

-- Default signature settings
insert into settings (key, value) values
  ('sig_name', 'Vatsal Barot'),
  ('sig_title', 'Associate Mortgage Broker'),
  ('sig_email', 'vatsal@vatsalbarotmortgages.ca'),
  ('sig_phone', ''),
  ('sig_broker_license', '#30005730'),
  ('sig_brokerage_license', '#3000168'),
  ('sig_tagline', 'Personalized. Simplified. Trusted.')
on conflict (key) do nothing;
