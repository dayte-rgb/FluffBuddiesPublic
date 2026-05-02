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
(NULL, "groom_org", "donthackme", "610-555-0707", "groom@groomorg.com", "71129", "Professional grooming services", 'organization', "groom_logo.jpeg", datetime('now')),
(NULL, "happy_paws_org", "securepass", "610-555-0808", "happy@happypaws.com", "18042", "Nonprofit focused on pet adoption and care", 'organization', "happy_paws_logo.jpeg", datetime('now')),
(NULL, "tom_owner", "tompass1", "610-555-0909", "tom@gmail.com", "18045", "Reptile enthusiast and proud tortoise dad", 'owner', "tom_pic.jpeg", datetime('now')),
(NULL, "snuggles", "slowandsteady", "610-555-1010", "snuggles@gmail.com", "18045", "Laid-back tortoise who enjoys basking and leafy greens", 'pet', "snuggles_pic.jpeg", datetime('now'));

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
(NULL, "Community Hero", "badge_community.png"),
(NULL, "Reptile Specialist", "badge_reptile.png"),
(NULL, "First Review", "badge_first_review.png");

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
(NULL, "Need someone to walk my golden retriever every weekday morning", "2026-04-01 08:00:00", 60, 18042, 1, FALSE, FALSE),
(NULL, "Looking for a pet sitter for a weekend while I travel", "2026-04-10 09:00:00", 2880, 18045, 1, FALSE, FALSE),
(NULL, "Dog grooming needed before a show", "2026-04-05 14:00:00", 120, 18101, 1, TRUE, FALSE),
(NULL, "Help needed caring for 3 cats while owner is away", "2026-04-15 10:00:00", 1440, 12967, 1, FALSE, FALSE),
(NULL, "Weekend dog walking for energetic husky", "2026-04-20 07:00:00", 90, 35234, 2, FALSE, TRUE),
(NULL, "Cat sitting needed for vacation", "2026-04-25 08:00:00", 3563646, 17221, 2, FALSE, TRUE),
(NULL, "Dog training sessions for obedience", "2026-04-18 16:00:00", 123312, 18042, 3, FALSE, TRUE),
(NULL, "Bird cage cleaning and feeding", "2026-04-22 10:00:00", 6764332, 18045, 4, FALSE, TRUE),
(NULL, "Horse grooming and exercise", "2026-04-28 06:00:00", 9999, 25452, 4, FALSE, TRUE),
(NULL, "General pet care help needed for busy week", "2026-05-01 09:00:00", 480, 18042, 1, FALSE, FALSE),
(NULL, "Looking for experienced sitter for two rabbits", "2026-05-05 10:00:00", 1440, 18045, 1, FALSE, FALSE),
(NULL, "Need someone to clean and maintain a fish tank", "2026-05-08 11:00:00", 90, 18101, 1, FALSE, FALSE),
(NULL, "Overnight pet sitting for two dogs and a cat", "2026-05-10 18:00:00", 720, 18042, 1, FALSE, FALSE),
(NULL, "Daily feeding and care for backyard chickens", "2026-05-12 07:00:00", 30, 18045, 1, FALSE, FALSE),
(NULL, "Help socializing a shy rescue dog", "2026-05-14 10:00:00", 120, 18101, 2, FALSE, FALSE),
(NULL, "Guinea pig care while on business trip", "2026-05-16 08:00:00", 2880, 12871, 1, FALSE, FALSE),
(NULL, "Dog bath and brush out for large breed", "2026-05-18 13:00:00", 90, 32232, 1, FALSE, FALSE),
(NULL, "Evening dog walk for senior labrador", "2026-05-20 17:00:00", 45, 18042, 1, FALSE, FALSE),
(NULL, "Cat feeding and litter box service for long weekend", "2026-05-22 09:00:00", 4320, 18045, 1, FALSE, FALSE),
(NULL, "Eating spare leaves from my garden", "2026-05-20 14:00:00", 4500, 17432, 1, FALSE, FALSE),
(NULL, "Hamster care and cage cleaning", "2026-05-25 10:00:00", 60, 71129, 1, FALSE, FALSE);

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
(9, 3),
(10, 2),
(11, 2),
(12, 6),
(13, 2),
(14, 2),
(15, 2),
(16, 2),
(17, 7),
(18, 1),
(19, 2),
(20, 2);

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
(9, 1),
(10, 3),
(11, 3),
(11, 6),
(12, 3),
(13, 3),
(14, 3),
(15, 8),
(16, 3),
(17, 3),
(18, 1),
(19, 2),
(20, 3);

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
(9, 2, 75),
(10, 1, 18),
(11, 3, 65),
(12, 2, 40),
(13, 3, 90),
(14, 4, 10),
(15, 1, 22),
(16, 3, 70),
(17, 2, 55),
(18, 1, 20),
(19, 3, 85),
(20, 4, 12);

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
(9, 4),
(10, 10),
(11, 10),
(12, 9),
(13, 2),
(14, 10),
(15, 9),
(16, 5),
(17, 4),
(18, 2),
(19, 5),
(20, 8);

-- insert data into LeaderboardContent
-- (NULL, <reward_badge_id>, <start_time>, <end_time>)
INSERT INTO LeaderboardContent VALUES
(NULL, "2026-03-01 00:00:00", "2026-03-31 23:59:59", 3, 1),
(NULL, "2026-04-01 00:00:00", "2026-04-30 23:59:59", 2, 2),
(NULL, "2026-05-01 00:00:00", "2026-05-31 23:59:59", 3, 4);

