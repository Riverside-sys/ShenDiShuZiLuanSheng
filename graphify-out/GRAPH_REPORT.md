# Graph Report - src/Views  (2026-04-13)

## Corpus Check
- 68 files · ~211,300 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 144 nodes · 137 edges · 43 communities detected
- Extraction: 93% EXTRACTED · 6% INFERRED · 1% AMBIGUOUS · INFERRED: 8 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Aquifer Scene UI|Aquifer Scene UI]]
- [[_COMMUNITY_Aquifer Concepts|Aquifer Concepts]]
- [[_COMMUNITY_Salt Cave Detail|Salt Cave Detail]]
- [[_COMMUNITY_Salt Cave Patrol|Salt Cave Patrol]]
- [[_COMMUNITY_Gsplat Roadway|Gsplat Roadway]]
- [[_COMMUNITY_Mine Cesium Map|Mine Cesium Map]]
- [[_COMMUNITY_Salt Dashboard Semantics|Salt Dashboard Semantics]]
- [[_COMMUNITY_Aquifer 3D Models|Aquifer 3D Models]]
- [[_COMMUNITY_Surface Roaming|Surface Roaming]]
- [[_COMMUNITY_WidgetPanel03 Charts|WidgetPanel03 Charts]]
- [[_COMMUNITY_WidgetPanel02 Charts|WidgetPanel02 Charts]]
- [[_COMMUNITY_Mine Toolbar|Mine Toolbar]]
- [[_COMMUNITY_Salt Widget05|Salt Widget05]]
- [[_COMMUNITY_Salt Widget04|Salt Widget04]]
- [[_COMMUNITY_Mine Widget01|Mine Widget01]]
- [[_COMMUNITY_Salt Footer|Salt Footer]]
- [[_COMMUNITY_Salt Layout|Salt Layout]]
- [[_COMMUNITY_Salt Widget06|Salt Widget06]]
- [[_COMMUNITY_Salt Widget01|Salt Widget01]]
- [[_COMMUNITY_Salt Data Assets|Salt Data Assets]]
- [[_COMMUNITY_Aquifer Toolbar|Aquifer Toolbar]]
- [[_COMMUNITY_Metadata Popup|Metadata Popup]]
- [[_COMMUNITY_Image Popup|Image Popup]]
- [[_COMMUNITY_Aquifer Layout|Aquifer Layout]]
- [[_COMMUNITY_Video Popup|Video Popup]]
- [[_COMMUNITY_Aquifer Widget06|Aquifer Widget06]]
- [[_COMMUNITY_Aquifer Widget05|Aquifer Widget05]]
- [[_COMMUNITY_Aquifer Widget04|Aquifer Widget04]]
- [[_COMMUNITY_Aquifer Widget01|Aquifer Widget01]]
- [[_COMMUNITY_Aquifer Widget03|Aquifer Widget03]]
- [[_COMMUNITY_Aquifer Widget02|Aquifer Widget02]]
- [[_COMMUNITY_Aquifer Data Index|Aquifer Data Index]]
- [[_COMMUNITY_Stratification Data|Stratification Data]]
- [[_COMMUNITY_Surface Data Assets|Surface Data Assets]]
- [[_COMMUNITY_Mine Main Scene|Mine Main Scene]]
- [[_COMMUNITY_Mine Tags|Mine Tags]]
- [[_COMMUNITY_Mine Footer|Mine Footer]]
- [[_COMMUNITY_Mine Layout|Mine Layout]]
- [[_COMMUNITY_Mine Widget06|Mine Widget06]]
- [[_COMMUNITY_Mine Widget05|Mine Widget05]]
- [[_COMMUNITY_Mine Widget04|Mine Widget04]]
- [[_COMMUNITY_Mine Data Assets|Mine Data Assets]]
- [[_COMMUNITY_Not Found View|Not Found View]]

## God Nodes (most connected - your core abstractions)
1. `地质体含水层` - 13 edges
2. `含水层数据资源包` - 8 edges
3. `smoothFlyThrough()` - 5 edges
4. `handleResetView()` - 4 edges
5. `loadAllLayers()` - 4 edges
6. `initThreeScene()` - 4 edges
7. `全波形反演图` - 4 edges
8. `盐穴数字大屏区域产业地图界面` - 4 edges
9. `stopPatrol()` - 3 edges
10. `clearAllEntities()` - 3 edges

## Surprising Connections (you probably didn't know these)
- `产业分布总览地图` --conceptually_related_to--> `含水层作用说明`  [AMBIGUOUS]
  src/Views/saltCave/盐穴数字大屏.jpg → src/Views/hanshuiceng/地质体含水层介绍.md
- `三维盖帽状透镜体水层速度模型图` --conceptually_related_to--> `地质体含水层`  [INFERRED]
  src/Views/hanshuiceng/data/index.ts → src/Views/hanshuiceng/地质体含水层介绍.md
- `测井约束全波形反演图` --conceptually_related_to--> `地质体含水层`  [INFERRED]
  src/Views/hanshuiceng/data/index.ts → src/Views/hanshuiceng/地质体含水层介绍.md
