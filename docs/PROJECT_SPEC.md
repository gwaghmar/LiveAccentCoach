# Live Accent Coach — Gemini Live Agent Challenge

## Hackathon Details (Verified)

| Item | Detail |
|---|---|
| **Name** | Gemini Live Agent Challenge |
| **Deadline** | **March 16, 2026 @ 8:00 PM EDT (5 DAYS LEFT)** |
| **Category** | Live Agents 🗣️ ($10,000 Best of Live Agents + eligible for $25,000 Grand Prize) |
| **Total Prizes** | $80,000 across all categories |
| **Participants** | 8,497 as of March 11, 2026 |

---

## Judging Criteria (Exact from Devpost)

| Criterion | Weight | What Judges Look For |
|---|---|---|
| **Innovation & Multimodal UX** | **40%** | Breaks the "text box" paradigm. Agent helps "See, Hear, Speak" seamlessly. Distinct persona/voice. "Live" and context-aware, NOT disjointed/turn-based. |
| **Technical Implementation & Agent Architecture** | **30%** | Effective use of GenAI SDK or ADK. Backend robustly hosted on Google Cloud. Sound agent logic. Graceful error handling. Avoids hallucinations. Evidence of grounding. |
| **Demo & Presentation** | **30%** | Video defines problem and solution. Clear architecture diagram. Visual proof of Cloud deployment. Shows actual software working. |

---

## Mandatory Requirements Checklist

- [ ] Leverage a Gemini model
- [ ] Built using Google GenAI SDK **OR** ADK (Agent Development Kit)
- [ ] Use at least one Google Cloud service
- [ ] Must use Gemini Live API (for Live Agents category)
- [ ] Backend hosted on Google Cloud
- [ ] Public code repository with spin-up instructions in README
- [ ] Proof of Google Cloud deployment (screen recording or code file link)
- [ ] Architecture diagram
- [ ] < 4-minute demo video showing real-time features (no mockups)

### Bonus Points

- [ ] Publish content (blog/podcast/video) about how it was built with #GeminiLiveAgentChallenge
- [ ] Automated Cloud Deployment via scripts/IaC in the repo
- [ ] Sign up for Google Developer Group and link public GDG profile

---

## Verified Tech Stack (Based on Official Docs as of March 2026)

### 1. Gemini Live API — The Core

**Model:** `gemini-2.5-flash-native-audio-preview-12-2025`
- This is the flagship Live API model for low-latency, bidirectional voice and video agents with native audio reasoning.

**Verified Capabilities (from official docs):**

| Feature | Status | How It Helps Your App |
|---|---|---|
| Real-time audio streaming | ✅ Native | User speaks → agent listens → agent responds immediately |
| Barge-in / Interrupts | ✅ Built-in VAD | "Wait, show me that again" — naturally handled |
| Video input (camera) | ✅ JPEG ≤ 1 FPS | Send camera frames for mouth/face analysis |
| Audio transcription (input + output) | ✅ Config flag | Get text of what user said AND what agent said |
| Affective dialog | ✅ v1alpha | Agent adapts tone to user's expression |
| Proactive audio | ✅ v1alpha | Agent decides when to interject vs stay silent |
| Thinking (reasoning) | ✅ Dynamic | Agent can reason about pronunciation before responding |
| Multilingual | ✅ 70 languages | Support coaching in multiple languages |
| Tool use / Function calling | ✅ | Call save_progress, score_attempt, get_drill etc. |
| Voice selection | ✅ Multiple voices | Pick a clear "coach" voice persona |

**⚠️ CRITICAL LIMITATION FOUND:**

| Session Type | Max Duration | Workaround |
|---|---|---|
| Audio-only | 15 minutes | Enable `ContextWindowCompressionConfig` for unlimited |
| Audio + Video | **2 minutes** | **Must enable context window compression + session resumption** |
| Context window | 128k tokens | Audio ≈ 25 tokens/sec, so ~85 min audio-only max |

