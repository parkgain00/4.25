/**
 * 윤년 여부를 확인하는 함수
 * @param {number} year - 확인할 연도
 * @returns {boolean} - 윤년 여부
 */
export function isLeapYear(year) {
  return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
}

/**
 * 해당 월의 최대 일수를 반환하는 함수
 * @param {number} month - 확인할 월 (1-12)
 * @param {number} year - 확인할 연도
 * @returns {number} - 해당 월의 최대 일수
 */
export function getMaxDaysInMonth(month, year) {
  // 기본 각 월의 최대 일수
  const daysInMonth = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  
  // 2월이고 윤년인 경우 29일
  if (month === 2 && isLeapYear(year)) {
    return 29;
  }
  
  return daysInMonth[month];
}

/**
 * 계절을 반환하는 함수
 * @param {number} month - 확인할 월 (1-12)
 * @returns {string} - 계절 (봄, 여름, 가을, 겨울)
 */
export function getSeason(month) {
  if (month >= 3 && month <= 5) return "봄";
  if (month >= 6 && month <= 8) return "여름";
  if (month >= 9 && month <= 11) return "가을";
  return "겨울";
}

/**
 * 오행을 계산하는 함수
 * @param {number} year - 태어난 해
 * @param {number} month - 태어난 월
 * @param {number} day - 태어난 일
 * @param {number} hour - 태어난 시간
 * @returns {string} - 오행 (목, 화, 토, 금, 수)
 */
export function calculateElement(year, month, day, hour) {
  // 간단한 오행 계산 (실제 사주 계산법과는 차이가 있음)
  const elements = ["목", "화", "토", "금", "수"];
  
  // 연도 기반 계산
  const yearBase = year % 10;
  
  // 월 기반 보정
  const monthMod = (month * 2) % 5;
  
  // 일 기반 보정
  const dayMod = day % 5;
  
  // 시간 기반 보정
  const hourMod = Math.floor(hour / 5) % 5;
  
  // 최종 인덱스 계산
  const index = (yearBase + monthMod + dayMod + hourMod) % 5;
  
  return elements[index];
}

/**
 * 궁합 점수를 계산하는 함수
 * @param {Object} personA - A의 생년월일시
 * @param {Object} personB - B의 생년월일시
 * @returns {number} - 궁합 점수 (0-100)
 */
export function calculateCompatibilityScore(personA, personB) {
  // A와 B의 오행 계산
  const elementA = calculateElement(personA.year, personA.month, personA.day, personA.hour);
  const elementB = calculateElement(personB.year, personB.month, personB.day, personB.hour);
  
  // 기본 점수 (1~100)
  let score = 50;
  
  // 오행 상성에 따른 점수 보정
  const compatibility = {
    "목-목": 70, "목-화": 85, "목-토": 55, "목-금": 40, "목-수": 65,
    "화-목": 85, "화-화": 70, "화-토": 65, "화-금": 50, "화-수": 40,
    "토-목": 55, "토-화": 65, "토-토": 70, "토-금": 80, "토-수": 60,
    "금-목": 40, "금-화": 50, "금-토": 80, "금-금": 70, "금-수": 85,
    "수-목": 65, "수-화": 40, "수-토": 60, "수-금": 85, "수-수": 70
  };
  
  // 오행 상성 점수 적용
  const key = `${elementA}-${elementB}`;
  if (compatibility[key]) {
    score = compatibility[key];
  }
  
  // 생년월일의 차이에 따른 추가 보정
  const yearDiff = Math.abs(personA.year - personB.year);
  if (yearDiff < 5) score += 5;
  else if (yearDiff > 15) score -= 5;
  
  // 계절 상성에 따른 보정
  const seasonA = getSeason(personA.month);
  const seasonB = getSeason(personB.month);
  
  if (seasonA === seasonB) score += 5;
  else if ((seasonA === "봄" && seasonB === "가을") || 
           (seasonA === "가을" && seasonB === "봄") ||
           (seasonA === "여름" && seasonB === "겨울") ||
           (seasonA === "겨울" && seasonB === "여름")) {
    score -= 5;
  }
  
  // 오행 불균형 보정 (+/- 최대 10)
  // 날짜 차이 계산 (1월 1일부터의 일수로 환산)
  const dayOfYearA = (personA.month - 1) * 30 + personA.day;
  const dayOfYearB = (personB.month - 1) * 30 + personB.day;
  const dayDiff = Math.abs(dayOfYearA - dayOfYearB);
  
  // 날짜 차이에 따른 점수 보정
  if (dayDiff < 30) score += 5;
  else if (dayDiff > 180) score -= 3;
  
  // 시간대 상성 고려
  const hourDiff = Math.abs(personA.hour - personB.hour);
  if (hourDiff < 6) score += 5;
  else if (hourDiff > 12) score -= 2;
  
  // 점수 범위 제한 (0~100)
  score = Math.max(0, Math.min(100, score));
  
  return Math.round(score);
}

