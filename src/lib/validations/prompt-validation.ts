export interface PromptValidationRules {
  title: {
    minLength: number;
    maxLength: number;
  };
  description: {
    minLength: number;
    maxLength: number;
  };
  content: {
    minLength: number;
    maxLength: number;
  };
}

export const PROMPT_VALIDATION_RULES: PromptValidationRules = {
  title: {
    minLength: 3,
    maxLength: 120, // Twitter-like length for titles
  },
  description: {
    minLength: 20,
    maxLength: 500,
  },
  content: {
    minLength: 80, // As requested by user
    maxLength: 30000, // Increased from 10000 to allow for more detailed prompts
  },
};

export interface ValidationError {
  field: string;
  message: string;
  actualLength?: number;
  requiredLength?: number;
}

export interface PromptValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

export function validatePromptContent(data: {
  title: string;
  description: string;
  content: string;
}): PromptValidationResult {
  const errors: ValidationError[] = [];

  // Validate title
  const titleLength = data.title.trim().length;
  if (titleLength < PROMPT_VALIDATION_RULES.title.minLength) {
    errors.push({
      field: 'title',
      message: `Title must be at least ${PROMPT_VALIDATION_RULES.title.minLength} characters long`,
      actualLength: titleLength,
      requiredLength: PROMPT_VALIDATION_RULES.title.minLength,
    });
  }
  if (titleLength > PROMPT_VALIDATION_RULES.title.maxLength) {
    errors.push({
      field: 'title',
      message: `Title must be no more than ${PROMPT_VALIDATION_RULES.title.maxLength} characters long`,
      actualLength: titleLength,
      requiredLength: PROMPT_VALIDATION_RULES.title.maxLength,
    });
  }

  // Validate description
  const descriptionLength = data.description.trim().length;
  if (descriptionLength < PROMPT_VALIDATION_RULES.description.minLength) {
    errors.push({
      field: 'description',
      message: `Description must be at least ${PROMPT_VALIDATION_RULES.description.minLength} characters long`,
      actualLength: descriptionLength,
      requiredLength: PROMPT_VALIDATION_RULES.description.minLength,
    });
  }
  if (descriptionLength > PROMPT_VALIDATION_RULES.description.maxLength) {
    errors.push({
      field: 'description',
      message: `Description must be no more than ${PROMPT_VALIDATION_RULES.description.maxLength} characters long`,
      actualLength: descriptionLength,
      requiredLength: PROMPT_VALIDATION_RULES.description.maxLength,
    });
  }

  // Validate content (prompt text)
  const contentLength = data.content.trim().length;
  if (contentLength < PROMPT_VALIDATION_RULES.content.minLength) {
    errors.push({
      field: 'content',
      message: `Prompt content must be at least ${PROMPT_VALIDATION_RULES.content.minLength} characters long`,
      actualLength: contentLength,
      requiredLength: PROMPT_VALIDATION_RULES.content.minLength,
    });
  }
  if (contentLength > PROMPT_VALIDATION_RULES.content.maxLength) {
    errors.push({
      field: 'content',
      message: `Prompt content must be no more than ${PROMPT_VALIDATION_RULES.content.maxLength} characters long`,
      actualLength: contentLength,
      requiredLength: PROMPT_VALIDATION_RULES.content.maxLength,
    });
  }

  // Additional validations
  if (data.title.trim() === '') {
    errors.push({
      field: 'title',
      message: 'Title cannot be empty',
    });
  }

  if (data.description.trim() === '') {
    errors.push({
      field: 'description',
      message: 'Description cannot be empty',
    });
  }

  if (data.content.trim() === '') {
    errors.push({
      field: 'content',
      message: 'Prompt content cannot be empty',
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function formatValidationErrorMessage(error: ValidationError): string {
  if (error.actualLength !== undefined && error.requiredLength !== undefined) {
    return `${error.message} (current: ${error.actualLength}, required: ${error.requiredLength})`;
  }
  return error.message;
}

export function getFieldCharacterCount(value: string, field: keyof PromptValidationRules): {
  current: number;
  min: number;
  max: number;
  isValid: boolean;
} {
  const length = value.trim().length;
  const rules = PROMPT_VALIDATION_RULES[field];
  
  return {
    current: length,
    min: rules.minLength,
    max: rules.maxLength,
    isValid: length >= rules.minLength && length <= rules.maxLength,
  };
} 