- `全波形反演图` --conceptually_related_to--> `地质体含水层`  [INFERRED]
  src/Views/hanshuiceng/data/index.ts → src/Views/hanshuiceng/地质体含水层介绍.md

## Hyperedges (group relationships)
- **含水层分类体系** — di_zhiti_hanshuiceng_unconfined_aquifer, di_zhiti_hanshuiceng_confined_aquifer, di_zhiti_hanshuiceng_porous_aquifer, di_zhiti_hanshuiceng_fractured_aquifer, di_zhiti_hanshuiceng_karst_aquifer [EXTRACTED 1.00]
- **含水层分析与反演资源集合** — hanshuiceng_data_velocity_model_image, hanshuiceng_data_2d_analysis_image, hanshuiceng_data_3d_analysis_image, hanshuiceng_data_well_constrained_inversion_image, hanshuiceng_data_full_waveform_inversion_image, hanshuiceng_data_slice_preview_gif, hanshuiceng_data_inversion_demo_gif [INFERRED 0.87]
- **盐穴数字大屏信息架构** — yanxue_dash_industrial_map_ui, yanxue_dash_xinjiang_eight_industries, yanxue_dash_geospatial_overview_map, yanxue_dash_production_metrics_panels [INFERRED 0.85]

## Communities

### Community 0 - "Aquifer Scene UI"
Cohesion: 0.08
Nodes (15): animateCameraTo(), applyPerspective(), clearAllEntities(), clearPerspective(), disposeThreeScene(), exitModelMode(), generateLayerInfo(), handleLayerClick() (+7 more)

### Community 1 - "Aquifer Concepts"
Cohesion: 0.12
Nodes (21): 地质体含水层, 含水层形成条件, 隔水层/弱透水层, 承压含水层, 裂隙含水层, 岩溶含水层, 渗透性, 孔隙度 (+13 more)

### Community 2 - "Salt Cave Detail"
Cohesion: 0.22
Nodes (2): easeInOutCubic(), tick()

### Community 3 - "Salt Cave Patrol"
Cohesion: 0.36
Nodes (6): handleOverview(), handlePatrol(), handleViewCaveA(), handleViewCaveB(), smoothFlyThrough(), stopPatrol()

### Community 4 - "Gsplat Roadway"
Cohesion: 0.38
Nodes (3): checkCrossOriginIsolation(), loadModel(), setupUIObserver()

### Community 5 - "Mine Cesium Map"
Cohesion: 0.47
Nodes (3): bindEvents(), initCesiumScene(), onResetView()

### Community 6 - "Salt Dashboard Semantics"
Cohesion: 0.33
Nodes (6): 含水层作用说明, 产业分布总览地图, 盐穴数字大屏区域产业地图界面, 生产加工与能耗统计面板, 大屏蓝色科幻可视化设计意图, 新疆八大产业集群

### Community 7 - "Aquifer 3D Models"
Cohesion: 0.5
Nodes (5): animateThree(), initThreeScene(), loadAquiferModel(), loadThreeGLB(), loadVpModel()

### Community 8 - "Surface Roaming"
Cohesion: 0.5
Nodes (0): 

### Community 9 - "WidgetPanel03 Charts"
Cohesion: 0.67
Nodes (1): generateOptions()

### Community 10 - "WidgetPanel02 Charts"
Cohesion: 0.67
Nodes (1): generateOptions()

### Community 11 - "Mine Toolbar"
Cohesion: 0.67
Nodes (0): 

### Community 12 - "Salt Widget05"
Cohesion: 1.0
Nodes (0): 

### Community 13 - "Salt Widget04"
Cohesion: 1.0
Nodes (0): 

### Community 14 - "Mine Widget01"
Cohesion: 1.0
Nodes (0): 

### Community 15 - "Salt Footer"
Cohesion: 1.0
Nodes (0): 

### Community 16 - "Salt Layout"
Cohesion: 1.0
Nodes (0): 

### Community 17 - "Salt Widget06"
Cohesion: 1.0
Nodes (0): 

### Community 18 - "Salt Widget01"
Cohesion: 1.0
Nodes (0): 

### Community 19 - "Salt Data Assets"
Cohesion: 1.0
Nodes (0): 

### Community 20 - "Aquifer Toolbar"
Cohesion: 1.0
Nodes (0): 

### Community 21 - "Metadata Popup"
Cohesion: 1.0
Nodes (0): 

### Community 22 - "Image Popup"
Cohesion: 1.0
Nodes (0): 

### Community 23 - "Aquifer Layout"
Cohesion: 1.0
Nodes (0): 

### Community 24 - "Video Popup"
Cohesion: 1.0
Nodes (0): 

### Community 25 - "Aquifer Widget06"
Cohesion: 1.0
Nodes (0): 

### Community 26 - "Aquifer Widget05"
Cohesion: 1.0
Nodes (0): 

### Community 27 - "Aquifer Widget04"
Cohesion: 1.0
Nodes (0): 

