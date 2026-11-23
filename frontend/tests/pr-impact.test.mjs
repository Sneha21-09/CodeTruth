import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync, mkdirSync, writeFileSync, rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {execFileSync} from 'node:child_process';
import {detectImpact,formatReport} from '../scripts/pr-impact.mjs';
function git(repo,...args){return execFileSync('git',['-C',repo,...args],{encoding:'utf8'}).trim()}
function fixture(fn){const repo=mkdtempSync(join(tmpdir(),'ct-pr-'));try{git(repo,'init','-q');git(repo,'config','user.email','test@example.com');git(repo,'config','user.name','Test');mkdirSync(join(repo,'product-config'));const file=join(repo,'product-config/plans.json');writeFileSync(file,JSON.stringify({starter:{monthly_credits:20},formats:12}));git(repo,'add','.');git(repo,'commit','-qm','base');const base=git(repo,'rev-parse','HEAD');writeFileSync(file,JSON.stringify({starter:{monthly_credits:30},formats:12}));git(repo,'add','.');git(repo,'commit','-qm','change');const head=git(repo,'rev-parse','HEAD');fn({repo,base,head});}finally{rmSync(repo,{recursive:true,force:true});}}
test('real git diff: changed numeric fact and mapped content',()=>fixture(({repo,base,head})=>{const changes=detectImpact({repo,base,head,dependencies:{'product-config/plans.json:starter.monthly_credits':['DEMO-S-2035']}});assert.equal(changes.length,1);assert.equal(changes[0].oldValue,20);assert.equal(changes[0].newValue,30);assert.deepEqual(changes[0].affected,['DEMO-S-2035']);assert.match(formatReport(changes),/20/);assert.match(formatReport(changes),/30/);assert.match(formatReport(changes),/demo map/);}));
test('same revision has zero changes',()=>fixture(({repo,base})=>assert.deepEqual(detectImpact({repo,base,head:base}),[])));
test('no dependency is explicitly unmapped',()=>fixture(({repo,base,head})=>{const changes=detectImpact({repo,base,head});assert.equal(changes[0].affected.length,0);assert.match(formatReport(changes),/None mapped/);}));
test('reject invalid commit IDs',()=>assert.throws(()=>detectImpact({base:'HEAD; rm -rf /',head:'abc'}),/commit hashes/));
