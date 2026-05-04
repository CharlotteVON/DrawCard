// 战斗系统

class Battle {
    constructor() {
        this.isActive = false;
        this.currentEnemy = null;
        this.playerHealth = 0;
        this.playerMaxHealth = 0;
        this.playerAttack = 0;
        this.playerDefense = 0;
        this.enemyHealth = 0;
        this.enemyMaxHealth = 0;
        this.enemyAttack = 0;
        this.enemyDefense = 0;
        this.turnNumber = 0;
        this.currentSP = 0; // 当前技能点
        this.maxSP = GAME_CONFIG.SP_MAX;
        this.handCards = []; // 手牌
        this.deckCards = []; // 牌库
        this.discardPile = []; // 弃牌堆
        this.playerBuffs = []; // 玩家增益效果
        this.enemyBuffs = []; // 敌人增益效果
        this.playerShield = 0; // 玩家护盾
        this.enemyShield = 0; // 敌人护盾
        this.isPlayerTurn = true;
        this.battleLog = [];
        this.selectedDeck = []; // 选中的战斗卡组
        this.heroCard = null; // 选中的英雄卡片
        this.isPVE = false;
        this.pveStage = null;
        this.currentEnemyIndex = 0;
        this.enemies = [];
        this.bossEnemy = null;
        this.accumulatingSP = false; // 是否累积技能点模式
    }
    
    // 初始化战斗
    init(isPVE = false, stageId = 1) {
        this.isActive = true;
        this.isPVE = isPVE;
        this.turnNumber = 0;
        this.currentSP = 0;
        this.handCards = [];
        this.discardPile = [];
        this.playerBuffs = [];
        this.enemyBuffs = [];
        this.playerShield = 0;
        this.enemyShield = 0;
        this.battleLog = [];
        this.isPlayerTurn = true;
        this.accumulatingSP = false;
        
        // 设置玩家属性
        this.playerHealth = player.health;
        this.playerMaxHealth = player.maxHealth;
        this.playerAttack = player.attack;
        this.playerDefense = player.defense;
        
        // 设置卡组
        this.selectedDeck = [...player.selectedDeck];
        this.heroCard = player.selectedHero;
        
        // 初始化牌库（复制卡组并打乱）
        this.deckCards = this.shuffleArray([...this.selectedDeck]);
        
        // 设置PVE敌人
        if (isPVE) {
            this.setupPVEEnemies(stageId);
        }
        
        // 开始第一回合
        this.startNewTurn();
    }
    
    // 设置PVE敌人
    setupPVEEnemies(stageId) {
        const stage = PVE_STAGES.find(s => s.id === stageId) || PVE_STAGES[0];
        this.pveStage = stage;
        this.currentEnemyIndex = 0;
        
        // 设置普通敌人
        this.enemies = stage.enemies.map(enemyId => {
            const enemy = { ...ENEMIES[enemyId] };
            enemy.health = Math.floor(enemy.health * stage.difficulty);
            enemy.maxHealth = enemy.health;
            enemy.attack = Math.floor(enemy.attack * stage.difficulty);
            enemy.defense = Math.floor(enemy.defense * stage.difficulty);
            return enemy;
        });
        
        // 设置Boss
        if (stage.boss) {
            this.bossEnemy = { ...ENEMIES[stage.boss] };
            this.bossEnemy.health = Math.floor(this.bossEnemy.health * stage.difficulty);
            this.bossEnemy.maxHealth = this.bossEnemy.health;
            this.bossEnemy.attack = Math.floor(this.bossEnemy.attack * stage.difficulty);
            this.bossEnemy.defense = Math.floor(this.bossEnemy.defense * stage.difficulty);
        }
        
        // 设置第一个敌人
        this.setEnemy(this.enemies[0]);
    }
    
    // 设置当前敌人
    setEnemy(enemy) {
        this.currentEnemy = enemy;
        this.enemyHealth = enemy.health;
        this.enemyMaxHealth = enemy.maxHealth;
        this.enemyAttack = enemy.attack;
        this.enemyDefense = enemy.defense;
        this.enemyBuffs = [];
        this.enemyShield = 0;
        
        this.addLog(`遭遇 ${enemy.name}！`, 'system-info');
        this.updateUI();
    }
    
