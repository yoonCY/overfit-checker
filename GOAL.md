# 🎯 GOAL.md (Lite)

## GOAL

* Vercel 배포 환경 변수 LLM_BASE_URL을 GCP API Gateway URL로 변경하고 재배포하여, 외부 IP로의 다이렉트 통신을 제거하고 게이트웨이를 경유하도록 설정한다.

---

## DONE IF

* Vercel Production 환경 변수 `LLM_BASE_URL`이 `https://local-llm-gateway-d8ikelzd.an.gateway.dev/v1` 로 정상 변경됨.
* Vercel 재배포가 완료되고, 배포된 웹 UI에서 설계 분석 요청이 정상적으로 동작하여 결과가 반환됨.

---

## MUST NOT 🚫

* 로컬 코드 변경을 수행하지 않는다. (오직 환경 변수 변경 및 Vercel 재배포만 진행)
* `JWT_SECRET` 이나 `LLM_MODEL` 등 다른 무관한 환경 변수의 설정값을 변경하거나 유출하지 않는다.

---

## SCOPE

IN:
* Vercel Production 환경 변수 `LLM_BASE_URL` 업데이트
* Vercel Production 재배포 (`vercel --prod`)
* 웹 UI E2E 분석 검증

OUT:
* 로컬 코드 및 설정 파일(예: `vercel.json`) 수정
* GCP API Gateway 설정 변경

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
