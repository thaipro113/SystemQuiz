# Question Delete Error Fix - Bugfix Design

## Overview

This design addresses the foreign key constraint violation that occurs when attempting to delete questions that have been used in quiz results. The current implementation uses `DeleteBehavior.Restrict` on the `ResultDetail.QuestionId` foreign key, which prevents deletion of questions referenced by historical quiz data.

The fix will change the delete behavior from `Restrict` to `SetNull`, allowing questions to be deleted while preserving historical quiz result data. When a question is deleted, the `QuestionId` field in `ResultDetail` records will be set to null, maintaining the integrity of quiz results while allowing administrators to manage questions effectively.

## Glossary

- **Bug_Condition (C)**: The condition that triggers the bug - when an administrator attempts to delete a question that has associated ResultDetail records
- **Property (P)**: The desired behavior when the bug condition occurs - the question should be deleted successfully and ResultDetail.QuestionId should be set to null
- **Preservation**: Existing deletion behavior for questions without result details, answer cascade deletion, and authorization checks must remain unchanged
- **DeleteQuestionAsync**: The method in `QuestionService.cs` that handles question deletion
- **ResultDetail**: The entity in `SystemQuiz/Models/ResultDetail.cs` that stores individual question responses in quiz results
- **QuizDbContext**: The database context in `SystemQuiz/Models/QuizDbContext.cs` that configures entity relationships and delete behaviors
- **DeleteBehavior.Restrict**: Current EF Core configuration that prevents deletion of referenced entities
- **DeleteBehavior.SetNull**: Proposed EF Core configuration that sets foreign key to null when referenced entity is deleted

## Bug Details

### Bug Condition

The bug manifests when an administrator attempts to delete a question that has been used in one or more quiz results. The `DeleteQuestionAsync` method in `QuestionService.cs` attempts to remove the question, but Entity Framework Core throws a `DbUpdateException` due to the foreign key constraint configured with `DeleteBehavior.Restrict` in `QuizDbContext.OnModelCreating`.

**Formal Specification:**
```
FUNCTION isBugCondition(input)
  INPUT: input of type DeleteQuestionRequest { questionId: int }
  OUTPUT: boolean
  
  RETURN EXISTS(rd IN ResultDetails WHERE rd.QuestionId == input.questionId)
         AND DeleteBehavior == Restrict
         AND deleteOperationAttempted == true
END FUNCTION
```

### Examples

- **Example 1**: Admin deletes question ID 5 which was used in 3 quiz results → Database throws foreign key constraint violation → User sees "Error deleting question" alert
- **Example 2**: Admin deletes question ID 12 which was used in 15 quiz results across multiple users → Operation fails with DbUpdateException → Question remains in database
- **Example 3**: Admin deletes question ID 8 which was used in 1 quiz result → Constraint prevents deletion → No feedback about why deletion failed
- **Edge Case**: Admin deletes question ID 20 which has NO associated result details → Deletion succeeds normally (this behavior should be preserved)

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**
- Questions without associated result details must continue to delete successfully
- Answer entities associated with deleted questions must continue to be cascade deleted
- Authorization checks for admin-only deletion must remain enforced
- Non-existent question IDs must continue to return "Not Found" responses
- Quiz result display functionality must continue to show accurate historical data

**Scope:**
All deletion operations that do NOT involve questions with associated result details should be completely unaffected by this fix. This includes:
- Deletion of newly created questions that have never been used in quizzes
- Deletion of answers when their parent question is deleted
- Authorization failures for non-admin users
- Not found responses for invalid question IDs

## Hypothesized Root Cause

Based on the bug description and code analysis, the root cause is:

1. **Restrictive Delete Behavior**: The `QuizDbContext.OnModelCreating` method configures the `ResultDetail.QuestionId` foreign key with `DeleteBehavior.Restrict`, which explicitly prevents deletion of questions that are referenced by any `ResultDetail` records.

2. **No Null Handling in ResultDetail**: The `ResultDetail.QuestionId` property is defined as a non-nullable `int`, which prevents the use of `DeleteBehavior.SetNull` without schema changes.

3. **Missing Error Handling**: The `DeleteQuestionAsync` method does not catch or handle the `DbUpdateException` that occurs when the foreign key constraint is violated, resulting in a generic error message to the user.

4. **Design Decision**: The original design prioritized referential integrity over administrative flexibility, assuming that questions should never be deleted once used in quizzes.

## Correctness Properties

Property 1: Bug Condition - Question Deletion with Result Details

_For any_ delete request where a question has associated ResultDetail records (isBugCondition returns true), the fixed DeleteQuestionAsync method SHALL successfully delete the question and set all ResultDetail.QuestionId foreign keys to null, preserving the historical quiz result data while removing the question from the system.

**Validates: Requirements 2.1, 2.2, 2.3**

Property 2: Preservation - Question Deletion without Result Details

_For any_ delete request where a question does NOT have associated ResultDetail records (isBugCondition returns false), the fixed code SHALL produce exactly the same behavior as the original code, successfully deleting the question and its associated answers without any changes to the deletion logic or outcome.

**Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5**

## Fix Implementation

### Changes Required

Assuming our root cause analysis is correct:

**File**: `SystemQuiz/Models/ResultDetail.cs`

**Changes**:
1. **Make QuestionId Nullable**: Change `public int QuestionId { get; set; }` to `public int? QuestionId { get; set; }` to allow null values when questions are deleted
2. **Make Question Navigation Property Nullable**: Change `public Question Question { get; set; }` to `public Question? Question { get; set; }` to reflect the nullable foreign key

