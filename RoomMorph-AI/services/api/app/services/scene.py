from __future__ import annotations

from app.models.schemas import DesignBrief, DesignConcept, FurniturePrimitive, LightingSpec, MaterialSpec, PrimitivePart, SceneDocument, SurfacePrimitive


class SceneBuilder:
    def build(self, project_id: str, brief: DesignBrief, concept: DesignConcept) -> SceneDocument:
        width = 5.8 if brief.room_type.lower() != "kitchen" else 5.2
        depth = 5.4 if brief.room_type.lower() != "home office" else 4.4
        height = 2.8
        wall = _mat("wall", "matte plaster with soft texture", concept.palette[0], 0.92)
        floor = _mat("floor", "satin wood plank floor", concept.palette[1], 0.62)
        accent = _mat("accent", "woven upholstery", concept.palette[2], 0.84)
        wood = _mat("wood", "oiled natural wood", concept.palette[3] if len(concept.palette) > 3 else "#b9aa91", 0.52)
        metal = _mat("metal", "dark metal", "#3b403d", 0.42, 0.38)
        stone = _mat("stone", "honed stone", "#ded8cc", 0.48)

        surfaces = [
            SurfacePrimitive(id="floor", type="floor", position=[0, -0.03, 0], size=[width, 0.06, depth], material=floor),
            SurfacePrimitive(id="ceiling", type="ceiling", position=[0, height + 0.03, 0], size=[width, 0.06, depth], material=wall),
            SurfacePrimitive(id="back-wall", type="wall", position=[0, height / 2, -depth / 2], size=[width, height, 0.08], material=wall),
            SurfacePrimitive(id="left-wall", type="wall", position=[-width / 2, height / 2, 0], size=[0.08, height, depth], material=wall),
            SurfacePrimitive(id="right-wall", type="wall", position=[width / 2, height / 2, 0], size=[0.08, height, depth], material=wall),
        ]

        furniture = self._furniture(brief.room_type.lower(), width, depth, accent, wood, metal, stone)
        return SceneDocument(
            id=project_id,
            roomType=brief.room_type,
            theme=concept.theme,
            dimensions={"width": width, "depth": depth, "height": height, "unit": "meters"},
            surfaces=surfaces,
            furniture=furniture,
            lighting=LightingSpec(ambient=0.58, key=1.18 if concept.theme != "industrial" else 1.0, temperature=4200),
            cameraPresets=[
                {"position": [5.2, 3.2, 5.5], "target": [0, 1.1, 0]},
                {"position": [0, 1.55, 4.4], "target": [0, 1.25, 0]},
            ],
        )

    def _furniture(
        self,
        room_type: str,
        width: float,
        depth: float,
        accent: MaterialSpec,
        wood: MaterialSpec,
        metal: MaterialSpec,
        stone: MaterialSpec,
    ) -> list[FurniturePrimitive]:
        if "bed" in room_type:
            return [
                _item("bed", "bed", "Layered platform bed", [0, 0, -depth / 2 + 1.1], [0, 0, 0], [2.25, 1.18, 2.38], accent, [
                    _part("base", [0, 0.22, 0.08], [2.25, 0.32, 2.34], wood),
                    _part("mattress", [0, 0.55, 0.16], [2.08, 0.36, 2.12], _mat_like("linen", accent, "#f6f1e7", 0.88)),
                    _part("headboard", [0, 0.84, -0.98], [2.38, 1.08, 0.18], accent),
                    _part("left-pillow", [-0.54, 0.82, -0.54], [0.68, 0.18, 0.42], _mat_like("pillow", accent, "#fffdf7", 0.9)),
                    _part("right-pillow", [0.54, 0.82, -0.54], [0.68, 0.18, 0.42], _mat_like("pillow", accent, "#fffdf7", 0.9)),
                    _part("throw", [0, 0.78, 0.45], [1.9, 0.06, 0.72], accent),
                ]),
                _nightstand("nightstand-l", [-1.55, 0, -depth / 2 + 1.05], wood, metal),
                _nightstand("nightstand-r", [1.55, 0, -depth / 2 + 1.05], wood, metal),
                _item("wardrobe", "storage", "Slatted wardrobe wall", [width / 2 - 0.35, 0, 0.25], [0, 0, 0], [0.62, 2.15, 1.55], wood, [
                    _part("case", [0, 1.05, 0], [0.58, 2.1, 1.5], wood),
                    _part("handle", [-0.31, 1.12, 0.26], [0.035, 0.86, 0.04], metal),
                    _part("shadow-gap", [-0.005, 1.05, 0], [0.02, 2.05, 1.48], _mat("shadow", "recess", "#2a2b28", 0.8)),
                ]),
            ]
        if "kitchen" in room_type:
            return [
                _item("cabinet-run", "cabinet", "Cabinet run with stone counter", [0, 0, -depth / 2 + 0.35], [0, 0, 0], [width - 0.6, 0.98, 0.6], wood, [
                    _part("base", [0, 0.43, 0], [width - 0.62, 0.86, 0.54], wood),
                    _part("counter", [0, 0.91, 0], [width - 0.55, 0.08, 0.62], stone),
                    _part("kick", [0, 0.08, 0.29], [width - 0.74, 0.12, 0.04], metal),
                ]),
                _item("island", "island", "Waterfall kitchen island", [0, 0, 0.2], [0, 0, 0], [2.14, 1.02, 1.04], accent, [
                    _part("body", [0, 0.47, 0], [1.94, 0.92, 0.88], accent),
                    _part("counter", [0, 0.96, 0], [2.14, 0.08, 1.04], stone),
                    _part("left-panel", [-1.03, 0.5, 0], [0.08, 0.9, 1.0], stone),
                    _part("right-panel", [1.03, 0.5, 0], [0.08, 0.9, 1.0], stone),
                ]),
                _stool("stool-a", [-0.55, 0, 1.1], metal, accent),
                _stool("stool-b", [0.55, 0, 1.1], metal, accent),
            ]
        if "office" in room_type:
            return [
                _item("desk", "desk", "Minimal writing desk", [0, 0, -depth / 2 + 0.85], [0, 0, 0], [1.72, 0.78, 0.76], wood, [
                    _part("top", [0, 0.74, 0], [1.72, 0.08, 0.76], wood),
                    _part("left-leg", [-0.72, 0.38, 0.26], [0.08, 0.72, 0.08], metal),
                    _part("right-leg", [0.72, 0.38, 0.26], [0.08, 0.72, 0.08], metal),
                    _part("modesty", [0, 0.55, -0.34], [1.45, 0.36, 0.04], wood),
                ]),
                _chair("task-chair", [0, 0, -depth / 2 + 1.55], [0, 3.14, 0], accent, metal),
                _shelf("shelf", [-width / 2 + 0.4, 0, 0.25], wood),
            ]
        return [
            _sofa("sofa", [-0.25, 0, -depth / 2 + 0.85], accent, wood),
            _item("table", "table", "Stone and wood coffee table", [-0.1, 0, -0.25], [0, 0, 0], [1.25, 0.44, 0.78], wood, [
                _part("top", [0, 0.38, 0], [1.25, 0.08, 0.78], stone),
                _part("base-left", [-0.42, 0.2, 0], [0.08, 0.36, 0.52], wood),
                _part("base-right", [0.42, 0.2, 0], [0.08, 0.36, 0.52], wood),
                _part("shadow", [0, 0.04, 0], [1.05, 0.025, 0.62], _mat("shadow", "soft shadow", "#22231f", 0.95)),
            ]),
            _item("rug", "rug", "Textured flat weave rug", [-0.1, 0, -0.1], [0, 0, 0], [3.3, 0.035, 2.05], accent, [
                _part("rug-plane", [0, 0.018, 0], [3.3, 0.035, 2.05], _mat_like("rug", accent, accent.color, 0.96)),
                _part("rug-border", [0, 0.04, 0], [3.12, 0.02, 1.86], _mat_like("rug-border", wood, wood.color, 0.9)),
            ]),
            _item("console", "console", "Floating media console", [0, 0, depth / 2 - 0.34], [0, 0, 0], [2.05, 0.82, 0.42], wood, [
                _part("body", [0, 0.43, 0], [1.95, 0.62, 0.34], wood),
                _part("top", [0, 0.77, 0], [2.05, 0.06, 0.4], stone),
                _part("shadow-reveal", [0, 0.16, -0.18], [1.75, 0.06, 0.04], metal),
            ]),
            _chair("chair", [width / 2 - 0.8, 0, 0.2], [0, -0.55, 0], accent, metal),
        ]