    // 洗牌
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
    
    // 开始新回合
    startNewTurn() {
        this.turnNumber++;
        this.isPlayerTurn = true;
        
        // 处理玩家状态效果
        this.processPlayerBuffs();
        
        // 处理敌人状态效果
        this.processEnemyBuffs();
        
        // 检查敌人是否死亡（从状态效果）
        if (this.enemyHealth <= 0) {
            this.onEnemyDeath();
            return;
        }
        
        // 检查玩家是否死亡（从状态效果）
        if (this.playerHealth <= 0) {
            this.onPlayerDeath();
            return;
        }
        
        // 技能点处理
        if (!this.accumulatingSP) {
            // 重置模式：每回合重新投掷
            this.currentSP = 0;
        }
        // 累积模式：保持当前技能点，只有为1时才能投掷
        
        // 抽牌
        this.drawCards(3);
        
        this.addLog(`=== 回合 ${this.turnNumber} ===`, 'system-info');
        this.updateUI();
        
        // 显示回合提示
        UI.showTurnIndicator(`回合 ${this.turnNumber}`);
    }
    
    // 投掷技能点
    rollSkillPoints() {
        if (!this.isPlayerTurn || !this.isActive) return;
        
        if (this.accumulatingSP && this.currentSP > 1) {
            UI.showNotification('累积模式下，技能点大于1时不能投掷', 'error');
            return;
        }
        
        // 随机1-6点
        const roll = Math.floor(Math.random() * 6) + 1;
        
        if (this.accumulatingSP) {
            this.currentSP += roll;
        } else {
            this.currentSP = roll;
        }
        
        // 限制最大值
        this.currentSP = Math.min(this.currentSP, this.maxSP);
        
        this.addLog(`投掷技能点: ${roll}，当前技能点: ${this.currentSP}`, 'info');
        
        // 更新UI
        this.updateUI();
        
        // 显示骰子动画
        this.showDiceAnimation(roll);
    }
    
    // 显示骰子动画
    showDiceAnimation(value) {
        const diceContainer = document.createElement('div');
        diceContainer.className = 'dice-container';
        diceContainer.innerHTML = `<div class="dice rolling">${value}</div>`;
        
        const battleInfo = document.querySelector('.battle-info');
        if (battleInfo) {
            battleInfo.prepend(diceContainer);
            setTimeout(() => diceContainer.remove(), 1000);
        }
    }
    
    // 抽牌
    drawCards(count) {
        for (let i = 0; i < count; i++) {
            if (this.deckCards.length === 0) {
                // 牌库为空，将弃牌堆洗入牌库
                if (this.discardPile.length === 0) break;
                this.deckCards = this.shuffleArray([...this.discardPile]);
                this.discardPile = [];
                this.addLog('牌库已空，弃牌堆已洗入牌库', 'info');
            }
            
            const cardId = this.deckCards.pop();
            this.handCards.push(cardId);
        }
        
        this.updateHandCards();
    }
    
    // 使用卡牌
    playCard(cardId) {
        if (!this.isPlayerTurn || !this.isActive) return;
        
        const cardIndex = this.handCards.indexOf(cardId);
        if (cardIndex === -1) return;
        
        const card = ALL_CARDS[cardId];
        if (!card) return;
        
        // 检查技能点
        if (card.cost > this.currentSP) {
            UI.showNotification(`技能点不足！需要 ${card.cost} 点`, 'error');
            return;
        }
        
        // 消耗技能点
        this.currentSP -= card.cost;
        
        // 从手牌移除
        this.handCards.splice(cardIndex, 1);
        
        // 应用卡牌效果
        this.applyCardEffect(card);
        
        // 将卡牌放入弃牌堆
        this.discardPile.push(cardId);
        
        // 更新UI
        this.updateUI();
        this.updateHandCards();
        
        // 检查敌人是否死亡
        if (this.enemyHealth <= 0) {
            this.onEnemyDeath();
        }
    }
    
