/**
 * @file city-coordinates.ts
 * @description 도시명 → 좌표 변환 유틸리티
 *
 * 주요 한국 도시의 지명을 좌표(경도, 위도)로 변환하는 기능을 제공합니다.
 * 자동완성 검색을 위한 도시 목록도 포함합니다.
 */

/**
 * 도시 정보 인터페이스
 */
export interface CityInfo {
  name: string; // 도시명 (예: "서울특별시")
  fullName: string; // 전체 이름 (예: "서울특별시, 대한민국")
  lon: number; // 경도 (동경은 양수)
  lat: number; // 위도 (북위는 양수)
}

/**
 * 주요 한국 도시 좌표 데이터
 * 참고: 좌표는 대략적인 값이며, 정확한 계산을 위해서는 더 정밀한 좌표가 필요할 수 있습니다.
 */
export const KOREAN_CITIES: CityInfo[] = [
  // 특별시/광역시
  { name: "서울특별시", fullName: "서울특별시, 대한민국", lon: 126.9780, lat: 37.5665 },
  { name: "부산광역시", fullName: "부산광역시, 대한민국", lon: 129.0756, lat: 35.1796 },
  { name: "대구광역시", fullName: "대구광역시, 대한민국", lon: 128.5910, lat: 35.8714 },
  { name: "인천광역시", fullName: "인천광역시, 대한민국", lon: 126.7052, lat: 37.4563 },
  { name: "광주광역시", fullName: "광주광역시, 대한민국", lon: 126.8531, lat: 35.1595 },
  { name: "대전광역시", fullName: "대전광역시, 대한민국", lon: 127.3845, lat: 36.3504 },
  { name: "울산광역시", fullName: "울산광역시, 대한민국", lon: 129.3114, lat: 35.5384 },
  { name: "세종특별자치시", fullName: "세종특별자치시, 대한민국", lon: 127.2890, lat: 36.4800 },

  // 경기도 주요 도시
  { name: "수원시", fullName: "수원시, 대한민국", lon: 127.0286, lat: 37.2636 },
  { name: "성남시", fullName: "성남시, 대한민국", lon: 127.1266, lat: 37.4201 },
  { name: "고양시", fullName: "고양시, 대한민국", lon: 126.8350, lat: 37.6584 },
  { name: "용인시", fullName: "용인시, 대한민국", lon: 127.1776, lat: 37.2411 },
  { name: "부천시", fullName: "부천시, 대한민국", lon: 126.7830, lat: 37.5034 },
  { name: "안산시", fullName: "안산시, 대한민국", lon: 126.8313, lat: 37.3219 },
  { name: "안양시", fullName: "안양시, 대한민국", lon: 126.9568, lat: 37.3943 },
  { name: "평택시", fullName: "평택시, 대한민국", lon: 127.1147, lat: 36.9920 },
  { name: "시흥시", fullName: "시흥시, 대한민국", lon: 126.8025, lat: 37.3800 },
  { name: "김포시", fullName: "김포시, 대한민국", lon: 126.7176, lat: 37.6153 },
  { name: "광명시", fullName: "광명시, 대한민국", lon: 126.8645, lat: 37.4783 },
  { name: "이천시", fullName: "이천시, 대한민국", lon: 127.4427, lat: 37.2792 },
  { name: "하남시", fullName: "하남시, 대한민국", lon: 127.2146, lat: 37.5393 },
  { name: "오산시", fullName: "오산시, 대한민국", lon: 127.0708, lat: 37.1498 },
  { name: "구리시", fullName: "구리시, 대한민국", lon: 127.1286, lat: 37.5944 },
  { name: "안성시", fullName: "안성시, 대한민국", lon: 127.2796, lat: 37.0080 },
  { name: "포천시", fullName: "포천시, 대한민국", lon: 127.2007, lat: 37.8947 },
  { name: "의정부시", fullName: "의정부시, 대한민국", lon: 127.0476, lat: 37.7381 },
  { name: "양주시", fullName: "양주시, 대한민국", lon: 127.0457, lat: 37.8324 },
  { name: "동두천시", fullName: "동두천시, 대한민국", lon: 127.0613, lat: 37.9030 },
  { name: "과천시", fullName: "과천시, 대한민국", lon: 126.9886, lat: 37.4292 },
  { name: "의왕시", fullName: "의왕시, 대한민국", lon: 126.9682, lat: 37.3446 },
  { name: "군포시", fullName: "군포시, 대한민국", lon: 126.9352, lat: 37.3616 },
  { name: "광주시", fullName: "광주시, 대한민국", lon: 127.2556, lat: 37.4295 },
  { name: "여주시", fullName: "여주시, 대한민국", lon: 127.6367, lat: 37.2980 },
  { name: "양평군", fullName: "양평군, 대한민국", lon: 127.4886, lat: 37.4914 },
  { name: "가평군", fullName: "가평군, 대한민국", lon: 127.5107, lat: 37.8314 },
  { name: "연천군", fullName: "연천군, 대한민국", lon: 127.0748, lat: 38.0968 },

  // 강원도 주요 도시
  { name: "춘천시", fullName: "춘천시, 대한민국", lon: 127.7298, lat: 37.8813 },
  { name: "원주시", fullName: "원주시, 대한민국", lon: 127.9202, lat: 37.3422 },
  { name: "강릉시", fullName: "강릉시, 대한민국", lon: 128.8960, lat: 37.7519 },
  { name: "동해시", fullName: "동해시, 대한민국", lon: 129.1147, lat: 37.5247 },
  { name: "태백시", fullName: "태백시, 대한민국", lon: 128.9858, lat: 37.1641 },
  { name: "속초시", fullName: "속초시, 대한민국", lon: 128.5916, lat: 38.2070 },
  { name: "삼척시", fullName: "삼척시, 대한민국", lon: 129.1667, lat: 37.4499 },
  { name: "홍천군", fullName: "홍천군, 대한민국", lon: 127.8882, lat: 37.6970 },
  { name: "횡성군", fullName: "횡성군, 대한민국", lon: 127.9857, lat: 37.4917 },
  { name: "영월군", fullName: "영월군, 대한민국", lon: 128.4617, lat: 37.1837 },
  { name: "평창군", fullName: "평창군, 대한민국", lon: 128.3900, lat: 37.3703 },
  { name: "정선군", fullName: "정선군, 대한민국", lon: 128.6608, lat: 37.3807 },
  { name: "철원군", fullName: "철원군, 대한민국", lon: 127.3131, lat: 38.1464 },
  { name: "화천군", fullName: "화천군, 대한민국", lon: 127.7064, lat: 38.1044 },
  { name: "양구군", fullName: "양구군, 대한민국", lon: 127.9925, lat: 38.1098 },
  { name: "인제군", fullName: "인제군, 대한민국", lon: 128.1700, lat: 38.0697 },
  { name: "고성군", fullName: "고성군, 대한민국", lon: 128.4675, lat: 38.3784 },
  { name: "양양군", fullName: "양양군, 대한민국", lon: 128.6191, lat: 38.0754 },

  // 충청북도 주요 도시
  { name: "청주시", fullName: "청주시, 대한민국", lon: 127.4890, lat: 36.6424 },
  { name: "충주시", fullName: "충주시, 대한민국", lon: 127.9262, lat: 36.9910 },
  { name: "제천시", fullName: "제천시, 대한민국", lon: 128.1907, lat: 37.1326 },
  { name: "보은군", fullName: "보은군, 대한민국", lon: 127.7307, lat: 36.4894 },
  { name: "옥천군", fullName: "옥천군, 대한민국", lon: 127.5714, lat: 36.3067 },
  { name: "영동군", fullName: "영동군, 대한민국", lon: 127.7764, lat: 36.1750 },
  { name: "증평군", fullName: "증평군, 대한민국", lon: 127.5811, lat: 36.7847 },
  { name: "진천군", fullName: "진천군, 대한민국", lon: 127.4353, lat: 36.8550 },
  { name: "괴산군", fullName: "괴산군, 대한민국", lon: 127.7897, lat: 36.8081 },
  { name: "음성군", fullName: "음성군, 대한민국", lon: 127.6903, lat: 36.9403 },
  { name: "단양군", fullName: "단양군, 대한민국", lon: 128.3656, lat: 36.9847 },

  // 충청남도 주요 도시
  { name: "천안시", fullName: "천안시, 대한민국", lon: 127.1536, lat: 36.8151 },
  { name: "공주시", fullName: "공주시, 대한민국", lon: 127.1213, lat: 36.4465 },
  { name: "보령시", fullName: "보령시, 대한민국", lon: 126.5977, lat: 36.3336 },
  { name: "아산시", fullName: "아산시, 대한민국", lon: 127.0046, lat: 36.7848 },
  { name: "서산시", fullName: "서산시, 대한민국", lon: 126.4527, lat: 36.7848 },
  { name: "논산시", fullName: "논산시, 대한민국", lon: 127.1006, lat: 36.1876 },
  { name: "계룡시", fullName: "계룡시, 대한민국", lon: 127.2536, lat: 36.2747 },
  { name: "당진시", fullName: "당진시, 대한민국", lon: 126.6307, lat: 36.8936 },
  { name: "금산군", fullName: "금산군, 대한민국", lon: 127.4886, lat: 36.1086 },
  { name: "부여군", fullName: "부여군, 대한민국", lon: 126.9108, lat: 36.2756 },
  { name: "서천군", fullName: "서천군, 대한민국", lon: 126.6922, lat: 36.0803 },
  { name: "청양군", fullName: "청양군, 대한민국", lon: 126.8064, lat: 36.4500 },
  { name: "홍성군", fullName: "홍성군, 대한민국", lon: 126.6619, lat: 36.6011 },
  { name: "예산군", fullName: "예산군, 대한민국", lon: 126.8450, lat: 36.6803 },
  { name: "태안군", fullName: "태안군, 대한민국", lon: 126.2978, lat: 36.7456 },

  // 전라북도 주요 도시
  { name: "전주시", fullName: "전주시, 대한민국", lon: 127.1489, lat: 35.8242 },
  { name: "군산시", fullName: "군산시, 대한민국", lon: 126.7364, lat: 35.9677 },
  { name: "익산시", fullName: "익산시, 대한민국", lon: 126.9570, lat: 35.9483 },
  { name: "정읍시", fullName: "정읍시, 대한민국", lon: 126.8560, lat: 35.5697 },
  { name: "남원시", fullName: "남원시, 대한민국", lon: 127.3861, lat: 35.4164 },
  { name: "김제시", fullName: "김제시, 대한민국", lon: 126.8808, lat: 35.8036 },
  { name: "완주군", fullName: "완주군, 대한민국", lon: 127.1213, lat: 35.9047 },
  { name: "진안군", fullName: "진안군, 대한민국", lon: 127.4253, lat: 35.7917 },
  { name: "무주군", fullName: "무주군, 대한민국", lon: 127.3928, lat: 35.8967 },
  { name: "장수군", fullName: "장수군, 대한민국", lon: 127.5208, lat: 35.6472 },
  { name: "임실군", fullName: "임실군, 대한민국", lon: 127.2792, lat: 35.6147 },
  { name: "순창군", fullName: "순창군, 대한민국", lon: 127.1375, lat: 35.3744 },
  { name: "고창군", fullName: "고창군, 대한민국", lon: 126.7028, lat: 35.4358 },
  { name: "부안군", fullName: "부안군, 대한민국", lon: 126.7361, lat: 35.7314 },

  // 전라남도 주요 도시
  { name: "목포시", fullName: "목포시, 대한민국", lon: 126.3922, lat: 34.8118 },
  { name: "여수시", fullName: "여수시, 대한민국", lon: 127.6642, lat: 34.7604 },
  { name: "순천시", fullName: "순천시, 대한민국", lon: 127.4872, lat: 34.9506 },
  { name: "나주시", fullName: "나주시, 대한민국", lon: 126.7103, lat: 35.0342 },
  { name: "광양시", fullName: "광양시, 대한민국", lon: 127.6950, lat: 34.9406 },
  { name: "담양군", fullName: "담양군, 대한민국", lon: 126.9886, lat: 35.3214 },
  { name: "곡성군", fullName: "곡성군, 대한민국", lon: 127.2972, lat: 35.2819 },
  { name: "구례군", fullName: "구례군, 대한민국", lon: 127.4642, lat: 35.2025 },
  { name: "고흥군", fullName: "고흥군, 대한민국", lon: 127.2847, lat: 34.6106 },
  { name: "보성군", fullName: "보성군, 대한민국", lon: 127.0806, lat: 34.7714 },
  { name: "화순군", fullName: "화순군, 대한민국", lon: 126.9869, lat: 35.0644 },
  { name: "장흥군", fullName: "장흥군, 대한민국", lon: 126.9069, lat: 34.6817 },
  { name: "강진군", fullName: "강진군, 대한민국", lon: 126.7678, lat: 34.6422 },
  { name: "해남군", fullName: "해남군, 대한민국", lon: 126.5981, lat: 34.5736 },
  { name: "영암군", fullName: "영암군, 대한민국", lon: 126.7028, lat: 34.8000 },
  { name: "무안군", fullName: "무안군, 대한민국", lon: 126.4811, lat: 34.9903 },
  { name: "함평군", fullName: "함평군, 대한민국", lon: 126.5169, lat: 35.0644 },
  { name: "영광군", fullName: "영광군, 대한민국", lon: 126.5119, lat: 35.2772 },
  { name: "장성군", fullName: "장성군, 대한민국", lon: 126.7847, lat: 35.3019 },
  { name: "완도군", fullName: "완도군, 대한민국", lon: 126.7553, lat: 34.3111 },
  { name: "진도군", fullName: "진도군, 대한민국", lon: 126.2639, lat: 34.4869 },
  { name: "신안군", fullName: "신안군, 대한민국", lon: 126.3514, lat: 34.8286 },

  // 경상북도 주요 도시
  { name: "포항시", fullName: "포항시, 대한민국", lon: 129.3656, lat: 36.0322 },
  { name: "경주시", fullName: "경주시, 대한민국", lon: 129.2256, lat: 35.8563 },
  { name: "김천시", fullName: "김천시, 대한민국", lon: 128.1139, lat: 36.1397 },
  { name: "안동시", fullName: "안동시, 대한민국", lon: 128.7296, lat: 36.5684 },
  { name: "구미시", fullName: "구미시, 대한민국", lon: 128.3446, lat: 36.1195 },
  { name: "영주시", fullName: "영주시, 대한민국", lon: 128.6236, lat: 36.8064 },
  { name: "영천시", fullName: "영천시, 대한민국", lon: 128.9381, lat: 35.9733 },
  { name: "상주시", fullName: "상주시, 대한민국", lon: 128.1597, lat: 36.4106 },
  { name: "문경시", fullName: "문경시, 대한민국", lon: 128.1869, lat: 36.5864 },
  { name: "경산시", fullName: "경산시, 대한민국", lon: 128.7414, lat: 35.8256 },
  { name: "군위군", fullName: "군위군, 대한민국", lon: 128.5722, lat: 36.2428 },
  { name: "의성군", fullName: "의성군, 대한민국", lon: 128.6972, lat: 36.3528 },
  { name: "청송군", fullName: "청송군, 대한민국", lon: 129.0572, lat: 36.4331 },
  { name: "영양군", fullName: "영양군, 대한민국", lon: 129.1147, lat: 36.6647 },
  { name: "영덕군", fullName: "영덕군, 대한민국", lon: 129.3656, lat: 36.4153 },
  { name: "청도군", fullName: "청도군, 대한민국", lon: 128.7356, lat: 35.6472 },
  { name: "고령군", fullName: "고령군, 대한민국", lon: 128.2625, lat: 35.7256 },
  { name: "성주군", fullName: "성주군, 대한민국", lon: 128.2972, lat: 35.9203 },
  { name: "칠곡군", fullName: "칠곡군, 대한민국", lon: 128.4014, lat: 35.9956 },
  { name: "예천군", fullName: "예천군, 대한민국", lon: 128.4542, lat: 36.6528 },
  { name: "봉화군", fullName: "봉화군, 대한민국", lon: 128.7356, lat: 36.8931 },
  { name: "울진군", fullName: "울진군, 대한민국", lon: 129.4003, lat: 36.9931 },
  { name: "울릉군", fullName: "울릉군, 대한민국", lon: 130.9042, lat: 37.4844 },

  // 경상남도 주요 도시
  { name: "창원시", fullName: "창원시, 대한민국", lon: 128.6811, lat: 35.2279 },
  { name: "진주시", fullName: "진주시, 대한민국", lon: 128.1075, lat: 35.1803 },
  { name: "통영시", fullName: "통영시, 대한민국", lon: 128.4331, lat: 34.8544 },
  { name: "사천시", fullName: "사천시, 대한민국", lon: 128.0661, lat: 35.0036 },
  { name: "김해시", fullName: "김해시, 대한민국", lon: 128.8814, lat: 35.2284 },
  { name: "밀양시", fullName: "밀양시, 대한민국", lon: 128.7486, lat: 35.5036 },
  { name: "거제시", fullName: "거제시, 대한민국", lon: 128.6211, lat: 34.8806 },
  { name: "양산시", fullName: "양산시, 대한민국", lon: 129.0375, lat: 35.3381 },
  { name: "의령군", fullName: "의령군, 대한민국", lon: 128.2611, lat: 35.3203 },
  { name: "함안군", fullName: "함안군, 대한민국", lon: 128.4069, lat: 35.2722 },
  { name: "창녕군", fullName: "창녕군, 대한민국", lon: 128.4922, lat: 35.5444 },
  { name: "고성군", fullName: "고성군, 대한민국", lon: 128.3236, lat: 34.9731 },
  { name: "남해군", fullName: "남해군, 대한민국", lon: 127.8922, lat: 34.8375 },
  { name: "하동군", fullName: "하동군, 대한민국", lon: 127.7514, lat: 35.0672 },
  { name: "산청군", fullName: "산청군, 대한민국", lon: 127.8736, lat: 35.4144 },
  { name: "함양군", fullName: "함양군, 대한민국", lon: 127.7256, lat: 35.5203 },
  { name: "거창군", fullName: "거창군, 대한민국", lon: 127.9097, lat: 35.6864 },
  { name: "합천군", fullName: "합천군, 대한민국", lon: 128.1656, lat: 35.5664 },

  // 제주도
  { name: "제주시", fullName: "제주시, 대한민국", lon: 126.5312, lat: 33.4996 },
  { name: "서귀포시", fullName: "서귀포시, 대한민국", lon: 126.5603, lat: 33.2541 },
];

/**
 * 도시명으로 좌표 찾기
 * @param cityName 도시명 (예: "서울특별시", "서울" 등)
 * @returns 도시 정보 또는 null
 */
export function findCityByName(cityName: string): CityInfo | null {
  const normalized = cityName.trim();
  
  // 정확한 이름 매칭
  const exactMatch = KOREAN_CITIES.find(
    (city) => city.name === normalized || city.fullName === normalized
  );
  if (exactMatch) return exactMatch;

  // 부분 매칭 (예: "서울" → "서울특별시")
  const partialMatch = KOREAN_CITIES.find(
    (city) => city.name.includes(normalized) || normalized.includes(city.name)
  );
  if (partialMatch) return partialMatch;

  return null;
}

/**
 * 도시명 검색 (자동완성용)
 * @param query 검색어
 * @returns 매칭되는 도시 목록
 */
export function searchCities(query: string): CityInfo[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return [];

  return KOREAN_CITIES.filter(
    (city) =>
      city.name.toLowerCase().includes(normalized) ||
      city.fullName.toLowerCase().includes(normalized)
  );
}

/**
 * 기본 도시 (서울) 반환
 */
export function getDefaultCity(): CityInfo {
  return KOREAN_CITIES[0]; // 서울특별시
}

