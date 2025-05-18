
# Tech Learn System Architecture Diagrams

## Model-View-Controller (MVC) Architecture

```
┌─────────────────────────────────────────┐
│              View Layer                 │
│                                         │
│  ┌─────────────┐    ┌─────────────┐     │
│  │ React       │    │ Components  │     │
│  │ Components  │    │ Library     │     │
│  └─────────────┘    └─────────────┘     │
│                                         │
└─────────────────────────────────────────┘
                   ▲
                   │
                   ▼
┌─────────────────────────────────────────┐
│            Controller Layer              │
│                                         │
│  ┌─────────────┐    ┌─────────────┐     │
│  │ React       │    │ Custom      │     │
│  │ Context API │    │ Hooks       │     │
│  └─────────────┘    └─────────────┘     │
│                                         │
└─────────────────────────────────────────┘
                   ▲
                   │
                   ▼
┌─────────────────────────────────────────┐
│              Model Layer                │
│                                         │
│  ┌─────────────┐    ┌─────────────┐     │
│  │ TypeScript  │    │ Supabase    │     │
│  │ Interfaces  │    │ SDK         │     │
│  └─────────────┘    └─────────────┘     │
│                                         │
└─────────────────────────────────────────┘
```

## Frontend Component Architecture

```
┌─────────────────────────────────────────────────┐
│                    App Root                     │
└───────────────────────┬─────────────────────────┘
            ┌───────────┴───────────┐
            ▼                       ▼
┌───────────────────────┐ ┌───────────────────────┐
│  Context Providers    │ │      Routing          │
└───────────┬───────────┘ └─────────┬─────────────┘
            │                       │
            ▼                       ▼
┌───────────────────────┐ ┌───────────────────────┐
│  Global Components    │ │        Pages          │
│  • Navbar             │ │  • Index              │
│  • Footer             │ │  • Dashboard          │
│  • Chatbot            │ │  • Courses            │
│  • Toaster            │ │  • CourseDetail       │
└───────────────────────┘ │  • Login/Register     │
                          │  • Admin              │
                          └───────────────────────┘
```

## Backend Architecture

```
┌─────────────────────────────────────────────────┐
│                Client Application               │
└───────────────────────┬─────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────┐
│               Supabase Platform                 │
│                                                 │
│  ┌─────────────────┐     ┌─────────────────┐    │
│  │  Authentication │     │     Database     │    │
│  │  • JWT          │     │  • PostgreSQL    │    │
│  │  • OAuth        │     │  • Row Level     │    │
│  │  • Email/Pass   │     │    Security      │    │
│  └─────────────────┘     └─────────────────┘    │
│                                                 │
│  ┌─────────────────┐     ┌─────────────────┐    │
│  │  Storage        │     │    Functions     │    │
│  │  • Files        │     │  • Edge Functions│    │
│  │  • Images       │     │  • Webhooks      │    │
│  │  • Videos       │     │  • Triggers      │    │
│  └─────────────────┘     └─────────────────┘    │
│                                                 │
└─────────────────────────────────────────────────┘
```

## Database Schema

```
┌────────────────┐       ┌────────────────┐
│   profiles     │       │    courses     │
├────────────────┤       ├────────────────┤
│ id             │       │ id             │
│ name           │       │ title          │
│ email          │       │ description    │
│ role           │       │ category       │
│ avatar         │       │ thumbnail      │
└────────┬───────┘       │ instructor     │
         │               │ duration       │
         │               │ level          │
         │               │ rating         │
         │               │ enrolledCount  │
┌────────▼───────┐       └───────┬────────┘
│course_enrollment│              │
├────────────────┤              │
│ user_id        │◄─────────────┘
│ course_id      │
│ enrollment_date│       ┌────────────────┐
│ is_completed   │       │    videos      │
└────────┬───────┘       ├────────────────┤
         │               │ id             │
┌────────▼───────┐       │ course_id      │
│course_progress │       │ title          │
├────────────────┤       │ description    │
│ user_id        │       │ url            │
│ course_id      │       │ duration       │
│ completed_vids │       │ thumbnail      │
│ completed_quizs│       │ order          │
│ last_accessed  │       └───────┬────────┘
│ progress       │               │
└────────────────┘               │
                                 │
┌────────────────┐       ┌───────▼────────┐
│  certificates  │       │    quizzes     │
├────────────────┤       ├────────────────┤
│ id             │       │ id             │
│ user_id        │       │ course_id      │
│ course_id      │       │ title          │
│ issue_date     │       │ description    │
│ cert_data      │       │ questions      │
└────────────────┘       └────────────────┘
```
