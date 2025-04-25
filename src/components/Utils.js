// 사주 및 궁합 계산을 위한 유틸리티 함수들

// 천간과 지지 배열 (사주 계산을 위한 기본 자료)
export const stems = ["갑", "을", "병", "정", "무", "기", "경", "신", "임", "계"];
export const branches = ["자", "축", "인", "묘", "진", "사", "오", "미", "신", "유", "술", "해"];

// 오행 변환 맵핑
export const stemToElement = {
  "갑": "목", "을": "목", "병": "화", "정": "화", "무": "토", "기": "토",
  "경": "금", "신": "금", "임": "수", "계": "수"
};

export const branchToElement = {
  "자": "수", "축": "토", "인": "목", "묘": "목", "진": "토", "사": "화", "오": "화",
  "미": "토", "신": "금", "유": "금", "술": "토", "해": "수"
};

// 오행 상생상극 관계 (궁합 계산용)
export const elementCompatibility = {
  "목": { "화": 10, "금": -10, "수": 5 },
  "화": { "토": 10, "수": -10, "목": 5 },
  "토": { "금": 10, "목": -10, "화": 5 },
  "금": { "수": 10, "화": -10, "토": 5 },
  "수": { "목": 10, "토": -10, "금": 5 }
};

// 천간지지 계산 함수
export function getGanji(year) {
  return {
    gan: stems[(year - 4) % 10],
    ji: branches[(year - 4) % 12]
  };
}

// 시간과 분으로 시지 계산
export function getHourBranch(hour, minute) {
  const total = hour * 60 + minute;
  const index = Math.floor(total / 120) % 12;
  return branches[index];
}

// 년도와 시간으로 오행 원소 배열 구하기
export function getElements(year, hour, minute, noTime) {
  const { gan, ji } = getGanji(year);
  const elements = [stemToElement[gan], branchToElement[ji]];
  if (!noTime) {
    const hBranch = getHourBranch(hour, minute);
    elements.push(branchToElement[hBranch]);
  }
  return elements;
}

// 두 사람의 원소 배열로 궁합 점수 계산
export function getScore(a, b) {
  let score = 0;
  for (const x of a) {
    for (const y of b) {
      score += elementCompatibility[x]?.[y] || 0;
    }
  }
  return Math.round(50 + (score / (a.length * b.length)) * 10);
}

// 오행 기반 성향 분석
export function getPersonalityAnalysis(elements) {
  const elementStrengths = {
    "목": "자신감이 넘치고 활동적이지만, 고집이 강할 수 있습니다. 갈등 상황에서 자신을 주장하는 경향이 있을 수 있습니다.",
    "화": "열정적이고 성격이 적극적이며, 때로는 성급하게 행동할 수 있습니다. 상황에 따라 너무 직설적일 수 있습니다.",
    "토": "신뢰가 가고 차분하지만, 때로는 고집이 세고 융통성 부족이 나타날 수 있습니다. 안정감을 추구하지만 변화에 어려움을 겪을 수 있습니다.",
    "금": "분석적이고 냉철하지만, 감정 표현에 서툴 수 있습니다. 감정을 숨기기 보다는 좀 더 표현하는 것이 중요할 수 있습니다.",
    "수": "감성적이고 배려심이 많지만 때로는 너무 내성적이고 신중해져, 너무 많은 생각을 하는 경향이 있을 수 있습니다."
  };

  const analysis = elements.map(element => elementStrengths[element] || "알 수 없는 성향");
  return analysis.join(" ");
}

// 월별 최대 일 수 계산
export function getMaxDaysInMonth(month, year) {
  const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if (month === 2) {
    if ((year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0)) {
      return 29; // 윤년
    }
    return 28; // 평년
  }
  return daysInMonth[month - 1];
}

// 궁합 점수에 따른 메시지와 상세 메시지 생성
export function getCompatibilityMessages(score, nameA, nameB, personalityA, personalityB) {
  let message = "";
  let detailedMessage = "";

  if (score >= 80) {
    message = "두 분은 서로를 잘 이해하고 보완해주는 환상의 궁합이에요.";
    detailedMessage = `
      두 사람은 서로의 부족한 부분을 보완하며 긍정적인 영향을 주고받을 수 있습니다.
      예를 들어, <strong>목(木)</strong>과 <strong>수(水)</strong>의 조합은 상호 보완적이며, 목은 수의 도움을 받아 성장할 수 있습니다.
      또한 <strong>화(火)</strong>와 <strong>토(土)</strong>는 좋은 상생 관계를 이루며, 서로의 강점을 잘 활용할 수 있습니다.
      <br/><br/>
      <strong>${nameA}</strong>님은 ${personalityA}<br/>
      <strong>${nameB}</strong>님은 ${personalityB}<br/><br/>
      이 두 분은 서로 잘 어울리며 각자의 강점을 통해 관계를 이끌어갑니다.
    `;
  } else if (score >= 60) {
    message = "조화롭게 어울릴 수 있지만, 작은 배려가 필요해요.";
    detailedMessage = `
      두 사람은 기본적으로 잘 어울리지만, 서로의 성향 차이를 이해하고 배려하는 것이 중요합니다.
      예를 들어, <strong>화(火)</strong>와 <strong>금(金)</strong>은 상극 관계에 가까워, 때때로 갈등이 발생할 수 있습니다.
      <br/><br/>
      <strong>${nameA}</strong>님은 ${personalityA}<br/>
      <strong>${nameB}</strong>님은 ${personalityB}<br/><br/>
      서로의 차이를 이해하고 배려하는 것이 필요합니다.
    `;
  } else if (score >= 40) {
    message = "성향 차이가 있지만 노력하면 충분히 맞춰갈 수 있어요.";
    detailedMessage = `
      성향의 차이가 있지만, 상호 노력으로 성격 차이를 극복할 수 있습니다.
      예를 들어, <strong>토(土)</strong>와 <strong>금(金)</strong>은 상생 관계지만 때로는 충돌이 있을 수 있어, 신중하게 접근해야 할 필요가 있습니다.
      <br/><br/>
      <strong>${nameA}</strong>님은 ${personalityA}<br/>
      <strong>${nameB}</strong>님은 ${personalityB}<br/><br/>
      서로의 고집을 조정하며 관계를 이어가려면 배려가 필요합니다.
    `;
  } else {
    message = "가치관이나 기질이 많이 다를 수 있어요. 신중한 접근이 필요해요.";
    detailedMessage = `
      두 사람은 기질이나 가치관에서 큰 차이를 보일 수 있어 신중한 접근이 필요합니다.
      예를 들어, <strong>자(子)</strong>와 <strong>오(午)</strong>는 상충하는 관계로, 갈등이 자주 발생할 수 있습니다.
      <br/><br/>
      <strong>${nameA}</strong>님은 ${personalityA}<br/>
      <strong>${nameB}</strong>님은 ${personalityB}<br/><br/>
      이 두 사람의 성향은 성격의 차이로 인해 갈등이 빈번할 수 있으므로, 충분한 이해와 배려가 필요합니다.
    `;
  }

  return { message, detailedMessage };
} 