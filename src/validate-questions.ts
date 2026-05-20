import { topics } from './data/topics'
import { getQuestionsByTopic } from './data/questions'
import fs from 'fs'
import path from 'path'

console.log('🔍 慢工出细活：全面验证题目数据...\n')

interface ValidationError {
  topic: string
  questionId: string
  questionIndex: number
  type: string
  message: string
}

const errors: ValidationError[] = []
const warnings: ValidationError[] = []
let totalQuestions = 0
let validQuestions = 0

for (const topic of topics) {
  console.log(`\n📚 正在验证科目: ${topic.name} (${topic.id})`)
  
  const questions = getQuestionsByTopic(topic.id)
  console.log(`   总题数: ${questions.length}`)
  
  for (let i = 0; i < questions.length; i++) {
    const q = questions[i]
    totalQuestions++
    
    // 1. 验证必填字段
    if (!q.id) {
      errors.push({
        topic: topic.id,
        questionId: q.id || `unknown-${i}`,
        questionIndex: i,
        type: 'missing-id',
        message: '题目缺少 id 字段'
      })
      continue
    }
    
    if (!q.content || q.content.trim() === '') {
      errors.push({
        topic: topic.id,
        questionId: q.id,
        questionIndex: i,
        type: 'missing-content',
        message: '题目缺少 content 字段'
      })
    }
    
    // 2. 验证选项
    if (!Array.isArray(q.options) || q.options.length === 0) {
      errors.push({
        topic: topic.id,
        questionId: q.id,
        questionIndex: i,
        type: 'invalid-options',
        message: '选项为空或不是数组'
      })
      continue
    }
    
    if (q.options.length < 2) {
      warnings.push({
        topic: topic.id,
        questionId: q.id,
        questionIndex: i,
        type: 'few-options',
        message: `只有 ${q.options.length} 个选项`
      })
    }
    
    // 3. 验证正确答案
    if (typeof q.correctAnswer !== 'number' || q.correctAnswer < 0 || q.correctAnswer >= q.options.length) {
      errors.push({
        topic: topic.id,
        questionId: q.id,
        questionIndex: i,
        type: 'invalid-correctAnswer',
        message: `正确答案索引 ${q.correctAnswer} 无效，选项数: ${q.options.length}`
      })
    }
    
    // 4. 验证难度
    if (!['easy', 'medium', 'hard'].includes(q.difficulty)) {
      warnings.push({
        topic: topic.id,
        questionId: q.id,
        questionIndex: i,
        type: 'invalid-difficulty',
        message: `难度 ${q.difficulty} 无效`
      })
    }
    
    validQuestions++
  }
}

console.log(`\n\n✅ 验证完成！`)
console.log(`─────────────────────────────────────`)
console.log(`📊 总题数: ${totalQuestions}`)
console.log(`✅ 有效题数: ${validQuestions}`)
console.log(`❌ 错误数量: ${errors.length}`)
console.log(`⚠️ 警告数量: ${warnings.length}`)

if (errors.length > 0) {
  console.log(`\n❌ 发现的错误:`)
  for (const err of errors) {
    console.log(`  [${err.topic}] ${err.questionId} (#${err.questionIndex}) - ${err.type}: ${err.message}`)
  }
}

if (warnings.length > 0) {
  console.log(`\n⚠️ 发现的警告:`)
  for (const warn of warnings.slice(0, 20)) { // 只显示前20个警告
    console.log(`  [${warn.topic}] ${warn.questionId} (#${warn.questionIndex}) - ${warn.type}: ${warn.message}`)
  }
  if (warnings.length > 20) {
    console.log(`  ... 还有 ${warnings.length - 20} 个警告`)
  }
}

console.log(`\n─────────────────────────────────────`)

// 输出详细报告
const report = {
  timestamp: new Date().toISOString(),
  totalQuestions,
  validQuestions,
  errors,
  warnings
}

fs.writeFileSync(
  path.join(__dirname, '../question-validation-report.json'),
  JSON.stringify(report, null, 2)
)
console.log(`详细报告已保存到: ../question-validation-report.json`)

if (errors.length === 0) {
  console.log('\n🎉 恭喜！所有题目数据完全验证通过！')
  process.exit(0)
} else {
  console.log('\n❌ 发现问题，需要修复！')
  process.exit(1)
}
