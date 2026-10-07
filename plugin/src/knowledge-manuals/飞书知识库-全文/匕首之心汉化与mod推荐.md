# 匕首之心汉化与mod推荐

> 不知道有多少人会用到匕首之心系统但是总之先写了吧（）

首先贴一个匕首心各种资源的飞书<cite doc-id="NwsAwL4JpiFsx2kXhCwc5FzWnsh" file-type="wiki" title="《匕首之心 Daggerheart》非官方中文资料站" type="doc"></cite>。

### 系统安装与配置

现在fvtt上可堪一用的系统只有一个，GitHub链接如下。需注意，1.x.x是v13版本，2.x.x是v14。下载后上传至服务器的`Data/systems`即可。

<bookmark name="GitHub - Foundryborne/daggerheart: An unofficial Foundry VTT implementation of the Daggerheart syste" href="https://github.com/Foundryborne/daggerheart"></bookmark>

然后是汉化，需要安装mod babele。

<bookmark name="Simone Ricciardi / FoundryVTT Babele · GitLab" href="https://gitlab.com/riccisi/foundryvtt-babele"></bookmark>

然后在下方的仓库下载所有文件，其中core与fvtt-daggerheart-cn文件夹内的内容作为mod安装。

<callout emoji="❗">
**下方为核心汉化，一定要下载，如果出问题请检查版本是否为v13/1.9.x**
</callout>

<bookmark name="GitHub - dqqql/dh_cn: 匕首之心fvtt系统的汉化" href="https://github.com/dqqql/dh_cn"></bookmark>

The void的资源，作为mod安装。

<bookmark name="GitHub - brunocalado/the-void-unofficial" href="https://github.com/brunocalado/the-void-unofficial?tab=readme-ov-file"></bookmark>



核心设置如下。

- 希望与恐惧：勾选后会根据掷骰结果自动计算。
- 倒计时自动化：建议关闭，自带的不好用。
- 显示恐惧：有进度条和格子两种。也可以隐藏，用其他mod替代。

