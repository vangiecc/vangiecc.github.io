import { createMapState, toggleNode, openDetail, closeDetail, collapseAll, resetMap, panBy, zoomAt } from "./mind-map-state.js";

const section = document.querySelector(".mind-map");
const viewport = section?.querySelector(".mind-map-viewport");
const world = section?.querySelector(".mind-map-world");
const data = JSON.parse(document.querySelector("#mind-map-data")?.textContent ?? "null");

if (section && viewport && world && data) {
  let state = createMapState(data);
  let drag = null;
  const visible = (node) => [node, ...(state.expanded.has(node.id) ? (node.children ?? []).flatMap(visible) : [])];

  function render() {
    world.replaceChildren();
    for (const [index, node] of visible(data).entries()) {
      const button = document.createElement("button");
      button.className = `mind-map-node${node.id === data.id ? " mind-map-node--root" : ""}`;
      button.type = "button";
      button.dataset.nodeId = node.id;
      button.style.setProperty("--node-index", index);
      button.textContent = node.title;
      if (node.children?.length) button.setAttribute("aria-expanded", state.expanded.has(node.id));
      button.addEventListener("click", () => {
        if (node.children?.length) state = toggleNode(state, data, node.id);
        if (node.hasDetail) state = openDetail(state, node.id);
        render();
      });
      world.append(button);
      if (node.id === state.activeDetailId) {
        const card = document.createElement("article");
        card.className = "mind-map-detail";
        card.setAttribute("role", "dialog");
        card.setAttribute("aria-modal", "false");
        card.innerHTML = `<button class="mind-map-detail-close" type="button" aria-label="Close details">×</button><h2>${node.title}</h2><div class="markdown-body">${node.detailHtml}</div>`;
        card.querySelector("button").addEventListener("click", () => { state = closeDetail(state); render(); });
        world.append(card);
      }
    }
    world.style.transform = `translate(${state.transform.x}px,${state.transform.y}px) scale(${state.transform.scale})`;
  }

  const center = () => ({ x: viewport.clientWidth / 2, y: viewport.clientHeight / 2 });
  section.querySelector('[aria-label="Zoom in"]').addEventListener("click", () => { state = zoomAt(state, 1.15, center()); render(); });
  section.querySelector('[aria-label="Zoom out"]').addEventListener("click", () => { state = zoomAt(state, 0.87, center()); render(); });
  section.querySelector('[aria-label="Reset mind map"]').addEventListener("click", () => { state = resetMap(state, data); render(); });
  section.querySelector('[aria-label="Collapse all branches"]').addEventListener("click", () => { state = collapseAll(state, data); render(); });
  viewport.addEventListener("pointerdown", (event) => { if (event.target.closest("button, article")) return; drag = { x: event.clientX, y: event.clientY }; viewport.setPointerCapture(event.pointerId); });
  viewport.addEventListener("pointermove", (event) => { if (!drag) return; state = panBy(state, event.clientX - drag.x, event.clientY - drag.y); drag = { x: event.clientX, y: event.clientY }; render(); });
  viewport.addEventListener("pointerup", () => { drag = null; });
  viewport.addEventListener("wheel", (event) => { if (!(event.ctrlKey || event.metaKey)) return; event.preventDefault(); state = zoomAt(state, event.deltaY < 0 ? 1.1 : 0.9, { x: event.offsetX, y: event.offsetY }); render(); }, { passive: false });
  document.addEventListener("keydown", (event) => { if (event.key === "Escape" && state.activeDetailId) { state = closeDetail(state); render(); } });
  render();
}
