# Apparently we can't drop databases anymore!
# DROP DATABASE IF EXISTS project_x;

# You must add at least two tables.
# At least one of the tables must have a foreign key that references the user_id column in the users table.
# Populate each of your tables with a few rows, unless it doesn't make sense to do so.


CREATE DATABASE project_x;
USE project_x;

CREATE TABLE `user_roles` (
  `user_role_id` int(11) NOT NULL PRIMARY KEY AUTO_INCREMENT,
  `user_role_name` varchar(30) NOT NULL,
  `user_role_desc` varchar(200) NOT NULL
);

INSERT INTO `user_roles` (`user_role_id`, `user_role_name`, `user_role_desc`) VALUES
(1, 'Admin', 'Extra permissions'),
(2, 'Standard User', 'Normal user with no special permissions');

CREATE TABLE users (
  user_id int(11) NOT NULL PRIMARY KEY AUTO_INCREMENT,
  user_first_name varchar(30) NOT NULL,
  user_last_name varchar(30) NOT NULL,
  user_email varchar(100) NOT NULL UNIQUE,
  user_password char(255) NOT NULL,
  user_salt char(32) NOT NULL,
  user_role_id INT NOT NULL DEFAULT '1',
  user_active boolean NOT NULL DEFAULT true,
  FOREIGN KEY (user_role_id) REFERENCES user_roles(user_role_id)
);

INSERT INTO users (user_first_name,user_last_name, user_email, user_password, user_salt, user_role_id, user_active) VALUES 
('John', 'Doe','john@doe.com', 'test123', 'xxx', '1', true),
('Jane', 'Anderson','jane@doe.com', 'letmein', 'xxx', '2', true),
('Bob', 'Smith','bob@smith.com', 'test', 'xxx', '2', false);

UPDATE users SET user_password = '$2a$08$zvWApJkRSK1124iESJU5Puo9mUelLn3sgy9A.dPSySghLe7MMGGGS', user_salt = 'xxx';

CREATE TABLE `user_preferences` (
  user_id INT PRIMARY KEY,
  theme VARCHAR(20) DEFAULT 'light',
  font_size VARCHAR(10) DEFAULT 'medium',
  language VARCHAR(10) DEFAULT 'en',
  date_format VARCHAR(20) DEFAULT 'MM/DD/YYYY',
  time_zone VARCHAR(50) DEFAULT 'UTC',
  FOREIGN KEY (user_id) REFERENCES users(user_id)
);

INSERT INTO user_preferences (user_id, theme, font_size, language, date_format, time_zone) VALUES
(1, 'dark', 'large', 'en', 'MM/DD/YYYY', 'America/New_York'),
(2, 'light', 'medium', 'es', 'DD/MM/YYYY', 'Europe/Madrid'),
(3, 'system', 'small', 'fr', 'YYYY-MM-DD', 'Europe/Paris');

CREATE TABLE user_activity (
  activity_id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  activity_type VARCHAR(50) NOT NULL,
  activity_description TEXT,
  activity_timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id)
);

INSERT INTO user_activity (user_id, activity_type, activity_description) VALUES
(1, 'login', 'Admin user logged in from desktop application'),
(1, 'view_dashboard', 'Viewed main admin dashboard'),
(1, 'manage_users', 'Accessed user management section'),
(1, 'send_message', 'Sent welcome message to new user'),
(1, 'update_settings', 'Updated system notification preferences'),
(1, 'view_reports', 'Generated monthly user activity report'),
(1, 'logout', 'Admin user logged out after session'),

(2, 'login', 'Standard user logged in via web browser'),
(2, 'view_profile', 'Viewed personal profile page'),
(2, 'update_profile', 'Updated profile picture and bio information'),
(2, 'send_message', 'Sent reply message to admin user'),
(2, 'view_messages', 'Checked inbox for new messages'),
(2, 'change_password', 'Updated account password for security'),
(2, 'view_dashboard', 'Accessed user dashboard overview'),
(2, 'logout', 'Standard user logged out normally'),

(3, 'login', 'User logged in after account reactivation'),
(3, 'view_profile', 'Reviewed profile information after reactivation'),
(3, 'update_preferences', 'Updated notification and privacy settings'),
(3, 'send_message', 'Sent thank you message to admin'),
(3, 'view_help', 'Accessed help documentation and tutorials'),
(3, 'download_resources', 'Downloaded training materials and guides'),
(3, 'view_messages', 'Checked messages from team members'),
(3, 'logout', 'User logged out after initial session'),

-- Additional activity types for testing different scenarios
(1, 'create_user', 'Created new user account for team member'),
(1, 'delete_user', 'Removed inactive user account from system'),
(1, 'backup_data', 'Performed daily database backup operation'),
(1, 'system_maintenance', 'Completed scheduled system maintenance tasks'),

(2, 'upload_file', 'Uploaded profile document to personal folder'),
(2, 'share_content', 'Shared document with team members'),
(2, 'join_meeting', 'Joined virtual team meeting via platform'),
(2, 'complete_training', 'Completed mandatory security training module'),

(3, 'reset_password', 'Requested password reset during reactivation'),
(3, 'verify_email', 'Verified email address for account security'),
(3, 'accept_terms', 'Accepted updated terms of service agreement'),
(3, 'configure_2fa', 'Set up two-factor authentication for account'),

-- Some recent activities for testing date/time sorting
(1, 'login', 'Recent admin login for system monitoring'),
(2, 'view_notifications', 'Checked latest system notifications'),
(3, 'send_feedback', 'Submitted feedback about platform improvements'),
(1, 'review_feedback', 'Reviewed user feedback and suggestions'),
(2, 'update_status', 'Updated availability status to online'),
(3, 'bookmark_page', 'Bookmarked important reference page');

CREATE TABLE user_messages (
  message_id INT PRIMARY KEY AUTO_INCREMENT,
  sender_id INT NOT NULL,
  recipient_id INT NOT NULL,
  message_text TEXT NOT NULL,
  sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sender_id) REFERENCES users(user_id),
  FOREIGN KEY (recipient_id) REFERENCES users(user_id)
);

INSERT INTO user_messages (sender_id, recipient_id, message_text) VALUES
(1, 2, 'Hey Jane! Welcome to the platform. Let me know if you need any help getting started.'),
(2, 1, 'Thanks John! I appreciate the welcome message. The platform looks great so far.'),
(1, 3, 'Hi Bob! I noticed your account is inactive. Please reach out if you need assistance.'),
(2, 3, 'Bob, let me know when you are ready to activate your account. We miss you!'),
(3, 1, 'Hi John, I am ready to reactivate my account. Can you help me with the process?'),
(3, 2, 'Jane, thanks for reaching out. I will be back on the platform soon.'),
(1, 2, 'Great to hear you are enjoying the platform! Have you tried the new messaging feature?'),
(2, 1, 'Yes, I love the messaging system! It is very intuitive and user-friendly.'),
(1, 3, 'Bob, your account has been reactivated. Welcome back to the platform!'),
(3, 1, 'Thank you so much John! I am excited to be back and explore the new features.'),
(2, 3, 'Welcome back Bob! I am glad to see you are active again.'),
(3, 2, 'Thanks Jane! Looking forward to collaborating with everyone again.'),
(1, 2, 'Jane, can you check the latest updates in your dashboard?'),
(2, 1, 'Sure thing! I will review them and get back to you with any questions.'),
(1, 3, 'Bob, there are some new training materials available in your account.'),
(3, 1, 'Perfect timing! I was just looking for some resources to get up to speed.');