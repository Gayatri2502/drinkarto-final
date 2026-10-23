CREATE TABLE "CommunityReview" (
 "id" text PRIMARY KEY,
 "userId" text NOT NULL REFERENCES "User"("id"),
 "placeId" text NOT NULL,
 "placeName" text NOT NULL,
 "rating" integer NOT NULL CHECK ("rating" BETWEEN 1 AND 5),
 "body" text NOT NULL,
 "photoPath" text,
 "status" text NOT NULL DEFAULT 'PENDING' CHECK ("status" IN ('PENDING','APPROVED','REJECTED')),
 "createdAt" timestamptz NOT NULL DEFAULT now(),
 "reviewedBy" text,
 UNIQUE ("userId","placeId")
);
CREATE TABLE "CommunityPoint" (
 "reviewId" text PRIMARY KEY REFERENCES "CommunityReview"("id"),
 "userId" text NOT NULL REFERENCES "User"("id"),
 "points" integer NOT NULL CHECK ("points"=10),
 "createdAt" timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX "CommunityReview_place_status" ON "CommunityReview" ("placeId","status");
ALTER TABLE "CommunityReview" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "CommunityPoint" ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
 IF EXISTS (SELECT FROM pg_roles WHERE rolname='anon') THEN
  REVOKE ALL ON "CommunityReview", "CommunityPoint" FROM anon;
 END IF;
 IF EXISTS (SELECT FROM pg_roles WHERE rolname='authenticated') THEN
  REVOKE ALL ON "CommunityReview", "CommunityPoint" FROM authenticated;
 END IF;
END $$;