**Impact on your app:** Since you're using camera (video), sessions default to **2 minutes**. You MUST implement:
1. **Context window compression** — enables unlimited session duration
2. **Session resumption** — seamless reconnect when server resets the WebSocket

**Technical specs:**
- Input audio: Raw 16-bit PCM, 16kHz, little-endian
- Output audio: Raw 16-bit PCM, 24kHz, little-endian
- Video: JPEG frames at ≤ 1 FPS
- Protocol: Stateful WebSocket (WSS)

---

### 2. Implementation Approach — Two Verified Options

#### Option A: ADK + Gemini Live API Toolkit (RECOMMENDED)

**Why:** ADK has a dedicated "Gemini Live API Toolkit" (released in ADK Python v0.5.0) specifically designed for this. It includes:
- `LiveRequestQueue` for managing streaming messages
- `run_live()` for event handling
- Built-in tool execution in streaming context
- Session management
- A **reference demo app** you can fork: `adk-samples/python/agents/bidi-demo` (FastAPI + WebSocket)

**Stack:**
```
Frontend (Next.js/React)
    ↕ WebSocket
Backend (Python FastAPI + ADK)
    ↕ Gemini Live API session
    ↕ Firestore / Cloud Storage
```

**ADK available in:** Python, TypeScript, Go, Java
**Recommended:** Python (most documentation and examples for Live API Toolkit)

**Official resources:**
- ADK Streaming quickstart: `google.github.io/adk-docs/get-started/streaming/quickstart-streaming/`
- ADK bidi demo: `github.com/google/adk-samples/tree/main/python/agents/bidi-demo`
- Dev guide series: Parts 1-5 covering intro, messages, events, config, audio/video

#### Option B: Google GenAI SDK Direct

**Why:** Maximum control, minimal framework overhead. You connect directly to Live API via WebSocket from your server.

**Stack:**
```
Frontend (Next.js/React)
    ↕ WebSocket
Backend (Python/Node.js + GenAI SDK)
    ↕ Direct WebSocket to Live API
    ↕ Firestore / Cloud Storage
```

**Official examples:**
- `github.com/google-gemini/gemini-live-api-examples` (contains Python SDK example and WebSocket + ephemeral tokens example)

#### Verdict: Go with **Option A (ADK)** because:
1. It gives you tool orchestration for free (score_attempt, save_progress, etc.)
2. It has a ready-to-fork demo app
3. "ADK" is specifically called out in the hackathon rules as a valid path
4. The narrative "multi-tool agent with memory and session state" is stronger for judges

---

### 3. Frontend — Verified Components

| Component | Technology | Purpose | Status |
|---|---|---|---|
| **UI Framework** | Next.js 14+ (React) + TypeScript | Routing, SSR, clean UI | Widely used, stable |
| **Mic/Camera** | `navigator.mediaDevices.getUserMedia()` (WebRTC native) | Capture audio + video streams | Browser native, no deps |
| **Audio Streaming** | WebSocket client → backend | Stream PCM audio chunks (20-40ms recommended) | Per Live API best practices |
| **Mouth Tracking** | **MediaPipe Face Landmarker** via `@mediapipe/tasks-vision` | 478 landmarks, 52 blendshapes, runs in-browser | ✅ Official Google, documented |
| **Video Frames** | Canvas snapshot → JPEG | Capture frames at ≤1 FPS to send to backend → Live API | Stay within Live API limits |

#### MediaPipe Face Landmarker — Verified Details

**Package:** `npm install @mediapipe/tasks-vision`

**What it gives you (verified from official docs):**
- **478 face landmarks** per face (3D coordinates)
- **52 face blendshapes** including:
  - `mouthOpen`, `mouthSmileLeft`, `mouthSmileRight`
  - `mouthPucker`, `mouthFunnel`, `mouthShrugUpper`
  - `jawOpen`, `jawForward`, `jawLeft`
  - `tongueOut` (yes, it detects tongue!)
  - `cheekPuff`, `lipsFunnel`, etc.
