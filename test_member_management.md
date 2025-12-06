# Member Management Test

This document demonstrates how the `is_managed_by_member` flag works in the gym management system.

## Test Scenarios

### Scenario 1: Member with Self-Management Enabled (is_managed_by_member = true)

**Member Setup:**

- Member ID: 123
- is_managed_by_member: true

**Allowed Actions:**

1. Member can create their own goals
2. Member can update their own goals
3. Member can delete their own goals
4. Member can create their own workout logs
5. Member can update their own workout logs
6. Member can delete their own workout logs
7. Member can create their own body progress records
8. Member can update their own body progress records
9. Member can delete their own body progress records

**API Examples:**

#### Create Goal by Member

```json
POST /goals
{
  "memberId": 123,
  "goal_type": "Weight Loss",
  "target_value": 10,
  "target_timeline": "2024-12-31",
  "status": "active",
  "completion_percent": 0
}
```

#### Update Goal by Member

```json
PATCH /goals/1
{
  "completion_percent": 50,
  "status": "in_progress"
}
```

#### Create Workout Log by Member

```json
POST /workout-logs
{
  "memberId": 123,
  "exercise_name": "Running",
  "duration": 45,
  "notes": "Good pace",
  "date": "2024-01-15"
}
```

### Scenario 2: Member with Self-Management Disabled (is_managed_by_member = false)

**Member Setup:**

- Member ID: 456
- is_managed_by_member: false

**Allowed Actions:**

1. Only gym owners and assigned trainers can create goals
2. Only gym owners and assigned trainers can update goals
3. Only gym owners and assigned trainers can delete goals
4. Only gym owners and assigned trainers can create workout logs
5. Only gym owners and assigned trainers can update workout logs
6. Only gym owners and assigned trainers can delete workout logs
7. Only gym owners and assigned trainers can create body progress records
8. Only gym owners and assigned trainers can update body progress records
9. Only gym owners and assigned trainers can delete body progress records

**API Examples:**

#### Create Goal by Trainer (Allowed)

```json
POST /goals
{
  "memberId": 456,
  "trainerId": 789,
  "goal_type": "Muscle Gain",
  "target_value": 5,
  "target_timeline": "2024-12-31"
}
```

#### Create Goal by Member (Forbidden)

```json
POST /goals
{
  "memberId": 456,
  "goal_type": "Weight Loss",
  "target_value": 10
}
```

**Response:** 403 Forbidden - "This member is not allowed to manage their own goals"

### Scenario 3: Gym Owner/Trainer Management

**Gym Owner Actions (Always Allowed):**

1. Can create goals for any member regardless of is_managed_by_member setting
2. Can update goals for any member
3. Can delete goals for any member
4. Can create workout logs for any member
5. Can update workout logs for any member
6. Can delete workout logs for any member
7. Can create body progress records for any member
8. Can update body progress records for any member
9. Can delete body progress records for any member

**Trainer Actions (Assigned Members Only):**

1. Can create goals for their assigned members
2. Can update goals for their assigned members
3. Can delete goals for their assigned members
4. Can create workout logs for their assigned members
5. Can update workout logs for their assigned members
6. Can delete workout logs for their assigned members
7. Can create body progress records for their assigned members
8. Can update body progress records for their assigned members
9. Can delete body progress records for their assigned members

## Database Changes

### Member Entity

Added field:

```sql
ALTER TABLE members ADD COLUMN is_managed_by_member BOOLEAN DEFAULT true;
```

### Default Behavior

- New members will have `is_managed_by_member = true` by default
- Existing members will have `is_managed_by_member = true` by default
- Gym owners can update this setting for any member
- Trainers can update this setting for their assigned members

## Use Cases

### Use Case 1: Independent Member

- Member prefers to track their own progress
- Member is experienced and doesn't need trainer supervision
- Member wants full control over their goals and workout logs

### Use Case 2: Trainer-Managed Member

- Member wants trainer to set and track their goals
- Member is new and needs professional guidance
- Member prefers trainer to manage their progress tracking

### Use Case 3: Gym Owner Override

- Gym owner can override any member's management setting
- Useful for special programs or member requests
- Allows flexibility in member management approach

## Security Considerations

1. **Authentication Required:** All endpoints require JWT authentication
2. **Authorization Checks:** Each endpoint validates user permissions
3. **Member Verification:** Members can only manage their own records when allowed
4. **Trainer Assignment:** Trainers can only manage assigned members
5. **Gym Owner Privileges:** Gym owners have full access to all members

## Implementation Notes

1. The `is_managed_by_member` flag is checked in all relevant service methods
2. Members can only manage their own records when the flag is true
3. The flag can be updated by gym owners or assigned trainers
4. All existing functionality remains unchanged for gym owners and trainers
5. The system maintains backward compatibility with existing data
