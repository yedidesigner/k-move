# Visual expansion research review

Reviewed 2026-11-01 (Asia/Seoul). Thirty original Korean entries and thirty purpose-built static visual examples. No existing entries or PDF claims were changed.

## Sources and checked scope

- **visual-principles** — [Figma · Graphic design principles](https://www.figma.com/resource-library/graphic-design-principles/)
  - Used for: alignment, rhythm.
  - 정렬·반복·리듬의 개념 대조. 브랜드별 규칙은 보편 법칙으로 옮기지 않았습니다.
- **visual-layout** — [IBM Design Language · Layout overview](https://www.ibm.com/design/language/layout/overview/)
  - Used for: repetition.
  - 구성 요소의 관계와 레이아웃 원리 참고.
- **visual-gestalt** — [OpenStax · Gestalt Principles of Perception](https://openstax.org/books/psychology-2e/pages/5-6-gestalt-principles-of-perception)
  - Used for: figure-ground, good-continuation.
  - 전경·배경과 좋은 연속의 지각 원리 참고.
- **visual-closure** — [NN/g · Principle of Closure in Visual Design](https://www.nngroup.com/articles/principle-closure/)
  - Used for: closure.
  - 폐쇄성의 정의와 불완전한 형태의 인지 참고.
- **visual-contrast** — [NN/g · 5 Principles of Visual Design in UX](https://www.nngroup.com/articles/principles-visual-design/)
  - Used for: contrast, symmetry.
  - 대비·균형·게슈탈트 개념 대조.
- **visual-tension** — [Raven Heinstein · Visual Tension in Graphic Design](https://digitalcommons.wku.edu/stu_hon_theses/469/)
  - Used for: visual-tension.
  - 디자인 학위 연구 초록의 논의 범위 참고. 보편적 효과나 실험 결과로 사용하지 않았습니다.
- **visual-anatomy** — [Monotype · A Glossary of Typographic Terms](https://www.monotype.com/resources/typographic-terms)
  - Used for: baseline, cap-height, descender, counter.
  - 베이스라인·캡 하이트·카운터·디센더의 용어 대조. 웹 본문의 ascender 오기를 그대로 옮기지 않았습니다.
- **visual-type-glossary** — [Explorations in Typography · Glossary](https://explorationsintypography.com/glossary/)
  - Used for: x-height, ascender, ligature.
  - 어센더·x-height 등 서체 구조와 합자의 용어 대조.
- **visual-kerning** — [Adobe InDesign · About kerning and tracking](https://helpx.adobe.com/indesign/desktop/format-and-style-text/tabs-indents-and-spacing/about-kerning-and-tracking.html)
  - Used for: kerning, tracking.
  - 글자쌍 간격과 문자열 간격의 차이 참고.
- **visual-leading** — [Adobe InDesign · Adjust line spacing with leading](https://helpx.adobe.com/indesign/desktop/format-and-style-text/character-formatting/adjust-line-spacing-with-leading.html)
  - Used for: leading.
  - 베이스라인 사이의 행간과 문단 간격 구분.
- **visual-grid** — [Adobe InDesign · Align text](https://helpx.adobe.com/indesign/using/aligning-text.html)
  - Used for: baseline-grid.
  - 다단 본문의 베이스라인 그리드 적용 참고.
- **visual-scale** — [IBM Design Language · Type scale](https://www.ibm.com/design/language/typography/type-scale/)
  - Used for: typographic-scale.
  - 서체 크기·행간 체계의 역할 참고. IBM 수치를 모든 디자인의 규칙으로 취급하지 않았습니다.
- **visual-rag** — [Ilene Strizver / Monotype · Rags, Widows & Orphans](https://www.myfonts.com/pages/fontscom-learning-fontology-level-2-text-typography-rags-widows-orphans)
  - Used for: rag, widows-orphans.
  - 래그와 외톨이 행의 개념 참고. widow/orphan 명칭은 출판 관행별 차이를 표시했습니다.
- **visual-line-length** — [W3C WAI · Understanding SC 1.4.8 Visual Presentation](https://www.w3.org/WAI/WCAG22/Understanding/visual-presentation.html)
  - Used for: line-length.
  - 행 길이와 텍스트 조정의 접근성 맥락. AAA 기준을 모든 본문의 최적값으로 주장하지 않습니다.
- **visual-variable** — [Google Fonts Knowledge · Introducing variable fonts](https://github.com/google/fonts/blob/main/cc-by-sa/knowledge/modules/introducing_type/lessons/introducing_variable_fonts/content.md)
  - Used for: variable-font.
  - 가변 폰트의 축과 인스턴스 개념 참고.
- **visual-weight** — [Microsoft OpenType · wght axis](https://learn.microsoft.com/en-us/typography/opentype/spec/dvaraxistag_wght)
  - Used for: weight-axis.
  - 등록된 웨이트 축의 역할과 범위 참고.
- **visual-optical** — [Microsoft OpenType · opsz axis](https://learn.microsoft.com/en-us/typography/opentype/spec/dvaraxistag_opsz)
  - Used for: optical-size.
  - 옵티컬 사이즈는 단순 확대가 아닌 글자 형태 조정이라는 구분.
- **visual-hsl** — [W3C · CSS Color 4, HSL](https://www.w3.org/TR/css-color-4/#the-hsl-notation)
  - Used for: hue, saturation, lightness.
  - HSL 좌표와 지각적 균일성의 한계 참고. 색 견본은 직접 구성했습니다.

## Accuracy decisions

- Google Fonts Knowledge glossary pages returned no readable article content, so they are not cited as if inspected. The official Google Fonts repository article was readable and supports variable-font explanations.
- Monotype glossary HTML repeats aperture wording under Ascender. That error was not adopted; the author-maintained Explorations in Typography glossary was used to verify ascender.
- Visual tension is a compositional term, not a guaranteed psychological effect. The university thesis abstract supports its scope only; the original poster comparison is an instructional design proposal.
- Widow/orphan naming varies across publishing traditions. The lesson specifies the actual isolated line and location rather than presenting one naming convention as universal.
- HSL hue, saturation and lightness examples change one coordinate at a time. HSL lightness is not described as perceptually uniform or as a substitute for WCAG contrast.
- Kerning modifies a letter pair; tracking modifies the selected run. The two visual samples distinguish those scopes.
- Anatomy glyphs, ligature and optical-size figures are original SVG drawings. They are labeled conceptual illustrations; no unsupported claim of active font-axis behavior is made.
- Variable-font and weight-axis samples are static weight specimens. The lesson explains that axes and supported ranges are properties of the actual font file.
- Definitions use short factual paraphrases; teaching scenarios, critiques, examples, and visuals are original. Source-derived prose is distributed over 18 distinct pages rather than reproducing a glossary or article.

## Verification

- All 30 manifest IDs present exactly once; every source ID resolves; English/Korean/pronunciation/definition/example/application/critique/figure are populated.
- Owned component passed ESLint. JSON, TSX, and CSS formatted with repository Prettier.
- Browser layout validation is delegated to the parent release check; no browser success is claimed here.
