import { test } from 'node:test';
import assert from 'node:assert/strict';
import { askGuidelines } from '../src/lib/askGuidelines.ts';
import { calculateRuleInsights } from '../src/lib/reviewerInsights.ts';

const brand = {
  tone: 'Friendly', toneNotes: 'Write clearly',
  guidelines: [{id:'G1',title:'Clarity',body:'Avoid complex jargon in customer-facing text.'}],
  preferred: [], banned: [], a11y: [], colours: []
};
const facts = [
  {id:'F1',name:'Supported file formats',value:'12',unit:'formats',file:'config/formats.yaml',line:14,version:'4.8.2',status:'approved'},
  {id:'F2',name:'Maximum upload size',value:'250',unit:'MB',file:'config/limits.json',line:8,version:'4.8.2',status:'candidate'}
];
const vote = (id, verdict, when='2026-11-23T10:00:00Z') => ({id, submissionId:'S1',findingId:'FD1',ruleId:'G1',ruleName:'Clarity',verdict,reason:'test reason',who:'Reviewer',when});

test('supported approved fact returns exact source citation', () => {
 const result = askGuidelines('What is the supported file formats limit?',brand,facts);
 assert.equal(result.status,'answered');
 assert.match(result.text,/12 formats/);
 assert.match(result.citations[0].source,/config\/formats.yaml:14/);
});
test('uncovered topic abstains', () => assert.equal(askGuidelines("What is the CEO's favourite food?",brand,facts).status,'not_covered'));
test('empty question abstains', () => assert.equal(askGuidelines('   ',brand,facts).status,'not_covered'));
test('too long question abstains', () => assert.equal(askGuidelines('x'.repeat(501),brand,facts).status,'not_covered'));
test('unapproved product fact never appears', () => assert.equal(askGuidelines('What is maximum upload size?',brand,facts).status,'not_covered'));
test('claimed unsupported number is not confirmed', () => assert.equal(askGuidelines('Do we support 500 file formats?',brand,facts).status,'not_covered'));
test('duplicate votes counted as one', () => {
 const r = calculateRuleInsights([vote('1','overridden'),vote('2','overridden')]);
 assert.equal(r[0].total,1); assert.equal(r[0].overridden,1);
});
test('latest verdict replaces earlier vote', () => {
 const r = calculateRuleInsights([vote('1','overridden'),vote('2','upheld','2026-11-23T11:00:00Z')]);
 assert.equal(r[0].total,1); assert.equal(r[0].overridden,0);
});
test('equal timestamp prefers most recent input', () => {
 const r = calculateRuleInsights([vote('1','overridden'),vote('2','upheld')]);
 assert.equal(r[0].overridden,0);
});
test('no votes produces empty state', () => assert.deepEqual(calculateRuleInsights([]),[]));
test('invalid vote is ignored', () => assert.deepEqual(calculateRuleInsights([{...vote('1','overridden'),ruleId:''}]),[]));
