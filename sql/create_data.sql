-- insert data into User
-- (NULL, <username>, <password>, <phone_number>, <email>, <zipcode>, <profile_description>, <account_type>, <profile_picture_link>)
INSERT INTO User VALUES
(NULL, "default_user", "admin", "111-111-1111", "default@gmail.com", "00001", "A default account for testing purposes", 'user', "prof_pic.jpeg", datetime('now')),
(NULL, "john_owner", "password123", "610-555-0101", "john@gmail.com", "18042", "Dog lover looking for reliable pet sitters", 'owner', "john_pic.jpeg", datetime('now')),
(NULL, "fluffy_dog", "pawword1", "610-555-0202", "fluffy@gmail.com", "18045", "Friendly golden retriever, loves walks", 'pet', "fluffy_pic.jpeg", datetime('now')),
(NULL, "paws_org", "orgpass1", "610-555-0303", "paws@pawsorg.com", "18101", "Local animal shelter and rescue organization", 'organization', "paws_logo.jpeg", datetime('now')),
(NULL, "sarah_owner", "incorrect", "610-555-0404", "sarah@gmail.com", "12871", "Cat mom of three, needs occasional help", 'owner', "sarah_pic.jpeg", datetime('now')),
(NULL, "mike_walker", "mypassword", "610-555-0505", "mike@gmail.com", "32232", "Experienced dog walker available weekends", 'user', "mike_pic.jpeg", datetime('now')),
(NULL, "lisa_sitter", "4", "610-555-0606", "lisa@gmail.com", "23984", "Pet sitter with 5 years experience", 'user', "lisa_pic.jpeg", datetime('now')),
(NULL, "groom_org", "donthackme", "610-555-0707", "groom@groomorg.com", "71129", "Professional grooming services", 'organization', "groom_logo.jpeg", datetime('now'));

-- insert data into JobCategory
-- (<job_category_id>, <category_name>)
INSERT INTO JobCategory VALUES
(1, "Other"),
(2, "Pet Sitting"),
(3, "Leisure"),
(4, "Educational"),
(5, "Transporation"),
(6, "Maintenance"),
(7, "Grooming"),
(8, "Heavy-Duty Labor"),
(9, "Light Labor");

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
(1, "Other"),
(2, "Technical"),
(3, "Hands-On"),
(4, "Organization"),
(5, "Problem-Solving"),
(6, "Communication"),
(7, "Teamwork"),
(8, "Emotional-Intelligence"),
(9, "Soft Skills");

-- insert data into MetricContent
-- (<metric_id>, <metric_name>, <description>)
INSERT INTO MetricContent VALUES
(1, "Jobs Completed", "Total number of jobs successfully completed"),
(2, "Age of Account", "Measures the age of the account"),
(3, "Average Rating", "Compares the average rating of the user to a specific number"),
(4, "Review Total", "Number of reviews an account has that other people have made");


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
(NULL, "Help needed caring for 3 cats while owner is away", "2025-04-15 10:00:00", 1440, 12967, 1, FALSE),
(NULL, "Weekend dog walking for energetic husky", "2025-04-20 07:00:00", 90, 35234, 2, FALSE),
(NULL, "Cat sitting needed for vacation", "2025-04-25 08:00:00", 3563646, 17221, 2, FALSE),
(NULL, "Dog training sessions for obedience", "2025-04-18 16:00:00", 123312, 18042, 3, FALSE),
(NULL, "Bird cage cleaning and feeding", "2025-04-22 10:00:00", 6764332, 18045, 4, FALSE),
(NULL, "Horse grooming and exercise", "2025-04-28 06:00:00", 9999, 25452, 4, FALSE);

-- insert data into JobCategoriesByJob
-- (<job_id>, <job_category_id>)
INSERT INTO JobCategoriesByJob VALUES
(1, 1),
(2, 2),
(3, 3),
(4, 2),
(5, 1),
(6, 2),
(7, 5),
(8, 2),
(9, 3);

-- insert data into SkillCategoriesByJob
-- (<job_id>, <skill_category_id>)
INSERT INTO SkillCategoriesByJob VALUES
(1, 1),
(2, 1),
(2, 2),
(3, 1),
(4, 2),
(5, 1),
(6, 2),
(7, 4),
(8, 5),
(9, 1);

-- insert data into JobPayment
-- (<job_id>, <payment_id>, <payment_quantity>)
INSERT INTO JobPayment VALUES
(1, 1, 20),
(2, 3, 80),
(3, 2, 60),
(4, 4, 25),
(5, 1, 25),
(6, 3, 120),
(7, 1, 50),
(8, 4, 15),
(9, 2, 75);

-- insert data into EmployerJob
-- (<job_id>, <employer_id>)
INSERT INTO EmployerJob VALUES
(1, 2),
(2, 2),
(3, 4),
(4, 5),
(5, 2),
(6, 5),
(7, 2),
(8, 4),
(9, 4);

-- insert data into LeaderboardContent
-- (NULL, <reward_badge_id>, <start_time>, <end_time>)
INSERT INTO LeaderboardContent VALUES
(NULL, 1, "2025-03-01 00:00:00", "2025-03-31 23:59:59", 3, 1),
(NULL, 2, "2025-04-01 00:00:00", "2025-04-30 23:59:59", 2, 1);

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
(1, "What is your favorite food?"),
(2, "What city were you born in?"),
(3, "What is your favorite color?"),
(4, "What is your favorite toy?"),
(5, "What is your childhood dream job?");