-- insert data into User
-- (NULL, <username>, <password>, <phone_number>, <email>, <zipcode>, <profile_description>, <account_type>, <profile_picture_link>)
INSERT INTO User VALUES
(NULL, "default_user", "admin", "111-111-1111", "default@gmail.com", "00001", "A default account for testing purposes", 'user', "prof_pic.jpeg"),
(NULL, "john_owner", "password123", "610-555-0101", "john@gmail.com", "18042", "Dog lover looking for reliable pet sitters", 'owner', "john_pic.jpeg"),
(NULL, "fluffy_dog", "pawword1", "610-555-0202", "fluffy@gmail.com", "18045", "Friendly golden retriever, loves walks", 'pet', "fluffy_pic.jpeg"),
(NULL, "paws_org", "orgpass1", "610-555-0303", "paws@pawsorg.com", "18101", "Local animal shelter and rescue organization", 'organization', "paws_logo.jpeg"),
(NULL, "sarah_owner", "securepass", "610-555-0404", "sarah@gmail.com", "18042", "Cat mom of three, needs occasional help", 'owner', "sarah_pic.jpeg");

-- insert data into JobCategory
-- (<job_category_id>, <category_name>)
INSERT INTO JobCategory VALUES
(1, "Dog Walking"),
(2, "Pet Sitting"),
(3, "Grooming"),
(4, "Veterinary Assistance"),
(5, "Training");

-- insert data into BadgeContent
-- (NULL, <badge_name>, <badge_image_link>)
INSERT INTO BadgeContent VALUES
(NULL, "Top Walker", "badge_top_walker.png"),
(NULL, "Reliable Sitter", "badge_reliable_sitter.png"),
(NULL, "5-Star Groomer", "badge_groomer.png"),
(NULL, "Community Hero", "badge_community.png");

-- insert data into SkillCategory
-- (<skill_category_id>, <category_name>)
INSERT INTO SkillCategory VALUES
(1, "Dog Handling"),
(2, "Cat Care"),
(3, "First Aid"),
(4, "Obedience Training"),
(5, "Exotic Animals");

-- insert data into PaymentContent
-- (NULL, <payment_name>)
INSERT INTO PaymentContent VALUES
(1, "Hourly"),
(2, "Flat Rate"),
(3, "Daily"),
(4, "Per Visit");

-- insert data into JobContent  (must come before JobPayment and EmployerJob)
-- (NULL, <description>, <datetime>, <duration>, <zipcode>, <employee_num>, <job_filled>)
INSERT INTO JobContent VALUES
(NULL, "Need someone to walk my golden retriever every weekday morning", "2025-04-01 08:00:00", 60, 18042, 1, FALSE),
(NULL, "Looking for a pet sitter for a weekend while I travel", "2025-04-10 09:00:00", 2880, 18045, 1, FALSE),
(NULL, "Dog grooming needed before a show", "2025-04-05 14:00:00", 120, 18101, 1, TRUE),
(NULL, "Help needed caring for 3 cats while owner is away", "2025-04-15 10:00:00", 1440, 18042, 1, FALSE);

-- insert data into JobPayment
-- (<job_id>, <payment_id>, <payment_quantity>)
INSERT INTO JobPayment VALUES
(1, 1, 20),
(2, 3, 80),
(3, 2, 60),
(4, 4, 25);

-- insert data into EmployerJob
-- (<job_id>, <employer_id>)
INSERT INTO EmployerJob VALUES
(1, 2),
(2, 2),
(3, 4),
(4, 5);

-- insert data into LeaderboardContent
-- (NULL, <reward_badge_id>, <start_time>, <end_time>)
INSERT INTO LeaderboardContent VALUES
(NULL, 1, "2025-03-01 00:00:00", "2025-03-31 23:59:59"),
(NULL, 2, "2025-04-01 00:00:00", "2025-04-30 23:59:59");

-- insert data into CertificationContent
-- (NULL, <certification_name>, <company>)
INSERT INTO CertificationContent VALUES
(NULL, "Pet First Aid & CPR", "American Red Cross"),
(NULL, "Professional Dog Trainer Certification", "CCPDT"),
(NULL, "Fear Free Pet Professional", "Fear Free LLC"),
(NULL, "Animal Shelter Management", "Humane Society");

-- insert data into ReviewContent  (must come before JobReview and UserReview)
-- (NULL, <punctuality>, <quality>, <friendliness>, <comments>, <datetime>, <verified>)
INSERT INTO ReviewContent VALUES
(NULL, 5, 5, 4, "Showed up on time and Fluffy loved them!", "2025-03-15 12:00:00", TRUE),
(NULL, 4, 5, 5, "Great sitter, will hire again", "2025-03-20 15:00:00", TRUE),
(NULL, 3, 4, 4, "Good job overall, minor communication delay", "2025-03-22 09:00:00", FALSE);

-- insert data into JobReview
-- (<review_id>, <job_id>)
INSERT INTO JobReview VALUES
(1, 1),
(2, 2),
(3, 3);

-- insert data into MessageContent  (must come before UserMessage)
-- (NULL, <message_content>, <datetime>)
INSERT INTO MessageContent VALUES
(NULL, "Hi, are you available to walk my dog next Monday?", "2025-03-25 10:00:00"),
(NULL, "Yes, I am free from 8am to 10am!", "2025-03-25 10:05:00"),
(NULL, "Great, I will book you for 8:30am", "2025-03-25 10:08:00");

-- insert data into UserMessage
-- (<message_id>, <sender_id>, <recipient_id>)
INSERT INTO UserMessage VALUES
(1, 2, 3),
(2, 3, 2),
(3, 2, 3);

-- insert data into AchievementMetric
-- (<metric_id>, <metric_name>, <description>)
INSERT INTO AchievementMetric VALUES
(1, "Jobs Completed", "Total number of jobs successfully completed"),
(2, "5-Star Reviews", "Total number of five-star reviews received"),
(3, "Hours Worked", "Total hours worked across all jobs"),
(4, "Repeat Clients", "Number of clients who have booked more than once");

-- insert data into AchievementContent
-- (NULL, <achievement_name>, <metric_id>, <badge_id>, <required_quantity>)
INSERT INTO AchievementContent VALUES
(NULL, "First Job", 1, 1, 1),
(NULL, "Ten Jobs Milestone", 1, 2, 10),
(NULL, "Five-Star Streak", 2, 3, 5),
(NULL, "Dedicated Worker", 3, 4, 100);

-- insert data into UserSpecies
-- (<user_id>, <species>)
INSERT INTO UserSpecies VALUES
(3, "Dog");

-- insert data into UserReview
-- (<review_id>, <user_id>)
INSERT INTO UserReview VALUES
(1, 3),
(2, 3),
(3, 5);

-- insert data into SecurityQuestion
-- (<question_id>, <question_text>)
INSERT INTO SecurityQuestion VALUES
(1, "What was the name of your first pet?"),
(2, "What city were you born in?"),
(3, "What is your mother's maiden name?"),
(4, "What was the name of your elementary school?");