    // 应用卡牌效果
    applyCardEffect(card) {
        let totalDamage = 0;
        let totalHeal = 0;
        
        // 基础伤害
        if (card.damage > 0) {
            let damage = card.damage + this.playerAttack;
            
            // 应用增益效果
            const attackBuff = this.playerBuffs.find(b => b.stat === 'attack');
            if (attackBuff) {
                damage += attackBuff.value;
            }
            
            // 全属性增益
            const allBuff = this.playerBuffs.find(b => b.type === 'buff_all');
            if (allBuff) {
                damage = Math.floor(damage * (1 + allBuff.value));
            }
            
            // 计算护甲穿透
            let effectiveDefense = this.enemyDefense;
            if (card.effect && card.effect.type === 'armor_pen') {
                effectiveDefense = Math.floor(effectiveDefense * (1 - card.effect.value));
            }
            
            // 减去防御
            damage = Math.max(1, damage - effectiveDefense);
            
            // 检查暴击
            if (card.effect && card.effect.type === 'crit') {
                if (Math.random() < card.effect.chance) {
                    damage *= card.effect.multiplier;
                    this.addLog('💥 暴击！', 'damage');
                }
            }
            
            // 随机伤害
            if (card.effect && card.effect.type === 'random_damage') {
                const multiplier = card.effect.min + Math.random() * (card.effect.max - card.effect.min);
                damage = Math.floor(damage * multiplier);
            }
            
            // 应用护盾
            if (this.enemyShield > 0) {
                const shieldAbsorb = Math.min(this.enemyShield, damage);
                this.enemyShield -= shieldAbsorb;
                damage -= shieldAbsorb;
                if (shieldAbsorb > 0) {
                    this.addLog(`护盾吸收了 ${shieldAbsorb} 点伤害`, 'info');
                }
            }
            
            // 造成伤害
            this.enemyHealth = Math.max(0, this.enemyHealth - damage);
            totalDamage = damage;
            
            this.addLog(`${card.name} 造成 ${damage} 点伤害`, 'damage');
            UI.showDamageNumber(damage, 'enemy');
        }
        
        // 治疗效果
        if (card.heal) {
            const healAmount = card.heal;
            this.playerHealth = Math.min(this.playerMaxHealth, this.playerHealth + healAmount);
            totalHeal = healAmount;
            
            this.addLog(`${card.name} 恢复 ${healAmount} 点生命`, 'heal');
            UI.showDamageNumber(healAmount, 'player', true);
        }
        
        // 防御效果
        if (card.defense) {
            this.playerShield += card.defense;
            this.addLog(`${card.name} 获得 ${card.defense} 点护盾`, 'info');
        }
        
        // 特殊效果
        if (card.effect) {
            this.applySpecialEffect(card.effect, card.name);
        }
        
        // 吸血效果
        if (card.effect && card.effect.type === 'lifesteal' && totalDamage > 0) {
            const healAmount = Math.floor(totalDamage * card.effect.value);
            this.playerHealth = Math.min(this.playerMaxHealth, this.playerHealth + healAmount);
            this.addLog(`吸血恢复 ${healAmount} 点生命`, 'heal');
        }
    }
    
    // 应用特殊效果
    applySpecialEffect(effect, cardName) {
        switch (effect.type) {
            case 'burn':
                if (Math.random() < effect.chance) {
                    this.enemyBuffs.push({
                        type: 'burn',
                        damage: effect.damage,
                        duration: effect.duration,
                        name: '灼烧'
                    });
                    this.addLog(`${cardName} 使敌人灼烧！`, 'info');
                }
                break;
                
            case 'freeze':
                if (Math.random() < effect.chance) {
                    this.enemyBuffs.push({
                        type: 'freeze',
                        duration: effect.duration,
                        name: '冻结'
                    });
                    this.addLog(`${cardName} 冻结了敌人！`, 'info');
                }
                break;
                
            case 'poison':
                this.enemyBuffs.push({
                    type: 'poison',
                    damage: effect.damage,
                    duration: effect.duration,
                    name: '中毒'
                });
                this.addLog(`${cardName} 使敌人中毒！`, 'info');
                break;
                
            case 'stun':
                if (Math.random() < effect.chance) {
                    this.enemyBuffs.push({
                        type: 'stun',
                        duration: effect.duration,
                        name: '眩晕'
                    });
                    this.addLog(`${cardName} 眩晕了敌人！`, 'info');
                }
                break;
                
            case 'buff':
                this.playerBuffs.push({
                    type: 'buff',
                    stat: effect.stat,
                    value: effect.value,
                    duration: effect.duration,
                    name: effect.stat === 'attack' ? '力量增益' : '防御增益'
                });
                this.addLog(`${cardName} 获得了增益效果！`, 'info');
                break;
                
            case 'shield':
                this.playerShield += effect.value;
                this.addLog(`${cardName} 获得 ${effect.value} 点护盾`, 'info');
                break;
                
            case 'buff_all':
                this.playerBuffs.push({
                    type: 'buff_all',
                    value: effect.value,
                    duration: effect.duration,
                    name: '全属性增益'
                });
                this.addLog(`${cardName} 全属性提升！`, 'info');
                break;
                
            case 'extra_turn':
                this.addLog(`${cardName} 获得额外回合！`, 'info');
                // 额外回合通过不结束回合实现
                break;
        }
    }
    
