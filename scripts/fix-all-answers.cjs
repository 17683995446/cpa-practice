#!/usr/bin/env node

/**
 * 自动修复 questions.ts 中所有错误的 correctAnswer
 * 第一性原理：如果 correctAnswer >= options.length，则答案无效
 */

const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/data/questions.ts');
const content = fs.readFileSync(filePath, 'utf8');

console.log('开始检查并修复答案错误...\n');

let fixCount = 0;
let fixedContent = content;

// 正则匹配每个题目块
const questionRegex = /(\{[\s\S]*?id:\s*'([^']+)'[\s\S]*?options:\s*\[)([\s\S]*?)(\][\s\S]*?correctAnswer:\s*)(\d+)([\s\S]*?\})/g;

let match;
const errors = [];

while ((match = questionRegex.exec(content)) !== null) {
  const fullMatch = match[0];
  const id = match[2];
  const optionsStr = match[3];
  const correctAnswer = parseInt(match[5]);
  
  // 解析选项数量（处理多行）
  const optionItems = optionsStr.split(',').map(opt => opt.trim()).filter(opt => opt.length > 0);
  const optionsCount = optionItems.length;
  
  // 检查是否越界
  if (correctAnswer >= optionsCount) {
    errors.push({
      id,
      correctAnswer,
      optionsCount,
      suggestion: `应该是 ${optionsCount - 1}`
    });
    
    // 修复：如果答案等于选项数，则改为选项数-1（因为"以上都是"通常在最后）
    if (correctAnswer === optionsCount) {
      const corrected = correctAnswer - 1;
      const oldStr = `correctAnswer: ${correctAnswer}`;
      const newStr = `correctAnswer: ${corrected}`;
      
      // 找到这个题目的位置并替换
      const idIndex = fullMatch.indexOf(`id: '${id}'`);
      const beforeId = fullMatch.substring(0, idIndex);
      const afterCorrectAnswer = fullMatch.indexOf('correctAnswer:');
      const caSection = fullMatch.substring(afterCorrectAnswer);
      
      // 替换
      const newQuestion = fullMatch.replace(oldStr, newStr);
      fixedContent = fixedContent.replace(fullMatch, newQuestion);
      
      fixCount++;
      console.log(`✓ 修复 ${id}: correctAnswer ${correctAnswer} -> ${corrected}`);
    }
  }
}

console.log(`\n共发现 ${errors.length} 个错误，已修复 ${fixCount} 个\n`);

if (errors.length > 0) {
  console.log('无法自动修复的错误:');
  errors.forEach(err => {
    console.log(`  ${err.id}: correctAnswer=${err.correctAnswer}, options=${err.optionsCount}`);
  });
}

// 写回文件
if (fixCount > 0) {
  fs.writeFileSync(filePath, fixedContent);
  console.log(`\n✅ 已保存修复到 ${filePath}`);
} else {
  console.log('\n没有需要修复的错误');
}
