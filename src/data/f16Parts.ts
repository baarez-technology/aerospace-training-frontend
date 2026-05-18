// Educational metadata for the F-16 Fighting Falcon 3D model.
//
// Each `node` value maps to a named parent node inside public/models/f-16.glb
// (verified from the GLB scene graph). The viewer traverses the model and
// groups meshes under these nodes so each "part" can be isolated, highlighted,
// exploded, and annotated independently.

export type PartCategory =
  | 'structure'
  | 'cockpit'
  | 'avionics'
  | 'landing-gear'
  | 'armament';

export interface F16Part {
  /** Stable id used for selection state. */
  id: string;
  /** Parent node name(s) in the GLB scene graph that make up this part. */
  nodes: string[];
  label: string;
  /** One-line summary shown in the parts list. */
  tagline: string;
  category: PartCategory;
  /** Educational overview — what it is. */
  overview: string;
  /** Why a trainee should care — operational relevance. */
  role: string;
  /** Bullet facts surfaced in the info panel. */
  keyFacts: string[];
  /** Technical specifications (label → value). */
  specs: Record<string, string>;
  /**
   * Direction (unit-ish vector) this part travels in "exploded view".
   * The viewer multiplies this by the explode amount.
   */
  explode: [number, number, number];
  /** Highlight / accent colour (hex) used for the hotspot and outline. */
  accent: string;
}

export const CATEGORY_LABELS: Record<PartCategory, string> = {
  structure: 'Airframe & Structure',
  cockpit: 'Cockpit',
  avionics: 'Avionics',
  'landing-gear': 'Landing Gear',
  armament: 'Armament',
};

