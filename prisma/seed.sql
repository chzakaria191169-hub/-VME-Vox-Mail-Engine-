-- Voxora Mail Engine (VME) Database Seed

-- 1. Create Default Workspace
INSERT INTO "Workspace" ("id", "name", "slug", "plan")
VALUES ('ws_voxora_main', 'Voxora Team', 'voxora-team', 'PRO')
ON CONFLICT ("slug") DO NOTHING;

-- 2. Create Default Rule
INSERT INTO "MailboxRule" ("id", "workspaceId", "name", "maxDailyEmails", "minDailyEmails", "replyDelayMin", "replyDelayMax", "sendOnWeekends", "businessHoursOnly")
VALUES ('rule_default', 'ws_voxora_main', 'Standard Warmup Rule', 20, 3, 15, 180, false, true)
ON CONFLICT ("id") DO NOTHING;

-- 3. Create 9 Domains
INSERT INTO "Domain" ("id", "workspaceId", "domain", "status", "spfValid", "dkimValid", "dmarcValid", "mxValid")
VALUES 
('dom_amplixa_work', 'ws_voxora_main', 'amplixa.work', 'ACTIVE', true, true, true, true),
('dom_axevia_work', 'ws_voxora_main', 'axevia.work', 'ACTIVE', true, true, true, true),
('dom_convertiq_work', 'ws_voxora_main', 'convertiq.work', 'ACTIVE', true, true, true, true),
('dom_elevore_work', 'ws_voxora_main', 'elevore.work', 'ACTIVE', true, true, true, true),
('dom_marketiva_work', 'ws_voxora_main', 'marketiva.work', 'ACTIVE', true, true, true, true),
('dom_vilora_work', 'ws_voxora_main', 'vilora.work', 'ACTIVE', true, true, true, true),
('dom_virixo_work', 'ws_voxora_main', 'virixo.work', 'ACTIVE', true, true, true, true),
('dom_virrexa_online', 'ws_voxora_main', 'virrexa.online', 'ACTIVE', true, true, true, true),
('dom_virrexa_work', 'ws_voxora_main', 'virrexa.work', 'ACTIVE', true, true, true, true)
ON CONFLICT ("id") DO NOTHING;

-- 4. Create 45 Mailboxes
INSERT INTO "Mailbox" ("workspaceId", "domainId", "email", "displayName", "provider", "status", "smtpHost", "smtpPort", "smtpUser", "smtpPassword", "smtpSecure", "imapHost", "imapPort", "imapUser", "imapPassword", "imapSecure", "warmupEnabled", "warmupDailyLimit")
VALUES
-- amplixa.work
('ws_voxora_main', 'dom_amplixa_work', 'ava@amplixa.work', 'Ava Bennett', 'ZOHO', 'ACTIVE', 'smtp.zoho.com', 465, 'ava@amplixa.work', 'Ch@zaki191169', true, 'imap.zoho.com', 993, 'ava@amplixa.work', 'Ch@zaki191169', true, true, 20),
('ws_voxora_main', 'dom_amplixa_work', 'chloe@amplixa.work', 'Chloe Miller', 'ZOHO', 'ACTIVE', 'smtp.zoho.com', 465, 'chloe@amplixa.work', 'Ch@zaki191169', true, 'imap.zoho.com', 993, 'chloe@amplixa.work', 'Ch@zaki191169', true, true, 20),
('ws_voxora_main', 'dom_amplixa_work', 'ella@amplixa.work', 'Ella Davis', 'ZOHO', 'ACTIVE', 'smtp.zoho.com', 465, 'ella@amplixa.work', 'Ch@zaki191169', true, 'imap.zoho.com', 993, 'ella@amplixa.work', 'Ch@zaki191169', true, true, 20),
('ws_voxora_main', 'dom_amplixa_work', 'grace@amplixa.work', 'Grace Wilson', 'ZOHO', 'ACTIVE', 'smtp.zoho.com', 465, 'grace@amplixa.work', 'Ch@zaki191169', true, 'imap.zoho.com', 993, 'grace@amplixa.work', 'Ch@zaki191169', true, true, 20),
('ws_voxora_main', 'dom_amplixa_work', 'lily@amplixa.work', 'Lily Taylor', 'ZOHO', 'ACTIVE', 'smtp.zoho.com', 465, 'lily@amplixa.work', 'Ch@zaki191169', true, 'imap.zoho.com', 993, 'lily@amplixa.work', 'Ch@zaki191169', true, true, 20),

