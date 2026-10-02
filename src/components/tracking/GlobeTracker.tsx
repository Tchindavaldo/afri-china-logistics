import { useEffect, useMemo, useRef, useState } from 'react';
import Globe, { type GlobeMethods } from 'react-globe.gl';
import * as THREE from 'three';
import { feature } from 'topojson-client';
import type { Feature, FeatureCollection, Geometry } from 'geojson';
import type { Topology } from 'topojson-specification';
import { getCountry, type Country } from '../../lib/countries';

interface GlobeTrackerProps {
  originCountry: string;
  destinationCountry: string;
  transportMode: string;
  progress: number;
}

type PathPoint = [number, number, number]; // lat, lng, altitude
type CountryFeature = Feature<Geometry, { name?: string }>;

// Couleurs de la charte (bleu/blanc) — vert réservé au point de départ.
const ACCENT = '#5C84FA';
const ACCENT_RGB = '92,132,250';
const ORIGIN_RGB = '74,222,128';

// ---------------------------------------------------------------------------
// Géométrie sphérique
// ---------------------------------------------------------------------------

function greatCircle(
  from: { lat: number; lng: number },
  to: { lat: number; lng: number },
  t: number
): [number, number] {
  const lat1 = (from.lat * Math.PI) / 180;
  const lng1 = (from.lng * Math.PI) / 180;
  const lat2 = (to.lat * Math.PI) / 180;
  const lng2 = (to.lng * Math.PI) / 180;
  const d =
    2 *
    Math.asin(
      Math.sqrt(
        Math.sin((lat2 - lat1) / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin((lng2 - lng1) / 2) ** 2
      )
    );
  if (d === 0) return [from.lat, from.lng];
  const A = Math.sin((1 - t) * d) / Math.sin(d);
  const B = Math.sin(t * d) / Math.sin(d);
  const x = A * Math.cos(lat1) * Math.cos(lng1) + B * Math.cos(lat2) * Math.cos(lng2);
  const y = A * Math.cos(lat1) * Math.sin(lng1) + B * Math.cos(lat2) * Math.sin(lng2);
  const z = A * Math.sin(lat1) + B * Math.sin(lat2);
  return [(Math.atan2(z, Math.sqrt(x * x + y * y)) * 180) / Math.PI, (Math.atan2(y, x) * 180) / Math.PI];
}

// ---------------------------------------------------------------------------
// Réseau maritime mondial : nœuds en pleine mer reliés par des couloirs de
// navigation réels (détroits, caps, océans). Un bateau ne traverse jamais la
// terre : il part du port côtier de son pays, suit les couloirs (plus court
// chemin par Dijkstra), puis rejoint le port du pays de destination.
// ---------------------------------------------------------------------------

const SEA_NODES: Record<string, [number, number]> = {
  TAIWAN_STRAIT: [24.0, 119.5], // Détroit de Taïwan
  HK_SEA: [18.0, 113.5], // Mer de Chine méridionale
  VIETNAM_S: [8.3, 109.8], // Large du sud Vietnam
  SINGAPORE: [1.1, 104.0], // Détroit de Singapour
  MALACCA_1: [2.4, 101.9], // Axe du détroit de Malacca (sud)
  MALACCA_2: [4.0, 99.6], // Axe du détroit (centre)
  MALACCA_N: [5.9, 97.2], // Sortie nord du détroit
  ANDAMAN: [7.0, 93.5], // Mer d'Andaman
  BAY_BENGAL: [5.5, 88.0],
  INDIAN_OCEAN: [-5.0, 72.0],
  ARABIAN_SEA: [12.0, 63.0],
  RED_SEA_S: [12.4, 44.5], // Bab-el-Mandeb
  SUEZ: [29.5, 32.5],
  MED_E: [33.0, 28.0],
  MED_C: [37.4, 11.0], // Canal de Sicile
  GIBRALTAR: [35.9, -6.2],
  ATL_PORTUGAL: [38.5, -10.5],
  BISCAY: [46.0, -6.5],
  CHANNEL: [50.0, -1.0], // Manche
  NORTH_SEA: [52.5, 2.8],
  EAST_AFRICA: [-6.0, 45.0], // Bassin de Somalie : accès Mombasa / Dar es Salaam
  MADAGASCAR_E: [-15.0, 52.5], // Est de Madagascar
  MADAGASCAR_S: [-27.5, 45.5], // Sud de Madagascar
  DURBAN: [-31.5, 32.5], // Large de Durban
  AGULHAS_E: [-35.5, 25.5], // Large de Port Elizabeth
  CAPE: [-36.0, 19.0], // Cap de Bonne-Espérance
  ATL_SW_AFRICA: [-20.0, 7.0],
  GULF_GUINEA: [2.0, 3.0],
  W_AFRICA: [3.8, -9.5], // Large du Liberia
  DAKAR: [14.3, -18.2],
  CANARIES: [27.5, -15.5],
  ATL_MID: [3.0, -26.0], // Atlantique équatorial
  BRAZIL_NE: [-6.5, -33.5],
  CARIBBEAN: [15.5, -68.0],
  US_EAST: [36.0, -73.0],
  CAN_EAST: [44.0, -61.0],
  ATL_N: [45.0, -35.0], // Atlantique Nord
};

const SEA_EDGES: [string, string][] = [
  // Asie de l'Est -> détroit de Malacca (axe du chenal, sans couper
  // la péninsule malaise ni Sumatra)
  ['TAIWAN_STRAIT', 'HK_SEA'],
  ['HK_SEA', 'VIETNAM_S'],
  ['VIETNAM_S', 'SINGAPORE'],
  ['SINGAPORE', 'MALACCA_1'],
  ['MALACCA_1', 'MALACCA_2'],
  ['MALACCA_2', 'MALACCA_N'],
  ['MALACCA_N', 'ANDAMAN'],
  ['ANDAMAN', 'BAY_BENGAL'],
  ['BAY_BENGAL', 'INDIAN_OCEAN'],
  // Océan Indien -> Suez / Méditerranée
  ['INDIAN_OCEAN', 'ARABIAN_SEA'],
  ['ARABIAN_SEA', 'RED_SEA_S'],
  ['RED_SEA_S', 'SUEZ'],
  ['SUEZ', 'MED_E'],
  ['MED_E', 'MED_C'],
  ['MED_C', 'GIBRALTAR'],
  ['GIBRALTAR', 'ATL_PORTUGAL'],
  ['ATL_PORTUGAL', 'BISCAY'],
  ['BISCAY', 'CHANNEL'],
  ['CHANNEL', 'NORTH_SEA'],
  // Océan Indien -> Afrique de l'Est (au nord de Madagascar)
  ['INDIAN_OCEAN', 'EAST_AFRICA'],
  ['ARABIAN_SEA', 'EAST_AFRICA'],
  ['EAST_AFRICA', 'MADAGASCAR_E'],
  // Océan Indien -> Le Cap (contournement de Madagascar par l'est puis le sud)
  ['INDIAN_OCEAN', 'MADAGASCAR_E'],
  ['MADAGASCAR_E', 'MADAGASCAR_S'],
  ['MADAGASCAR_S', 'DURBAN'],
  ['DURBAN', 'AGULHAS_E'],
  ['AGULHAS_E', 'CAPE'],
  // Le Cap -> Afrique de l'Ouest -> Europe
  ['CAPE', 'ATL_SW_AFRICA'],
  ['ATL_SW_AFRICA', 'GULF_GUINEA'],
  ['GULF_GUINEA', 'W_AFRICA'],
  ['W_AFRICA', 'DAKAR'],
  ['DAKAR', 'CANARIES'],
  ['CANARIES', 'GIBRALTAR'],
  ['CANARIES', 'ATL_PORTUGAL'],
  // Atlantique / Amériques
  ['W_AFRICA', 'ATL_MID'],
  ['DAKAR', 'ATL_MID'],
  ['ATL_MID', 'BRAZIL_NE'],
  ['BRAZIL_NE', 'CARIBBEAN'],
  ['CARIBBEAN', 'US_EAST'],
  ['US_EAST', 'CAN_EAST'],
  ['BISCAY', 'ATL_N'],
  ['ATL_N', 'CAN_EAST'],
  ['ATL_N', 'US_EAST'],
];

// Port côtier + nœud(s) d'entrée dans le réseau, par pays (ISO-2).
// Plusieurs portes possibles : Dijkstra choisit la meilleure selon la destination.
// `inland` : pays enclavé — le navire s'arrête au port et le conteneur poursuit
// par voie terrestre (rail/camion) jusqu'à ce hub intérieur, comme dans la réalité.
const COUNTRY_SEA: Record<string, { port: [number, number]; nodes: string[]; inland?: [number, number] }> = {
  CN: { port: [31.1, 121.9], nodes: ['TAIWAN_STRAIT'] }, // Shanghai (embouchure du Yangtsé)
  HK: { port: [22.25, 114.2], nodes: ['HK_SEA'] },
  JP: { port: [35.2, 139.8], nodes: ['HK_SEA'] }, // Baie de Tokyo (route Pacifique sud de Taïwan)
  KR: { port: [35.0, 129.05], nodes: ['TAIWAN_STRAIT'] }, // Busan
  VN: { port: [10.3, 107.05], nodes: ['VIETNAM_S'] }, // Hô Chi Minh (Vung Tau)
  TH: { port: [13.05, 100.9], nodes: ['SINGAPORE'] }, // Laem Chabang
  MY: { port: [2.95, 101.25], nodes: ['MALACCA_1'] }, // Port Klang
  IN: { port: [18.9, 72.8], nodes: ['ARABIAN_SEA', 'INDIAN_OCEAN'] }, // Mumbai
  AE: { port: [25.4, 56.6], nodes: ['ARABIAN_SEA'] }, // Fujairah (hors Golfe)
  TR: { port: [36.2, 30.5], nodes: ['MED_E'] }, // Antalya
  CM: { port: [3.95, 9.55], nodes: ['GULF_GUINEA'] }, // Douala (estuaire du Wouri)
  NG: { port: [6.4, 3.4], nodes: ['GULF_GUINEA'] }, // Lagos
  CI: { port: [5.1, -4.1], nodes: ['W_AFRICA', 'GULF_GUINEA'] }, // Abidjan
  SN: { port: [14.6, -17.6], nodes: ['DAKAR'] },
  GA: { port: [0.2, 9.2], nodes: ['GULF_GUINEA'] }, // Libreville
  GQ: { port: [1.85, 9.6], nodes: ['GULF_GUINEA'] }, // Bata
  CG: { port: [-4.9, 11.7], nodes: ['GULF_GUINEA'] }, // Pointe-Noire
  CD: { port: [-6.0, 12.3], nodes: ['GULF_GUINEA'] }, // Matadi/Banana
  AO: { port: [-8.75, 13.15], nodes: ['GULF_GUINEA', 'ATL_SW_AFRICA'] }, // Luanda
  BJ: { port: [6.2, 2.4], nodes: ['GULF_GUINEA'] }, // Cotonou
  TG: { port: [6.0, 1.3], nodes: ['GULF_GUINEA'] }, // Lomé
  GH: { port: [5.5, 0.0], nodes: ['GULF_GUINEA', 'W_AFRICA'] }, // Tema
  GN: { port: [9.4, -13.9], nodes: ['DAKAR', 'W_AFRICA'] }, // Conakry
  SL: { port: [8.45, -13.3], nodes: ['W_AFRICA', 'DAKAR'] }, // Freetown
  LR: { port: [6.3, -10.85], nodes: ['W_AFRICA'] }, // Monrovia
  MR: { port: [18.0, -16.2], nodes: ['DAKAR', 'CANARIES'] }, // Nouakchott
  MA: { port: [33.7, -7.8], nodes: ['CANARIES', 'GIBRALTAR'] }, // Casablanca
  DZ: { port: [37.0, 3.2], nodes: ['MED_C'] }, // Alger
  TN: { port: [37.2, 10.4], nodes: ['MED_C'] }, // Tunis
  EG: { port: [31.4, 29.8], nodes: ['MED_E'] }, // Alexandrie
  DJ: { port: [11.6, 43.15], nodes: ['RED_SEA_S'] }, // Djibouti
  KE: { port: [-4.2, 39.9], nodes: ['EAST_AFRICA'] }, // Mombasa
  TZ: { port: [-6.82, 39.35], nodes: ['EAST_AFRICA'] }, // Dar es Salaam
  MZ: { port: [-25.95, 32.65], nodes: ['DURBAN', 'MADAGASCAR_S'] }, // Maputo
  MG: { port: [-18.15, 49.45], nodes: ['MADAGASCAR_E'] }, // Toamasina
  ZA: { port: [-34.1, 18.3], nodes: ['CAPE'] }, // Le Cap
  // Enclavés : port d'arrivée puis corridor terrestre
  UG: { port: [-4.2, 39.9], nodes: ['EAST_AFRICA'], inland: [0.35, 32.58] }, // Mombasa -> Kampala (Corridor Nord)
  RW: { port: [-6.82, 39.35], nodes: ['EAST_AFRICA'], inland: [-1.95, 30.06] }, // Dar es Salaam -> Kigali (Corridor central)
  ET: { port: [11.6, 43.15], nodes: ['RED_SEA_S'], inland: [9.03, 38.74] }, // Djibouti -> Addis-Abeba
  BF: { port: [5.5, 0.0], nodes: ['GULF_GUINEA', 'W_AFRICA'], inland: [12.37, -1.53] }, // Tema -> Ouagadougou
  ML: { port: [14.6, -17.6], nodes: ['DAKAR'], inland: [12.65, -8.0] }, // Dakar -> Bamako
  NE: { port: [6.2, 2.4], nodes: ['GULF_GUINEA'], inland: [13.51, 2.11] }, // Cotonou -> Niamey
  TD: { port: [3.6, 9.3], nodes: ['GULF_GUINEA'], inland: [12.11, 15.05] }, // Douala -> N'Djaména
  CF: { port: [3.6, 9.3], nodes: ['GULF_GUINEA'], inland: [4.39, 18.56] }, // Douala -> Bangui
  FR: { port: [49.6, -0.6], nodes: ['CHANNEL'] }, // Le Havre
  BE: { port: [51.4, 3.0], nodes: ['NORTH_SEA'] }, // Anvers
  NL: { port: [52.1, 3.9], nodes: ['NORTH_SEA'] }, // Rotterdam
  DE: { port: [54.2, 7.8], nodes: ['NORTH_SEA'] }, // Hambourg
  IT: { port: [40.6, 13.5], nodes: ['MED_C'] }, // Naples
  ES: { port: [36.0, -5.6], nodes: ['GIBRALTAR'] }, // Algésiras
  GB: { port: [50.5, -1.3], nodes: ['CHANNEL'] }, // Southampton
  US: { port: [36.8, -75.5], nodes: ['US_EAST'] }, // Norfolk
  CA: { port: [44.5, -63.3], nodes: ['CAN_EAST'] }, // Halifax
  BR: { port: [-8.2, -34.6], nodes: ['BRAZIL_NE', 'ATL_MID'] }, // Recife
};

function haversineDeg(a: [number, number], b: [number, number]): number {
  const [lat1, lng1] = a.map((v) => (v * Math.PI) / 180);
  const [lat2, lng2] = b.map((v) => (v * Math.PI) / 180);
  return (
    2 *
    Math.asin(
      Math.sqrt(Math.sin((lat2 - lat1) / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin((lng2 - lng1) / 2) ** 2)
    )
  );
}

// Plus court chemin port -> port dans le réseau maritime (Dijkstra).
// Les ports sont insérés comme nœuds temporaires reliés à leurs portes d'entrée.
function seaGraphPath(
  fromPort: [number, number],
  fromNodes: string[],
  toPort: [number, number],
  toNodes: string[]
): [number, number][] {
  const coords: Record<string, [number, number]> = { ...SEA_NODES, __SRC__: fromPort, __DST__: toPort };
  const adj: Record<string, string[]> = {};
  const link = (a: string, b: string) => {
    (adj[a] = adj[a] || []).push(b);
    (adj[b] = adj[b] || []).push(a);
  };
  for (const [a, b] of SEA_EDGES) link(a, b);
  for (const n of fromNodes) link('__SRC__', n);
  for (const n of toNodes) link('__DST__', n);

  const dist: Record<string, number> = { __SRC__: 0 };
  const prev: Record<string, string> = {};
  const visited = new Set<string>();
  while (true) {
    let cur = '';
    let best = Infinity;
    for (const n of Object.keys(dist)) {
      if (!visited.has(n) && dist[n] < best) {
        best = dist[n];
        cur = n;
      }
    }
    if (!cur || cur === '__DST__') break;
    visited.add(cur);
    for (const nb of adj[cur] || []) {
      const d = dist[cur] + haversineDeg(coords[cur], coords[nb]);
      if (d < (dist[nb] ?? Infinity)) {
        dist[nb] = d;
        prev[nb] = cur;
      }
    }
  }
  if (!('__DST__' in dist)) return [fromPort, toPort];
  const nodes: string[] = ['__DST__'];
  while (nodes[0] !== '__SRC__') nodes.unshift(prev[nodes[0]]);
  return nodes.map((n) => coords[n]);
}

// Interpole chaque segment par grand cercle => polyligne parfaitement lisse
function smoothRoute(points: [number, number][], perSegment = 14): [number, number][] {
  const out: [number, number][] = [];
  for (let i = 0; i < points.length - 1; i++) {
    const a = { lat: points[i][0], lng: points[i][1] };
    const b = { lat: points[i + 1][0], lng: points[i + 1][1] };
    for (let j = 0; j < perSegment; j++) out.push(greatCircle(a, b, j / perSegment));
  }
  out.push(points[points.length - 1]);
  return out;
}

const SEA_ALT = 0.006;
const LAND_ALT = 0.008; // légèrement au-dessus du relief pour rester visible
const AIR_ALT_BASE = 0.015;
const AIR_ALT_CRUISE = 0.16;

// `landStart` : fraction du trajet (0..1) à partir de laquelle on roule au lieu
// de naviguer. 1 = pas de tronçon terrestre.
interface Route {
  path: PathPoint[];
  landStart: number;
}

function buildRoute(from: Country, to: Country, isAir: boolean): Route {
  if (isAir) {
    // Arc de grand cercle avec profil de vol : décollage, croisière, descente
    const n = 110;
    const pts: PathPoint[] = [];
    for (let i = 0; i <= n; i++) {
      const s = i / n;
      const [lat, lng] = greatCircle(from, to, s);
      const alt = AIR_ALT_BASE + AIR_ALT_CRUISE * Math.sin(Math.PI * s) ** 0.8;
      pts.push([lat, lng, alt]);
    }
    return { path: pts, landStart: 1 };
  }
  // Maritime : port de départ -> couloirs de navigation -> port d'arrivée.
  // Le bateau ne passe jamais par le centre des pays (terres).
  const fromSea = COUNTRY_SEA[from.code];
  const toSea = COUNTRY_SEA[to.code];
  let waypoints: [number, number][];
  if (fromSea && toSea) {
    waypoints = seaGraphPath(fromSea.port, fromSea.nodes, toSea.port, toSea.nodes);
    // Dédoublonne les points consécutifs quasi identiques
    waypoints = waypoints.filter((p, i) => i === 0 || haversineDeg(p, waypoints[i - 1]) > 0.005);
  } else {
    waypoints = [
      [from.lat, from.lng],
      [to.lat, to.lng],
    ];
  }
  const perSegment = waypoints.length <= 2 ? 80 : 14;
  const sea: PathPoint[] = smoothRoute(waypoints, perSegment).map(([lat, lng]) => [lat, lng, SEA_ALT]);

  // Destination enclavée : rupture de charge au port, puis tronçon terrestre.
  const inland = toSea?.inland;
  if (!inland) return { path: sea, landStart: 1 };

  const land: PathPoint[] = smoothRoute([toSea.port, inland], 30)
    .slice(1) // le port est déjà le dernier point maritime
    .map(([lat, lng]) => [lat, lng, LAND_ALT]);
  const path = [...sea, ...land];
  return { path, landStart: (sea.length - 1) / (path.length - 1) };
}

function positionAlong(path: PathPoint[], t: number): PathPoint {
  if (path.length < 2) return path[0] ?? [0, 0, 0];
  const idx = Math.max(0, Math.min(1, t)) * (path.length - 1);
  const i = Math.min(path.length - 2, Math.floor(idx));
  const f = idx - i;
  const a = path[i];
  const b = path[i + 1];
  return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f];
}

// ---------------------------------------------------------------------------
// Modèles 3D — construits à la main, nez/proue orientés vers +Z
// ---------------------------------------------------------------------------

const MAT = {
  white: () => new THREE.MeshPhongMaterial({ color: 0xf4f7fd, shininess: 60 }),
  navy: () => new THREE.MeshPhongMaterial({ color: 0x0a1b4d, shininess: 30 }),
  steel: () => new THREE.MeshPhongMaterial({ color: 0x2c3f73, shininess: 30 }),
  accent: () => new THREE.MeshPhongMaterial({ color: 0x1747e6, emissive: 0x0b2066, shininess: 80 }),
  red: () => new THREE.MeshPhongMaterial({ color: 0xd64545, shininess: 40 }),
};

function buildPlane(): THREE.Group {
  const g = new THREE.Group();

  // Fuselage élancé, entièrement blanc (le nez fait partie de la capsule)
  const fuselage = new THREE.Mesh(new THREE.CapsuleGeometry(0.32, 3.8, 6, 16), MAT.white());
  fuselage.rotation.x = Math.PI / 2;
  g.add(fuselage);

  // Pare-brise du cockpit : fine visière sombre sur le dessus du nez
  const windshield = new THREE.Mesh(new THREE.SphereGeometry(0.26, 12, 8), MAT.navy());
  windshield.position.set(0, 0.13, 1.78);
  windshield.scale.set(0.9, 0.55, 0.9);
  g.add(windshield);

  // Ailes en flèche : trapèzes fins et allongés, blancs comme le fuselage
  const wingShape = new THREE.Shape();
  wingShape.moveTo(0, 0.7);
  wingShape.lineTo(2.7, -0.55);
  wingShape.lineTo(2.7, -0.9);
  wingShape.lineTo(0, -0.6);
  wingShape.closePath();
  const wingGeo = new THREE.ExtrudeGeometry(wingShape, { depth: 0.06, bevelEnabled: false });
  wingGeo.rotateX(Math.PI / 2);
  const wingL = new THREE.Mesh(wingGeo, MAT.white());
  wingL.scale.x = -1;
  wingL.position.set(-0.25, -0.08, 0.15);
  g.add(wingL);
  const wingR = new THREE.Mesh(wingGeo, MAT.white());
  wingR.position.set(0.25, -0.08, 0.15);
  g.add(wingR);

  // Réacteurs suspendus sous les ailes
  const engGeo = new THREE.CylinderGeometry(0.15, 0.18, 0.65, 10);
  engGeo.rotateX(Math.PI / 2);
  const engL = new THREE.Mesh(engGeo, MAT.steel());
  engL.position.set(-1.0, -0.28, 0.45);
  g.add(engL);
  const engR = engL.clone();
  engR.position.x = 1.0;
  g.add(engR);

  // Empennage horizontal (mêmes trapèzes, réduits)
  const tailL = new THREE.Mesh(wingGeo, MAT.white());
  tailL.scale.set(-0.38, 1, 0.38);
  tailL.position.set(-0.08, 0.1, -1.8);
  g.add(tailL);
  const tailR = new THREE.Mesh(wingGeo, MAT.white());
  tailR.scale.set(0.38, 1, 0.38);
  tailR.position.set(0.08, 0.1, -1.8);
  g.add(tailR);

  // Dérive verticale haute aux couleurs de la compagnie
  const finShape = new THREE.Shape();
  finShape.moveTo(0.35, 0);
  finShape.lineTo(-0.85, 0);
  finShape.lineTo(-1.35, 1.25);
  finShape.lineTo(-0.95, 1.25);
  finShape.closePath();
  const finGeo = new THREE.ExtrudeGeometry(finShape, { depth: 0.07, bevelEnabled: false });
  const fin = new THREE.Mesh(finGeo, MAT.accent());
  fin.rotation.y = -Math.PI / 2;
  fin.position.set(0.035, 0.2, -1.05);
  g.add(fin);

  g.scale.setScalar(2.6);
  return g;
}

function buildShip(): THREE.Group {
  const g = new THREE.Group();

  // Coque : boîte effilée vers la proue via une géométrie extrudée
  const hullShape = new THREE.Shape();
  hullShape.moveTo(-2.6, -0.75);
  hullShape.lineTo(1.8, -0.75);
  hullShape.lineTo(3.1, 0);
  hullShape.lineTo(1.8, 0.75);
  hullShape.lineTo(-2.6, 0.75);
  hullShape.closePath();
  const hullGeo = new THREE.ExtrudeGeometry(hullShape, { depth: 0.75, bevelEnabled: false });
  hullGeo.rotateX(Math.PI / 2);
  hullGeo.rotateY(Math.PI / 2);
  const hull = new THREE.Mesh(hullGeo, MAT.navy());
  hull.position.y = 0.75;
  g.add(hull);

  // Ligne de flottaison rouge
  const keel = new THREE.Mesh(new THREE.BoxGeometry(1.45, 0.16, 5.1), MAT.red());
  keel.position.set(0, 0.02, -0.3);
  g.add(keel);

  // Piles de conteneurs
  const colors = [MAT.accent(), MAT.white(), MAT.steel(), MAT.accent()];
  let ci = 0;
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 2; col++) {
      const stack = 1 + ((row + col) % 2);
      for (let lvl = 0; lvl < stack; lvl++) {
        const box = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.34, 0.95), colors[ci++ % colors.length]);
        box.position.set(-0.36 + col * 0.72, 0.95 + lvl * 0.36, 1.15 - row * 1.05);
        g.add(box);
      }
    }
  }

  // Château (passerelle) à l'arrière
  const bridge = new THREE.Mesh(new THREE.BoxGeometry(1.3, 1.15, 0.8), MAT.white());
  bridge.position.set(0, 1.35, -2.05);
  g.add(bridge);
  const windows = new THREE.Mesh(new THREE.BoxGeometry(1.32, 0.18, 0.7), MAT.navy());
  windows.position.set(0, 1.75, -2.05);
  g.add(windows);
  const funnel = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.18, 0.5, 8), MAT.accent());
  funnel.position.set(0, 2.1, -2.3);
  g.add(funnel);

  g.scale.setScalar(2.1);
  return g;
}

