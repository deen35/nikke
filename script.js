// 全局变量
let selectedCharacter = null;

// DOM 加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    initializeCharacterDropdown();
    loadSavedData();
    
    // 添加事件监听器
    document.getElementById('calculateBtn').addEventListener('click', calculateDamage);
    document.getElementById('resetBtn').addEventListener('click', resetCalculator);
    
    // 优越属性复选框事件
    document.getElementById('superiorAttribute').addEventListener('change', function() {
        document.getElementById('superiorValue').disabled = !this.checked;
    });
    
    // 自定义攻击提升复选框事件（他人攻击区）
    document.getElementById('customAttackBonusCheck').addEventListener('change', function() {
        document.getElementById('customOtherAttackBonus').disabled = !this.checked;
    });
    
    // 自定义增伤值复选框事件（他人增伤区）
    document.getElementById('customDamageBonusCheck').addEventListener('change', function() {
        document.getElementById('customOtherDamageBonus').disabled = !this.checked;
    });
    
    // 自定义易伤值复选框事件（他人易伤区）
    document.getElementById('customVulnerabilityCheck').addEventListener('change', function() {
        document.getElementById('customOtherVulnerability').disabled = !this.checked;
    });
    
    // 角色下拉菜单事件
    document.getElementById('characterDropdown').addEventListener('change', function() {
        const characterId = parseInt(this.value);
        if (characterId) {
            const character = characterDatabase.find(char => char.id === characterId);
            if (character) {
                selectCharacter(character);
            }
        } else {
            // 清空选择
            selectedCharacter = null;
            hideCharacterPanel();
        }
    });
    
    // 自定义角色复选框事件
    document.getElementById('useCustomCharacter').addEventListener('change', function() {
        const customFields = document.getElementById('customCharacterFields');
        if (this.checked) {
            customFields.style.display = 'block';
            // 清空角色选择
            document.getElementById('characterDropdown').value = '';
            selectedCharacter = null;
            hideCharacterPanel();
        } else {
            customFields.style.display = 'none';
        }
        saveToLocalStorage();
    });
    
    // 自定义防御值单选按钮事件
    document.getElementById('customDefenseRadio').addEventListener('change', function() {
        document.getElementById('customDefenseValue').disabled = !this.checked;
    });
    
    // 自定义防御值输入框事件
    document.getElementById('customDefenseValue').addEventListener('input', function() {
        if (this.value !== '') {
            document.getElementById('customDefenseRadio').checked = true;
        }
    });
});

// 初始化角色下拉菜单
function initializeCharacterDropdown() {
    const dropdown = document.getElementById('characterDropdown');
    
    characterDatabase.forEach(character => {
        const option = document.createElement('option');
        option.value = character.id;
        option.textContent = character.name;
        dropdown.appendChild(option);
    });
}

// 选择角色
function selectCharacter(character) {
    selectedCharacter = character;
    
    // 如果选择了角色，取消自定义角色
    document.getElementById('useCustomCharacter').checked = false;
    document.getElementById('customCharacterFields').style.display = 'none';
    
    // 更新下拉菜单选择
    document.getElementById('characterDropdown').value = character.id;
    
    // 显示角色面板
    showCharacterPanel(character);
    
    // 保存选择到本地存储
    saveToLocalStorage();
}

// 显示角色面板
function showCharacterPanel(character) {
    const placeholder = document.querySelector('.panel-placeholder');
    const content = document.querySelector('.panel-content');
    
    placeholder.style.display = 'none';
    content.style.display = 'block';
    
    // 更新面板内容
    document.getElementById('panelAvatar').src = character.avatar;
    document.getElementById('panelAvatar').alt = character.name;
    document.getElementById('panelName').textContent = character.name;
    document.getElementById('panelBaseAttack').textContent = character.baseAttack.toLocaleString();
    document.getElementById('panelAttackBonus').textContent = character.attackBonus + '%';
    document.getElementById('panelDamageBonus').textContent = character.damageBonus + '%';
    document.getElementById('panelVulnerability').textContent = character.vulnerability + '%';
    document.getElementById('panelSkillMultiplier').textContent = character.skillMultiplier + '%';
}

