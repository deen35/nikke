// 角色数据库 - 新字段结构
const characterDatabase = [
    {
        id: 1,
        name: "红莲",
        avatar: "./images/scarlet.webp",
        baseAttack: 130036,        // 基础攻击
        attackBonus: 69.45,          // 角色自带攻击提升(%)
        damageBonus: 0,         // 角色自身增伤值(%)
        vulnerability: 0,         // 角色自身易伤值(%)
        skillMultiplier: 849.15     // 角色自身技能倍率(%)
    },
    {
        id: 2,
        name: "灰姑娘",
        avatar: "./images/cinderella.png",
        baseAttack: 92112,
        attackBonus: 110,
        damageBonus: 0,
        vulnerability: 0,
        skillMultiplier: 1365.92
    },
    {
        id: 3,
        name: "莉贝雷利奥（水母）",
        avatar: "./images/liberalio.png",
        baseAttack: 130036,
        attackBonus: 160,
        damageBonus: 50,
        vulnerability: 0,
        skillMultiplier: 925
    },
    {
        id: 4,
        name: "攻击型模版",
        avatar: "./images/default.webp",
        baseAttack: 130036,
        attackBonus: 0,
        damageBonus: 0,
        vulnerability: 0,
        skillMultiplier: 100
    },
    {
        id: 999,
        name: "自定义角色",
        avatar: "./images/default.webp",
        baseAttack: 0,
        attackBonus: 0,
        damageBonus: 0,
        vulnerability: 0,
        skillMultiplier: 100,
        isCustom: true
    }
];