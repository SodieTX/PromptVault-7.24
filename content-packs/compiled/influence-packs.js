// ═══ AUTO-GENERATED — do not edit. Run: node content-packs/convert.mjs ═══
// Generated: 2026-03-23T07:05:41.831Z
// Sources: influences-comics.md

const CONTENT_PACK_INFLUENCES = [
  {
    "cat": "Manga Artists — Action & Shonen",
    "artists": [
      {
        "name": "Kentaro Miura",
        "d": "Berserk. Crosshatch density that rivals Dürer, impossible armor design, dark fantasy at its most obsessive. Died mid-masterpiece"
      },
      {
        "name": "Takehiko Inoue",
        "d": "Slam Dunk, Vagabond. Brush ink mastery, Musashi's expression worth 10,000 words. Sports manga elevated to fine art"
      },
      {
        "name": "Eiichiro Oda",
        "d": "One Piece. Exaggerated proportion, kinetic action, 1000+ chapters of escalating world-building density"
      },
      {
        "name": "Masashi Kishimoto",
        "d": "Naruto. Dynamic action choreography, ninja-meets-streetwear character design, emotional page layouts"
      },
      {
        "name": "Tite Kubo",
        "d": "Bleach. Fashion-forward character design, negative space as weapon, coolest silhouettes in manga"
      }
    ]
  },
  {
    "cat": "Manga Artists — Horror & Psychological",
    "artists": [
      {
        "name": "Junji Ito",
        "d": "Uzumaki, Tomie, The Enigma of Amigara Fault. Body horror through obsessive pattern, the beautiful becoming grotesque"
      },
      {
        "name": "Suehiro Maruo",
        "d": "Shojo Tsubaki, Ultra-Gash Inferno. Ero-guro, Taisho-era decadence, beauty and atrocity on the same page"
      },
      {
        "name": "Shintaro Kago",
        "d": "Abstraction, metamorphosis, guro-comedy. Bodies as architecture, flesh as material, the absurd made anatomical"
      }
    ]
  },
  {
    "cat": "Western Comics — Visionaries",
    "artists": [
      {
        "name": "Moebius (Jean Giraud)",
        "d": "The Incal, Arzach. Clean ligne claire for sci-fi landscapes, infinite desert horizons, organic technology. Influenced Alien, Blade Runner, Akira"
      },
      {
        "name": "Frank Miller",
        "d": "Sin City, Dark Knight Returns. High-contrast B&W, negative space as narrative, noir as a blunt instrument"
      },
      {
        "name": "Bill Sienkiewicz",
        "d": "Elektra: Assassin, New Mutants. Mixed media collage meets superhero art, painted expressionism in a comics grid"
      },
      {
        "name": "Dave McKean",
        "d": "Sandman covers, Arkham Asylum. Photo-collage, paint, digital compositing. Comics as gallery installation"
      },
      {
        "name": "Mike Mignola",
        "d": "Hellboy. Angular shadow, Expressionist blocks, Lovecraft meets folk art. Less is more applied to monsters"
      }
    ]
  },
  {
    "cat": "Western Comics — Contemporary",
    "artists": [
      {
        "name": "Fiona Staples",
        "d": "Saga. Painterly digital, diverse character design, sci-fi warmth, the anti-grimdark"
      },
      {
        "name": "Tradd Moore",
        "d": "Silver Surfer Black, Luther Strode. Psychedelic line density, Kirby energy on acid, bodies as kinetic sculpture"
      },
      {
        "name": "James Stokoe",
        "d": "Orc Stain, Godzilla. Obsessive detail, every surface has texture, maximalist worldbuilding in ink"
      },
      {
        "name": "Tillie Walden",
        "d": "Spinning, On a Sunbeam. Quiet color, vast negative space, queer coming-of-age in cosmic architecture"
      }
    ]
  }
];

// Auto-inject into MJ_INFLUENCE_LIBRARY
(function(){
  if(typeof MJ_INFLUENCE_LIBRARY==="undefined")return;
  CONTENT_PACK_INFLUENCES.forEach(function(cat){
    if(!MJ_INFLUENCE_LIBRARY.find(function(c){return c.cat===cat.cat})){
      MJ_INFLUENCE_LIBRARY.push(cat);
    }
  });
})();