/**
 * 성격 분석 결과를 반환하는 함수
 * @param {string} element - 오행 (목, 화, 토, 금, 수)
 * @returns {string} - 성격 분석 결과
 */
export function getPersonalityAnalysis(element) {
  const personalities = {
    "목": "창의적이고 적응력이 뛰어납니다. 새로운 아이디어를 내고 성장하는 것을 좋아하며, 공동체를 중요시합니다. 다만 때로는 우유부단하고 변덕스러울 수 있습니다.",
    "화": "열정적이고 활력이 넘칩니다. 카리스마가 있고 리더십이 강하며, 사람들에게 영감을 주는 능력이 있습니다. 다만 때로는 성급하고 충동적일 수 있습니다.",
    "토": "안정적이고 현실적입니다. 신뢰할 수 있고 책임감이 강하며, 인내심이 있습니다. 전통과 가족을 중요시하지만, 때로는 고집이 세고 변화를 두려워할 수 있습니다.",
    "금": "세련되고 정확합니다. 공정함과 정의를 중요시하며, 예술적 감각이 뛰어납니다. 목표 지향적이지만, 때로는 완벽주의와 비판적인 성향을 보일 수 있습니다.",
    "수": "지혜롭고 적응력이 뛰어납니다. 직관력이 강하고 깊은 통찰력을 가지고 있으며, 의사소통 능력이 뛰어납니다. 다만 때로는 우울하거나 과민반응을 보일 수 있습니다."
  };
  
  return personalities[element] || "분석 불가";
}

/**
 * 궁합 점수에 따른 해석 메시지를 반환하는 함수
 * @param {number} score - 궁합 점수 (0-100)
 * @returns {string} - 궁합 해석 메시지
 */
export function getCompatibilityMessage(score) {
  if (score >= 90) {
    return "최상의 궁합입니다! 서로에 대한 이해도가 매우 높고, 깊은 유대감을 형성할 수 있는 관계입니다. 서로의 강점을 북돋우며 함께 성장할 수 있습니다.";
  } else if (score >= 80) {
    return "매우 좋은 궁합입니다. 서로 잘 맞는 에너지를 가지고 있어 조화로운 관계를 유지할 수 있습니다. 서로를 이해하고 지원하는 힘이 강합니다.";
  } else if (score >= 70) {
    return "좋은 궁합입니다. 기본적으로 서로 잘 맞으며, 작은 차이점들은 오히려 관계를 더 흥미롭게 만들어줍니다. 서로에게서 배울 점이 많습니다.";
  } else if (score >= 60) {
    return "무난한 궁합입니다. 서로 다른 특성이 있지만, 노력을 통해 좋은 관계를 유지할 수 있습니다. 서로의 차이점을 존중하는 것이 중요합니다.";
  } else if (score >= 50) {
    return "보통의 궁합입니다. 서로 다른 성향이 때로는 조화를 이루기도, 때로는 갈등을 일으키기도 합니다. 소통과 이해를 통해 관계를 발전시킬 수 있습니다.";
  } else if (score >= 40) {
    return "약간 주의가 필요한 궁합입니다. 서로 다른 에너지와 성향이 때로는 어려움을 줄 수 있습니다. 상대방의 관점을 이해하려는 노력이 필요합니다.";
  } else if (score >= 30) {
    return "도전적인 궁합입니다. 서로 많이 다른 성향을 가지고 있어 관계 유지에 어려움이 있을 수 있습니다. 많은 대화와 타협이 필요합니다.";
  } else {
    return "상당히 어려운 궁합입니다. 매우 다른 에너지와 성향을 가지고 있어 서로를 이해하기 위해 많은 노력이 필요합니다. 그러나 이러한 차이점이 오히려 서로에게 중요한 교훈을 줄 수 있습니다.";
  }
}

