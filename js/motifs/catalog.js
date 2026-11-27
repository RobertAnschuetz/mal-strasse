// Bildmotive im 200×200-Raster. Themen: Autos, Schilder, Kuscheltiere – plus Alltagsdinge.
import { circle, ellipse, rect, poly, ngon, star, R, S, L } from './shapes.js';

const m = (id, label, regions, lines = []) => ({ id, label, regions, lines });
const startOf = (d) => { const [, x, y] = d.match(/^M\s*(-?[\d.]+)\s+(-?[\d.]+)/); return [Number(x), Number(y)]; };
/** Muster: nur Linien zum Nachspuren, mit grünem Startpunkt an jeder Linie. */
const pattern = (id, label, ds) => ({ id, label, regions: [], lines: ds.map((d) => ({ d })), start: ds.map(startOf) });

const wheels = (...xs) => xs.map(([x, y, r], i) => R(`rad-${i + 1}`, 'das Rad', circle(x, y, r)));
const teddyFace = (cx, cy, s = 1) => L(
  `${circle(cx - 18 * s, cy - 8 * s, 5 * s)} ${circle(cx + 18 * s, cy - 8 * s, 5 * s)} ` +
  `${ellipse(cx, cy + 8 * s, 8 * s, 6 * s)} M ${cx - 10 * s} ${cy + 20 * s} Q ${cx} ${cy + 28 * s} ${cx + 10 * s} ${cy + 20 * s}`,
);

