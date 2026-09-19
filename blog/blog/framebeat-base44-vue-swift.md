---
title: "FrameBeat: From an AI Hackathon Prototype to Vue and Swift"
date: 2026-09-19
description: "How a frame drum sequencer I prototyped on base44 became a Vue 3 and TypeScript app, and then a native SwiftUI app living in the same repo."
image: /logo-og.png
featured: true
---
# FrameBeat: From an AI Hackathon Prototype to Vue and Swift

[FrameBeat](https://framebeat.adambailey.io/) is a frame drum and polyrhythmic step sequencer. You can click the drum to play it, or program two step lines and hit play. The bottom line sets the bar, the top line splits that same bar into its own number of steps, and the two always land together on beat one. The code is on [GitHub](https://github.com/isAdamBailey/framebeat).

The first version came out of an AI hackathon, built on base44. That kind of tool is great at one thing: getting something clickable in front of you before you've even decided what the thing is. I clicked around, played the drum, and knew I wanted to keep it.

So I kept the idea and rewrote it in the stack I know.

## Rewriting it in Vue and TypeScript

The first commit in the repo is literally `Initial Vue port of the FrameBeat drum sequencer`. Most of it was the normal work of turning components into other components. The part that took actual thought was the audio.

If you play drums on a JavaScript timer, it drifts. `setTimeout` fires when the browser gets around to it, and your ears notice long before your eyes do. The fix is to not play anything on a timer at all. Instead, a timer wakes up every so often, looks a little way into the future, and books every step that falls in that window onto the `AudioContext` clock:

```ts
const horizon = audioCtx.currentTime + 0.12
const bd = beatDur()
const tsd = topStepDur()
while (bStream.next < horizon || tStream.next < horizon) {
  if (bStream.next <= tStream.next) {
    scheduleStep('bottom', bStream.idx, bStream.next)
    bStream.idx = (bStream.idx + 1) % bottom.count
    bStream.next += bd
  } else {
    scheduleStep('top', tStream.idx, tStream.next)
    tStream.idx = (tStream.idx + 1) % top.count
    tStream.next += tsd
  }
}
```

Two streams, one clock, whichever step comes first gets booked first. The timer can be late and it doesn't matter, because the sound was already scheduled for the exact time it should play.

Every sound is synthesized live with the Web Audio API in `src/lib/drumAudio.ts`. No samples, no backend, no database. Everything lives in memory until you close the tab.

## The Swift app in the same repo

A day later I started a native SwiftUI version for macOS and iPad. I put it in a `macos/` folder in the same repo instead of starting a new one, because the Swift version is a port of the web version. When I'm matching behavior, I want the TypeScript sitting right next to it.

The engine lives in a Swift package called `FrameBeatCore`, and two Xcode targets (macOS and iPad) share one source tree. The project file is generated with `xcodegen`, and both apps ship under one bundle ID so it's a single purchase on the App Store.

The scheduler got the same trick as the web version. Swift has its own tempting timer, `DispatchQueue.main.asyncAfter`, and it drifts for the same reason `setTimeout` does. So `LiveSequencer` books steps against `AVAudioEngine`'s sample clock instead. It even computes each step as `anchor + stepIndex * stepDuration` rather than adding up a running total, so floating point error doesn't creep in over a long jam.

My favorite small gotcha was on iPad. On macOS audio just works. On iOS you get silence (or it obeys the physical mute switch) unless you ask for a playback session first:

```swift
#if os(iOS)
let session = AVAudioSession.sharedInstance()
try? session.setCategory(.playback, mode: .default)
try? session.setActive(true)
#endif
```

Porting it ended up being the best documentation the web version ever got. The Swift side had to match the timing exactly, so every rule I'd only half-written in TypeScript had to be spelled out, down to how the visuals account for output latency and what happens to the bar when you change the tempo mid-play. If you ever want to find out what your app really does, try writing it again in a different language.

Happy drumming!