- **Facial transformation matrices** for 3D effects
- **Runs in browser** — no server-side processing needed for landmarks
- **VIDEO mode** for real-time camera stream processing

**How to use for accent coaching:**
1. Run Face Landmarker on camera feed in browser
2. Extract relevant blendshapes: `mouthOpen`, `jawOpen`, `mouthPucker`, `tongueOut`, `lipsFunnel`
3. Display visual feedback: "Your mouth should be more rounded for 'O'" with live overlay
4. Optionally send lightweight metrics to backend alongside audio for the agent to reference

**Key insight:** `tongueOut` blendshape EXISTS in MediaPipe — this means you CAN detect basic tongue position, which is relevant for "th" sound coaching. This is a verified differentiator.

---

### 4. Backend — Google Cloud (Judge-Proof)

| Service | Purpose | Hackathon Compliance |
|---|---|---|
| **Cloud Run** | Host the ADK/FastAPI backend | ✅ Serverless, auto-scaling, easy to prove deployment |
| **Firestore** | User profiles, scores, session history, lesson plans | ✅ Counts as "Google Cloud service" |
| **Cloud Storage** | Store audio clips (before/after), avatar assets | ✅ Additional GCP service |
| **Cloud Logging** | Session audit, debug logs, error tracking | ✅ Automatic with Cloud Run, easy to show judges |
| **Artifact Registry** | Store Docker container image | ✅ Part of Cloud Run deployment |

**Minimum for compliance:** Cloud Run + Firestore (2 services)
**Recommended:** Cloud Run + Firestore + Cloud Storage + Cloud Logging (4 services, looks robust)

---

### 5. Avatar Approach — Realistic vs. Practical

| Approach | Effort | Demo Impact | Recommendation |
|---|---|---|---|
| **Simple 2D mouth diagrams** | Low | Medium | Minimum viable |
| **3D model with blendshape-driven mouth** (Three.js + Ready Player Me or similar) | Medium | High | **Best for hackathon** |
| **Live deepfake-style realistic avatar** | Very High | Very High but risky | **Skip — too much time, too many failure modes** |

**Recommended approach:**
- Use a **pre-made 3D avatar head** (Ready Player Me, Mixamo, or simple custom)
- Drive the avatar's mouth with **blendshape presets** for 5-8 target phonemes
- Render with **Three.js** or **React Three Fiber** in the browser
- The avatar demonstrates the correct mouth shape, user sees their own face landmarks overlaid on camera

**Why this works for judges:** The "wow" is the real-time coaching loop, not the avatar fidelity. A clean 3D avatar with correct mouth positions is more impressive than a buggy realistic one.

---

### 6. Partner Integration Option — LiveKit (Optional but Strong)

From verified Live API docs, there are partner integrations that handle the WebRTC/WebSocket plumbing:

| Partner | What It Does | Benefit |
|---|---|---|
| **LiveKit** | WebRTC infrastructure + Gemini Live API plugin | Handles all audio/video transport, focus on agent logic |
| **Pipecat by Daily** | Real-time AI chatbot framework | Pre-built pipeline for voice agents |
| **Firebase AI SDK** | Client-side Live API wrapper | Simpler client integration |

**Consideration:** Using LiveKit could save significant time on the audio transport layer, but adds a dependency. For a 5-day sprint, it could be worth it if audio streaming from browser → backend is causing issues.

---

## What I Found That Changes/Corrects Earlier Advice

### 1. ⚠️ Audio+Video Session = 2 Minutes Default
Earlier discussion didn't emphasize this enough. With camera on, you have a **2-minute session limit** unless you enable context window compression. This MUST be configured from day one.

### 2. ✅ `tongueOut` Blendshape Exists
MediaPipe Face Landmarker actually has a `tongueOut` blendshape. This means basic tongue detection is possible — directly relevant for "th" sound coaching. This wasn't mentioned before and it's a real differentiator.

