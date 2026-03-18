PRAGMA foreign_keys = ON;


CREATE TABLE IF NOT EXISTS IF NOT EXISTS SecurityQuestion (
  question_id INTEGER PRIMARY KEY,
  question_text TEXT
);

CREATE TABLE IF NOT EXISTS IF NOT EXISTS User (
  user_id INTEGER PRIMARY KEY,
  username TEXT,
  password TEXT,
  phone_number TEXT,
  zipcode INTEGER,
  profile_description TEXT,
  account_type CHECK( account_type IN ('pet', 'owner', 'organization', 'user')),
  profile_picture_link TEXT
);

CREATE TABLE IF NOT EXISTS IF NOT EXISTS UserMessage (
  message_id INTEGER PRIMARY KEY,
  sender_id INTEGER,
  recipient_id INTEGER,
    FOREIGN KEY (recipient_id)
      REFERENCES User(profile_picture_link),
    FOREIGN KEY (sender_id)
      REFERENCES User(profile_picture_link)
);

CREATE TABLE IF NOT EXISTS JobCategory (
  job_category_id INTEGER PRIMARY KEY ,
  category_name TEXT
);

CREATE TABLE IF NOT EXISTS BadgeContent (
  badge_id INTEGER PRIMARY KEY ,
  badge_name TEXT,
  badge_image_link TEXT
);

CREATE TABLE IF NOT EXISTS SkillCategory (
  skill_category_id INTEGER PRIMARY KEY ,
  category_name TEXT
);

CREATE TABLE IF NOT EXISTS SkillCategoryByUser (
  skill_category_id INTEGER PRIMARY KEY ,
  user_id INTEGER PRIMARY KEY ,
  
    FOREIGN KEY (skill_category_id)
      REFERENCES SkillCategory(skill_category_id),
  
    FOREIGN KEY (user_id)
      REFERENCES User(profile_picture_link)
);

CREATE TABLE IF NOT EXISTS PaymentType (
  payment_id INTEGER PRIMARY KEY ,
  payment_name TEXT
);

CREATE TABLE IF NOT EXISTS JobPayment (
  job_id INTEGER PRIMARY KEY ,
  payment_id INTEGER,
  payment_quantity INTEGER,
  
    FOREIGN KEY (payment_id)
      REFERENCES PaymentType(payment_id)
);

CREATE TABLE IF NOT EXISTS JobCategoryByUser (
  job_category_id INTEGER PRIMARY KEY ,
  user_id INTEGER PRIMARY KEY ,
  
    FOREIGN KEY (job_category_id)
      REFERENCES JobCategory(job_category_id),
  
    FOREIGN KEY (user_id)
      REFERENCES User(profile_picture_link)
);

CREATE TABLE IF NOT EXISTS LeaderboardContent (
  leaderboard_id INTEGER PRIMARY KEY ,
  reward_badge_id INTEGER,
  start_time TEXT,
  end_time TEXT
);

CREATE TABLE IF NOT EXISTS UserBadge (
  user_id INTEGER PRIMARY KEY ,
  badge_id INTEGER PRIMARY KEY ,
  
    FOREIGN KEY (badge_id)
      REFERENCES BadgeContent(badge_id)
);

CREATE TABLE IF NOT EXISTS CertificationContent (
  certification_id INTEGER PRIMARY KEY ,
  certification_name TEXT,
  company TEXT
);

CREATE TABLE IF NOT EXISTS JobContent (
  job_id INTEGER PRIMARY KEY ,
  description TEXT,
  datetime TEXT,
  duration INTEGER,
  zipcode INTEGER,
  employee_num INTEGER,
  job_filled BOOLEAN
);

CREATE TABLE IF NOT EXISTS SkillCategoriesByJob (
  job_id INTEGER PRIMARY KEY ,
  skill_category_id INTEGER PRIMARY KEY ,
  
    FOREIGN KEY (skill_category_id)
      REFERENCES SkillCategory(skill_category_id),
  
    FOREIGN KEY (job_id)
      REFERENCES JobContent(job_filled)
);

