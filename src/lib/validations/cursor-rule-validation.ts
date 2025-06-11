export interface CursorRuleValidationRules {
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
  globs: {
    maxLength: number;
  };
}

export const CURSOR_RULE_VALIDATION_RULES: CursorRuleValidationRules = {
  title: {
    minLength: 3,
    maxLength: 120,
  },
  description: {
    minLength: 20,
    maxLength: 500,
  },
  content: {
    minLength: 50, // Shorter minimum for rules
    maxLength: 10000,
  },
  globs: {
    maxLength: 500, // For file patterns
  },
};

export interface ValidationError {
  field: string;
  message: string;
  actualLength?: number;
  requiredLength?: number;
}

export interface CursorRuleValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

export function validateCursorRuleContent(data: {
  title: string;
  description: string;
  content: string;
  globs?: string;
}): CursorRuleValidationResult {
  const errors: ValidationError[] = [];

  // Validate title
  const titleLength = data.title.trim().length;
  if (titleLength < CURSOR_RULE_VALIDATION_RULES.title.minLength) {
    errors.push({
      field: 'title',
      message: `Title must be at least ${CURSOR_RULE_VALIDATION_RULES.title.minLength} characters long`,
      actualLength: titleLength,
      requiredLength: CURSOR_RULE_VALIDATION_RULES.title.minLength,
    });
  }
  if (titleLength > CURSOR_RULE_VALIDATION_RULES.title.maxLength) {
    errors.push({
      field: 'title',
      message: `Title must be no more than ${CURSOR_RULE_VALIDATION_RULES.title.maxLength} characters long`,
      actualLength: titleLength,
      requiredLength: CURSOR_RULE_VALIDATION_RULES.title.maxLength,
    });
  }

  // Validate description
  const descriptionLength = data.description.trim().length;
  if (descriptionLength < CURSOR_RULE_VALIDATION_RULES.description.minLength) {
    errors.push({
      field: 'description',
      message: `Description must be at least ${CURSOR_RULE_VALIDATION_RULES.description.minLength} characters long`,
      actualLength: descriptionLength,
      requiredLength: CURSOR_RULE_VALIDATION_RULES.description.minLength,
    });
  }
  if (descriptionLength > CURSOR_RULE_VALIDATION_RULES.description.maxLength) {
    errors.push({
      field: 'description',
      message: `Description must be no more than ${CURSOR_RULE_VALIDATION_RULES.description.maxLength} characters long`,
      actualLength: descriptionLength,
      requiredLength: CURSOR_RULE_VALIDATION_RULES.description.maxLength,
    });
  }

  // Validate content (rule text)
  const contentLength = data.content.trim().length;
  if (contentLength < CURSOR_RULE_VALIDATION_RULES.content.minLength) {
    errors.push({
      field: 'content',
      message: `Rule content must be at least ${CURSOR_RULE_VALIDATION_RULES.content.minLength} characters long`,
      actualLength: contentLength,
      requiredLength: CURSOR_RULE_VALIDATION_RULES.content.minLength,
    });
  }
  if (contentLength > CURSOR_RULE_VALIDATION_RULES.content.maxLength) {
    errors.push({
      field: 'content',
      message: `Rule content must be no more than ${CURSOR_RULE_VALIDATION_RULES.content.maxLength} characters long`,
      actualLength: contentLength,
      requiredLength: CURSOR_RULE_VALIDATION_RULES.content.maxLength,
    });
  }

  // Validate globs (optional)
  if (data.globs) {
    const globsLength = data.globs.trim().length;
    if (globsLength > CURSOR_RULE_VALIDATION_RULES.globs.maxLength) {
      errors.push({
        field: 'globs',
        message: `File patterns must be no more than ${CURSOR_RULE_VALIDATION_RULES.globs.maxLength} characters long`,
        actualLength: globsLength,
        requiredLength: CURSOR_RULE_VALIDATION_RULES.globs.maxLength,
      });
    }
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
      message: 'Rule content cannot be empty',
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

export function getFieldCharacterCount(value: string, field: keyof CursorRuleValidationRules): {
  current: number;
  min: number;
  max: number;
  isValid: boolean;
} {
  const length = value.trim().length;
  const rules = CURSOR_RULE_VALIDATION_RULES[field];
  
  if (field === 'globs') {
    return {
      current: length,
      min: 0,
      max: rules.maxLength,
      isValid: length <= rules.maxLength,
    };
  }
  
  // For fields with both minLength and maxLength
  const fieldRules = rules as { minLength: number; maxLength: number };
  return {
    current: length,
    min: fieldRules.minLength,
    max: fieldRules.maxLength,
    isValid: length >= fieldRules.minLength && length <= fieldRules.maxLength,
  };
} 