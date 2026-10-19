import { describe, expect, it } from 'vitest';
import { knowledgePoints } from '../../generated/content';
import { scoreShortAnswer } from '../review/scoring';
import { createReviewQueue } from '../review/session';
import type { MultipleChoiceItem } from '../../types/content';
const byId = (id: string) => { const p=knowledgePoints.find(p=>p.meta.id===id); if(!p)throw new Error(id);return p; };
const queue = (level: 'sl'|'hl', id: string) => createReviewQueue(knowledgePoints,[],{mode:'mcq',level,scopeIds:new Set([id]),useScope:true,status:'any',count:20,now:new Date('2026-10-18T00:00:00Z')});

describe('Units 1–4 content audit',()=>{
 it('uses official Unit 1 section numbers and includes economic thought in both levels',()=>{
  const points=knowledgePoints.filter(p=>p.meta.id.startsWith('u1-'));
  expect(points).toHaveLength(44);
  expect(points.every(p=>['1.1','1.2'].includes(p.meta.section)&&p.meta.level==='core')).toBe(true);
  expect(byId('u1-44-circular-flow').meta.section).toBe('1.1');
 });
 it('keeps shared definitions visible while identifying actual HL-only subtopics',()=>{
  const shared=['u2-26-pes-application','u3-05-deflator','u3-35-lorenz-gini','u4-10-export-subsidy','u4-26-exchange-calculations','u4-30-bop-identity'];
  const higher=['u3-43-unconventional-policy','u3-48-automatic-stabilisers','u3-50-crowding-out','u3-57-bank-money-creation','u3-58-monetary-tools','u3-59-money-market','u4-31-current-account-imbalances','u4-36-environment-poverty','u4-57-monetary-union-evaluation','u4-58-exchange-regime-evaluation'];
  for(const id of shared)expect(byId(id).meta.level,id).toBe('core');
  for(const id of higher)expect(byId(id).meta.level,id).toBe('hl');
  expect(byId('u4-63-terms-of-trade-enrichment').meta.level).toBe('extension');
  expect(byId('u4-15-wto').meta.section).toBe('4.4');
 });
 it('excludes advanced calculations from SL queues without removing shared concept questions',()=>{
  const split=knowledgePoints.filter(p=>p.practice.some(q=>q.level==='hl')&&p.meta.level==='core');
  expect(split.length).toBeGreaterThanOrEqual(10);
  for(const point of split){
   expect(point.content.en.hlExtension,point.meta.id).toBeTruthy();
   expect(queue('sl',point.meta.id).map(q=>q.item.id)).toEqual([`${point.meta.id}-mcq-1`]);
   expect(queue('hl',point.meta.id).some(q=>q.item.level==='hl'),point.meta.id).toBe(true);
  }
 });
 it('provides reference answers that satisfy all keyword groups in both languages',()=>{
  for(const point of knowledgePoints)for(const item of point.practice){
   if(item.type==='short-answer')for(const locale of ['zh-CN','en'] as const){
    expect(scoreShortAnswer(item,item.modelAnswer[locale],locale).coverage,item.id+'/'+locale).toBe(1);
    expect(scoreShortAnswer(item,'',locale).coverage,item.id+'/'+locale).toBe(0);
   }
   if(item.type==='mcq')for(const locale of ['zh-CN','en'] as const){
    expect(new Set(item.options.map(o=>o[locale])).size,item.id+'/'+locale).toBe(4);
    expect(item.options.filter(o=>o.id===item.correctOptionId),item.id).toHaveLength(1);
    expect(item.options.some(o=>/concerns personal preference only|accounting rule that applies only/.test(o.en)),item.id).toBe(false);
   }
  }
 });
 // Independent arithmetic: input numbers are the question's premises, not generated answer keys.
 const cases: Array<[string,number]> = [
  ['u2-04-market-demand-mcq-1',2+4+6], ['u2-05-marginal-utility-mcq-1',9+6+2],
  ['u2-08-market-supply-mcq-1',15+25],['u2-09-diminishing-returns-mcq-1',35-25],['u2-10-costs-and-supply-mcq-1',68-60],['u2-12-shortage-surplus-mcq-1',110-80],
  ['u2-15-surplus-efficiency-mcq-hl-1',18-12],['u2-19-ped-mcq-1',15/5],['u2-24-pes-mcq-1',12/8],
  ['u2-27-price-ceiling-mcq-hl-1',120-80],['u2-28-price-floor-mcq-hl-1',75-50],['u2-29-indirect-tax-mcq-hl-1',14-10],['u2-30-subsidy-mcq-hl-1',5*40],
  ['u2-32-tax-welfare-calculation-mcq-1',.5*6*10],['u2-40-external-welfare-mcq-1',.5*12*5],['u2-48-cost-curves-mcq-1',120/20],['u2-50-revenue-profit-mcq-1',150-100-30],['u2-59-income-wealth-mcq-1',90-35],
  ['u3-02-gdp-mcq-1',80],['u3-03-expenditure-mcq-1',200+50+70+40-30],['u3-05-deflator-mcq-1',900/120*100],['u3-06-gni-mcq-1',300-20],
  ['u3-28-growth-measure-mcq-1',(525-500)/500*100],['u3-30-public-debt-mcq-1',240/400*100],['u3-45-fiscal-budget-mcq-1',95-80],
  ['u3-18-output-gaps-mcq-1',(108-100)/100*100],['u3-21-unemployment-rate-mcq-1',20/(180+20)*100],['u3-24-cpi-mcq-1',(156-150)/150*100],['u3-24-cpi-mcq-hl-1',46/40*100],
  ['u3-35-lorenz-gini-mcq-hl-1',(.5-.35)/.5],['u3-37-progressive-tax-mcq-hl-1',45/300*100],['u3-39-money-interest-mcq-1',5-3],['u3-49-multiplier-mcq-1',8/.4],
  ['u4-02-free-trade-imports-mcq-hl-1',90-30],['u4-03-free-trade-exports-mcq-hl-1',80-50],['u4-07-tariff-mcq-hl-1',3*20],['u4-09-production-subsidy-mcq-hl-1',4*30],['u4-10-export-subsidy-mcq-hl-1',2*50],
  ['u4-21-floating-exchange-rate-mcq-1',(.5-.4)/.4*100],
  ['u4-28-current-account-mcq-1',-10+4+2],['u4-30-bop-identity-mcq-1',-(-12)],['u4-63-terms-of-trade-enrichment-mcq-1',110/100*100],
 ];
 for(const [id,answer] of cases)it(`checks the keyed numerical answer independently: ${id}`,()=>{
  const item=knowledgePoints.flatMap(p=>p.practice).find(q=>q.id===id) as MultipleChoiceItem;
  expect(item,id).toBeDefined();
  const option=item.options.find(o=>o.id===item.correctOptionId);
  for(const locale of ['zh-CN','en'] as const){
   const numeric=option?.[locale].replace(/[,%+]/g,'').replaceAll('−','-').match(/-?\d+(?:\.\d+)?/);
   expect(numeric, id+'/'+locale).toBeTruthy();
   expect(Number(numeric?.[0]),id+'/'+locale).toBeCloseTo(answer,2);
  }
 });
 it('states the income base of multiplier propensities and computes quintile Gini correctly',()=>{
  const multiplier=byId('u3-49-multiplier').content.en.explanation;
  expect(multiplier).toContain('1/[1−c(1−t)+m]');
  expect(1/(1-.8*(1-.25)+.1)).toBeCloseTo(2);
  const cumulative=[0,.05,.15,.30,.55,1];
  const area=cumulative.slice(1).reduce((sum,y,i)=>sum+.2*(y+(cumulative[i]??0))/2,0);
  expect(1-2*area).toBeCloseTo(.38);
  expect(byId('u3-35-lorenz-gini').content.en.hlExtension).toContain('Gini 0.38');
 });
});
