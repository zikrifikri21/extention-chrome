function createBookmarkItem(bookmark) {
  const li = document.createElement("li");

  const a = document.createElement("a");
  a.href = bookmark.url;
  a.textContent = bookmark.title || bookmark.url;
  a.target = "_blank";
  a.style.display = "inline-flex";
  a.style.alignItems = "center";
  a.style.gap = "8px";
  a.style.textDecoration = "none";
  a.style.color = "#000";

  const favicon = document.createElement("img");
  favicon.src = `https://www.google.com/s2/favicons?sz=32&domain_url=${bookmark.url}`;
  favicon.width = 16;
  favicon.height = 16;
  favicon.style.borderRadius = "4px";

  a.prepend(favicon);
  li.appendChild(a);
  return li;
}

function renderFolder(folderNode, container) {
  if (!folderNode.children || folderNode.children.length === 0) return;

  if (folderNode.title === "Bookmarks bar") {
    folderNode.children.forEach((child) => {
      if (child.children) {
        renderFolder(child, container);
      }
    });
    return;
  }

  const folderWrapper = document.createElement("div");
  folderWrapper.draggable = true;
  folderWrapper.dataset.folderId = folderNode.id;
  folderWrapper.style.marginBottom = "8px";
  folderWrapper.style.border = "1px dashed transparent";

  const folderTitle = document.createElement("h4");
  folderTitle.textContent = folderNode.title || "(Tanpa Nama)";
  folderTitle.style.margin = "8px 0 4px";
  folderTitle.style.fontSize = "14px";
  folderTitle.style.fontWeight = "bold";
  folderTitle.style.cursor = "pointer";
  folderTitle.style.color = "#333";

  const ul = document.createElement("ul");
  ul.style.listStyle = "none";
  ul.style.padding = "0";
  ul.style.margin = "0";
  ul.style.transition = "max-height 0.3s ease, opacity 0.3s ease";
  ul.style.overflow = "hidden";
  ul.style.maxHeight = "0px";
  ul.style.opacity = "0";

  folderNode.children.forEach((child) => {
    if (child.url) {
      ul.appendChild(createBookmarkItem(child));
    }
  });

  let expanded = false;
  folderTitle.addEventListener("click", () => {
    expanded = !expanded;
    ul.style.maxHeight = expanded ? "500px" : "0px";
    ul.style.opacity = expanded ? "1" : "0";
    folderTitle.classList.toggle("expanded", expanded);
  });

  folderWrapper.appendChild(folderTitle);
  folderWrapper.appendChild(ul);
  container.appendChild(folderWrapper);

  folderWrapper.addEventListener("dragstart", (e) => {
    e.dataTransfer.setData("text/plain", folderNode.id);
    folderWrapper.style.opacity = "0.4";
  });

  folderWrapper.addEventListener("dragend", () => {
    folderWrapper.style.opacity = "1";
  });

  folderWrapper.addEventListener("dragover", (e) => {
    e.preventDefault();
    folderWrapper.style.border = "1px dashed #888";
  });

  folderWrapper.addEventListener("dragleave", () => {
    folderWrapper.style.border = "1px dashed transparent";
  });

  folderWrapper.addEventListener("drop", (e) => {
    e.preventDefault();
    folderWrapper.style.border = "1px dashed transparent";

    const draggedFolderId = e.dataTransfer.getData("text/plain");
    const targetFolderId = folderNode.id;

    if (draggedFolderId !== targetFolderId) {
      chrome.bookmarks.move(draggedFolderId, { parentId: "1", index: null }, () => {
        location.reload();
      });
    }
  });
}

function scanBookmarks(node, container) {
  if (node.children && node.children.length > 0) {
    node.children.forEach((child) => {
      if (child.children) {
        renderFolder(child, container);
      }
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("bookmark-list");
  chrome.bookmarks.getTree((bookmarkTree) => {
    scanBookmarks(bookmarkTree[0], container);
  });
});
