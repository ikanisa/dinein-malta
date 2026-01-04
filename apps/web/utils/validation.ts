/**
 * Input validation utilities for forms and user input
 */

export const validateEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const validatePhone = (phone: string): boolean => {
  // Accepts international format: +1234567890 or local: 1234567890
  return /^\+?[\d\s\-()]+$/.test(phone) && phone.replace(/\D/g, '').length >= 7;
};

export const validateRequired = (value: any): boolean => {
  if (typeof value === 'string') return value.trim().length > 0;
  if (typeof value === 'number') return !isNaN(value);
  if (Array.isArray(value)) return value.length > 0;
  return value != null;
};

export const validatePrice = (price: number): boolean => {
  return price >= 0 && price <= 10000;
};

export const validateUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const validateSlug = (slug: string): boolean => {
  // Allow lowercase letters, numbers, and hyphens
  return /^[a-z0-9-]+$/.test(slug) && slug.length >= 2 && slug.length <= 50;
};

export const validatePartySize = (size: number): boolean => {
  return size >= 1 && size <= 50;
};

export const validateTableNumber = (number: number): boolean => {
  return number > 0 && number <= 999;
};

// Validation error messages
export const getValidationError = (field: string, validator: string): string => {
  const messages: Record<string, Record<string, string>> = {
    email: {
      required: 'Email is required',
      invalid: 'Please enter a valid email address'
    },
    phone: {
      required: 'Phone number is required',
      invalid: 'Please enter a valid phone number'
    },
    name: {
      required: 'Name is required',
      minLength: 'Name must be at least 2 characters',
      maxLength: 'Name must be less than 100 characters'
    },
    price: {
      required: 'Price is required',
      invalid: 'Price must be between 0 and 10,000',
      negative: 'Price cannot be negative'
    },
    slug: {
      required: 'Slug is required',
      invalid: 'Slug can only contain lowercase letters, numbers, and hyphens',
      minLength: 'Slug must be at least 2 characters',
      maxLength: 'Slug must be less than 50 characters'
    },
    partySize: {
      required: 'Party size is required',
      invalid: 'Party size must be between 1 and 50'
    }
  };

  return messages[field]?.[validator] || 'Invalid input';
};

// Composite validators
export const validateMenuItem = (item: { name: string; price: number; category?: string }) => {
  const errors: string[] = [];
  
  if (!validateRequired(item.name)) {
    errors.push(getValidationError('name', 'required'));
  } else if (item.name.trim().length < 2) {
    errors.push(getValidationError('name', 'minLength'));
  } else if (item.name.length > 100) {
    errors.push(getValidationError('name', 'maxLength'));
  }
  
  if (!validateRequired(item.price)) {
    errors.push(getValidationError('price', 'required'));
  } else if (!validatePrice(item.price)) {
    errors.push(getValidationError('price', 'invalid'));
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateVendorData = (vendor: { name: string; slug?: string; email?: string; phone?: string }) => {
  const errors: string[] = [];
  
  if (!validateRequired(vendor.name)) {
    errors.push(getValidationError('name', 'required'));
  }
  
  if (vendor.slug && !validateSlug(vendor.slug)) {
    errors.push(getValidationError('slug', 'invalid'));
  }
  
  if (vendor.email && !validateEmail(vendor.email)) {
    errors.push(getValidationError('email', 'invalid'));
  }
  
  if (vendor.phone && !validatePhone(vendor.phone)) {
    errors.push(getValidationError('phone', 'invalid'));
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

