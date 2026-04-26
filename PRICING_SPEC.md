# TaskHub Pricing Plans - Specification

## FREE PLAN ($0)
Unlimited users, basic features

### Limits
- Tasks: 5 maximum
- Categories: 2 maximum
- Tags: Unlimited
- Task sharing: None
- Team members: N/A

### Features
- Basic task management
- Categories & tags
- Dashboard
- Mobile responsive
- **Banner ad (monetization)**

### Not included
- Time tracking
- Subtasks/checklists
- Analytics
- Integrations
- Team features

---

## PRO PLAN ($3.50/month)
For individuals and small teams

### Limits
- Tasks: Unlimited
- Categories: Unlimited
- Tags: Unlimited
- Share with: 1 external user
- Team members: N/A (single user)

### Features
- Everything in Free +
- Time tracking (track hours per task)
- Subtasks/checklists
- Basic analytics (task completion rate, productivity stats)
- Google Calendar sync (two-way)
- Export to CSV
- Priority email support
- **No ads**

### Not included
- Team collaboration
- Team analytics
- Slack integration
- API access
- Advanced permissions

---

## TEAM PLAN ($9.99/month)
For teams and organizations

### Limits
- Tasks: Unlimited
- Categories: Unlimited
- Team members: Up to 5

### Features
- Everything in Pro +
- Team workspace (up to 5 members)
- Task comments & discussion
- Granular permissions (Admin/Editor/Viewer)
- Advanced analytics (team metrics, velocity, burndown)
- Slack integration (task notifications)
- REST API access (for integrations)
- SLA support (48h response)
- Custom workflows

---

## COMPARISON TABLE

| Feature | Free | Pro | Team |
|---------|------|-----|------|
| **Price** | $0 | $3.50/mo | $9.99/mo |
| Tasks | 5 | Unlimited | Unlimited |
| Categories | 2 | Unlimited | Unlimited |
| Time Tracking | ❌ | ✅ | ✅ |
| Subtasks | ❌ | ✅ | ✅ |
| Analytics | ❌ | ✅ (basic) | ✅ (advanced) |
| Task Sharing | ❌ | ✅ (1 user) | ✅ (5 members) |
| Comments | ❌ | ❌ | ✅ |
| Google Calendar | ❌ | ✅ | ✅ |
| CSV Export | ❌ | ✅ | ✅ |
| Slack Integration | ❌ | ❌ | ✅ |
| API Access | ❌ | ❌ | ✅ |
| Permissions | N/A | N/A | ✅ |
| Ads | ✅ | ❌ | ❌ |
| Support | Community | Email | SLA 48h |

---

## IMPLEMENTATION ROADMAP

### Sprint 9 (DONE)
- ✅ Define pricing plans
- ✅ Create specification
- ✅ Feature comparison matrix

### Sprint 10-11
- Backend: Feature gates, database schema
- Frontend: Premium UI, upgrade prompts
- Wompi integration
- Testing

### Sprint 12+
- Monitor conversion rates
- Adjust pricing if needed
- Add more features based on feedback

