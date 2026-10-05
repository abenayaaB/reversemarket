const STOP_WORDS = new Set([
  'the',
  'and',
  'for',
  'with',
  'from',
  'that',
  'this',
  'have',
  'has',
  'need',
  'needs',
  'want',
  'wanted',
  'looking',
  'required',
  'provide',
  'providing',
  'service',
  'services',
  'please',
  'will',
  'can',
  'our',
  'your',
  'you',
  'are',
  'was',
  'were',
  'into',
  'about',
  'near',
  'within',
  'before',
  'after',
  'days',
  'day',
  'professional',
  'informed',
  'like',
  'proposal',
  'contact',
  'directly',
  'further',
  'there',
  'date',
])

function tokenize(text = '') {
  return [
    ...new Set(
      String(text)
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .split(/\s+/)
        .map((word) => word.trim())
        .filter(
          (word) =>
            word.length >= 3 &&
            !STOP_WORDS.has(word)
        )
    ),
  ]
}

/*
 * Handles common variations such as:
 *
 * photographer <-> photography
 * photographer <-> photograph
 * deliver <-> delivery
 * designer <-> design
 */
function normalizeWord(word) {
  let value = word.toLowerCase()

  if (value.length > 7 && value.endsWith('ies')) {
    value = value.slice(0, -3) + 'y'
  }

  if (value.length > 7 && value.endsWith('ing')) {
    value = value.slice(0, -3)
  }

  if (value.length > 6 && value.endsWith('ers')) {
    value = value.slice(0, -3)
  }

  if (value.length > 6 && value.endsWith('er')) {
    value = value.slice(0, -2)
  }

  if (value.length > 6 && value.endsWith('or')) {
    value = value.slice(0, -2)
  }

  if (value.length > 6 && value.endsWith('ion')) {
    value = value.slice(0, -3)
  }

  if (value.length > 5 && value.endsWith('s')) {
    value = value.slice(0, -1)
  }

  return value
}

function wordsMatch(a, b) {
  if (a === b) return true

  const normalizedA = normalizeWord(a)
  const normalizedB = normalizeWord(b)

  if (normalizedA === normalizedB) {
    return true
  }

  // Handles related words sharing a meaningful prefix.
  if (
    normalizedA.length >= 5 &&
    normalizedB.length >= 5
  ) {
    const prefixLength = 5

    return (
      normalizedA.slice(0, prefixLength) ===
      normalizedB.slice(0, prefixLength)
    )
  }

  return false
}

function calculateSourceRelevance(
  requirementKeywords,
  sourceText,
  maxPoints
) {
  if (!sourceText || requirementKeywords.length === 0) {
    return 0
  }

  const sourceWords = tokenize(sourceText)

  if (sourceWords.length === 0) {
    return 0
  }

  const matchedKeywords =
    requirementKeywords.filter((keyword) =>
      sourceWords.some((sourceWord) =>
        wordsMatch(keyword, sourceWord)
      )
    )

  /*
   * Use at most 5 important keywords for the denominator.
   * This prevents long descriptions from making relevance
   * unnecessarily tiny.
   */
  const effectiveKeywordCount = Math.min(
    requirementKeywords.length,
    5
  )

  const matchRatio =
    matchedKeywords.length /
    effectiveKeywordCount

  return Math.min(
    maxPoints,
    matchRatio * maxPoints
  )
}

export function calculateMatchBreakdown(
  offer,
  requirement
) {
  const budget = Number(
    requirement?.budget_max || 0
  )

  const price = Number(
    offer?.price || 0
  )

  // ==========================================
  // BUDGET — 50 POINTS
  // ==========================================

  let budgetScore = 0

  if (budget > 0 && price > 0) {
    if (price <= budget) {
      const savingsRatio =
        (budget - price) / budget

      budgetScore = Math.min(
        50,
        40 + savingsRatio * 10
      )
    } else {
      const overRatio =
        (price - budget) / budget

      budgetScore = Math.max(
        0,
        40 - overRatio * 40
      )
    }
  }

  // ==========================================
  // DELIVERY — 30 POINTS
  // ==========================================

  let deliveryScore = 0

  if (
    offer?.delivery_date &&
    requirement?.deadline
  ) {
    const delivery = new Date(
      offer.delivery_date
    )

    const deadline = new Date(
      requirement.deadline
    )

    const difference =
      (deadline - delivery) /
      (1000 * 60 * 60 * 24)

    if (difference >= 0) {
      deliveryScore = Math.min(
        30,
        25 + Math.min(difference, 5)
      )
    } else {
      const lateBy = Math.abs(difference)

      deliveryScore = Math.max(
        0,
        25 - lateBy * 5
      )
    }
  }

  // ==========================================
  // RELEVANCE — 20 POINTS
  //
  // Company Info = 5
  // Bio          = 7
  // Offer        = 8
  // ==========================================

  const titleKeywords = tokenize(
    requirement?.title || ''
  )

  const categoryKeywords = tokenize(
    requirement?.category || ''
  )

  const descriptionKeywords = tokenize(
    requirement?.description || ''
  )

  /*
   * Put title + category first because they are
   * more important than generic description words.
   */
  const requirementKeywords = [
    ...new Set([
      ...titleKeywords,
      ...categoryKeywords,
      ...descriptionKeywords,
    ]),
  ]

  const companyInfo = [
    offer?.provider?.company_name,
    offer?.provider?.full_name,
  ]
    .filter(Boolean)
    .join(' ')

  const bio =
    offer?.provider?.bio || ''

  const offerMessage =
    offer?.message || ''

  const companyScore =
    calculateSourceRelevance(
      requirementKeywords,
      companyInfo,
      5
    )

  const bioScore =
    calculateSourceRelevance(
      requirementKeywords,
      bio,
      7
    )

  const offerScore =
    calculateSourceRelevance(
      requirementKeywords,
      offerMessage,
      8
    )

  const relevanceScore =
    companyScore +
    bioScore +
    offerScore

  const total = Math.round(
    Math.min(
      100,
      budgetScore +
        deliveryScore +
        relevanceScore
    )
  )

  return {
    total,

    budgetScore:
      Math.round(budgetScore),

    deliveryScore:
      Math.round(deliveryScore),

    relevanceScore:
      Math.round(relevanceScore),

    companyScore:
      Math.round(companyScore),

    bioScore:
      Math.round(bioScore),

    offerScore:
      Math.round(offerScore),
  }
}

export function calculateMatchScore(
  offer,
  requirement
) {
  return calculateMatchBreakdown(
    offer,
    requirement
  ).total
}

export function getMatchLabel(score) {
  if (score >= 90) {
    return 'Excellent Match'
  }

  if (score >= 80) {
    return 'Strong Match'
  }

  if (score >= 70) {
    return 'Good Match'
  }

  if (score >= 60) {
    return 'Fair Match'
  }

  return 'Low Match'
}