    // 处理玩家增益效果
    processPlayerBuffs() {
        const expiredBuffs = [];
        
        this.playerBuffs.forEach((buff, index) => {
            // 处理持续伤害效果（对敌人的debuff在敌人回合处理）
            
            // 减少持续时间
            buff.duration--;
            
            if (buff.duration <= 0) {
                expiredBuffs.push(index);
            }
        });
        
        // 移除过期效果
        for (let i = expiredBuffs.length - 1; i >= 0; i--) {
            const removed = this.playerBuffs.splice(expiredBuffs[i], 1)[0];
            this.addLog(`${removed.name} 效果已结束`, 'info');
        }
    }
    
    // 处理敌人增益效果
    processEnemyBuffs() {
        const expiredBuffs = [];
        
        this.enemyBuffs.forEach((buff, index) => {
            // 处理持续伤害
            if (buff.type === 'burn' || buff.type === 'poison') {
                this.enemyHealth = Math.max(0, this.enemyHealth - buff.damage);
                this.addLog(`${this.currentEnemy.name} 受到 ${buff.name} ${buff.damage} 点伤害`, 'damage');
                UI.showDamageNumber(buff.damage, 'enemy');
            }
            
            // 减少持续时间
            buff.duration--;
            
            if (buff.duration <= 0) {
                expiredBuffs.push(index);
            }
        });
        
        // 移除过期效果
        for (let i = expiredBuffs.length - 1; i >= 0; i--) {
            const removed = this.enemyBuffs.splice(expiredBuffs[i], 1)[0];
            this.addLog(`${this.currentEnemy.name} 的 ${removed.name} 效果已结束`, 'info');
        }
    }
    
    // 结束回合
    endTurn() {
        if (!this.isPlayerTurn || !this.isActive) return;
        
        this.isPlayerTurn = false;
        this.addLog('玩家回合结束', 'info');
        
        // 敌人回合
        setTimeout(() => {
            this.enemyTurn();
        }, 1000);
    }
    
    // 累积技能点
    accumulateSP() {
        if (!this.isPlayerTurn || !this.isActive) return;
        
        if (this.currentSP !== 1) {
            UI.showNotification('只有技能点为1时才能累积', 'error');
            return;
        }
        
        this.accumulatingSP = true;
        this.addLog('选择累积技能点模式', 'info');
        this.endTurn();
    }
    
    // 敌人回合
    enemyTurn() {
        this.addLog(`${this.currentEnemy.name} 的回合`, 'system-info');
        
        // 检查是否被控制
        const isStunned = this.enemyBuffs.some(b => b.type === 'stun' || b.type === 'freeze');
        
        if (isStunned) {
            this.addLog(`${this.currentEnemy.name} 无法行动！`, 'info');
        } else {
            // 敌人AI行动
            this.enemyAction();
        }
        
        // 回合结束，开始新回合
        setTimeout(() => {
            this.startNewTurn();
        }, 1500);
    }
    