-- axevia.work
('ws_voxora_main', 'dom_axevia_work', 'sophia@axevia.work', 'Sophia Reed', 'ZOHO', 'ACTIVE', 'smtp.zoho.com', 465, 'sophia@axevia.work', 'Ch@zaki191169', true, 'imap.zoho.com', 993, 'sophia@axevia.work', 'Ch@zaki191169', true, true, 20),
('ws_voxora_main', 'dom_axevia_work', 'emma@axevia.work', 'Emma Parker', 'ZOHO', 'ACTIVE', 'smtp.zoho.com', 465, 'emma@axevia.work', 'Ch@zaki191169', true, 'imap.zoho.com', 993, 'emma@axevia.work', 'Ch@zaki191169', true, true, 20),
('ws_voxora_main', 'dom_axevia_work', 'hannah@axevia.work', 'Hannah Scott', 'ZOHO', 'ACTIVE', 'smtp.zoho.com', 465, 'hannah@axevia.work', 'Ch@zaki191169', true, 'imap.zoho.com', 993, 'hannah@axevia.work', 'Ch@zaki191169', true, true, 20),
('ws_voxora_main', 'dom_axevia_work', 'olivia@axevia.work', 'Olivia White', 'ZOHO', 'ACTIVE', 'smtp.zoho.com', 465, 'olivia@axevia.work', 'Ch@zaki191169', true, 'imap.zoho.com', 993, 'olivia@axevia.work', 'Ch@zaki191169', true, true, 20),
('ws_voxora_main', 'dom_axevia_work', 'mia@axevia.work', 'Mia Harris', 'ZOHO', 'ACTIVE', 'smtp.zoho.com', 465, 'mia@axevia.work', 'Ch@zaki191169', true, 'imap.zoho.com', 993, 'mia@axevia.work', 'Ch@zaki191169', true, true, 20),

-- convertiq.work
('ws_voxora_main', 'dom_convertiq_work', 'maya@convertiq.work', 'Maya Jenkins', 'ZOHO', 'ACTIVE', 'smtp.zoho.com', 465, 'maya@convertiq.work', 'Ch@zaki191169', true, 'imap.zoho.com', 993, 'maya@convertiq.work', 'Ch@zaki191169', true, true, 20),
('ws_voxora_main', 'dom_convertiq_work', 'nora@convertiq.work', 'Nora Collins', 'ZOHO', 'ACTIVE', 'smtp.zoho.com', 465, 'nora@convertiq.work', 'Ch@zaki191169', true, 'imap.zoho.com', 993, 'nora@convertiq.work', 'Ch@zaki191169', true, true, 20),
('ws_voxora_main', 'dom_convertiq_work', 'zoe@convertiq.work', 'Zoe Brooks', 'ZOHO', 'ACTIVE', 'smtp.zoho.com', 465, 'zoe@convertiq.work', 'Ch@zaki191169', true, 'imap.zoho.com', 993, 'zoe@convertiq.work', 'Ch@zaki191169', true, true, 20),
('ws_voxora_main', 'dom_convertiq_work', 'isla@convertiq.work', 'Isla Morgan', 'ZOHO', 'ACTIVE', 'smtp.zoho.com', 465, 'isla@convertiq.work', 'Ch@zaki191169', true, 'imap.zoho.com', 993, 'isla@convertiq.work', 'Ch@zaki191169', true, true, 20),
('ws_voxora_main', 'dom_convertiq_work', 'claire@convertiq.work', 'Claire Foster', 'ZOHO', 'ACTIVE', 'smtp.zoho.com', 465, 'claire@convertiq.work', 'Ch@zaki191169', true, 'imap.zoho.com', 993, 'claire@convertiq.work', 'Ch@zaki191169', true, true, 20),

