const VALID_CATEGORIES = [
  'Authentication', 'Access Control', 'Encryption',
  'Data Protection', 'Logging', 'Network Security',
  'Physical Security', 'Incident Response', 'Compliance',
  'AI Security', 'IoT Security', 'Other'
];

const VALID_PRIORITIES = ['Critical', 'High', 'Medium', 'Low'];

const VALID_STATUSES = ['Draft', 'Approved', 'In Progress', 'Implemented', 'Rejected'];

const VALID_FRAMEWORKS = [
  'ISO 27001', 'IEC 62443', 'OWASP ASVS',
  'NIST CSF', 'PCI DSS', 'GDPR', 'NIS2', 'MDR', 'HIPAA'
];
const VALID_SOURCES = ['chat', 'document', 'manual', 'jira', 'confluence'];

export function validateRequirement(data) {
  const errors = [];

  // Check required fields
  if (!data.id) errors.push('id is required');
  if (!data.title) errors.push('title is required');
  if (!data.description) errors.push('description is required');
  if (!data.category) errors.push('category is required');
  if (!data.priority) errors.push('priority is required');
  if (!data.status) errors.push('status is required');

  // Check ID format REQ-YYYY-NNN
  if (data.id && !/^REQ-[0-9]{4}-[0-9]{3}$/.test(data.id)) {
    errors.push('id must follow format REQ-YYYY-NNN e.g. REQ-2026-001');
  }

  // Check valid values
  if (data.category && !VALID_CATEGORIES.includes(data.category)) {
    errors.push(`category must be one of: ${VALID_CATEGORIES.join(', ')}`);
  }
  if (data.priority && !VALID_PRIORITIES.includes(data.priority)) {
    errors.push(`priority must be one of: ${VALID_PRIORITIES.join(', ')}`);
  }
  if (data.status && !VALID_STATUSES.includes(data.status)) {
    errors.push(`status must be one of: ${VALID_STATUSES.join(', ')}`);
  }

  // Check source
  if (data.source && data.source.type && !VALID_SOURCES.includes(data.source.type)) {
    errors.push(`source.type must be one of: ${VALID_SOURCES.join(', ')}`);
  }

  // Check title length
  if (data.title && data.title.length < 5) {
    errors.push('title must be at least 5 characters');
  }

  // Check compliance mappings
  if (data.compliance_mappings && Array.isArray(data.compliance_mappings)) {
    data.compliance_mappings.forEach((mapping, index) => {
      if (!mapping.framework) {
        errors.push(`compliance_mappings[${index}]: framework is required`);
      } else if (!VALID_FRAMEWORKS.includes(mapping.framework)) {
        errors.push(`compliance_mappings[${index}]: framework must be one of: ${VALID_FRAMEWORKS.join(', ')}`);
      }
      if (!mapping.control) {
        errors.push(`compliance_mappings[${index}]: control is required`);
      }
    });
  }

  return {
    valid: errors.length === 0,
    errors
  };
}