const KEY = "agrieco_logs"

export const getLogs = () =>
  JSON.parse(localStorage.getItem(KEY)) || []

export const saveLogs = (logs) =>
  localStorage.setItem(KEY, JSON.stringify(logs))
