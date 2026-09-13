# Docs

> 来源: https://xcnplziulnma.feishu.cn/wiki/MsIxwWNkKiavqBkHVYOcBEcon46

MidiQOL.actorFromUuid(uuid)
从物品/效应的uuid中获取角色
MidiQOL.addConcentrationDependent(actorRef, dependent, item)
为角色的专注效果添加依赖
MidiQOL.addDependent(document, dependent)
为文档添加依赖（如依赖于某种效果的物品）
MidiQOL.addRollTo(roll, bonusRoll)
为指定掷骰添加加值掷骰
MidiQOL.applyTokenDamage(damageDetail, totalDamage, theTargets, item, saves, options = { label: "defaultDamage", existingDamage: [], superSavers: new Set(), semiSuperSavers: new Set(), workflow: undefined, updateOptions: { awaitDamageApplication: configSettings.waitForDamageApplication }, forceApply: false, noConcentrationCheck: false, })
向指定token应用伤害（包括治疗）
MidiQOL.canSee(tokenEntity, targetEntity) 
检验token能否看到target，返回布尔值
MidiQOL.canSense(tokenEntity, targetEntity, validModes = ["all"])  
检验token能否感知到target，返回布尔值
MidiQOL.canSenseModes(tokenEntity, targetEntity, validModes = ["all"])
token能以何种感知模式感知到目标？
MidiQOL.checkActivityRange(activityIn, tokenRef, targetsRef, showWarning = true) 
检测行动射程
MidiQOL.checkDistance(t1, t2, distance, options = { wallsBlock: false, includeCover: true }) 
检测t1（token1）与t2（token2）之间的距离
MidiQOL.checkIncapacitated(actorRef, logResult = true, warning = false) 
检查角色是否失能
MidiQOL.checkNearby(disposition, tokenRef, distance, options = { includeIncapacitated: false, canSee: false, isSeen: false, includeToken: false, relative: true }) 
检测token周边距离内是否有符合阵营（敌人/盟友/未知）限制的token
MidiQOL.checkRule(rule) 
检查规则版本....你多半不会在宏中使用它
MidiQOL.chooseEffect({ actor, token, item, workflow, options }) 
选择效果，更多用于工作流而非宏中
MidiQOL.completeActivityUse(activityRef, usage = {}, dialog = {}, message = {}) 
[completeActivityUse函数](https://xcnplziulnma.feishu.cn/wiki/PCT7wedt0iWc8Fkx2X2clIwUnfK)使用行动并掷骰，你可以预先配置目标/是否消耗资源/是否自动跳过对话框......，参见 
MidiQOL.completeItemUse(itemRef, config = {}, dialog = {}, message = {}) 
使用物品并掷骰，同上
MidiQOL.computeCoverBonus(attackerIn, targetIn, activity) 
计算掩护加值
MidiQOL.computeDistance(t1 /*Token*/, t2 /*Token*/, options = { wallsBlock: false, includeCover: true }) 
计算两个token之间的距离
MidiQOL.contestedRoll(data: {  source: { rollType: string, ability: string, token: TokenOrDocument | string, rollOptions: any },  target: { rollType: string, ability: string, token: TokenOrDocument | string, rollOptions: any },  displayResults: boolean,  itemCardUuid: string,  flavor: string,  rollOptions: any,  success: (results) => {}, failure: (results) => {}, drawn: (results) => {}}) 
创建对抗掷骰
MidiQOL.createConditionData(data) 
用于条件评估的辅助函数
MidiQOL.createDamageDetail({ roll, activity, defaultType = MidiQOL.MQdefaultDamageType }) 
为行动创建伤害掷骰
MidiQOL.createEffects(data: { actorUuid: string, effects: ActiveEffect.CreateData[], options: { keepId: boolean } }) 
向指定角色创建效果。
注意，pl没有执行这个函数的权限，若要使宏在pl端执行，请使用socket方法，感觉不如.....createEmbeddedDocuments函数
MidiQOL.displayDSNForRoll(rolls, rollType, defaultRollMode) 
展示指定掷骰的DSN骰子动画
MidiQOL.doConcentrationCheck(actor, saveDC) 
强迫指定角色进行专注检定
MidiQOL.doOverTimeEffect(actor, effect, startTurn = true, options = { saveToUse: undefined, rollFlags: undefined, isActionSave: false }) 
向指定角色进行Overtime效果掷骰
MidiQOL.findNearby(disposition, tokenRef, distance, options = { includeIncapacitated: false, canSee: false, isSeen: false, includeToken: false, relative: true }) 
查找源token指定范围内的指定倾向的token并返回满足条件的token数据
MidiQOL.findNearbyCount(disposition, token, distance, options = { includeIncapacitated: false, canSee: false, isSeen: false, includeToken: false, relative: true }) 
查找源token指定范围内的指定倾向的token并返回满足条件的token数量
MidiQOL.getChanges(actorOrItem, key) 
获取角色或物品效果更改内所有含指定key的更改详情
MidiQOL.getConcentrationEffect(actor, itemRef) 
获取指定角色身上的专注效应
MidiQOL.getTokenForActor(actor) 
获取指定角色在当前场景下的token
MidiQOL.getTokenForActorAsSet(actor) 
同上
MidiQOL.hasCondition(actorRef, condition) 
检查指定角色是否有指定的条件状态（如目盲）
MidiQOL.hasUsedBonusAction(actor) 
检查指定角色是否已使用附赠动作
MidiQOL.hasUsedReaction(actor) 
检查指定角色是否已使用反应
MidiQOL.modifyDamageBy({ damageItem, value, multiplier = 1, type = "none", reason })  
调整角色受到的伤害，注意，最好仅在isDamaged时调用
MidiQOL.moveToken(tokenRef, newCenter, animate = true) 
移动token至指定位置，并可配置是否播放移动动画
MidiQOL.moveTokenAwayFromPoint(targetRef, distance, point, animate = true, checkCollision = false) 
以某一点为参考点，将目标token推离/拉近指定距离，可配置是否播放移动动画和是否检测碰撞
MidiQOL.reactionDialog(actor, triggerTokenUuid, reactionActivities, rollFlavor, triggerType, options = {}) 
创建反应对话框，感觉不如....cpr函数
MidiQOL.removeBonusActionUsed(actor, force = false) 
移除指定角色已使用附赠动作标记
MidiQOL.removeReactionUsed(actor, force = false) 
移除指定角色已使用反应标记
MidiQOL.removeEffects(data: { actorUuid: string, effects: string[] }) 
向指定角色移除指定效果。注意，pl没有执行这个函数的权限，若要使宏在pl端执行，请使用socket方法，感觉不如.....deleteEmbeddedDocuments函数
MidiQOL.selectTargetsForTemplates(templateDetails, selfTokenRef = "", ignoreSelf = false, AoETargetType = "any", autoTarget) 
选定指定测量版上的目标
MidiQOL.setBonusActionUsed(actor) 
设置指定角色已使用附赠动作
MidiQOL.setReactionUsed(actor) 
设置指定角色已使用反应
MidiQOL.tokenForActor(actor) 
获取指定角色的token
MidiQOL.updateEffects(data: { actorUuid: string, updates: ActiveEffect.UpdateData[] }) 
更新指定角色上指定效应的数据。注意，pl没有执行这个函数的权限，若要使宏在pl端执行，请使用socket方法，感觉不如.....updateEmbeddedDocuments函数
workflow.setAttackRoll(roll) 
设置工作流的攻击掷骰
workflow.setUtilityRolls(rolls) 
设置效用行动掷骰
workflow.setDamageRoll(roll) 
设置工作流的伤害掷骰
workflow.addDamageRolls(rolls)
向工作流的伤害掷骰添加额外掷骰
workflow.setDamageRolls(rolls) 
设置工作流的伤害掷骰