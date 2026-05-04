// 游戏数据定义

// 卡片品质配置
const CARD_QUALITY = {
    WHITE: { name: '白色', color: 'white', price: 100, dropRate: 0.5 },
    GREEN: { name: '绿色', color: 'green', price: 200, dropRate: 0.3 },
    PURPLE: { name: '紫色', color: 'purple', price: 500, dropRate: 0.15 },
    GOLD: { name: '金色', color: 'gold', price: 1000, dropRate: 0.04 },
    RED: { name: '红色', color: 'red', price: 5000, dropRate: 0.01 }
};

// 卡片类型配置
const CARD_TYPE = {
    BATTLE: { name: '战斗技能', icon: '⚔️', description: '用于战斗中攻击或防御' },
    SUPPORT: { name: '附加技能', icon: '🛡️', description: '提供增益效果或特殊能力' },
    HERO: { name: '英雄卡片', icon: '👑', description: '强大的英雄角色，提供被动加成' }
};

// 所有卡片数据
const ALL_CARDS = {
    // ==================== 战斗技能卡片 ====================
    // 白色战斗技能
    'slash': {
        id: 'slash',
        name: '斩击',
        type: 'battle',
        quality: 'white',
        cost: 1,
        damage: 8,
        description: '基础的斩击攻击',
        icon: '🗡️',
        effect: null
    },
    'stab': {
        id: 'stab',
        name: '刺击',
        type: 'battle',
        quality: 'white',
        cost: 1,
        damage: 6,
        description: '快速的刺击，有30%概率造成双倍伤害',
        icon: '🗡️',
        effect: { type: 'crit', chance: 0.3, multiplier: 2 }
    },
    'guard': {
        id: 'guard',
        name: '防御',
        type: 'battle',
        quality: 'white',
        cost: 1,
        damage: 0,
        defense: 10,
        description: '防御姿态，减少下一次受到的伤害',
        icon: '🛡️',
        effect: { type: 'defense', value: 10, duration: 1 }
    },
    'punch': {
        id: 'punch',
        name: '拳击',
        type: 'battle',
        quality: 'white',
        cost: 1,
        damage: 5,
        description: '简单的拳击',
        icon: '👊',
        effect: null
    },
    
    // 绿色战斗技能
    'fireball': {
        id: 'fireball',
        name: '火球术',
        type: 'battle',
        quality: 'green',
        cost: 2,
        damage: 15,
        description: '投掷火球造成伤害，有20%概率灼烧敌人',
        icon: '🔥',
        effect: { type: 'burn', chance: 0.2, damage: 3, duration: 2 }
    },
    'ice_arrow': {
        id: 'ice_arrow',
        name: '冰霜箭',
        type: 'battle',
        quality: 'green',
        cost: 2,
        damage: 12,
        description: '冰霜箭矢，有25%概率冻结敌人1回合',
        icon: '❄️',
        effect: { type: 'freeze', chance: 0.25, duration: 1 }
    },
    'heal': {
        id: 'heal',
        name: '治愈术',
        type: 'battle',
        quality: 'green',
        cost: 2,
        damage: 0,
        heal: 20,
        description: '恢复20点生命值',
        icon: '💚',
        effect: null
    },
    'poison_dart': {
        id: 'poison_dart',
        name: '毒镖',
        type: 'battle',
        quality: 'green',
        cost: 2,
        damage: 8,
        description: '投掷毒镖，使敌人中毒3回合',
        icon: '🧪',
        effect: { type: 'poison', damage: 5, duration: 3 }
    },
    
    // 紫色战斗技能
    'thunder_strike': {
        id: 'thunder_strike',
        name: '雷霆一击',
        type: 'battle',
        quality: 'purple',
        cost: 3,
        damage: 25,
        description: '召唤雷霆攻击敌人，有30%概率眩晕',
        icon: '⚡',
        effect: { type: 'stun', chance: 0.3, duration: 1 }
    },
    'shadow_blade': {
        id: 'shadow_blade',
        name: '暗影之刃',
        type: 'battle',
        quality: 'purple',
        cost: 3,
        damage: 20,
        description: '暗影攻击，无视敌人30%防御',
        icon: '🌑',
        effect: { type: 'armor_pen', value: 0.3 }
    },
    'holy_light': {
        id: 'holy_light',
        name: '圣光术',
        type: 'battle',
        quality: 'purple',
        cost: 3,
        damage: 15,
        heal: 30,
        description: '圣光攻击并恢复大量生命',
        icon: '✨',
        effect: null
    },
    
    // 金色战斗技能
    'dragon_breath': {
        id: 'dragon_breath',
        name: '龙息',
        type: 'battle',
        quality: 'gold',
        cost: 4,
        damage: 40,
        description: '释放龙息造成巨额伤害',
        icon: '🐲',
        effect: { type: 'burn', chance: 0.5, damage: 5, duration: 3 }
    },
    'meteor': {
        id: 'meteor',
        name: '陨石坠落',
        type: 'battle',
        quality: 'gold',
        cost: 5,
        damage: 50,
        description: '召唤陨石从天而降',
        icon: '☄️',
        effect: { type: 'aoe', value: 0.5 }
    },
    
    // 红色战斗技能
    'god_strike': {
        id: 'god_strike',
        name: '神之一击',
        type: 'battle',
        quality: 'red',
        cost: 6,
        damage: 80,
        description: '凝聚神力的终极一击',
        icon: '⚔️',
        effect: { type: 'crit', chance: 0.5, multiplier: 2 }
    },
    'chaos_bolt': {
        id: 'chaos_bolt',
        name: '混沌之箭',
        type: 'battle',
        quality: 'red',
        cost: 6,
        damage: 60,
        description: '混沌之力，随机造成1-3倍伤害',
        icon: '🌀',
        effect: { type: 'random_damage', min: 1, max: 3 }
    },
    
    // ==================== 附加技能卡片 ====================
    // 白色附加技能
    'minor_strength': {
        id: 'minor_strength',
        name: '初级力量',
        type: 'support',
        quality: 'white',
        cost: 1,
        damage: 0,
        description: '增加5点攻击力，持续3回合',
        icon: '💪',
        effect: { type: 'buff', stat: 'attack', value: 5, duration: 3 }
    },
    'minor_shield': {
        id: 'minor_shield',
        name: '初级护盾',
        type: 'support',
        quality: 'white',
        cost: 1,
        damage: 0,
        description: '获得10点护盾值',
        icon: '🛡️',
        effect: { type: 'shield', value: 10 }
    },
    
    // 绿色附加技能
    'strength_buff': {
        id: 'strength_buff',
        name: '力量祝福',
        type: 'support',
        quality: 'green',
        cost: 2,
        damage: 0,
        description: '增加15点攻击力，持续3回合',
        icon: '💪',
        effect: { type: 'buff', stat: 'attack', value: 15, duration: 3 }
    },
    'iron_skin': {
        id: 'iron_skin',
        name: '铁皮术',
        type: 'support',
        quality: 'green',
        cost: 2,
        damage: 0,
        description: '增加20点防御力，持续2回合',
        icon: '🛡️',
        effect: { type: 'buff', stat: 'defense', value: 20, duration: 2 }
    },
    'life_drain': {
        id: 'life_drain',
        name: '生命汲取',
        type: 'support',
        quality: 'green',
        cost: 2,
        damage: 10,
        description: '造成伤害并恢复等量生命',
        icon: '💉',
        effect: { type: 'lifesteal', value: 1 }
    },
    
    // 紫色附加技能
    'battle_cry': {
        id: 'battle_cry',
        name: '战吼',
        type: 'support',
        quality: 'purple',
        cost: 3,
        damage: 0,
        description: '增加25点攻击力，持续4回合',
        icon: '📢',
        effect: { type: 'buff', stat: 'attack', value: 25, duration: 4 }
    },
    'magic_barrier': {
        id: 'magic_barrier',
        name: '魔法屏障',
        type: 'support',
        quality: 'purple',
        cost: 3,
        damage: 0,
        description: '获得50点护盾值',
        icon: '🔮',
        effect: { type: 'shield', value: 50 }
    },
    
    // 金色附加技能
    'divine_blessing': {
        id: 'divine_blessing',
        name: '神圣祝福',
        type: 'support',
        quality: 'gold',
        cost: 4,
        damage: 0,
        description: '全属性提升30%，持续3回合',
        icon: '🙏',
        effect: { type: 'buff_all', value: 0.3, duration: 3 }
    },
    
    // 红色附加技能
    'time_warp': {
        id: 'time_warp',
        name: '时间扭曲',
        type: 'support',
        quality: 'red',
        cost: 5,
        damage: 0,
        description: '获得额外一个回合',
        icon: '⏳',
        effect: { type: 'extra_turn' }
    },
    
    // ==================== 英雄卡片 ====================
    // 绿色英雄
    'warrior': {
        id: 'warrior',
        name: '战士',
        type: 'hero',
        quality: 'green',
        cost: 0,
        damage: 0,
        health_bonus: 30,
        attack_bonus: 5,
        description: '勇敢的战士，增加30点生命值和5点攻击力',
        icon: '⚔️',
        passive: { health: 30, attack: 5 }
    },
    'mage': {
        id: 'mage',
        name: '法师',
        type: 'hero',
        quality: 'green',
        cost: 0,
        damage: 0,
        health_bonus: 20,
        attack_bonus: 10,
        description: '神秘的法师，增加20点生命值和10点攻击力',
        icon: '🧙',
        passive: { health: 20, attack: 10 }
    },
    
    // 紫色英雄
    'paladin': {
        id: 'paladin',
        name: '圣骑士',
        type: 'hero',
        quality: 'purple',
        cost: 0,
        damage: 0,
        health_bonus: 50,
        attack_bonus: 10,
        defense_bonus: 10,
        description: '神圣的圣骑士，增加50点生命、10点攻击和10点防御',
        icon: '🛡️',
        passive: { health: 50, attack: 10, defense: 10 }
    },
    'assassin': {
        id: 'assassin',
        name: '刺客',
        type: 'hero',
        quality: 'purple',
        cost: 0,
        damage: 0,
        health_bonus: 20,
        attack_bonus: 20,
        description: '致命的刺客，增加20点生命和20点攻击力',
        icon: '🗡️',
        passive: { health: 20, attack: 20 }
    },
    
    // 金色英雄
    'dragon_knight': {
        id: 'dragon_knight',
        name: '龙骑士',
        type: 'hero',
        quality: 'gold',
        cost: 0,
        damage: 0,
        health_bonus: 80,
        attack_bonus: 20,
        defense_bonus: 15,
        description: '传说中的龙骑士，增加80点生命、20点攻击和15点防御',
        icon: '🐲',
        passive: { health: 80, attack: 20, defense: 15 }
    },
    'archmage': {
        id: 'archmage',
        name: '大法师',
        type: 'hero',
        quality: 'gold',
        cost: 0,
        damage: 0,
        health_bonus: 40,
        attack_bonus: 30,
        description: '强大的大法师，增加40点生命和30点攻击力',
        icon: '🧙‍♂️',
        passive: { health: 40, attack: 30 }
    },
    
    // 红色英雄
    'god_of_war': {
        id: 'god_of_war',
        name: '战神',
        type: 'hero',
        quality: 'red',
        cost: 0,
        damage: 0,
        health_bonus: 100,
        attack_bonus: 40,
        defense_bonus: 20,
        description: '无敌的战神，增加100点生命、40点攻击和20点防御',
        icon: '⚡',
        passive: { health: 100, attack: 40, defense: 20 }
    }
};

