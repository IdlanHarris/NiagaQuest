# NiagaQuest Phase 2 Update

## Included
- Switchable Classic and Modern themes; selected theme is saved in browser localStorage.
- Desktop-first game dashboard with round and game-state indicator.
- Reusable player cards showing position, status, money and achievement points.
- Reusable plot-effect notification for rewards, penalties and movement.
- Scenario popup remains visible behind the presentation panel.
- Removed the hard-coded Christy Ng test QR from the generic scenario popup. Replaced it with scenario-neutral business insight guidance.
- Final results screen with podium, finishing order, achievement points, final money, restart and return-to-lobby actions.
- Updated application metadata.
- Existing board path, dice UI, NPC automation, voting flow, Admin Controller and game rules retained.

## New components
- `components/game/PlayerCard.tsx`
- `components/game/TurnIndicator.tsx`
- `components/game/PlotNotification.tsx`
- `components/game/FinalResults.tsx`

## Updated components
- `app/game/page.tsx`
- `app/globals.css`
- `app/layout.tsx`
- `components/game/GameBoard.tsx`
- `components/game/ScenarioPopup.tsx`
- `components/game/PresentationPanel.tsx`

## Validation
- TypeScript: `tsc --noEmit` passed.
- ESLint: `eslint app components lib types` passed.
- Next.js production build could not be completed in the Linux build environment because the Linux SWC binary was not included and network access was unavailable to download it. Run `npm run build` in the user's Windows development environment to complete the production-build check.
