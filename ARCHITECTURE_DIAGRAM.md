# Visual Architecture Diagram

## API Response Structure vs UI Display

```
┌─────────────────────────────────────────────────────────────────┐
│                         API RESPONSE                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  {                                                              │
│    "success": true,                                             │
│    "data": {                                                    │
│      "title": "Run Evaluations in Batches...",  ◄──┐           │
│      "description": "...",                      ◄──┤           │
│      "criterias": [                             ◄──┤ LEVEL 1  │
│        {                                            │           │
│          "type": "customerExperience",              │           │
│          "title": "Customer Experience",           │           │
│          "scoringSections": [                   ◄──┤ LEVEL 2  │
│            {                                       │           │
│              "title": "Nature of Call",            │           │
│              "details": [                      ◄──┤ LEVEL 3  │
│                {                                  │           │
│                  "description": "Was this a...", │           │
│                  "prompt": "When analyzing...", │           │
│                  "score": 1,                    │           │
│                  "scoringPercentage": 9.1,      │           │
│                  "isAutoFail": false            │           │
│                },                               │           │
│                { ... more details },            │           │
│              ]                                  │           │
│            },                                   │           │
│            { ... more sections },               │           │
│          ]                                      │           │
│        },                                       │           │
│        { ... more criterias },                  │           │
│      ]                                          │           │
│    }                                            │           │
│  }                                              │           │
│                                                 │           │
└────────────┬────────────────────────────────────────────────┘
             │
             │ Maps to
             ▼
┌─────────────────────────────────────────────────────────────────┐
│                       ACCORDION UI                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Run Evaluations in Batches...                                 │
│  Run Evaluations in Batches and note respond time.             │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ ▼ CUSTOMEREXPERIENCE - Customer Experience              │  │ LEVEL 1
│  ├──────────────────────────────────────────────────────────┤  │ Criterias
│  │ ┌────────────────────────────────────────────────────┐  │  │
│  │ │ ▼ Nature of Call                                   │  │  │
│  │ ├────────────────────────────────────────────────────┤  │  │ LEVEL 2
│  │ │ ┌──────────────────────────────────────────────┐  │  │  │ Sections
│  │ │ │ ▼ Was this a true cancellation call?         │  │  │  │
│  │ │ ├──────────────────────────────────────────────┤  │  │  │
│  │ │ │ Prompt: When analyzing the call             │  │  │  │ LEVEL 3
│  │ │ │ transcript, pay close attention to...        │  │  │  │ Details
│  │ │ │                                              │  │  │  │
│  │ │ │ Score: 1                                     │  │  │  │
│  │ │ │ Scoring Percentage: 9.1%                     │  │  │  │
│  │ │ │ Is Auto Fail: No                             │  │  │  │
│  │ │ └──────────────────────────────────────────────┘  │  │  │
│  │ │ ▶ Was the cancellation due to dissatisfaction?    │  │  │
│  │ │ ▶ Was the cancellation due to denial...?          │  │  │
│  │ │ ▶ Was the cancellation due to contractor...?      │  │  │
│  │ │ ▶ Was the cancellation because customer sold...?  │  │  │
│  │ │ ▶ Was the cancellation because customer got...?   │  │  │
│  │ │ ▶ Was the cancellation because policy...?         │  │  │
│  │ │ ▶ Was the cancellation due to financial...?       │  │  │
│  │ └──────────────────────────────────────────────────┘  │  │
│  │ ▼ Reasons for Cancellation                            │  │
│  │ ├──────────────────────────────────────────────────┤  │  │
│  │ │ ▶ Was the cancellation due to dissatisfaction?   │  │  │
│  │ │ ▶ Was the cancellation due to denial...?         │  │  │
│  │ │ ▶ Was the cancellation due to contractor...?     │  │  │
│  │ │ ▶ Was the cancellation because customer sold...? │  │  │
│  │ │ ▶ Was the cancellation because customer got...?  │  │  │
│  │ │ ▶ Was the cancellation because policy...?        │  │  │
│  │ │ ▶ Was the cancellation due to financial...?      │  │  │
│  │ └──────────────────────────────────────────────────┘  │  │
│  │ ▼ Contractor Issues - Sub Reasons                     │  │
│  │ ├──────────────────────────────────────────────────┤  │  │
│  │ │ ▶ Did the customer cancel because of delayed...? │  │  │
│  │ │ ▶ Did the Customer cancel because of...?         │  │  │
│  │ └──────────────────────────────────────────────────┘  │  │
│  │ ▼ Dissatisfied with Service - Sub Reasons            │  │
│  │ ├──────────────────────────────────────────────────┤  │  │
│  │ │ ▶ Did the Customer have an expectation...?       │  │  │
│  │ └──────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  (More criterias follow similar pattern)                   │
│                                                             │
└─────────────────────────────────────────────────────────────────┘
```

