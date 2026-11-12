---
"@tide-tds/foundation": patch
"@tide-tds/components": patch
---

입력창(Input·Textarea·Select·Combobox)을 클릭하면 outline이 잠깐 보였다 사라지던 문제를 고쳤다. `focus-field`가 평소에도 투명 outline을 두어 `transition-colors`가 outline 색을 글자색에서 투명으로 150ms 동안 전환했다. 이제 평소에는 outline이 없고, 투명 outline은 forced-colors(고대비) 모드에서만 둔다.