// 隐藏角色面板
function hideCharacterPanel() {
    const placeholder = document.querySelector('.panel-placeholder');
    const content = document.querySelector('.panel-content');
    
    placeholder.style.display = 'flex';
    content.style.display = 'none';
}

// 获取当前使用的角色数据（包括自定义角色）
function getCurrentCharacterData() {
    const useCustomCharacter = document.getElementById('useCustomCharacter').checked;
    
    if (useCustomCharacter) {
        // 使用自定义角色数据
        return {
            baseAttack: parseFloat(document.getElementById('customBaseAttack').value) || 0,
            attackBonus: parseFloat(document.getElementById('customCharacterAttackBonus').value) || 0,
            damageBonus: parseFloat(document.getElementById('customCharacterDamageBonus').value) || 0,
            vulnerability: parseFloat(document.getElementById('customCharacterVulnerability').value) || 0,
            skillMultiplier: parseFloat(document.getElementById('customSkillMultiplier').value) || 100
        };
    } else {
        // 使用选择的角色数据
        return selectedCharacter;
    }
}

// 获取防御值
function getDefenseValue() {
    if (document.getElementById('customDefenseRadio').checked) {
        return parseFloat(document.getElementById('customDefenseValue').value) || 0;
    } else {
        return parseFloat(document.querySelector('input[name="defenseType"]:checked').value) || 0;
    }
}

