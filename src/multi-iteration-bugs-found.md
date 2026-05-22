# 多阶段多次迭代 - 发现的真实Bug列表

## Bug 1：WrongQuestions 和 FavouriteQuestions 页面题目链接问题

**严重程度**：中
**位置**：
- [WrongQuestions.tsx](file:///workspace/src/pages/WrongQuestions.tsx#L80)
- [FavouriteQuestions.tsx](file:///workspace/src/pages/FavouriteQuestions.tsx#L78)

**问题**：
两个页面中的题目链接总是指向错误的索引，固定到 `/quiz/${topicId}/0`，而不是题目的实际索引。
这意味着用户点击错题或收藏夹中的题目时，会跳转到该科目的第1题，而不是点击的那道题。

---

## Bug 2：QuestionUtils 服务中 getQuestionsByIds 顺序丢失

**严重程度**：低
**位置**：[questionUtils.ts](file:///workspace/src/services/questionUtils.ts#L4-L10)

**问题**：
getQuestionsByIds 返回的题目顺序完全依赖于原始数据顺序，而不是用户错题或收藏夹中的顺序。
这可能导致用户看到的顺序和他们添加时的顺序不一致。

---

## Bug 3：progress 中 correctAnswers 与错题逻辑可能不一致

**严重程度**：低
**位置**：[store.ts](file:///workspace/src/store.ts#L46-L100)

**分析**：
之前的修复解决了重复答题的问题，但目前的逻辑还有一个潜在问题：
如果用户先答错（进入错题集，然后再次答对（从错题集移除），但如果第三次又答错，是否应该再次加入错题集？这个逻辑当前是正确的，但需要验证。

---

## Bug 4：数据统计中的 wrong 计算有问题

**严重程度**：中
**位置**：[questionUtils.ts](file:///workspace/src/services/questionUtils.ts#L65)

**问题**：
getTopicProgress 函数中，`wrong` 的计算方式是 `totalAttempts - correctAnswers`，这不准确！
因为一道题可能被多次答错，totalAttempts - correctAnswers 是总的错误次数，但用户实际错题集只存储的是错题的数量，而不是总错误次数。