    // 敌人行动
    enemyAction() {
        const enemy = this.currentEnemy;
        if (!enemy.skills || enemy.skills.length === 0) {
            // 普通攻击
            this.enemyAttackAction(enemy.attack);
            return;
        }
        
        // 随机选择技能
        const skillId = enemy.skills[Math.floor(Math.random() * enemy.skills.length)];
        const skill = ENEMY_SKILLS[skillId];
        
        if (!skill) {
            this.enemyAttackAction(enemy.attack);
            return;
        }
        
        this.addLog(`${enemy.name} 使用了 ${skill.name}`, 'enemy-action');
        
        // 造成伤害
        if (skill.damage > 0) {
            let damage = skill.damage;
            
            // 应用敌人增益
            const attackBuff = this.enemyBuffs.find(b => b.stat === 'attack');
            if (attackBuff) {
                damage += attackBuff.value;
            }
            
            // 减去玩家防御
            let effectiveDefense = this.playerDefense;
            const defenseBuff = this.playerBuffs.find(b => b.stat === 'defense');
            if (defenseBuff) {
                effectiveDefense += defenseBuff.value;
            }
            
            damage = Math.max(1, damage - effectiveDefense);
            
            // 应用护盾
            if (this.playerShield > 0) {
                const shieldAbsorb = Math.min(this.playerShield, damage);
                this.playerShield -= shieldAbsorb;
                damage -= shieldAbsorb;
            }
            
            this.playerHealth = Math.max(0, this.playerHealth - damage);
            this.addLog(`${enemy.name} 造成 ${damage} 点伤害`, 'damage');
            UI.showDamageNumber(damage, 'player');
        }
        
        // 特殊效果
        if (skill.buff) {
            this.enemyBuffs.push({
                type: 'buff',
                stat: 'attack',
                value: skill.buff.attack,
                duration: skill.buff.duration,
                name: '攻击增益'
            });
            this.addLog(`${enemy.name} 攻击力提升！`, 'info');
        }
        
        if (skill.defense) {
            this.enemyBuffs.push({
                type: 'buff',
                stat: 'defense',
                value: skill.defense,
                duration: skill.duration,
                name: '防御增益'
            });
            this.addLog(`${enemy.name} 防御力提升！`, 'info');
        }
        
        if (skill.dodge) {
            this.enemyBuffs.push({
                type: 'dodge',
                chance: skill.dodge,
                duration: skill.duration,
                name: '闪避'
            });
            this.addLog(`${enemy.name} 进入闪避状态！`, 'info');
        }
        
        if (skill.burn) {
            this.playerBuffs.push({
                type: 'burn',
                damage: skill.burn.damage,
                duration: skill.burn.duration,
                name: '灼烧'
            });
            this.addLog(`玩家被灼烧！`, 'info');
        }
        
        // 检查玩家是否死亡
        if (this.playerHealth <= 0) {
            this.onPlayerDeath();
        }
        
        this.updateUI();
    }
    
    // 敌人普通攻击
    enemyAttackAction(damage) {
        let effectiveDefense = this.playerDefense;
        const defenseBuff = this.playerBuffs.find(b => b.stat === 'defense');
        if (defenseBuff) {
            effectiveDefense += defenseBuff.value;
        }
        
        damage = Math.max(1, damage - effectiveDefense);
        
        // 应用护盾
        if (this.playerShield > 0) {
            const shieldAbsorb = Math.min(this.playerShield, damage);
            this.playerShield -= shieldAbsorb;
            damage -= shieldAbsorb;
        }
        
        this.playerHealth = Math.max(0, this.playerHealth - damage);
        this.addLog(`${this.currentEnemy.name} 攻击造成 ${damage} 点伤害`, 'damage');
        UI.showDamageNumber(damage, 'player');
        
        if (this.playerHealth <= 0) {
            this.onPlayerDeath();
        }
        
        this.updateUI();
    }
    
    // 敌人死亡
    onEnemyDeath() {
        this.addLog(`${this.currentEnemy.name} 被击败！`, 'system-info');
        
        // 检查是否还有敌人
        this.currentEnemyIndex++;
        
        if (this.currentEnemyIndex < this.enemies.length) {
            // 下一个普通敌人
            setTimeout(() => {
                this.setEnemy(this.enemies[this.currentEnemyIndex]);
                this.startNewTurn();
            }, 1500);
        } else if (this.bossEnemy && this.currentEnemyIndex === this.enemies.length) {
            // Boss战
            setTimeout(() => {
                this.setEnemy(this.bossEnemy);
                this.bossEnemy = null; // 防止重复触发
                this.startNewTurn();
            }, 1500);
        } else {
            // 战斗胜利
            this.onBattleVictory();
        }
    }
    
