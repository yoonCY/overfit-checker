# 🎯 GOAL.md (Lite)

## GOAL

* Vercel 배포 환경 변수 LLM_BASE_URL을 GCP API Gateway URL로 변경하고 재배포하여, 외부 IP로의 다이렉트 통신을 제거하고 게이트웨이를 경유하도록 설정한다.

---

## DONE IF

* Vercel Production 환경 변수 `LLM_BASE_URL`이 GCP Gateway 주소로 변경됨.
* GCP API Gateway 설정에 `disable_auth: true`가 적용되어 Bearer Authorization 토큰이 로컬 백엔드(`ycy0922.iptime.org:8080`)로 정상적으로 흘러감.
* Vercel 배포 본의 웹 UI 및 API 통신이 GCP Gateway를 성공적으로 관통하여 분석 결과 JSON을 정상 수신함.

---

## MUST NOT 🚫

* 로컬 어플리케이션 소스 코드(src/, frontend/)를 수정하지 않는다. (오직 openapi-seoul.yaml 및 인프라 설정만 변경)
* `JWT_SECRET` 이나 `LLM_MODEL` 등 다른 무관한 환경 변수의 설정값을 변경하거나 유출하지 않는다.

---

## SCOPE

IN:
* Vercel Production 환경 변수 `LLM_BASE_URL` 업데이트
* `openapi-seoul.yaml` 내 `disable_auth: true` 주입 및 GCP API Gateway Config 갱신
* 웹 UI E2E 분석 검증

OUT:
* 로컬 어플리케이션 기능 코드 수정
* GCP API Gateway 자체 라우팅 주소 변경

---

## ASSUMPTIONS

* GCP API Gateway `local-llm-gateway` 가 정상 동작하고 있으며, `http://ycy0922.iptime.org:8080` 포워딩 규칙이 유효함.
* Vercel CLI 권한이 M1 Max 호스트 환경에서 유효하여 환경 변수 수정 및 배포가 가능함.

---

## GOAL QUALITY SCORE

* 10 / 10 (COMPLETENESS: 2, MEASURABILITY: 2, SCOPE CONTROL: 2, CONSTRAINT CLARITY: 2, OVERBUILD DEFENSE: 2)

---

## VERSION

v1.0 | 2026-06-25