def _mat(id_: str, name: str, color: str, roughness: float, metalness: float = 0.0) -> MaterialSpec:
    return MaterialSpec(id=id_, name=name, color=color, roughness=roughness, metalness=metalness)


def _item(
    id_: str,
    kind: str,
    name: str,
    position: list[float],
    rotation: list[float],
    dimensions: list[float],
    material: MaterialSpec,
    parts: list[PrimitivePart],
) -> FurniturePrimitive:
    return FurniturePrimitive(
        id=id_,
        kind=kind,
        name=name,
        position=position,
        rotation=rotation,
        dimensions=dimensions,
        material=material,
        parts=parts,
    )


def _part(
    id_: str,
    position: list[float],
    dimensions: list[float],
    material: MaterialSpec,
    shape: str = "box",
    rotation: list[float] | None = None,
) -> PrimitivePart:
    return PrimitivePart(
        id=id_,
        shape=shape,
        position=position,
        rotation=rotation or [0.0, 0.0, 0.0],
        dimensions=dimensions,
        material=material,
    )


def _mat_like(id_: str, base: MaterialSpec, color: str, roughness: float | None = None) -> MaterialSpec:
    return MaterialSpec(id=id_, name=base.name, color=color, roughness=base.roughness if roughness is None else roughness, metalness=base.metalness)