    // 玩家死亡
    onPlayerDeath() {
        this.addLog('玩家被击败...', 'system-info');
        this.isActive = false;
        
        setTimeout(() => {
            this.endBattle(false);
        }, 1500);
    }
    
    // 战斗胜利
    onBattleVictory() {
        this.isActive = false;
        this.addLog('🎉 战斗胜利！', 'system-info');
        
        setTimeout(() => {
            this.endBattle(true);
        }, 1500);
    }
    
    // 结束战斗
    endBattle(isVictory) {
        let expReward = 0;
        let goldReward = 0;
        let cardReward = null;
        
        if (isVictory) {
            // 计算奖励
            if (this.isPVE && this.pveStage) {
                const stage = this.pveStage;
                expReward = Math.floor(50 * stage.difficulty);
                goldReward = Math.floor(30 * stage.difficulty);
                
                // Boss卡片掉落
                if (stage.boss && Math.random() < GAME_CONFIG.PVE_BOSS_CARD_CHANCE) {
                    cardReward = cardSystem.getRandomCard();
                }
            } else {
                expReward = 30;
                goldReward = 20;
            }
            
            // 应用奖励
            player.addExp(expReward);
            player.addGold(goldReward);
            
            if (cardReward) {
                player.addCard(cardReward);
            }
            
            player.recordBattle(true);
            
            // 更新PVE进度
            if (this.isPVE && this.pveStage) {
                if (player.pveStage <= this.pveStage.id) {
                    player.pveStage = Math.min(player.pveStage + 1, PVE_STAGES.length);
                    player.pveProgress = 0;
                }
                player.save();
            }
        } else {
            player.recordBattle(false);
            expReward = 10; // 失败也给少量经验
            player.addExp(expReward);
        }
        
        // 显示结算界面
        this.showBattleResult(isVictory, expReward, goldReward, cardReward);
    }
    
    // 显示战斗结算
    showBattleResult(isVictory, exp, gold, card) {
        const resultTitle = document.getElementById('result-title');
        const rewardExp = document.getElementById('reward-exp');
        const rewardGold = document.getElementById('reward-gold');
        const rewardCard = document.getElementById('reward-card');
        
        if (resultTitle) {
            resultTitle.textContent = isVictory ? '🎉 战斗胜利！' : '💀 战斗失败';
            resultTitle.style.color = isVictory ? 'var(--gold-color)' : 'var(--danger-color)';
        }
        
        if (rewardExp) rewardExp.textContent = exp;
        if (rewardGold) rewardGold.textContent = gold;
        
        if (rewardCard) {
            if (card) {
                const cardData = ALL_CARDS[card];
                rewardCard.innerHTML = `
                    <p style="margin-bottom: 10px;">获得卡片：</p>
                    <div class="card quality-${cardData.quality}" style="display: inline-block; padding: 10px;">
                        <span class="card-name">${cardData.name}</span>
                        <span class="card-quality ${cardData.quality}">${cardSystem.getQualityInfo(cardData.quality).name}</span>
                    </div>
                `;
            } else {
                rewardCard.innerHTML = '';
            }
        }
        
        // 切换到结算界面
        Game.switchScreen('battle-result-screen');
    }
    
    // 添加战斗日志
    addLog(message, type = 'info') {
        this.battleLog.push({ message, type, time: Date.now() });
        
        const logContainer = document.getElementById('battle-log');
        if (logContainer) {
            const logEntry = document.createElement('p');
            logEntry.className = `log-entry ${type}`;
            logEntry.textContent = message;
            logContainer.appendChild(logEntry);
            logContainer.scrollTop = logContainer.scrollHeight;
        }
    }
    