-- elevore.work
('ws_voxora_main', 'dom_elevore_work', 'emily@elevore.work', 'Emily Turner', 'ZOHO', 'ACTIVE', 'smtp.zoho.com', 465, 'emily@elevore.work', 'Ch@zaki191169', true, 'imap.zoho.com', 993, 'emily@elevore.work', 'Ch@zaki191169', true, true, 20),
('ws_voxora_main', 'dom_elevore_work', 'victoria@elevore.work', 'Victoria Hall', 'ZOHO', 'ACTIVE', 'smtp.zoho.com', 465, 'victoria@elevore.work', 'Ch@zaki191169', true, 'imap.zoho.com', 993, 'victoria@elevore.work', 'Ch@zaki191169', true, true, 20),
('ws_voxora_main', 'dom_elevore_work', 'grace@elevore.work', 'Grace Young', 'ZOHO', 'ACTIVE', 'smtp.zoho.com', 465, 'grace@elevore.work', 'Ch@zaki191169', true, 'imap.zoho.com', 993, 'grace@elevore.work', 'Ch@zaki191169', true, true, 20),
('ws_voxora_main', 'dom_elevore_work', 'chloe@elevore.work', 'Chloe Allen', 'ZOHO', 'ACTIVE', 'smtp.zoho.com', 465, 'chloe@elevore.work', 'Ch@zaki191169', true, 'imap.zoho.com', 993, 'chloe@elevore.work', 'Ch@zaki191169', true, true, 20),
('ws_voxora_main', 'dom_elevore_work', 'hannah@elevore.work', 'Hannah Wright', 'ZOHO', 'ACTIVE', 'smtp.zoho.com', 465, 'hannah@elevore.work', 'Ch@zaki191169', true, 'imap.zoho.com', 993, 'hannah@elevore.work', 'Ch@zaki191169', true, true, 20),

-- marketiva.work
('ws_voxora_main', 'dom_marketiva_work', 'charlotte@marketiva.work', 'Charlotte Green', 'ZOHO', 'ACTIVE', 'smtp.zoho.com', 465, 'charlotte@marketiva.work', 'Ch@zaki191169', true, 'imap.zoho.com', 993, 'charlotte@marketiva.work', 'Ch@zaki191169', true, true, 20),
('ws_voxora_main', 'dom_marketiva_work', 'scarlett@marketiva.work', 'Scarlett Adams', 'ZOHO', 'ACTIVE', 'smtp.zoho.com', 465, 'scarlett@marketiva.work', 'Ch@zaki191169', true, 'imap.zoho.com', 993, 'scarlett@marketiva.work', 'Ch@zaki191169', true, true, 20),
('ws_voxora_main', 'dom_marketiva_work', 'lucy@marketiva.work', 'Lucy Nelson', 'ZOHO', 'ACTIVE', 'smtp.zoho.com', 465, 'lucy@marketiva.work', 'Ch@zaki191169', true, 'imap.zoho.com', 993, 'lucy@marketiva.work', 'Ch@zaki191169', true, true, 20),
('ws_voxora_main', 'dom_marketiva_work', 'stella@marketiva.work', 'Stella Mitchell', 'ZOHO', 'ACTIVE', 'smtp.zoho.com', 465, 'stella@marketiva.work', 'Ch@zaki191169', true, 'imap.zoho.com', 993, 'stella@marketiva.work', 'Ch@zaki191169', true, true, 20),
('ws_voxora_main', 'dom_marketiva_work', 'violet@marketiva.work', 'Violet Roberts', 'ZOHO', 'ACTIVE', 'smtp.zoho.com', 465, 'violet@marketiva.work', 'Ch@zaki191169', true, 'imap.zoho.com', 993, 'violet@marketiva.work', 'Ch@zaki191169', true, true, 20),

