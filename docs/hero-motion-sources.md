# Homepage motion demonstrations

Prototype based on origin/main 669098d2, inspected 1 October 2026. Preserves the live five-model turntable, active M4B promotion, prices and product links.

## Sources and edits

- **M4 seat lift/tilt**: XSTO manufacturer product page https://www.xstomobility.com/products/xsto-m4-self-balancing-power-wheelchair-long-battery-life ; source https://www.xstomobility.com/cdn/shop/files/M4-gift-1.gif?v=1750059819 . Full original animation, slowed to twice its duration for legibility.
- **M4 folding/disassembly**: same page; https://www.xstomobility.com/cdn/shop/files/M4-gift-2.gif?v=1750059819 . Full animation, 1.5× original duration. This includes separation into parts, not just folding.
- **M4B elevation / tilt**: existing site film https://cdn.shopify.com/videos/c/o/v/24482dbe89234283a018301fa020db98.mp4 . Elevation excerpt 54–63 seconds; tilt 66–74 seconds. Film identifies the M4B leg-rest version. Hero crops the right-hand rider from the split screen to a 940×940 frame, removing the divider and original subtitle; the complete chair movement is retained with an XSTO attribution and descriptive caption. This is synchronized seat/leg-rest geometry, not a claim of independently powered leg-rest adjustment.
- **M4 Pro backrest recline**: manufacturer's film already referenced in docs/rebuild/product-copy-productData.ts; https://pub-b6593f4aaa3143c4b018c61c953c56f7.r2.dev/New%20XSTO%20M4%20Pro.mp4 . 114–122 seconds. Do not label this as powered backrest adjustment.
- **M4 Pro seat width**: https://www.xstomobility.com/products/xsto-m4-pro-self-balancing-mobility-scooter-long-battery-life ; source https://www.xstomobility.com/cdn/shop/videos/c/vp/83c87ce8ae1b4ef0a3725790f7a882c9/83c87ce8ae1b4ef0a3725790f7a882c9.HD-720p-1.6Mbps-77640158.mp4?v=0 . Full animation, 1.5× duration. Manual fitting adjustment, not an occupied power-seating function.
- **X12 series tracks**: https://www.xstomobility.com/products/xsto-x12-electric-stair-climbing-wheelchair-all-terrain ; source https://www.xstomobility.com/cdn/shop/videos/c/vp/472bca3e38584c14b9e7eb878481e732/472bca3e38584c14b9e7eb878481e732.HD-1080p-7.2Mbps-85018112.mp4?v=0 . Manufacturer CGI track demonstration, full clip.
- **X12 series self-levelling**: same page; https://www.xstomobility.com/cdn/shop/videos/c/vp/4750a9d7d73448c18d96ff379eaadbd1/4750a9d7d73448c18d96ff379eaadbd1.SD-480p-1.0Mbps-88029434.mp4?v=0 . Full clip.
- **X12 series boarding position**: same page; https://www.xstomobility.com/cdn/shop/videos/c/vp/53f8a39080994392b41269bf3c07441d/53f8a39080994392b41269bf3c07441d.SD-480p-1.0Mbps-88029359.mp4?v=0 . Full clip from manufacturer “Dual Access Boarding” section.
- **X12 series rocking**: same page; https://www.xstomobility.com/cdn/shop/videos/c/vp/8aa959c1dd014b21b9614db40950bb5e/8aa959c1dd014b21b9614db40950bb5e.SD-480p-1.0Mbps-88029360.mp4?v=0 . Full clip from manufacturer “Rocking Mode” section.

Clips are silent H.264 MP4, 25 fps, maximum 960×720, with fast-start metadata and local posters. Original logos/text remain visible except for the documented M4B single-rider crop. Files live in public/videos/hero. Full source films are temporary research files, not shipped.

## Behaviour

11-second turntable dwell. Allow 1.4 seconds for the chair to settle, then load only its selected demonstration. Selecting a function holds that chair until a different model is selected or rotation resumed. Pause stops film and rotation; off-screen/background tabs stop playback. Reduced-motion visitors retain the static chair views. Failed or blocked video playback leaves the actual product image visible.

## Remaining limitations

Only M4 and M4 Pro seat-width have clean studio animation assets. Other clips have original film backgrounds. No invented 3D mechanics or separate animated image parts are used. X12 sources cover both variants and the page labels them as series demonstrations with model-dependent equipment. A clear isolated X12 Pro powered-leg-rest demonstration was not found; do not imply the rocking clip demonstrates that feature. Seamless 360-degree articulating models would require manufacturer 3D assets or matching studio footage for each product.