const list = [
  // ---------- leicht ----------
  m('sonne', 'die Sonne', [R('sonne', 'die Sonne', star(100, 100, 92, 60, 12))],
    [L(`${circle(82, 90, 6)} ${circle(118, 90, 6)} M 78 114 Q 100 134 122 114`)]),
  m('ball', 'den Ball', [R('ball', 'der Ball', circle(100, 100, 75))], [L('M 30 85 Q 100 130 170 85')]),
  m('herz', 'das Herz', [R('herz', 'das Herz',
    'M 100 170 C 20 115 20 40 70 40 C 90 40 100 55 100 65 C 100 55 110 40 130 40 C 180 40 180 115 100 170 Z')]),
  m('stoppschild', 'das Stoppschild', [
    R('schild', 'das Schild', ngon(100, 82, 66, 8, -67.5)),
    R('pfosten', 'der Pfosten', rect(92, 142, 16, 50, 3)),
  ]),
  m('apfel', 'den Apfel', [
    R('apfel', 'der Apfel', 'M 100 60 C 60 35 25 70 35 120 C 45 170 85 180 100 165 C 115 180 155 170 165 120 C 175 70 140 35 100 60 Z'),
    R('blatt', 'das Blatt', 'M 102 58 C 105 30 130 22 148 28 C 138 50 122 58 102 58 Z'),
  ], [L('M 100 60 L 94 32')]),
  m('wolke', 'die Wolke', [R('wolke', 'die Wolke',
    'M 50 140 C 18 140 18 98 50 98 C 46 62 96 52 106 80 C 116 52 168 58 158 98 C 186 98 186 140 155 140 Z')]),
  m('stern', 'den Stern', [R('stern', 'der Stern', star(100, 108, 88, 38, 5))]),
  m('teddy-kopf', 'den Teddy', [
    R('kopf', 'der Kopf', circle(100, 112, 60)),
    R('ohr-links', 'das Ohr', circle(52, 58, 24)),
    R('ohr-rechts', 'das Ohr', circle(148, 58, 24)),
  ], [teddyFace(100, 112, 1.3)]),
  m('auto', 'das Auto', [
    R('auto', 'das Auto', 'M 22 138 L 22 108 Q 22 90 42 88 L 62 88 L 84 56 L 136 56 L 156 88 L 166 88 Q 180 90 180 110 L 180 138 Z'),
    ...wheels([60, 140, 22], [143, 140, 22]),
  ]),
  m('mensch', 'einen Menschen', [
    R('kopf', 'der Kopf', circle(100, 40, 24)),
    R('bauch', 'der Bauch', rect(74, 66, 52, 66, 12)),
    S('arm-links', 'der Arm', 'M 76 80 L 40 116', 16),
    S('arm-rechts', 'der Arm', 'M 124 80 L 160 116', 16),
    S('bein-links', 'das Bein', 'M 88 132 L 80 186', 18),
    S('bein-rechts', 'das Bein', 'M 112 132 L 120 186', 18),
  ]),
  m('vorfahrt', 'das Vorfahrtsschild', [R('schild', 'das Schild', poly([18, 32], [182, 32], [100, 176]))],
    [L(poly([52, 50], [148, 50], [100, 138]))]),
  m('kreis-schild', 'das runde Schild', [R('schild', 'das Schild', circle(100, 100, 75))], [L(circle(100, 100, 52))]),

  // ---------- mittel ----------
  m('haus', 'das Haus', [
    R('wand', 'die Wand', rect(45, 95, 110, 88)),
    R('dach', 'das Dach', poly([28, 100], [100, 32], [172, 100])),
    R('tuer', 'die Tür', rect(88, 132, 28, 51, 4)),
    R('fenster', 'das Fenster', rect(56, 110, 24, 24, 3)),
  ]),
  m('baum', 'den Baum', [
    R('krone', 'die Baumkrone', circle(100, 76, 60)),
    R('stamm', 'der Stamm', rect(88, 128, 24, 62, 4)),
  ], [L(circle(78, 62, 8)), L(circle(124, 80, 8)), L(circle(94, 104, 8))]),
  m('fisch', 'den Fisch', [
    R('koerper', 'der Fisch', ellipse(92, 100, 62, 40)),
    R('schwanz', 'die Schwanzflosse', poly([148, 100], [190, 66], [190, 134])),
    R('flosse', 'die Flosse', poly([80, 64], [108, 40], [116, 66])),
  ], [L(circle(62, 92, 7))]),
  m('ampel', 'die Ampel', [
    R('kasten', 'die Ampel', rect(68, 14, 64, 130, 16)),
    R('rot', 'das rote Licht', circle(100, 42, 16)),
    R('gelb', 'das gelbe Licht', circle(100, 80, 16)),
    R('gruen', 'das grüne Licht', circle(100, 118, 16)),
    R('pfosten', 'der Pfosten', rect(92, 144, 16, 48, 3)),
  ]),
  m('parkschild', 'das Parkschild', [
    R('schild', 'das Schild', rect(40, 20, 120, 120, 18)),
    R('pfosten', 'der Pfosten', rect(92, 140, 16, 52, 3)),
  ], [L('M 84 118 L 84 46 L 110 46 Q 132 46 132 68 Q 132 90 110 90 L 84 90')]),
  m('hase', 'den Hasen', [
    R('kopf', 'der Kopf', circle(100, 112, 40)),
    R('ohr-links', 'das Ohr', ellipse(80, 48, 14, 36)),
    R('ohr-rechts', 'das Ohr', ellipse(120, 48, 14, 36)),
    R('bauch', 'der Bauch', ellipse(100, 172, 50, 24)),
  ], [L(`${circle(86, 106, 5)} ${circle(114, 106, 5)} M 92 124 Q 100 132 108 124`)]),
  m('bus', 'den Bus', [
    R('bus', 'der Bus', rect(14, 52, 172, 98, 18)),
    R('fenster-1', 'das Fenster', rect(28, 68, 38, 32, 6)),
    R('fenster-2', 'das Fenster', rect(78, 68, 38, 32, 6)),
    R('fenster-3', 'das Fenster', rect(128, 68, 42, 32, 6)),
    ...wheels([54, 150, 19], [146, 150, 19]),
  ]),
  m('teddy', 'den Teddybären', [
    R('kopf', 'der Kopf', circle(100, 56, 36)),
    R('ohr-links', 'das Ohr', circle(70, 26, 14)),
    R('ohr-rechts', 'das Ohr', circle(130, 26, 14)),
    R('bauch', 'der Bauch', ellipse(100, 140, 46, 50)),
    R('arm-links', 'der Arm', ellipse(50, 122, 15, 30)),
    R('arm-rechts', 'der Arm', ellipse(150, 122, 15, 30)),
  ], [teddyFace(100, 58, 0.8)]),
  m('auto-2', 'das Auto', [
    R('auto', 'das Auto', rect(14, 94, 172, 52, 18)),
    R('dach', 'das Dach', poly([48, 96], [70, 54], [138, 54], [160, 96])),
    R('fenster', 'das Fenster', poly([76, 62], [132, 62], [146, 90], [62, 90])),
    ...wheels([56, 148, 21], [144, 148, 21]),
  ]),
  m('regenbogen', 'den Regenbogen', [
    S('bogen-1', 'der Regenbogen', 'M 26 168 A 74 74 0 0 1 174 168', 15),
    S('bogen-2', 'der Regenbogen', 'M 42 168 A 58 58 0 0 1 158 168', 15),
    S('bogen-3', 'der Regenbogen', 'M 58 168 A 42 42 0 0 1 142 168', 15),
    S('bogen-4', 'der Regenbogen', 'M 74 168 A 26 26 0 0 1 126 168', 15),
  ]),
  m('boot', 'das Boot', [
    R('rumpf', 'das Boot', poly([26, 132], [174, 132], [146, 170], [54, 170])),
    R('segel', 'das Segel', poly([108, 30], [108, 120], [164, 120])),
    S('mast', 'der Mast', 'M 100 22 L 100 132', 8),
    R('fahne', 'die Fahne', poly([100, 22], [72, 34], [100, 46])),
  ]),
  m('zug', 'den Zug', [
    R('lok', 'die Lok', rect(18, 86, 112, 58, 8)),
    R('fuehrerhaus', 'das Führerhaus', rect(120, 44, 62, 100, 8)),
    R('schornstein', 'der Schornstein', rect(38, 52, 24, 34, 4)),
    ...wheels([48, 152, 18], [94, 152, 18], [148, 152, 18]),
  ]),
  m('katze', 'die Katze', [
    R('kopf', 'der Kopf', circle(100, 72, 38)),
    R('ohr-links', 'das Ohr', poly([66, 54], [70, 14], [96, 40])),
    R('ohr-rechts', 'das Ohr', poly([134, 54], [130, 14], [104, 40])),
    R('bauch', 'der Bauch', ellipse(100, 148, 42, 40)),
    S('schwanz', 'der Schwanz', 'M 138 170 Q 186 156 172 112', 13),
  ], [L('M 58 76 L 84 80 M 58 90 L 84 86 M 142 76 L 116 80 M 142 90 L 116 86')]),
  m('blume', 'die Blume', [
    R('mitte', 'die Blütenmitte', circle(100, 70, 18)),
    ...Array.from({ length: 5 }, (_, i) => {
      const a = (-90 + i * 72) * Math.PI / 180;
      return R(`blatt-${i + 1}`, 'das Blütenblatt', circle(100 + 34 * Math.cos(a), 70 + 34 * Math.sin(a), 19));
    }),
    S('stiel', 'der Stiel', 'M 100 104 L 100 192', 10),
  ]),
  m('mond-sterne', 'den Mond und die Sterne', [
    R('mond', 'der Mond', 'M 96 28 A 66 66 0 1 0 152 142 A 52 52 0 1 1 96 28 Z'),
    R('stern-1', 'der Stern', star(152, 46, 24, 10, 5)),
    R('stern-2', 'der Stern', star(168, 98, 16, 7, 5)),
    R('stern-3', 'der Stern', star(52, 172, 18, 8, 5)),
  ]),
  m('lkw', 'den Lastwagen', [
    R('ladung', 'die Ladefläche', rect(14, 48, 112, 98, 6)),
    R('kabine', 'die Fahrerkabine', poly([126, 78], [160, 78], [186, 110], [186, 146], [126, 146])),
    R('fenster', 'das Fenster', poly([134, 86], [157, 86], [175, 108], [134, 108])),
    ...wheels([44, 152, 18], [94, 152, 18], [160, 152, 18]),
  ]),
  m('polizeiauto', 'das Polizeiauto', [
    R('auto', 'das Auto', rect(14, 100, 172, 46, 18)),
    R('dach', 'das Dach', poly([48, 102], [70, 64], [138, 64], [160, 102])),
    R('fenster', 'das Fenster', poly([76, 72], [132, 72], [146, 96], [62, 96])),
    R('blaulicht', 'das Blaulicht', rect(88, 42, 24, 20, 6)),
    R('streifen', 'der Streifen', rect(14, 116, 172, 12)),
    ...wheels([56, 148, 20], [144, 148, 20]),
  ]),
  m('einbahnstrasse', 'das Einbahnstraßen-Schild', [
    R('schild', 'das Schild', rect(18, 46, 164, 64, 10)),
    R('pfeil', 'der Pfeil', poly([38, 68], [126, 68], [126, 56], [166, 78], [126, 100], [126, 88], [38, 88])),
    R('pfosten', 'der Pfosten', rect(92, 110, 16, 82, 3)),
  ]),

  // ---------- schwer ----------
  m('feuerwehr', 'das Feuerwehrauto', [
    R('auto', 'das Feuerwehrauto', rect(10, 80, 142, 66, 8)),
    R('kabine', 'die Fahrerkabine', poly([150, 92], [174, 92], [192, 118], [192, 146], [150, 146])),
    R('fenster', 'das Fenster', poly([156, 99], [171, 99], [184, 118], [156, 118])),
    S('leiter', 'die Leiter', 'M 18 70 L 142 44', 11),
    R('blaulicht', 'das Blaulicht', rect(156, 78, 18, 13, 4)),
    ...wheels([40, 152, 18], [108, 152, 18], [170, 152, 18]),
  ]),
  m('bagger', 'den Bagger', [
    R('bagger', 'der Bagger', rect(60, 90, 82, 46, 6)),
    R('kabine', 'die Kabine', rect(100, 46, 48, 48, 6)),
    R('fenster', 'das Fenster', rect(108, 54, 32, 28, 4)),
    S('arm', 'der Baggerarm', 'M 70 100 L 32 58 L 26 118', 13),
    R('schaufel', 'die Schaufel', poly([8, 118], [46, 118], [36, 148], [14, 148])),
    R('kette', 'die Kette', rect(44, 140, 118, 38, 19)),
    ...wheels([66, 159, 11], [103, 159, 11], [140, 159, 11]),
  ]),
  m('teddy-2', 'den großen Teddy', [
    R('kopf', 'der Kopf', circle(100, 54, 33)),
    R('ohr-links', 'das Ohr', circle(70, 26, 15)),
    R('ohr-rechts', 'das Ohr', circle(130, 26, 15)),
    R('ohr-innen-links', 'das Ohr innen', circle(70, 26, 7)),
    R('ohr-innen-rechts', 'das Ohr innen', circle(130, 26, 7)),
    R('bauch', 'der Bauch', ellipse(100, 126, 40, 44)),
    R('bauchfleck', 'der Bauchfleck', ellipse(100, 132, 22, 26)),
    R('arm-links', 'der Arm', ellipse(54, 110, 14, 28)),
    R('arm-rechts', 'der Arm', ellipse(146, 110, 14, 28)),
    R('bein-links', 'das Bein', ellipse(74, 174, 20, 17)),
    R('bein-rechts', 'das Bein', ellipse(126, 174, 20, 17)),
  ], [teddyFace(100, 56, 0.75)]),
  m('auto-3', 'das schicke Auto', [
    R('auto', 'das Auto', rect(10, 94, 180, 52, 18)),
    R('dach', 'das Dach', poly([44, 96], [70, 54], [136, 54], [162, 96])),
    R('fenster-1', 'das Fenster', poly([76, 62], [100, 62], [100, 90], [60, 90])),
    R('fenster-2', 'das Fenster', poly([108, 62], [130, 62], [148, 90], [108, 90])),
    R('licht-vorne', 'das Licht', rect(174, 104, 14, 12, 3)),
    R('licht-hinten', 'das Licht', rect(12, 104, 14, 12, 3)),
    ...wheels([50, 148, 21], [150, 148, 21]),
    R('felge-1', 'die Felge', circle(50, 148, 8)),
    R('felge-2', 'die Felge', circle(150, 148, 8)),
  ], [L('M 104 96 L 104 140')]),
  m('traktor', 'den Traktor', [
    R('traktor', 'der Traktor', rect(56, 86, 96, 46, 6)),
    R('kabine', 'die Kabine', rect(56, 32, 62, 58, 6)),
    R('fenster', 'das Fenster', rect(66, 42, 42, 36, 4)),
    R('rad-gross', 'das große Rad', circle(72, 144, 40)),
    R('rad-klein', 'das kleine Rad', circle(160, 156, 26)),
    R('nabe-gross', 'die Radmitte', circle(72, 144, 14)),
    R('nabe-klein', 'die Radmitte', circle(160, 156, 9)),
    R('auspuff', 'der Auspuff', rect(130, 48, 11, 38, 3)),
  ]),
  m('schmetterling', 'den Schmetterling', [
    R('koerper', 'der Körper', ellipse(100, 102, 9, 56)),
    R('fluegel-1', 'der Flügel', ellipse(60, 72, 38, 32)),
    R('fluegel-2', 'der Flügel', ellipse(140, 72, 38, 32)),
    R('fluegel-3', 'der Flügel', ellipse(68, 136, 28, 24)),
    R('fluegel-4', 'der Flügel', ellipse(132, 136, 28, 24)),
    R('punkt-1', 'der Punkt', circle(54, 68, 9)),
    R('punkt-2', 'der Punkt', circle(146, 68, 9)),
    R('punkt-3', 'der Punkt', circle(66, 138, 8)),
    R('punkt-4', 'der Punkt', circle(134, 138, 8)),
  ], [L('M 96 50 Q 86 22 72 18'), L('M 104 50 Q 114 22 128 18')]),
  m('kreuzung', 'die Kreuzung', [
    R('wiese-1', 'die Wiese', rect(6, 6, 64, 64, 8)),
    R('wiese-2', 'die Wiese', rect(130, 6, 64, 64, 8)),
    R('wiese-3', 'die Wiese', rect(6, 130, 64, 64, 8)),
    R('wiese-4', 'die Wiese', rect(130, 130, 64, 64, 8)),
    R('strasse-1', 'die Straße', rect(76, 4, 48, 192)),
    R('strasse-2', 'die Straße', rect(4, 76, 192, 48)),
  ], [L('M 100 8 L 100 68'), L('M 100 132 L 100 192'), L('M 8 100 L 68 100'), L('M 132 100 L 192 100')]),
  m('tankstelle', 'die Tankstelle', [
    R('haus', 'das Haus', rect(108, 74, 82, 108, 6)),
    R('dach', 'das Dach', poly([100, 78], [149, 40], [198, 78])),
    R('fenster', 'das Fenster', rect(122, 92, 54, 34, 4)),
    R('tuer', 'die Tür', rect(138, 136, 24, 46, 3)),
    R('zapfsaeule', 'die Zapfsäule', rect(22, 80, 54, 102, 8)),
    R('anzeige', 'die Anzeige', rect(32, 92, 34, 24, 3)),
    S('schlauch', 'der Schlauch', 'M 76 112 Q 98 122 92 154', 7),
  ]),
  m('dino', 'den Dino', [
    R('bauch', 'der Bauch', ellipse(98, 122, 56, 38)),
    R('kopf', 'der Kopf', ellipse(160, 56, 26, 17)),
    S('hals', 'der Hals', 'M 138 104 Q 150 82 156 66', 22),
    R('schwanz', 'der Schwanz', poly([48, 110], [4, 152], [56, 138])),
    R('bein-1', 'das Bein', rect(70, 146, 18, 38, 6)),
    R('bein-2', 'das Bein', rect(114, 146, 18, 38, 6)),
    R('zacke-1', 'die Zacke', poly([66, 92], [76, 68], [88, 88])),
    R('zacke-2', 'die Zacke', poly([92, 85], [104, 62], [116, 85])),
    R('zacke-3', 'die Zacke', poly([120, 88], [130, 68], [138, 94])),
  ], [L(circle(166, 52, 4))]),
  m('rakete', 'die Rakete', [
    R('rakete', 'die Rakete', rect(70, 58, 60, 102, 10)),
    R('spitze', 'die Spitze', poly([70, 62], [100, 8], [130, 62])),
    R('fenster', 'das Fenster', circle(100, 96, 16)),
    R('fluegel-links', 'der Flügel', poly([70, 118], [42, 166], [70, 160])),
    R('fluegel-rechts', 'der Flügel', poly([130, 118], [158, 166], [130, 160])),
    R('feuer', 'das Feuer', poly([78, 160], [100, 196], [122, 160])),
    R('feuer-innen', 'das Feuer', poly([90, 160], [100, 180], [110, 160])),
  ]),
  m('schloss', 'das Schloss', [
    R('turm-links', 'der Turm', rect(18, 62, 42, 120, 3)),
    R('turm-rechts', 'der Turm', rect(140, 62, 42, 120, 3)),
    R('mauer', 'die Mauer', rect(60, 92, 80, 90)),
    R('dach-links', 'das Turmdach', poly([12, 64], [39, 20], [66, 64])),
    R('dach-rechts', 'das Turmdach', poly([134, 64], [161, 20], [188, 64])),
    R('tor', 'das Tor', 'M 84 182 L 84 146 A 16 16 0 0 1 116 146 L 116 182 Z'),
    R('fenster-links', 'das Fenster', rect(29, 86, 20, 26, 3)),
    R('fenster-rechts', 'das Fenster', rect(151, 86, 20, 26, 3)),
    R('fahne-links', 'die Fahne', poly([39, 20], [39, 4], [58, 12])),
    R('fahne-rechts', 'die Fahne', poly([161, 20], [161, 4], [180, 12])),
  ]),
  m('elefant-kuscheltier', 'den Kuschel-Elefanten', [
    R('kopf', 'der Kopf', circle(100, 70, 40)),
    R('ohr-links', 'das Ohr', ellipse(54, 70, 27, 35)),
    R('ohr-rechts', 'das Ohr', ellipse(146, 70, 27, 35)),
    S('ruessel', 'der Rüssel', 'M 100 96 Q 100 136 126 140', 18),
    R('bauch', 'der Bauch', ellipse(100, 152, 48, 30)),
    R('bein-links', 'das Bein', rect(64, 164, 24, 30, 8)),
    R('bein-rechts', 'das Bein', rect(112, 164, 24, 30, 8)),
  ], [L(`${circle(84, 62, 5)} ${circle(116, 62, 5)}`)]),
  m('familie', 'eine Familie', [
    R('kopf-1', 'der Kopf', circle(45, 40, 18)),
    R('kopf-2', 'der Kopf', circle(100, 86, 15)),
    R('kopf-3', 'der Kopf', circle(155, 40, 18)),
    R('bauch-1', 'der Bauch', rect(28, 60, 34, 72, 10)),
    R('bauch-2', 'der Bauch', rect(87, 102, 26, 46, 8)),
    R('bauch-3', 'der Bauch', rect(138, 60, 34, 72, 10)),
    S('beine-1', 'die Beine', 'M 38 132 L 38 188 M 52 132 L 52 188', 10),
    S('beine-2', 'die Beine', 'M 94 148 L 94 188 M 106 148 L 106 188', 8),
    S('beine-3', 'die Beine', 'M 148 132 L 148 188 M 162 132 L 162 188', 10),
  ]),
  m('flugzeug', 'das Flugzeug', [
    R('rumpf', 'das Flugzeug', ellipse(102, 100, 86, 18)),
    R('fluegel-oben', 'der Flügel', poly([86, 94], [62, 28], [88, 28], [122, 94])),
    R('fluegel-unten', 'der Flügel', poly([86, 106], [62, 172], [88, 172], [122, 106])),
    R('heck', 'das Heck', poly([22, 96], [10, 58], [34, 58], [48, 96])),
  ], [L(`${circle(150, 97, 5)} ${circle(132, 97, 5)} ${circle(114, 97, 5)}`)]),
  m('blume-gross', 'die große Blume', [
    R('mitte', 'die Blütenmitte', circle(100, 62, 16)),
    ...Array.from({ length: 8 }, (_, i) => {
      const a = (-90 + i * 45) * Math.PI / 180;
      return R(`blatt-${i + 1}`, 'das Blütenblatt', circle(100 + 31 * Math.cos(a), 62 + 31 * Math.sin(a), 14));
    }),
    S('stiel', 'der Stiel', 'M 100 94 L 100 158', 9),
    R('blatt-links', 'das Blatt', 'M 100 132 C 72 110 56 118 48 130 C 64 142 86 142 100 132 Z'),
    R('blatt-rechts', 'das Blatt', 'M 100 132 C 128 110 144 118 152 130 C 136 142 114 142 100 132 Z'),
    R('topf', 'der Blumentopf', poly([64, 156], [136, 156], [126, 196], [74, 196])),
  ]),

  // ---------- Muster zum Nachspuren (von leicht nach schwer) ----------
  pattern('muster-gerade', 'gerade Linien', ['M 30 70 L 170 70', 'M 30 130 L 170 130']),
  pattern('muster-zickzack', 'das Zickzack-Muster', ['M 20 130 L 50 70 L 80 130 L 110 70 L 140 130 L 170 70']),
  pattern('muster-wellen', 'die Wellen', ['M 15 80 Q 37 40 60 80 T 105 80 T 150 80 T 195 80', 'M 15 140 Q 37 100 60 140 T 105 140 T 150 140 T 195 140']),
  pattern('muster-berge', 'die Berge', ['M 15 160 L 55 60 L 95 160 L 135 60 L 175 160', 'M 25 185 L 175 185']),
  pattern('muster-treppe', 'die Treppe', ['M 20 175 L 20 145 L 55 145 L 55 115 L 90 115 L 90 85 L 125 85 L 125 55 L 160 55 L 160 25 L 185 25']),
  pattern('muster-kreise', 'die Kreise', [circle(40, 100, 26), circle(100, 100, 26), circle(160, 100, 26)]),
  pattern('muster-schlaufen', 'die Schlaufen', [
    'M 15 140 C 40 140 60 120 55 95 C 50 70 25 85 35 110 C 45 135 75 140 95 140 C 120 140 140 120 135 95 C 130 70 105 85 115 110 C 125 135 155 140 185 140',
  ]),
  pattern('muster-burg', 'die Burgmauer', [
    'M 15 150 L 15 90 L 45 90 L 45 120 L 75 120 L 75 90 L 105 90 L 105 120 L 135 120 L 135 90 L 165 90 L 165 120 L 185 120 L 185 150 Z',
  ]),
  pattern('muster-spirale', 'die Spirale', [
    'M 100 100 A 8 8 0 0 1 116 100 A 16 16 0 0 1 84 100 A 24 24 0 0 1 132 100 A 32 32 0 0 1 68 100 A 40 40 0 0 1 148 100 A 48 48 0 0 1 52 100 A 56 56 0 0 1 164 100 A 64 64 0 0 1 36 100',
  ]),
  pattern('muster-achten', 'die liegenden Achten', [
    'M 30 65 C 30 35 70 35 100 65 C 130 95 170 95 170 65 C 170 35 130 35 100 65 C 70 95 30 95 30 65',
    'M 30 140 C 30 110 70 110 100 140 C 130 170 170 170 170 140 C 170 110 130 110 100 140 C 70 170 30 170 30 140',
  ]),
  pattern('muster-girlande', 'die Girlanden', [
    'M 15 60 Q 37 110 60 60 Q 82 110 105 60 Q 127 110 150 60 Q 172 110 195 60',
    'M 15 130 C 25 175 45 175 50 140 C 55 115 35 115 40 140 C 45 175 75 175 85 140 C 90 115 70 115 75 140 C 80 175 110 175 120 140 C 125 115 105 115 110 140 C 115 175 145 175 155 140 C 160 115 140 115 145 140 C 150 175 180 175 190 140',
  ]),

  // ---------- Länder (vereinfachte Umrisse) ----------
  m('deutschland', 'Deutschland', [R('land', 'das Land', poly(
    [95, 10], [110, 22], [125, 18], [140, 28], [152, 20], [164, 32], [160, 50], [172, 62], [166, 82], [176, 102],
    [160, 112], [150, 126], [162, 142], [152, 160], [158, 182], [132, 190], [110, 186], [95, 194], [75, 184], [58, 186],
    [54, 166], [44, 150], [38, 126], [34, 104], [46, 90], [40, 70], [55, 56], [60, 40], [76, 34], [82, 20]))]),
  m('italien', 'Italien', [
    R('land', 'das Land', poly([58, 14], [96, 8], [112, 24], [102, 40], [108, 56], [122, 76], [142, 96], [162, 110],
      [178, 130], [172, 142], [152, 132], [156, 150], [166, 162], [150, 176], [138, 164], [134, 144], [118, 124],
      [98, 108], [84, 88], [70, 68], [54, 50], [44, 34])),
    R('sizilien', 'die Insel', poly([112, 182], [142, 178], [130, 196])),
    R('sardinien', 'die Insel', poly([38, 108], [56, 106], [56, 142], [40, 142])),
  ]),
  m('oesterreich', 'Österreich', [R('land', 'das Land', poly(
    [10, 96], [40, 86], [60, 92], [80, 72], [110, 66], [130, 52], [160, 46], [186, 56], [190, 80], [180, 100],
    [170, 120], [140, 126], [110, 132], [90, 122], [70, 124], [50, 112], [26, 120], [10, 110]))]),
  m('frankreich', 'Frankreich', [
    R('land', 'das Land', poly([100, 14], [126, 24], [150, 34], [170, 50], [165, 80], [155, 96], [165, 120], [160, 150],
      [140, 166], [110, 170], [86, 180], [60, 176], [46, 150], [40, 122], [36, 96], [20, 82], [10, 66], [34, 56],
      [60, 56], [76, 40], [90, 30])),
    R('korsika', 'die Insel', poly([176, 162], [188, 160], [186, 192], [176, 190])),
  ]),
  m('spanien', 'Spanien', [R('land', 'das Land', poly(
    [20, 42], [60, 30], [100, 40], [140, 40], [166, 56], [186, 70], [170, 92], [156, 112], [146, 140], [120, 166],
    [90, 172], [60, 174], [40, 162], [34, 140], [24, 120], [30, 90], [14, 70]))]),

  // ---------- Noch mehr Tiere, Schilder, Fahrzeuge ----------
  m('schnecke', 'die Schnecke', [
    R('haus', 'das Schneckenhaus', circle(112, 92, 50)),
    R('koerper', 'der Körper', 'M 20 160 Q 20 140 50 140 L 170 140 Q 190 140 190 158 Q 190 172 170 172 L 40 172 Q 20 172 20 160 Z'),
  ], [L('M 112 92 A 10 10 0 0 1 132 92 A 20 20 0 0 1 92 92 A 30 30 0 0 1 152 92 A 40 40 0 0 1 72 92'),
    L('M 36 142 L 26 108 M 46 142 L 50 106'), L(circle(30, 152, 3))]),
  m('vogel', 'den Vogel', [
    R('koerper', 'der Bauch', ellipse(100, 110, 52, 38)),
    R('kopf', 'der Kopf', circle(150, 72, 26)),
    R('schnabel', 'der Schnabel', poly([172, 66], [196, 74], [172, 82])),
    R('fluegel', 'der Flügel', 'M 70 100 Q 100 70 130 100 Q 100 125 70 100 Z'),
    R('schwanz', 'der Schwanz', poly([52, 104], [10, 84], [16, 128])),
  ], [L(circle(156, 66, 4)), L('M 90 146 L 86 178 M 110 146 L 114 178')]),
  m('achtung-schild', 'das Achtung-Schild', [R('schild', 'das Schild', poly([100, 18], [184, 166], [16, 166]))],
    [L('M 100 70 L 100 120'), L(circle(100, 140, 6))]),
  m('rennauto', 'das Rennauto', [
    R('auto', 'das Rennauto', 'M 10 130 L 30 104 L 70 100 L 92 76 L 132 76 L 150 100 L 188 108 L 192 130 Z'),
    R('fenster', 'das Fenster', poly([98, 82], [128, 82], [140, 98], [86, 98])),
    R('spoiler', 'der Spoiler', 'M 8 88 L 40 88 L 40 98 L 30 98 L 26 108 L 20 108 L 22 98 L 8 98 Z'),
    R('nummer', 'die Startnummer', circle(104, 114, 11)),
    ...wheels([50, 134, 20], [154, 134, 20]),
  ]),
];

export const MOTIFS = Object.fromEntries(list.map((x) => [x.id, x]));
