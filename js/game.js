// 游戏主控制器

class Game {
    constructor() {
        this.currentScreen = 'main-menu';
        this.pendingBattle = null;
    }
    
    // 初始化游戏
    init() {
        // 更新UI
        UI.updatePlayerInfo();
        
        // 检查首次进入
        if (player.isFirstShop) {
            setTimeout(() => {
                UI.showNotification('欢迎来到元素决战！首次进入商店，所有卡片特价100元！', 'info');
            }, 1000);
        }
        
        // 绑定模态框关闭事件
        document.getElementById('card-detail-modal').addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                UI.closeModal();
            }
        });
        
        // 键盘事件
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                UI.closeModal();
            }
        });
    }
    
    // 切换屏幕
    static switchScreen(screenId) {
        // 隐藏所有屏幕
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        
        // 显示目标屏幕
        const targetScreen = document.getElementById(screenId);
        if (targetScreen) {
            targetScreen.classList.add('active');
            targetScreen.classList.add('screen-transition-enter');
            
            setTimeout(() => {
                targetScreen.classList.remove('screen-transition-enter');
            }, 400);
        }
        
        this.currentScreen = screenId;
    }
    
    // 返回主菜单
    static backToMenu() {
        this.switchScreen('main-menu');
        UI.updatePlayerInfo();
    }
    
    // 打开商店
    static openShop() {
        shop.init();
        this.switchScreen('shop-screen');
    }
    
    // 打开背包
    static openInventory() {
        inventory.init();
        this.switchScreen('inventory-screen');
    }
    
    // 开始PVE
    static startPVE() {
        // 选择PVE关卡
        this.showPVEStageSelect();
    }
    
    // 显示PVE关卡选择
    static showPVEStageSelect() {
        let stagesHTML = '<div class="pve-stages"><h3>选择关卡</h3><div class="stages-list">';
        
        PVE_STAGES.forEach(stage => {
            const isUnlocked = player.pveStage >= stage.id;
            const stageClass = isUnlocked ? 'stage-unlocked' : 'stage-locked';
            
            stagesHTML += `
                <div class="stage-item ${stageClass}" onclick="${isUnlocked ? `Game.selectPVEStage(${stage.id})` : ''}">
                    <div class="stage-info">
                        <h4>${stage.name}</h4>
                        <p>难度: ${'⭐'.repeat(Math.ceil(stage.difficulty))}</p>
                        ${stage.boss ? `<p>Boss: ${ENEMIES[stage.boss]?.name || '未知'}</p>` : ''}
                    </div>
                    <div class="stage-status">
                        ${isUnlocked ? '🔓' : '🔒'}
                    </div>
                </div>
            `;
        });
        
        stagesHTML += '</div></div>';
        
        UI.showModal(stagesHTML);
    }
    
    // 选择PVE关卡
    static selectPVEStage(stageId) {
        UI.closeModal();
        Battle.prepareBattle(true, stageId);
    }
    
    // 开始PVP
    static startPVP() {
        UI.showNotification('PVP模式即将开放，敬请期待！', 'info');
    }
}

// 创建全局游戏实例
const game = new Game();