export const F16_PARTS: F16Part[] = [
  {
    id: 'airframe',
    nodes: ['F-16-airframe_0'],
    label: 'Airframe & Fuselage',
    tagline: 'Blended wing-body, single-engine structure',
    category: 'structure',
    overview:
      'The primary load-bearing structure of the F-16: the blended wing-body fuselage, cropped-delta wings, single vertical stabiliser and all-moving horizontal stabilators. The chined forebody and leading-edge root extensions (LERX) generate controlled vortices that keep the wing flying at very high angles of attack.',
    role:
      'Understanding airframe geometry explains the F-16’s departure resistance, its relaxed-static-stability design, and why structural g-limits drive the flight envelope every sortie operates within.',
    keyFacts: [
      'Relaxed static stability — intentionally aerodynamically unstable, kept controllable by the fly-by-wire system',
      'Cropped-delta wing with leading-edge root extensions (LERX) for high-AoA vortex lift',
      'Single Pratt & Whitney F100 / GE F110 turbofan in the aft fuselage',
      'Designed for a +9 g / −3 g symmetric structural envelope',
    ],
    specs: {
      'Wing span': '9.96 m (32 ft 8 in)',
      Length: '15.06 m (49 ft 5 in)',
      Height: '4.88 m (16 ft)',
      'Wing area': '27.87 m² (300 ft²)',
      'Empty weight': '~8,570 kg',
      'Max take-off': '~19,200 kg',
    },
    explode: [0, 0, 0],
    accent: '#3b82f6',
  },
  {
    id: 'canopy',
    nodes: ['F-16-canopy_1'],
    label: 'Bubble Canopy',
    tagline: 'Frameless polycarbonate one-piece canopy',
    category: 'cockpit',
    overview:
      'The F-16’s frameless, one-piece bubble canopy is a defining feature. Mounted high with no forward bow frame, it gives the pilot an unobstructed 360° horizontal and exceptional over-the-nose / over-the-side view — a decisive advantage in visual air combat.',
    role:
      'Canopy visibility shapes lookout doctrine and situational awareness. Trainees learn canopy jettison and through-canopy ejection sequencing as core emergency procedures.',
    keyFacts: [
      'Provides 360° lateral, 195° fore-and-aft field of view',
      'Polycarbonate construction with a transparent conductive anti-icing coating',
      'Supports through-canopy ejection — the canopy is shattered/jettisoned before seat departure',
      'Bird-strike rated for low-level high-speed flight',
    ],
    specs: {
      Construction: 'Polycarbonate, frameless',
      'Field of view': '360° lateral / 195° longitudinal',
      Coating: 'Gold-tinted conductive anti-ice film',
      Egress: 'Canopy jettison + ejection seat',
    },
    explode: [0, 0.9, 0],
    accent: '#22d3ee',
  },
  {
    id: 'cockpit',
    nodes: ['F-16-cockpit_2'],
    label: 'Cockpit & Controls',
    tagline: 'Reclined seat, sidestick, HOTAS layout',
    category: 'cockpit',
    overview:
      'The cockpit introduced a 30° reclined ejection seat to raise g-tolerance, a pressure-sensitive sidestick controller on the right console instead of a centre stick, and a full HOTAS (Hands On Throttle And Stick) layout so the pilot never removes hands from the primary controls during combat.',
    role:
      'HOTAS muscle-memory, sidestick force inputs, and the reclined seating position are foundational airmanship skills practised continuously in the simulator phase.',
    keyFacts: [
      '30° reclined seat — improves g-tolerance by raising heart-to-eye level',
      'Right-hand sidestick: force-sensing, minimal physical movement',
      'Full HOTAS — sensors, weapons and countermeasures all on stick & throttle',
      'ACES II zero-zero ejection seat (zero altitude, zero airspeed capable)',
    ],
    specs: {
      'Seat recline': '30°',
      Controller: 'Force-sensing sidestick (right console)',
      'Control philosophy': 'HOTAS',
      'Ejection seat': 'McDonnell Douglas ACES II',
    },
    explode: [0, 0.5, 0],
    accent: '#a855f7',
  },
  {
    id: 'hud',
    nodes: ['F-16-hud_3'],
    label: 'Head-Up Display (HUD)',
    tagline: 'Primary flight & weapon-aiming reference',
    category: 'avionics',
    overview:
      'The wide-angle HUD projects flight, navigation and weapon-delivery symbology onto a combiner glass in the pilot’s forward line of sight, collimated to infinity so the eyes stay focused outside. It is the primary flight reference in the F-16 — not a backup instrument.',
    role:
      'Trainees learn to fly attitude, energy and weapon solutions head-up. HUD symbology interpretation (flight path marker, pitch ladder, target designator) is assessed throughout the syllabus.',
    keyFacts: [
      'Primary flight instrument — attitude, airspeed, altitude, heading all head-up',
      'Flight Path Marker shows where the jet is actually going, not just where it points',
      'Doubles as the weapon-aiming reticle for guns and air-to-ground delivery',
      'Symbology collimated to infinity to eliminate refocus / parallax',
    ],
    specs: {
      Type: 'Wide-angle refractive HUD',
      Function: 'Primary flight + weapon aiming',
      Collimation: 'Focused at infinity',
      'Key symbols': 'FPM, pitch ladder, TD box, steering cue',
    },
    explode: [0, 0.35, 0.45],
    accent: '#34d399',
  },
  {
    id: 'instruments',
    nodes: ['F-16-instrGlass_4'],
    label: 'Instrument Panel',
    tagline: 'Multifunction displays & glass cockpit',
    category: 'avionics',
    overview:
      'Behind the instrument glass sit the multifunction displays (MFDs) and the up-front controls. The MFDs present radar, stores management, threat warning and engine/systems pages — the digital core of the pilot’s sensor and systems picture.',
    role:
      'MFD page management and cross-checking systems against the HUD is a continuous workload-management skill. Recognising caution/warning indications drives emergency-procedure decision making.',
    keyFacts: [
      'Multifunction displays integrate radar, stores, threats and systems',
      'Up-Front Controls (UFC) manage comms, navigation and weapon modes',
      'Caution / warning panel drives bold-face emergency procedures',
      'Reduces pilot workload by fusing many legacy gauges into selectable pages',
    ],
    specs: {
      Displays: 'Multifunction displays (MFDs)',
      Controls: 'Up-Front Controls (UFC)',
      Pages: 'Radar / SMS / TWS / ENG / FCR',
      Philosophy: 'Sensor fusion, reduced workload',
    },
    explode: [0, 0.25, 0.3],
    accent: '#2dd4bf',
  },
  {
    id: 'gear-down',
    nodes: ['F-16-landingOn_6'],
    label: 'Landing Gear — Deployed',
    tagline: 'Tricycle gear, extended configuration',
    category: 'landing-gear',
    overview:
      'The retractable tricycle landing gear shown in the extended (down-and-locked) state used for take-off, approach and landing. The single nose wheel retracts aft; the main gear retracts forward into the fuselage. Carbon brakes and anti-skid handle high-speed landing rollout.',
    role:
      'Gear configuration, down-and-locked indications, and gear-related emergencies (unsafe gear, hydraulic failure, alternate extension) are core procedural training items. Use the Gear toggle to compare configurations.',
    keyFacts: [
      'Tricycle layout: single steerable nose wheel + two main wheels',
      'Main gear retracts forward; nose gear retracts aft into the fuselage',
      'Carbon-disc brakes with anti-skid for short-field rollout',
      'Speed-limited — gear must be up before exceeding the gear-limit speed',
    ],
    specs: {
      Configuration: 'Retractable tricycle',
      State: 'Down & locked',
      Brakes: 'Carbon disc, anti-skid',
      'Nose wheel': 'Steerable',
    },
    explode: [0, -0.8, 0],
    accent: '#f59e0b',
  },
  {
    id: 'gear-up',
    nodes: ['F-16-landingOff_5'],
    label: 'Landing Gear — Retracted',
    tagline: 'Clean configuration, gear doors closed',
    category: 'landing-gear',
    overview:
      'The same landing gear modelled in the retracted (gear-up) state with doors faired into the fuselage. This is the clean cruise/combat configuration that minimises drag and radar/visual signature. The model carries both states — toggle between them to study the mechanism.',
    role:
      'Comparing the clean vs. dirty configuration teaches the drag and performance penalty of gear extension and reinforces the gear-limit-speed discipline.',
    keyFacts: [
      'Clean configuration — minimum drag for cruise and combat',
      'Gear doors fair flush with the fuselage when retracted',
      'Removing gear drag significantly improves acceleration and range',
      'Mutually exclusive with the deployed state — use the Gear toggle',
    ],
    specs: {
      State: 'Up & faired',
      Benefit: 'Minimum drag / signature',
      Doors: 'Flush-closed',
      Mode: 'Cruise / combat',
    },
    explode: [0, -0.4, 0],
    accent: '#fb923c',
  },
  {
    id: 'lights',
    nodes: ['F-16-landingOnLight_7'],
    label: 'Landing / Taxi Lights',
    tagline: 'Nose-gear mounted ground lighting',
    category: 'landing-gear',
    overview:
      'High-intensity landing and taxi lights mounted on the nose landing gear strut, illuminated only when the gear is extended. They provide forward illumination for night approach, landing and ground manoeuvring.',
    role:
      'Lighting state is part of the gear-down checklist and night-operations procedure. Their gear-linked logic reinforces how aircraft systems are interlocked for safety.',
    keyFacts: [
      'Mounted on the nose landing gear — only usable with gear down',
      'High-intensity beam for night approach and landing',
      'Separate taxi setting for ground manoeuvring',
      'Part of the standard before-landing / night checklist',
    ],
    specs: {
      Location: 'Nose gear strut',
      Interlock: 'Gear-down only',
      Modes: 'Landing / Taxi',
      Use: 'Night & low-visibility ops',
    },
    explode: [0, -0.6, 0.2],
    accent: '#fde047',
  },
  {
    id: 'rails',
    nodes: ['F-16-rails_8'],
    label: 'Weapon Station Rails',
    tagline: 'Wingtip & underwing launch rails',
    category: 'armament',
    overview:
      'The launch rails and pylons that mount air-to-air missiles and stores. The F-16 has nine hardpoints — wingtip rails (typically AIM-9 / AIM-120), underwing stations and a centreline station — managed through the Stores Management System.',
    role:
      'Stores configuration affects weight, drag, asymmetry and the flight envelope. Trainees learn loadout planning, stores jettison, and asymmetric-loading handling.',
    keyFacts: [
      'Nine hardpoints: 2 wingtip, 6 underwing, 1 centreline',
      'Wingtip rails typically carry AIM-9 Sidewinder / AIM-120 AMRAAM',
      'Managed via the Stores Management System (SMS) on the MFD',
      'Asymmetric or heavy loadouts restrict the manoeuvring envelope',
    ],
    specs: {
      Hardpoints: '9 total',
      'Wingtip rails': 'AIM-9 / AIM-120',
      Management: 'Stores Management System',
      Consideration: 'Asymmetry & envelope limits',
    },
    explode: [1.0, 0, 0],
    accent: '#ef4444',
  },
];

/** All GLB node names that belong to a real "part" (used for traversal). */
export const PART_NODE_NAMES = new Set(F16_PARTS.flatMap((p) => p.nodes));

/** Look up the owning part for a given GLB node name. */
export function partForNode(nodeName: string): F16Part | undefined {
  return F16_PARTS.find((p) => p.nodes.includes(nodeName));
}
