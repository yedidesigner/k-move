# Expansion authoring contract

Existing 239 entries remain. Four expansion packs add 30 entries each, identified in `src/data/expansion/manifest.json`. Do not rename existing IDs or author an ID from another pack.

Each pack is `src/data/expansion/<pack>.json`:

```ts
{
  sources: { id: string; title: string; url: string; note: string }[];
  terms: {
    id: string; english: string; korean: string; pronunciation: string;
    description: string; example: string; aliases: string[];
    topic: "foundations"|"research"|"visual"|"interaction"|"systems"|"accessibility"|"strategy"|"career"|"production"|"branding";
    essential: string;
    application: { scenario: string; decision: string };
    critique: { tradeoff: string; evidence: string };
    confusedWith: { id: string; difference: string }[];
    sourceIds: string[];
    figure: {
      kind: "comparison"|"board"|"document"|"matrix"|"timeline"|"chart"|"typography"|"palette"|"code"|"anatomy"|"concept"|"flow"|"screen";
      title: string; subtitle: string;
      items: { label: string; text: string; detail?: string; value?: number }[];
      focus: string; caption: string;
    };
  }[];
}
```

Use original Korean explanation, familiar professional terms and English aliases. Every definition should distinguish the concept, every example should be concrete. Aim 2 concise sentences in definition, a short example, and substantive scenario/decision/tradeoff/evidence. Sources are actual inspected primary/official or author-maintained resources, not search metadata. Source IDs are prefixed with pack name. Avoid whole-source paraphrase: each source must stay within its reuse word budget; consult several distinct authoritative pages and distribute references. Do not cite a source for concepts it does not substantiate. Do not invent PDF page references. Existing PDFs remain a separate source set.

Also create one native editable educational scene component per pack:
`src/components/glossary/expanded/<Pack>Examples.tsx` + `<pack>-examples.css`.
Export `<Pack>Examples({termId}: {termId:string})`. CSS classes must be prefixed `xe-<pack>-`. Render a precise visual/realistic original interface or design artifact for every assigned term. Families can share layout but change the actual content/marking per term. Keep readable on 320px content width; no remote assets required. Label fictional data. Use plain static visual examples unless a meaningful behavior can be implemented and tested; no pretend-interactive controls. Prefer restrained black/white + teal instructional accent. Use SVG/HTML/CSS for accurate diagrams. Never generic placeholder cards in place of meaningful visual evidence.

Root integrates packs into existing data and figure rendering. Agents do not edit aggregate data, navigation, shared components, or tests; only assigned pack/component/styles and their own research notes. No commit or deployment by agents.