    // 更新UI
    updateUI() {
        // 更新玩家血量
        const playerHealthBar = document.getElementById('player-health-bar');
        const playerHealthText = document.getElementById('player-health-text');
        if (playerHealthBar && playerHealthText) {
            const healthPercent = (this.playerHealth / this.playerMaxHealth) * 100;
            playerHealthBar.style.width = `${healthPercent}%`;
            playerHealthText.textContent = `${this.playerHealth}/${this.playerMaxHealth}`;
            
            // 更新血条颜色
            playerHealthBar.className = 'health-fill';
            if (healthPercent < 30) {
                playerHealthBar.classList.add('low');
            } else if (healthPercent < 60) {
                playerHealthBar.classList.add('medium');
            }
        }
        
        // 更新敌人血量
        const enemyHealthBar = document.getElementById('enemy-health-bar');
        const enemyHealthText = document.getElementById('enemy-health-text');
        if (enemyHealthBar && enemyHealthText) {
            const healthPercent = (this.enemyHealth / this.enemyMaxHealth) * 100;
            enemyHealthBar.style.width = `${healthPercent}%`;
            enemyHealthText.textContent = `${this.enemyHealth}/${this.enemyMaxHealth}`;
            
            enemyHealthBar.className = 'health-fill';
            if (healthPercent < 30) {
                enemyHealthBar.classList.add('low');
            } else if (healthPercent < 60) {
                enemyHealthBar.classList.add('medium');
            }
        }
        
        // 更新敌人名称
        const enemyName = document.getElementById('enemy-name');
        if (enemyName && this.currentEnemy) {
            enemyName.textContent = `${this.currentEnemy.icon} ${this.currentEnemy.name}`;
        }
        
        // 更新回合数
        const turnNumber = document.getElementById('turn-number');
        if (turnNumber) {
            turnNumber.textContent = `回合 ${this.turnNumber}`;
        }
        
        // 更新技能点
        const currentSP = document.getElementById('current-sp');
        if (currentSP) {
            currentSP.textContent = this.currentSP;
        }
        
        // 更新按钮状态
        const btnRollSP = document.getElementById('btn-roll-sp');
        const btnEndTurn = document.getElementById('btn-end-turn');
        const btnAccumulate = document.getElementById('btn-accumulate');
        
        if (btnRollSP) {
            btnRollSP.disabled = !this.isPlayerTurn || !this.isActive;
            if (this.accumulatingSP && this.currentSP > 1) {
                btnRollSP.disabled = true;
            }
        }
        
        if (btnEndTurn) {
            btnEndTurn.disabled = !this.isPlayerTurn || !this.isActive;
        }
        
        if (btnAccumulate) {
            btnAccumulate.style.display = this.currentSP === 1 && this.isPlayerTurn ? 'inline-block' : 'none';
        }
        
        // 更新状态效果显示
        this.updateStatusEffects();
    }
    
    // 更新状态效果显示
    updateStatusEffects() {
        // 玩家状态效果
        const playerArea = document.querySelector('.player-battle-info');
        if (playerArea) {
            let buffsHTML = '<div class="active-buffs">';
            this.playerBuffs.forEach(buff => {
                let icon = '';
                switch (buff.type) {
                    case 'burn': icon = '🔥'; break;
                    case 'poison': icon = '🧪'; break;
                    case 'freeze': icon = '❄️'; break;
                    case 'stun': icon = '💫'; break;
                    case 'buff': icon = buff.stat === 'attack' ? '⚔️' : '🛡️'; break;
                    case 'buff_all': icon = '✨'; break;
                    case 'dodge': icon = '💨'; break;
                    default: icon = '🔵';
                }
                buffsHTML += `
                    <div class="buff-icon" title="${buff.name} (${buff.duration}回合)">
                        ${icon}
                        <span class="buff-duration">${buff.duration}</span>
                    </div>
                `;
            });
            if (this.playerShield > 0) {
                buffsHTML += `
                    <div class="buff-icon" title="护盾: ${this.playerShield}">
                        🛡️
                        <span class="buff-duration">${this.playerShield}</span>
                    </div>
                `;
            }
            buffsHTML += '</div>';
            
            // 移除旧的buffs显示
            const oldBuffs = playerArea.querySelector('.active-buffs');
            if (oldBuffs) oldBuffs.remove();
            
            playerArea.insertAdjacentHTML('beforeend', buffsHTML);
        }
        
        // 敌人状态效果
        const enemyArea = document.querySelector('.enemy-info');
        if (enemyArea) {
            let buffsHTML = '<div class="active-buffs">';
            this.enemyBuffs.forEach(buff => {
                let icon = '';
                switch (buff.type) {
                    case 'burn': icon = '🔥'; break;
                    case 'poison': icon = '🧪'; break;
                    case 'freeze': icon = '❄️'; break;
                    case 'stun': icon = '💫'; break;
                    default: icon = '🔴';
                }
                buffsHTML += `
                    <div class="buff-icon" title="${buff.name} (${buff.duration}回合)">
                        ${icon}
                        <span class="buff-duration">${buff.duration}</span>
                    </div>
                `;
            });
            if (this.enemyShield > 0) {
                buffsHTML += `
                    <div class="buff-icon" title="护盾: ${this.enemyShield}">
                        🛡️
                        <span class="buff-duration">${this.enemyShield}</span>
                    </div>
                `;
            }
            buffsHTML += '</div>';
            
            const oldBuffs = enemyArea.querySelector('.active-buffs');
            if (oldBuffs) oldBuffs.remove();
            
            enemyArea.insertAdjacentHTML('beforeend', buffsHTML);
        }
    }
    