### 3. ✅ Affective Dialog is Available (v1alpha)
The Live API can adapt its response tone to match the user's emotional state. For a coaching app, this means the agent can be encouraging when the user is frustrated, or celebratory when they succeed. Enable with `enable_affective_dialog=True`.

### 4. ✅ ADK Has a Ready-to-Fork Demo
The `adk-samples/python/agents/bidi-demo` is a production-ready reference with FastAPI + WebSocket + streaming + tools. This is your starting point — don't build from scratch.

### 5. ✅ Audio Transcription is Built-In
You get both **input transcription** (what user said) and **output transcription** (what agent said) as config flags. No need for a separate STT service. This also gives you the text to compare against expected phrases for pronunciation scoring.

### 6. ⚠️ Video Frames Max 1 FPS
You can only send JPEG frames at ≤ 1 FPS to Live API. MediaPipe runs locally at 30+ FPS but you can only share processed results or occasional frames with the agent. Plan the UX around this constraint.

### 7. ✅ Multiple Voice Options
You can pick a specific voice for the coach persona. Test voices in AI Studio: `aistudio.google.com/app/live`

### 8. ✅ Client-to-Server with Ephemeral Tokens
The official recommendation for production is client-to-server for lower latency, using ephemeral tokens instead of API keys. This is documented and there's an example repo for it. Could reduce your audio latency significantly.

---

## Recommended Architecture

```
┌─────────────────────────────────────────────┐
│                  FRONTEND                    │
│            (Next.js + React)                 │
│                                              │
│  ┌──────────┐  ┌────────────┐  ┌──────────┐ │
│  │ Camera   │  │ MediaPipe  │  │ Audio    │ │
│  │ Stream   │──│ Face       │  │ Capture  │ │
│  │          │  │ Landmarker │  │ (PCM     │ │
│  └──────────┘  │            │  │  16kHz)  │ │
│                │ 478 points │  └────┬─────┘ │
│                │ 52 blend-  │       │       │
│                │ shapes     │       │       │
│                └─────┬──────┘       │       │
│                      │              │       │
│  ┌───────────────────┼──────────────┼─────┐ │
│  │     Coaching UI + Avatar + Overlays    │ │
│  │  • 3D avatar showing mouth positions   │ │
│  │  • Live face landmark overlay          │ │
│  │  • Score display + progress cards      │ │
│  └────────────────────────────────────────┘ │
│                      │              │       │
│                WebSocket            │       │
│        (mouth metrics + audio + video frames)│
└──────────────────────┬──────────────────────┘
                       │
        ┌──────────────┴──────────────┐
        │                             │
        ▼                             │
┌───────────────────────┐             │
│   CLOUD RUN BACKEND   │             │
│   (Python + FastAPI    │             │
│    + ADK)             │             │
│                       │             │
│  ┌─────────────────┐  │             │
│  │ ADK Agent with   │  │             │
│  │ Live API Toolkit │  │             │
│  │                  │  │             │
│  │ Tools:           │  │             │
│  │ • score_attempt  │  │             │
│  │ • get_drill      │  │             │
│  │ • save_progress  │  │             │
│  │ • get_lesson     │  │             │
│  └────────┬─────────┘  │             │
│           │             │             │
│  ┌────────▼─────────┐  │             │
│  │ Gemini Live API  │  │             │
│  │ Session (WSS)    │  │             │
│  │ Model: gemini-   │  │             │
│  │ 2.5-flash-native │  │             │
│  │ -audio-preview   │  │             │
│  └──────────────────┘  │             │
└──────────┬──────────────┘             │
           │                            │
     ┌─────┼──────────┐                 │
     │     │          │                 │
     ▼     ▼          ▼                 │
┌────────┐ ┌────────┐ ┌──────────┐      │
│Firestore│ │Cloud   │ │Cloud     │      │
│        │ │Storage │ │Logging   │      │
│Users   │ │Audio   │ │Sessions  │      │
│Scores  │ │Clips   │ │Debug     │      │
│Lessons │ │Assets  │ │Audit     │      │
└────────┘ └────────┘ └──────────┘      │
```

