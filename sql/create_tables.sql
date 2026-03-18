CREATE TABLE "SecurityQuestion" (
  "question_id" int(25),
  "question_text" char(200),
  PRIMARY KEY ("question_id")
);

CREATE TABLE "User" (
  "user_id" int(25),
  "username" char(100),
  "password" char(100),
  "phone_number" char(10),
  "zipcode" int(5),
  "profile_description" char(500),
  "account_type" enum(pet, owner, organization, user),
  "profile_picture_link" char(500),
  PRIMARY KEY ("user_id")
);

CREATE TABLE "UserMessage" (
  "message_id" int(50),
  "sender_id" int(25),
  "recipient_id" int(25),
  PRIMARY KEY ("message_id"),
  CONSTRAINT "FK_UserMessage_recipient_id"
    FOREIGN KEY ("recipient_id")
      REFERENCES "User"("profile_picture_link"),
  CONSTRAINT "FK_UserMessage_sender_id"
    FOREIGN KEY ("sender_id")
      REFERENCES "User"("profile_picture_link")
);

CREATE TABLE "JobCategory" (
  "job_category_id" int(5),
  "category_name" char(50),
  PRIMARY KEY ("job_category_id")
);

CREATE TABLE "BadgeContent" (
  "badge_id" int(25),
  "badge_name" char(100),
  "badge_image_link" char(200),
  PRIMARY KEY ("badge_id")
);

CREATE TABLE "SkillCategory" (
  "skill_category_id" int(5),
  "category_name" char(50),
  PRIMARY KEY ("skill_category_id")
);

CREATE TABLE "SkillCategoryByUser" (
  "skill_category_id" int(5),
  "user_id" int(25),
  PRIMARY KEY ("skill_category_id", "user_id"),
  CONSTRAINT "FK_SkillCategoryByUser_skill_category_id"
    FOREIGN KEY ("skill_category_id")
      REFERENCES "SkillCategory"("skill_category_id"),
  CONSTRAINT "FK_SkillCategoryByUser_user_id"
    FOREIGN KEY ("user_id")
      REFERENCES "User"("profile_picture_link")
);

CREATE TABLE "PaymentType" (
  "payment_id" int(25),
  "payment_name" char(50),
  PRIMARY KEY ("payment_id")
);

CREATE TABLE "JobPayment" (
  "job_id" int(25),
  "payment_id" int(25),
  "payment_quantity" int(25),
  PRIMARY KEY ("job_id"),
  CONSTRAINT "FK_JobPayment_payment_id"
    FOREIGN KEY ("payment_id")
      REFERENCES "PaymentType"("payment_id")
);

CREATE TABLE "JobCategoryByUser" (
  "job_category_id" int(5),
  "user_id" int(25),
  PRIMARY KEY ("job_category_id", "user_id"),
  CONSTRAINT "FK_JobCategoryByUser_job_category_id"
    FOREIGN KEY ("job_category_id")
      REFERENCES "JobCategory"("job_category_id"),
  CONSTRAINT "FK_JobCategoryByUser_user_id"
    FOREIGN KEY ("user_id")
      REFERENCES "User"("profile_picture_link")
);

CREATE TABLE "LeaderboardContent" (
  "leaderboard_id" int(25),
  "reward_badge_id" int(25),
  "start_time" char(100),
  "end_time" char(100),
  PRIMARY KEY ("leaderboard_id")
);

CREATE TABLE "UserBadge" (
  "user_id" int(25),
  "badge_id" int(25),
  PRIMARY KEY ("user_id", "badge_id"),
  CONSTRAINT "FK_UserBadge_badge_id"
    FOREIGN KEY ("badge_id")
      REFERENCES "BadgeContent"("badge_id")
);

CREATE TABLE "CertificationContent" (
  "certification_id" int(25),
  "certification_name" char(100),
  "company" char(100),
  PRIMARY KEY ("certification_id")
);

CREATE TABLE "JobContent" (
  "job_id" int(25),
  "description" char(500),
  "datetime" char(100),
  "duration" int(20),
  "zipcode" int(5),
  "employee_num" int(5),
  "job_filled" boolean,
  PRIMARY KEY ("job_id")
);

CREATE TABLE "SkillCategoriesByJob" (
  "job_id" int(25),
  "skill_category_id" int(5),
  PRIMARY KEY ("job_id", "skill_category_id"),
  CONSTRAINT "FK_SkillCategoriesByJob_skill_category_id"
    FOREIGN KEY ("skill_category_id")
      REFERENCES "SkillCategory"("skill_category_id"),
  CONSTRAINT "FK_SkillCategoriesByJob_job_id"
    FOREIGN KEY ("job_id")
      REFERENCES "JobContent"("job_filled")
);

