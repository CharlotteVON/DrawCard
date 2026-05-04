// 卡牌背包系统

class Inventory {
    constructor() {
        this.currentFilter = 'all';
    }
    
    // 初始化背包
    init() {
        this.renderInventory();
    }
    
    // 设置筛选器
    filter(type) {
        this.currentFilter = type;
        
        // 更新筛选按钮状态
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        event.target.classList.add('active');
        
        this.renderInventory();
    }
    
    // 渲染背包界面
    renderInventory() {
        const inventoryCardsContainer = document.getElementById('inventory-cards');
        if (!inventoryCardsContainer) return;
        
        inventoryCardsContainer.innerHTML = '';
        
        let cards = player.getOwnedCards();
        
        // 应用筛选
        if (this.currentFilter !== 'all') {
            cards = cards.filter(card => card.type === this.currentFilter);
        }
        
        if (cards.length === 0) {
            inventoryCardsContainer.innerHTML = `
                <div class="shop-empty" style="grid-column: 1 / -1;">
                    <div class="empty-icon">📦</div>
                    <h3>背包为空</h3>
                    <p>去商店购买一些卡片吧！</p>
                </div>
            `;
            return;
        }
        
        // 按品质排序
        const qualityOrder = { 'red': 0, 'gold': 1, 'purple': 2, 'green': 3, 'white': 4 };
        cards.sort((a, b) => qualityOrder[a.quality] - qualityOrder[b.quality]);
        
        // 渲染卡片
        cards.forEach(card => {
            const isSelected = card.type === 'hero' 
                ? player.selectedHero === card.id 
                : player.selectedDeck.includes(card.id);
            
            const cardElement = cardSystem.createCardElement(card.id, {
                isSelectable: true,
                isSelected: isSelected,
                onClick: (id) => this.showCardOptions(id)
            });
            
            inventoryCardsContainer.appendChild(cardElement);
        });
    }
    
    // 显示卡片选项
    showCardOptions(cardId) {
        const card = ALL_CARDS[cardId];
        if (!card) return;
        
        const detailHTML = cardSystem.createCardDetailHTML(cardId);
        
        let optionsHTML = '';
        
        if (card.type === 'hero') {
            const isSelected = player.selectedHero === cardId;
            optionsHTML = `
                <div class="card-options" style="margin-top: 20px; text-align: center;">
                    <button class="btn ${isSelected ? 'btn-secondary' : 'btn-primary'}" 
                            onclick="inventory.selectHero('${cardId}')">
                        ${isSelected ? '取消选择' : '设为出战英雄'}
                    </button>
                </div>
            `;
        } else if (card.type === 'battle') {
            const isInDeck = player.selectedDeck.includes(cardId);
            optionsHTML = `
                <div class="card-options" style="margin-top: 20px; text-align: center;">
                    <button class="btn ${isInDeck ? 'btn-secondary' : 'btn-primary'}" 
                            onclick="inventory.toggleDeckCard('${cardId}')"
                            ${!isInDeck && player.selectedDeck.length >= GAME_CONFIG.MAX_DECK_SIZE ? 'disabled' : ''}>
                        ${isInDeck ? '从卡组移除' : '加入战斗卡组'}
                    </button>
                    <p style="margin-top: 10px; color: var(--text-secondary); font-size: 14px;">
                        当前卡组: ${player.selectedDeck.length}/${GAME_CONFIG.MAX_DECK_SIZE}
                    </p>
                </div>
            `;
        }
        
        UI.showModal(detailHTML + optionsHTML);
    }
    
    // 选择英雄
    selectHero(cardId) {
        if (player.selectedHero === cardId) {
            player.selectHero(null);
            UI.showNotification('已取消英雄选择', 'info');
        } else {
            player.selectHero(cardId);
            UI.showNotification(`已选择 ${ALL_CARDS[cardId].name} 作为出战英雄`, 'success');
        }
        
        UI.closeModal();
        this.renderInventory();
    }
    
    // 切换卡组卡片
    toggleDeckCard(cardId) {
        if (player.selectedDeck.includes(cardId)) {
            player.removeFromDeck(cardId);
            UI.showNotification(`已将 ${ALL_CARDS[cardId].name} 从卡组移除`, 'info');
        } else {
            if (player.addToDeck(cardId)) {
                UI.showNotification(`已将 ${ALL_CARDS[cardId].name} 加入战斗卡组`, 'success');
            } else {
                UI.showNotification('卡组已满或无法添加', 'error');
                return;
            }
        }
        
        UI.closeModal();
        this.renderInventory();
    }
}

// 创建全局背包实例
const inventory = new Inventory();
