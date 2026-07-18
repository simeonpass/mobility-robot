import type { ProductData, ProductSpec, ProductDimension, ProductFeature } from "./productData";
import m4bHero from "@/assets/m4b-hero.jpg";
import m4bFront from "@/assets/m4b-front.jpg";
import m4bRear from "@/assets/m4b-rear.jpg";
import m4bBack from "@/assets/m4b-back.jpg";
import m4bSideLeft from "@/assets/m4b-side-left.jpg";
import m4bSideRight from "@/assets/m4b-side-right.jpg";
import m4bAngle2 from "@/assets/m4b-angle-2.jpg";
import m4bAngle4 from "@/assets/m4b-angle-4.jpg";

export const m4bHeroImage = m4bHero;

export const m4bSpecs: ProductSpec[] = [
  { label: "Max Load Capacity", value: "115 kg", unit: "(254 lbs)" },
  { label: "Top Speed", value: "6 km/h", unit: "(3.7 mph)" },
  { label: "Range", value: "15 km", unit: "(9.3 miles)" },
  { label: "Max Slope", value: "10°" },
  { label: "Weight (no battery)", value: "52 kg", unit: "(115 lbs)" },
  { label: "Battery", value: "25.55V", unit: "15.5Ah" },
  { label: "Charge Time", value: "4 hours" },
  { label: "Obstacle Height", value: "50 mm" },
  { label: "Ditch Crossing", value: "100 mm" },
  { label: "Lifting Range", value: "347–650 mm" },
  { label: "Front Wheels", value: "Omnidirectional" },
  { label: "Rear Wheels", value: "10\" solid tyres" },
  { label: "Control", value: "Joystick", unit: "Bluetooth / APP" },
  { label: "Protection", value: "IPX4", unit: "Water Resistant" },
];

export const m4bDimensions: ProductDimension[] = [
  { label: "Folded Size", value: "1040 × 580 × 570 mm" },
  { label: "Unfolded Size", value: "1035 × 580 × 930 mm" },
  { label: "Highest Position", value: "980 × 580 × 1080 mm" },
  { label: "Seat Height Range", value: "347–650 mm (13.7\"–25.6\")" },
  { label: "Turning Radius", value: "820 mm (32.3\")" },
  { label: "Armrest Adjustment", value: "Up & Down" },
  { label: "Handle", value: "Interchangeable left & right" },
  { label: "Legrest", value: "Manual folding" },
  { label: "Footrest", value: "New folding footrest" },
  { label: "Balance Type", value: "Front/Rear self-balancing" },
];

const m4bFeatures: ProductFeature[] = [
  {
    title: "New Folding Footrest",
    description: "Redesigned folding footrest for improved transfer, easier storage and a cleaner folded footprint. Flips out of the way in one motion.",
    icon: "Minimize2",
  },
  {
    title: "Self-Balancing Chassis",
    description: "Smart control platform monitors slopes in real time and levels the chassis automatically for a stable ride on inclines up to 10°.",
    icon: "Scale",
  },
  {
    title: "Electric Height Adjustment",
    description: "Elevate from 347 mm to 650 mm at the touch of a button — reach worktops, shelves and eye-level conversations.",
    icon: "ArrowUpDown",
  },
  {
    title: "Omnidirectional Wheels",
    description: "Mecanum front wheels enable full 360° movement with a tight 820 mm turning radius — perfect for hallways and lifts.",
    icon: "Move",
  },
];

export const m4bProduct: ProductData = {
  id: "xsto-m4b",
  slug: "xsto-m4b",
  name: "XSTO M4B",
  tagline: "Self-Levelling · New Folding Footrest",
  description:
    "The XSTO M4B builds on the award-winning M4 platform with a brand new folding footrest for easier transfers and a tidier folded footprint. Self-balancing, electric height adjustment and omnidirectional wheels — all in a chair that folds into any car boot.",
  price: 4495,
  images: [
    { src: m4bHero, alt: "XSTO M4B Premium Self-Balancing Wheelchair with New Folding Footrest" },
    { src: m4bFront, alt: "XSTO M4B Front View" },
    { src: m4bAngle2, alt: "XSTO M4B Three-Quarter Front View" },
    { src: m4bAngle4, alt: "XSTO M4B Alternate Three-Quarter View" },
    { src: m4bSideLeft, alt: "XSTO M4B Left Side Profile" },
    { src: m4bSideRight, alt: "XSTO M4B Right Side Profile" },
    { src: m4bRear, alt: "XSTO M4B Rear View with Battery Pack" },
    { src: m4bBack, alt: "XSTO M4B Back View" },
  ],
  specs: m4bSpecs,
  dimensions: m4bDimensions,
  features: m4bFeatures,
  reviews: [],
  highlights: [
    "New folding footrest",
    "Self-balancing chassis · 10° slopes",
    "Electric height adjustment 347–650 mm",
    "Omnidirectional mecanum wheels",
    "IPX4 water resistant",
  ],
  inBox: [
    "XSTO M4B Power Wheelchair",
    "25.55V 15.5Ah Lithium Battery",
    "Battery Charger",
    "Joystick Controller",
    "Bluetooth Remote Control",
    "User Manual",
    "Tool Kit",
  ],
  warrantyMonths: 60,
};