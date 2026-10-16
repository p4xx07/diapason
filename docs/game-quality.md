# Game quality measurements

The target for iterative review is a mean **9.5/10** across at least three independent judges. Each judge rates usability, visual design, enjoyment, and learning value after playing the actual game. The judge mean is the average of those four dimensions; the overall score is the average of judge means. A higher score must be supported by observed behavior, not only a visual opinion.

| Measure | How to check | Target |
| --- | --- | --- |
| Entry friction | Actions from landing to a playable question | One visible action at 390 × 844 |
| Round fit | Bounds of stimulus, all answers, and controls | No horizontal overflow or hidden answer at 390 × 844 and 1440 × 900 |
| Feedback response | Time from answer input to readable result | Under 150 ms in local headless testing |
| Error study time | Wait on a wrong solo answer without user input | No forced advance |
| Learning transfer | Try a related new example after a miss | Report separately from identical-item recall |
| Musical fairness | Grade all answer choices with exact sounding voicing | Every equivalent answer accepted; at least one wrong choice |
| Room fairness | Two isolated players in one room | Same question/deadline; no answer leakage before reveal |
| Motion access | Reduced motion and opt-in haptics | Meaning remains clear with both effects off |

These are lab checks. Real completion, replay, retention, and learning gains need actual user data before being stated as outcomes.

## Review ledger

| Pass | Judge means | Overall | Main observed blocker |
| --- | --- | ---: | --- |
| 1 | UX 6.00, visual 6.63, learning 6.40 | 6.34 | Timed answers and results below the phone viewport; weak learning cues |
| 2 | UX 6.75, visual 7.58, learning 7.00 | 7.11 | Abrupt opening difficulty; staff vanishes during explanation; identical miss review |
| 3 | UX 7.25, visual 8.03, learning 7.53 | 7.60 | Four advanced qualities at the opening; repeated sounds; notes too far beyond staff |
| 4 | UX 7.50, visual 8.38, learning 7.75 | 7.88 | A/B playback differed in articulation; retries could repeat earlier sounds; chosen notes not shown |

Pass 5 has only a partial visual score (8.43). The other two judges reached a Codex usage limit before scoring, so there is no comparable overall mean. The partial review found that the keyboard switched to the chosen chord while the title still named the answer; this was corrected and checked in a headless browser. Release verification below remains independent of the judge score.

Each pass uses an isolated headless browser. The user's active browser is never used for testing. The reusable review procedure is in the local `game-ux-feedback` skill.
