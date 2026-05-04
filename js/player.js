// 玩家系统

class Player {
    constructor() {
        this.gold = GAME_CONFIG.INITIAL_GOLD;
        this.level = 1;
        this.exp = 0;
        this.maxExp = LEVEL_EXP[0];
        this.health = GAME_CONFIG.INITIAL_HEALTH;
        this.maxHealth = GAME_CONFIG.INITIAL_HEALTH;
        this.attack = GAME_CONFIG.INITIAL_ATTACK;
        this.defense = GAME_CONFIG.INITIAL_DEFENSE;
        this.cards = []; // 拥有的卡片ID列表
        this.selectedHero = null; // 选中的英雄卡片
        this.selectedDeck = []; // 选中的战斗技能卡片
        this.shopRefreshTime = 0; // 上次商店刷新时间
        this.isFirstShop = true; // 是否首次打开商店
        this.pveStage = 1; // 当前PVE关卡
        this.pveProgress = 0; // PVE进度
        this.totalBattles = 0;
        this.totalWins = 0;
        
        // 加载存档
        this.load();
    }
    
    // 保存游戏
    save() {
        const saveData = {
            gold: this.gold,
            level: this.level,
            exp: this.exp,
            cards: this.cards,
            selectedHero: this.selectedHero,
            selectedDeck: this.selectedDeck,
            shopRefreshTime: this.shopRefreshTime,
            isFirstShop: this.isFirstShop,
            pveStage: this.pveStage,
            pveProgress: this.pveProgress,
            totalBattles: this.totalBattles,
            totalWins: this.totalWins
        };
        localStorage.setItem('elemental_showdown_save', JSON.stringify(saveData));
    }
    
    // 加载游戏
    load() {
        const saveData = localStorage.getItem('elemental_showdown_save');
        if (saveData) {
            const data = JSON.parse(saveData);
            this.gold = data.gold || GAME_CONFIG.INITIAL_GOLD;
            this.level = data.level || 1;
            this.exp = data.exp || 0;
            this.cards = data.cards || [];
            this.selectedHero = data.selectedHero || null;
            this.selectedDeck = data.selectedDeck || [];
            this.shopRefreshTime = data.shopRefreshTime || 0;
            this.isFirstShop = data.isFirstShop !== undefined ? data.isFirstShop : true;
            this.pveStage = data.pveStage || 1;
            this.pveProgress = data.pveProgress || 0;
            this.totalBattles = data.totalBattles || 0;
            this.totalWins = data.totalWins || 0;
            this.maxExp = LEVEL_EXP[this.level - 1] || LEVEL_EXP[LEVEL_EXP.length - 1];
            this.updateStats();
        }
    }
    
    // 更新属性（根据英雄卡片）
    updateStats() {
        this.maxHealth = GAME_CONFIG.INITIAL_HEALTH;
        this.attack = GAME_CONFIG.INITIAL_ATTACK;
        this.defense = GAME_CONFIG.INITIAL_DEFENSE;
        
        // 应用英雄被动加成
        if (this.selectedHero) {
            const heroCard = ALL_CARDS[this.selectedHero];
            if (heroCard && heroCard.passive) {
                if (heroCard.passive.health) this.maxHealth += heroCard.passive.health;
                if (heroCard.passive.attack) this.attack += heroCard.passive.attack;
                if (heroCard.passive.defense) this.defense += heroCard.passive.defense;
            }
        }
        
        // 等级加成
        this.maxHealth += (this.level - 1) * 5;
        this.attack += (this.level - 1) * 2;
        this.defense += Math.floor((this.level - 1) * 1);
        
        this.health = this.maxHealth;
    }
    
    // 添加金币
    addGold(amount) {
        this.gold += amount;
        this.save();
        UI.updatePlayerInfo();
    }
    
    // 花费金币
    spendGold(amount) {
        if (this.gold >= amount) {
            this.gold -= amount;
            this.save();
            UI.updatePlayerInfo();
            return true;
        }
        return false;
    }
    
    // 添加经验
    addExp(amount) {
        this.exp += amount;
        
        // 检查升级
        while (this.exp >= this.maxExp && this.level < LEVEL_EXP.length) {
            this.exp -= this.maxExp;
            this.level++;
            this.maxExp = LEVEL_EXP[this.level - 1] || LEVEL_EXP[LEVEL_EXP.length - 1];
            this.updateStats();
            this.health = this.maxHealth;
            
            // 升级提示
            UI.showNotification(`🎉 恭喜升级！当前等级: ${this.level}`, 'success');
            UI.showLevelUpEffect();
        }
        
        this.save();
        UI.updatePlayerInfo();
    }
    
