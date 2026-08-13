export function createMapState(tree) { return { expanded: new Set([tree.id]), activeDetailId: null, transform: { x: 0, y: 0, scale: 1 } }; }
function find(tree, id) { if (tree.id === id) return tree; for (const child of tree.children ?? []) { const found = find(child, id); if (found) return found; } return null; }
function descendants(node) { return (node.children ?? []).flatMap((child) => [child.id, ...descendants(child)]); }
export function toggleNode(state, tree, id) { const node = find(tree, id); if (!node?.children?.length) return state; const expanded = new Set(state.expanded); if (expanded.has(id)) { expanded.delete(id); descendants(node).forEach((child) => expanded.delete(child)); } else expanded.add(id); const active = state.activeDetailId && !expanded.has(id) && descendants(node).includes(state.activeDetailId) ? null : state.activeDetailId; return { ...state, expanded, activeDetailId: active }; }
export function openDetail(state, id) { return { ...state, activeDetailId: id }; }
export function closeDetail(state) { return { ...state, activeDetailId: null }; }
export function collapseAll(state, tree) { return { ...state, expanded: new Set([tree.id]), activeDetailId: null }; }
export function resetMap(state, tree) { return { ...createMapState(tree), transform: { x: 0, y: 0, scale: 1 } }; }
export function panBy(state, dx, dy) { return { ...state, transform: { ...state.transform, x: state.transform.x + dx, y: state.transform.y + dy } }; }
export function zoomAt(state, factor, point) { const scale = Math.max(0.5, Math.min(1.8, state.transform.scale * factor)); const ratio = scale / state.transform.scale; return { ...state, transform: { scale, x: point.x - (point.x - state.transform.x) * ratio, y: point.y - (point.y - state.transform.y) * ratio } }; }
