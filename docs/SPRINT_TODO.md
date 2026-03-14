# 5-Day Sprint TODO (March 11-16, 2026)

**Deadline:** March 16, 2026 @ 8:00 PM EDT  
**Days Remaining:** 5 days (as of March 11)  
**Participants:** 8,497 (as of March 11)  
**Target Prize:** $10,000+ (Best of Live Agents) + eligible for $25,000 Grand Prize

---

## Daily Breakdown

### DAY 1 (March 11) — Backend Scaffold & GCP Setup

#### Morning (3-4 hours)

- [ ] **Fork ADK bidi-demo**
  ```bash
  git clone https://github.com/google/adk-samples.git
  cd adk-samples/python/agents/bidi-demo
  ```
  - Copy repo into `backend/` folder of this project
  - Install dependencies: `pip install -r requirements.txt`
  - Verify demo runs: `python main.py` (should start FastAPI server)

- [ ] **Set up GCP project**
  - Create new GCP project (or use existing)
  - Enable Cloud Run API, Firestore API, Cloud Storage API
  - Create service account with required permissions
  - Generate and save credentials JSON

- [ ] **Set up Firestore**
  - Create Firestore database in "native mode" (US region is fine)
  - Create collections: `users`, `sessions`, `progress`
  - Note connection details for backend config

- [ ] **Set up Cloud Storage bucket**
  - Create bucket for audio clips
  - Set public read permissions (or signed URLs)
  - Note bucket name

#### Afternoon (3-4 hours)

- [ ] **Customize backend to ADK bidi-demo**
  - Replace the demo's system prompt with your accent coaching prompt
  - Remove any unrelated demo code
  - Add Firestore client initialization
  - Add Cloud Storage client initialization
  - Test locally with `python main.py`

- [ ] **Define Gemini Live API config**
  - Copy the config snippet from PROJECT_SPEC.md
  - Set model to `gemini-2.5-flash-native-audio-preview-12-2025`
  - Enable context window compression (CRITICAL for video sessions)
  - Enable affective dialog
  - Pick a coach voice (e.g., "Kore")
  - Test config parsing

**End of Day 1 Deliverable:** 
- ✅ Backend scaffolded on ADK bidi-demo
- ✅ GCP project configured (Cloud Run, Firestore, Storage)
- ✅ Gemini Live API config ready to use
- ✅ Backend runs locally without errors

---

### DAY 2 (March 12) — Frontend Scaffold & MediaPipe Integration

#### Morning (3-4 hours)

- [ ] **Create Next.js app**
  ```bash
  npx create-next-app frontend --typescript --tailwind
  cd frontend
  npm run dev
  ```
  - Verify it runs on `localhost:3000`

- [ ] **Install dependencies**
  ```bash
  npm install @mediapipe/tasks-vision
  npm install three react-three-fiber @react-three/drei
  npm install axios ws
  ```

- [ ] **Create basic page layout**
  - `pages/coach.tsx` — main coaching screen
  - Left: 3D avatar (placeholder for now) + mouth position visualization
  - Right: User camera feed + MediaPipe face landmarks overlay
  - Bottom: Controls (Start/Stop, Mic on/off, Settings)

#### Afternoon (3-4 hours)