// PVE敌人数据
const ENEMIES = {
    // 普通敌人
    'slime': {
        id: 'slime',
        name: '史莱姆',
        health: 50,
        attack: 8,
        defense: 2,
        exp: 20,
        gold: 10,
        icon: '🟢',
        skills: ['tackle'],
        isBoss: false
    },
    'goblin': {
        id: 'goblin',
        name: '哥布林',
        health: 70,
        attack: 12,
        defense: 5,
        exp: 30,
        gold: 15,
        icon: '👺',
        skills: ['stab', 'scratch'],
        isBoss: false
    },
    'skeleton': {
        id: 'skeleton',
        name: '骷髅兵',
        health: 90,
        attack: 15,
        defense: 8,
        exp: 40,
        gold: 20,
        icon: '💀',
        skills: ['slash', 'bone_throw'],
        isBoss: false
    },
    'wolf': {
        id: 'wolf',
        name: '魔狼',
        health: 80,
        attack: 18,
        defense: 6,
        exp: 35,
        gold: 18,
        icon: '🐺',
        skills: ['bite', 'howl'],
        isBoss: false
    },
    
    // Boss敌人
    'goblin_king': {
        id: 'goblin_king',
        name: '哥布林王',
        health: 200,
        attack: 25,
        defense: 15,
        exp: 100,
        gold: 50,
        icon: '👑',
        skills: ['king_slash', 'summon_goblins', 'royal_guard'],
        isBoss: true
    },
    'dragon': {
        id: 'dragon',
        name: '远古巨龙',
        health: 500,
        attack: 40,
        defense: 30,
        exp: 300,
        gold: 200,
        icon: '🐲',
        skills: ['dragon_breath', 'tail_sweep', 'fly'],
        isBoss: true
    },
    'demon_lord': {
        id: 'demon_lord',
        name: '魔王',
        health: 800,
        attack: 60,
        defense: 40,
        exp: 500,
        gold: 500,
        icon: '😈',
        skills: ['dark_blast', 'summon_minions', 'hellfire', 'teleport'],
        isBoss: true
    }
};