-- vilora.work
('ws_voxora_main', 'dom_vilora_work', 'addison@vilora.work', 'Addison Peterson', 'ZOHO', 'ACTIVE', 'smtp.zoho.com', 465, 'addison@vilora.work', 'Ch@zaki191169', true, 'imap.zoho.com', 993, 'addison@vilora.work', 'Ch@zaki191169', true, true, 20),
('ws_voxora_main', 'dom_vilora_work', 'hannah@vilora.work', 'Hannah Cooper', 'ZOHO', 'ACTIVE', 'smtp.zoho.com', 465, 'hannah@vilora.work', 'Ch@zaki191169', true, 'imap.zoho.com', 993, 'hannah@vilora.work', 'Ch@zaki191169', true, true, 20),
('ws_voxora_main', 'dom_vilora_work', 'lillian@vilora.work', 'Lillian Ward', 'ZOHO', 'ACTIVE', 'smtp.zoho.com', 465, 'lillian@vilora.work', 'Ch@zaki191169', true, 'imap.zoho.com', 993, 'lillian@vilora.work', 'Ch@zaki191169', true, true, 20),
('ws_voxora_main', 'dom_vilora_work', 'penelope@vilora.work', 'Penelope Howard', 'ZOHO', 'ACTIVE', 'smtp.zoho.com', 465, 'penelope@vilora.work', 'Ch@zaki191169', true, 'imap.zoho.com', 993, 'penelope@vilora.work', 'Ch@zaki191169', true, true, 20),
('ws_voxora_main', 'dom_vilora_work', 'zoey@vilora.work', 'Zoey Richardson', 'ZOHO', 'ACTIVE', 'smtp.zoho.com', 465, 'zoey@vilora.work', 'Ch@zaki191169', true, 'imap.zoho.com', 993, 'zoey@vilora.work', 'Ch@zaki191169', true, true, 20),

-- virixo.work
('ws_voxora_main', 'dom_virixo_work', 'hannah@virixo.work', 'Hannah Gray', 'ZOHO', 'ACTIVE', 'smtp.zoho.com', 465, 'hannah@virixo.work', 'Ch@zaki191169', true, 'imap.zoho.com', 993, 'hannah@virixo.work', 'Ch@zaki191169', true, true, 20),
('ws_voxora_main', 'dom_virixo_work', 'nora@virixo.work', 'Nora James', 'ZOHO', 'ACTIVE', 'smtp.zoho.com', 465, 'nora@virixo.work', 'Ch@zaki191169', true, 'imap.zoho.com', 993, 'nora@virixo.work', 'Ch@zaki191169', true, true, 20),
('ws_voxora_main', 'dom_virixo_work', 'leah@virixo.work', 'Leah Watson', 'ZOHO', 'ACTIVE', 'smtp.zoho.com', 465, 'leah@virixo.work', 'Ch@zaki191169', true, 'imap.zoho.com', 993, 'leah@virixo.work', 'Ch@zaki191169', true, true, 20),
('ws_voxora_main', 'dom_virixo_work', 'hazel@virixo.work', 'Hazel Brooks', 'ZOHO', 'ACTIVE', 'smtp.zoho.com', 465, 'hazel@virixo.work', 'Ch@zaki191169', true, 'imap.zoho.com', 993, 'hazel@virixo.work', 'Ch@zaki191169', true, true, 20),
('ws_voxora_main', 'dom_virixo_work', 'savannah@virixo.work', 'Savannah Sanders', 'ZOHO', 'ACTIVE', 'smtp.zoho.com', 465, 'savannah@virixo.work', 'Ch@zaki191169', true, 'imap.zoho.com', 993, 'savannah@virixo.work', 'Ch@zaki191169', true, true, 20),

