# Competitive Analysis: Live Accent Coach

**Session Date:** March 11, 2026  
**Sources Verified:** Official product websites, app store data, feature comparison

---

## Competitor Feature Matrix

| Feature | **Your App** | ELSA Speak | BoldVoice | SpeechAce | Duolingo Max | Rosetta Stone | FluentU | Fluently |
|---|---|---|---|---|---|---|---|---|
| **Real-time camera mouth tracking** | ✅ **YES (MediaPipe)** | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **AI voice coaching (live, bidirectional)** | ✅ **YES (Gemini Live)** | Partial (roleplay only) | No | No | Yes (Lily character) | No | No | Yes |
| **3D avatar showing correct mouth positions** | ✅ **YES** | ❌ | ❌ | ❌ | No (decorative Lily) | ❌ | ❌ | ❌ |
| **Phoneme-level feedback** | Yes | ✅ **Best-in-class** | Yes (sound-level) | ✅ **Best-in-class** | No (general only) | Basic only | No | Yes |
| **Accent/dialect selection** | Yes | ✅ **Best variety** (5+ accents) | US focus | US/UK | No | No | No | No |
| **Gamification** | Planned | ✅ **Extensive** (points, levels, leaderboards, games) | Yes | No | ✅ **Gold standard** (XP, streaks, levels) | Yes | Yes | Yes |
| **Tongue position detection** | ✅ **YES (`tongueOut`)** | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Visual mouth position guide** | ✅ **Live overlay + avatar** | ❌ | Diagrams in coach videos | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Real-time conversation practice** | Yes | Yes (roleplay) | No | No | ✅ **Video Call** | Simulated | No | Yes (AI tutor) |
| **Celebrity/expert coaches** | No | No | ✅ **Hollywood coaches** | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Multi-language support** | Yes (70 via Gemini) | English only | English only | English only | 5-8 languages | ✅ **25 languages** | ✅ **10 languages** | English only |
| **Works on camera feed** | ✅ **YES** | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Stress/intonation coaching** | Yes | ✅ **Yes** | ✅ **Yes** | ✅ **Yes** | No | No | No | Yes |
| **API/B2B offering** | No | ✅ **ELSA API** | ❌ | ✅ **SpeechAce API** | No | Yes (enterprise) | Yes (schools) | No |
| **User base** | 0 (new) | ✅ **90M+ downloads** | ✅ **5M+ downloads** | Unknown (B2B) | ✅ **500M+ downloads** | Established (30+ years) | Moderate | 239 countries |
| **Pricing** | Free (hackathon) | ~$13/mo | ~$15/mo | API pricing | ~$30/mo Max tier | ~$12-15/mo | ~$30/mo | ~$10/mo |

---

## Competitor Deep Dives

### 1. ELSA Speak (90M+ Downloads, Market Leader)

**What It Does:**
- AI-powered pronunciation coach
- Provides phoneme-level feedback
- Extensive gamification (points, streaks, leaderboards, minigames)
- Lesson-based structure (8,000+ bite-sized lessons)
- Multiple accent targets (American, British, Australian, Indian)

**Strengths:**
- Phoneme accuracy is best-in-class
- Strong retention through gamification
- Affordable ($12.99/mo)
- Available on mobile

**Gaps vs Your App:**
- **No camera** — relies on audio-only speech analysis
- **No avatar showing mouth** — can't demonstrate correct mouth positions
- **Turn-based** — record → submit → feedback (not real-time coaching)
- **Not truly "live"** — no adaptive, conversational coaching

### 2. BoldVoice (5M+ Downloads, Fast-Growing)

**What It Does:**
- Accent coaching by Hollywood dialect coaches
- Professional positioning (actors, high-profile clients)
- Sound-level analysis and feedback
- Coaching videos + structured lessons
- Focuses on stress and rhythm, not just phonemes

**Strengths:**
- Strong brand positioning ("dialect coaches from Hollywood")
- Expert-level coaching content
- Natural language coaching feedback
- Stress/intonation focus is differentiator