**File**: `SystemQuiz/Models/QuizDbContext.cs`

**Method**: `OnModelCreating`

**Specific Changes**:
1. **Change Delete Behavior**: Modify the `ResultDetail.QuestionId` foreign key configuration from `DeleteBehavior.Restrict` to `DeleteBehavior.SetNull`
   - Change: `.OnDelete(DeleteBehavior.Restrict)` → `.OnDelete(DeleteBehavior.SetNull)`
   - This allows questions to be deleted while preserving result details with null question references

2. **Maintain Other Constraints**: Keep `DeleteBehavior.Restrict` for `ResultDetail.AnwserId` and `ResultDetail.ResultId` foreign keys unchanged, as these entities should not be deleted independently

**File**: `SystemQuiz/Services/QuestionService.cs`

**Method**: `DeleteQuestionAsync`

**Specific Changes**:
1. **No Changes Required**: The existing deletion logic will work correctly once the database schema and delete behavior are updated. The method already loads the question with its answers and removes them appropriately.

**Database Migration**:
1. **Create Migration**: Generate a new EF Core migration to update the `ResultDetails` table schema
   - Command: `dotnet ef migrations add AllowNullQuestionInResultDetail`
2. **Apply Migration**: Update the database schema to make `QuestionId` nullable
   - Command: `dotnet ef database update`

## Testing Strategy

### Validation Approach

The testing strategy follows a two-phase approach: first, surface counterexamples that demonstrate the bug on unfixed code, then verify the fix works correctly and preserves existing behavior.

### Exploratory Bug Condition Checking

**Goal**: Surface counterexamples that demonstrate the bug BEFORE implementing the fix. Confirm or refute the root cause analysis. If we refute, we will need to re-hypothesize.

**Test Plan**: Write integration tests that create questions, use them in quiz results, then attempt to delete them. Run these tests on the UNFIXED code to observe the foreign key constraint violation and confirm the root cause.

**Test Cases**:
1. **Single Result Detail Test**: Create a question, use it in one quiz result, attempt to delete → Should throw DbUpdateException on unfixed code
2. **Multiple Result Details Test**: Create a question, use it in multiple quiz results, attempt to delete → Should throw DbUpdateException on unfixed code
3. **Mixed Scenario Test**: Create multiple questions, use some in results, attempt to delete all → Should fail for questions with results, succeed for others on unfixed code
4. **Concurrent Usage Test**: Create a question used by multiple users in different quiz sessions, attempt to delete → Should throw DbUpdateException on unfixed code

**Expected Counterexamples**:
- `DbUpdateException` with message indicating foreign key constraint violation
- Possible causes: `DeleteBehavior.Restrict` on `ResultDetail.QuestionId`, non-nullable `QuestionId` field

### Fix Checking

**Goal**: Verify that for all inputs where the bug condition holds, the fixed function produces the expected behavior.

**Pseudocode:**
```
FOR ALL input WHERE isBugCondition(input) DO
  result := DeleteQuestionAsync_fixed(input.questionId)
  ASSERT result == true
  ASSERT NOT EXISTS(q IN Questions WHERE q.Id == input.questionId)
  ASSERT ALL(rd IN ResultDetails WHERE rd.QuestionId WAS input.questionId HAVE rd.QuestionId == null)
END FOR
```

### Preservation Checking

**Goal**: Verify that for all inputs where the bug condition does NOT hold, the fixed function produces the same result as the original function.

**Pseudocode:**
```
FOR ALL input WHERE NOT isBugCondition(input) DO
  ASSERT DeleteQuestionAsync_original(input) = DeleteQuestionAsync_fixed(input)
END FOR
```

**Testing Approach**: Property-based testing is recommended for preservation checking because:
- It generates many test cases automatically across the input domain
- It catches edge cases that manual unit tests might miss
- It provides strong guarantees that behavior is unchanged for all non-buggy inputs

**Test Plan**: Observe behavior on UNFIXED code first for questions without result details, then write property-based tests capturing that behavior.

**Test Cases**:
1. **Unused Question Deletion**: Observe that deleting questions without result details succeeds on unfixed code, then verify this continues after fix
2. **Answer Cascade Deletion**: Observe that answers are deleted when their question is deleted on unfixed code, then verify this continues after fix
3. **Authorization Enforcement**: Observe that non-admin users cannot delete questions on unfixed code, then verify this continues after fix
4. **Not Found Handling**: Observe that deleting non-existent questions returns false on unfixed code, then verify this continues after fix

### Unit Tests

- Test deletion of questions with no result details (should succeed)
- Test deletion of questions with one result detail (should succeed and set QuestionId to null)
- Test deletion of questions with multiple result details (should succeed and set all QuestionIds to null)
- Test that answers are cascade deleted when question is deleted
- Test that result details remain in database after question deletion
- Test that quiz result display handles null QuestionId gracefully

### Property-Based Tests

- Generate random question sets and randomly assign some to result details, verify deletion works correctly for all
- Generate random quiz result configurations and verify that deleting questions preserves result integrity
- Test that all non-deletion operations (create, update, read) continue to work across many scenarios

### Integration Tests

- Test full admin workflow: create question → use in quiz → delete question → verify result history preserved
- Test multiple users taking quizzes with same questions, then admin deletes questions
- Test that quiz result display shows appropriate message when question is deleted (e.g., "Question no longer available")
- Test database consistency after multiple question deletions with various result detail configurations