def _sofa(id_: str, position: list[float], fabric: MaterialSpec, wood: MaterialSpec) -> FurniturePrimitive:
    return _item(id_, "sofa", "Low modular sofa with cushions", position, [0, 0, 0], [2.9, 1.0, 1.04], fabric, [
        _part("seat-left", [-0.72, 0.32, 0.05], [1.36, 0.34, 0.88], fabric),
        _part("seat-right", [0.72, 0.32, 0.05], [1.36, 0.34, 0.88], fabric),
        _part("back", [0, 0.78, -0.37], [2.9, 0.78, 0.2], fabric),
        _part("left-arm", [-1.52, 0.55, 0.03], [0.22, 0.64, 0.95], fabric),
        _part("right-arm", [1.52, 0.55, 0.03], [0.22, 0.64, 0.95], fabric),
        _part("pillow-a", [-0.82, 0.78, -0.2], [0.46, 0.32, 0.12], _mat_like("pillow-light", fabric, "#f5efe3", 0.9)),
        _part("pillow-b", [0.78, 0.78, -0.2], [0.46, 0.32, 0.12], _mat_like("pillow-dark", fabric, fabric.color, 0.9)),
        _part("leg-a", [-1.02, 0.09, 0.34], [0.08, 0.18, 0.08], wood),
        _part("leg-b", [1.02, 0.09, 0.34], [0.08, 0.18, 0.08], wood),
    ])


def _chair(id_: str, position: list[float], rotation: list[float], fabric: MaterialSpec, metal: MaterialSpec) -> FurniturePrimitive:
    return _item(id_, "chair", "Sculpted lounge chair", position, rotation, [0.82, 1.02, 0.78], fabric, [
        _part("seat", [0, 0.43, 0.04], [0.72, 0.18, 0.66], fabric),
        _part("back", [0, 0.84, -0.27], [0.72, 0.64, 0.14], fabric),
        _part("left-arm", [-0.43, 0.58, 0.02], [0.1, 0.4, 0.62], fabric),
        _part("right-arm", [0.43, 0.58, 0.02], [0.1, 0.4, 0.62], fabric),
        _part("base", [0, 0.18, 0], [0.48, 0.34, 0.48], metal),
    ])


def _nightstand(id_: str, position: list[float], wood: MaterialSpec, metal: MaterialSpec) -> FurniturePrimitive:
    return _item(id_, "nightstand", "Bedside table", position, [0, 0, 0], [0.52, 0.66, 0.46], wood, [
        _part("body", [0, 0.32, 0], [0.52, 0.64, 0.44], wood),
        _part("drawer-gap", [0, 0.43, 0.23], [0.42, 0.035, 0.025], metal),
        _part("base-shadow", [0, 0.05, 0], [0.44, 0.08, 0.36], metal),
    ])


def _stool(id_: str, position: list[float], metal: MaterialSpec, fabric: MaterialSpec) -> FurniturePrimitive:
    return _item(id_, "stool", "Counter stool", position, [0, 0, 0], [0.48, 0.76, 0.48], fabric, [
        _part("seat", [0, 0.68, 0], [0.46, 0.1, 0.46], fabric, "cylinder"),
        _part("post", [0, 0.36, 0], [0.08, 0.56, 0.08], metal, "cylinder"),
        _part("base", [0, 0.08, 0], [0.42, 0.05, 0.42], metal, "cylinder"),
    ])


def _shelf(id_: str, position: list[float], wood: MaterialSpec) -> FurniturePrimitive:
    return _item(id_, "shelf", "Open shelf with objects", position, [0, 0, 0], [0.75, 1.96, 0.46], wood, [
        _part("left", [-0.34, 0.98, 0], [0.06, 1.96, 0.44], wood),
        _part("right", [0.34, 0.98, 0], [0.06, 1.96, 0.44], wood),
        _part("shelf-1", [0, 0.42, 0], [0.72, 0.06, 0.44], wood),
        _part("shelf-2", [0, 0.98, 0], [0.72, 0.06, 0.44], wood),
        _part("shelf-3", [0, 1.54, 0], [0.72, 0.06, 0.44], wood),
        _part("vase", [-0.16, 1.18, 0.04], [0.12, 0.24, 0.12], _mat("ceramic", "matte ceramic", "#f4efe4", 0.82), "cylinder"),
        _part("books", [0.18, 0.56, 0.05], [0.26, 0.18, 0.18], _mat("books", "stacked books", "#58636b", 0.75)),
    ])