// Camion porte-conteneur : dernier tronçon terrestre vers les pays enclavés.
function buildTruck(): THREE.Group {
  const g = new THREE.Group();

  const cab = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.85, 1.1), MAT.white());
  cab.position.set(0, 0.85, 1.55);
  g.add(cab);
  const windshield = new THREE.Mesh(new THREE.BoxGeometry(0.92, 0.34, 0.06), MAT.navy());
  windshield.position.set(0, 1.05, 2.11);
  g.add(windshield);

  const chassis = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.22, 3.6), MAT.steel());
  chassis.position.set(0, 0.5, 0.1);
  g.add(chassis);

  const container = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.9, 2.5), MAT.accent());
  container.position.set(0, 1.05, -0.45);
  g.add(container);

  const wheelGeo = new THREE.CylinderGeometry(0.28, 0.28, 0.18, 12);
  wheelGeo.rotateZ(Math.PI / 2);
  for (const z of [1.5, -0.6, -1.25]) {
    for (const x of [-0.52, 0.52]) {
      const wheel = new THREE.Mesh(wheelGeo, MAT.navy());
      wheel.position.set(x, 0.28, z);
      g.add(wheel);
    }
  }

  g.scale.setScalar(1.9);
  return g;
}

// ---------------------------------------------------------------------------
// Composant
// ---------------------------------------------------------------------------