## Component Data Flow

```
┌──────────────────────┐
│   editscorecard      │
│   Service API Call   │
└──────────┬───────────┘
           │
           │ Observable response
           │
           ▼
┌──────────────────────────────────────┐
│   Viewscorecard Component            │
│   ngOnInit()                         │
├──────────────────────────────────────┤
│ response = {                         │
│   success: true,                     │
│   data: { ... },                     │
│   errors: {},                        │
│   statusCode: 200                    │
│ }                                    │
└─────────────┬──────────────────────┬─┘
              │                      │
              │ Set signals          │
              ▼                      ▼
    ┌──────────────────┐  ┌────────────────┐
    │ apiResponse      │  │  viewSCData    │
    │ signal<any>      │  │  signal<any[]> │
    ├──────────────────┤  ├────────────────┤
    │ Full API data    │  │ Criterias only │
    │ (for metadata)   │  │ (for details)  │
    └────────┬─────────┘  └────────┬───────┘
             │                     │
             │ Used by template    │
             └──────────┬──────────┘
                        │
                        ▼
            ┌──────────────────────────┐
            │    viewscorecard.html    │
            │   Nested Accordions      │
            ├──────────────────────────┤
            │ Level 1: criterias[]     │
            │  Level 2: sections[]     │
            │   Level 3: details[]     │
            └──────────────────────────┘
                        │
                        ▼
            ┌──────────────────────────┐
            │      Browser Display     │
            │   Multi-level Accordions │
            └──────────────────────────┘
```

## Template Loop Structure

```
Component viewSCData: signal<any[]>
  ├─ Outer @for (criteria of viewSCData())  ◄─ LEVEL 1
  │   criteria._id, criteria.type, criteria.title
  │   criteria.scoringSections[]
  │
  │   ├─ Middle @for (section of criteria.scoringSections())  ◄─ LEVEL 2
  │   │   section._id, section.title
  │   │   section.details[]
  │   │
  │   │   ├─ Inner @for (detail of section.details())  ◄─ LEVEL 3
  │   │   │   detail._id, detail.description
  │   │   │   detail.prompt, detail.score
  │   │   │   detail.scoringPercentage, detail.isAutoFail
  │   │   │
  │   │   │   Content displays in @if(detailItem.expanded)
  │   │   │   ├─ detail.prompt
  │   │   │   ├─ detail.score
  │   │   │   ├─ detail.scoringPercentage
  │   │   │   └─ detail.isAutoFail
  │   │   │
  │   │   └─ End Inner @for
  │   │
  │   └─ End Middle @for
  │
  └─ End Outer @for
```

## CSS Styling Hierarchy

```
.example-accordion
├─ .example-accordion-item (LEVEL 1 - Criterias)
│  ├─ .example-accordion-item-header
│  │  ├─ Background: linear-gradient(to right, #f5f5f5, #ffffff)
│  │  └─ Color: strong { #1976d2 }
│  └─ .example-accordion-item-body
│     └─ Background: #fafafa
│
├─ .nested-accordion (LEVEL 2 - Sections)
│  ├─ margin-left: 20px
│  ├─ border-left: 3px solid #1976d2
│  └─ .example-accordion-item.nested
│     ├─ .nested-header
│     │  ├─ Background: linear-gradient(to right, #f0f7ff, #ffffff)
│     │  └─ padding-left: 20px
│     └─ .nested-body
│        └─ Background: #fafafa
│
└─ .detail-accordion (LEVEL 3 - Details)
   └─ .example-accordion-item.detail
      ├─ .detail-header
      │  ├─ Background: linear-gradient(to right, #fafafa, #ffffff)
      │  └─ padding-left: 40px
      └─ .detail-body
         └─ .detail-content
            ├─ .prompt-section
            │  └─ White background with wrapped text
            └─ .score-section
               └─ Formatted score information
```

## Responsive Design Flow

```
Desktop (≥1024px)
└─ detail-content
   ├─ .prompt-section (flex: 1)
   ├─ .score-section (flex: 1)
   └─ Display side-by-side

Tablet (≥768px && <1024px)
└─ detail-content
   ├─ .prompt-section (flex: 1)
   ├─ .score-section (flex: 1)
   └─ Display side-by-side

Mobile (<768px)
└─ detail-content
   ├─ .prompt-section (min-width: 300px)
   ├─ .score-section (min-width: 300px)
   └─ Display stacked (flex-wrap: wrap)
```