**Gaps vs Your App:**
- **No camera** — audio analysis only
- **No avatar** — video clips of coaches, not interactive
- **Record → async feedback flow** — not real-time bidirectional
- **No mouth position teaching** — purely audio-based

### 3. SpeechAce (B2B API)

**What It Does:**
- Enterprise pronunciation assessment API
- Used by language learning platforms
- Multi-level scoring (sentence → word → syllable → phoneme)
- IELTS/PTE score estimates

**Strengths:**
- Institutional-grade API
- Granular multi-level analysis
- Major adoption in EdTech

**Gaps vs Your App:**
- **B2B only** — not consumer app
- **No audio coaching** — purely scoring
- **No interactive agent** — analysis tool, not coaching tool
- **No visual elements** — API-first, not UX-focused

### 4. Duolingo Max (500M+ Users)

**What It Does:**
- "Video Call" feature with AI character Lily
- Real-time voice conversation practice
- Character has distinct personality (snarky, encouraging)
- Post-call transcript review and tips
- Available in 5-8 languages

**Strengths:**
- Massive user base (500M+ downloads)
- Character personality drives engagement
- Real-time voice conversation works well
- Integrated with language learning platform
- Gamification is gold standard (XP, streaks, levels)

**Gaps vs Your App:**
- **No camera** — Lily is 2D avatar, can't see user
- **Lily can't see user's mouth** — can't provide mouth-position coaching
- **Lily is decorative, not instructional** — not designed for pronunciation teaching
- **Not pronunciation-focused** — general language conversation only

### 5. Rosetta Stone (30+ Years, Established)

**What It Does:**
- "TrueAccent" speech recognition
- Course-based language learning
- Total immersion (no translations)

**Strengths:**
- Decades of brand recognition
- Pioneered consumer speech recognition

**Gaps vs Your App:**
- **TrueAccent is simplistic** — binary pass/fail scoring
- **Not real-time coaching** — lesson-based, not conversational
- **No avatar** — static text/images
- **No camera** — audio only

### 6. Fluently

**What It Does:**
- AI tutor calls with voice
- Conversation-based learning
- Available in multiple languages

**Strengths:**
- Real-time voice conversation
- AI tutor available 24/7

**Gaps vs Your App:**
- **No camera** — voice only
- **No mouth coaching** — general conversation, not pronunciation teaching
- **No visual feedback** — no avatar or blendshapes

---

## Your App's Unique Positioning

### Truly Novel Features (No Competitor Has These)

| Feature | Why Novel | Nearest Competitor | Gap |
|---|---|---|---|
| **Real-time camera mouth tracking** | Users see their own mouth blendshapes in real-time | None | No competitor uses MediaPipe or camera-based analysis |
| **Avatar demonstrating correct mouth positions** | "Show, don't tell" — visual learning of mouth shape | BoldVoice has static coach videos | Your avatar is interactive and synchronized |
| **Live visual comparison (user face ↔ avatar)** | Side-by-side "mouth mirror" showing correct vs actual | None | Entirely novel in consumer pronunciation apps |
| **`tongueOut` blendshape detection** | MediaPipe detects tongue position for "th" sounds | None | No competitor has tongue tracking |
| **Bidirectional live (see + hear simultaneously)** | Gemini Live sees face AND hears voice in same session | Duolingo Video Call only does audio, can't see user | Your app combines bidirectional sight + sound |
| **Tight multimodal feedback loop** | Camera → face tracking → AI hears → AI speaks → avatar demos → user adjusts → camera verifies → repeat | All competitors break into separate steps | Your loop is seamlessly integrated |

**Verdict:** Your app is genuinely novel. The combination of camera + live voice + avatar mouth teaching doesn't exist in any competitor.

---

## Market Insights for Design

### What Drives Retention (From Competitors)
- **Gamification is critical** — ELSA and Duolingo both have extensive points/levels/streaks
- **Character personality matters** — Duolingo's Lily is snarky, users love it
- **Short bite-sized lessons > long sessions** — ELSA's strategy of 8,000+ micro-lessons works
- **Progress visualization** — Seeing improvement over time motivates users