---

## MVP Feature Set (For 5-Day Sprint)

### Must-Have (Day 1-3)

1. **Live voice conversation** — User speaks, agent coaches in real-time
2. **Barge-in handling** — User interrupts, agent adjusts gracefully
3. **Basic pronunciation feedback** — Agent identifies 1-2 issues per turn
4. **Camera-based face detection** — MediaPipe Face Landmarker running in browser
5. **Mouth shape display** — Show user's blendshape values for key mouth positions
6. **Simple avatar** — Shows correct mouth position for target sound
7. **One drill type** — "Repeat after me" with simple pass/fail
8. **Session management** — Context window compression + session resumption (for 2-min video limit)
9. **Cloud Run deployment** — Backend running on GCP
10. **Firestore integration** — Save user profile + session scores

### Nice-to-Have (Day 4)

11. **Shadowing mode** — Agent speaks, user repeats, agent scores
12. **Accent target profiles** — "US neutral" vs "UK RP"
13. **Progress dashboard** — Simple chart showing improvement over attempts
14. **Before/after audio clips** — Stored in Cloud Storage for playback
15. **Affective dialog** — Agent adapts tone to user's emotional state

### Skip for MVP

- ❌ Realistic human avatar
- ❌ Attention/gaze tracking
- ❌ Tongue position analysis (beyond basic `tongueOut`)
- ❌ Multiple languages in V1 (start with English)
- ❌ Medical-grade pronunciation scoring

---

## 4-Minute Demo Script (Hits All Judging Criteria)

### 0:00-0:30 — Problem Statement
"200 million people worldwide learn English for professional purposes, but most struggle with pronunciation because they never get real-time spoken feedback. Text-based apps can't hear you. Human tutors are expensive. We built a Live Accent Coach that sees your mouth, hears your voice, and coaches you in real-time."

### 0:30-1:30 — Magic Moment 1: Live Voice Coaching
- User: "I want to improve my pronunciation for job interviews."
- Agent (spoken, with distinct coach persona voice): "Great! Let's start. Say this sentence: 'The weather is particularly beautiful this Thursday.'"
- User speaks the sentence
- Agent: "Nice try! I noticed your 'th' in 'Thursday' sounds like a 'd'. Let's fix that."
- **Show:** Real-time audio waveform, transcription appearing, agent responding immediately

### 1:30-2:15 — Magic Moment 2: Camera-Guided Mouth Correction
- Agent: "For the 'th' sound, place your tongue tip between your teeth. Let me show you."
- **Show:** 3D avatar demonstrates the mouth position
- **Show:** User's camera with MediaPipe face landmarks overlaid
- **Show:** Blendshape values changing as user moves mouth
- Agent: "I can see your mouth — try opening it slightly more. Yes, like that!"

### 2:15-2:45 — Magic Moment 3: Interruption + Drill
- Agent is explaining stress patterns
- User interrupts: "Wait, can you show me that mouth position again?"
- Agent immediately stops, switches to demonstration mode
- Agent: "Of course! Here's the 'th' position again..."
- **Show:** Seamless interruption handling (this is what Live API was built for)

### 2:45-3:15 — Magic Moment 4: Progress Tracking
- Agent: "You scored 7/10 on that phrase — up from 4/10 on your first try!"
- **Show:** Progress saved to Firestore, simple dashboard view
- **Show:** Before/after audio clips stored in Cloud Storage

### 3:15-3:45 — Architecture + Cloud Proof
- Flash the architecture diagram
- Show Cloud Run deployment in GCP console
- Show Firestore data
- Mention: "Built with ADK + Gemini Live API, hosted on Cloud Run, data in Firestore + Cloud Storage"

### 3:45-4:00 — Closing
"The Live Accent Coach turns any browser into a pronunciation lab. It sees your mouth, hears your voice, and coaches you in real-time — exactly what the future of AI should feel like."

---

## Key Configuration Code (Verified from Docs)

