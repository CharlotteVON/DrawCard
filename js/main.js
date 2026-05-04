// 游戏入口

// 等待DOM加载完成
document.addEventListener('DOMContentLoaded', () => {
    console.log('元素决战 - 游戏初始化中...');
    
    // 初始化游戏
    game.init();
    
    console.log('元素决战 - 游戏初始化完成！');
    console.log('当前玩家状态:');
    console.log(`- 金币: ${player.gold}`);
    console.log(`- 等级: ${player.level}`);
    console.log(`- 卡片数量: ${player.cards.length}`);
    console.log(`- PVE进度: ${player.pveStage}`);
});

// 全局错误处理
window.onerror = function(msg, url, line, col, error) {
    console.error('游戏错误:', msg, url, line, col, error);
    UI.showNotification('游戏出现错误，请刷新页面重试', 'error');
    return false;
};

// 防止页面意外关闭时丢失进度
window.addEventListener('beforeunload', (e) => {
    player.save();
    shop.saveShop();
});
