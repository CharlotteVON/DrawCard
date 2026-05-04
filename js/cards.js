// 卡片系统

class CardSystem {
    constructor() {
        // 卡片系统初始化
    }
    
    // 根据品质随机获取卡片ID
    getRandomCardByQuality(quality) {
        const cardsOfQuality = Object.values(ALL_CARDS).filter(card => card.quality === quality);
        if (cardsOfQuality.length === 0) return null;
        return cardsOfQuality[Math.floor(Math.random() * cardsOfQuality.length)].id;
    }
    
    // 根据掉落率随机获取卡片
    getRandomCard() {
        const random = Math.random();
        let cumulative = 0;
        
        // 按掉落率从低到高排序
        const qualities = Object.entries(CARD_QUALITY).sort((a, b) => a[1].dropRate - b[1].dropRate);
        
        for (const [key, quality] of qualities) {
            cumulative += quality.dropRate;
            if (random <= cumulative) {
                return this.getRandomCardByQuality(key.toLowerCase());
            }
        }
        
        // 默认返回白色卡片
        return this.getRandomCardByQuality('white');
    }
    
    // 获取随机卡片（用于商店刷新）
    getRandomShopCards(count = 5) {
        const cards = [];
        const usedIds = new Set();
        
        for (let i = 0; i < count; i++) {
            let cardId;
            let attempts = 0;
            
            do {
                cardId = this.getRandomCard();
                attempts++;
            } while (usedIds.has(cardId) && attempts < 50);
            
            if (cardId && !usedIds.has(cardId)) {
                cards.push(cardId);
                usedIds.add(cardId);
            }
        }
        
        return cards;
    }
    
    // 获取卡片价格
    getCardPrice(cardId, isFirstShop = false) {
        if (isFirstShop) {
            return GAME_CONFIG.FIRST_SHOP_DISCOUNT;
        }
        
        const card = ALL_CARDS[cardId];
        if (!card) return 0;
        
        return CARD_QUALITY[card.quality.toUpperCase()]?.price || 100;
    }
    
    // 获取卡片品质信息
    getQualityInfo(quality) {
        return CARD_QUALITY[quality.toUpperCase()] || CARD_QUALITY.WHITE;
    }
    
    // 获取卡片类型信息
    getTypeInfo(type) {
        return CARD_TYPE[type.toUpperCase()] || CARD_TYPE.BATTLE;
    }
    