    // 更新手牌显示
    updateHandCards() {
        const playerCardsContainer = document.getElementById('player-cards');
        if (!playerCardsContainer) return;
        
        playerCardsContainer.innerHTML = '';
        
        this.handCards.forEach(cardId => {
            const card = ALL_CARDS[cardId];
            if (!card) return;
            
            const isPlayable = card.cost <= this.currentSP && this.isPlayerTurn;
            
            const cardElement = cardSystem.createBattleCardElement(cardId, {
                isPlayable: isPlayable,
                onClick: (id) => this.playCard(id)
            });
            
            playerCardsContainer.appendChild(cardElement);
        });
    }
    
    // 开始战斗准备
    static prepareBattle(isPVE = false, stageId = 1) {
        // 检查是否有卡组
        if (player.selectedDeck.length === 0) {
            UI.showNotification('请先在背包中设置战斗卡组！', 'error');
            return;
        }
        
        // 渲染英雄选择
        const heroCardsContainer = document.getElementById('hero-cards');
        if (heroCardsContainer) {
            heroCardsContainer.innerHTML = '';
            
            const heroCards = player.getOwnedHeroCards();
            heroCards.forEach(card => {
                const isSelected = player.selectedHero === card.id;
                const cardElement = cardSystem.createCardElement(card.id, {
                    isSelectable: true,
                    isSelected: isSelected,
                    onClick: (id) => {
                        if (player.selectedHero === id) {
                            player.selectHero(null);
                        } else {
                            player.selectHero(id);
                        }
                        Battle.prepareBattle(isPVE, stageId);
                    }
                });
                heroCardsContainer.appendChild(cardElement);
            });
            
            if (heroCards.length === 0) {
                heroCardsContainer.innerHTML = '<p style="color: var(--text-secondary);">暂无英雄卡片</p>';
            }
        }
        
        // 渲染卡组
        const deckCardsContainer = document.getElementById('deck-cards');
        if (deckCardsContainer) {
            deckCardsContainer.innerHTML = '';
            
            const deckCards = player.getDeckCards();
            deckCards.forEach(card => {
                const cardElement = cardSystem.createCardElement(card.id, {
                    onClick: (id) => {
                        player.removeFromDeck(id);
                        Battle.prepareBattle(isPVE, stageId);
                    }
                });
                deckCardsContainer.appendChild(cardElement);
            });
        }
        
        // 更新选中信息
        const selectedHero = document.getElementById('selected-hero');
        const selectedSkills = document.getElementById('selected-skills');
        
        if (selectedHero) {
            selectedHero.textContent = player.selectedHero ? ALL_CARDS[player.selectedHero].name : '无';
        }
        if (selectedSkills) {
            selectedSkills.textContent = player.selectedDeck.length;
        }
        
        // 存储战斗参数
        Game.pendingBattle = { isPVE, stageId };
        
        // 切换到准备界面
        Game.switchScreen('battle-prep-screen');
    }
    
    // 开始战斗
    static startBattle() {
        if (!Game.pendingBattle) return;
        
        const { isPVE, stageId } = Game.pendingBattle;
        
        // 切换到战斗界面
        Game.switchScreen('battle-screen');
        
        // 清空战斗日志
        const logContainer = document.getElementById('battle-log');
        if (logContainer) logContainer.innerHTML = '';
        
        // 初始化战斗
        battle.init(isPVE, stageId);
    }
}

// 创建全局战斗实例
const battle = new Battle();