CREATE TABLE IF NOT EXISTS JobReview (
  review_id INTEGER PRIMARY KEY ,
  job_id INTEGER
);

CREATE TABLE IF NOT EXISTS ReviewContent (
  review_id INTEGER PRIMARY KEY ,
  punctuality INTEGER,
  quality INTEGER,
  friendliness INTEGER,
  comments TEXT,
  datetime TEXT,
  verified BOOLEAN
);

CREATE TABLE IF NOT EXISTS OrganizationMember (
  org_id INTEGER PRIMARY KEY ,
  user_id INTEGER PRIMARY KEY ,
  
    FOREIGN KEY (org_id)
      REFERENCES User(profile_picture_link),
  
    FOREIGN KEY (user_id)
      REFERENCES User(profile_picture_link)
);

CREATE TABLE IF NOT EXISTS EmployerJob (
  job_id INTEGER PRIMARY KEY,
  employer_id INTEGER,
  
    FOREIGN KEY (employer_id)
      REFERENCES User(user_id)
);

CREATE TABLE IF NOT EXISTS JobCategoriesByJob (
  job_id INTEGER PRIMARY KEY ,
  job_category_id INTEGER PRIMARY KEY ,
  
    FOREIGN KEY (job_id)
      REFERENCES JobContent(job_filled),
  
    FOREIGN KEY (job_category_id)
      REFERENCES JobCategory(job_category_id)
);

CREATE TABLE IF NOT EXISTS MessageContent (
  message_id INTEGER PRIMARY KEY,
  message_content TEXT,
  datetime TEXT
);

CREATE TABLE IF NOT EXISTS AchievementMetric (
  metric_id INTEGER PRIMARY KEY ,
  metric_name TEXT,
  description TEXT
);

CREATE TABLE IF NOT EXISTS AchievementContent (
  achievement_id INTEGER PRIMARY KEY ,
  achievement_name TEXT,
  metric_id INTEGER,
  badge_id INTEGER,
  required_quantity INTEGER,
  
    FOREIGN KEY (metric_id)
      REFERENCES AchievementMetric(metric_id)
);

CREATE TABLE IF NOT EXISTS UserAchievement (
  user_id INTEGER PRIMARY KEY,
  achievement_id INTEGER PRIMARY KEY,

  
    FOREIGN KEY (achievement_id)
      REFERENCES AchievementContent(achievement_id)
);

CREATE TABLE IF NOT EXISTS UserSpecies (
  user_id INTEGER PRIMARY KEY ,
  species TEXT
);

CREATE TABLE IF NOT EXISTS PetOwner (
  owner_id INTEGER PRIMARY KEY ,
  pet_id INTEGER PRIMARY KEY ,
  
    FOREIGN KEY (pet_id)
      REFERENCES User(profile_picture_link),
  
    FOREIGN KEY (owner_id)
      REFERENCES User(profile_picture_link)
);

CREATE TABLE IF NOT EXISTS EmployeeJob (
  job_id INTEGER PRIMARY KEY ,
  employee_id INTEGER PRIMARY KEY ,
  
    FOREIGN KEY (job_id)
      REFERENCES JobContent(job_id)
);

CREATE TABLE IF NOT EXISTS UserSecurityAnswer (
  user_id INTEGER PRIMARY KEY ,
  question_id INTEGER PRIMARY KEY,
  answer_text TEXT
);

CREATE TABLE IF NOT EXISTS UserCertification (
  user_id INTEGER PRIMARY KEY ,
  certification_id INTEGER PRIMARY KEY ,
  
    FOREIGN KEY (certification_id)
      REFERENCES CertificationContent(certification_id)
);

CREATE TABLE IF NOT EXISTS UserReview (
  review_id INTEGER PRIMARY KEY,
  user_id INTEGER
);