- [ ] **Integrate MediaPipe Face Landmarker**
  - Load FaceLandmarker model in React hook
  - Set up video element with camera feed
  - Run face detection every 30ms (don't send all frames, just landmark data)
  - Extract key blendshapes: `jawOpen`, `mouthOpen`, `mouthPucker`, `tongueOut`, `mouthFunnel`
  - Display blendshape values as live numbers on screen (for debugging)

- [ ] **Test MediaPipe locally**
  - Put your face in front of camera
  - Verify landmarks appear on video overlay
  - Verify blendshape values change as you move mouth
  - Test `tongueOut` detection (stick tongue out, see value change)

**End of Day 2 Deliverable:**
- ✅ Next.js frontend running
- ✅ Camera permission working
- ✅ MediaPipe Face Landmarker running
- ✅ Blendshape values displaying in real-time

---

### DAY 3 (March 13) — WebSocket Connection & Audio Streaming

#### Morning (3-4 hours)

- [ ] **Set up WebSocket client on frontend**
  - Create WebSocket connection to backend (`ws://localhost:8000/live`)
  - Handle connection, message, and error events
  - Send system status messages (test)

- [ ] **Audio capture on frontend**
  - Use `navigator.mediaDevices.getUserMedia()` to get mic access
  - Capture audio as 16-bit PCM, 16kHz
  - Chunk audio into 20-40ms packets
  - Send packets to backend via WebSocket

- [ ] **Test audio streaming locally**
  - Speak into mic
  - Verify backend receives audio chunks
  - Verify no errors in console

#### Afternoon (3-4 hours)

- [ ] **Implement WebSocket server endpoint on backend**
  - Create `/live` WebSocket route in FastAPI
  - Receive audio chunks from frontend
  - Pass audio to Gemini Live API session (using ADK)
  - Receive audio responses from Gemini
  - Send responses back to frontend

- [ ] **Test live audio loop**
  - Frontend sends: "Hello, teach me to say 'th' sound"
  - Backend receives, passes to Gemini Live API
  - Gemini responds with voice prompt
  - Frontend receives audio and plays it
  - Verify latency is < 1 second

**End of Day 3 Deliverable:**
- ✅ WebSocket real-time audio streaming working
- ✅ Gemini Live API session active and responding
- ✅ Audio latency acceptable (< 1 sec)
- ✅ Backend + frontend communication verified

---

### DAY 4 (March 14) — Avatar & Visual Coaching Loop

#### Morning (3-4 hours)

- [ ] **Create simple 3D avatar**
  - Use Mixamo or Ready Player Me free avatar
  - Download as glTF/gLB file
  - Place in `frontend/public/models/`
  - Load and render with Three.js / React Three Fiber
  - Position on left side of screen

- [ ] **Implement mouth blendshape animations**
  - Map 5-8 key mouth positions to blendshape presets:
    - `mouthOpen` → jaw open
    - `mouthPucker` → rounded lips
    - `mouthFunnel` → funneled lips
    - `tongueOut` → tongue visible
    - `jawOpen` → open jaw
  - Create animation function to set blendshapes
  - Test by clicking buttons to see avatar respond

#### Afternoon (3-4 hours)

- [ ] **Integrate Firestore for session persistence**
  - Create backend endpoint to save session to Firestore
  - Store: user_id, timestamp, attempt_count, score, feedback, audio_url
  - Test saving session after coach responds

- [ ] **Create simple progress dashboard**
  - New page: `pages/progress.tsx`
  - Show today's results: number of attempts, average score
  - Show week's results: simple bar chart
  - Fetch data from Firestore

- [ ] **Integrate Cloud Storage for audio clips**
  - Capture final user pronunciation audio
  - Upload to Cloud Storage after session
  - Store URL in Firestore
  - Display "Before" vs "After" audio playback on dashboard

**End of Day 4 Deliverable:**
- ✅ 3D avatar rendering on screen
- ✅ Avatar mouth responds to demo blendshape changes
- ✅ Session data saving to Firestore
- ✅ Audio clips uploading to Cloud Storage
- ✅ Basic progress dashboard visible

---

### DAY 5 (March 15-16) — Polish, Demo & Deployment

#### Morning Session (6 hours)

- [ ] **Deploy backend to Cloud Run**
  ```bash
  gcloud run deploy live-accent-coach \
    --source . \
    --platform managed \
    --region us-central1 \
    --allow-unauthenticated
  ```
  - Get Cloud Run URL
  - Update frontend WebSocket to use HTTPS URL (not localhost)
  - Test end-to-end

- [ ] **Deploy frontend to Vercel** (or Cloud Run)
  - Create Vercel project linked to GitHub
  - Push frontend code to GitHub
  - Vercel auto-deploys
  - Get production URL

- [ ] **Smoke test in production**
  - Open production frontend URL
  - Try coaching session end-to-end
  - Verify audio streams, avatar responds, data saves to Firestore
  - Take screenshot of Cloud Run console showing live requests

#### Afternoon Session (4 hours)

- [ ] **Create demo video (< 4 minutes)**
  - **0:00-0:30** — Problem statement (200M people struggle with pronunciation)
  - **0:30-1:30** — Magic Moment 1: Live voice coaching (agent coaches on "th" sound)
  - **1:30-2:15** — Magic Moment 2: Camera + avatar (show mouth landmarks, avatar position, user adjusting)
  - **2:15-2:45** — Magic Moment 3: Interruption handling ("Wait, show me again" — smooth handoff)
  - **2:45-3:15** — Magic Moment 4: Progress tracking (score, Firestore data visible)
  - **3:15-3:45** — Tech stack (show architecture diagram, Cloud Run console, Firestore)
  - **3:45-4:00** — Closing (vision statement)
  - ⚠️ **DO NOT USE MOCKUPS — show real, working software**

- [ ] **Create architecture diagram**
  - Copy the ASCII diagram from PROJECT_SPEC.md
  - Render as Mermaid or draw.io
  - Include: Frontend → Backend → Gemini Live API → GCP services

- [ ] **Write README with setup instructions**
  - 1-click deployment instructions
  - GCP project setup steps
  - Environment variable setup
  - `npm install && npm run dev` for local dev

- [ ] **Final quality checks**
  - Test full session: start → capture audio → get feedback → save to Firestore → view on dashboard
  - Verify avatar animates
  - Verify Cloud Run metrics show active requests
  - Verify Firestore has session data
  - Test on different browser (Chrome, Firefox, Safari)

#### Submission (End of Day 5)

- [ ] **Create public GitHub repo**
  - Push frontend + backend code
  - Include README with deployment steps
  - Include architecture diagram
  - Tag version `v1.0-hackathon`

- [ ] **Submit to Devpost**
  - Link to GitHub repo
  - Paste < 4-min demo video
  - Upload architecture diagram
  - Write submission description hitting all judging criteria:
    - **Innovation & Multimodal UX (40%)** — "First real-time coaching with camera mouth-tracking + live AI voice + avatar"
    - **Technical Implementation (30%)** — "ADK + Gemini Live API + MediaPipe + Cloud Run + Firestore"
    - **Demo & Presentation (30%)** — "4-min video showing live coaching loop end-to-end"
  - Submit before **March 16, 8:00 PM EDT**

**End of Day 5 Deliverable:**
- ✅ Backend deployed to Cloud Run
- ✅ Frontend deployed to Vercel/Cloud Run
- ✅ End-to-end coaching session working in production
- ✅ Demo video recorded and uploaded
- ✅ Devpost submission complete

---

## Contingency Notes

### If Stuck on Audio Streaming
- Consider using **LiveKit** plugin (pre-built WebRTC layer)
- Saves time on audio transport layer
- Trade-off: adds dependency, but reliable

### If 3D Avatar Takes Too Long
- Use **simple 2D mouth diagrams** instead
- Still demonstrates correct mouth position
- Lower visual fidelity but faster to ship
- Judges care about coaching loop > avatar quality

### If Firestore Integration Breaks
- Use **localStorage** temporarily for session save
- Still proves data persistence
- Can add Firestore in post-hackathon

### If Cloud Run Deployment Fails
- Use **Railway.app** or **Heroku** (simpler one-click deployment)
- Still counts as "deployment on cloud"
- Get proof screenshot for judges

---

## Time Budget Summary

| Component | Hours | Critical |
|---|---|---|
| Backend scaffold (ADK) | 4 | ✅ YES |
| GCP setup | 3 | ✅ YES |
| Frontend scaffold | 4 | ✅ YES |
| MediaPipe integration | 4 | ✅ YES |
| WebSocket audio streaming | 5 | ✅ YES |
| Avatar + blendshapes | 4 | ✅ YES |
| Firestore + Cloud Storage | 3 | ✅ YES |
| Deployment | 3 | ✅ YES |
| Demo video + submission | 4 | ✅ YES |
| **TOTAL** | **34 hours** | — |

**Available time:** 5 days × 8 hours/day = 40 hours

**Buffer:** 6 hours for debugging, testing, contingencies ✅

---

## Key Reminders

1. **Focus on MVP only** — Live voice + mouth tracking + avatar + basic feedback = sufficient for judges
2. **Skip these for V1:**
   - ❌ Realistic avatar (use simple model)
   - ❌ Advanced gamification (just show scores)
   - ❌ Multiple languages (English only)
   - ❌ Tone analysis (just phonemes)
   - ❌ Medical-grade scoring
3. **Prioritize the demo moments:**
   - Camera watching mouth
   - Avatar showing correct position
   - Real-time voice coaching
   - Smooth interruption handling
4. **Prove everything is real:**
   - No mockups in demo video
   - Show live Firestore data
   - Show live Cloud Run metrics
   - Show real GitHub repo (public)

---

## Reference Links

| Resource | URL |
|---|---|
| ADK bidi-demo | `github.com/google/adk-samples/tree/main/python/agents/bidi-demo` |
| MediaPipe Face Landmarker | `ai.google.dev/edge/mediapipe/solutions/vision/face_landmarker/web_js` |
| Gemini Live API docs | `ai.google.dev/gemini-api/docs/live` |
| Cloud Run quickstart | `cloud.google.com/run/docs/quickstarts/build-and-deploy` |
| Devpost submission | `geminiliveagentchallenge.devpost.com/` |
| Full project spec | See `PROJECT_SPEC.md` in docs/ |

---

**You've got this. Focus on the 3 magic moments, deploy, demo, submit. Let's go.** 🚀