-- virrexa.online
('ws_voxora_main', 'dom_virrexa_online', 'claire@virrexa.online', 'Claire Coleman', 'ZOHO', 'ACTIVE', 'smtp.zoho.com', 465, 'claire@virrexa.online', 'Ch@zaki191169', true, 'imap.zoho.com', 993, 'claire@virrexa.online', 'Ch@zaki191169', true, true, 20),
('ws_voxora_main', 'dom_virrexa_online', 'audrey@virrexa.online', 'Audrey Jenkins', 'ZOHO', 'ACTIVE', 'smtp.zoho.com', 465, 'audrey@virrexa.online', 'Ch@zaki191169', true, 'imap.zoho.com', 993, 'audrey@virrexa.online', 'Ch@zaki191169', true, true, 20),
('ws_voxora_main', 'dom_virrexa_online', 'bella@virrexa.online', 'Bella Perry', 'ZOHO', 'ACTIVE', 'smtp.zoho.com', 465, 'bella@virrexa.online', 'Ch@zaki191169', true, 'imap.zoho.com', 993, 'bella@virrexa.online', 'Ch@zaki191169', true, true, 20),
('ws_voxora_main', 'dom_virrexa_online', 'skylar@virrexa.online', 'Skylar Powell', 'ZOHO', 'ACTIVE', 'smtp.zoho.com', 465, 'skylar@virrexa.online', 'Ch@zaki191169', true, 'imap.zoho.com', 993, 'skylar@virrexa.online', 'Ch@zaki191169', true, true, 20),
('ws_voxora_main', 'dom_virrexa_online', 'lucy@virrexa.online', 'Lucy Long', 'ZOHO', 'ACTIVE', 'smtp.zoho.com', 465, 'lucy@virrexa.online', 'Ch@zaki191169', true, 'imap.zoho.com', 993, 'lucy@virrexa.online', 'Ch@zaki191169', true, true, 20),

-- virrexa.work
('ws_voxora_main', 'dom_virrexa_work', 'sophia@virrexa.work', 'Sophia Hughes', 'ZOHO', 'ACTIVE', 'smtp.zoho.com', 465, 'sophia@virrexa.work', 'Ch@zaki191169', true, 'imap.zoho.com', 993, 'sophia@virrexa.work', 'Ch@zaki191169', true, true, 20),
('ws_voxora_main', 'dom_virrexa_work', 'emma@virrexa.work', 'Emma Price', 'ZOHO', 'ACTIVE', 'smtp.zoho.com', 465, 'emma@virrexa.work', 'Ch@zaki191169', true, 'imap.zoho.com', 993, 'emma@virrexa.work', 'Ch@zaki191169', true, true, 20),
('ws_voxora_main', 'dom_virrexa_work', 'hannah@virrexa.work', 'Hannah Bennett', 'ZOHO', 'ACTIVE', 'smtp.zoho.com', 465, 'hannah@virrexa.work', 'Ch@zaki191169', true, 'imap.zoho.com', 993, 'hannah@virrexa.work', 'Ch@zaki191169', true, true, 20),
('ws_voxora_main', 'dom_virrexa_work', 'olivia@virrexa.work', 'Olivia Wood', 'ZOHO', 'ACTIVE', 'smtp.zoho.com', 465, 'olivia@virrexa.work', 'Ch@zaki191169', true, 'imap.zoho.com', 993, 'olivia@virrexa.work', 'Ch@zaki191169', true, true, 20),
('ws_voxora_main', 'dom_virrexa_work', 'mia@virrexa.work', 'Mia Barnes', 'ZOHO', 'ACTIVE', 'smtp.zoho.com', 465, 'mia@virrexa.work', 'Ch@zaki191169', true, 'imap.zoho.com', 993, 'mia@virrexa.work', 'Ch@zaki191169', true, true, 20)
ON CONFLICT ("email") DO NOTHING;
