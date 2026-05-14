# Design Document: Collapsible Topic Sections

## Overview

This design implements collapsible/expandable topic sections in the Admin Dashboard to improve usability when managing large numbers of questions across multiple topics. The solution adds interactive topic headers with visual indicators and maintains section state throughout the user's session.

### Key Design Decisions

1. **React State Management**: Use React's `useState` hook to track collapsed/expanded state for each topic independently
2. **Default Collapsed State**: All sections start collapsed to minimize initial visual clutter
3. **Session-Only Persistence**: State persists during the session but resets on page reload (no localStorage/backend persistence required)
4. **CSS Transitions**: Use CSS transitions for smooth expand/collapse animations
5. **Accessibility-First**: Implement proper ARIA attributes and keyboard navigation from the start

## Architecture

### Component Structure

The AdminDashboard component will be enhanced with:

```
AdminDashboard
├── State Management
│   ├── questions (existing)
│   ├── collapsedTopics (new) - Map<string, boolean>
│   └── other existing state
├── Topic Sections (enhanced)
│   ├── TopicHeader (new sub-component or inline)
│   │   ├── Collapse/Expand Icon
│   │   ├── Topic Name
│   │   ├── Question Count Badge
│   │   └── Click Handler
│   └── QuestionList (conditional render)
└── Existing Form and Controls
```

### State Management Strategy

**Collapsed Topics State:**
```javascript
const [collapsedTopics, setCollapsedTopics] = useState({});
```

- Key: topic name (string)
- Value: boolean (true = collapsed, false/undefined = expanded)
- Default behavior: All topics start collapsed (initialized on first render)

**State Initialization:**
When questions load, initialize all topics as collapsed:
```javascript
useEffect(() => {
  const topics = [...new Set(questions.map(q => q.topic || 'General'))];
  const initialState = {};
  topics.forEach(topic => {
    initialState[topic] = true; // true = collapsed
  });
  setCollapsedTopics(initialState);
}, [questions]);
```

**Toggle Function:**
```javascript
const toggleTopic = (topicName) => {
  setCollapsedTopics(prev => ({
    ...prev,
    [topicName]: !prev[topicName]
  }));
};
```

## Components and Interfaces

### Enhanced Topic Section Rendering

**Current Implementation:**
```jsx
{[...new Set(questions.map(q => q.topic || 'General'))].map(topicName => (
  <div key={topicName}>
    <h4>Topic: {topicName}</h4>
    {questions.filter(q => (q.topic || 'General') === topicName).map(q => (
      // Question card
    ))}
  </div>
))}
```

**New Implementation:**
```jsx
{[...new Set(questions.map(q => q.topic || 'General'))].map(topicName => {
  const topicQuestions = questions.filter(q => (q.topic || 'General') === topicName);
  const isCollapsed = collapsedTopics[topicName] ?? true;
  const questionCount = topicQuestions.length;

  return (
    <div key={topicName} style={{ marginBottom: '2rem' }}>
      {/* Interactive Topic Header */}
      <button
        onClick={() => toggleTopic(topicName)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleTopic(topicName);
          }
        }}
        aria-expanded={!isCollapsed}
        aria-controls={`topic-${topicName}-questions`}
        style={{
          width: '100%',
          textAlign: 'left',
          background: 'linear-gradient(90deg, var(--primary) 0%, transparent 100%)',
          padding: '0.75rem 1rem',
          borderRadius: '0.5rem',
          marginBottom: isCollapsed ? '0' : '1rem',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          transition: 'all 0.2s ease',
        }}
        className="topic-header"
      >
        {/* Collapse/Expand Icon */}
        <span style={{ 
          fontSize: '1rem',
          transition: 'transform 0.3s ease',
          transform: isCollapsed ? 'rotate(0deg)' : 'rotate(90deg)',
        }}>
          ▶
        </span>
        
        {/* Topic Name */}
        <span style={{ flex: 1, fontWeight: 'bold' }}>
          Topic: {topicName}
        </span>
        
        {/* Question Count Badge */}
        <span style={{
          background: 'var(--surface)',
          padding: '0.25rem 0.75rem',
          borderRadius: '1rem',
          fontSize: '0.875rem',
          fontWeight: 'normal',
        }}>
          {questionCount} {questionCount === 1 ? 'question' : 'questions'}
        </span>
      </button>

      {/* Collapsible Question List */}
      <div
        id={`topic-${topicName}-questions`}
        style={{
          maxHeight: isCollapsed ? '0' : '10000px',
          overflow: 'hidden',
          transition: 'max-height 0.3s ease, opacity 0.3s ease',
          opacity: isCollapsed ? '0' : '1',
        }}
      >
        {questionCount === 0 ? (
          <div style={{
            padding: '1.5rem',
            background: 'var(--surface)',
            borderRadius: '0.5rem',
            marginLeft: '1rem',
            marginTop: '1rem',
            color: 'var(--text-muted)',
            fontStyle: 'italic',
          }}>
            No questions in this topic yet
          </div>
        ) : (
          topicQuestions.map((q) => (
            // Existing question card rendering
          ))
        )}
      </div>
    </div>
  );
})}
```

### CSS Enhancements

Add to component styles or global CSS:

```css
.topic-header:hover {
  filter: brightness(1.1);
}

.topic-header:focus {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
}

.topic-header:focus:not(:focus-visible) {
  outline: none;
}

.topic-header:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
}
```

## Data Models

No changes to backend data models are required. This is a pure frontend enhancement.

### Frontend State Model

