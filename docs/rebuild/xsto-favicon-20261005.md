# XSTO favicon — 5 October 2026

The user requested replacing the retired Mobility Robot monogram with a favicon matching the current joint branding and suggested XSTO.

## Artwork

Created with the built-in image-generation tool, using `app/assets/xsto-wordmark-light.png` as the reference. Final prompt: retain only the white XSTO wordmark and its arch, preserve the distinctive lowercase letter shapes, remove Bentech/flag/divider/registered-mark detail, and centre it at approximately 90% width on an edge-to-edge ink-navy `#233048` square. No extra text, effects, border, texture, gradients or mockup.

The final deployable master is `app/assets/xsto-favicon.png` (512×512). Additional PNG exports are 32×32, 192×192 and 180×180 for Apple. `scripts/build-favicons.mjs` performs format/size exports from the approved generated square master and assembles a multi-size ICO with 16/32/48/64/128/256 frames.

## Integration

- Content-hashed asset URLs in the page head refresh the tab and Apple icons.
- The versioned manifest declares 192- and 512-pixel icons; the business remains named Mobility Robot by Bentech Medical.
- Existing PNG/ICO/Apple and legacy Mobility Robot favicon URLs all resolve to the replacement artwork.
- The old public SVG wrapper now embeds the new PNG rather than the retired monogram.
- No header logo, business identity, product, pricing, campaign or checkout changes.

Checked the actual 16- and 32-pixel images for legibility. Browser favicon caches, saved device shortcuts and search-engine caches may refresh independently of publication.

Validation: all 329 tests passed, including six icon/manifest tests; type checking and the production build passed after regenerating the existing Storefront API types. The build emits a pre-existing optional bundle-analysis warning; the deployable client and server artefacts are generated successfully.
