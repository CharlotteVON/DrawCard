// UI系统

class UI {
    constructor() {
        this.notificationTimeout = null;
    }
    
    // 更新玩家信息显示
    static updatePlayerInfo() {
        const goldElement = document.getElementById('player-gold');
        const levelElement = document.getElementById('player-level');
        const expElement = document.getElementById('player-exp');
        const expMaxElement = document.getElementById('player-exp-max');
        
        if (goldElement) goldElement.textContent = player.gold;
        if (levelElement) levelElement.textContent = player.level;
        if (expElement) expElement.textContent = player.exp;
        if (expMaxElement) expMaxElement.textContent = player.maxExp;
    }
    
    // 显示通知
    static showNotification(message, type = 'info') {
        const notification = document.getElementById('notification');
        if (!notification) return;
        
        // 清除之前的定时器
        if (this.notificationTimeout) {
            clearTimeout(this.notificationTimeout);
        }
        
        notification.textContent = message;
        notification.className = `notification ${type} show`;
        
        this.notificationTimeout = setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }
    
    // 显示模态框
    static showModal(content) {
        const modal = document.getElementById('card-detail-modal');
        const detailContainer = document.getElementById('card-detail');
        
        if (modal && detailContainer) {
            detailContainer.innerHTML = content;
            modal.classList.add('active');
        }
    }
    
    // 关闭模态框
    static closeModal() {
        const modal = document.getElementById('card-detail-modal');
        if (modal) {
            modal.classList.remove('active');
        }
    }
    
    // 显示伤害数字
    static showDamageNumber(value, target, isHeal = false) {
        const targetElement = target === 'enemy' 
            ? document.querySelector('.enemy-info')
            : document.querySelector('.player-battle-info');
        
        if (!targetElement) return;
        
        const damageDiv = document.createElement('div');
        damageDiv.className = `damage-number ${isHeal ? 'heal' : ''}`;
        damageDiv.textContent = isHeal ? `+${value}` : `-${value}`;
        
        // 随机位置
        const rect = targetElement.getBoundingClientRect();
        damageDiv.style.left = `${rect.left + Math.random() * rect.width}px`;
        damageDiv.style.top = `${rect.top + Math.random() * 20}px`;
        damageDiv.style.position = 'fixed';
        
        document.body.appendChild(damageDiv);
        
        setTimeout(() => damageDiv.remove(), 1000);
    }
    
    // 显示回合指示器
    static showTurnIndicator(text) {
        const indicator = document.createElement('div');
        indicator.className = 'turn-indicator';
        indicator.textContent = text;
        
        document.body.appendChild(indicator);
        
        setTimeout(() => indicator.remove(), 1000);
    }
    
    // 显示金币动画
    static showCoinAnimation(amount) {
        const coin = document.createElement('div');
        coin.className = 'coin-animation';
        coin.textContent = `💰 -${amount}`;
        coin.style.left = '50%';
        coin.style.top = '50%';
        
        document.body.appendChild(coin);
        
        setTimeout(() => coin.remove(), 1000);
    }
    
    // 显示经验值动画
    static showExpAnimation(amount) {
        const exp = document.createElement('div');
        exp.className = 'exp-animation';
        exp.textContent = `✨ +${amount} EXP`;
        exp.style.left = '50%';
        exp.style.top = '60%';
        
        document.body.appendChild(exp);
        
        setTimeout(() => exp.remove(), 1500);
    }
    
    // 显示升级特效
    static showLevelUpEffect() {
        const effect = document.createElement('div');
        effect.className = 'level-up-effect';
        effect.textContent = `🎉 升级！Lv.${player.level}`;
        
        document.body.appendChild(effect);
        
        // 添加星星效果
        this.showStarsEffect();
        
        setTimeout(() => effect.remove(), 2000);
    }
    
    // 显示星星特效
    static showStarsEffect() {
        const container = document.createElement('div');
        container.className = 'stars-container';
        
        for (let i = 0; i < 20; i++) {
            const star = document.createElement('div');
            star.className = 'star';
            star.style.left = `${Math.random() * 100}%`;
            star.style.top = `${Math.random() * 100}%`;
            star.style.animationDelay = `${Math.random() * 1}s`;
            container.appendChild(star);
        }
        
        document.body.appendChild(container);
        setTimeout(() => container.remove(), 2000);
    }
    
    // 显示稀有卡片特效
    static showRareCardEffect() {
        const effect = document.createElement('div');
        effect.className = 'rare-card-effect';
        
        document.body.appendChild(effect);
        
        setTimeout(() => effect.remove(), 2000);
    }
    
    // 显示战斗特效
    static showBattleEffect(type) {
        const effect = document.createElement('div');
        effect.className = `battle-effect effect-${type}`;
        
        document.body.appendChild(effect);
        
        setTimeout(() => effect.remove(), 500);
    }
    
    // 显示胜利特效
    static showVictoryEffect() {
        const effect = document.createElement('div');
        effect.className = 'victory-effect';
        
        document.body.appendChild(effect);
        
        setTimeout(() => effect.remove(), 2000);
    }
    
    // 显示失败特效
    static showDefeatEffect() {
        const effect = document.createElement('div');
        effect.className = 'defeat-effect';
        
        document.body.appendChild(effect);
        
        setTimeout(() => effect.remove(), 2000);
    }
}

// 创建全局UI实例
const ui = new UI();
