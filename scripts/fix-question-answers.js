#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// 读取 questions.ts
const filePath = path.join(__dirname, 'src/data/questions.ts');
let content = fs.readFileSync(filePath, 'utf8');

// 统计修复数量
let fixCount = 0;

// 修复逻辑：
// 如果 correctAnswer: 4 但选项数组中没有 "以上都是" 或选项数 >= 5，则跳过
// 如果 correctAnswer: 4 且选项数组长度是4，且最后一个选项是"以上都是"，则改为 3

// 使用正则表达式匹配整个题目对象
const questionRegex = /\{[\s\S]*?id:\s*'[^']*'[\s\S]*?options:\s*\[[\s\S]*?\][\s\S]*?correctAnswer:\s*\d+[\s\S]*?\}/g;

const matches = content.match(questionRegex);

if (matches) {
  matches.forEach(question => {
    // 检查是否包含 correctAnswer: 4
    const correctAnswerMatch = question.match(/correctAnswer:\s*(\d+)/);
    if (correctAnswerMatch) {
      const correctAnswer = parseInt(correctAnswerMatch[1]);
      
      if (correctAnswer === 4) {
        // 检查选项数组
        const optionsMatch = question.match(/options:\s*\[([\s\S]*?)\]/);
        if (optionsMatch) {
          const optionsStr = optionsMatch[1];
          const options = optionsStr.split(',').map(opt => opt.trim().replace(/['"]/g, ''));
          
          console.log(`题目选项:`, options);
          console.log(`当前 correctAnswer: ${correctAnswer}`);
          
          // 如果选项数量是4，且有"以上都是"
          if (options.length === 4 && options[3].includes('以上都是')) {
            console.log(`需要修复: correctAnswer 从 4 改为 3`);
            fixCount++;
          }
        }
      }
    }
  });
}

console.log(`\n共发现 ${fixCount} 个需要修复的题目`);

if (fixCount > 0) {
  // 实际执行修复
  content = content.replace(/correctAnswer: 4,/g, (match, offset) => {
    const beforeText = content.substring(0, offset);
    const lineStart = beforeText.lastIndexOf('\n');
    const afterText = content.substring(offset + match.length);
    
    // 检查前面是否有 options 数组
    const recentContent = beforeText.substring(Math.max(0, beforeText.length - 500));
    const optionsMatch = recentContent.match(/options:\s*\[([^\]]+)\]/);
    
    if (optionsMatch) {
      const optionsStr = optionsMatch[1];
      const options = optionsStr.split(',');
      // 如果是4个选项，且包含"以上都是"，则修复
      if (options.length === 4 && options[options.length - 1].includes('以上都是')) {
        console.log(`修复一处: correctAnswer: 4 -> correctAnswer: 3`);
        return 'correctAnswer: 3,';
      }
    }
    
    return match;
  });
  
  fs.writeFileSync(filePath, content);
  console.log(`已修复所有 ${fixCount} 个错误答案！`);
} else {
  console.log('没有需要修复的题目');
}