// 格式化数字显示，保留2位小数
function formatNumber(num) {
    return Number(num).toLocaleString('zh-CN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

// 格式化百分比显示，保留2位小数
function formatPercentage(num) {
    return (num * 100).toFixed(2) + '%';
}

// 计算伤害
function calculateDamage() {
    const useCustomCharacter = document.getElementById('useCustomCharacter').checked;
    
    if (!selectedCharacter && !useCustomCharacter) {
        alert('请先选择一个角色或使用自定义角色数据！');
        return;
    }
    
    // 获取当前角色数据
    const characterData = getCurrentCharacterData();
    if (!characterData) {
        alert('请先选择一个角色或使用自定义角色数据！');
        return;
    }
    
    // 获取输入值
    const equipmentAttack = parseFloat(document.getElementById('equipmentAttack').value) || 0;
    
    // 获取他人攻击提升值（多选）
    let otherAttackBonus = 0;
    document.querySelectorAll('input[name="otherAttackBonus"]:checked').forEach(checkbox => {
        if (checkbox.value !== "0") { // 排除"无"选项
            otherAttackBonus += parseFloat(checkbox.value);
        }
    });
    
    // 获取自定义攻击提升值（他人攻击区）
    if (document.getElementById('customAttackBonusCheck').checked) {
        otherAttackBonus += parseFloat(document.getElementById('customOtherAttackBonus').value) || 0;
    }
    
    // 获取防御值
    const defenseValue = getDefenseValue();
    
    // 获取他人增伤值（多选）
    let otherDamageBonus = 0;
    document.querySelectorAll('input[name="otherDamageBonus"]:checked').forEach(checkbox => {
        if (checkbox.value !== "0") { // 排除"无"选项
            otherDamageBonus += parseFloat(checkbox.value);
        }
    });
    
    // 获取自定义增伤值（他人增伤区）
    if (document.getElementById('customDamageBonusCheck').checked) {
        otherDamageBonus += parseFloat(document.getElementById('customOtherDamageBonus').value) || 0;
    }
    
    // 获取他人易伤值（多选）
    let otherVulnerability = 0;
    document.querySelectorAll('input[name="otherVulnerability"]:checked').forEach(checkbox => {
        if (checkbox.value !== "0") { // 排除"无"选项
            otherVulnerability += parseFloat(checkbox.value);
        }
    });
    
    // 获取自定义易伤值（他人易伤区）
    if (document.getElementById('customVulnerabilityCheck').checked) {
        otherVulnerability += parseFloat(document.getElementById('customOtherVulnerability').value) || 0;
    }
    
    // 获取优越属性
    const hasSuperior = document.getElementById('superiorAttribute').checked;
    const superiorValue = hasSuperior ? (parseFloat(document.getElementById('superiorValue').value) || 0) : 0;
    const superiorMultiplier = hasSuperior ? (1 + superiorValue / 100) : 1;
    
    // 获取爆裂补正
    const hasBurst = document.getElementById('burstCorrection').checked;
    const burstMultiplier = hasBurst ? 1.5 : 1;
    
    // 计算每个乘区的累积数值
    // 1. 攻击区计算
    const totalAttackBonus = (characterData.attackBonus + equipmentAttack + otherAttackBonus) / 100;
    const attackValue = characterData.baseAttack * (1 + totalAttackBonus);
    
    // 2. 防御减伤
    const afterDefense = Math.max(1, attackValue - defenseValue);
    
    // 3. 技能倍率
    const skillMultiplier = characterData.skillMultiplier / 100;
    
    // 4. 增伤区
    const totalDamageBonus = (characterData.damageBonus + otherDamageBonus) / 100;
    
    // 5. 易伤区
    const totalVulnerability = (characterData.vulnerability + otherVulnerability) / 100;
    
    // 计算每个乘区的累积伤害
    const baseDamage = afterDefense;
    const afterSkill = baseDamage * skillMultiplier;
    const afterDamageBonus = baseDamage * (1 + totalDamageBonus);
    const afterVulnerability = baseDamage * (1 + totalVulnerability);
    const afterSuperior = baseDamage * superiorMultiplier;
    const afterBurst = baseDamage * burstMultiplier;
    
    // 最终伤害计算（所有乘区累积）
    const finalDamage = baseDamage * skillMultiplier * (1 + totalDamageBonus) * (1 + totalVulnerability) * superiorMultiplier * burstMultiplier;
    
    // 显示每个乘区的累积数值
    document.getElementById('stepAttack').textContent = formatNumber(attackValue);
    document.getElementById('stepAfterDefense').textContent = formatNumber(baseDamage);
    document.getElementById('stepAfterSkill').textContent = formatPercentage(skillMultiplier);
    document.getElementById('stepAfterDamageBonus').textContent = formatPercentage(1 + totalDamageBonus);
    document.getElementById('stepAfterVulnerability').textContent = formatPercentage(1 + totalVulnerability);
    document.getElementById('stepAfterSuperior').textContent = formatPercentage(superiorMultiplier);
    document.getElementById('stepAfterBurst').textContent = formatPercentage(burstMultiplier);
    
    // 显示最终伤害
    document.getElementById('finalDamage').textContent = formatNumber(finalDamage);
    
    // 保存数据到本地存储
    saveToLocalStorage();
}

// 重置计算器
function resetCalculator() {
    document.getElementById('equipmentAttack').value = 0;
    
    // 重置多选框
    document.querySelectorAll('input[name="otherAttackBonus"]').forEach(checkbox => {
        checkbox.checked = (checkbox.value === "0");
    });
    
    // 重置自定义攻击提升（他人攻击区）
    document.getElementById('customAttackBonusCheck').checked = false;
    document.getElementById('customOtherAttackBonus').value = 0;
    document.getElementById('customOtherAttackBonus').disabled = true;
    
    // 重置防御区
    document.querySelector('input[name="defenseType"][value="29411"]').checked = true;
    document.getElementById('customDefenseRadio').checked = false;
    document.getElementById('customDefenseValue').value = 0;
    document.getElementById('customDefenseValue').disabled = true;
    
    // 重置多选框
    document.querySelectorAll('input[name="otherDamageBonus"]').forEach(checkbox => {
        checkbox.checked = (checkbox.value === "0");
    });
    
    // 重置自定义增伤值（他人增伤区）
    document.getElementById('customDamageBonusCheck').checked = false;
    document.getElementById('customOtherDamageBonus').value = 0;
    document.getElementById('customOtherDamageBonus').disabled = true;
    
    document.querySelectorAll('input[name="otherVulnerability"]').forEach(checkbox => {
        checkbox.checked = (checkbox.value === "0");
    });
    
    // 重置自定义易伤值（他人易伤区）
    document.getElementById('customVulnerabilityCheck').checked = false;
    document.getElementById('customOtherVulnerability').value = 0;
    document.getElementById('customOtherVulnerability').disabled = true;
    
    // 重置其他选项
    document.getElementById('superiorAttribute').checked = false;
    document.getElementById('superiorValue').value = 0;
    document.getElementById('superiorValue').disabled = true;
    document.getElementById('burstCorrection').checked = false;
    
    // 重置自定义角色
    document.getElementById('useCustomCharacter').checked = false;
    document.getElementById('customCharacterFields').style.display = 'none';
    document.getElementById('customBaseAttack').value = 0;
    document.getElementById('customCharacterAttackBonus').value = 0;
    document.getElementById('customCharacterDamageBonus').value = 0;
    document.getElementById('customCharacterVulnerability').value = 0;
    document.getElementById('customSkillMultiplier').value = 100;
    
    // 重置显示结果
    document.querySelectorAll('.step-item span').forEach(span => {
        span.textContent = '0.00';
    });
    document.getElementById('finalDamage').textContent = '0.00';
    
    // 清除本地存储
    localStorage.removeItem('damageCalculatorData');
}

// 保存数据到本地存储
function saveToLocalStorage() {
    const useCustomCharacter = document.getElementById('useCustomCharacter').checked;
    
    const data = {
        useCustomCharacter: useCustomCharacter,
        characterId: selectedCharacter ? selectedCharacter.id : null,
        equipmentAttack: document.getElementById('equipmentAttack').value,
        
        // 保存多选框状态
        otherAttackBonus: Array.from(document.querySelectorAll('input[name="otherAttackBonus"]:checked'))
            .map(checkbox => checkbox.value),
        customAttackBonusCheck: document.getElementById('customAttackBonusCheck').checked,
        customOtherAttackBonus: document.getElementById('customOtherAttackBonus').value,
        
        // 保存防御区状态
        defenseType: document.querySelector('input[name="defenseType"]:checked').value,
        customDefenseRadio: document.getElementById('customDefenseRadio').checked,
        customDefenseValue: document.getElementById('customDefenseValue').value,
        
        // 保存多选框状态
        otherDamageBonus: Array.from(document.querySelectorAll('input[name="otherDamageBonus"]:checked'))
            .map(checkbox => checkbox.value),
        customDamageBonusCheck: document.getElementById('customDamageBonusCheck').checked,
        customOtherDamageBonus: document.getElementById('customOtherDamageBonus').value,
        
        otherVulnerability: Array.from(document.querySelectorAll('input[name="otherVulnerability"]:checked'))
            .map(checkbox => checkbox.value),
        customVulnerabilityCheck: document.getElementById('customVulnerabilityCheck').checked,
        customOtherVulnerability: document.getElementById('customOtherVulnerability').value,
            
        superiorAttribute: document.getElementById('superiorAttribute').checked,
        superiorValue: document.getElementById('superiorValue').value,
        burstCorrection: document.getElementById('burstCorrection').checked,
        
        // 保存自定义角色数据
        customBaseAttack: document.getElementById('customBaseAttack').value,
        customCharacterAttackBonus: document.getElementById('customCharacterAttackBonus').value,
        customCharacterDamageBonus: document.getElementById('customCharacterDamageBonus').value,
        customCharacterVulnerability: document.getElementById('customCharacterVulnerability').value,
        customSkillMultiplier: document.getElementById('customSkillMultiplier').value
    };
    
    localStorage.setItem('damageCalculatorData', JSON.stringify(data));
}

// 从本地存储加载数据
function loadSavedData() {
    const savedData = localStorage.getItem('damageCalculatorData');
    
    if (savedData) {
        const data = JSON.parse(savedData);
        
        // 恢复自定义角色状态
        document.getElementById('useCustomCharacter').checked = data.useCustomCharacter || false;
        if (data.useCustomCharacter) {
            document.getElementById('customCharacterFields').style.display = 'block';
        }
        
        // 恢复角色选择（如果不使用自定义角色）
        if (!data.useCustomCharacter && data.characterId) {
            const character = characterDatabase.find(char => char.id === data.characterId);
            if (character) {
                selectCharacter(character);
            }
        }
        
        // 恢复输入值
        document.getElementById('equipmentAttack').value = data.equipmentAttack;
        
        // 恢复多选框
        document.querySelectorAll('input[name="otherAttackBonus"]').forEach(checkbox => {
            checkbox.checked = data.otherAttackBonus.includes(checkbox.value);
        });
        
        // 恢复自定义攻击提升（他人攻击区）
        document.getElementById('customAttackBonusCheck').checked = data.customAttackBonusCheck;
        document.getElementById('customOtherAttackBonus').value = data.customOtherAttackBonus || 0;
        document.getElementById('customOtherAttackBonus').disabled = !data.customAttackBonusCheck;
        
        // 恢复防御区
        if (data.customDefenseRadio) {
            document.getElementById('customDefenseRadio').checked = true;
            document.getElementById('customDefenseValue').value = data.customDefenseValue || 0;
            document.getElementById('customDefenseValue').disabled = false;
        } else {
            const defenseRadio = document.querySelector(`input[name="defenseType"][value="${data.defenseType}"]`);
            if (defenseRadio) defenseRadio.checked = true;
            document.getElementById('customDefenseValue').disabled = true;
        }
        
        // 恢复多选框
        document.querySelectorAll('input[name="otherDamageBonus"]').forEach(checkbox => {
            checkbox.checked = data.otherDamageBonus.includes(checkbox.value);
        });
        
        // 恢复自定义增伤值（他人增伤区）
        document.getElementById('customDamageBonusCheck').checked = data.customDamageBonusCheck;
        document.getElementById('customOtherDamageBonus').value = data.customOtherDamageBonus || 0;
        document.getElementById('customOtherDamageBonus').disabled = !data.customDamageBonusCheck;
        
        document.querySelectorAll('input[name="otherVulnerability"]').forEach(checkbox => {
            checkbox.checked = data.otherVulnerability.includes(checkbox.value);
        });
        
        // 恢复自定义易伤值（他人易伤区）
        document.getElementById('customVulnerabilityCheck').checked = data.customVulnerabilityCheck;
        document.getElementById('customOtherVulnerability').value = data.customOtherVulnerability || 0;
        document.getElementById('customOtherVulnerability').disabled = !data.customVulnerabilityCheck;
        
        // 恢复其他选项
        document.getElementById('superiorAttribute').checked = data.superiorAttribute;
        document.getElementById('superiorValue').value = data.superiorValue;
        document.getElementById('superiorValue').disabled = !data.superiorAttribute;
        document.getElementById('burstCorrection').checked = data.burstCorrection;
        
        // 恢复自定义角色数据
        document.getElementById('customBaseAttack').value = data.customBaseAttack || 0;
        document.getElementById('customCharacterAttackBonus').value = data.customCharacterAttackBonus || 0;
        document.getElementById('customCharacterDamageBonus').value = data.customCharacterDamageBonus || 0;
        document.getElementById('customCharacterVulnerability').value = data.customCharacterVulnerability || 0;
        document.getElementById('customSkillMultiplier').value = data.customSkillMultiplier || 100;
        
        // 重新计算伤害
        calculateDamage();
    }
}