CREATE TABLE "JobReview" (
  "review_id" int(50),
  "job_id" int(25),
  PRIMARY KEY ("review_id")
);

CREATE TABLE "ReviewContent" (
  "review_id" int(25),
  "punctuality" int(1),
  "quality" int(1),
  "friendliness" int(1),
  "comments" char(1000),
  "datetime" char(100),
  "verified" boolean,
  PRIMARY KEY ("review_id")
);

CREATE TABLE "OrganizationMember" (
  "org_id" int(25),
  "user_id" int(25),
  PRIMARY KEY ("org_id", "user_id"),
  CONSTRAINT "FK_OrganizationMember_org_id"
    FOREIGN KEY ("org_id")
      REFERENCES "User"("profile_picture_link"),
  CONSTRAINT "FK_OrganizationMember_user_id"
    FOREIGN KEY ("user_id")
      REFERENCES "User"("profile_picture_link")
);

CREATE TABLE "EmployerJob" (
  "job_id" int(25),
  "employer_id" int(25),
  PRIMARY KEY ("job_id"),
  CONSTRAINT "FK_EmployerJob_employer_id"
    FOREIGN KEY ("employer_id")
      REFERENCES "User"("user_id")
);

CREATE TABLE "JobCategoriesByJob" (
  "job_id" int(25),
  "job_category_id" int(5),
  PRIMARY KEY ("job_id", "job_category_id"),
  CONSTRAINT "FK_JobCategoriesByJob_job_id"
    FOREIGN KEY ("job_id")
      REFERENCES "JobContent"("job_filled"),
  CONSTRAINT "FK_JobCategoriesByJob_job_category_id"
    FOREIGN KEY ("job_category_id")
      REFERENCES "JobCategory"("job_category_id")
);

CREATE TABLE "MessageContent" (
  "message_id" int(50),
  "message_content" char(1000),
  "datetime" char(100),
  PRIMARY KEY ("message_id")
);

CREATE TABLE "AchievementMetric" (
  "metric_id" int(25),
  "metric_name" char(100),
  "description" char(250),
  PRIMARY KEY ("metric_id")
);

CREATE TABLE "AchievementContent" (
  "achievement_id" int(25),
  "achievement_name" char(100),
  "metric_id" int(25),
  "badge_id" int(25),
  "required_quantity" int(25),
  PRIMARY KEY ("achievement_id"),
  CONSTRAINT "FK_AchievementContent_metric_id"
    FOREIGN KEY ("metric_id")
      REFERENCES "AchievementMetric"("metric_id")
);

CREATE TABLE "UserAchievement" (
  "user_id" int(25),
  "achivement_id" int(25),
  PRIMARY KEY ("user_id", "achivement_id"),
  CONSTRAINT "FK_UserAchievement_achivement_id"
    FOREIGN KEY ("achivement_id")
      REFERENCES "AchievementContent"("achievement_id")
);

CREATE TABLE "UserSpecies" (
  "user_id" int(25),
  "species" char(100),
  PRIMARY KEY ("user_id")
);

CREATE TABLE "PetOwner" (
  "owner_id" int(25),
  "pet_id" int(25),
  PRIMARY KEY ("owner_id", "pet_id"),
  CONSTRAINT "FK_PetOwner_pet_id"
    FOREIGN KEY ("pet_id")
      REFERENCES "User"("profile_picture_link"),
  CONSTRAINT "FK_PetOwner_owner_id"
    FOREIGN KEY ("owner_id")
      REFERENCES "User"("profile_picture_link")
);

CREATE TABLE "EmployeeJob" (
  "job_id" int(25),
  "employee_id" int(25),
  PRIMARY KEY ("job_id", "employee_id"),
  CONSTRAINT "FK_EmployeeJob_job_id"
    FOREIGN KEY ("job_id")
      REFERENCES "JobContent"("job_id")
);

CREATE TABLE "UserSecurityAnswer" (
  "user_id" int(25),
  "question_id" int(25),
  "answer_text" char(100),
  PRIMARY KEY ("user_id", "question_id")
);

CREATE TABLE "UserCertification" (
  "user_id" int(25),
  "certification_id" int(25),
  PRIMARY KEY ("user_id", "certification_id"),
  CONSTRAINT "FK_UserCertification_certification_id"
    FOREIGN KEY ("certification_id")
      REFERENCES "CertificationContent"("certification_id")
);

CREATE TABLE "UserReview" (
  "review_id" int(25),
  "user_id" int(25),
  PRIMARY KEY ("review_id")
);

