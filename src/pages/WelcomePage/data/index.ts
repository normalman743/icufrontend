/**
 * Data exports
 * 统一导出所有数据
 */

export { AI_MODELS, type AIModel } from './aiModels';
export { 
  COMPARISON_EXAMPLES, 
  SUB_CATEGORY_LABELS,
  CATEGORY_LABELS,
  type ComparisonExample, 
  type QuestionCategory,
  type QuestionSubCategory
} from './comparisonExamples';
export { CLUSTER_EXAMPLES, type Cluster, type ClusterType, type ExampleQuestion } from './clusterExamples';

// AI Answers for comparison
export { 
  ICU_STAR_ANSWERS, 
  GPT_ANSWERS, 
  GEMINI_ANSWERS, 
  DEEPSEEK_ANSWERS,
  getAIAnswers,
  type AIAnswer 
} from './aiAnswers';

// Workflow Examples
export {
  WORKFLOW_MODELS,
  WORKFLOW_EXAMPLES,
  getExamplesByModel,
  getExamplesByQuestionType,
  getModelInfo,
  getExampleById,
  type ModelInfo,
  type WorkflowExample,
  type UserMessage,
  type QuestionTypeTag,
  type SearchStep,
  type AIResponse,
  type AttachedFile,
  type ModelType,
  type QuestionSourceType,
  type FileType,
  type SearchSourceType,
  type SearchResultItem
} from './workflowExamples';
