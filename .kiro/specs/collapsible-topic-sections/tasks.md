# Implementation Plan: Collapsible Topic Sections

## Overview

This implementation adds collapsible/expandable topic sections to the Admin Dashboard using React state management. The solution enhances the existing topic grouping with interactive headers, visual indicators, smooth animations, and accessibility features. All topics will start collapsed by default, and their state will persist during the user's session.

## Tasks

- [x] 1. Add state management for collapsible topics
  - Add `collapsedTopics` state using `useState` hook to track collapsed/expanded state for each topic
  - Initialize all topics as collapsed (true) when questions load using `useEffect`
  - Implement `toggleTopic` function to toggle individual topic states
  - Ensure state updates preserve existing topic states when questions are added/edited/deleted
  - _Requirements: 1.1, 1.2, 1.5, 4.1, 4.2, 4.3, 4.4_

- [ ]* 1.1 Write unit tests for state management
  - Test initial state sets all topics to collapsed
  - Test toggleTopic function switches state correctly
  - Test multiple toggles work correctly
  - Test adding new topics initializes them as collapsed
  - Test removing topics cleans up state
  - _Requirements: 1.1, 1.5, 4.1, 4.2, 4.3_

- [x] 2. Implement interactive topic header component
  - Replace static `<h4>` topic header with interactive `<button>` element
  - Add onClick handler to call `toggleTopic` function
  - Add onKeyDown handler for Enter and Space keys (prevent default for Space)
  - Style button with full width, left-aligned text, gradient background, padding, and border-radius
  - Add cursor pointer and hover effects (brightness filter)
  - _Requirements: 1.2, 2.3, 3.1, 3.2, 3.3, 5.1, 5.2, 7.1_

- [ ]* 2.1 Write unit tests for topic header interaction
  - Test clicking topic header toggles state
  - Test Enter key toggles state
  - Test Space key toggles state and prevents page scroll
  - Test clicking one topic doesn't affect other topics
  - _Requirements: 1.2, 1.5, 3.2, 5.1, 5.2_

- [x] 3. Add visual indicators to topic header
  - Add collapse/expand icon (▶) that rotates 90 degrees when expanded
  - Use CSS transform with 0.3s ease transition for smooth rotation
  - Add question count badge displaying number of questions in topic
  - Style badge with surface background, padding, border-radius, and smaller font size
  - Display topic name with bold font weight
  - _Requirements: 2.1, 2.2, 2.4, 7.1_

- [ ]* 3.1 Write unit tests for visual indicators
  - Test collapse icon renders when topic is collapsed
  - Test expand icon renders when topic is expanded
  - Test question count badge displays correct number
  - Test question count badge shows singular "question" vs plural "questions"
  - _Requirements: 2.1, 2.2, 2.4_

- [x] 4. Implement collapsible question list with animations
  - Wrap question list in a `<div>` with conditional rendering based on `isCollapsed` state
  - Add `max-height` transition (0 when collapsed, 10000px when expanded)
  - Add opacity transition (0 when collapsed, 1 when expanded)
  - Set transition duration to 0.3s ease for both properties
  - Add overflow hidden to prevent content overflow during animation
  - Adjust topic header margin-bottom (0 when collapsed, 1rem when expanded)
  - _Requirements: 1.3, 1.4, 3.4, 7.4_

- [ ]* 4.1 Write unit tests for collapsible behavior
  - Test questions are hidden when topic is collapsed
  - Test questions are visible when topic is expanded
  - Test animation classes are applied correctly
  - _Requirements: 1.3, 1.4, 3.4_

