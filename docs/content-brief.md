# RABENSCHWUR — Content brief for chapter authors

You write game CONTENT (scenes, dialogue, puzzles) in TypeScript for the engine in `src/adventure/`. A dark-medieval point-and-click adventure, hero **Bran** (17, gravedigger's apprentice) wants to become a **knight of the Order of the Raven**. The user wants a **five-star, deep, clever, atmospheric, funny-grim** adventure: rich mechanisms, many examinable objects, drawers/chests to open, red herrings, memorable NPCs, German text with dry black humour. Think Monkey Island / Day of the Tentacle structure in a plague-ridden Middle Ages.

## Read first (in this order)
1. `docs/game-design.md` — story, scene list, puzzle chains (extend and improve them; you may change details, keep the chapter hand-offs below).
2. `src/adventure/types.ts` — `Thing`, `SceneDef`, `G` (script API). 
3. `src/adventure/dsl.ts` — builders: `groundItem`, `container`, `cabinet`, `npc`, `exitThing`, `edgeExit`, `prop`, `decor`, `talk`, `bye`, `says`, `hero`, `once`.
4. `src/adventure/world/ch1.ts` — reference skeleton showing every pattern once (NPC dialogue, cabinet with a locked drawer, locked chest, state-changing prop, exits).
5. `src/adventure/world/items.ts` — global item catalog (names + look texts, all icons exist). You may add extra items in your chapter's `items` export ONLY if the icon exists in `public/g/items` (see `docs/assets.md`).
6. `src/adventure/world/geometry.ts` — `GEO.<scene>` gives the measured walk polygon + depth scale for every background. ALWAYS use it (`walk: GEO.x.walk, scale: GEO.x.scale`). Never edit it.
7. `src/adventure/engine.ts` — only skim `act()`, `click()`, `approach()`, `thingAt()` to understand behaviour: smallest hit rect wins; big props never swallow smaller things on top of them.
8. `docs/assets.md` — every sprite key and its logical size. **You cannot create new art.** If you need an asset that does not exist, write it into `docs/assets-wanted-chN.md` (key, what it shows, size) and work around it for now.
9. **Look at the backgrounds**: `/tmp/claude-0/gen/grid/<scene>.png` are the 960×440 backgrounds with a 40-unit coordinate grid (labels every 80). Read the images of your scenes before placing anything! Floor starts at `GEO.<scene>.floorTop`; feet y between floorTop+8 and 432. Larger y = nearer = drawn in front.

## Coordinates & placement rules
- Scene is 960×440. `x,y` of a Thing = bottom-center (feet) of its sprite. Sprites are drawn at natural logical size × `scale` (npcs also get depth scale).
- Props stand on the floor band (y ≥ floorTop+8). Wall-mounted things (key rack, banners, shields, fireplace objects) use a smaller y so they sit on the wall; give them `at` so the hero walks to the floor in front.
- **Edge zones**: `edgeExit('left'|'right')` occupy x<86 / x>874, y≥215. Do not put important things there.
- Doors/arches in the background that lead somewhere: `exitThing([x,y,w,h], …)` over the painted door (check the grid image!) with `at` on the floor in front, plus a matching arrival `x,y,facing` in the target scene that lies inside its walk polygon.
- NPC art faces RIGHT; pass `facing: -1` for npcs that should face left initially. Standing npcs must be inside the walk polygon (feet), ~70 units from props they should not overlap.
- Keep the walk area free: don't line things up so that they block the whole floor; leave the middle open for walking.
- Every scene needs: ≥1 exit (back to where we came from), ≥12 interactive things (props, npcs, containers, ground items, decor with look text), at least 2 openable containers/drawers with real contents (mix of useful items and **red herrings/distractor items from the catalog**), and at least one puzzle/mechanic. Scenes feel handmade: every prop has an individual, funny/grim `look` text (and often `take`/`use` jokes).
- Ground items: use `groundItem`; they get a glint automatically.

## Writing style (German)
Dry, sardonic, macabre humour (Pest, Hunger, Galgen, Aberglaube) — never cruel to the player, no gore detail. Bran: tired wit and stubborn hope. Each NPC has 3–6 dialogue topics via `talk()`, some unlocked by flags/inventory; remember `once()`-style first meetings. Hints about puzzles are woven into dialogue/look texts so a thoughtful player can solve everything without a walkthrough. Tap-tests: texts ≤ ~140 chars per `say` (long text → several `say` calls).

## Quality rules (no soft-locks!)
- The player must never be able to lose a needed item for good or reach a dead end. If an item is consumed, it must be re-obtainable or provably unneeded afterwards. No "game over": a wrong move gives a funny setback line and a reset.
- Gate puzzles with flags; use `g.set/g.flag`. Use unique flag names (prefix with your chapter e.g. `c1_`, `c2_`…). Items on the ground use `groundItem` ids unique across the game (`taken_<id>`).
- Wrong item on a thing → fall through to engine default or give a custom funny reply in `useWith`/`give` (do this for the main puzzle objects with 1–2 plausible wrong items).
- `exit.guard` may refuse passage with a message.
- Chapter hand-off: see below. Use `await g.card("Kapitel N", "Titel")` then `await g.goto(scene, x, y, facing)` and set `g.set("chapter", N)`.
- Provide `start` (scene, position, `inv` the player realistically has when entering this chapter, flags) and `hint(g)` (one German sentence for the next step; must be correct for every state incl. dead-end-free logic).
- Honor system: `g.honor(±n)`; documented in game-design.md.

## Chapter hand-offs (contract between chapters)
- **Ch1 → Ch2** (end of Ch1 in `dorfplatz` after the player owns `schwert`, `siegelbrief`, `halvard_brief` and talks to Feldwebel Brandt): card "Kapitel 2", `g.set("chapter",2)`, `goto("moorpfad", 80, 395, 1)`. Ch1 start inv: `[]`. Ch2 `start.inv`: `["schwert","siegelbrief","halvard_brief","fackel","eimer"]`.
- **Ch2 → Ch3** (player owns `gegengift` and `hexentalisman`, leaves the moor eastwards): card "Kapitel 3", `chapter=3`, `goto("burgtor", 80, 400, 1)`. Ch3 `start.inv`: `["schwert","siegelbrief","halvard_brief","gegengift","hexentalisman","fackel"]`.
- **Ch3 → Ch4** (Malvor exposed and fled; king/Roderic send Bran): card "Kapitel 4", `chapter=4`, `goto("vulkanpfad", 80, 400, 1)`. Ch4 `start.inv`: `["schwert","spiegelschild","weisheitssiegel","seil","fackel","weihwasser"]` (Ch3 must hand these out/keep them obtainable).
- **Ch4 end**: `g.end(title, text)` — two endings (Gnade = true knight; Rache) plus epilogue cards; honor affects the final text.
- Each chapter may only ADD items it owns (see game-design.md asset lists). Ch1 owns: all Aschenfurt items incl. schwert, siegelbrief, halvard_brief, siegelring, fackel, seil, weihwasser, fieberkraut, rabenfeder, eimer, wurst. Ch2 owns: alraune, schlangenzunge, moorwasser, gegengift, hexentalisman, trank_rot. Ch3 owns: helm, brustpanzer, armschienen, schild, spiegelschild, wein, schlafkraut, zellenschluessel, weisheitssiegel, giftflasche, lappen, sand, eisenstange. Ch4 owns: drachenei, horn. Distractor items may appear anywhere.

## Tooling (run these, fix until clean)
- `npx tsc --noEmit 2>&1 | grep adventure` — typecheck (ignore errors in other authors' files; do not edit them).
- `sh tools/run-ts.sh tools/check-world.ts` — static checks (missing sprites, approach points off the floor, exits…). Treat ERROR as must-fix, WARN as should-fix.
- Write `tools/play-chN.ts` (your chapter) using the headless harness `src/adventure/testing.ts`:
```ts
import { Harness } from "../src/adventure/testing";
import { world } from "../src/adventure/world";
const h = new Harness(world);
h.g.newGame(1);                                     // or start a later chapter: newGame(2)
await h.act("dorfplatz", "brandt", "talk", undefined, ["Was genau"]);   // picks = substrings of choices, in order
await h.act("schmiede", "schrank_1", "use"); h.take("schrank_1", "nadel_zwirn");   // drawer panel → take
await h.act("schmiede", "esse", "use", "kohle");   // use item on thing
h.expectInv("schwert"); h.expectFlag("have_blade");
console.log(h.log.slice(-10).join("\n"), "OK");
```
  Run: `sh tools/run-ts.sh tools/play-chN.ts`. The script must play the **complete chapter** from `start` to the hand-off (also exercise at least 2 wrong-order/wrong-item attempts, locked containers and the honor choices). `h.act` throws if a thing is hidden/missing — that is how you catch mistakes.
- Optionally view your scenes in the browser: dev server at http://127.0.0.1:8080/abenteuer (it may be running; start with `setsid nohup npm run dev >/tmp/dev.log 2>&1 &` if not). Playwright + chromium: `/opt/pw-browsers/chromium-1194/chrome-linux/chrome`; the dev build exposes `window.__game` (Game instance; e.g. `__game.newGame(3)`, `__game.goto("burghof")`). Screenshot your scenes (1280×800 desktop viewport; the canvas is the 960×440 area) and LOOK at them: characters must stand on the floor, nothing overlapping awkwardly, props not floating, nothing covering exits, hit areas sensible. Fix positions/scales until it looks right. This visual pass is mandatory.

## Deliverables
1. `src/adventure/world/chN.ts` (+ optional helper files `chN_*.ts` next to it) exporting `scenes`, `items?`, `combos?`, `start`, `hint` (see `ChapterModule` in types.ts; keep `export default {...}` last line as in the reference).
2. `tools/play-chN.ts` full-chapter playthrough that passes.
3. `docs/assets-wanted-chN.md` (may be empty "none").
4. Final reply: a compact summary — scenes, puzzle chain with item/flag flow, items added to inventory by this chapter, anything the next chapter must know. Be honest about what is untested.

Do NOT modify: `engine.ts`, `dsl.ts`, `types.ts`, `geometry.ts`, `items.ts` (ask via docs/engine-requests.md if you really need something), other chapters' files, assets, route/view files.