    // 创建卡片HTML元素
    createCardElement(cardId, options = {}) {
        const card = ALL_CARDS[cardId];
        if (!card) return null;
        
        const {
            showPrice = false,
            price = 0,
            isShop = false,
            isBattle = false,
            isSelectable = false,
            isSelected = false,
            isPlayable = false,
            onClick = null,
            onBuy = null
        } = options;
        
        const cardDiv = document.createElement('div');
        cardDiv.className = `card quality-${card.quality} ${isShop ? 'shop-card' : ''} ${isBattle ? 'battle-card' : ''} ${isSelectable ? 'card-selectable' : ''} ${isSelected ? 'selected' : ''} ${isPlayable ? 'playable' : ''}`;
        cardDiv.dataset.cardId = cardId;
        
        const qualityInfo = this.getQualityInfo(card.quality);
        const typeInfo = this.getTypeInfo(card.type);
        
        let statsHtml = '';
        if (card.type === 'battle') {
            if (card.damage > 0) {
                statsHtml += `<div class="stat"><span class="stat-icon">⚔️</span> ${card.damage}</div>`;
            }
            if (card.heal) {
                statsHtml += `<div class="stat"><span class="stat-icon">💚</span> ${card.heal}</div>`;
            }
            if (card.defense) {
                statsHtml += `<div class="stat"><span class="stat-icon">🛡️</span> ${card.defense}</div>`;
            }
            statsHtml += `<div class="stat"><span class="stat-icon">💎</span> ${card.cost}</div>`;
        } else if (card.type === 'hero') {
            if (card.passive) {
                if (card.passive.health) statsHtml += `<div class="stat"><span class="stat-icon">❤️</span> +${card.passive.health}</div>`;
                if (card.passive.attack) statsHtml += `<div class="stat"><span class="stat-icon">⚔️</span> +${card.passive.attack}</div>`;
                if (card.passive.defense) statsHtml += `<div class="stat"><span class="stat-icon">🛡️</span> +${card.passive.defense}</div>`;
            }
        } else {
            statsHtml += `<div class="stat"><span class="stat-icon">💎</span> ${card.cost}</div>`;
        }
        
        cardDiv.innerHTML = `
            <div class="card-header">
                <span class="card-name">${card.name}</span>
                <span class="card-quality ${card.quality}">${qualityInfo.name}</span>
            </div>
            <div class="card-image">${card.icon}</div>
            <div class="card-type">
                <span class="type-icon">${typeInfo.icon}</span>
                <span>${typeInfo.name}</span>
            </div>
            <div class="card-stats">${statsHtml}</div>
            <div class="card-description">${card.description}</div>
            ${showPrice ? `
                <div class="card-price">
                    <span class="price-tag">💰 ${price}</span>
                    ${isShop ? `<button class="buy-btn" data-card-id="${cardId}" ${player.gold < price ? 'disabled' : ''}>购买</button>` : ''}
                </div>
            ` : ''}
        `;
        
        // 绑定点击事件
        if (onClick) {
            cardDiv.addEventListener('click', (e) => {
                if (!e.target.classList.contains('buy-btn')) {
                    onClick(cardId);
                }
            });
        }
        
        // 绑定购买按钮事件
        if (isShop && onBuy) {
            const buyBtn = cardDiv.querySelector('.buy-btn');
            if (buyBtn) {
                buyBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    onBuy(cardId);
                });
            }
        }
        
        return cardDiv;
    }
    
    // 创建战斗卡牌元素
    createBattleCardElement(cardId, options = {}) {
        const card = ALL_CARDS[cardId];
        if (!card) return null;
        
        const {
            isPlayable = false,
            isPlayed = false,
            onClick = null
        } = options;
        
        const cardDiv = document.createElement('div');
        cardDiv.className = `battle-card ${isPlayable ? 'playable' : ''} ${isPlayed ? 'played' : ''}`;
        cardDiv.dataset.cardId = cardId;
        
        let effectText = '';
        if (card.damage > 0) effectText += `⚔️${card.damage} `;
        if (card.heal) effectText += `💚${card.heal} `;
        if (card.defense) effectText += `🛡️${card.defense} `;
        if (card.effect) {
            switch (card.effect.type) {
                case 'burn': effectText += '🔥灼烧'; break;
                case 'freeze': effectText += '❄️冻结'; break;
                case 'poison': effectText += '🧪中毒'; break;
                case 'stun': effectText += '💫眩晕'; break;
                case 'crit': effectText += '💥暴击'; break;
                case 'lifesteal': effectText += '💉吸血'; break;
                case 'buff': effectText += '💪增益'; break;
                case 'shield': effectText += '🛡️护盾'; break;
            }
        }
        
        cardDiv.innerHTML = `
            <div class="card-cost">${card.cost}</div>
            <div class="card-name">${card.name}</div>
            <div class="card-image">${card.icon}</div>
            <div class="card-effect">${effectText}</div>
        `;
        
        if (onClick) {
            cardDiv.addEventListener('click', () => onClick(cardId));
        }
        
        return cardDiv;
    }
    
    // 创建卡片详情HTML
    createCardDetailHTML(cardId) {
        const card = ALL_CARDS[cardId];
        if (!card) return '';
        
        const qualityInfo = this.getQualityInfo(card.quality);
        const typeInfo = this.getTypeInfo(card.type);
        
        let statsHTML = '';
        if (card.type === 'battle') {
            statsHTML = `
                <div class="detail-stats">
                    ${card.damage > 0 ? `
                        <div class="stat">
                            <div class="stat-value">${card.damage}</div>
                            <div class="stat-label">伤害</div>
                        </div>
                    ` : ''}
                    ${card.heal ? `
                        <div class="stat">
                            <div class="stat-value">${card.heal}</div>
                            <div class="stat-label">治疗</div>
                        </div>
                    ` : ''}
                    ${card.defense ? `
                        <div class="stat">
                            <div class="stat-value">${card.defense}</div>
                            <div class="stat-label">防御</div>
                        </div>
                    ` : ''}
                    <div class="stat">
                        <div class="stat-value">${card.cost}</div>
                        <div class="stat-label">费用</div>
                    </div>
                </div>
            `;
        } else if (card.type === 'hero' && card.passive) {
            statsHTML = `
                <div class="detail-stats">
                    ${card.passive.health ? `
                        <div class="stat">
                            <div class="stat-value">+${card.passive.health}</div>
                            <div class="stat-label">生命</div>
                        </div>
                    ` : ''}
                    ${card.passive.attack ? `
                        <div class="stat">
                            <div class="stat-value">+${card.passive.attack}</div>
                            <div class="stat-label">攻击</div>
                        </div>
                    ` : ''}
                    ${card.passive.defense ? `
                        <div class="stat">
                            <div class="stat-value">+${card.passive.defense}</div>
                            <div class="stat-label">防御</div>
                        </div>
                    ` : ''}
                </div>
            `;
        }
        
        let effectHTML = '';
        if (card.effect) {
            effectHTML = '<div class="detail-effect"><strong>特殊效果：</strong><br>';
            switch (card.effect.type) {
                case 'burn':
                    effectHTML += `灼烧：每回合造成${card.effect.damage}点伤害，持续${card.effect.duration}回合`;
                    break;
                case 'freeze':
                    effectHTML += `冻结：使敌人无法行动${card.effect.duration}回合`;
                    break;
                case 'poison':
                    effectHTML += `中毒：每回合造成${card.effect.damage}点伤害，持续${card.effect.duration}回合`;
                    break;
                case 'stun':
                    effectHTML += `眩晕：使敌人无法行动${card.effect.duration}回合`;
                    break;
                case 'crit':
                    effectHTML += `暴击：${card.effect.chance * 100}%概率造成${card.effect.multiplier}倍伤害`;
                    break;
                case 'lifesteal':
                    effectHTML += `吸血：造成伤害的${card.effect.value * 100}%转化为生命恢复`;
                    break;
                case 'buff':
                    effectHTML += `增益：增加${card.effect.value}点${card.effect.stat === 'attack' ? '攻击' : '防御'}，持续${card.effect.duration}回合`;
                    break;
                case 'shield':
                    effectHTML += `护盾：获得${card.effect.value}点护盾值`;
                    break;
                case 'armor_pen':
                    effectHTML += `穿甲：无视敌人${card.effect.value * 100}%防御`;
                    break;
                case 'random_damage':
                    effectHTML += `随机伤害：造成${card.effect.min}到${card.effect.max}倍随机伤害`;
                    break;
                case 'extra_turn':
                    effectHTML += `额外回合：获得一个额外回合`;
                    break;
                case 'buff_all':
                    effectHTML += `全属性增益：所有属性提升${card.effect.value * 100}%，持续${card.effect.duration}回合`;
                    break;
            }
            effectHTML += '</div>';
        }
        
        return `
            <div class="card-detail">
                <div class="detail-image">${card.icon}</div>
                <div class="detail-name">${card.name}</div>
                <span class="detail-quality card-quality ${card.quality}">${qualityInfo.name}</span>
                <div class="detail-type">${typeInfo.icon} ${typeInfo.name}</div>
                ${statsHTML}
                ${effectHTML}
                <div class="detail-description">${card.description}</div>
            </div>
        `;
    }
}

// 创建全局卡片系统实例
const cardSystem = new CardSystem();