// 敌人技能数据
const ENEMY_SKILLS = {
    'tackle': { name: '撞击', damage: 8, description: '基础攻击' },
    'scratch': { name: '抓击', damage: 10, description: '锋利的爪击' },
    'stab': { name: '刺击', damage: 12, description: '快速刺击' },
    'slash': { name: '斩击', damage: 15, description: '强力斩击' },
    'bone_throw': { name: '投掷骨头', damage: 18, description: '远程攻击' },
    'bite': { name: '撕咬', damage: 14, description: '锋利的牙齿' },
    'howl': { name: '嚎叫', damage: 0, buff: { attack: 5, duration: 2 }, description: '提升攻击力' },
    'king_slash': { name: '王者斩击', damage: 30, description: '哥布林王的强力攻击' },
    'summon_goblins': { name: '召唤哥布林', damage: 0, summon: true, description: '召唤小哥布林' },
    'royal_guard': { name: '皇家守卫', damage: 0, defense: 20, duration: 2, description: '提升防御' },
    'dragon_breath': { name: '龙息', damage: 50, description: '喷射火焰' },
    'tail_sweep': { name: '尾扫', damage: 35, description: '横扫攻击' },
    'fly': { name: '飞行', damage: 0, dodge: 0.5, duration: 1, description: '躲避攻击' },
    'dark_blast': { name: '暗黑爆破', damage: 70, description: '黑暗能量攻击' },
    'summon_minions': { name: '召唤仆从', damage: 0, summon: true, description: '召唤恶魔仆从' },
    'hellfire': { name: '地狱火', damage: 60, burn: { damage: 10, duration: 3 }, description: '地狱烈焰' },
    'teleport': { name: '瞬移', damage: 0, dodge: 0.8, duration: 1, description: '瞬移躲避' }
};

