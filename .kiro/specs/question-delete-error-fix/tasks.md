# Implementation Plan

- [x] 1. Write bug condition exploration test
  - **Property 1: Bug Condition** - Question Deletion with Result Details
  - **CRITICAL**: This test MUST FAIL on unfixed code - failure confirms the bug exists
  - **DO NOT attempt to fix the test or the code when it fails**
  - **NOTE**: This test encodes the expected behavior - it will validate the fix when it passes after implementation
  - **GOAL**: Surface counterexamples that demonstrate the bug exists
  - **Scoped PBT Approach**: For deterministic bugs, scope the property to the concrete failing case(s) to ensure reproducibility
  - Create an integration test that:
    - Creates a question with answers
    - Uses the question in a quiz result (creates Result and ResultDetail records)
    - Attempts to delete the question via DeleteQuestionAsync
  - Test should assert that deletion succeeds and ResultDetail.QuestionId is set to null
  - Run test on UNFIXED code (current code with DeleteBehavior.Restrict)
  - **EXPECTED OUTCOME**: Test FAILS with DbUpdateException (this is correct - it proves the bug exists)
  - Document the counterexample: "DeleteQuestionAsync throws DbUpdateException when deleting question ID X that has Y associated ResultDetail records"
  - Mark task complete when test is written, run, and failure is documented
  - _Requirements: 1.1, 1.2, 1.3_

- [x] 2. Write preservation property tests (BEFORE implementing fix)
  - **Property 2: Preservation** - Question Deletion without Result Details
  - **IMPORTANT**: Follow observation-first methodology
  - Observe behavior on UNFIXED code for non-buggy inputs (questions without result details)
  - Create integration tests that verify:
    - Deleting questions without result details succeeds
    - Associated answers are cascade deleted
    - Non-existent question IDs return false
    - Authorization checks remain enforced (if testable)
  - Write property-based tests capturing observed behavior patterns:
    - For all questions without ResultDetail records, deletion succeeds
    - For all questions with answers but no ResultDetail records, answers are deleted
  - Run tests on UNFIXED code
  - **EXPECTED OUTCOME**: Tests PASS (this confirms baseline behavior to preserve)
  - Mark task complete when tests are written, run, and passing on unfixed code
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 3. Fix for question deletion with result details

  - [x] 3.1 Update ResultDetail model to allow nullable QuestionId
    - Change `public int QuestionId { get; set; }` to `public int? QuestionId { get; set; }` in SystemQuiz/Models/ResultDetail.cs
    - Change `public Question Question { get; set; }` to `public Question? Question { get; set; }` in SystemQuiz/Models/ResultDetail.cs
    - This allows the foreign key to be set to null when questions are deleted
    - _Bug_Condition: isBugCondition(input) where EXISTS(rd IN ResultDetails WHERE rd.QuestionId == input.questionId) AND DeleteBehavior == Restrict_
    - _Expected_Behavior: Question deletion succeeds and ResultDetail.QuestionId is set to null_
    - _Preservation: Questions without result details continue to delete successfully, answers cascade delete_
    - _Requirements: 2.1, 2.2, 2.3, 3.1, 3.2, 3.3, 3.4, 3.5_

  - [x] 3.2 Update QuizDbContext to change delete behavior
    - Change `.OnDelete(DeleteBehavior.Restrict)` to `.OnDelete(DeleteBehavior.SetNull)` for ResultDetail.QuestionId foreign key in SystemQuiz/Models/QuizDbContext.cs
    - Keep DeleteBehavior.Restrict for ResultDetail.AnwserId and ResultDetail.ResultId unchanged
    - This allows questions to be deleted while preserving result details with null question references
    - _Bug_Condition: isBugCondition(input) where EXISTS(rd IN ResultDetails WHERE rd.QuestionId == input.questionId) AND DeleteBehavior == Restrict_
    - _Expected_Behavior: Question deletion succeeds and ResultDetail.QuestionId is set to null_
    - _Preservation: Other foreign key constraints remain unchanged_
    - _Requirements: 2.1, 2.2, 2.3, 3.1, 3.2, 3.3, 3.4, 3.5_

  - [x] 3.3 Create and apply database migration
    - Run `dotnet ef migrations add AllowNullQuestionInResultDetail` in SystemQuiz directory
    - Run `dotnet ef database update` to apply the migration
    - Verify migration creates nullable QuestionId column in ResultDetails table
    - _Bug_Condition: isBugCondition(input) where EXISTS(rd IN ResultDetails WHERE rd.QuestionId == input.questionId)_
    - _Expected_Behavior: Database schema allows null QuestionId values_
    - _Preservation: Existing data and other table structures remain unchanged_
    - _Requirements: 2.1, 2.2, 2.3_

  - [x] 3.4 Verify bug condition exploration test now passes
    - **Property 1: Expected Behavior** - Question Deletion with Result Details
    - **IMPORTANT**: Re-run the SAME test from task 1 - do NOT write a new test
    - The test from task 1 encodes the expected behavior
    - When this test passes, it confirms the expected behavior is satisfied
    - Run bug condition exploration test from step 1
    - **EXPECTED OUTCOME**: Test PASSES (confirms bug is fixed)
    - Verify that:
      - DeleteQuestionAsync returns true
      - Question is removed from database
      - ResultDetail records remain with QuestionId set to null
    - _Requirements: 2.1, 2.2, 2.3_

  - [x] 3.5 Verify preservation tests still pass
    - **Property 2: Preservation** - Question Deletion without Result Details
    - **IMPORTANT**: Re-run the SAME tests from task 2 - do NOT write new tests
    - Run preservation property tests from step 2
    - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions)
    - Confirm all tests still pass after fix:
      - Questions without result details delete successfully
      - Answers are cascade deleted
      - Non-existent question IDs return false
      - Authorization checks remain enforced
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 4. Checkpoint - Ensure all tests pass
  - Run all tests (bug condition + preservation)
  - Verify no regressions in existing functionality
  - Confirm question deletion works for both scenarios:
    - Questions with result details (bug condition - now fixed)
    - Questions without result details (preservation - unchanged)
  - Ask the user if questions arise