### Community 28 - "Aquifer Widget01"
Cohesion: 1.0
Nodes (0): 

### Community 29 - "Aquifer Widget03"
Cohesion: 1.0
Nodes (0): 

### Community 30 - "Aquifer Widget02"
Cohesion: 1.0
Nodes (0): 

### Community 31 - "Aquifer Data Index"
Cohesion: 1.0
Nodes (0): 

### Community 32 - "Stratification Data"
Cohesion: 1.0
Nodes (0): 

### Community 33 - "Surface Data Assets"
Cohesion: 1.0
Nodes (0): 

### Community 34 - "Mine Main Scene"
Cohesion: 1.0
Nodes (0): 

### Community 35 - "Mine Tags"
Cohesion: 1.0
Nodes (0): 

### Community 36 - "Mine Footer"
Cohesion: 1.0
Nodes (0): 

### Community 37 - "Mine Layout"
Cohesion: 1.0
Nodes (0): 

### Community 38 - "Mine Widget06"
Cohesion: 1.0
Nodes (0): 

### Community 39 - "Mine Widget05"
Cohesion: 1.0
Nodes (0): 

### Community 40 - "Mine Widget04"
Cohesion: 1.0
Nodes (0): 

### Community 41 - "Mine Data Assets"
Cohesion: 1.0
Nodes (0): 

### Community 42 - "Not Found View"
Cohesion: 1.0
Nodes (0): 

## Ambiguous Edges - Review These
- `含水层作用说明` → `产业分布总览地图`  [AMBIGUOUS]
  src/Views/saltCave/盐穴数字大屏.jpg · relation: conceptually_related_to

## Knowledge Gaps
- **14 isolated node(s):** `含水层储水空间`, `孔隙度`, `渗透性`, `承压含水层`, `潜水含水层` (+9 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Salt Widget05`** (2 nodes): `WidgetPanel05.vue`, `generateOptions()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Salt Widget04`** (2 nodes): `WidgetPanel04.vue`, `generateOptions()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Mine Widget01`** (2 nodes): `WidgetPanel01.vue`, `generateOptions()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Salt Footer`** (1 nodes): `index.vue`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Salt Layout`** (1 nodes): `LayoutPanel.vue`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Salt Widget06`** (1 nodes): `WidgetPanel06.vue`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Salt Widget01`** (1 nodes): `WidgetPanel01.vue`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Salt Data Assets`** (1 nodes): `index.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Aquifer Toolbar`** (1 nodes): `index.vue`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Metadata Popup`** (1 nodes): `MetadataPopup.vue`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Image Popup`** (1 nodes): `ImagePopup.vue`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Aquifer Layout`** (1 nodes): `LayoutPanel.vue`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Video Popup`** (1 nodes): `VideoPopup.vue`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Aquifer Widget06`** (1 nodes): `WidgetPanel06.vue`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Aquifer Widget05`** (1 nodes): `WidgetPanel05.vue`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Aquifer Widget04`** (1 nodes): `WidgetPanel04.vue`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Aquifer Widget01`** (1 nodes): `WidgetPanel01.vue`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Aquifer Widget03`** (1 nodes): `WidgetPanel03.vue`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Aquifer Widget02`** (1 nodes): `WidgetPanel02.vue`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Aquifer Data Index`** (1 nodes): `index.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Stratification Data`** (1 nodes): `index.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Surface Data Assets`** (1 nodes): `index.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Mine Main Scene`** (1 nodes): `index.vue`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Mine Tags`** (1 nodes): `PYD_tag.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Mine Footer`** (1 nodes): `index.vue`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Mine Layout`** (1 nodes): `LayoutPanel.vue`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Mine Widget06`** (1 nodes): `WidgetPanel06.vue`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Mine Widget05`** (1 nodes): `WidgetPanel05.vue`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Mine Widget04`** (1 nodes): `WidgetPanel04.vue`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Mine Data Assets`** (1 nodes): `index.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Not Found View`** (1 nodes): `index.vue`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `含水层作用说明` and `产业分布总览地图`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **Why does `handleResetView()` connect `Aquifer Scene UI` to `Salt Cave Patrol`?**
  _High betweenness centrality (0.033) - this node is a cross-community bridge._
- **Why does `地质体含水层` connect `Aquifer Concepts` to `Salt Dashboard Semantics`?**
  _High betweenness centrality (0.027) - this node is a cross-community bridge._
- **Why does `含水层作用说明` connect `Salt Dashboard Semantics` to `Aquifer Concepts`?**
  _High betweenness centrality (0.010) - this node is a cross-community bridge._
- **Are the 3 inferred relationships involving `地质体含水层` (e.g. with `三维盖帽状透镜体水层速度模型图` and `测井约束全波形反演图`) actually correct?**
  _`地质体含水层` has 3 INFERRED edges - model-reasoned connections that need verification._
- **What connects `含水层储水空间`, `孔隙度`, `渗透性` to the rest of the system?**
  _14 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Aquifer Scene UI` be split into smaller, more focused modules?**
  _Cohesion score 0.08 - nodes in this community are weakly interconnected._