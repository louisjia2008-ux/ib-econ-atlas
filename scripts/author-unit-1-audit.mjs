import fs from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';
import { contentRoot, readYaml, loadKnowledgePoint } from './content-utils.mjs';
// Keep stable IDs and coursebook navigation; use only the two official Unit 1 sections.
const file=path.join(contentRoot,'manifest.yaml');
const manifest=readYaml(file);
for(const entry of manifest.entries.filter(e=>e.id.startsWith('u1-'))) {
 const n=Number(entry.id.slice(3,5));
 entry.section=(n<=23 || (n>=25&&n<=29) || n===44)?'1.1':'1.2';
 entry.level='core';
}
const id='u1-44-circular-flow';
if(!manifest.entries.some(e=>e.id===id))manifest.entries.push({id,section:'1.1',level:'core',title:{'zh-CN':'收入循环、漏出与注入',en:'Circular flow, leakages and injections'},pages:[15]});
manifest.entries.find(e=>e.id===id).pages=[15];
for(const section of ['1.3','1.4','1.5'])delete manifest.releaseCounts[section];
manifest.releaseCounts['1.1']=29;manifest.releaseCounts['1.2']=15;
manifest.entries.sort((a,b)=>a.id.localeCompare(b.id));
fs.writeFileSync(file,YAML.stringify(manifest));
// Regenerate all original cards with their audited, topic-specific distractors.
for(const part of ['1-1','1-2','1-3','1-4','1-5'])await import(`./content-data/unit-${part}.mjs`);
const {writeTopics}=await import('./author-content.mjs');
const source=loadKnowledgePoint('u3-01-circular-flow');
const localized=(locale)=>({
 ...source.content[locale],
 title:locale==='en'?'Circular flow, leakages and injections':'收入循环、漏出与注入',
 synonyms:locale==='en'?['circular flow','leakages','injections']:['收入循环','漏出','注入'],
 example:{title:locale==='en'?'Original household–firm scenario':'原创家庭与企业情境',explanation:locale==='en'?'Households provide labour and receive wages, then buy output. Saving, taxes and imports are leakages; investment, government purchases and exports are injections. This is a model illustration, not an observed country case.':'家庭提供劳动获得工资并购买产出；储蓄、税收、进口为漏出，投资、政府购买、出口为注入。这是模型教学情境，不是国家观测。'},
 explanation:source.content[locale].explanation+(locale==='en'?'\n\nReal flows describe factors and goods; money flows describe payments. A two-sector model omits banks, government and foreign trade, while the five-sector version makes their links explicit.':'\n\n实际流量指要素与商品，货币流量指支付。两部门模型省略金融、政府和国外，五部门模型明确其联系。'),
});
writeTopics([{id,diagramIds:['audit-circular-flow'],sourceUrl:'https://www.bankofengland.co.uk/education/education-resources',observedAt:'2026-10-18',textbookRefs:[{chapter:'1',section:'1.3',pages:[15]}],prerequisites:['u1-13-factors-of-production'],related:['u3-01-circular-flow'], 'zh-CN':localized('zh-CN'),en:localized('en'),distractors:[['储蓄、税收、进口都是注入','Saving, taxes and imports are all injections'],['实际流量与货币流量是完全相同的东西','Real and money flows are identical'],['五部门模型不包含家庭','The five-sector model excludes households']]}]);
