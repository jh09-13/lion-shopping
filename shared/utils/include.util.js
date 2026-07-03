export async function includeFragments(root = document) {
  const targets = Array.from(root.querySelectorAll("[data-include]"));
  await Promise.all(
    targets.map(async (el) => {
      const url = el.getAttribute("data-include");
      const response = await fetch(url);
      el.innerHTML = await response.text();
      el.dispatchEvent(new CustomEvent("fragment:loaded", { bubbles: true }));
    })
  );
}