### What Works for Pronunciation
- **Phoneme granularity** — ELSA/SpeechAce show users exactly which sounds are wrong
- **Stress/intonation > just phonemes** — BoldVoice's focus on word stress is differentiated
- **Multiple accent targets** — Users want to learn a specific accent
- **Before/after audio clips** — Users want to hear themselves improve

### What Fails
- **Generic AI "chatbot" positioning** — Duolingo Max works because Lily has personality
- **Turn-based coaching** — Users want real-time back-and-forth, not record→wait→feedback
- **No visual guide** — Users struggle with invisible mouth positions (your app solves this with avatar + camera)

---

## Recommended Features for Your MVP

Based on what works in market:

### From ELSA (High Retention)
- ✅ Add **gamification**: streaks, XP per phoneme, level progression, daily challenges
- ✅ Add **progress dashboard**: visual chart of improvement over attempts
- ✅ Add **"Accent score" assessment**: quick day-1 test to give users their starting score

### From BoldVoice (Expert Positioning)
- ✅ Give avatar a **name and personality** — "Coach Mira", "Professor Phoneme", etc.
- ✅ Focus on **stress/intonation**, not just phonemes
- ✅ Create **scenario-based practice** — not just isolated words

### From Duolingo (Engagement)
- ✅ Add **avatar reactions** — celebrates wins, shows empathy on struggles
- ✅ Include **post-session summary** — transcript + tips for next session
- ✅ Add **personality to agent voice** — distinctive "coach" persona

### From All (Core Features)
- ✅ **Before/after audio recording** — save clips to show improvement
- ✅ **Real-time visual feedback** — blendshape values, waveforms
- ✅ **Multi-accent support** — at least US and UK English

---

## Animation & Fun Ideas (Making It More Engaging)

### Avatar Animations
- **Celebrates mastery** — does a dance move, confetti burst, big smile
- **Empathetic struggle** — sympathetic expression, "let's try that again"
- **Shows frustration** — avatar looks concerned if user keeps missing same sound
- **Encourages streak** — avatar does a celebration if user gets 3 in a row

### Visual Effects
- **Sound wave visualizer** — waveform lights up green when pronunciation matches
- **Face heatmap** — glow areas that need adjustment (e.g., jaw glows if too closed)
- **Particle effects** — mastered phonemes "fly" from avatar's mouth into a collection
- **Ghost overlay** — semi-transparent correct mouth position overlaid on user's face
- **Progress bar** — fills up as user masters more phonemes

### Interactive Challenges
- **"Tongue Challenge" mini-game** — avatar shows tongue between teeth for "th", camera detects user's tongue position, visual match meter (leverages your unique `tongueOut` detection)
- **Speed rounds** — "Say 5 phrases in 60 seconds"
- **Stress pattern mimicry** — "Match the rhythm I say"
- **Shadowing duels** — avatar says line, user repeats, scores compared side-by-side

### Progress Mechanics
- **Phoneme collection** — visual "pokedex" of English sounds, light up mastered ones
- **Skill tree** — unlock higher difficulty sounds as you master basics
- **Weekly streaks** — "You've practiced 5 days in a row!" with reward badge
- **Leaderboard** — weekly rankings among users (privacy-respecting)

---

## Positioning Recommendation for Judges

Your unique story for judges:

> "Existing pronunciation apps are audio-only or turn-based. We built the first **real-time active coaching loop** where the agents sees your mouth (camera), hears your voice, demonstrates correct positions with a 3D avatar, and coaches you in real-time. The combination of multimodal input (eyes + ears) + multimodal output (voice + visual avatar) + tight feedback loop is unprecedented in consumer pronunciation apps."

This directly hits the **40% "Innovation & Multimodal UX"** judging criterion.

---

## Key Takeaway

**No competitive pressure, but many lessons to borrow:**

- ELSA showed gamification works (add it)
- BoldVoice showed expert positioning works (give avatar personality)
- Duolingo showed character personality drives engagement (make avatar memorable)
- All showed multi-level feedback (phoneme granularity) matters
- Your camera + avatar combo is entirely novel and addresses a real gap in the market

The market is ready for real-time, visual, interactive pronunciation coaching. You're building exactly that.
