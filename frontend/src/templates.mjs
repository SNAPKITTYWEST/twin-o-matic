export const SCENE_TEMPLATES = {
  'solar': [
    'set_background {"color":"#000008"}',
    'add_sphere {"radius":1.5,"x":0,"y":2,"z":0,"color":"#ffcc00"}',
    'add_sphere {"radius":0.2,"x":2.5,"y":2,"z":0,"color":"#aaaaaa"}',
    'add_sphere {"radius":0.4,"x":4,"y":2,"z":1,"color":"#ff8800"}',
    'add_sphere {"radius":0.45,"x":5.5,"y":2,"z":-0.5,"color":"#4488ff"}',
    'add_sphere {"radius":0.35,"x":-3.5,"y":2,"z":1.5,"color":"#cc3300"}',
    'add_sphere {"radius":1.0,"x":-2,"y":2,"z":-4,"color":"#cc9944"}',
    'add_torus {"radius":1.4,"tube":0.04,"x":-2,"y":2,"z":-4,"color":"#aa8855"}',
    'add_sphere {"radius":0.7,"x":3,"y":2,"z":-5,"color":"#88bbdd"}',
    'add_sphere {"radius":0.6,"x":-5,"y":2,"z":-2,"color":"#5577cc"}',
    'add_sphere {"radius":0.55,"x":1,"y":2,"z":5,"color":"#3355aa"}',
    'add_particles {"count":600,"spread":18,"color":"#ffffff"}',
    'add_light {"x":0,"y":2,"z":0,"color":"#ffee88","intensity":2}'
  ],
  'city': [
    'set_background {"color":"#0a0a1e"}',
    'add_box {"width":1,"height":5,"depth":1,"x":-4,"y":2.5,"z":-2,"color":"#4488cc"}',
    'add_box {"width":1.3,"height":7,"depth":1,"x":-2,"y":3.5,"z":0,"color":"#5ad1c4"}',
    'add_box {"width":0.8,"height":4,"depth":0.8,"x":0,"y":2,"z":1,"color":"#a78bfa"}',
    'add_box {"width":1.5,"height":8,"depth":1.2,"x":2,"y":4,"z":-1,"color":"#667eea"}',
    'add_box {"width":1,"height":3,"depth":1,"x":4,"y":1.5,"z":0,"color":"#6366f1"}',
    'add_box {"width":0.9,"height":6,"depth":0.9,"x":-1,"y":3,"z":-3,"color":"#06b6d4"}',
    'add_box {"width":1.2,"height":4.5,"depth":1,"x":3,"y":2.25,"z":3,"color":"#8b5cf6"}',
    'add_cylinder {"radius":0.3,"height":9,"x":0,"y":4.5,"z":-2,"color":"#ef4444"}',
    'add_light {"x":0,"y":10,"z":0,"color":"#ffddaa","intensity":2}',
    'add_light {"x":-3,"y":3,"z":2,"color":"#5ad1c4","intensity":1}',
    'add_particles {"count":100,"spread":12,"color":"#ffcc00"}'
  ],
  'forest': [
    'set_background {"color":"#0a1a0a"}',
    'add_cylinder {"radius":0.15,"height":3,"x":-3,"y":1.5,"z":-2,"color":"#8B4513"}',
    'add_cone {"radius":1,"height":2,"x":-3,"y":3.5,"z":-2,"color":"#228B22"}',
    'add_cylinder {"radius":0.2,"height":4,"x":-1,"y":2,"z":0,"color":"#A0522D"}',
    'add_cone {"radius":1.2,"height":2.5,"x":-1,"y":4.5,"z":0,"color":"#006400"}',
    'add_cylinder {"radius":0.15,"height":3.5,"x":2,"y":1.75,"z":1,"color":"#8B4513"}',
    'add_cone {"radius":0.9,"height":2,"x":2,"y":4,"z":1,"color":"#2E8B57"}',
    'add_cylinder {"radius":0.25,"height":5,"x":4,"y":2.5,"z":-1,"color":"#A0522D"}',
    'add_cone {"radius":1.5,"height":3,"x":4,"y":5.5,"z":-1,"color":"#006400"}',
    'add_cylinder {"radius":0.12,"height":2.5,"x":0,"y":1.25,"z":-4,"color":"#8B4513"}',
    'add_cone {"radius":0.8,"height":1.8,"x":0,"y":3,"z":-4,"color":"#228B22"}',
    'add_sphere {"radius":0.15,"x":-2,"y":0.5,"z":1,"color":"#ff4444"}',
    'add_sphere {"radius":0.12,"x":1,"y":0.5,"z":2,"color":"#ffcc00"}',
    'add_particles {"count":100,"spread":10,"color":"#88ff88"}',
    'add_light {"x":0,"y":8,"z":0,"color":"#ffffcc","intensity":1.5}'
  ],
  'ocean': [
    'set_background {"color":"#001122"}',
    'add_box {"width":20,"height":0.1,"depth":20,"x":0,"y":0,"z":0,"color":"#0066aa"}',
    'add_sphere {"radius":0.4,"x":-2,"y":1,"z":-1,"color":"#ff6600"}',
    'add_sphere {"radius":0.3,"x":1,"y":0.8,"z":2,"color":"#ffaa00"}',
    'add_sphere {"radius":0.25,"x":3,"y":0.7,"z":-2,"color":"#ff4488"}',
    'add_cylinder {"radius":0.05,"height":3,"x":-4,"y":1.5,"z":0,"color":"#888888"}',
    'add_box {"width":2,"height":0.05,"depth":1,"x":-4,"y":3,"z":0,"color":"#ffffff"}',
    'add_torus {"radius":0.6,"tube":0.1,"x":2,"y":0.5,"z":-3,"color":"#00ccff"}',
    'add_particles {"count":300,"spread":12,"color":"#88ccff"}',
    'add_light {"x":5,"y":6,"z":5,"color":"#ffeecc","intensity":2}'
  ],
  'space': [
    'set_background {"color":"#000000"}',
    'add_particles {"count":800,"spread":20,"color":"#ffffff"}',
    'add_sphere {"radius":0.8,"x":0,"y":2,"z":0,"color":"#4488ff"}',
    'add_torus {"radius":1.2,"tube":0.08,"x":0,"y":2,"z":0,"color":"#aaaaff"}',
    'add_sphere {"radius":0.3,"x":3,"y":3,"z":-2,"color":"#ff4444"}',
    'add_sphere {"radius":0.5,"x":-4,"y":1,"z":3,"color":"#44ff88"}',
    'add_sphere {"radius":1.2,"x":5,"y":2,"z":5,"color":"#ffaa00"}',
    'add_particles {"count":200,"spread":6,"color":"#ff88ff"}',
    'add_light {"x":0,"y":5,"z":0,"color":"#4488ff","intensity":2}',
    'add_light {"x":5,"y":3,"z":5,"color":"#ffaa00","intensity":1.5}'
  ],
  'abstract': [
    'set_background {"color":"#0a001a"}',
    'add_torus {"radius":2,"tube":0.2,"x":0,"y":3,"z":0,"color":"#a78bfa"}',
    'add_torus {"radius":1.5,"tube":0.15,"x":0,"y":3,"z":0,"color":"#ec4899"}',
    'add_sphere {"radius":0.5,"x":0,"y":3,"z":0,"color":"#ffffff"}',
    'add_cone {"radius":0.8,"height":3,"x":-3,"y":1.5,"z":-3,"color":"#06b6d4"}',
    'add_cone {"radius":0.8,"height":3,"x":3,"y":1.5,"z":3,"color":"#f59e0b"}',
    'add_cylinder {"radius":0.1,"height":6,"x":-3,"y":3,"z":3,"color":"#ef4444"}',
    'add_cylinder {"radius":0.1,"height":6,"x":3,"y":3,"z":-3,"color":"#10b981"}',
    'add_particles {"count":400,"spread":10,"color":"#a78bfa"}',
    'add_light {"x":0,"y":6,"z":0,"color":"#ffffff","intensity":2}'
  ]
};

export function detectScene(text) {
  const groups={solar:/\b(solar|planets?|sun)\b/i,city:/\b(city|skyline|buildings?|towers?)\b/i,forest:/\b(forest|trees?|wood|jungle)\b/i,ocean:/\b(ocean|sea|water|fish)\b/i,space:/\b(space|galaxy|nebula|stars?)\b/i,abstract:/\b(abstract|art|geometric|shapes?)\b/i};
  for(const [key,pattern] of Object.entries(groups))if(pattern.test(text))return key;
  return /\b(create|build|make|show|generate|draw)\b/i.test(text)?'abstract':null;
}