```typescript
interface CollapsedTopicsState {
  [topicName: string]: boolean; // true = collapsed, false = expanded
}
```

## Error Handling

### Edge Cases

1. **Empty Topics**: Display "No questions in this topic yet" message when expanded
2. **New Topics**: When a new question with a new topic is added, initialize that topic as collapsed
3. **Deleted Topics**: When all questions in a topic are deleted, the topic section disappears (existing behavior maintained)
4. **Topic Rename**: If a question's topic is edited, the old topic section updates automatically (React re-renders based on questions array)

### Error Scenarios

1. **State Initialization Failure**: If questions fail to load, collapsedTopics remains empty (graceful degradation)
2. **Rapid Clicking**: React's state batching handles rapid toggle clicks correctly
3. **Keyboard Navigation**: Prevent default behavior for Space key to avoid page scroll

## Testing Strategy

This feature involves UI rendering, interaction, and state management, which are **not suitable for property-based testing**. Instead, we will use:

### Unit Tests (React Testing Library)

**Test Categories:**

1. **Rendering Tests**
   - Verify topic headers render with correct topic names
   - Verify question count badges display correct numbers
   - Verify collapse/expand icons render correctly
   - Verify empty topic message displays when no questions exist

2. **Interaction Tests**
   - Click on topic header toggles collapsed/expanded state
   - Multiple clicks toggle state correctly
   - Clicking one topic doesn't affect other topics
   - Questions are hidden when collapsed
   - Questions are visible when expanded

3. **Keyboard Navigation Tests**
   - Tab key focuses topic headers
   - Enter key toggles collapsed/expanded state
   - Space key toggles collapsed/expanded state
   - Focus indicator is visible

4. **Accessibility Tests**
   - aria-expanded attribute reflects current state
   - aria-controls attribute links header to content
   - Topic headers are keyboard accessible
   - Focus indicators are visible

5. **State Persistence Tests**
   - Adding a question preserves collapsed/expanded states
   - Editing a question preserves collapsed/expanded states
   - Deleting a question preserves collapsed/expanded states
   - Refreshing question list restores previous states

6. **Edge Case Tests**
   - Empty topics display correctly
   - New topics initialize as collapsed
   - All topics start collapsed on initial load

### Integration Tests

1. **Full User Workflow**
   - Load dashboard → all topics collapsed
   - Expand topic → see questions
   - Add question → topic state preserved
   - Edit question → topic state preserved
   - Delete question → topic state preserved

### Visual Regression Tests (Optional)

- Snapshot tests for collapsed state
- Snapshot tests for expanded state
- Snapshot tests for hover states
- Snapshot tests for focus states

### Manual Testing Checklist

- [ ] Visual design matches existing dashboard aesthetic
- [ ] Animations are smooth (300ms transitions)
- [ ] Hover effects work correctly
- [ ] Focus indicators are visible and clear
- [ ] Works with keyboard only (no mouse)
- [ ] Works with screen readers (test ARIA attributes)
- [ ] Performance is acceptable with 50+ questions across 10+ topics

## Implementation Notes

### State Preservation Strategy

The current implementation refreshes questions after add/edit/delete operations:
```javascript
fetchQuestions(); // Refresh list
```

To preserve collapsed/expanded state during these operations:

1. **Don't reset collapsedTopics state** when questions update
2. **Only initialize collapsedTopics** on first load or when new topics appear
3. **Use useEffect with dependency** to detect new topics and add them as collapsed

```javascript
useEffect(() => {
  const currentTopics = [...new Set(questions.map(q => q.topic || 'General'))];
  
  setCollapsedTopics(prev => {
    const updated = { ...prev };
    
    // Add new topics as collapsed
    currentTopics.forEach(topic => {
      if (!(topic in updated)) {
        updated[topic] = true; // New topics start collapsed
      }
    });
    
    // Remove topics that no longer exist
    Object.keys(updated).forEach(topic => {
      if (!currentTopics.includes(topic)) {
        delete updated[topic];
      }
    });
    
    return updated;
  });
}, [questions]);
```

### Animation Performance

Using `max-height` transition is simple but can be janky with very long lists. For better performance with 50+ questions:

**Alternative Approach (if needed):**
- Use `height: auto` with CSS Grid or Flexbox
- Or use a library like `react-collapse` or `framer-motion`
- Or measure actual height with `useRef` and animate to specific pixel value

**Recommended Initial Approach:**
Start with `max-height` transition (simpler, good enough for most cases). Optimize only if performance issues are observed.

### Accessibility Considerations

1. **Button vs Div**: Use `<button>` element for topic header (semantic HTML, keyboard accessible by default)
2. **ARIA Attributes**: 
   - `aria-expanded`: Indicates current state to screen readers
   - `aria-controls`: Links header to content section
3. **Focus Management**: Ensure focus indicator is visible (test with keyboard navigation)
4. **Screen Reader Announcements**: State changes are announced automatically via `aria-expanded`

### Browser Compatibility

- CSS transitions: Supported in all modern browsers
- `aria-expanded`: Supported in all modern browsers
- `transform: rotate()`: Supported in all modern browsers
- No polyfills required

## Future Enhancements (Out of Scope)

1. **Persistent State**: Save collapsed/expanded state to localStorage or backend
2. **Expand/Collapse All**: Add buttons to expand or collapse all topics at once
3. **Animated Height**: Use more sophisticated animation library for smoother transitions
4. **Topic Reordering**: Allow drag-and-drop to reorder topics
5. **Topic Filtering**: Add search/filter to show only specific topics
