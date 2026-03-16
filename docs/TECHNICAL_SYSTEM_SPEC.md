# 🛠️ Northstack: Full Technical Specification

This document provides a deep dive into the architecture, data flow, and deployment mechanics of Northstack.

---

## 1. 🏗️ Global System Architecture
Northstack is built on a modern, event-driven, multimodal architecture. It synchronizes audio, vision, and AI reasoning in real-time.

```mermaid
graph TB
    subgraph Client ["Frontend (Next.js + React)"]
        UI[Glassmorphic UI]
        AV[Avatar Component - Three.js]
        MP[MediaPipe Face Landmarker]
        Mic[Audio Capture - PCM 16kHz]
        Cam[Vision Capture - 10fps]
        WS_C[WebSocket Client]

        Cam --> MP
        MP --> UI
        Mic --> WS_C
        Cam --> WS_C
        WS_C <--> AV
    end

    subgraph Cloud ["Google Cloud Platform"]
        subgraph Backend ["Backend (FastAPI + Python)"]
            WS_S[WebSocket Server]
            ADK[Agent Development Kit - ADK]
            Tools[Custom Agentic Tools]
            
            WS_S <--> ADK
            ADK <--> Tools
        end

        subgraph AI_Services ["AI & Models"]
            Gemini[Gemini 2.0 Flash - Live API]
            Imagen[Vertex AI - Imagen 3]
            
            ADK <--> Gemini
            Tools --> Imagen
        end

        subgraph Data_Storage ["Infrastructure & Data"]
            Firestore[(Cloud Firestore - State/Auth)]
            Storage[(Cloud Storage - Asset Cache)]
            CR[Cloud Run - Serverless Compute]
        end
    end

    WS_C <-->|Bi-directional WebSocket| WS_S
    CR --- Backend
    Backend --> Firestore
    Backend --> Storage
```

---

## 2. ⚡ Real-Time Multimodal Data Flow
The core differentiator of Northstack is its sub-second latency for multimodal coaching.

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Backend
    participant Gemini as Gemini 2.0 Flash (Live)

    User->>Frontend: Speaks + Visualizes Facial Cues
    Frontend->>Frontend: MediaPipe tracks Blendshapes
    Frontend->>Backend: Stream Audio (16-bit PCM) + Webcam Frames
    Backend->>Gemini: Forward Multimodal Stream via ADK
    Gemini->>Gemini: Process Audio/Vision Context
    Gemini->>Backend: Stream Real-Time Response
    
    rect rgb(0, 100, 200, 0.1)
        Note over Gemini, Backend: Tool Activation (Storyteller Mode)
        Gemini->>Backend: Trigger Image Generation Tool
        Backend->>Frontend: Return Visual Aid URL
    end

    Backend->>Frontend: Stream Audio Buffer
    Frontend->>User: Play Audio + Sync Avatar Expressions
```

---

## 3. 🚀 Automated Deployment Pipeline
Northstack uses a unified bash script for standardizing deployments across different Google Cloud services.

```mermaid
flowchart LR
    Dev[Developer]
    SH[deploy.sh]
    GCB[Google Cloud Build]
    GCR[Google Container Registry]
    Run[Cloud Run - Backend]
    Fire[Firebase Hosting - Frontend]

    Dev -->|Run| SH
    SH -->|Submit Build| GCB
    GCB -->|Push Image| GCR
    GCR -->|Deploy| Run
    SH -->|Update API URL| Fire
    Fire -->|Production Deploy| URL[northstack.web.app]
```

---

## 4. 🛠️ Tech Stack Summary
| Component | Technology | Role |
| :--- | :--- | :--- |
| **Frontend** | Next.js, React, Tailwind | Core Application UI |
| **Vision** | MediaPipe | Face & Mouth Landmark Tracking |
| **Real-time** | WebSockets | Low-latency bi-directional streaming |
| **Backend** | FastAPI (Python) | Session Orchestration |
| **LLM Orchestration** | Agent Development Kit (ADK) | Managing Gemini Live connections |
| **AI (Text/Audio)** | Gemini 2.0 Flash | Core reasoning and natural speech |
| **AI (Visual)** | Vertex AI Imagen 3 | Scene generation for Storytelling |
| **Hosting** | Google Cloud Run | Serverless backend compute |
| **Storage** | Firestore & Cloud Storage | User data and media assets |

---

## 🔗 Official Links
- **GitHub Repository**: [LiveAccentCoach](https://github.com/gwaghmar/LiveAccentCoach)
- **Deployment Script**: [deploy.sh](https://github.com/gwaghmar/LiveAccentCoach/blob/main/Northstack/deploy.sh)
- **Submission Tag**: #GeminiLiveAgentChallenge
