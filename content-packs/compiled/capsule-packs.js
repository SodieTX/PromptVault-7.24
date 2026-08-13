// ═══ AUTO-GENERATED — do not edit. Run: node content-packs/convert.mjs ═══
// Generated: 2026-03-23T07:05:41.830Z
// Sources: capsules-architecture.md

const CONTENT_PACK_PANELS = [
  {
    "id": "architectural-style",
    "icon": "🏛️",
    "title": "Architectural Style",
    "sub": "Architecture & Spatial Design",
    "layer": 3,
    "groups": [
      {
        "label": "Historical & Classical",
        "pills": [
          {
            "v": "ancient Greek temple marble columns Doric order",
            "l": "Greek Temple",
            "d": "White marble, Doric columns, pediment frieze. The Parthenon as a math equation"
          },
          {
            "v": "Gothic cathedral pointed arch ribbed vault stained glass",
            "l": "Gothic Cathedral",
            "d": "Soaring verticality, flying buttresses, rose windows. Chartres, Notre-Dame"
          },
          {
            "v": "Baroque palace ornate gilded ceiling fresco",
            "l": "Baroque Palace",
            "d": "Gilded excess, trompe l'oeil ceilings, dramatic staircases. Versailles, Schönbrunn"
          },
          {
            "v": "Mughal architecture white marble inlay pietra dura",
            "l": "Mughal",
            "d": "Symmetry, marble inlay, geometric gardens. Taj Mahal, Red Fort"
          },
          {
            "v": "traditional Japanese minka wooden architecture",
            "l": "Minka",
            "d": "Timber frame, tatami proportions, engawa veranda, thatched or tile roof"
          }
        ]
      },
      {
        "label": "Modernist",
        "pills": [
          {
            "v": "Brutalist concrete raw exposed massive structure",
            "l": "Brutalist",
            "d": "Raw béton brut, heroic scale, social housing ambition. Barbican, Habitat 67"
          },
          {
            "v": "International Style glass curtain wall steel frame",
            "l": "International",
            "d": "Mies van der Rohe glass box, structural honesty, \"less is more\""
          },
          {
            "v": "Metabolist architecture capsule tower modular",
            "l": "Metabolist",
            "d": "Japanese megastructure movement, Nakagin Capsule Tower, plug-in city"
          },
          {
            "v": "Googie architecture space age futuristic diner",
            "l": "Googie",
            "d": "1950s space-age optimism, upswept roofs, starburst signs, LAX Theme Building"
          },
          {
            "v": "parametric architecture Zaha Hadid flowing organic",
            "l": "Parametric",
            "d": "Computational curves, fluid geometry, Heydar Aliyev Center"
          }
        ]
      },
      {
        "label": "Environments & Interiors",
        "pills": [
          {
            "v": "Japanese minimalist wabi-sabi interior natural materials",
            "l": "Wabi-Sabi",
            "d": "Imperfect beauty, aged wood, handmade ceramics, empty space as presence"
          },
          {
            "v": "maximalist interior pattern on pattern jewel tones",
            "l": "Maximalist",
            "d": "More is more. Layered textiles, gallery walls, saturated color clash"
          },
          {
            "v": "Scandinavian hygge interior warm minimal light wood",
            "l": "Scandi Hygge",
            "d": "Light wood, white walls, wool throws, candles, democratic comfort"
          },
          {
            "v": "industrial loft exposed brick ductwork concrete floor",
            "l": "Industrial Loft",
            "d": "Converted warehouse, exposed systems, Edison bulbs, raw materials"
          },
          {
            "v": "solarpunk greenhouse architecture living walls",
            "l": "Solarpunk",
            "d": "Integrated nature, living walls, solar panels as design, optimistic eco-future"
          }
        ]
      }
    ]
  },
  {
    "id": "weather-atmospheric-conditions",
    "icon": "🌦️",
    "title": "Weather & Atmospheric Conditions",
    "sub": "Architecture & Spatial Design",
    "layer": 3,
    "groups": [
      {
        "label": "Precipitation",
        "pills": [
          {
            "v": "heavy monsoon rain sheets of water flooding streets",
            "l": "Monsoon",
            "d": "Tropical downpour, water cascading, reflective surfaces everywhere"
          },
          {
            "v": "gentle snow falling soft winter blanket",
            "l": "Gentle Snow",
            "d": "Silent accumulation, soft edges, muted world, childhood memory"
          },
          {
            "v": "freezing rain ice storm everything coated in glass",
            "l": "Ice Storm",
            "d": "World encased in crystal, branches bending, dangerous beauty"
          },
          {
            "v": "desert sandstorm haboob wall of dust orange sky",
            "l": "Haboob",
            "d": "Wall of sand, orange darkness, apocalyptic scale, Saharan energy"
          }
        ]
      },
      {
        "label": "Atmospheric Phenomena",
        "pills": [
          {
            "v": "aurora borealis northern lights green purple curtains",
            "l": "Aurora",
            "d": "Charged particles painting the magnetosphere, Iceland/Norway"
          },
          {
            "v": "crepuscular rays god rays through forest canopy",
            "l": "God Rays",
            "d": "Volumetric light shafts through gaps, spiritual, cathedral forest"
          },
          {
            "v": "sea fog rolling in over coastline",
            "l": "Sea Fog",
            "d": "Advection fog consuming the shore, ships disappearing, foghorn mood"
          },
          {
            "v": "heat shimmer mirage on desert highway",
            "l": "Heat Mirage",
            "d": "Convection distortion, liquid horizon, phantom lakes on asphalt"
          }
        ]
      }
    ]
  }
];

// Auto-inject into MJC_LIBRARY
(function(){
  if(typeof MJC_LIBRARY==="undefined")return;
  CONTENT_PACK_PANELS.forEach(function(panel){
    if(!MJC_LIBRARY.find(function(p){return p.id===panel.id})){
      MJC_LIBRARY.push(panel);
    }
  });
})();