<grid>
<column width-ratio="0.500000">
![图片展示了《匕首之心》游戏的自动化设置界面。界面有常规、死亡行动、投骰三个选项卡，当前显示常规选项卡。常规设置中，希望与恐惧、摘要消息、Vulnerable Automation、效果距离依赖、自动升级等选项被勾选，显示资源变动滚动文本也被勾选。GM、玩家等角色的伤害、效果等选项有勾选和未勾选状态。。](https://feishu.cn/file/JiOobKm6BoAIcrxNmeqcIw5QnSg)
</column>
<column width-ratio="0.500000">
![图片展示的是《匕首之心》游戏的外观设置界面。界面中“常规”选项卡下，有“固定显示资源”“显示恐惧”“展示倒计时UI”“显示Foundry状态效果”“持续显示Token之间的的距离”“隐藏归因”等选项，部分选项有下拉菜单。下方“自动展开描述”部分，有“角色”“敌人”“环境”“物品”“描述”“公式”“伤害/治疗”“目标”等选项，其中“描述”选项被勾选。该界面与文档中核心汉化设置相关，是游戏设置的一部分。](https://feishu.cn/file/RFO2bVAVZoA6AWxHXlmcl0T3n1g)
</column>
</grid>

### mod推荐

目前mod数量非常少，我挑出了其中常用且易用的列举在下面。有mod需求的，也可直接在上述仓库提issue。标红的建议开启，标绿的是某些mod的前置mod。

![图片展示的是《匕首之心》mod推荐列表。列表中包含多个mod名称，如BTFG、Art for Daggerheart、Automated Animations等，每个mod名称右侧有图标、作者信息及版本号。其中，Babele Translation Files Generator、Art for Daggerheart、Automated Animations等mod被勾选。该图片与文档中mod推荐部分对应，直观呈现了文档中提到的mod名称及部分信息，帮助玩家快速了解可安装的mod。](https://feishu.cn/file/FhYnbfM0FouP4kxCtJEcRn0Fnxg)

![图片展示的是《匕首之心》mod推荐中部分mod的列表。列表包含Koboldworks - Data Inspector、libWrapper、Prime Performance、PSFX - Peri's Sound Effects、Quick Insert - Search Widget、Sequencer、socketlib、Theatre Inserts、Translation: 中文 \[匕首之心\]、Translation: 中文 \[Core\]等mod，每个mod右侧有图标、版本号及安装状态。其中Translation: 中文 \[Core\]的版本号为13.350，安装状态为已安装。该图片与文档中mod推荐部分上下文对应，直观呈现了部分mod信息。](https://feishu.cn/file/GoSObI42aoi4lux3IuLc7qkmnnb)

- BTFG：自己添加babele翻译会用的mod，不需要可以不装
- Art for daggerheart：给怪物添加立绘与token。（所有怪物都有，而且有两套）
- aa：动画mod
- Babele：汉化mod
- Boss splash:boss出场动画

![这张图片对应《匕首之心》的相关游戏界面，画面呈现了带有水域、植被、帐篷等元素的游戏场景，中间有醒目的黄底粉边横幅，标注有“BEAR”字样。画面右侧有一张凶狠咆哮的棕熊插画，界面右侧还带有列表选项栏，整体是该游戏使用对应动画、界面类mod后的场景效果，和上下文提及的动画、界面类mod推荐内容相匹配，直观展现了添加这类mod后游戏内的画面呈现。](https://feishu.cn/file/YvgybAjXPoOQ2tx8vBZcqdr2nAe)

- Dh hud：优化默认hud
- Dh plus：各种优化，包括聊天框，ui，角色卡。
- Dh critical：大成功时有特殊音效与动画
- Dh distances：显示距离

![图片展示了《原神》游戏中的地图界面。画面中有一个角色头像，周围有黄色圆环标识的区域，显示距离为200米。地图上还分布着多个标记点，有不同图标和数字标识，如“1”“2”等。右上角有聊天窗口，显示着玩家之间的对话。左下角有角色头像、生命值等信息。该图片与文档中“Dh distances：显示距离”内容相关，直观呈现了该mod在游戏中的显示效果。](https://feishu.cn/file/Lxz5b8fxooGeVLxjbE3cJ58ynA4)

- Dh fear macros：自动追踪恐惧点，发消息提示

![图片展示了两个模组“Dh fear macros”的界面。上方界面标题为“恐惧-1”，显示“紧绷的气息稍稍缓和，你们暂时夺回了一丝喘息之机。”下方界面标题为“恐惧+1”，显示“空气骤然沉重，某种无形的威胁再次逼近。”这些界面与上下文提到的“Dh fear macros：自动追踪恐惧点，发消息提示”相呼应，直观呈现了该模组在游戏中的恐惧提示效果。](https://feishu.cn/file/Vke6bAj1RoEkfkxwmw7c24P9nhc)

- Sleek ui：角色卡ui
- Dsn：3D骰子
- Dice tray：骰盘
- Great enemy felled：sora的付费mod，提供一个黑魂结算画面

![图片展示的是游戏《原神》中“Great Enemy Felled”（大敌已倒）的结算画面。画面中央以大号金色字体显示“GREAT ENEMY FELLED”，背景为游戏地图，地图上有角色头像、装备图标等元素。该mod由sora开发，提供一个类似黑魂游戏的结算画面，与文档中mod推荐部分上下文对应，是玩家在游戏过程中可选择安装的付费mod。](https://feishu.cn/file/EH60bQ4Teo9D2kxhAIjcrPt8nyc)

- Ionrift：给攻击添加动画，需要jb2a与psfx
- jb2a：动画资源
- Data inspector：查找属性名，不进行mod开发和调代码的可以不装
- Libwrapper
- Prime：优化性能
- Psfx：音效mod
- Quick insert：快速搜索各种东西
- Sequencer：动画相关
- socketlib：依赖
- Theatre：小剧场
- 翻译：上述仓库的两个mod。
- DH-light:我自己写的聚光灯mod。https://github.com/dqqql/DH-Light

![图片展示的是《最终幻想7：重制版》中角色卡UI界面。界面上方有四个角色头像，分别是阿萨辛、格鸣、雷恩二世和一个未命名角色。下方有一个绿色的骰盘，骰子上显示着雷恩二世的头像。界面右侧有多个图标，包括设置、齿轮、手形等。该界面与文档中“Sleek ui：角色卡ui”内容相关，直观呈现了角色卡UI的实际样式。](https://feishu.cn/file/O2XLbekb2oFQeexF1CocgD9ynEd)



### 宏

有一些小功能比较轻量，用宏即可实现，不需要mod，收录在此。

```JavaScript
const MODULE_KEY = "__dh_duality_dice_chat_hook__";

if (globalThis[MODULE_KEY]) {
  Hooks.off("chatMessage", globalThis[MODULE_KEY]);
  delete globalThis[MODULE_KEY];
  ui.notifications.info("骰娘监听已关闭。");
} else {
  const escapeHtml = value => String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  }[char]));

  const modToFormula = mod => {
    if (mod > 0) return ` + ${mod}`;
    if (mod < 0) return ` - ${Math.abs(mod)}`;
    return "";
  };

  const modToText = mod => mod >= 0 ? `+${mod}` : `${mod}`;

  const normalizeMode = raw => {
    const mode = raw?.toLowerCase() ?? "";
    if (mode === "div") return "dis";
    return mode;
  };

  const modeToText = mode => {
    if (mode === "adv") return "优势";
    if (mode === "dis") return "劣势";
    return "普通";
  };

  const parseArgs = rawArgs => {
    const parts = rawArgs?.trim() ? rawArgs.trim().split(/\s+/) : [];

    let mode = "";
    let mod = 0;
    const labelParts = [];

    for (const part of parts) {
      const lower = part.toLowerCase();

      if (!mode && ["adv", "dis", "div"].includes(lower)) {
        mode = normalizeMode(lower);
        continue;
      }

      if (/^[+-]\d+$/.test(part)) {
        mod += Number.parseInt(part, 10);
        continue;
      }

      labelParts.push(part);
    }

    return {
      mode,
      mod,
      label: labelParts.join(" ").trim()
    };
  };

  const getDiceText = roll => {
    if (!roll?.dice?.length) return "—";

    return roll.dice.map(die => {
      const faces = die.faces ?? "?";

      const values = die.results.map(r => {
        const value = r.result;

        if (r.discarded) return `${value}×`;
        if (r.rerolled) return `${value}↻`;
        if (r.exploded) return `${value}!`;

        return `${value}`;
      }).join(", ");

      return `d${faces}：${values}`;
    }).join("；");
  };

  const buildRollFormula = (baseFormula, mode, extraMod) => {
    let formula = baseFormula.trim();

    // .rd20 等价于 .r1d20
    if (/^d20$/i.test(formula)) {
      formula = "1d20";
    }

    // 只有 d20 攻击才处理优势 / 劣势
    // .rd20 adv +2      -> 2d20kh + 2
    // .r1d20+3 dis      -> 2d20kl+3
    // .r2d8+2 adv       -> 2d8+2，不额外处理优势
    const isD20Attack = /^1?d20(?:[+-]\d+)?$/i.test(formula);

    if (isD20Attack && mode === "adv") {
      formula = formula.replace(/^1?d20/i, "2d20kh");
    }

    if (isD20Attack && mode === "dis") {
      formula = formula.replace(/^1?d20/i, "2d20kl");
    }

    formula += modToFormula(extraMod);

    return formula;
  };

  const createSimpleRollCard = async ({ label, formula, mode, mod }) => {
    const roll = new Roll(formula);
    await roll.evaluate({ async: true });

    const diceText = getDiceText(roll);

    const content = `
      <div style="
        padding: 10px 12px;
        border: 1px solid #c9b27a;
        border-radius: 8px;
        background: rgba(255,248,235,0.96);
        line-height: 1.35;
      ">
        <div style="
          font-size: 22px;
          font-weight: 700;
          margin-bottom: 8px;
          color: #1f1b16;
        ">
          ${escapeHtml(label)}
        </div>

        <div style="
          font-size: 34px;
          font-weight: 800;
          line-height: 1;
          margin-bottom: 8px;
          color: #000;
        ">
          ${roll.total}
        </div>

        <div style="
          font-size: 13px;
          color: #3a332c;
          border-top: 1px solid rgba(120, 90, 40, 0.25);
          padding-top: 8px;
        ">
          <div><strong>模式：</strong>${modeToText(mode)}</div>
          <div><strong>调整：</strong>${modToText(mod)}</div>
          <div><strong>骰值：</strong>${escapeHtml(diceText)}</div>
          <div><strong>公式：</strong>${escapeHtml(formula)}</div>
        </div>
      </div>
    `;

    await ChatMessage.create({
      user: game.user.id,
      speaker: ChatMessage.getSpeaker(),
      content,
      rolls: [roll],
      type: CONST.CHAT_MESSAGE_TYPES.ROLL
    });
  };

  const createDualityRollCard = async ({ label, mode, mod }) => {
    let formula = "1d12[希望] + 1d12[恐惧]";

    formula += modToFormula(mod);

    if (mode === "adv") formula += " + 1d6[优势]";
    if (mode === "dis") formula += " - 1d6[劣势]";

    const roll = new Roll(formula);
    await roll.evaluate({ async: true });

    const hopeDie = roll.dice[0]?.results[0]?.result ?? 0;
    const fearDie = roll.dice[1]?.results[0]?.result ?? 0;

    let resultText = "关键成功";
    let resultColor = "#6b7280";

    if (hopeDie > fearDie) {
      resultText = "希望结果";
      resultColor = "#2e8b57";
    } else if (fearDie > hopeDie) {
      resultText = "恐惧结果";
      resultColor = "#8b2e2e";
    }

    const cleanFormula = formula
      .replace(/\[[^\]]*\]/g, "")
      .replace(/\s+/g, " ")
      .trim();

    const content = `
      <div style="
        padding: 12px 14px;
        border: 1px solid #c9b27a;
        border-radius: 8px;
        background: rgba(255,248,235,0.96);
        line-height: 1.35;
        color: #2f2923;
      ">
        <div style="
          font-size: 24px;
          font-weight: 700;
          margin-bottom: 10px;
          color: #1f1b16;
        ">
          ${escapeHtml(label)}
        </div>

        <div style="
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 10px;
        ">
          <div>
            <div style="
              font-size: 12px;
              color: #6b6256;
              margin-bottom: 2px;
            ">总值</div>
            <div style="
              font-size: 42px;
              font-weight: 800;
              line-height: 1;
              color: #000;
            ">
              ${roll.total}
            </div>
          </div>

          <span style="
            display: inline-block;
            padding: 4px 10px;
            border-radius: 999px;
            background: ${resultColor};
            color: white;
            font-size: 12px;
            font-weight: 700;
            white-space: nowrap;
          ">
            ${resultText}
          </span>
        </div>

        <div style="
          display: flex;
          gap: 8px;
          margin-bottom: 10px;
        ">
          <div style="
            flex: 1;
            border: 1px solid #8fbf9f;
            border-radius: 6px;
            padding: 8px 10px;
            background: rgba(232, 247, 237, 0.95);
          ">
            <div style="
              font-size: 12px;
              font-weight: 700;
              color: #245c38;
              margin-bottom: 2px;
            ">希望</div>
            <div style="
              font-size: 22px;
              font-weight: 700;
              color: #245c38;
              line-height: 1.1;
            ">${hopeDie}</div>
          </div>

          <div style="
            flex: 1;
            border: 1px solid #c89a9a;
            border-radius: 6px;
            padding: 8px 10px;
            background: rgba(250, 234, 234, 0.95);
          ">
            <div style="
              font-size: 12px;
              font-weight: 700;
              color: #7a2020;
              margin-bottom: 2px;
            ">恐惧</div>
            <div style="
              font-size: 22px;
              font-weight: 700;
              color: #7a2020;
              line-height: 1.1;
            ">${fearDie}</div>
          </div>
        </div>

        <div style="
          border-top: 1px solid rgba(120, 90, 40, 0.25);
          padding-top: 8px;
          font-size: 13px;
        ">
          <div><strong>模式：</strong>${modeToText(mode)}　<strong>调整：</strong>${modToText(mod)}</div>
          <div><strong>公式：</strong>${escapeHtml(cleanFormula)}</div>
        </div>
      </div>
    `;

    await ChatMessage.create({
      user: game.user.id,
      speaker: ChatMessage.getSpeaker(),
      content,
      rolls: [roll],
      type: CONST.CHAT_MESSAGE_TYPES.ROLL
    });
  };

  const handler = (chatLog, messageText, chatData) => {
    const text = messageText.trim();

    // 二元掷骰：
    // .dd
    // .dd +2
    // .dd adv +2 +3 攻击
    // .dd dis -1 +2 潜行
    const ddMatch = text.match(/^\.dd(?:\s+(.+))?$/i);

    if (ddMatch) {
      const { mode, mod, label } = parseArgs(ddMatch[1] ?? "");

      createDualityRollCard({
        label: label || "二元掷骰",
        mode,
        mod
      });

      return false;
    }

    // 普通掷骰：
    // .rd20
    // .rd20 adv +2 +3 攻击
    // .r2d8+2 +3 伤害
    // .r1d12+3 感知
    const rMatch = text.match(/^\.r\s*([^\s]+)(?:\s+(.+))?$/i);

    if (rMatch) {
      const baseFormula = rMatch[1].trim();
      const { mode, mod, label } = parseArgs(rMatch[2] ?? "");

      const formula = buildRollFormula(baseFormula, mode, mod);

      createSimpleRollCard({
        label: label || "普通掷骰",
        formula,
        mode,
        mod
      });

      return false;
    }

    return true;
  };

  globalThis[MODULE_KEY] = handler;
  Hooks.on("chatMessage", handler);

  ui.notifications.info("骰娘监听已开启。可用：.dd adv +2 +3 攻击 / .rd20 adv +2 攻击 / .r2d8+2 伤害");
}
```



### 懒人包

该懒人包收录了上面大部分mod，还包含了一个预设的设置。

https://pan.baidu.com/s/1eWABk5n-zh8yjZSfZTQokw?pwd=t5q4 