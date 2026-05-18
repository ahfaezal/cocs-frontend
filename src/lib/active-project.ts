"use client";

const ACTIVE_PROJECT_ID_KEY = "cocs_active_project_id";
const LAST_WORK_PAGE_KEY = "cocs_last_work_page";

const PROJECT_WORKFLOW_PATHS = new Set([
  "/cos",
  "/ccpc",
  "/ccp",
  "/csp",
  "/ccc",
  "/temm",
  "/weightage",
  "/review",
  "/export",
]);

function canUseStorage() {
  return typeof window !== "undefined" && Boolean(window.localStorage);
}

export function isProjectWorkflowPath(pathname: string) {
  return PROJECT_WORKFLOW_PATHS.has(pathname);
}

export function getActiveProjectId() {
  if (!canUseStorage()) return "";

  return window.localStorage.getItem(ACTIVE_PROJECT_ID_KEY) || "";
}

export function setActiveProjectId(projectId: string) {
  if (!canUseStorage() || !projectId) return;

  window.localStorage.setItem(ACTIVE_PROJECT_ID_KEY, projectId);
}

export function getLastWorkPage() {
  if (!canUseStorage()) return "";

  return window.localStorage.getItem(LAST_WORK_PAGE_KEY) || "";
}

export function setLastWorkPage(path: string) {
  if (!canUseStorage() || !path) return;

  window.localStorage.setItem(LAST_WORK_PAGE_KEY, path);
}

export function buildProjectHref(href: string, projectId: string) {
  if (!projectId || !isProjectWorkflowPath(href)) return href;

  const separator = href.includes("?") ? "&" : "?";
  return `${href}${separator}projectId=${encodeURIComponent(projectId)}`;
}