// PVE关卡配置
const PVE_STAGES = [
    { id: 1, name: '草原', enemies: ['slime', 'slime', 'goblin'], boss: null, difficulty: 1 },
    { id: 2, name: '森林', enemies: ['goblin', 'wolf', 'skeleton'], boss: null, difficulty: 1.2 },
    { id: 3, name: '洞穴', enemies: ['skeleton', 'skeleton', 'wolf'], boss: 'goblin_king', difficulty: 1.5 },
    { id: 4, name: '火山', enemies: ['wolf', 'skeleton', 'goblin'], boss: 'dragon', difficulty: 2 },
    { id: 5, name: '地狱', enemies: ['skeleton', 'wolf', 'goblin'], boss: 'demon_lord', difficulty: 3 }
];

// 等级经验表
const LEVEL_EXP = [
    100, 150, 220, 300, 400, 520, 660, 820, 1000, 1200,
    1420, 1660, 1920, 2200, 2500, 2820, 3160, 3520, 3900, 4300,
    4720, 5160, 5620, 6100, 6600, 7120, 7660, 8220, 8800, 9400
];

// 游戏配置
const GAME_CONFIG = {
    INITIAL_GOLD: 500,
    INITIAL_HEALTH: 100,
    INITIAL_ATTACK: 10,
    INITIAL_DEFENSE: 5,
    SHOP_REFRESH_INTERVAL: 24 * 60 * 60 * 1000, // 24小时
    SHOP_CARD_COUNT: 5,
    FIRST_SHOP_DISCOUNT: 100, // 首次商店所有卡片100元
    MAX_DECK_SIZE: 6,
    MAX_HERO_COUNT: 1,
    SP_MIN: 1,
    SP_MAX: 6,
    PVE_BOSS_CARD_CHANCE: 0.1 // Boss掉落卡片概率10%
};
