# Contextual glossary examples

The glossary's 239 terms and all 7 study guides now share an original contextual example registry. UI concepts use fictional websites and mobile interfaces; research, process, career, and business concepts use the corresponding documents, boards, portfolios, and data artifacts. Each example includes a specific observation callout.

## Learning presentation

- Keep the existing simplified structure available under “핵심 구조 살펴보기”.
- Show the contextual example immediately, marked as a fictional educational static screen.
- Keep existing practice and the CTA, hamburger navigation, and carousel demos separate from static scenes. Decorative controls in static examples are not focusable buttons or inputs.
- Preserve white glossary card backs, alphabetic ordering, current term translations, and the 195 example / 44 practice classifications.
- Reuse the existing three photographs with their source and usage basis documented in `public/glossary/SOURCES.md`. New contextual layouts are native HTML/CSS/SVG, not pasted product screenshots.

## Verification

- Coverage: every glossary ID appears in exactly one of five contextual scene groups; all seven study-guide visual IDs resolve to the same registry.
- Rendering: all 239 scenes render with a concept callout and without pretend form controls. Physical curb-cut and domain/address-bar examples use their own appropriate context rather than a generic browser frame.
- Regression checks: existing glossary, learning-mode, study-material, demo, routing, and accessibility tests pass; the three new contextual-example tests pass.
- TypeScript and production build pass. Targeted ESLint reports no errors and one development-only Fast Refresh warning for the registry helper export.
- Browser checks: all 239 examples fit a 390 px mobile preview without horizontal overflow at the example container. Representative desktop and mobile scenes and the study-guide integration were visually inspected.
- Content review corrected keyboard traversal order, pagination totals, research scenario consistency, SUS score interpretation, and photo descriptions.

The local preview harness is a verification artifact only. It is not part of the production application and does not change authentication or data access.