- [x] 5. Add accessibility attributes and keyboard support
  - Add `aria-expanded` attribute to topic header button (reflects current state)
  - Add `aria-controls` attribute linking header to question list container
  - Add unique `id` to question list container (`topic-${topicName}-questions`)
  - Add visible focus indicator styles (2px solid outline with 2px offset)
  - Add `:focus-visible` styles to show focus only for keyboard navigation
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [ ]* 5.1 Write accessibility tests
  - Test aria-expanded is "false" when collapsed
  - Test aria-expanded is "true" when expanded
  - Test aria-controls links to correct question list id
  - Test topic header is keyboard focusable
  - Test focus indicator is visible when focused
  - _Requirements: 5.3, 5.4_

- [x] 6. Handle empty topic sections
  - Check if topic has zero questions (`questionCount === 0`)
  - When expanded and empty, display styled message "No questions in this topic yet"
  - Style empty message with padding, surface background, border-radius, left margin, muted text color, and italic font
  - Ensure empty topics still display topic header with "0 questions" badge
  - _Requirements: 6.1, 6.2, 6.3_

- [ ]* 6.1 Write unit tests for empty topics
  - Test empty topic header displays with "0 questions" badge
  - Test expanding empty topic shows "No questions in this topic yet" message
  - Test empty topic can be collapsed and expanded
  - _Requirements: 6.1, 6.2, 6.3_

- [x] 7. Add CSS styles for hover and focus states
  - Add `.topic-header:hover` style with brightness filter (1.1)
  - Add `.topic-header:focus` style with 2px solid primary outline and 2px offset
  - Add `.topic-header:focus:not(:focus-visible)` to remove outline for mouse clicks
  - Add `.topic-header:focus-visible` to show outline only for keyboard navigation
  - Ensure styles integrate with existing CSS variables (--primary, --surface, --text-muted)
  - _Requirements: 2.3, 3.1, 5.4, 7.1, 7.2, 7.3_

- [ ]* 7.1 Write visual regression tests
  - Test hover state styling
  - Test focus state styling
  - Test collapsed state appearance
  - Test expanded state appearance
  - _Requirements: 2.3, 5.4, 7.1, 7.2, 7.3_

- [x] 8. Ensure state preservation during CRUD operations
  - Verify `collapsedTopics` state is NOT reset when `fetchQuestions()` is called
  - Update `useEffect` to only add new topics as collapsed, not reset existing states
  - Remove topics from state when they no longer exist in questions array
  - Test state preservation after adding a question
  - Test state preservation after editing a question
  - Test state preservation after deleting a question
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [ ]* 8.1 Write integration tests for state preservation
  - Test adding question preserves topic states
  - Test editing question preserves topic states
  - Test deleting question preserves topic states
  - Test deleting all questions in a topic removes that topic from state
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [x] 9. Checkpoint - Verify functionality and accessibility
  - Ensure all tests pass
  - Manually test with keyboard navigation (Tab, Enter, Space)
  - Verify smooth animations (300ms transitions)
  - Verify visual consistency with existing dashboard design
  - Ask the user if questions arise

- [x] 10. Final integration and polish
  - Review all code for consistency with existing AdminDashboard component style
  - Ensure all CSS variables are used correctly (--primary, --surface, --text-muted, --success, --danger)
  - Verify no console errors or warnings
  - Ensure component performance is acceptable with 50+ questions across 10+ topics
  - _Requirements: 7.1, 7.2, 7.3, 7.4_

- [ ]* 10.1 Write end-to-end integration tests
  - Test full user workflow: load dashboard → all topics collapsed
  - Test expand topic → see questions
  - Test add question → topic state preserved
  - Test edit question → topic state preserved
  - Test delete question → topic state preserved
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 4.1, 4.2, 4.3, 4.4_

- [x] 11. Final checkpoint - Complete feature verification
  - Ensure all tests pass
  - Verify all requirements are met
  - Ask the user if questions arise

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- The implementation uses React hooks (useState, useEffect) for state management
- All animations use CSS transitions for smooth visual feedback
- Accessibility is built-in from the start with ARIA attributes and keyboard support
- State persists during the session but resets on page reload (no localStorage required)
- The solution maintains visual consistency with the existing dashboard design