    // 添加卡片
    addCard(cardId) {
        this.cards.push(cardId);
        this.save();
        
        // 检查是否是稀有卡片
        const card = ALL_CARDS[cardId];
        if (card && (card.quality === 'gold' || card.quality === 'red')) {
            UI.showRareCardEffect();
        }
    }
    
    // 移除卡片
    removeCard(cardId) {
        const index = this.cards.indexOf(cardId);
        if (index > -1) {
            this.cards.splice(index, 1);
            this.save();
            return true;
        }
        return false;
    }
    
    // 检查是否拥有卡片
    hasCard(cardId) {
        return this.cards.includes(cardId);
    }
    
    // 获取拥有的卡片详情
    getOwnedCards() {
        return this.cards.map(id => ALL_CARDS[id]).filter(card => card);
    }
    
    // 获取拥有的英雄卡片
    getOwnedHeroCards() {
        return this.getOwnedCards().filter(card => card.type === 'hero');
    }
    
    // 获取拥有的战斗技能卡片
    getOwnedBattleCards() {
        return this.getOwnedCards().filter(card => card.type === 'battle');
    }
    
    // 获取拥有的附加技能卡片
    getOwnedSupportCards() {
        return this.getOwnedCards().filter(card => card.type === 'support');
    }
    
    // 选择英雄卡片
    selectHero(cardId) {
        if (cardId && !this.hasCard(cardId)) return false;
        this.selectedHero = cardId;
        this.updateStats();
        this.save();
        return true;
    }
    
    // 添加到战斗卡组
    addToDeck(cardId) {
        if (this.selectedDeck.length >= GAME_CONFIG.MAX_DECK_SIZE) return false;
        if (this.selectedDeck.includes(cardId)) return false;
        if (!this.hasCard(cardId)) return false;
        
        const card = ALL_CARDS[cardId];
        if (!card || card.type !== 'battle') return false;
        
        this.selectedDeck.push(cardId);
        this.save();
        return true;
    }
    
    // 从卡组移除
    removeFromDeck(cardId) {
        const index = this.selectedDeck.indexOf(cardId);
        if (index > -1) {
            this.selectedDeck.splice(index, 1);
            this.save();
            return true;
        }
        return false;
    }
    
    // 清空卡组
    clearDeck() {
        this.selectedDeck = [];
        this.save();
    }
    
    // 获取战斗卡组详情
    getDeckCards() {
        return this.selectedDeck.map(id => ALL_CARDS[id]).filter(card => card);
    }
    
    // 检查商店是否需要刷新
    shouldRefreshShop() {
        const now = Date.now();
        return (now - this.shopRefreshTime) >= GAME_CONFIG.SHOP_REFRESH_INTERVAL;
    }
    
    // 更新商店刷新时间
    updateShopRefreshTime() {
        this.shopRefreshTime = Date.now();
        this.save();
    }
    
    // 获取下次刷新时间
    getNextRefreshTime() {
        return this.shopRefreshTime + GAME_CONFIG.SHOP_REFRESH_INTERVAL;
    }
    
    // 记录战斗
    recordBattle(isWin) {
        this.totalBattles++;
        if (isWin) this.totalWins++;
        this.save();
    }
    
    // 获取胜率
    getWinRate() {
        if (this.totalBattles === 0) return 0;
        return Math.round((this.totalWins / this.totalBattles) * 100);
    }
    
    // 重置游戏
    reset() {
        this.gold = GAME_CONFIG.INITIAL_GOLD;
        this.level = 1;
        this.exp = 0;
        this.maxExp = LEVEL_EXP[0];
        this.health = GAME_CONFIG.INITIAL_HEALTH;
        this.maxHealth = GAME_CONFIG.INITIAL_HEALTH;
        this.attack = GAME_CONFIG.INITIAL_ATTACK;
        this.defense = GAME_CONFIG.INITIAL_DEFENSE;
        this.cards = [];
        this.selectedHero = null;
        this.selectedDeck = [];
        this.shopRefreshTime = 0;
        this.isFirstShop = true;
        this.pveStage = 1;
        this.pveProgress = 0;
        this.totalBattles = 0;
        this.totalWins = 0;
        this.save();
    }
}

// 创建全局玩家实例
const player = new Player();
