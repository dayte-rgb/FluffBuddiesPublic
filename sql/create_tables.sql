PRAGMA foreign_keys = ON;


CREATE TABLE IF NOT EXISTS SecurityQuestion (
  question_id INTEGER PRIMARY KEY,
  question_text TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS User (
  user_id INTEGER PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL UNIQUE,
  phone_number TEXT,
  email TEXT UNIQUE,
  zipcode INTEGER,
  profile_description TEXT,
  account_type CHECK( account_type IN ('pet', 'owner', 'organization', 'user')) NOT NULL,
  profile_picture_link TEXT
);

CREATE TABLE IF NOT EXISTS UserMessage (
  message_id INTEGER PRIMARY KEY,
  sender_id INTEGER NOT NULL,
  recipient_id INTEGER NOT NULL,
    FOREIGN KEY (recipient_id)
      REFERENCES User(user_id),
    FOREIGN KEY (sender_id)
      REFERENCES User(user_id)
);

CREATE TABLE IF NOT EXISTS JobCategory (
  job_category_id INTEGER PRIMARY KEY ,
  category_name TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS BadgeContent (
  badge_id INTEGER PRIMARY KEY ,
  badge_name TEXT NOT NULL UNIQUE,
  badge_image_link TEXT UNIQUE
);

CREATE TABLE IF NOT EXISTS SkillCategory (
  skill_category_id INTEGER PRIMARY KEY ,
  category_name TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS SkillCategoryByUser (
  skill_category_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  
    FOREIGN KEY (skill_category_id)
      REFERENCES SkillCategory(skill_category_id),
  
    FOREIGN KEY (user_id)
      REFERENCES User(user_id),
    
    PRIMARY KEY (skill_category_id, user_id)
);

CREATE TABLE IF NOT EXISTS PaymentContent (
  payment_id INTEGER PRIMARY KEY,
  payment_name TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS JobPayment (
  job_id INTEGER PRIMARY KEY NOT NULL,
  payment_id INTEGER NOT NULL,
  payment_quantity INTEGER NOT NULL,
    FOREIGN KEY (job_id)
      REFERENCES JobContent(job_id),
    FOREIGN KEY (payment_id)
      REFERENCES PaymentContent(payment_id)
);

CREATE TABLE IF NOT EXISTS JobCategoryByUser (
  job_category_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  
    FOREIGN KEY (job_category_id)
      REFERENCES JobCategory(job_category_id),
  
    FOREIGN KEY (user_id)
      REFERENCES User(user_id),

    PRIMARY KEY (job_category_id, user_id)
);

CREATE TABLE IF NOT EXISTS LeaderboardContent (
  leaderboard_id INTEGER PRIMARY KEY ,
  reward_badge_id INTEGER NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS UserBadge (
  user_id INTEGER NOT NULL,
  badge_id INTEGER NOT NULL,
    FOREIGN KEY (user_id)
      REFERENCES User(user_id),
    FOREIGN KEY (badge_id)
      REFERENCES BadgeContent(badge_id),
    PRIMARY KEY (user_id, badge_id)
);

CREATE TABLE IF NOT EXISTS CertificationContent (
  certification_id INTEGER PRIMARY KEY ,
  certification_name TEXT NOT NULL UNIQUE,
  company TEXT
);

CREATE TABLE IF NOT EXISTS JobContent (
  job_id INTEGER PRIMARY KEY ,
  description TEXT,
  datetime TEXT,
  duration INTEGER,
  zipcode INTEGER,
  employee_num INTEGER NOT NULL,
  job_filled BOOLEAN NOT NULL
);

CREATE TABLE IF NOT EXISTS SkillCategoriesByJob (
  job_id INTEGER NOT NULL,
  skill_category_id INTEGER NOT NULL,
  
    FOREIGN KEY (skill_category_id)
      REFERENCES SkillCategory(skill_category_id),
  
    FOREIGN KEY (job_id)
      REFERENCES JobContent(job_id),
    
    PRIMARY KEY (job_id, skill_category_id)
);

CREATE TABLE IF NOT EXISTS JobReview (
  review_id INTEGER PRIMARY KEY NOT NULL UNIQUE,
  job_id INTEGER NOT NULL UNIQUE,

    FOREIGN KEY(review_id)
      REFERENCES ReviewContent(review_id),
    FOREIGN KEY (job_id)
      REFERENCES JobContent(job_id)
);

CREATE TABLE IF NOT EXISTS ReviewContent (
  review_id INTEGER PRIMARY KEY ,
  punctuality INTEGER,
  quality INTEGER,
  friendliness INTEGER,
  comments TEXT,
  datetime TEXT NOT NULL,
  verified BOOLEAN NOT NULL
);

CREATE TABLE IF NOT EXISTS OrganizationMember (
  org_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  
    FOREIGN KEY (org_id)
      REFERENCES User(user_id),
  
    FOREIGN KEY (user_id)
      REFERENCES User(user_id),

    PRIMARY KEY (org_id, user_id)
);

CREATE TABLE IF NOT EXISTS EmployerJob (
  job_id INTEGER PRIMARY KEY NOT NULL UNIQUE,
  employer_id INTEGER NOT NULL,

    FOREIGN KEY (job_id)
      REFERENCES JobContent(job_id),
    FOREIGN KEY (employer_id)
      REFERENCES User(user_id)
);

CREATE TABLE IF NOT EXISTS JobCategoriesByJob (
  job_id INTEGER NOT NULL,
  job_category_id INTEGER NOT NULL,
  
    FOREIGN KEY (job_id)
      REFERENCES JobContent(job_id),
  
    FOREIGN KEY (job_category_id)
      REFERENCES JobCategory(job_category_id),
    
    PRIMARY KEY (job_id, job_category_id)
);

CREATE TABLE IF NOT EXISTS MessageContent (
  message_id INTEGER PRIMARY KEY,
  message_content TEXT NOT NULL,
  datetime TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS AchievementMetric (
  metric_id INTEGER PRIMARY KEY,
  metric_name TEXT NOT NULL UNIQUE,
  description TEXT
);

CREATE TABLE IF NOT EXISTS AchievementContent (
  achievement_id INTEGER PRIMARY KEY ,
  achievement_name TEXT NOT NULL UNIQUE,
  metric_id INTEGER NOT NULL,
  badge_id INTEGER,
  required_quantity INTEGER NOT NULL,
    FOREIGN KEY (badge_id)
      REFERENCES BadgeContent(badge_id),
    FOREIGN KEY (metric_id)
      REFERENCES AchievementMetric(metric_id)
);

CREATE TABLE IF NOT EXISTS UserAchievement (
  user_id INTEGER NOT NULL,
  achievement_id INTEGER NOT NULL,

    FOREIGN KEY(user_id)
      REFERENCES User(user_id),

    FOREIGN KEY (achievement_id)
      REFERENCES AchievementContent(achievement_id),
    
    PRIMARY KEY (user_id, achievement_id)
);

CREATE TABLE IF NOT EXISTS UserSpecies (
  user_id INTEGER PRIMARY KEY NOT NULL,
  species TEXT NOT NULL,

  FOREIGN KEY (user_id)
    REFERENCES User(user_id)
);

CREATE TABLE IF NOT EXISTS PetOwner (
  owner_id INTEGER NOT NULL,
  pet_id INTEGER NOT NULL,
  
    FOREIGN KEY (pet_id)
      REFERENCES User(user_id),
  
    FOREIGN KEY (owner_id)
      REFERENCES User(user_id),
    
    PRIMARY KEY (owner_id, pet_id)
);

CREATE TABLE IF NOT EXISTS EmployeeJob (
  job_id INTEGER NOT NULL,
  employee_id INTEGER NOT NULL,
    
    FOREIGN KEY (job_id)
      REFERENCES JobContent(job_id),

    FOREIGN KEY (employee_id)
      REFERENCES User(user_id),

    PRIMARY KEY (job_id, employee_id)
);

CREATE TABLE IF NOT EXISTS UserSecurityAnswer (
  user_id INTEGER NOT NULL,
  question_id INTEGER NOT NULL,
  answer_text TEXT NOT NULL,

  FOREIGN KEY (user_id)
    REFERENCES User(user_id),

  FOREIGN KEY (question_id)
    REFERENCES SecurityQuestion(question_id),
  
  PRIMARY KEY (user_id, question_id)
);

CREATE TABLE IF NOT EXISTS UserCertification (
  user_id INTEGER NOT NULL,
  certification_id INTEGER NOT NULL,

    FOREIGN KEY (user_id)
      REFERENCES User(user_id),

    FOREIGN KEY (certification_id)
      REFERENCES CertificationContent(certification_id),
    
    PRIMARY KEY (user_id, certification_id)
);

CREATE TABLE IF NOT EXISTS UserReview (
  review_id INTEGER PRIMARY KEY UNIQUE,
  user_id INTEGER NOT NULL,

  FOREIGN KEY (review_id)
    REFERENCES ReviewContent(review_id),
  FOREIGN KEY (user_id)
    REFERENCES User(user_id)
);

