/**
 * Calculate priority for an issue based on multiple factors
 * @param {Object} issueData - Issue data
 * @returns {String} - Priority level: 'low', 'medium', 'high', 'urgent'
 */
export function calculatePriority(issueData) {
  const { 
    title = '', 
    description = '', 
    category = '', 
    subcategory = '',
    upvotes = 0 
  } = issueData;
  
  let priorityScore = 50; // Start with medium (0-100 scale)
  
  // 1. CATEGORY-BASED PRIORITY
  const categoryPriority = {
    // High priority categories
    'Water Supply': 20,
    'Electricity': 20,
    'Emergency Services': 30,
    'Fire Safety': 30,
    'Health & Sanitation': 15,
    
    // Medium priority categories
    'Roads': 10,
    'Street Lights': 10,
    'Garbage': 10,
    'Public Transport': 5,
    
    // Lower priority categories
    'Parks & Recreation': 0,
    'Other': 0
  };
  
  priorityScore += categoryPriority[category] || 0;
  
  // 2. SUBCATEGORY-BASED BOOST
  const urgentSubcategories = [
    'No Water',
    'Burst Pipe',
    'Power Outage',
    'Accident',
    'Fire',
    'Medical Emergency',
    'Major Damage',
    'Open Manhole',
    'Severe Pothole'
  ];
  
  if (urgentSubcategories.includes(subcategory)) {
    priorityScore += 20;
  }
  
  // 3. KEYWORD DETECTION
  const urgentKeywords = [
    'urgent', 'emergency', 'immediate', 'critical', 'danger', 
    'dangerous', 'accident', 'injury', 'injured', 'fire',
    'flood', 'leaking', 'broken', 'severe', 'major'
  ];
  
  const combinedText = `${title} ${description}`.toLowerCase();
  
  const urgentKeywordCount = urgentKeywords.filter(keyword => 
    combinedText.includes(keyword)
  ).length;
  
  priorityScore += urgentKeywordCount * 10; // +10 per urgent keyword
  
  // 4. UPVOTE-BASED ESCALATION
  if (upvotes >= 10) {
    priorityScore += 30; // Very high community concern
  } else if (upvotes >= 5) {
    priorityScore += 20; // High community concern
  } else if (upvotes >= 3) {
    priorityScore += 10; // Moderate community concern
  }
  
  // 5. DESCRIPTION LENGTH (detailed descriptions might indicate severity)
  if (description.length > 300) {
    priorityScore += 5; // Detailed description suggests serious issue
  }
  
  // 6. CONVERT SCORE TO PRIORITY LEVEL
  if (priorityScore >= 80) {
    return 'urgent';
  } else if (priorityScore >= 60) {
    return 'high';
  } else if (priorityScore >= 40) {
    return 'medium';
  } else {
    return 'low';
  }
}

/**
 * Get priority label with emoji
 */
export function getPriorityLabel(priority) {
  const labels = {
    urgent: '🔴 Urgent',
    high: '🟠 High',
    medium: '🟡 Medium',
    low: '🟢 Low'
  };
  return labels[priority] || '🟡 Medium';
}

/**
 * Get priority color classes for Tailwind
 */
export function getPriorityColors(priority) {
  const colors = {
    urgent: {
      bg: 'bg-red-100',
      text: 'text-red-700',
      border: 'border-red-300'
    },
    high: {
      bg: 'bg-orange-100',
      text: 'text-orange-700',
      border: 'border-orange-300'
    },
    medium: {
      bg: 'bg-yellow-100',
      text: 'text-yellow-700',
      border: 'border-yellow-300'
    },
    low: {
      bg: 'bg-green-100',
      text: 'text-green-700',
      border: 'border-green-300'
    }
  };
  return colors[priority] || colors.medium;
}