### Gemini Live API Session Config
```python
from google.genai import types

model = "gemini-2.5-flash-native-audio-preview-12-2025"

config = types.LiveConnectConfig(
    response_modalities=["AUDIO"],
    # Enable transcription of both input and output
    input_audio_transcription={},
    output_audio_transcription={},
    # Affective dialog (adapts to user emotion)
    enable_affective_dialog=True,
    # Voice selection (pick a coach-like voice)
    speech_config={
        "voice_config": {
            "prebuilt_voice_config": {"voice_name": "Kore"}
        }
    },
    # Context window compression (CRITICAL for video sessions > 2 min)
    context_window_compression=types.ContextWindowCompressionConfig(
        # Enables automatic compression when context grows
    ),
    # VAD configuration
    realtime_input_config={
        "automatic_activity_detection": {
            "start_of_speech_sensitivity": types.StartSensitivity.START_SENSITIVITY_LOW,
            "end_of_speech_sensitivity": types.EndSensitivity.END_SENSITIVITY_LOW,
        }
    },
    # Thinking budget (helps with pronunciation reasoning)
    thinking_config=types.ThinkingConfig(
        thinking_budget=1024,
    ),
)
```

### MediaPipe Face Landmarker Setup
```javascript
import { FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";

const vision = await FilesetResolver.forVisionTasks(
  "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
);

const faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
  baseOptions: {
    modelAssetPath: "path/to/face_landmarker.task",
  },
  runningMode: "VIDEO",
  numFaces: 1,
  outputFaceBlendshapes: true,  // Gets the 52 blendshapes
  outputFacialTransformationMatrixes: true,
});

// In your render loop:
const results = faceLandmarker.detectForVideo(videoElement, timestamp);

// Key blendshapes for accent coaching:
const blendshapes = results.faceBlendshapes[0].categories;
const mouthOpen = blendshapes.find(b => b.categoryName === "jawOpen");
const mouthPucker = blendshapes.find(b => b.categoryName === "mouthPucker");
const tongueOut = blendshapes.find(b => b.categoryName === "tongueOut");
const mouthFunnel = blendshapes.find(b => b.categoryName === "mouthFunnel");
```

---

## Final Verdict (Based on Verified Research)

### Why This Idea Can Win

1. **40% weight on "Innovation & Multimodal UX"** — Your app is the textbook definition of "See, Hear, Speak." Camera sees mouth, mic hears voice, agent speaks coaching. Perfect alignment.

2. **"Context-aware" and "Live"** — The agent literally watches your mouth shape and adapts feedback. That's beyond what most entries will do.

3. **Natural interruptions** — Coaching is one of the most natural use cases for barge-in. "Wait, show me again" is intuitive.

4. **`tongueOut` blendshape** — Most competitors won't know MediaPipe can detect this. It's a genuine wow-factor for "th" sound coaching.

5. **Education is explicitly listed** as a Live API use case by Google. You're building exactly what they envisioned.

### Risks Verified

| Risk | Severity | Mitigation |
|---|---|---|
| 2-min video session limit | **HIGH** | Must implement context window compression from day 1 |
| Audio latency issues | Medium | Follow best practices: 20-40ms chunks, 16kHz resampling |
| Avatar takes too long | Medium | Keep it simple — 3D model with blendshape presets, not realistic |
| Over-scoping | **HIGH** | Stick to MVP features, demo the 3 magic moments |
| 8,497 competitors | Context | Most won't do camera+voice+coaching. Your combo is distinctive |

### Bottom Line

**Yes, this is a strong hackathon idea.** With the verified tech (ADK Live API Toolkit, MediaPipe Face Landmarker with tongueOut, affective dialog, session management), you have everything needed to build a demo that clearly hits the #1 judging criterion (40% multimodal UX).

The key risk is **over-scoping with 5 days left**. Fork the ADK bidi-demo, add MediaPipe, keep the avatar simple, and focus relentlessly on the 3 magic moments in the demo.