/**
 * 상세한 궁합 분석 메시지를 반환하는 함수
 * @param {number} score - 궁합 점수 (0-100)
 * @param {string} elementA - A의 오행
 * @param {string} elementB - B의 오행
 * @returns {string} - 상세 궁합 분석 메시지
 */
export function getDetailedMessage(score, elementA, elementB) {
  // 오행 관계 분석
  let elementRelation = "";
  const elementRelations = {
    "목-목": "두 분 모두 <strong>목(木)</strong> 기운을 가진 분들로, 서로의 성장을 도울 수 있는 관계입니다. 두 분 다 창의적이고 활기찬 에너지를 가지고 있어서 함께 새로운 아이디어를 발전시키는 데 탁월합니다.",
    "목-화": "<strong>목(木)</strong>과 <strong>화(火)</strong>는 상생(相生) 관계로, 매우 좋은 조합입니다. 목이 불을 북돋워주는 것처럼, 서로에게 긍정적인 에너지를 제공할 수 있습니다.",
    "목-토": "<strong>목(木)</strong>과 <strong>토(土)</strong>는 상극(相剋) 관계입니다. 목이 토의 영양분을 흡수하는 관계로, 때로는 에너지의 불균형이 생길 수 있습니다. 상호 존중이 특히 중요합니다.",
    "목-금": "<strong>목(木)</strong>과 <strong>금(金)</strong>은 상극(相剋) 관계로, 금이 목을 자르는 관계입니다. 서로 다른 가치관과 접근 방식을 가질 수 있으므로 타협이 필요합니다.",
    "목-수": "<strong>목(木)</strong>과 <strong>수(水)</strong>는 상생(相生) 관계로, 수가 목을 키우는 관계입니다. 서로에게 영감과 지원을 제공할 수 있는 좋은 조합입니다.",
    
    "화-목": "<strong>화(火)</strong>와 <strong>목(木)</strong>은 상생(相生) 관계로, 목이 불을 키우는 관계입니다. 서로에게 에너지와 영감을 주는 긍정적인 조합입니다.",
    "화-화": "두 분 모두 <strong>화(火)</strong> 기운을 가진 분들로, 열정과 에너지가 넘치는 관계입니다. 함께 있으면 매우 활기차지만, 때로는 서로의 불꽃이 너무 강해질 수 있습니다.",
    "화-토": "<strong>화(火)</strong>와 <strong>토(土)</strong>는 상생(相生) 관계로, 화가 토를 만드는 관계입니다. 서로에게 긍정적인 영향을 미치는 조화로운 조합입니다.",
    "화-금": "<strong>화(火)</strong>와 <strong>금(金)</strong>은 상극(相剋) 관계로, 화가 금을 녹이는 관계입니다. 갈등이 생길 수 있지만, 이를 통해 서로 성장할 수 있습니다.",
    "화-수": "<strong>화(火)</strong>와 <strong>수(水)</strong>는 상극(相剋) 관계로, 수가 화를 끄는 관계입니다. 서로 다른 접근 방식을 가질 수 있어 존중과 이해가 필요합니다.",
    
    "토-목": "<strong>토(土)</strong>와 <strong>목(木)</strong>은 상극(相剋) 관계로, 목이 토의 영양분을 흡수하는 관계입니다. 균형을 유지하려면 서로의 니즈를 존중해야 합니다.",
    "토-화": "<strong>토(土)</strong>와 <strong>화(火)</strong>는 상생(相生) 관계로, 화가 토를 만드는 관계입니다. 서로에게 안정과 열정을 주는 좋은 조합입니다.",
    "토-토": "두 분 모두 <strong>토(土)</strong> 기운을 가진 분들로, 안정적이고 신뢰할 수 있는 관계를 형성할 수 있습니다. 함께 견고한 기반을 만들어나갈 수 있습니다.",
    "토-금": "<strong>토(土)</strong>와 <strong>금(金)</strong>은 상생(相生) 관계로, 토가 금을 품고 있는 관계입니다. 서로에게 안정과 지원을 제공할 수 있는 좋은 조합입니다.",
    "토-수": "<strong>토(土)</strong>와 <strong>수(水)</strong>는 상극(相剋) 관계로, 토가 수를 막는 관계입니다. 서로 다른 접근 방식이 갈등을 일으킬 수 있어 소통이 중요합니다.",
    
    "금-목": "<strong>금(金)</strong>과 <strong>목(木)</strong>은 상극(相剋) 관계로, 금이 목을 자르는 관계입니다. 서로 다른 가치관을 가질 수 있어 타협이 필요합니다.",
    "금-화": "<strong>금(金)</strong>과 <strong>화(火)</strong>는 상극(相剋) 관계로, 화가 금을 녹이는 관계입니다. 갈등이 있을 수 있지만, 이를 통해 서로 배울 점이 많습니다.",
    "금-토": "<strong>금(金)</strong>과 <strong>토(土)</strong>는 상생(相生) 관계로, 토가 금을 품고 있는 관계입니다. 안정적이고 생산적인 관계를 형성할 수 있습니다.",
    "금-금": "두 분 모두 <strong>금(金)</strong> 기운을 가진 분들로, 정의롭고 원칙적인 관계를 형성할 수 있습니다. 공통된 가치관을 바탕으로 견고한 관계를 만들어갈 수 있습니다.",
    "금-수": "<strong>금(金)</strong>과 <strong>수(水)</strong>는 상생(相生) 관계로, 금이 수를 만드는 관계입니다. 서로에게 영감과 지혜를 주는 좋은 조합입니다.",
    
    "수-목": "<strong>수(水)</strong>와 <strong>목(木)</strong>은 상생(相生) 관계로, 수가 목을 키우는 관계입니다. 서로에게 지원과 성장을 제공하는 조화로운 조합입니다.",
    "수-화": "<strong>수(水)</strong>와 <strong>화(火)</strong>는 상극(相剋) 관계로, 수가 화를 끄는 관계입니다. 서로 다른 접근 방식을 가질 수 있어 타협이 필요합니다.",
    "수-토": "<strong>수(水)</strong>와 <strong>토(土)</strong>는 상극(相剋) 관계로, 토가 수를 막는 관계입니다. 서로 다른 관점을 가질 수 있어 소통이 중요합니다.",
    "수-금": "<strong>수(水)</strong>와 <strong>금(金)</strong>은 상생(相生) 관계로, 금이 수를 만드는 관계입니다. 서로에게 영감과 지혜를 주는 좋은 조합입니다.",
    "수-수": "두 분 모두 <strong>수(水)</strong> 기운을 가진 분들로, 지혜롭고 직관적인 관계를 형성할 수 있습니다. 깊은 이해와 공감을 바탕으로 정서적 유대감을 쌓을 수 있습니다."
  };
  
  const key = `${elementA}-${elementB}`;
  elementRelation = elementRelations[key] || "두 분의 오행 관계는 복합적입니다.";
  
  // 궁합 점수에 따른 추가 메시지
  let additionalMessage = "";
  if (score >= 80) {
    additionalMessage = "두 분은 서로에게 매우 긍정적인 영향을 주는 관계입니다. 서로의 장점을 극대화하고 단점을 보완해 줄 수 있어 함께 발전할 수 있는 잠재력이 큽니다.";
  } else if (score >= 60) {
    additionalMessage = "두 분은 서로 어느 정도 조화를 이룰 수 있는 관계입니다. 서로의 차이점을 이해하고 존중한다면 더욱 풍요로운 관계를 만들어갈 수 있습니다.";
  } else {
    additionalMessage = "두 분의 관계는 일부 도전적인 측면이 있을 수 있습니다. 그러나 이러한 차이점이 오히려 서로에게 중요한 배움의 기회가 될 수 있습니다. 열린 마음으로 소통하는 것이 중요합니다.";
  }
  
  return `${elementRelation}<br><br>${additionalMessage}`;
} 