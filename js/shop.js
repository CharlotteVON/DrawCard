// 黑市商店系统

class Shop {
    constructor() {
        this.currentCards = []; // 当前商店卡片
        this.soldCards = []; // 已售出的卡片
        this.refreshTimer = null;
    }
    
    // 初始化商店
    init() {
        this.loadShopCards();
        this.startRefreshTimer();
    }
    
    // 加载商店卡片
    loadShopCards() {
        const savedShop = localStorage.getItem('elemental_showdown_shop');
        if (savedShop) {
            const data = JSON.parse(savedShop);
            this.currentCards = data.cards || [];
            this.soldCards = data.soldCards || [];
            
            // 检查是否需要刷新
            if (player.shouldRefreshShop()) {
                this.refreshShop();
            }
        } else {
            this.refreshShop();
        }
    }
    
    // 保存商店状态
    saveShop() {
        const data = {
            cards: this.currentCards,
            soldCards: this.soldCards
        };
        localStorage.setItem('elemental_showdown_shop', JSON.stringify(data));
    }
    
    // 刷新商店
    refreshShop() {
        this.currentCards = cardSystem.getRandomShopCards(GAME_CONFIG.SHOP_CARD_COUNT);
        this.soldCards = [];
        player.updateShopRefreshTime();
        this.saveShop();
        this.renderShop();
        
        UI.showNotification('🔄 商店已刷新！', 'info');
    }
    
    // 开始刷新计时器
    startRefreshTimer() {
        if (this.refreshTimer) {
            clearInterval(this.refreshTimer);
        }
        
        this.updateRefreshTimer();
        this.refreshTimer = setInterval(() => {
            this.updateRefreshTimer();
            
            // 检查是否需要刷新
            if (player.shouldRefreshShop()) {
                this.refreshShop();
            }
        }, 1000);
    }
    
    // 更新刷新计时器显示
    updateRefreshTimer() {
        const timerElement = document.getElementById('refresh-timer');
        if (!timerElement) return;
        
        const nextRefresh = player.getNextRefreshTime();
        const now = Date.now();
        const remaining = Math.max(0, nextRefresh - now);
        
        if (remaining <= 0) {
            timerElement.textContent = '可刷新';
            return;
        }
        
        const hours = Math.floor(remaining / (1000 * 60 * 60));
        const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
        
        timerElement.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    
    // 渲染商店界面
    renderShop() {
        const shopCardsContainer = document.getElementById('shop-cards');
        if (!shopCardsContainer) return;
        
        shopCardsContainer.innerHTML = '';
        
        // 首次商店提示
        if (player.isFirstShop) {
            const banner = document.createElement('div');
            banner.className = 'first-shop-banner';
            banner.innerHTML = `
                <h3>🎉 首次光临黑市！</h3>
                <p>所有卡片特价100元！</p>
            `;
            shopCardsContainer.appendChild(banner);
        }
        
        // 渲染卡片
        this.currentCards.forEach((cardId, index) => {
            const card = ALL_CARDS[cardId];
            if (!card) return;
            
            const isSold = this.soldCards.includes(index);
            const price = cardSystem.getCardPrice(cardId, player.isFirstShop);
            
            const cardElement = cardSystem.createCardElement(cardId, {
                showPrice: true,
                price: price,
                isShop: true,
                onClick: (id) => this.showCardDetail(id),
                onBuy: (id) => this.buyCard(id, index)
            });
            
            if (isSold) {
                cardElement.classList.add('sold');
            }
            
            shopCardsContainer.appendChild(cardElement);
        });
        
        // 更新金币显示
        const shopGold = document.getElementById('shop-gold');
        if (shopGold) {
            shopGold.textContent = player.gold;
        }
    }
    
    // 购买卡片
    buyCard(cardId, index) {
        if (this.soldCards.includes(index)) {
            UI.showNotification('该卡片已售出', 'error');
            return;
        }
        
        const price = cardSystem.getCardPrice(cardId, player.isFirstShop);
        
        if (player.gold < price) {
            UI.showNotification('金币不足！', 'error');
            return;
        }
        
        // 确认购买
        this.showPurchaseConfirm(cardId, index, price);
    }
    
    // 显示购买确认
    showPurchaseConfirm(cardId, index, price) {
        const card = ALL_CARDS[cardId];
        if (!card) return;
        
        const qualityInfo = cardSystem.getQualityInfo(card.quality);
        
        const modalContent = `
            <div class="purchase-confirm">
                <h3>确认购买</h3>
                <div class="confirm-card">
                    <div class="card-image">${card.icon}</div>
                    <div class="card-name">${card.name}</div>
                    <span class="card-quality ${card.quality}">${qualityInfo.name}</span>
                </div>
                <div class="confirm-price">💰 ${price}</div>
                <p>确定要购买这张卡片吗？</p>
                <div class="confirm-buttons">
                    <button class="btn btn-confirm" onclick="shop.confirmPurchase('${cardId}', ${index}, ${price})">确认购买</button>
                    <button class="btn btn-cancel" onclick="UI.closeModal()">取消</button>
                </div>
            </div>
        `;
        
        UI.showModal(modalContent);
    }
    
    // 确认购买
    confirmPurchase(cardId, index, price) {
        if (player.spendGold(price)) {
            player.addCard(cardId);
            this.soldCards.push(index);
            this.saveShop();
            
            UI.closeModal();
            UI.showNotification(`成功购买 ${ALL_CARDS[cardId].name}！`, 'success');
            UI.showCoinAnimation(price);
            
            // 如果是首次购买，检查是否需要更新首次状态
            if (player.isFirstShop) {
                // 可以在这里添加首次购买的特殊逻辑
            }
            
            this.renderShop();
        } else {
            UI.showNotification('购买失败，金币不足！', 'error');
        }
    }
    
    // 显示卡片详情
    showCardDetail(cardId) {
        const detailHTML = cardSystem.createCardDetailHTML(cardId);
        UI.showModal(detailHTML);
    }
    
    // 停止刷新计时器
    stopRefreshTimer() {
        if (this.refreshTimer) {
            clearInterval(this.refreshTimer);
            this.refreshTimer = null;
        }
    }
}

// 创建全局商店实例
const shop = new Shop();
