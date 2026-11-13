---
"@tide-design/components": patch
---

여러 Component가 한 파일에 있던 곳(Menu, Dialog, Select, Combobox, Tabs, Accordion, Tooltip, Popover, Toast, Tag, Table, Breadcrumb, Pagination, Button)을 파일 하나에 Component 하나로 나눴다. 하위 Component는 `<C>/components/`, Context는 `<C>/hooks/`, class는 `<C>/constants/`로 갔다. `dist` 안 파일 배치가 바뀌었지만 공개 import 경로와 export 이름, Component 동작은 그대로다.
