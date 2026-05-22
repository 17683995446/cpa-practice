# 新迭代阶段 - 发现的新Bug列表

## Bug 1：use-question.ts 中使用 getState() 而不是订阅状态

**严重程度**：中
**位置**：[use-question.ts](file:///workspace/src/hooks/use-question.ts#L51)

**问题**：
```typescript
const progress = useMemo(() => {
  if (!topicId) return null
  return useQuizStore.getState().getProgress(topicId)  // ❌ 这里不应该用getState
}, [topicId])
```

这个hook在useMemo中使用了`useQuizStore.getState()`而不是通过订阅获取状态。这可能导致：
- 当store状态更新时，hook不会重新渲染
- 状态更新后，返回的progress可能是过时的
- 不符合React Hooks的最佳实践

**修复建议**：应该在组件中直接使用 `useQuizStore()` 订阅状态变化

---

## Bug 2：question-service.ts 中奇怪的代码格式

**严重程度**：低
**位置**：[question-service.ts](file:///workspace/src/services/question-service.ts#L75)

**问题**：
```typescript
;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
```

这个分号和换行很奇怪，虽然不影响功能，但降低了代码可读性。应该是：
```typescript
[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
```

---

## Bug 3：Home.tsx 中进度百分比计算可能除以零

**严重程度**：低
**位置**：[Home.tsx](file:///workspace/src/pages/Home.tsx#L141)

**问题**：
```typescript
const progressPercent = Math.round((completedCount / topic.questionCount) * 100);
```

虽然目前topics.ts中的questionCount都大于0，但如果未来添加新科目时questionCount为0，会导致除以零错误。

**修复建议**：添加除以零检查：
```typescript
const progressPercent = topic.questionCount > 0 
  ? Math.round((completedCount / topic.questionCount) * 100) 
  : 0;
```

---

## Bug 4：Question类型定义缺少索引字段

**严重程度**：低
**位置**：[types.ts](file:///workspace/src/types.ts#L1-L12)

**问题**：
Question类型没有包含 `index` 字段来表示题目在科目中的位置。当前是通过在QuestionService中查询来获取索引，这样效率较低。

**建议**：可以在Question中添加一个计算属性或者在数据生成时直接包含索引。

---

## Bug 5：Quiz页面可能的竞态条件

**严重程度**：中
**位置**：[Quiz.tsx](file:///workspace/src/pages/Quiz.tsx#L60-L72)

**问题**：
handleSubmit中，虽然有检查 `userAnswer !== null && !hasSubmitted`，但如果用户快速双击提交按钮，可能导致两次updateProgress调用。

**修复建议**：添加防抖或禁用提交按钮直到状态更新完成。

---

## 总体评估

| Bug编号 | 严重程度 | 优先级 | 修复状态 |
|--------|---------|--------|---------|
| Bug 1 | 中 | 高 | 🔴 待修复 |
| Bug 2 | 低 | 低 | 🟡 建议修复 |
| Bug 3 | 低 | 中 | 🟡 建议修复 |
| Bug 4 | 低 | 低 | 🔵 暂不需要 |
| Bug 5 | 中 | 高 | 🔴 待修复 |