-- insert data into CertificationContent
-- (NULL, <certification_name>, <company>)
INSERT INTO CertificationContent VALUES
(NULL, "Pet First Aid & CPR", "American Red Cross"),
(NULL, "Professional Dog Trainer Certification", "CCPDT"),
(NULL, "Fear Free Pet Professional", "Fear Free LLC"),
(NULL, "Animal Shelter Management", "Humane Society"),
(NULL, "Exotic Animal Care", "National Association of Professional Pet Sitters"),
(NULL, "Reptile Husbandry Fundamentals", "Herpetological Society");

-- insert data into ReviewContent  (must come before JobReview and UserReview)
-- (NULL, <punctuality>, <quality>, <friendliness>, <comments>, <datetime>, <verified>)
INSERT INTO ReviewContent VALUES
(NULL, 5, 5, 4, "Showed up on time and Fluffy loved them!", "2026-03-15 12:00:00", TRUE),
(NULL, 4, 5, 5, "Great sitter, will hire again", "2026-03-20 15:00:00", TRUE),
(NULL, 3, 4, 4, "Good job overall, minor communication delay", "2026-03-22 09:00:00", FALSE),
(NULL, 5, 4, 5, "Very professional and caring with the animals", "2026-04-02 11:00:00", TRUE),
(NULL, 4, 4, 4, "Solid work, animals were well cared for", "2026-04-10 14:00:00", TRUE),
(NULL, 2, 3, 4, "A bit late but did a decent job", "2026-04-12 16:00:00", FALSE),
(NULL, 5, 5, 5, "Absolutely wonderful, my dogs were so happy!", "2026-04-15 10:00:00", TRUE),
(NULL, 4, 5, 4, "Really reliable, sent updates throughout the day", "2026-04-18 13:00:00", TRUE),
(NULL, 3, 3, 5, "Friendly but forgot to refill the water bowl once", "2026-04-20 09:00:00", FALSE),
(NULL, 5, 4, 4, "Great with my nervous rescue cat", "2026-04-22 11:00:00", TRUE),
(NULL, 1, 2, 3, "Did not show up on time, had to call twice", "2026-04-24 15:00:00", TRUE),
(NULL, 4, 5, 5, "My rabbit took to her immediately, very gentle", "2026-04-26 12:00:00", TRUE),
(NULL, 5, 5, 4, "Tank looked spotless after the cleaning", "2026-04-28 14:00:00", TRUE),
(NULL, 3, 4, 3, "Got the job done but not very communicative", "2026-04-30 10:00:00", FALSE),
(NULL, 5, 5, 5, "Best pet sitter we have ever had, highly recommend", "2026-05-02 09:00:00", TRUE),
(NULL, 4, 3, 4, "Decent experience overall, chickens were fed on time", "2026-05-04 11:00:00", TRUE);

-- insert data into JobReview
-- (<review_id>, <job_id>)
INSERT INTO JobReview VALUES
(1, 1),
(2, 2),
(3, 3),
(4, 4),
(5, 5),
(6, 6),
(7, 7),
(8, 8),
(9, 9),
(10, 10),
(11, 11),
(12, 12),
(13, 13),
(14, 14),
(15, 15),
(16, 16);

-- insert data into MessageContent  (must come before UserMessage)
-- (NULL, <message_content>, <datetime>)
INSERT INTO MessageContent VALUES
(NULL, "Hi, are you available to walk my dog next Monday?", "2026-03-25 10:00:00"),
(NULL, "Yes, I am free from 8am to 10am!", "2026-03-25 10:05:00"),
(NULL, "Great, I will book you for 8:30am", "2026-03-25 10:08:00"),
(NULL, "Do you have experience with reptiles?", "2026-04-01 09:00:00"),
(NULL, "Yes, I have cared for tortoises and lizards before!", "2026-04-01 09:10:00"),
(NULL, "Perfect, I may need help with my tortoise Snuggles soon", "2026-04-01 09:15:00");

-- insert data into UserMessage
-- (<message_id>, <sender_id>, <recipient_id>)
INSERT INTO UserMessage VALUES
(1, 2, 3),
(2, 3, 2),
(3, 2, 3),
(4, 10, 7),
(5, 7, 10),
(6, 10, 7);

-- insert data into AchievementContent
-- (NULL, <achievement_name>, <metric_id>, <badge_id>, <required_quantity>)
INSERT INTO AchievementContent VALUES
(NULL, "First Job", 1, 1, 1),
(NULL, "Ten Jobs Milestone", 1, 2, 10),
(NULL, "Five-Star Streak", 2, 3, 5),
(NULL, "Dedicated Worker", 3, 4, 100),
(NULL, "Exotic Caretaker", 1, 5, 3),
(NULL, "First Review Received", 4, 6, 1);

-- insert data into UserSpecies
-- (<user_id>, <species>)
INSERT INTO UserSpecies VALUES
(3, "Dog"),
(11, "Tortoise");

-- insert data into UserReview
-- (<review_id>, <user_id>)
INSERT INTO UserReview VALUES
(1, 3),
(2, 3),
(3, 5),
(4, 6),
(5, 7),
(6, 6),
(7, 7),
(8, 6),
(9, 7),
(10, 6),
(11, 7),
(12, 7),
(13, 6),
(14, 7),
(15, 7),
(16, 6);

-- insert data into SecurityQuestion
-- (<question_id>, <question_text>)
INSERT INTO SecurityQuestion VALUES
(1, "What is your favorite food?"),
(2, "What city were you born in?"),
(3, "What is your favorite color?"),
(4, "What is your favorite toy?"),
(5, "What is your childhood dream job?");