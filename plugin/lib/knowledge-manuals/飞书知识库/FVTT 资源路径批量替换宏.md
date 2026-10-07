# FVTT 资源路径批量替换宏

将FVTT的图片资源路径进行批量替换的宏，包括场景，物品还有角色

```Bash
/**
 * FVTT 资源路径批量替换宏 (V12 - 全能版 + 日志支持)
 * 作者: AI Assistant
 * 兼容性: V10, V11, V12
 * 更新: 
 *   - 新增: 添加了 "日志 (Journal)" 支持。
 *     1. 支持替换类型为"图片"的页面路径。
 *     2. 支持深入文本编辑器(HTML)内部，替换嵌入图片的 src 路径。
 *   - 继承: 包含场景、角色、物品、URL解码、文件名修复等所有功能。
 */

// --- 全局缓存 ---
const DIRECTORY_CACHE = new Map();

new Dialog({
  title: "全能路径修复工具 (含日志版)",
  content: `
    <form style="margin-bottom: 10px;">
      <div class="form-group">
        <label><strong>1. 处理对象:</strong></label>
        <div class="form-fields">
          <select id="process-mode">
            <option value="scene">场景 (Scenes)</option>
            <option value="actor">角色 (Actors)</option>
            <option value="item">物品 (Items)</option>
            <option value="journal">日志 (Journal)</option>
          </select>
        </div>
      </div>

      <!-- 角色专用选项 -->
      <div class="form-group" id="actor-options" style="display:none; background: #e0f0ff; padding: 5px; border-radius: 5px; border: 1px solid #aaccff;">
        <label>角色替换目标:</label>
        <div class="form-fields">
          <select id="actor-target">
            <option value="token">仅 Token 图标 (原型)</option>
            <option value="portrait">仅 立绘/头像 (Art)</option>
            <option value="both">两者都替换</option>
          </select>
        </div>
      </div>

      <div class="form-group">
        <label>查找内容 (源):</label>
        <div class="form-fields">
          <input type="text" id="find-text" placeholder="留空 = 仅匹配根目录">
        </div>
      </div>
      
      <div class="form-group">
        <label>替换为 (目标):</label>
        <div class="form-fields">
          <input type="text" id="replace-text" placeholder="留空则保持路径不变">
        </div>
      </div>

      <div class="form-group">
        <label>文件名过滤 (可选):</label>
        <div class="form-fields">
          <input type="text" id="filter-text" placeholder="例如: sword">
        </div>
      </div>
      
      <div style="background: #fff0f0; padding: 5px; border: 1px solid #ffcccc; border-radius: 5px;">
        <div class="form-group" style="margin-bottom: 5px;">
          <label><strong>启用硬盘文件扫描?</strong></label>
          <div class="form-fields">
            <input type="checkbox" id="enable-scan" checked>
          </div>
        </div>
        
        <div class="form-group" style="margin-bottom: 0;">
          <label><strong>强制将空格转横杠 (-)?</strong></label>
          <div class="form-fields">
            <input type="checkbox" id="replace-space-dash" checked>
          </div>
        </div>
        <p class="notes" style="font-size:0.8em; margin-top:3px;">
          修复 "Hell%20Hound.webp" -> "hell-hound.webp"
        </p>
      </div>

      <div class="form-group" style="margin-top: 10px;">
        <label>操作范围:</label>
        <div class="form-fields">
          <select id="target-scope">
            <option value="current">当前 (场景 / 选中Token的角色)</option>
            <option value="all">全部 (所有场景 / 所有角色)</option>
          </select>
        </div>
      </div>
      
      <hr>
      <p class="notes" style="color: darkred; font-weight: bold;">⚠️ 执行前请按 F12 打开控制台查看日志</p>
    </form>
  `,
  render: (html) => {
    const modeSelect = html.find("#process-mode");
    const actorOptions = html.find("#actor-options");
    const scopeSelect = html.find("#target-scope");

    // 界面交互逻辑
    modeSelect.change(function() {
      const val = this.value;
      
      // 1. 角色选项显示控制
      if (val === "actor") {
        actorOptions.slideDown(200);
      } else {
        actorOptions.slideUp(200);
      }

      // 2. 范围文字更新
      const optCurrent = scopeSelect.find("option[value='current']");
      const optAll = scopeSelect.find("option[value='all']");

      if (val === "scene") {
        optCurrent.text("仅当前场景 (Current Scene)");
        optAll.text("所有场景 (All Scenes)");
        scopeSelect.val("current");
        scopeSelect.prop("disabled", false);
      } else if (val === "actor") {
        optCurrent.text("仅当前选中 Token 的源角色");
        optAll.text("侧边栏所有角色 (All Actors)");
        scopeSelect.val("current");
        scopeSelect.prop("disabled", false);
      } else if (val === "item") {
        optCurrent.text("❌ 无效 (物品请选全部)");
        optAll.text("侧边栏所有物品 (World Items)");
        scopeSelect.val("all");
      } else if (val === "journal") {
        optCurrent.text("❌ 无效 (日志请选全部)");
        optAll.text("侧边栏所有日志 (All Journals)");
        scopeSelect.val("all");
      }
    });
  },
  buttons: {
    yes: {
      icon: "<i class='fas fa-check'></i>",
      label: "执行修复",
      callback: async (html) => {
        DIRECTORY_CACHE.clear();
        console.log("--------------- 开始批量路径修复 ---------------");

        const mode = html.find("#process-mode").val();
        const actorTarget = html.find("#actor-target").val();
        let findText = html.find("#find-text").val().trim();
        let replaceText = html.find("#replace-text").val().trim();
        const filterText = html.find("#filter-text").val().trim();
        const scope = html.find("#target-scope").val();
        
        const enableScan = html.find("#enable-scan").is(":checked");
        const spaceToDash = html.find("#replace-space-dash").is(":checked");

        // 路径标准化
        findText = findText.replaceAll("\\", "/");
        replaceText = replaceText.replaceAll("\\", "/");
        if (findText.toLowerCase().startsWith("data/")) findText = findText.substring(5);
        if (replaceText.toLowerCase().startsWith("data/")) replaceText = replaceText.substring(5);

        // 收集文档对象
        let docs = [];
        let docLabel = "";

        if (mode === "scene") {
            docLabel = "场景";
            if (scope === "current") {
                if (!canvas.scene) return ui.notifications.warn("当前没有激活的场景。");
                docs = [canvas.scene];
            } else {
                docs = Array.from(game.scenes);
            }
        } else if (mode === "actor") {
            docLabel = "角色";
            if (scope === "current") {
                const selectedTokens = canvas.tokens.controlled;
                if (selectedTokens.length === 0) return ui.notifications.warn("请先选中 Token。");
                docs = [...new Set(selectedTokens.map(t => t.actor).filter(a => a))];
            } else {
                docs = Array.from(game.actors);
            }
        } else if (mode === "item") {
            docLabel = "物品";
            docs = Array.from(game.items);
            if (scope === "current") ui.notifications.info("提示：物品模式默认处理'所有物品'。");
        } else if (mode === "journal") {
            docLabel = "日志";
            docs = Array.from(game.journal);
            if (scope === "current") ui.notifications.info("提示：日志模式默认处理'所有日志'。");
        }

        const confirm = await Dialog.confirm({
          title: "确认操作",
          content: `<p>即将处理 <strong>${docs.length}</strong> 个${docLabel}。</p>
                    <p>按 <strong>F12</strong> 可在控制台查看详细匹配过程。</p>
                    <p>确定要继续吗？</p>`
        });

        if (confirm) {
          ui.notifications.info("正在扫描... (查看 F12 获取详情)");
          let report = [];
          
          if (mode === "scene") {
            report = await processScenes(docs, findText, replaceText, filterText, enableScan, spaceToDash);
          } else if (mode === "actor") {
            report = await processActors(docs, findText, replaceText, filterText, actorTarget, enableScan, spaceToDash);
          } else if (mode === "item") {
            report = await processItems(docs, findText, replaceText, filterText, enableScan, spaceToDash);
          } else if (mode === "journal") {
            report = await processJournals(docs, findText, replaceText, filterText, enableScan, spaceToDash);
          }

          showReport(report);
          console.log("--------------- 结束 ---------------");
        }
      }
    },
    no: { icon: "<i class='fas fa-times'></i>", label: "取消" }
  },
  default: "no"
}).render(true);

/** ---------------- 核心逻辑 ---------------- */

// 路径修复与扫描 (含 URL 解码)
async function correctPathCase(proposedPath, spaceToDash) {
    if (!proposedPath) return "";
    
    const lastSlash = proposedPath.lastIndexOf("/");
    if (lastSlash === -1) return proposedPath; 

    const folder = proposedPath.substring(0, lastSlash);
    const rawFilename = proposedPath.substring(lastSlash + 1);
    
    if (!rawFilename || !rawFilename.includes(".")) return proposedPath;

    let filesInFolder = [];
    if (DIRECTORY_CACHE.has(folder)) {
        filesInFolder = DIRECTORY_CACHE.get(folder);
    } else {
        try {
            const result = await FilePicker.browse("data", folder);
            filesInFolder = result.files.map(f => decodeURIComponent(f));
            DIRECTORY_CACHE.set(folder, filesInFolder);
        } catch (err) {
            console.warn(`[扫描失败] 无法读取文件夹: ${folder}`, err);
            DIRECTORY_CACHE.set(folder, null); 
            return proposedPath;
        }
    }

    if (!filesInFolder) return proposedPath; 

    const decodedFilename = decodeURIComponent(rawFilename);
    const targetLower = decodedFilename.toLowerCase();
    
    let targetDashed = "";
    if (spaceToDash) {
        targetDashed = targetLower.replaceAll(" ", "-");
    }

    const match = filesInFolder.find(f => {
        const fLower = f.toLowerCase();
        if (fLower.endsWith("/" + targetLower) || fLower === targetLower) return true;
        if (spaceToDash && targetDashed) {
            if (fLower.endsWith("/" + targetDashed) || fLower === targetDashed) return true;
        }
        return false;
    });

    if (match) {
        const realFilename = match.substring(match.lastIndexOf("/") + 1);
        const fixedPath = folder + "/" + realFilename;
        if (fixedPath !== proposedPath && decodeURIComponent(fixedPath) !== decodeURIComponent(proposedPath)) {
             console.log(`[修复成功] ${rawFilename} -> ${realFilename}`);
        }
        return fixedPath;
    }
    return proposedPath;
}

async function getFinalPath(oldPath, find, replace, enableScan, spaceToDash) {
    const calculatedPath = calculateNewPath(oldPath, find, replace);
    if (enableScan) {
        const corrected = await correctPathCase(calculatedPath, spaceToDash);
        return corrected;
    }
    return calculatedPath;
}

function calculateNewPath(oldPath, find, replace) {
    if (!oldPath) return "";
    if (!find) {
        if (oldPath.includes("/")) return oldPath; 
        return replace + oldPath;
    }
    return oldPath.replaceAll(find, replace);
}

function shouldReplace(path, find, filter) {
    if (!path) return false;
    const decodedPath = decodeURIComponent(path).toLowerCase();
    if (filter) {
        const decodedFilter = decodeURIComponent(filter).toLowerCase();
        if (!decodedPath.includes(decodedFilter)) return false; 
    }
    if (!find) {
        if (path.includes("/")) return false;
        if (path.startsWith("icons/")) return false; 
        return true;
    } else {
        return path.toLowerCase().includes(find.toLowerCase());
    }
}

/** ---------------- 遍历处理函数 ---------------- */

// --- 新增：处理日志 (Journals) ---
async function processJournals(journals, find, replace, filter, enableScan, spaceToDash) {
    let reportLog = [];
    
    for (let journal of journals) {
        const pagesToUpdate = [];
        // 遍历日志页面
        for (let page of journal.pages) {
            let pageUpdates = {};
            let hasChange = false;

            // 情况 1: 页面类型是图片 (Image Page)
            if (page.type === "image" && page.src) {
                if (shouldReplace(page.src, find, filter)) {
                    const newPath = await getFinalPath(page.src, find, replace, enableScan, spaceToDash);
                    if (newPath !== page.src) {
                        pageUpdates["src"] = newPath;
                        reportLog.push({ source: `${journal.name} [页: ${page.name}]`, type: "日志图片页", old: page.src, new: newPath });
                        hasChange = true;
                    }
                }
            }

            // 情况 2: 页面类型是文本 (Text Page)，需要处理 HTML 内部的 <img> 标签
            if (page.type === "text" && page.text?.content) {
                let content = page.text.content;
                // 正则匹配所有 img src
                const imgRegex = /<img[^>]+src="([^">]+)"/g;
                let match;
                let replacements = [];

                // 先收集需要替换的项 (不支持在正则循环中直接 await 替换)
                while ((match = imgRegex.exec(content)) !== null) {
                    const originalSrc = match[1];
                    if (shouldReplace(originalSrc, find, filter)) {
                        const newSrc = await getFinalPath(originalSrc, find, replace, enableScan, spaceToDash);
                        if (newSrc !== originalSrc) {
                            replacements.push({ old: originalSrc, new: newSrc });
                        }
                    }
                }

                // 统一执行文本替换
                if (replacements.length > 0) {
                    // 去重，防止同一个图片在同一页多次出现被重复处理
                    const uniqueReplacements = [...new Set(replacements.map(JSON.stringify))].map(JSON.parse);
                    
                    for (let r of uniqueReplacements) {
                        // 使用全局替换，确保 HTML 中所有相同的引用都被修正
                        content = content.replaceAll(r.old, r.new);
                        reportLog.push({ source: `${journal.name} [HTML: ${page.name}]`, type: "日志内嵌图", old: r.old, new: r.new });
                    }
                    pageUpdates["text.content"] = content;
                    hasChange = true;
                }
            }

            // 如果该页有变动，加入更新队列
            if (hasChange) {
                pageUpdates["_id"] = page.id;
                pagesToUpdate.push(pageUpdates);
            }
        }

        // 批量更新该日志下的所有页面
        if (pagesToUpdate.length > 0) {
            await journal.updateEmbeddedDocuments("JournalEntryPage", pagesToUpdate);
        }
    }
    return reportLog;
}

// 处理物品 (Items)
async function processItems(items, find, replace, filter, enableScan, spaceToDash) {
    let reportLog = [];
    for (let item of items) {
        let updates = {};
        const img = item.img || "";
        if (img && img !== "icons/svg/item-bag.svg") {
            if (shouldReplace(img, find, filter)) {
                const newPath = await getFinalPath(img, find, replace, enableScan, spaceToDash);
                if (newPath !== img) {
                    updates["img"] = newPath;
                    reportLog.push({ source: item.name, type: "物品图标", old: img, new: newPath });
                }
            }
        }
        if (!isEmpty(updates)) await item.update(updates);
    }
    return reportLog;
}

// 处理角色 (Actors)
async function processActors(actors, find, replace, filter, subType, enableScan, spaceToDash) {
    let reportLog = [];
    for (let actor of actors) {
        let updates = {};
        if (subType === "portrait" || subType === "both") {
            const img = actor.img || "";
            if (shouldReplace(img, find, filter)) {
                const newPath = await getFinalPath(img, find, replace, enableScan, spaceToDash);
                if (newPath !== img) {
                    updates["img"] = newPath;
                    reportLog.push({ source: actor.name, type: "角色头像", old: img, new: newPath });
                }
            }
        }
        if (subType === "token" || subType === "both") {
            const tokenSrc = actor.prototypeToken?.texture?.src || "";
            if (shouldReplace(tokenSrc, find, filter)) {
                const newPath = await getFinalPath(tokenSrc, find, replace, enableScan, spaceToDash);
                if (newPath !== tokenSrc) {
                    updates["prototypeToken.texture.src"] = newPath;
                    reportLog.push({ source: actor.name, type: "Token原型", old: tokenSrc, new: newPath });
                }
            }
        }
        if (!isEmpty(updates)) await actor.update(updates);
    }
    return reportLog;
}

// 处理场景 (Scenes)
async function processScenes(scenes, find, replace, filter, enableScan, spaceToDash) {
  let reportLog = [];
  for (let scene of scenes) {
    let sceneUpdates = {};
    const bg = scene.background?.src || ""; 
    const fg = scene.foreground || "";
    
    if (shouldReplace(bg, find, filter)) {
      const newPath = await getFinalPath(bg, find, replace, enableScan, spaceToDash);
      if (newPath !== bg) { 
          sceneUpdates["background.src"] = newPath;
          reportLog.push({ source: scene.name, type: "背景图", old: bg, new: newPath });
      }
    }
    if (shouldReplace(fg, find, filter)) {
      const newPath = await getFinalPath(fg, find, replace, enableScan, spaceToDash);
      if (newPath !== fg) {
          sceneUpdates["foreground"] = newPath;
          reportLog.push({ source: scene.name, type: "前景图", old: fg, new: newPath });
      }
    }
    if (!isEmpty(sceneUpdates)) await scene.update(sceneUpdates);

    const tilesToUpdate = [];
    for (let tile of scene.tiles) {
      const src = tile.texture?.src || "";
      if (shouldReplace(src, find, filter)) {
        const newPath = await getFinalPath(src, find, replace, enableScan, spaceToDash);
        if (newPath !== src) {
            tilesToUpdate.push({ _id: tile.id, "texture.src": newPath });
            reportLog.push({ source: scene.name, type: "图块", old: src, new: newPath });
        }
      }
    }
    if (tilesToUpdate.length) await scene.updateEmbeddedDocuments("Tile", tilesToUpdate);

    const tokensToUpdate = [];
    for (let token of scene.tokens) {
      const src = token.texture?.src || "";
      if (shouldReplace(src, find, filter)) {
        const newPath = await getFinalPath(src, find, replace, enableScan, spaceToDash);
        if (newPath !== src) {
            tokensToUpdate.push({ _id: token.id, "texture.src": newPath });
            reportLog.push({ source: scene.name, type: "场景Token", old: src, new: newPath });
        }
      }
    }
    if (tokensToUpdate.length) await scene.updateEmbeddedDocuments("Token", tokensToUpdate);

    const soundsToUpdate = [];
    for (let sound of scene.sounds) {
      const path = sound.path || "";
      if (shouldReplace(path, find, filter)) {
        const newPath = await getFinalPath(path, find, replace, enableScan, spaceToDash);
        if (newPath !== path) {
            soundsToUpdate.push({ _id: sound.id, "path": newPath });
            reportLog.push({ source: scene.name, type: "音效", old: path, new: newPath });
        }
      }
    }
    if (soundsToUpdate.length) await scene.updateEmbeddedDocuments("AmbientSound", soundsToUpdate);
  }
  return reportLog;
}

// 报告弹窗
function showReport(report) {
  if (report.length === 0) return ui.notifications.info("未发现需要修改的文件 (请检查 F12 日志)");

  let html = `
    <div style="max-height: 500px; overflow-y: auto;">
      <table style="width:100%; font-size:12px; border-collapse: collapse;">
        <thead style="background:#333; color:#fff;">
          <tr><th style="padding:5px;">来源</th><th>类型</th><th>旧路径 &raquo; 新路径</th></tr>
        </thead>
        <tbody>`;
  
  report.forEach(r => {
    html += `
      <tr style="border-bottom:1px solid #ccc;">
        <td style="padding:4px;"><strong>${r.source}</strong></td>
        <td>${r.type}</td>
        <td style="word-break:break-all;">
          <div style="color:#a00; text-decoration:line-through; font-size:0.9em;">${r.old}</div>
          <div style="color:#080; font-weight:bold;">${r.new}</div>
        </td>
      </tr>`;
  });

  html += `</tbody></table></div>`;

  new Dialog({
    title: `处理结果 (修复了 ${report.length} 处)`,
    content: html,
    buttons: { ok: { label: "关闭", icon: "<i class='fas fa-check'></i>" } }
  }, { width: 700, height: 600 }).render(true);
}
```