const EASE_MS = 3200; // durée de l'animation d'entrée du véhicule

// Textures servies depuis `public/` : un CDN peut mettre plus d'une minute à
// répondre, laissant le globe noir alors que la page semble prête.
const EARTH_TEXTURE = '/globe/earth-blue-marble.jpg';
const EARTH_BUMP = '/globe/earth-topology.png';

function matchCountry(feat: CountryFeature, country: Country) {
  const name = feat.properties?.name ?? '';
  return country.mapNames.includes(name);
}

export default function GlobeTracker({ originCountry, destinationCountry, transportMode, progress }: GlobeTrackerProps) {
  const globeRef = useRef<GlobeMethods | undefined>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);
  const [countries, setCountries] = useState<CountryFeature[]>([]);
  const [size, setSize] = useState({ width: 1050, height: 735 });
  const [globeReady, setGlobeReady] = useState(false);
  // La texture de la Terre pèse ~1,4 Mo : tant qu'elle n'est pas décodée, le
  // globe est rendu noir. On la précharge pour garder le loader affiché.
  const [textureReady, setTextureReady] = useState(false);
  // Découpe parcouru/restant, mise à jour à ~8 Hz pour ne pas reconstruire
  // les tubes de trajectoire à 60 fps
  const [displayT, setDisplayT] = useState(0);

  const isAir = transportMode === 'air';
  const from = useMemo(() => getCountry(originCountry), [originCountry]);
  const to = useMemo(() => getCountry(destinationCountry), [destinationCountry]);
  const targetT = Math.max(0, Math.min(1, progress / 100));

  // --- Responsive ---
  useEffect(() => {
    const update = () => {
      const w = containerRef.current?.clientWidth || window.innerWidth;
      const width = Math.min(1050, w);
      // Sur écran étroit, un cadre en 0.7 est trop plat : format portrait
      // borné par la hauteur de la fenêtre.
      const ratio = width < 640 ? 1.3 : 0.7;
      const height = Math.round(Math.min(width * ratio, Math.max(380, window.innerHeight * 0.75)));
      setSize({ width, height });
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  // --- Frontières des pays (topojson -> geojson), servies en local ---
  useEffect(() => {
    let cancelled = false;
    const load = (url: string) =>
      fetch(url)
        .then((r) => r.json())
        .then((topology: Topology) => {
          const fc = feature(topology, topology.objects.countries) as FeatureCollection<Geometry, { name?: string }>;
          if (!cancelled) setCountries(fc.features);
        });

    load('/globe/countries-110m.json')
      .catch(() => load('https://unpkg.com/world-atlas@2/countries-110m.json'))
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  // --- Préchargement de la texture de la Terre ---
  useEffect(() => {
    const img = new Image();
    img.src = EARTH_TEXTURE;
    const done = () => setTextureReady(true);
    if (img.complete) {
      done();
      return;
    }
    img.addEventListener('load', done);
    // En cas d'échec on affiche quand même le globe plutôt que de bloquer le loader.
    img.addEventListener('error', done);
    return () => {
      img.removeEventListener('load', done);
      img.removeEventListener('error', done);
    };
  }, []);

  const { path, landStart } = useMemo(
    () => (from && to ? buildRoute(from, to, isAir) : { path: [] as PathPoint[], landStart: 1 }),
    [from, to, isAir]
  );

  // --- Véhicule 3D : ajout à la scène + boucle d'animation ---
  useEffect(() => {
    const globe = globeRef.current;
    if (!globe || !globeReady || !path.length) return;

    const vehicle = isAir ? buildPlane() : buildShip();
    globe.scene().add(vehicle);

    // Destination enclavée : un camion prend le relais après le port.
    const hasLand = landStart < 1;
    const truck = hasLand ? buildTruck() : null;
    if (truck) {
      truck.visible = false;
      globe.scene().add(truck);
    }

    const start = performance.now();
    let raf = 0;
    let lastSplit = 0;
    const curV = new THREE.Vector3();
    const nextV = new THREE.Vector3();

    const place = (obj: THREE.Group, u: number, bob: number) => {
      const [lat, lng, alt0] = positionAlong(path, u);
      const cur = globe.getCoords(lat, lng, alt0 + bob);
      curV.set(cur.x, cur.y, cur.z);
      const [nlat, nlng, nalt] = positionAlong(path, Math.min(1, u + 0.008));
      const next = globe.getCoords(nlat, nlng, nalt);
      nextV.set(next.x, next.y, next.z);
      obj.position.copy(curV);
      if (curV.distanceToSquared(nextV) > 1e-6) {
        // « haut » = normale à la sphère, +Z du modèle vers la direction du trajet
        obj.up.copy(curV).normalize();
        obj.lookAt(nextV);
      }
    };

    const frame = (now: number) => {
      const p = Math.min(1, (now - start) / EASE_MS);
      const eased = 1 - Math.pow(1 - p, 3); // ease-out cubic
      const t = eased * targetT;

      // Après le port, c'est le camion qui roule et le navire reste amarré.
      const onLand = hasLand && t > landStart;
      const active = onLand && truck ? truck : vehicle;
      if (truck) truck.visible = onLand;

      // Tangage léger du navire sur l'eau ; avion et camion restent stables
      const bob = isAir || onLand ? 0 : Math.sin(now / 650) * 0.0012;
      place(active, t, bob);
      if (onLand) place(vehicle, landStart, 0); // navire à quai
      if (!isAir && !onLand) vehicle.rotation.z += Math.sin(now / 900) * 0.04; // roulis

      if (now - lastSplit > 125) {
        lastSplit = now;
        setDisplayT(t);
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      for (const obj of [vehicle, truck]) {
        if (!obj) continue;
        globe.scene().remove(obj);
        obj.traverse((o) => {
          if (o instanceof THREE.Mesh) {
            o.geometry.dispose();
            (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => m.dispose());
          }
        });
      }
    };
  }, [globeReady, path, targetT, isAir, landStart]);

  // --- Caméra : cadrage initial sur le milieu du trajet ---
  useEffect(() => {
    const globe = globeRef.current;
    if (!globe || !globeReady || !from || !to) return;
    const controls = globe.controls();
    if (controls) {
      controls.autoRotate = true;
      controls.autoRotateSpeed = 0.25;
      controls.enableDamping = true;
      controls.dampingFactor = 0.08;
      controls.minDistance = 140;
    }
    const [midLat, midLng] = greatCircle(from, to, 0.5);
    const altitude = size.width < 640 ? 1.75 : 2.1;
    globe.pointOfView({ lat: midLat, lng: midLng, altitude }, 1800);
  }, [globeReady, from, to, size.width]);

  // --- Trajectoires parcourue / restante ---
  const { traveled, remaining } = useMemo(() => {
    if (!path.length) return { traveled: [] as PathPoint[], remaining: [] as PathPoint[] };
    const head = positionAlong(path, displayT);
    const cut = Math.min(path.length - 2, Math.floor(displayT * (path.length - 1)));
    return {
      traveled: [...path.slice(0, cut + 1), head],
      remaining: [head, ...path.slice(cut + 1)],
    };
  }, [path, displayT]);

  if (!from || !to) {
    return (
      <div className="mt-6 rounded-xl border border-amber-300 bg-amber-50 p-6 text-amber-800">
        ⚠️ Pays d'origine ou de destination non défini pour ce colis. Veuillez les renseigner dans l'admin.
      </div>
    );
  }

  const isLoading = !textureReady || countries.length === 0;
  const pct = Math.round(displayT * 100);

  return (
    <div
      ref={containerRef}
      className="relative mt-6 flex w-full justify-center overflow-hidden rounded-2xl border border-cobalt-700/40 shadow-2xl"
      style={{ background: 'radial-gradient(ellipse at 50% 35%, #1a2d6e 0%, #0A1B4D 62%, #06102f 100%)' }}
    >
      {isLoading && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-cobalt-900/95 backdrop-blur-sm">
          <svg className="mb-3 size-12 animate-spin text-cobalt-400" fill="none" viewBox="0 0 24 24" aria-hidden="true">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="text-sm font-medium text-cobalt-50">Chargement du suivi…</p>
          <p className="mt-1 text-xs text-cobalt-200/80">Initialisation de la vue satellite</p>
        </div>
      )}

      {/* HUD : itinéraire + progression */}
      <div className="pointer-events-none absolute top-2 left-2 z-10 max-w-[calc(100%-1rem)] rounded-xl border border-white/10 bg-cobalt-900/70 px-2.5 py-2 text-xs text-cobalt-50 backdrop-blur-md select-none sm:top-4 sm:left-4 sm:px-4 sm:py-3">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-semibold text-white sm:text-sm">
          <span className="size-2 shrink-0 rounded-full bg-green-400 shadow-[0_0_6px_#4ade80]" />
          {from.name}
          <span className="text-cobalt-300">{isAir ? '✈' : '⚓'}</span>
          <span className="size-2 shrink-0 rounded-full bg-cobalt-400 shadow-[0_0_6px_#5C84FA]" />
          {to.name}
        </div>
        <div className="mt-1.5 flex items-center gap-2 text-cobalt-100 sm:mt-2">
          <span className="text-[10px] tracking-wider uppercase">{isAir ? 'Fret aérien' : 'Fret maritime'}</span>
          <span className="text-sm font-bold text-cobalt-300">{pct}%</span>
        </div>
      </div>

      {/* Barre de progression intégrée en bas du cadre */}
      <div className="absolute right-0 bottom-0 left-0 z-10 h-1.5 bg-white/10">
        <div
          className="h-full rounded-r-full bg-gradient-to-r from-green-400 via-cobalt-400 to-white shadow-[0_0_10px_rgba(92,132,250,0.9)] transition-[width] duration-200"
          style={{ width: `${pct}%` }}
        />
      </div>

      <Globe
        ref={globeRef}
        width={size.width}
        height={size.height}
        backgroundColor="rgba(0,0,0,0)"
        globeImageUrl={EARTH_TEXTURE}
        bumpImageUrl={EARTH_BUMP}
        atmosphereColor={ACCENT}
        atmosphereAltitude={0.16}
        onGlobeReady={() => setGlobeReady(true)}
        /* Pays */
        polygonsData={countries}
        polygonAltitude={(d) => (matchCountry(d as CountryFeature, from) || matchCountry(d as CountryFeature, to) ? 0.016 : 0.003)}
        polygonCapColor={(d) => {
          if (matchCountry(d as CountryFeature, from)) return `rgba(${ORIGIN_RGB},0.85)`;
          if (matchCountry(d as CountryFeature, to)) return `rgba(${ACCENT_RGB},0.85)`;
          return 'rgba(255,255,255,0.05)';
        }}
        polygonSideColor={() => 'rgba(255,255,255,0.06)'}
        polygonStrokeColor={() => 'rgba(6,16,47,0.85)'}
        polygonLabel={(d) =>
          `<div style="background:rgba(10,27,77,0.92);color:#fff;padding:4px 10px;border-radius:6px;font-size:12px;border:1px solid rgba(92,132,250,0.45)">${
            (d as CountryFeature).properties?.name ?? ''
          }</div>`
        }
        /* Trajectoire : parcourue (pleine, lumineuse) / restante (pointillés) */
        pathsData={[
          { pts: traveled, kind: 'traveled' },
          { pts: remaining, kind: 'remaining' },
        ]}
        pathPoints={(d) => (d as { pts: PathPoint[] }).pts}
        pathPointLat={(p) => (p as PathPoint)[0]}
        pathPointLng={(p) => (p as PathPoint)[1]}
        pathPointAlt={(p) => (p as PathPoint)[2]}
        pathColor={(d: object) =>
          (d as { kind: string }).kind === 'traveled'
            ? [`rgba(${ORIGIN_RGB},0.95)`, `rgba(${ACCENT_RGB},1)`]
            : ['rgba(200,214,240,0.5)', 'rgba(200,214,240,0.18)']
        }
        pathStroke={(d) => ((d as { kind: string }).kind === 'traveled' ? 3.2 : 1.6)}
        pathDashLength={(d) => ((d as { kind: string }).kind === 'traveled' ? 1 : 0.006)}
        pathDashGap={(d) => ((d as { kind: string }).kind === 'traveled' ? 0 : 0.004)}
        pathDashAnimateTime={(d) => ((d as { kind: string }).kind === 'remaining' && isAir ? 14000 : 0)}
        pathTransitionDuration={0}
        /* Anneaux radar pulsants au départ et à l'arrivée */
        ringsData={[
          { lat: from.lat, lng: from.lng, color: ORIGIN_RGB },
          { lat: to.lat, lng: to.lng, color: ACCENT_RGB },
        ]}
        ringColor={(d: object) => (rt: number) => `rgba(${(d as { color: string }).color},${Math.max(0, 1 - rt)})`}
        ringMaxRadius={4.5}
        ringPropagationSpeed={2.2}
        ringRepeatPeriod={900}
        ringAltitude={0.012}
      />
    </div>
  );
}
